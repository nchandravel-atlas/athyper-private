/**
 * Subject Resolution Service
 *
 * A3: Subject Resolution
 * Maps request principal to subject set for policy evaluation
 *
 * Uses IAM services (B1-B6) to build SubjectSnapshot:
 * - principal_id -> user:<id>
 * - roles -> kc_role:<role_code>
 * - groups -> kc_group:<group_code>
 * - service accounts -> service:<client_id>
 * - OU membership and ABAC attributes
 */

import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";
import type { SubjectSnapshot, SubjectKey, SubjectType } from "./types.js";

// Import IAM services for integration
import type { EntitlementSnapshotService } from "../identity-access/entitlement-snapshot.service.js";
import type { RoleBindingService } from "../identity-access/role-binding.service.js";
import type { GroupSyncService } from "../identity-access/group-sync.service.js";
import type { OUMembershipService } from "../identity-access/ou-membership.service.js";

/**
 * Subject Resolution Service
 */
export class SubjectResolverService {
  /** In-memory cache: principalId:tenantId -> SubjectSnapshot */
  private cache: Map<string, SubjectSnapshot> = new Map();

  /** Cache TTL in milliseconds (5 minutes default) */
  private cacheTtlMs: number = 5 * 60 * 1000;

  constructor(
    private readonly db: Kysely<DB>,
    private readonly roleBindingService?: RoleBindingService,
    private readonly groupSyncService?: GroupSyncService,
    private readonly ouMembershipService?: OUMembershipService,
    private readonly entitlementSnapshotService?: EntitlementSnapshotService
  ) {}

