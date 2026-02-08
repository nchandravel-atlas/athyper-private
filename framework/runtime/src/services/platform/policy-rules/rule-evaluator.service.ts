/**
 * Rule Evaluation Engine
 *
 * A4: The Real Gate
 * Core policy evaluation engine that:
 * - Matches rules using compiled policy index
 * - Evaluates ABAC conditions
 * - Handles effect precedence (priority-based, deny override)
 * - Returns authorization decision
 */

import type { OperationCatalogService } from "./operation-catalog.service.js";
import type { PolicyCompilerService } from "./policy-compiler.service.js";
import type { PolicyResolutionService } from "./policy-resolution.service.js";
import type { SubjectResolverService } from "./subject-resolver.service.js";
import type {
  AuthorizationRequest,
  AuthorizationDecision,
  SubjectSnapshot,
  CompiledPolicy,
  CompiledRule,
  Condition,
  ConditionGroup,
  ScopeType,
  SubjectKey,
} from "./types.js";
import type { DB } from "@athyper/adapter-db";
import type { Kysely } from "kysely";

/**
 * Scope specificity order (higher = more specific)
 */
const SCOPE_SPECIFICITY: Record<ScopeType, number> = {
  record: 5,
  entity_version: 4,
  entity: 3,
  module: 2,
  global: 1,
};

/**
 * Rule Evaluation Engine
 */
export class RuleEvaluatorService {
  constructor(
    private readonly db: Kysely<DB>,
    private readonly subjectResolver: SubjectResolverService,
    private readonly policyCompiler: PolicyCompilerService,
    private readonly policyResolution: PolicyResolutionService,
    private readonly operationCatalog: OperationCatalogService
  ) {}

