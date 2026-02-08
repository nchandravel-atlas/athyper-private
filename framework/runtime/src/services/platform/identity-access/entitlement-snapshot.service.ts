/**
 * Entitlement Snapshot Service
 *
 * B6: Effective Entitlement Snapshot Cache
 * Server-side "fast path" for principal entitlements
 *
 * After resolving principal + roles + groups + OU attributes:
 * - Generate JSON entitlement snapshot
 * - Store in core.entitlement_snapshot with TTL
 * - Invalidate on changes (role_binding, group_member, principal_attribute)
 *
 * Tables:
 * - core.entitlement_snapshot
 */

import type { GroupSyncService } from "./group-sync.service.js";
import type { OUMembershipService } from "./ou-membership.service.js";
import type { RoleBindingService } from "./role-binding.service.js";
import type { DB } from "@athyper/adapter-db";
import type { Kysely } from "kysely";

/**
 * Entitlement snapshot
 */
export type EntitlementSnapshot = {
  principalId: string;
  tenantId: string;
  roles: Array<{
    code: string;
    name: string;
    scopeMode: string;
  }>;
  groups: Array<{
    code: string;
    name: string;
  }>;
  ouMembership?: {
    nodeId: string;
    path: string;
    name: string;
  };
  attributes: Record<string, string>;
  generatedAt: Date;
  expiresAt: Date;
};

/**
 * Default TTL in seconds (1 hour)
 */
const DEFAULT_TTL_SECONDS = 3600;

/**
 * Entitlement Snapshot Service
 */
export class EntitlementSnapshotService {
  constructor(
    private readonly db: Kysely<DB>,
    private readonly roleBindingService: RoleBindingService,
    private readonly groupSyncService: GroupSyncService,
    private readonly ouMembershipService: OUMembershipService
  ) {}

