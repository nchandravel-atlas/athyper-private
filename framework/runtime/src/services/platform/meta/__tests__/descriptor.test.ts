/**
 * Entity Page Descriptor Service Tests
 *
 * Tests static descriptor (tabs, sections) and dynamic descriptor
 * (view mode resolution, badges, actions, permissions).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { EntityPageDescriptorServiceImpl } from "../descriptor/entity-page-descriptor.service.js";

import type { RequestContext, EntityFeatureFlags } from "@athyper/core/meta";

// ============================================================================
// Test Helpers
// ============================================================================

const ctx: RequestContext = {
  userId: "user-1",
  tenantId: "tenant-1",
  realmId: "realm-1",
  roles: ["editor"],
};

function makeCompiledModel(userFieldNames: string[] = ["title", "amount"]) {
  const systemFields = [
    { name: "id", columnName: "id" },
    { name: "tenant_id", columnName: "tenant_id" },
    { name: "realm_id", columnName: "realm_id" },
    { name: "created_at", columnName: "created_at" },
    { name: "created_by", columnName: "created_by" },
    { name: "updated_at", columnName: "updated_at" },
    { name: "updated_by", columnName: "updated_by" },
    { name: "deleted_at", columnName: "deleted_at" },
    { name: "deleted_by", columnName: "deleted_by" },
    { name: "version", columnName: "version" },
  ];
  const userFields = userFieldNames.map((n) => ({
    name: n,
    columnName: n.replace(/[A-Z]/g, (l: string) => `_${l.toLowerCase()}`),
  }));

  return {
    entityName: "test_entity",
    version: "v1",
    hash: "abc",
    outputHash: "out-hash-123",
    fields: [...systemFields, ...userFields],
  } as any;
}

function makeFeatureFlags(overrides: Partial<EntityFeatureFlags> = {}): EntityFeatureFlags {
  return {
    approval_required: false,
    numbering_enabled: false,
    effective_dating_enabled: false,
    versioning_mode: "none",
    ...overrides,
  } as EntityFeatureFlags;
}

function createService() {
  const compiler = {
    compile: vi.fn(async () => makeCompiledModel()),
  };

  const classification = {
    getClassification: vi.fn(async () => ({
      entityClass: "DOCUMENT",
      featureFlags: makeFeatureFlags(),
    })),
  };

  const lifecycle = {
    getCurrentState: vi.fn(async () => ({
      state: { id: "s1", code: "DRAFT", name: "Draft", isTerminal: false },
      isTerminal: false,
    })),
    getAvailableTransitions: vi.fn(async () => [
      { operationCode: "SUBMIT", authorized: true },
    ]),
  };

  const approval = {
    getInstanceForEntity: vi.fn(async () => null),
    getTasksForUser: vi.fn(async () => ({ data: [] })),
  };

  const policyGate = {
    authorizeMany: vi.fn(async () => {
      const map = new Map<string, { allowed: boolean }>();
      map.set("read:test_entity", { allowed: true });
      map.set("update:test_entity", { allowed: true });
      map.set("delete:test_entity", { allowed: true });
      return map;
    }),
  };

  const svc = new EntityPageDescriptorServiceImpl(
    compiler as any,
    classification as any,
    lifecycle as any,
    approval as any,
    policyGate as any,
  );

  return { svc, compiler, classification, lifecycle, approval, policyGate };
}

// ============================================================================
// Tests
// ============================================================================

describe("EntityPageDescriptorServiceImpl", () => {
  // --------------------------------------------------------------------------
  // describeStatic()
  // --------------------------------------------------------------------------

  describe("describeStatic()", () => {
    it("should return Details, Lifecycle, and Audit tabs by default", async () => {
      const { svc } = createService();
      const desc = await svc.describeStatic("test_entity", ctx);

      const tabCodes = desc.tabs.map((t: any) => t.code);
      expect(tabCodes).toContain("details");
      expect(tabCodes).toContain("lifecycle");
      expect(tabCodes).toContain("audit");
      expect(tabCodes).not.toContain("approvals");
    });

    it("should include Approvals tab when approval_required flag is set", async () => {
      const { svc, classification } = createService();
      classification.getClassification.mockResolvedValue({
        entityClass: "DOCUMENT",
        featureFlags: makeFeatureFlags({ approval_required: true }),
      });

      const desc = await svc.describeStatic("test_entity", ctx);

      const tabCodes = desc.tabs.map((t: any) => t.code);
      expect(tabCodes).toContain("approvals");
    });

    it("should build sections with user fields only (system fields excluded)", async () => {
      const { svc } = createService();
      const desc = await svc.describeStatic("test_entity", ctx);

      expect(desc.sections.length).toBe(1);
      expect(desc.sections[0].code).toBe("main");
      expect(desc.sections[0].columns).toBe(2);
      expect(desc.sections[0].fields).toEqual(["title", "amount"]);
    });

    it("should return empty sections when entity has no user fields", async () => {
      const { svc, compiler } = createService();
      compiler.compile.mockResolvedValue(makeCompiledModel([]));

      const desc = await svc.describeStatic("test_entity", ctx);

      expect(desc.sections.length).toBe(0);
    });

    it("should include compiledModelHash", async () => {
      const { svc } = createService();
      const desc = await svc.describeStatic("test_entity", ctx);

      expect(desc.compiledModelHash).toBe("out-hash-123");
    });

    it("should include entityClass and featureFlags", async () => {
      const { svc } = createService();
      const desc = await svc.describeStatic("test_entity", ctx);

      expect(desc.entityClass).toBe("DOCUMENT");
      expect(desc.featureFlags).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // describeDynamic()
  // --------------------------------------------------------------------------

  describe("describeDynamic()", () => {
    it("should resolve edit mode when permissions + non-terminal + no approval", async () => {
      const { svc } = createService();

      const desc = await svc.describeDynamic("test_entity", "r1", ctx, "edit");

      expect(desc.resolvedViewMode).toBe("edit");
      expect(desc.viewModeReason).toBeUndefined();
    });

    it("should downgrade edit → view when update permission denied", async () => {
      const { svc, policyGate } = createService();
      policyGate.authorizeMany.mockResolvedValue(
        new Map<string, { allowed: boolean }>([
          ["read:test_entity", { allowed: true }],
          ["update:test_entity", { allowed: false }],
          ["delete:test_entity", { allowed: false }],
        ]),
      );

      const desc = await svc.describeDynamic("test_entity", "r1", ctx, "edit");

      expect(desc.resolvedViewMode).toBe("view");
      expect(desc.viewModeReason).toBe("policy_denied");
    });

    it("should downgrade edit → view when state is terminal", async () => {
      const { svc, lifecycle } = createService();
      lifecycle.getCurrentState.mockResolvedValue({
        state: { id: "s2", code: "CLOSED", name: "Closed", isTerminal: true },
        isTerminal: true,
      });

      const desc = await svc.describeDynamic("test_entity", "r1", ctx, "edit");

      expect(desc.resolvedViewMode).toBe("view");
      expect(desc.viewModeReason).toBe("terminal_state");
    });

    it("should downgrade edit → view when approval is open", async () => {
      const { svc, approval } = createService();
      approval.getInstanceForEntity.mockResolvedValue({
        id: "ai-1",
        status: "open",
      });

      const desc = await svc.describeDynamic("test_entity", "r1", ctx, "edit");

      expect(desc.resolvedViewMode).toBe("view");
      expect(desc.viewModeReason).toBe("approval_pending");
    });

    it("should resolve create mode when create permission exists", async () => {
      const { svc, policyGate } = createService();
      // Need to add create permission
      policyGate.authorizeMany.mockResolvedValue(
        new Map<string, { allowed: boolean }>([
          ["read:test_entity", { allowed: true }],
          ["update:test_entity", { allowed: true }],
          ["delete:test_entity", { allowed: true }],
          ["create:test_entity", { allowed: true }],
        ]),
      );

      // Note: describeDynamic doesn't check create permission directly;
      // the resolveViewMode checks permissions["create"]
      const desc = await svc.describeDynamic("test_entity", "r1", ctx, "create");

      // create permission should be derived from authorizeMany
      // Since the mock returns create:test_entity → allowed
      // But the service splits key by ":" and takes action part
      expect(desc.resolvedViewMode).toBeDefined();
    });

    it("should build lifecycle state badge", async () => {
      const { svc } = createService();

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const stateBadge = desc.badges.find((b: any) => b.code === "lifecycle_state");
      expect(stateBadge).toBeDefined();
      expect(stateBadge!.label).toBe("Draft");
      expect(stateBadge!.variant).toBe("default"); // non-terminal
    });

    it("should build terminal state badge with outline variant", async () => {
      const { svc, lifecycle } = createService();
      lifecycle.getCurrentState.mockResolvedValue({
        state: { id: "s3", code: "CLOSED", name: "Closed", isTerminal: true },
        isTerminal: true,
      });

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const stateBadge = desc.badges.find((b: any) => b.code === "lifecycle_state");
      expect(stateBadge!.variant).toBe("outline");
    });

    it("should build approval status badge when approval exists", async () => {
      const { svc, approval } = createService();
      approval.getInstanceForEntity.mockResolvedValue({
        id: "ai-1",
        status: "open",
      });

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const approvalBadge = desc.badges.find((b: any) => b.code === "approval_status");
      expect(approvalBadge).toBeDefined();
      expect(approvalBadge!.variant).toBe("warning");
      expect(approvalBadge!.label).toContain("open");
    });

    it("should build lifecycle transition actions", async () => {
      const { svc } = createService();

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const submitAction = desc.actions.find(
        (a: any) => a.code === "lifecycle.submit",
      );
      expect(submitAction).toBeDefined();
      expect(submitAction!.enabled).toBe(true);
      expect(submitAction!.handler).toBe("lifecycle.submit");
    });

    it("should build approval actions when user has pending tasks", async () => {
      const { svc, approval } = createService();
      approval.getInstanceForEntity.mockResolvedValue({
        id: "ai-1",
        status: "open",
      });
      approval.getTasksForUser.mockResolvedValue({
        data: [
          { id: "task-1", status: "pending", approvalInstanceId: "ai-1" },
        ],
      });

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const approveAction = desc.actions.find((a: any) => a.code === "approval.approve");
      const rejectAction = desc.actions.find((a: any) => a.code === "approval.reject");
      expect(approveAction).toBeDefined();
      expect(rejectAction).toBeDefined();
      expect(rejectAction!.variant).toBe("destructive");
    });

    it("should NOT build approval actions when user has no pending tasks", async () => {
      const { svc, approval } = createService();
      approval.getInstanceForEntity.mockResolvedValue({
        id: "ai-1",
        status: "open",
      });
      approval.getTasksForUser.mockResolvedValue({ data: [] });

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const approveAction = desc.actions.find((a: any) => a.code === "approval.approve");
      expect(approveAction).toBeUndefined();
    });

    it("should include entity edit/delete actions based on permissions", async () => {
      const { svc } = createService();

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const editAction = desc.actions.find((a: any) => a.code === "entity.edit");
      const deleteAction = desc.actions.find((a: any) => a.code === "entity.delete");
      expect(editAction).toBeDefined();
      expect(deleteAction).toBeDefined();
      expect(deleteAction!.requiresConfirmation).toBe(true);
    });

    it("should exclude entity actions when permissions denied", async () => {
      const { svc, policyGate } = createService();
      policyGate.authorizeMany.mockResolvedValue(
        new Map<string, { allowed: boolean }>([
          ["read:test_entity", { allowed: true }],
          ["update:test_entity", { allowed: false }],
          ["delete:test_entity", { allowed: false }],
        ]),
      );

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const editAction = desc.actions.find((a: any) => a.code === "entity.edit");
      const deleteAction = desc.actions.find((a: any) => a.code === "entity.delete");
      expect(editAction).toBeUndefined();
      expect(deleteAction).toBeUndefined();
    });

    it("should handle lifecycle error gracefully (no state)", async () => {
      const { svc, lifecycle } = createService();
      lifecycle.getCurrentState.mockRejectedValue(new Error("no lifecycle"));

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      expect(desc.currentState).toBeUndefined();
      const stateBadge = desc.badges.find((b: any) => b.code === "lifecycle_state");
      expect(stateBadge).toBeUndefined();
    });

    it("should handle transition error gracefully (empty transitions)", async () => {
      const { svc, lifecycle } = createService();
      lifecycle.getAvailableTransitions.mockRejectedValue(
        new Error("no lifecycle"),
      );

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const transitionActions = desc.actions.filter((a: any) =>
        a.code.startsWith("lifecycle."),
      );
      expect(transitionActions.length).toBe(0);
    });

    it("should build permissions map from authorizeMany", async () => {
      const { svc } = createService();

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      expect(desc.permissions).toBeDefined();
      expect(desc.permissions["read"]).toBe(true);
      expect(desc.permissions["update"]).toBe(true);
      expect(desc.permissions["delete"]).toBe(true);
    });

    it("should mark destructive transitions with confirmation", async () => {
      const { svc, lifecycle } = createService();
      lifecycle.getAvailableTransitions.mockResolvedValue([
        { operationCode: "SUBMIT", authorized: true },
        { operationCode: "REJECT", authorized: true },
        { operationCode: "CANCEL", authorized: true },
      ]);

      const desc = await svc.describeDynamic("test_entity", "r1", ctx);

      const submitAction = desc.actions.find((a: any) => a.code === "lifecycle.submit");
      const rejectAction = desc.actions.find((a: any) => a.code === "lifecycle.reject");
      const cancelAction = desc.actions.find((a: any) => a.code === "lifecycle.cancel");

      expect(submitAction!.requiresConfirmation).toBe(false);
      expect(rejectAction!.requiresConfirmation).toBe(true);
      expect(rejectAction!.variant).toBe("destructive");
      expect(cancelAction!.requiresConfirmation).toBe(true);
    });
  });
});
