/**
 * OU Membership Service
 *
 * B5: OU Hierarchy & Membership
 * Manages organizational unit (OU) structure and principal membership
 *
 * Since there's no dedicated ou_member table, we use core.principal_attribute:
 * - attr_key='ou_node_id', attr_value=<uuid>
 * - attr_key='ou_path', attr_value=<materialized path>
 * - Additional ABAC attributes: department, cost_center, etc.
 *
 * Tables:
 * - core.ou_node
 * - core.principal_attribute
 */

import type { DB } from "@athyper/adapter-db";
import type { Kysely } from "kysely";

/**
 * OU Node information
 */
export type OUNodeInfo = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  parentId: string | null;
  path: string;
  depth: number;
  isActive: boolean;
};

/**
 * Principal attribute
 */
export type PrincipalAttributeInfo = {
  key: string;
  value: string;
  validFrom: Date | null;
  validUntil: Date | null;
};

/**
 * OU Membership Service
 */
export class OUMembershipService {
  constructor(private readonly db: Kysely<DB>) {}

  /**
   * Create OU node
   */
  async createOUNode(request: {
    tenantId: string;
    code: string;
    name: string;
    parentId?: string;
    createdBy: string;
  }): Promise<OUNodeInfo> {
    // Calculate path and depth
    let path: string;
    let depth: number;

    if (request.parentId) {
      const parent = await this.getOUNode(request.parentId);
      if (!parent) {
        throw new Error(`Parent OU node not found: ${request.parentId}`);
      }
      path = `${parent.path}/${request.code}`;
      depth = parent.depth + 1;
    } else {
      // Root node
      path = `/${request.code}`;
      depth = 0;
    }

    const id = crypto.randomUUID();
    await this.db
      .insertInto("core.ou_node")
      .values({
        id,
        tenant_id: request.tenantId,
        parent_id: request.parentId ?? null,
        code: request.code,
        name: request.name,
        path,
        depth,
        is_active: true,
        created_by: request.createdBy,
      })
      .execute();

    console.log(
      JSON.stringify({
        msg: "ou_node_created",
        id,
        tenantId: request.tenantId,
        code: request.code,
        path,
        depth,
      })
    );

    return {
      id,
      tenantId: request.tenantId,
      code: request.code,
      name: request.name,
      parentId: request.parentId ?? null,
      path,
      depth,
      isActive: true,
    };
  }

  /**
   * Get OU node by ID
   */
  async getOUNode(nodeId: string): Promise<OUNodeInfo | undefined> {
    const result = await this.db
      .selectFrom("core.ou_node")
      .select([
        "id",
        "tenant_id",
        "code",
        "name",
        "parent_id",
        "path",
        "depth",
        "is_active",
      ])
      .where("id", "=", nodeId)
      .executeTakeFirst();

    if (!result) return undefined;

    return {
      id: result.id,
      tenantId: result.tenant_id,
      code: result.code,
      name: result.name,
      parentId: result.parent_id,
      path: result.path,
      depth: result.depth,
      isActive: result.is_active,
    };
  }

  /**
   * Get OU node by code
   */
  async getOUNodeByCode(
    tenantId: string,
    code: string
  ): Promise<OUNodeInfo | undefined> {
    const result = await this.db
      .selectFrom("core.ou_node")
      .select([
        "id",
        "tenant_id",
        "code",
        "name",
        "parent_id",
        "path",
        "depth",
        "is_active",
      ])
      .where("tenant_id", "=", tenantId)
      .where("code", "=", code)
      .executeTakeFirst();

    if (!result) return undefined;

    return {
      id: result.id,
      tenantId: result.tenant_id,
      code: result.code,
      name: result.name,
      parentId: result.parent_id,
      path: result.path,
      depth: result.depth,
      isActive: result.is_active,
    };
  }

  /**
   * Assign principal to OU
   */
  async assignPrincipalToOU(
    principalId: string,
    tenantId: string,
    ouNodeId: string,
    createdBy: string
  ): Promise<void> {
    const node = await this.getOUNode(ouNodeId);
    if (!node) {
      throw new Error(`OU node not found: ${ouNodeId}`);
    }

    // Set ou_node_id attribute
    await this.setPrincipalAttribute(
      principalId,
      tenantId,
      "ou_node_id",
      ouNodeId,
      createdBy
    );

    // Set ou_path attribute for quick lookups
    await this.setPrincipalAttribute(
      principalId,
      tenantId,
      "ou_path",
      node.path,
      createdBy
    );

    console.log(
      JSON.stringify({
        msg: "principal_assigned_to_ou",
        principalId,
        ouNodeId,
        path: node.path,
      })
    );
  }

  /**
   * Remove principal from OU
   */
  async removePrincipalFromOU(principalId: string): Promise<void> {
    await this.db
      .deleteFrom("core.principal_attribute")
      .where("principal_id", "=", principalId)
      .where("attr_key", "in", ["ou_node_id", "ou_path"])
      .execute();

    console.log(
      JSON.stringify({
        msg: "principal_removed_from_ou",
        principalId,
      })
    );
  }

