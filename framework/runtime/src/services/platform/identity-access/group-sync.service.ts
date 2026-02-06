/**
 * Group Sync Service
 *
 * B3: Groups Model
 * Manages groups and group memberships
 *
 * Hybrid approach:
 * - Keycloak groups → synced into core.group with source_type='idp'
 * - Local athyper groups → source_type='local'
 * - Import groups → source_type='import'
 * - Membership snapshots → core.group_member
 *
 * Tables:
 * - core.group
 * - core.group_member
 */

import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";

/**
 * Group source type (matches DB constraint)
 */
export type GroupSourceType = "idp" | "local" | "import";

/**
 * Group information
 */
export type GroupInfo = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  sourceType: GroupSourceType;
  sourceRef: string | null;
  isActive: boolean;
};

/**
 * Group membership
 */
export type GroupMemberInfo = {
  id: string;
  groupId: string;
  principalId: string;
  validFrom: Date | null;
  validUntil: Date | null;
};

/**
 * Group Sync Service
 */
export class GroupSyncService {
  constructor(private readonly db: Kysely<DB>) {}

  /**
   * Sync IdP group (create or update)
   */
  async syncIdpGroup(
    tenantId: string,
    groupCode: string,
    groupName: string,
    sourceRef: string,
    createdBy: string = "system"
  ): Promise<GroupInfo> {
    // Check if exists by source_ref
    const existing = await this.getGroupBySourceRef(tenantId, sourceRef);

    if (existing) {
      // Update name if changed
      if (existing.name !== groupName) {
        await this.db
          .updateTable("core.group")
          .set({ name: groupName })
          .where("id", "=", existing.id)
          .execute();
      }
      return { ...existing, name: groupName };
    }

    // Create new
    const id = crypto.randomUUID();
    await this.db
      .insertInto("core.group")
      .values({
        id,
        tenant_id: tenantId,
        code: groupCode,
        name: groupName,
        source_type: "idp",
        source_ref: sourceRef,
        is_active: true,
        created_by: createdBy,
      })
      .execute();

    console.log(
      JSON.stringify({
        msg: "idp_group_created",
        id,
        tenantId,
        code: groupCode,
        sourceRef,
      })
    );

    return {
      id,
      tenantId,
      code: groupCode,
      name: groupName,
      sourceType: "idp",
      sourceRef,
      isActive: true,
    };
  }

  /**
   * Create local group
   */
  async createLocalGroup(
    tenantId: string,
    code: string,
    name: string,
    createdBy: string
  ): Promise<GroupInfo> {
    const id = crypto.randomUUID();
    await this.db
      .insertInto("core.group")
      .values({
        id,
        tenant_id: tenantId,
        code,
        name,
        source_type: "local",
        is_active: true,
        created_by: createdBy,
      })
      .execute();

    console.log(
      JSON.stringify({
        msg: "local_group_created",
        id,
        tenantId,
        code,
      })
    );

    return {
      id,
      tenantId,
      code,
      name,
      sourceType: "local",
      sourceRef: null,
      isActive: true,
    };
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId: string): Promise<GroupInfo | undefined> {
    const result = await this.db
      .selectFrom("core.group")
      .select([
        "id",
        "tenant_id",
        "code",
        "name",
        "source_type",
        "source_ref",
        "is_active",
      ])
      .where("id", "=", groupId)
      .executeTakeFirst();

    if (!result) return undefined;

    return {
      id: result.id,
      tenantId: result.tenant_id,
      code: result.code,
      name: result.name,
      sourceType: result.source_type as GroupSourceType,
      sourceRef: result.source_ref,
      isActive: result.is_active,
    };
  }

  /**
   * Get group by source ref
   */
  private async getGroupBySourceRef(
    tenantId: string,
    sourceRef: string
  ): Promise<GroupInfo | undefined> {
    const result = await this.db
      .selectFrom("core.group")
      .select([
        "id",
        "tenant_id",
        "code",
        "name",
        "source_type",
        "source_ref",
        "is_active",
      ])
      .where("tenant_id", "=", tenantId)
      .where("source_ref", "=", sourceRef)
      .executeTakeFirst();

    if (!result) return undefined;

    return {
      id: result.id,
      tenantId: result.tenant_id,
      code: result.code,
      name: result.name,
      sourceType: result.source_type as GroupSourceType,
      sourceRef: result.source_ref,
      isActive: result.is_active,
    };
  }

