/**
 * Entity Page Descriptor Service Implementation
 *
 * Orchestrates multiple backend services into a single descriptor
 * that tells the frontend exactly what to render.
 *
 * "React is a renderer" — the backend is authoritative for all
 * UI orchestration decisions.
 */

import type {
  ActionDescriptor,
  ApprovalService,
  AvailableTransition,
  BadgeDescriptor,
  CompiledModel,
  EntityClass,
  EntityClassificationService,
  EntityFeatureFlags,
  EntityPageDescriptorService,
  EntityPageDynamicDescriptor,
  EntityPageStaticDescriptor,
  LifecycleManager,
  MetaCompiler,
  PolicyGate,
  ReasonCode,
  RequestContext,
  SectionDescriptor,
  TabDescriptor,
  ViewMode,
} from "@athyper/core/meta";

// System fields that should not appear in form sections
const SYSTEM_FIELDS = new Set([
  "id",
  "tenant_id",
  "realm_id",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "deleted_at",
  "deleted_by",
  "version",
]);

export class EntityPageDescriptorServiceImpl implements EntityPageDescriptorService {
  constructor(
    private readonly compiler: MetaCompiler,
    private readonly classificationService: EntityClassificationService,
    private readonly lifecycleManager: LifecycleManager,
    private readonly approvalService: ApprovalService,
    private readonly policyGate: PolicyGate,
  ) {}

  // ==========================================================================
  // Static Descriptor
  // ==========================================================================

  async describeStatic(
    entityName: string,
    ctx: RequestContext,
  ): Promise<EntityPageStaticDescriptor> {
    // Compile model (cached)
    const compiledModel = await this.compiler.compile(entityName, "v1");

    // Get classification
    const { entityClass, featureFlags } =
      await this.classificationService.getClassification(entityName, ctx.tenantId);

    // Build tabs
    const tabs = this.buildStaticTabs(entityClass, featureFlags);

    // Build default sections from compiled fields (MVP: 2-column layout)
    const sections = this.buildDefaultSections(compiledModel);

    return {
      entityName,
      entityClass,
      featureFlags,
      compiledModelHash: compiledModel.outputHash ?? compiledModel.hash,
      tabs,
      sections,
    };
  }

  // ==========================================================================
  // Dynamic Descriptor
  // ==========================================================================

  async describeDynamic(
    entityName: string,
    entityId: string,
    ctx: RequestContext,
    requestedViewMode?: ViewMode,
  ): Promise<EntityPageDynamicDescriptor> {
    // Parallel fetch: lifecycle state, approval status, permissions
    const [
      currentStateResult,
      availableTransitions,
      approvalInstance,
      userTasks,
      permissionDecisions,
    ] = await Promise.all([
      this.safeGetCurrentState(entityName, entityId, ctx.tenantId),
      this.safeGetAvailableTransitions(entityName, entityId, ctx),
      this.approvalService.getInstanceForEntity(entityName, entityId, ctx.tenantId),
      this.approvalService.getTasksForUser(ctx.userId, ctx.tenantId, { pageSize: 100 }),
      this.policyGate.authorizeMany(
        [
          { action: "read", resource: entityName },
          { action: "update", resource: entityName },
          { action: "delete", resource: entityName },
        ],
        ctx,
      ),
    ]);

    // Build permissions map
    const permissions: Record<string, boolean> = {};
    for (const [key, decision] of permissionDecisions) {
      const action = key.split(":")[0];
      permissions[action] = decision.allowed;
    }

    // Resolve view mode
    const { resolvedViewMode, viewModeReason } = this.resolveViewMode(
      requestedViewMode ?? "view",
      permissions,
      currentStateResult,
      approvalInstance?.status,
    );

    // Filter user tasks to this entity
    const myTasks = userTasks.data.filter(
      (t) => t.approvalInstanceId === approvalInstance?.id,
    );

    // Build badges
    const badges = this.buildBadges(currentStateResult, approvalInstance);

    // Build actions from available transitions + entity actions
    const actions = this.buildActions(
      availableTransitions,
      permissions,
      approvalInstance,
      myTasks,
    );

    return {
      entityName,
      entityId,
      resolvedViewMode,
      viewModeReason,
      currentState: currentStateResult
        ? {
            stateId: currentStateResult.state.id,
            stateCode: currentStateResult.state.code,
            stateName: currentStateResult.state.name,
            isTerminal: currentStateResult.state.isTerminal,
          }
        : undefined,
      badges,
      actions,
      approval: approvalInstance
        ? {
            instanceId: approvalInstance.id,
            status: approvalInstance.status,
            myTasks,
          }
        : undefined,
      permissions,
    };
  }