  /**
   * Get principal's OU
   */
  async getPrincipalOU(principalId: string): Promise<OUNodeInfo | undefined> {
    const attr = await this.getPrincipalAttribute(principalId, "ou_node_id");
    if (!attr) return undefined;

    return this.getOUNode(attr.value);
  }

  /**
   * Set principal attribute
   */
  async setPrincipalAttribute(
    principalId: string,
    tenantId: string,
    key: string,
    value: string,
    createdBy: string,
    validFrom?: Date,
    validUntil?: Date
  ): Promise<void> {
    // Upsert: try to update first, then insert if not exists
    const existing = await this.getPrincipalAttribute(principalId, key);

    if (existing) {
      await this.db
        .updateTable("core.principal_attribute")
        .set({
          attr_value: value,
          valid_from: validFrom ?? null,
          valid_until: validUntil ?? null,
        })
        .where("principal_id", "=", principalId)
        .where("attr_key", "=", key)
        .execute();
    } else {
      await this.db
        .insertInto("core.principal_attribute")
        .values({
          id: crypto.randomUUID(),
          tenant_id: tenantId,
          principal_id: principalId,
          attr_key: key,
          attr_value: value,
          valid_from: validFrom ?? null,
          valid_until: validUntil ?? null,
          created_by: createdBy,
        })
        .execute();
    }
  }

  /**
   * Get principal attribute
   */
  async getPrincipalAttribute(
    principalId: string,
    key: string
  ): Promise<PrincipalAttributeInfo | undefined> {
    const now = new Date();
    const result = await this.db
      .selectFrom("core.principal_attribute")
      .select(["attr_key", "attr_value", "valid_from", "valid_until"])
      .where("principal_id", "=", principalId)
      .where("attr_key", "=", key)
      .where((eb) =>
        eb.or([eb("valid_from", "is", null), eb("valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("valid_until", "is", null), eb("valid_until", ">", now)])
      )
      .executeTakeFirst();

    if (!result) return undefined;

    return {
      key: result.attr_key,
      value: result.attr_value,
      validFrom: result.valid_from,
      validUntil: result.valid_until,
    };
  }

  /**
   * Get all principal attributes
   */
  async getPrincipalAttributes(
    principalId: string
  ): Promise<PrincipalAttributeInfo[]> {
    const now = new Date();
    const results = await this.db
      .selectFrom("core.principal_attribute")
      .select(["attr_key", "attr_value", "valid_from", "valid_until"])
      .where("principal_id", "=", principalId)
      .where((eb) =>
        eb.or([eb("valid_from", "is", null), eb("valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("valid_until", "is", null), eb("valid_until", ">", now)])
      )
      .execute();

    return results.map((r) => ({
      key: r.attr_key,
      value: r.attr_value,
      validFrom: r.valid_from,
      validUntil: r.valid_until,
    }));
  }

  /**
   * Set multiple principal attributes
   */
  async setPrincipalAttributes(
    principalId: string,
    tenantId: string,
    attributes: Record<string, string>,
    createdBy: string
  ): Promise<void> {
    for (const [key, value] of Object.entries(attributes)) {
      await this.setPrincipalAttribute(principalId, tenantId, key, value, createdBy);
    }
  }

  /**
   * List OU nodes by tenant
   */
  async listOUNodes(
    tenantId: string,
    filters?: {
      parentId?: string | null;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<OUNodeInfo[]> {
    let query = this.db
      .selectFrom("core.ou_node")
      .select([
        "id",
        "tenant_id",
        "code",
        "name",
        "parent_id",
        "path",
        "depth",
        "is_active",
      ])
      .where("tenant_id", "=", tenantId);

    if (filters?.parentId !== undefined) {
      if (filters.parentId === null) {
        query = query.where("parent_id", "is", null);
      } else {
        query = query.where("parent_id", "=", filters.parentId);
      }
    }

    if (filters?.isActive !== undefined) {
      query = query.where("is_active", "=", filters.isActive);
    }

    const results = await query
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0)
      .orderBy("path", "asc")
      .execute();

    return results.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      code: r.code,
      name: r.name,
      parentId: r.parent_id,
      path: r.path,
      depth: r.depth,
      isActive: r.is_active,
    }));
  }

  /**
   * Get OU subtree (all descendants)
   */
  async getOUSubtree(nodeId: string): Promise<OUNodeInfo[]> {
    const node = await this.getOUNode(nodeId);
    if (!node) return [];

    const results = await this.db
      .selectFrom("core.ou_node")
      .select([
        "id",
        "tenant_id",
        "code",
        "name",
        "parent_id",
        "path",
        "depth",
        "is_active",
      ])
      .where("tenant_id", "=", node.tenantId)
      .where("path", "like", `${node.path}%`)
      .orderBy("path", "asc")
      .execute();

    return results.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      code: r.code,
      name: r.name,
      parentId: r.parent_id,
      path: r.path,
      depth: r.depth,
      isActive: r.is_active,
    }));
  }
}