  /**
   * Resolve subject snapshot for principal
   *
   * If entitlement snapshot service is available, uses cached entitlements.
   * Otherwise, builds snapshot from individual services.
   */
  async resolveSubject(
    principalId: string,
    tenantId: string
  ): Promise<SubjectSnapshot> {
    const cacheKey = `${principalId}:${tenantId}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValid(cached)) {
      return cached;
    }

    // If entitlement snapshot service is available, use it
    if (this.entitlementSnapshotService) {
      const snapshot = await this.buildFromEntitlementSnapshot(principalId, tenantId);
      this.cache.set(cacheKey, snapshot);
      return snapshot;
    }

    // Build from individual services
    const snapshot = await this.buildSnapshot(principalId, tenantId);
    this.cache.set(cacheKey, snapshot);
    return snapshot;
  }

  /**
   * Build subject snapshot from entitlement snapshot service
   */
  private async buildFromEntitlementSnapshot(
    principalId: string,
    tenantId: string
  ): Promise<SubjectSnapshot> {
    const entitlement = await this.entitlementSnapshotService!.getOrGenerateSnapshot(
      principalId,
      tenantId
    );

    // Get principal info
    const principal = await this.getPrincipalInfo(principalId);

    return {
      principalId,
      principalType: principal?.principal_type ?? "user",
      tenantId,
      userKey: `user:${principalId}`,
      serviceKey:
        principal?.principal_type === "service"
          ? `service:${principalId}`
          : undefined,
      roles: entitlement.roles.map((r) => r.code),
      groups: entitlement.groups.map((g) => g.code),
      ouMembership: entitlement.ouMembership
        ? {
            nodeId: entitlement.ouMembership.nodeId,
            path: entitlement.ouMembership.path,
            code: entitlement.ouMembership.name, // Using name as code placeholder
          }
        : undefined,
      attributes: entitlement.attributes,
      generatedAt: new Date(),
    };
  }

  /**
   * Build subject snapshot from individual services
   */
  private async buildSnapshot(
    principalId: string,
    tenantId: string
  ): Promise<SubjectSnapshot> {
    // Get principal info
    const principal = await this.getPrincipalInfo(principalId);

    // Get roles
    let roles: string[] = [];
    if (this.roleBindingService) {
      const rolesWithBindings = await this.roleBindingService.getPrincipalRoles(
        principalId,
        tenantId
      );
      roles = rolesWithBindings.map((r) => r.code);
    } else {
      // Fallback: query directly
      roles = await this.getRolesDirectly(principalId, tenantId);
    }

    // Get groups
    let groups: string[] = [];
    if (this.groupSyncService) {
      const groupInfos = await this.groupSyncService.getPrincipalGroups(principalId);
      groups = groupInfos.map((g) => g.code);
    } else {
      // Fallback: query directly
      groups = await this.getGroupsDirectly(principalId, tenantId);
    }

    // Get OU membership and attributes
    let ouMembership: SubjectSnapshot["ouMembership"];
    let attributes: Record<string, string> = {};

    if (this.ouMembershipService) {
      const ou = await this.ouMembershipService.getPrincipalOU(principalId);
      if (ou) {
        ouMembership = {
          nodeId: ou.id,
          path: ou.path,
          code: ou.code,
        };
      }
      const attrs = await this.ouMembershipService.getPrincipalAttributes(principalId);
      for (const attr of attrs) {
        attributes[attr.key] = attr.value;
      }
    } else {
      // Fallback: query directly
      const directAttrs = await this.getAttributesDirectly(principalId);
      for (const attr of directAttrs) {
        attributes[attr.key] = attr.value;
        if (attr.key === "ou_node_id") {
          const ou = await this.getOUNodeDirectly(attr.value);
          if (ou) {
            ouMembership = {
              nodeId: ou.id,
              path: ou.path,
              code: ou.code,
            };
          }
        }
      }
    }

    return {
      principalId,
      principalType: principal?.principal_type ?? "user",
      tenantId,
      userKey: `user:${principalId}`,
      serviceKey:
        principal?.principal_type === "service"
          ? `service:${principalId}`
          : undefined,
      roles,
      groups,
      ouMembership,
      attributes,
      generatedAt: new Date(),
    };
  }

  /**
   * Get principal info
   */
  private async getPrincipalInfo(
    principalId: string
  ): Promise<{ principal_type: string } | undefined> {
    const result = await this.db
      .selectFrom("core.principal")
      .select("principal_type")
      .where("id", "=", principalId)
      .executeTakeFirst();

    return result;
  }

  /**
   * Get roles directly from database
   */
  private async getRolesDirectly(
    principalId: string,
    tenantId: string
  ): Promise<string[]> {
    const now = new Date();

    // Direct bindings
    const directRoles = await this.db
      .selectFrom("core.role_binding as rb")
      .innerJoin("core.role as r", "r.id", "rb.role_id")
      .select("r.code")
      .where("rb.tenant_id", "=", tenantId)
      .where("rb.principal_id", "=", principalId)
      .where("r.is_active", "=", true)
      .where((eb) =>
        eb.or([eb("rb.valid_from", "is", null), eb("rb.valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("rb.valid_until", "is", null), eb("rb.valid_until", ">", now)])
      )
      .execute();

    return directRoles.map((r) => r.code);
  }

  /**
   * Get groups directly from database
   */
  private async getGroupsDirectly(
    principalId: string,
    tenantId: string
  ): Promise<string[]> {
    const now = new Date();

    const groups = await this.db
      .selectFrom("core.group_member as gm")
      .innerJoin("core.group as g", "g.id", "gm.group_id")
      .select("g.code")
      .where("gm.tenant_id", "=", tenantId)
      .where("gm.principal_id", "=", principalId)
      .where("g.is_active", "=", true)
      .where((eb) =>
        eb.or([eb("gm.valid_from", "is", null), eb("gm.valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("gm.valid_until", "is", null), eb("gm.valid_until", ">", now)])
      )
      .execute();

    return groups.map((g) => g.code);
  }

  /**
   * Get attributes directly from database
   */
  private async getAttributesDirectly(
    principalId: string
  ): Promise<Array<{ key: string; value: string }>> {
    const now = new Date();

    const attrs = await this.db
      .selectFrom("core.principal_attribute")
      .select(["attr_key", "attr_value"])
      .where("principal_id", "=", principalId)
      .where((eb) =>
        eb.or([eb("valid_from", "is", null), eb("valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("valid_until", "is", null), eb("valid_until", ">", now)])
      )
      .execute();

    return attrs.map((a) => ({ key: a.attr_key, value: a.attr_value }));
  }

  /**
   * Get OU node directly from database
   */
  private async getOUNodeDirectly(
    nodeId: string
  ): Promise<{ id: string; path: string; code: string } | undefined> {
    const result = await this.db
      .selectFrom("core.ou_node")
      .select(["id", "path", "code"])
      .where("id", "=", nodeId)
      .executeTakeFirst();

    return result;
  }

  /**
   * Check if snapshot is still valid
   */
  private isValid(snapshot: SubjectSnapshot): boolean {
    const age = Date.now() - snapshot.generatedAt.getTime();
    return age < this.cacheTtlMs;
  }

  /**
   * Build all subject keys for matching
   * Returns array of subject keys to match against rules
   */
  buildSubjectKeys(snapshot: SubjectSnapshot): SubjectKey[] {
    const keys: SubjectKey[] = [];

    // User key
    keys.push({ type: "user", key: snapshot.principalId });

    // Service key
    if (snapshot.serviceKey) {
      keys.push({ type: "service", key: snapshot.principalId });
    }

    // Role keys
    for (const role of snapshot.roles) {
      keys.push({ type: "kc_role", key: role });
    }

    // Group keys
    for (const group of snapshot.groups) {
      keys.push({ type: "kc_group", key: group });
    }

    return keys;
  }

  /**
   * Invalidate cache for a principal
   */
  invalidateCache(principalId: string, tenantId: string): void {
    const cacheKey = `${principalId}:${tenantId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set cache TTL
   */
  setCacheTtl(ttlMs: number): void {
    this.cacheTtlMs = ttlMs;
  }
}
