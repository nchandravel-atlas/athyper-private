/**
 * DocumentAclRepo - Repository for per-document access control lists
 *
 * Handles:
 * - Grant/revoke permissions for users or roles
 * - Permission types: read, download, delete, share
 * - Expiration dates for temporary access
 * - XOR constraint (principalId OR roleId, not both)
 */

import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";

export interface CreateAclParams {
  tenantId: string;
  attachmentId: string;
  principalId?: string;
  roleId?: string;
  permission: "read" | "download" | "delete" | "share";
  granted: boolean;
  grantedBy: string;
  expiresAt?: Date;
}

export interface DocumentAcl {
  id: string;
  tenantId: string;
  attachmentId: string;
  principalId: string | null;
  roleId: string | null;
  permission: "read" | "download" | "delete" | "share";
  granted: boolean;
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date | null;
}

export class DocumentAclRepo {
  constructor(private db: Kysely<DB>) {}

  /**
   * Create ACL entry
   */
  async create(params: CreateAclParams): Promise<DocumentAcl> {
    // Validate XOR constraint
    if (!params.principalId && !params.roleId) {
      throw new Error("Either principalId or roleId must be provided");
    }
    if (params.principalId && params.roleId) {
      throw new Error("Cannot specify both principalId and roleId");
    }

    const result = await this.db
      .insertInto("core.document_acl as acl")
      .values({
        tenant_id: params.tenantId,
        attachment_id: params.attachmentId,
        principal_id: params.principalId ?? null,
        role_id: params.roleId ?? null,
        permission: params.permission,
        granted: params.granted,
        granted_by: params.grantedBy,
        granted_at: new Date(),
        expires_at: params.expiresAt ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToAcl(result);
  }

  /**
   * Get ACL entry by ID
   */
  async getById(id: string, tenantId: string): Promise<DocumentAcl | null> {
    const result = await this.db
      .selectFrom("core.document_acl as acl")
      .selectAll()
      .where("acl.id", "=", id)
      .where("acl.tenant_id", "=", tenantId)
      .executeTakeFirst();

    return result ? this.mapToAcl(result) : null;
  }

  /**
   * Delete ACL entry
   */
  async delete(id: string, tenantId: string): Promise<void> {
    await this.db
      .deleteFrom("core.document_acl as acl")
      .where("acl.id", "=", id)
      .where("acl.tenant_id", "=", tenantId)
      .execute();
  }

  /**
   * List ACLs for a document
   */
  async listByAttachment(
    tenantId: string,
    attachmentId: string,
    options?: { activeOnly?: boolean },
  ): Promise<DocumentAcl[]> {
    let query = this.db
      .selectFrom("core.document_acl as acl")
      .selectAll()
      .where("acl.tenant_id", "=", tenantId)
      .where("acl.attachment_id", "=", attachmentId);

    if (options?.activeOnly) {
      const now = new Date();
      query = query.where((eb) =>
        eb.or([
          eb("acl.expires_at", "is", null),
          eb("acl.expires_at", ">", now),
        ]),
      );
    }

    query = query.orderBy("acl.granted_at", "desc");

    const results = await query.execute();
    return results.map((r) => this.mapToAcl(r));
  }

  /**
   * Check if principal has permission
   * Returns true if any of the following:
   * - Principal has direct grant for permission
   * - Principal belongs to role that has grant for permission
   */
  async checkPermission(
    tenantId: string,
    attachmentId: string,
    principalId: string,
    permission: "read" | "download" | "delete" | "share",
    principalRoleIds?: string[],
  ): Promise<boolean> {
    const now = new Date();

    let query = this.db
      .selectFrom("core.document_acl as acl")
      .select("acl.granted")
      .where("acl.tenant_id", "=", tenantId)
      .where("acl.attachment_id", "=", attachmentId)
      .where("acl.permission", "=", permission)
      .where((eb) =>
        eb.or([
          eb("acl.expires_at", "is", null),
          eb("acl.expires_at", ">", now),
        ]),
      );

    // Check principal or their roles
    if (principalRoleIds && principalRoleIds.length > 0) {
      query = query.where((eb) =>
        eb.or([
          eb("acl.principal_id", "=", principalId),
          eb("acl.role_id", "in", principalRoleIds),
        ]),
      );
    } else {
      query = query.where("acl.principal_id", "=", principalId);
    }

    const results = await query.execute();

    // If any grant is true, permission is granted
    // If any grant is false (explicit deny), permission is denied
    // Explicit deny takes precedence
    const hasExplicitDeny = results.some((r) => r.granted === false);
    if (hasExplicitDeny) return false;

    const hasExplicitGrant = results.some((r) => r.granted === true);
    return hasExplicitGrant;
  }

  /**
   * Revoke all permissions for a principal on a document
   */
  async revokeAllForPrincipal(
    tenantId: string,
    attachmentId: string,
    principalId: string,
  ): Promise<void> {
    await this.db
      .deleteFrom("core.document_acl as acl")
      .where("acl.tenant_id", "=", tenantId)
      .where("acl.attachment_id", "=", attachmentId)
      .where("acl.principal_id", "=", principalId)
      .execute();
  }

  /**
   * Upsert ACL entry (update if exists, insert if not)
   * Useful for toggling permissions
   */
  async upsert(params: CreateAclParams): Promise<DocumentAcl> {
    // First check if entry exists
    const existing = await this.db
      .selectFrom("core.document_acl as acl")
      .selectAll()
      .where("acl.tenant_id", "=", params.tenantId)
      .where("acl.attachment_id", "=", params.attachmentId)
      .where("acl.permission", "=", params.permission)
      .where((eb) => {
        if (params.principalId) {
          return eb("acl.principal_id", "=", params.principalId);
        } else {
          return eb("acl.role_id", "=", params.roleId!);
        }
      })
      .executeTakeFirst();

    if (existing) {
      // Update existing entry
      const result = await this.db
        .updateTable("core.document_acl as acl")
        .set({
          granted: params.granted,
          granted_by: params.grantedBy,
          granted_at: new Date(),
          expires_at: params.expiresAt ?? null,
        })
        .where("acl.id", "=", existing.id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return this.mapToAcl(result);
    } else {
      // Create new entry
      return this.create(params);
    }
  }

  /**
   * Delete expired ACL entries (cleanup job)
   */
  async deleteExpired(tenantId: string, beforeDate: Date): Promise<number> {
    const result = await this.db
      .deleteFrom("core.document_acl as acl")
      .where("acl.tenant_id", "=", tenantId)
      .where("acl.expires_at", "is not", null)
      .where("acl.expires_at", "<", beforeDate)
      .execute();

    return result.length > 0 ? (result[0] as any).numDeletedRows ?? 0 : 0;
  }

  /**
   * Delete all ACLs for an attachment (when deleting document)
   */
  async deleteByAttachment(tenantId: string, attachmentId: string): Promise<void> {
    await this.db
      .deleteFrom("core.document_acl as acl")
      .where("acl.tenant_id", "=", tenantId)
      .where("acl.attachment_id", "=", attachmentId)
      .execute();
  }

  /**
   * Map database row to DocumentAcl domain object
   */
  private mapToAcl(row: any): DocumentAcl {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      attachmentId: row.attachment_id,
      principalId: row.principal_id,
      roleId: row.role_id,
      permission: row.permission,
      granted: row.granted,
      grantedBy: row.granted_by,
      grantedAt: new Date(row.granted_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    };
  }
}