  /**
   * Main authorization entry point
   */
  async authorize(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    const startTime = Date.now();

    try {
      // 1. Resolve subject snapshot
      const subject = await this.subjectResolver.resolveSubject(
        request.principalId,
        request.tenantId
      );

      // 2. Build subject keys for matching
      const subjectKeys = this.subjectResolver.buildSubjectKeys(subject);

      // 3. Get operation ID
      const operation = await this.operationCatalog.getOperation(request.operationCode);
      if (!operation) {
        return this.createDenyDecision(
          request,
          undefined,
          undefined,
          `Unknown operation: ${request.operationCode}`,
          Date.now() - startTime
        );
      }

      // 4. Resolve applicable policies
      const policies = await this.policyResolution.resolvePolicies(
        request.tenantId,
        request.resource
      );

      if (policies.length === 0) {
        // No policies = default deny
        return this.createDenyDecision(
          request,
          undefined,
          undefined,
          "No policies apply to this resource",
          Date.now() - startTime
        );
      }

      // 5. Evaluate each policy in order (most specific first)
      const matchedRules: Array<{
        rule: CompiledRule;
        policyVersionId: string;
        scopeType: ScopeType;
      }> = [];

      for (const policy of policies) {
        // Get or compile policy
        const compiled = await this.policyCompiler.getOrCompile(
          request.tenantId,
          policy.activeVersionId,
          "system"
        );

        if (!compiled) continue;

        // Find matching rules
        const rules = this.findMatchingRules(
          compiled,
          subjectKeys,
          operation.id,
          request.resource,
          policy.scopeType
        );

        for (const rule of rules) {
          // Evaluate conditions
          if (await this.evaluateConditions(rule.conditions, subject, request)) {
            matchedRules.push({
              rule,
              policyVersionId: policy.activeVersionId,
              scopeType: policy.scopeType,
            });
          }
        }
      }

      // 6. Apply effect precedence
      const decision = this.resolveEffectPrecedence(matchedRules, request);

      return {
        ...decision,
        evaluationTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error(
        JSON.stringify({
          msg: "authorization_error",
          principalId: request.principalId,
          operationCode: request.operationCode,
          error: String(error),
        })
      );

      return this.createDenyDecision(
        request,
        undefined,
        undefined,
        `Authorization error: ${String(error)}`,
        Date.now() - startTime
      );
    }
  }

  /**
   * Quick permission check (returns boolean)
   */
  async hasPermission(
    principalId: string,
    tenantId: string,
    operationCode: string,
    resource: AuthorizationRequest["resource"]
  ): Promise<boolean> {
    const decision = await this.authorize({
      principalId,
      tenantId,
      operationCode: operationCode as AuthorizationRequest["operationCode"],
      resource,
    });

    return decision.effect === "allow";
  }

  /**
   * Find matching rules in compiled policy
   */
  private findMatchingRules(
    compiled: CompiledPolicy,
    subjectKeys: SubjectKey[],
    operationId: string,
    resource: AuthorizationRequest["resource"],
    scopeType: ScopeType
  ): CompiledRule[] {
    const matchedRules: CompiledRule[] = [];

    // Build scope key for lookup
    const scopeKey = this.buildScopeKey(scopeType, resource);

    // Check each subject key
    for (const subjectKey of subjectKeys) {
      const fullSubjectKey = `${subjectKey.type}:${subjectKey.key}`;

      // Look up in index: scope -> subject -> operation
      const scopeIndex = compiled.ruleIndex[scopeKey];
      if (!scopeIndex) continue;

      const subjectIndex = scopeIndex[fullSubjectKey];
      if (!subjectIndex) continue;

      const rules = subjectIndex[operationId];
      if (!rules) continue;

      matchedRules.push(...rules);
    }

    // Also check wildcard subject "*"
    const scopeIndex = compiled.ruleIndex[scopeKey];
    if (scopeIndex) {
      const wildcardIndex = scopeIndex["*"];
      if (wildcardIndex) {
        const rules = wildcardIndex[operationId];
        if (rules) {
          matchedRules.push(...rules);
        }
      }
    }

    return matchedRules;
  }

  /**
   * Build scope key for index lookup
   */
  private buildScopeKey(
    scopeType: ScopeType,
    resource: AuthorizationRequest["resource"]
  ): string {
    switch (scopeType) {
      case "global":
        return "global:*";
      case "module":
        return `module:${resource.moduleCode ?? "*"}`;
      case "entity":
        return `entity:${resource.entityCode}`;
      case "entity_version":
        return `entity_version:${resource.entityCode}:${resource.entityVersionId ?? "*"}`;
      case "record":
        return `record:${resource.entityCode}:${resource.recordId ?? "*"}`;
    }
  }

  /**
   * Evaluate ABAC conditions
   */
  private async evaluateConditions(
    conditions: CompiledRule["conditions"],
    subject: SubjectSnapshot,
    request: AuthorizationRequest
  ): Promise<boolean> {
    if (!conditions) return true;

    // Build evaluation context
    const context: ConditionContext = {
      subject,
      resource: request.resource,
      environment: {
        now: new Date(),
        requestId: crypto.randomUUID(),
      },
    };

    return this.evaluateConditionGroup(conditions, context);
  }

  /**
   * Evaluate a condition group (AND/OR)
   */
  private evaluateConditionGroup(
    group: ConditionGroup,
    context: ConditionContext
  ): boolean {
    const operator = group.operator ?? "and";

    if (operator === "and") {
      // All conditions must be true
      for (const condition of group.conditions) {
        if ("operator" in condition && ("conditions" in condition)) {
          // Nested group
          if (!this.evaluateConditionGroup(condition as ConditionGroup, context)) {
            return false;
          }
        } else {
          // Single condition
          if (!this.evaluateCondition(condition as Condition, context)) {
            return false;
          }
        }
      }
      return true;
    } else {
      // At least one condition must be true
      for (const condition of group.conditions) {
        if ("operator" in condition && ("conditions" in condition)) {
          // Nested group
          if (this.evaluateConditionGroup(condition as ConditionGroup, context)) {
            return true;
          }
        } else {
          // Single condition
          if (this.evaluateCondition(condition as Condition, context)) {
            return true;
          }
        }
      }
      return false;
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: Condition,
    context: ConditionContext
  ): boolean {
    // Resolve field value
    const fieldValue = this.resolveFieldValue(condition.field, context);

    // Get comparison value
    const compareValue = condition.value;

    // Apply operator
    switch (condition.operator) {
      case "eq":
        return fieldValue === compareValue;

      case "ne":
        return fieldValue !== compareValue;

      case "gt":
        return typeof fieldValue === "number" &&
          typeof compareValue === "number" &&
          fieldValue > compareValue;

      case "gte":
        return typeof fieldValue === "number" &&
          typeof compareValue === "number" &&
          fieldValue >= compareValue;

      case "lt":
        return typeof fieldValue === "number" &&
          typeof compareValue === "number" &&
          fieldValue < compareValue;

      case "lte":
        return typeof fieldValue === "number" &&
          typeof compareValue === "number" &&
          fieldValue <= compareValue;

      case "in":
        return Array.isArray(compareValue) &&
          compareValue.includes(fieldValue);

      case "not_in":
        return Array.isArray(compareValue) &&
          !compareValue.includes(fieldValue);

      case "contains":
        return typeof fieldValue === "string" &&
          typeof compareValue === "string" &&
          fieldValue.includes(compareValue);

      case "starts_with":
        return typeof fieldValue === "string" &&
          typeof compareValue === "string" &&
          fieldValue.startsWith(compareValue);

      case "ends_with":
        return typeof fieldValue === "string" &&
          typeof compareValue === "string" &&
          fieldValue.endsWith(compareValue);

      case "matches":
        try {
          return typeof fieldValue === "string" &&
            typeof compareValue === "string" &&
            new RegExp(compareValue).test(fieldValue);
        } catch {
          return false;
        }

      case "exists":
        return fieldValue !== undefined && fieldValue !== null;

      case "not_exists":
        return fieldValue === undefined || fieldValue === null;

      default:
        console.warn(`Unknown condition operator: ${condition.operator}`);
        return false;
    }
  }

  /**
   * Resolve field value from context
   * Fields use dot notation: subject.department, resource.owner_id, etc.
   */
  private resolveFieldValue(
    field: string,
    context: ConditionContext
  ): unknown {
    const parts = field.split(".");
    const source = parts[0];
    const path = parts.slice(1);

    let value: unknown;

    switch (source) {
      case "subject":
        value = context.subject;
        break;
      case "resource":
        value = context.resource;
        break;
      case "environment":
        value = context.environment;
        break;
      default:
        // Try subject.attributes
        if (context.subject.attributes[field]) {
          return context.subject.attributes[field];
        }
        return undefined;
    }

    // Navigate path
    for (const key of path) {
      if (value === null || value === undefined) return undefined;
      if (typeof value === "object") {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Resolve effect precedence from matched rules
   *
   * Rules:
   * 1. More specific scope wins (record > entity_version > entity > module > global)
   * 2. Within same scope, lower priority number wins
   * 3. If same scope and priority, deny wins over allow
   */
  private resolveEffectPrecedence(
    matchedRules: Array<{
      rule: CompiledRule;
      policyVersionId: string;
      scopeType: ScopeType;
    }>,
    request: AuthorizationRequest
  ): Omit<AuthorizationDecision, "evaluationTimeMs"> {
    if (matchedRules.length === 0) {
      return {
        effect: "deny",
        principalId: request.principalId,
        operationCode: request.operationCode,
        resourceKey: this.buildResourceKey(request.resource),
        reason: "No matching rules found",
      };
    }

    // Sort by: scope specificity (desc), priority (asc), effect (deny first)
    const sorted = [...matchedRules].sort((a, b) => {
      // 1. Scope specificity (higher = more specific)
      const scopeDiff = SCOPE_SPECIFICITY[b.scopeType] - SCOPE_SPECIFICITY[a.scopeType];
      if (scopeDiff !== 0) return scopeDiff;

      // 2. Priority (lower = higher priority)
      const priorityDiff = a.rule.priority - b.rule.priority;
      if (priorityDiff !== 0) return priorityDiff;

      // 3. Deny wins over allow
      if (a.rule.effect === "deny" && b.rule.effect === "allow") return -1;
      if (a.rule.effect === "allow" && b.rule.effect === "deny") return 1;

      return 0;
    });

    const winner = sorted[0];

    return {
      effect: winner.rule.effect,
      principalId: request.principalId,
      operationCode: request.operationCode,
      resourceKey: this.buildResourceKey(request.resource),
      matchedRuleId: winner.rule.ruleId,
      matchedPolicyVersionId: winner.policyVersionId,
      reason: winner.rule.effect === "allow"
        ? `Allowed by rule ${winner.rule.ruleId} (scope: ${winner.scopeType}, priority: ${winner.rule.priority})`
        : `Denied by rule ${winner.rule.ruleId} (scope: ${winner.scopeType}, priority: ${winner.rule.priority})`,
    };
  }

  /**
   * Build resource key for logging
   */
  private buildResourceKey(resource: AuthorizationRequest["resource"]): string {
    const parts = [resource.entityCode];
    if (resource.moduleCode) parts.unshift(resource.moduleCode);
    if (resource.recordId) parts.push(resource.recordId);
    return parts.join(":");
  }

  /**
   * Create deny decision
   */
  private createDenyDecision(
    request: AuthorizationRequest,
    ruleId: string | undefined,
    policyVersionId: string | undefined,
    reason: string,
    evaluationTimeMs: number
  ): AuthorizationDecision {
    return {
      effect: "deny",
      principalId: request.principalId,
      operationCode: request.operationCode,
      resourceKey: this.buildResourceKey(request.resource),
      matchedRuleId: ruleId,
      matchedPolicyVersionId: policyVersionId,
      reason,
      evaluationTimeMs,
    };
  }
}

/**
 * Context for condition evaluation
 */
type ConditionContext = {
  subject: SubjectSnapshot;
  resource: AuthorizationRequest["resource"];
  environment: {
    now: Date;
    requestId: string;
  };
};