  /**
   * Sync group members (full sync)
   */
  async syncGroupMembers(
    groupId: string,
    tenantId: string,
    principalIds: string[],
    createdBy: string = "system"
  ): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      // Get current members
      const current = await trx
        .selectFrom("core.group_member")
        .select("principal_id")
        .where("group_id", "=", groupId)
        .execute();

      const currentSet = new Set(current.map((m) => m.principal_id));
      const newSet = new Set(principalIds);

      // Remove members no longer in list
      const toRemove = [...currentSet].filter((id) => !newSet.has(id));
      if (toRemove.length > 0) {
        await trx
          .deleteFrom("core.group_member")
          .where("group_id", "=", groupId)
          .where("principal_id", "in", toRemove)
          .execute();
      }

      // Add new members
      const toAdd = principalIds.filter((id) => !currentSet.has(id));
      if (toAdd.length > 0) {
        await trx
          .insertInto("core.group_member")
          .values(
            toAdd.map((principalId) => ({
              id: crypto.randomUUID(),
              tenant_id: tenantId,
              group_id: groupId,
              principal_id: principalId,
              created_by: createdBy,
            }))
          )
          .execute();
      }

      console.log(
        JSON.stringify({
          msg: "group_members_synced",
          groupId,
          added: toAdd.length,
          removed: toRemove.length,
        })
      );
    });
  }

  /**
   * Add member to group
   */
  async addMember(
    groupId: string,
    tenantId: string,
    principalId: string,
    createdBy: string,
    validFrom?: Date,
    validUntil?: Date
  ): Promise<void> {
    await this.db
      .insertInto("core.group_member")
      .values({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        group_id: groupId,
        principal_id: principalId,
        valid_from: validFrom ?? null,
        valid_until: validUntil ?? null,
        created_by: createdBy,
      })
      .onConflict((oc) => oc.doNothing())
      .execute();
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, principalId: string): Promise<void> {
    await this.db
      .deleteFrom("core.group_member")
      .where("group_id", "=", groupId)
      .where("principal_id", "=", principalId)
      .execute();
  }

  /**
   * Get groups for principal
   */
  async getPrincipalGroups(principalId: string): Promise<GroupInfo[]> {
    const now = new Date();
    const results = await this.db
      .selectFrom("core.group_member as gm")
      .innerJoin("core.group as g", "g.id", "gm.group_id")
      .select([
        "g.id",
        "g.tenant_id",
        "g.code",
        "g.name",
        "g.source_type",
        "g.source_ref",
        "g.is_active",
      ])
      .where("gm.principal_id", "=", principalId)
      .where("g.is_active", "=", true)
      .where((eb) =>
        eb.or([
          eb("gm.valid_from", "is", null),
          eb("gm.valid_from", "<=", now),
        ])
      )
      .where((eb) =>
        eb.or([
          eb("gm.valid_until", "is", null),
          eb("gm.valid_until", ">", now),
        ])
      )
      .execute();

    return results.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      code: r.code,
      name: r.name,
      sourceType: r.source_type as GroupSourceType,
      sourceRef: r.source_ref,
      isActive: r.is_active,
    }));
  }

  /**
   * List groups by tenant
   */
  async listGroups(
    tenantId: string,
    filters?: {
      sourceType?: GroupSourceType;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<GroupInfo[]> {
    let query = this.db
      .selectFrom("core.group")
      .select([
        "id",
        "tenant_id",
        "code",
        "name",
        "source_type",
        "source_ref",
        "is_active",
      ])
      .where("tenant_id", "=", tenantId);

    if (filters?.sourceType) {
      query = query.where("source_type", "=", filters.sourceType);
    }

    if (filters?.isActive !== undefined) {
      query = query.where("is_active", "=", filters.isActive);
    }

    const results = await query
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0)
      .orderBy("name", "asc")
      .execute();

    return results.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      code: r.code,
      name: r.name,
      sourceType: r.source_type as GroupSourceType,
      sourceRef: r.source_ref,
      isActive: r.is_active,
    }));
  }
}