  // ==========================================================================
  // Private: Tab Building
  // ==========================================================================

  private buildStaticTabs(
    entityClass: EntityClass | undefined,
    featureFlags: EntityFeatureFlags,
  ): TabDescriptor[] {
    const tabs: TabDescriptor[] = [
      { code: "details", label: "Details", enabled: true },
    ];

    // Lifecycle tab: enabled for all entities with lifecycle support
    tabs.push({
      code: "lifecycle",
      label: "Lifecycle",
      enabled: true,
    });

    // Approvals tab: enabled if approval_required flag is set
    if (featureFlags.approval_required) {
      tabs.push({
        code: "approvals",
        label: "Approvals",
        enabled: true,
      });
    }

    // Audit tab: always available
    tabs.push({
      code: "audit",
      label: "Audit Log",
      enabled: true,
    });

    return tabs;
  }

  // ==========================================================================
  // Private: Section Building (MVP: default 2-column)
  // ==========================================================================

  private buildDefaultSections(compiledModel: CompiledModel): SectionDescriptor[] {
    // Filter out system fields
    const userFields = compiledModel.fields
      .filter((f) => !SYSTEM_FIELDS.has(f.columnName))
      .map((f) => f.name);

    if (userFields.length === 0) {
      return [];
    }

    return [
      {
        code: "main",
        label: "Details",
        columns: 2,
        fields: userFields,
      },
    ];
  }

  // ==========================================================================
  // Private: View Mode Resolution
  // ==========================================================================

  private resolveViewMode(
    requested: ViewMode,
    permissions: Record<string, boolean>,
    currentState: Awaited<ReturnType<typeof this.safeGetCurrentState>>,
    approvalStatus: string | undefined,
  ): { resolvedViewMode: ViewMode; viewModeReason?: ReasonCode } {
    // Create mode: check create permission
    if (requested === "create") {
      if (!permissions["create"]) {
        return { resolvedViewMode: "view", viewModeReason: "policy_denied" };
      }
      return { resolvedViewMode: "create" };
    }

    // Edit mode: multiple checks
    if (requested === "edit") {
      // Check update permission
      if (!permissions["update"]) {
        return { resolvedViewMode: "view", viewModeReason: "policy_denied" };
      }

      // Check terminal state
      if (currentState?.isTerminal) {
        return { resolvedViewMode: "view", viewModeReason: "terminal_state" };
      }

      // Check approval pending
      if (approvalStatus === "open") {
        return { resolvedViewMode: "view", viewModeReason: "approval_pending" };
      }

      return { resolvedViewMode: "edit" };
    }

    // View mode: always allowed if read permission exists
    return { resolvedViewMode: "view" };
  }

  // ==========================================================================
  // Private: Badge Building
  // ==========================================================================

  private buildBadges(
    currentState: Awaited<ReturnType<typeof this.safeGetCurrentState>>,
    approvalInstance: Awaited<ReturnType<ApprovalService["getInstanceForEntity"]>>,
  ): BadgeDescriptor[] {
    const badges: BadgeDescriptor[] = [];

    // Lifecycle state badge
    if (currentState) {
      badges.push({
        code: "lifecycle_state",
        label: currentState.state.name,
        variant: currentState.state.isTerminal
          ? "outline"
          : "default",
      });
    }

    // Approval status badge
    if (approvalInstance) {
      const variantMap: Record<string, BadgeDescriptor["variant"]> = {
        open: "warning",
        completed: "success",
        rejected: "destructive",
        canceled: "outline",
      };

      badges.push({
        code: "approval_status",
        label: `Approval: ${approvalInstance.status}`,
        variant: variantMap[approvalInstance.status] ?? "default",
      });
    }

    return badges;
  }