  /**
   * Generate entitlement snapshot for principal
   */
  async generateSnapshot(
    principalId: string,
    tenantId: string,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
  ): Promise<EntitlementSnapshot> {
    // 1. Get roles (direct + inherited from groups)
    const rolesWithBindings = await this.roleBindingService.getPrincipalRoles(
      principalId,
      tenantId
    );

    // 2. Get groups
    const groups = await this.groupSyncService.getPrincipalGroups(principalId);

    // 3. Get OU membership
    const ouNode = await this.ouMembershipService.getPrincipalOU(principalId);

    // 4. Get all attributes
    const attributesArray = await this.ouMembershipService.getPrincipalAttributes(
      principalId
    );
    const attributes: Record<string, string> = {};
    for (const attr of attributesArray) {
      attributes[attr.key] = attr.value;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    const snapshot: EntitlementSnapshot = {
      principalId,
      tenantId,
      roles: rolesWithBindings.map((r) => ({
        code: r.code,
        name: r.name,
        scopeMode: r.scopeMode,
      })),
      groups: groups.map((g) => ({
        code: g.code,
        name: g.name,
      })),
      ouMembership: ouNode
        ? {
            nodeId: ouNode.id,
            path: ouNode.path,
            name: ouNode.name,
          }
        : undefined,
      attributes,
      generatedAt: now,
      expiresAt,
    };

    // Store snapshot
    await this.storeSnapshot(principalId, tenantId, snapshot, expiresAt);

    return snapshot;
  }

  /**
   * Store snapshot in database
   */
  private async storeSnapshot(
    principalId: string,
    tenantId: string,
    snapshot: EntitlementSnapshot,
    expiresAt: Date
  ): Promise<void> {
    const snapshotJson = JSON.stringify(snapshot);

    // Check if exists
    const existing = await this.db
      .selectFrom("core.entitlement_snapshot")
      .select("id")
      .where("tenant_id", "=", tenantId)
      .where("principal_id", "=", principalId)
      .executeTakeFirst();

    if (existing) {
      // Update
      await this.db
        .updateTable("core.entitlement_snapshot")
        .set({
          snapshot: snapshotJson,
          expires_at: expiresAt,
        })
        .where("id", "=", existing.id)
        .execute();
    } else {
      // Insert
      await this.db
        .insertInto("core.entitlement_snapshot")
        .values({
          id: crypto.randomUUID(),
          tenant_id: tenantId,
          principal_id: principalId,
          snapshot: snapshotJson,
          expires_at: expiresAt,
        })
        .execute();
    }

    console.log(
      JSON.stringify({
        msg: "entitlement_snapshot_stored",
        principalId,
        tenantId,
        expiresAt: expiresAt.toISOString(),
      })
    );
  }

  /**
   * Get cached snapshot (or generate if expired/missing)
   */
  async getOrGenerateSnapshot(
    principalId: string,
    tenantId: string,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
  ): Promise<EntitlementSnapshot> {
    const now = new Date();

    // Check cache
    const cached = await this.db
      .selectFrom("core.entitlement_snapshot")
      .select(["snapshot", "expires_at"])
      .where("tenant_id", "=", tenantId)
      .where("principal_id", "=", principalId)
      .where("expires_at", ">", now)
      .executeTakeFirst();

    if (cached) {
      console.log(
        JSON.stringify({
          msg: "entitlement_snapshot_cache_hit",
          principalId,
          tenantId,
        })
      );
      return cached.snapshot as EntitlementSnapshot;
    }

    // Cache miss - generate new
    console.log(
      JSON.stringify({
        msg: "entitlement_snapshot_cache_miss",
        principalId,
        tenantId,
      })
    );

    return this.generateSnapshot(principalId, tenantId, ttlSeconds);
  }

  /**
   * Get cached snapshot only (no regeneration)
   */
  async getCachedSnapshot(
    principalId: string,
    tenantId: string
  ): Promise<EntitlementSnapshot | undefined> {
    const now = new Date();

    const cached = await this.db
      .selectFrom("core.entitlement_snapshot")
      .select("snapshot")
      .where("tenant_id", "=", tenantId)
      .where("principal_id", "=", principalId)
      .where("expires_at", ">", now)
      .executeTakeFirst();

    return cached?.snapshot as EntitlementSnapshot | undefined;
  }

  /**
   * Invalidate snapshot (force regeneration on next access)
   */
  async invalidateSnapshot(principalId: string, tenantId: string): Promise<void> {
    await this.db
      .deleteFrom("core.entitlement_snapshot")
      .where("tenant_id", "=", tenantId)
      .where("principal_id", "=", principalId)
      .execute();

    console.log(
      JSON.stringify({
        msg: "entitlement_snapshot_invalidated",
        principalId,
        tenantId,
      })
    );
  }

  /**
   * Check if principal has a specific role
   */
  async hasRole(
    principalId: string,
    tenantId: string,
    roleCode: string
  ): Promise<boolean> {
    const snapshot = await this.getOrGenerateSnapshot(principalId, tenantId);
    return snapshot.roles.some((r) => r.code === roleCode);
  }

  /**
   * Check if principal is in a specific group
   */
  async isInGroup(
    principalId: string,
    tenantId: string,
    groupCode: string
  ): Promise<boolean> {
    const snapshot = await this.getOrGenerateSnapshot(principalId, tenantId);
    return snapshot.groups.some((g) => g.code === groupCode);
  }

  /**
   * Check if principal is in OU subtree
   */
  async isInOUSubtree(
    principalId: string,
    tenantId: string,
    ouPath: string
  ): Promise<boolean> {
    const snapshot = await this.getOrGenerateSnapshot(principalId, tenantId);
    if (!snapshot.ouMembership) return false;
    return snapshot.ouMembership.path.startsWith(ouPath);
  }

  /**
   * Cleanup expired snapshots
   */
  async cleanupExpiredSnapshots(): Promise<number> {
    const result = await this.db
      .deleteFrom("core.entitlement_snapshot")
      .where("expires_at", "<", new Date())
      .executeTakeFirst();

    const count = Number(result.numDeletedRows);

    console.log(
      JSON.stringify({
        msg: "expired_snapshots_cleaned",
        count,
      })
    );

    return count;
  }
}