  // ==========================================================================
  // Private: Action Building
  // ==========================================================================

  private buildActions(
    transitions: AvailableTransition[],
    permissions: Record<string, boolean>,
    approvalInstance: Awaited<ReturnType<ApprovalService["getInstanceForEntity"]>>,
    myTasks: Array<{ id: string; status: string }>,
  ): ActionDescriptor[] {
    const actions: ActionDescriptor[] = [];

    // Lifecycle transition actions
    for (const transition of transitions) {
      actions.push({
        code: `lifecycle.${transition.operationCode.toLowerCase()}`,
        label: this.formatOperationLabel(transition.operationCode),
        handler: `lifecycle.${transition.operationCode.toLowerCase()}`,
        variant: this.getTransitionVariant(transition.operationCode),
        enabled: transition.authorized,
        disabledReason: transition.authorized
          ? undefined
          : (transition.unauthorizedReason as ReasonCode) ?? "policy_denied",
        requiresConfirmation: this.isDestructiveTransition(transition.operationCode),
        confirmationMessage: this.isDestructiveTransition(transition.operationCode)
          ? `Are you sure you want to ${transition.operationCode.toLowerCase()} this record?`
          : undefined,
      });
    }

    // Approval actions (only if user has pending tasks)
    const pendingTasks = myTasks.filter((t) => t.status === "pending");
    if (pendingTasks.length > 0 && approvalInstance?.status === "open") {
      actions.push({
        code: "approval.approve",
        label: "Approve",
        handler: "approval.approve",
        variant: "default",
        enabled: true,
        requiresConfirmation: true,
        confirmationMessage: "Are you sure you want to approve?",
      });

      actions.push({
        code: "approval.reject",
        label: "Reject",
        handler: "approval.reject",
        variant: "destructive",
        enabled: true,
        requiresConfirmation: true,
        confirmationMessage: "Please provide a reason for rejection.",
      });
    }

    // Entity actions (edit, delete, restore)
    if (permissions["update"]) {
      actions.push({
        code: "entity.edit",
        label: "Edit",
        handler: "entity.update",
        variant: "outline",
        enabled: true,
        requiresConfirmation: false,
      });
    }

    if (permissions["delete"]) {
      actions.push({
        code: "entity.delete",
        label: "Delete",
        handler: "entity.delete",
        variant: "destructive",
        enabled: true,
        requiresConfirmation: true,
        confirmationMessage: "Are you sure you want to delete this record?",
      });
    }

    return actions;
  }

  // ==========================================================================
  // Private: Helpers
  // ==========================================================================

  private formatOperationLabel(operationCode: string): string {
    return operationCode
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  private getTransitionVariant(operationCode: string): ActionDescriptor["variant"] {
    const upper = operationCode.toUpperCase();
    if (upper === "REJECT" || upper === "CANCEL" || upper === "VOID") {
      return "destructive";
    }
    if (upper === "SUBMIT" || upper === "APPROVE") {
      return "default";
    }
    return "outline";
  }

  private isDestructiveTransition(operationCode: string): boolean {
    const upper = operationCode.toUpperCase();
    return upper === "REJECT" || upper === "CANCEL" || upper === "VOID" || upper === "DELETE";
  }

  private async safeGetCurrentState(
    entityName: string,
    entityId: string,
    tenantId: string,
  ) {
    try {
      return await this.lifecycleManager.getCurrentState(entityName, entityId, tenantId);
    } catch {
      // Entity may not have lifecycle configured
      return undefined;
    }
  }

  private async safeGetAvailableTransitions(
    entityName: string,
    entityId: string,
    ctx: RequestContext,
  ): Promise<AvailableTransition[]> {
    try {
      return await this.lifecycleManager.getAvailableTransitions(entityName, entityId, ctx);
    } catch {
      // Entity may not have lifecycle configured
      return [];
    }
  }
}
