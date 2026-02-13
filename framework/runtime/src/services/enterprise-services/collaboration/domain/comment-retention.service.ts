/**
 * Comment Retention Service
 *
 * Manages comment retention policies, archival, and cleanup.
 */

import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";
import type { Logger } from "../../../../kernel/logger.js";
import type { AuditWriter } from "../../../../kernel/audit.js";

/**
 * Retention Policy
 */
export interface RetentionPolicy {
  id: string;
  tenantId: string;
  policyName: string;
  entityType?: string;
  retentionDays: number;
  action: 'archive' | 'hard_delete' | 'keep';
  enabled: boolean;
}

/**
 * Retention Stats
 */
export interface RetentionStats {
  totalComments: number;
  archivedComments: number;
  deletedComments: number;
  pendingRetention: number;
}

/**
 * Comment Retention Service
 */
export class CommentRetentionService {
  constructor(
    private readonly db: Kysely<DB>,
    private readonly auditWriter: AuditWriter,
    private readonly logger: Logger
  ) {}

  /**
   * Create or update retention policy
   */
  async setRetentionPolicy(
    tenantId: string,
    policyName: string,
    retentionDays: number,
    action: 'archive' | 'hard_delete' | 'keep',
    entityType?: string
  ): Promise<RetentionPolicy> {
    const id = crypto.randomUUID();
    const now = new Date();

    const row = await this.db
      .insertInto("core.comment_retention_policy")
      .values({
        id,
        tenant_id: tenantId,
        policy_name: policyName,
        entity_type: entityType ?? null,
        retention_days: retentionDays,
        action,
        enabled: true,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    this.logger.info(
      {
        policyId: id,
        policyName,
        retentionDays,
        action,
      },
      "[collab] Retention policy created"
    );

    return {
      id: row.id,
      tenantId: row.tenant_id,
      policyName: row.policy_name,
      entityType: row.entity_type ?? undefined,
      retentionDays: row.retention_days,
      action: row.action as any,
      enabled: row.enabled,
    };
  }

  /**
   * Get active retention policies
   */
  async getActivePolicies(tenantId: string): Promise<RetentionPolicy[]> {
    const rows = await this.db
      .selectFrom("core.comment_retention_policy")
      .selectAll()
      .where("tenant_id", "=", tenantId)
      .where("enabled", "=", true)
      .execute();

    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      policyName: row.policy_name,
      entityType: row.entity_type ?? undefined,
      retentionDays: row.retention_days,
      action: row.action as any,
      enabled: row.enabled,
    }));
  }

  /**
   * Apply retention policies (scheduled job)
   *
   * Processes comments eligible for archival/deletion based on policies.
   */
  async applyRetentionPolicies(tenantId: string): Promise<{
    archived: number;
    deleted: number;
  }> {
    const policies = await this.getActivePolicies(tenantId);
    let archivedCount = 0;
    let deletedCount = 0;

    for (const policy of policies) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      if (policy.action === 'archive') {
        const count = await this.archiveOldComments(tenantId, cutoffDate, policy.entityType, policy.id);
        archivedCount += count;
      } else if (policy.action === 'hard_delete') {
        const count = await this.hardDeleteOldComments(tenantId, cutoffDate, policy.entityType, policy.id);
        deletedCount += count;
      }
    }

    this.logger.info(
      {
        tenantId,
        policiesApplied: policies.length,
        archivedCount,
        deletedCount,
      },
      "[collab] Retention policies applied"
    );

    return { archived: archivedCount, deleted: deletedCount };
  }

  /**
   * Archive old comments
   */
  async archiveOldComments(
    tenantId: string,
    cutoffDate: Date,
    entityType?: string,
    policyId?: string
  ): Promise<number> {
    const now = new Date();

    // Build query
    let query = this.db
      .updateTable("core.entity_comment")
      .set({
        archived_at: now,
        archived_by: 'system',
        retention_policy_id: policyId ?? null,
      })
      .where("tenant_id", "=", tenantId)
      .where("created_at", "<", cutoffDate)
      .where("archived_at", "is", null)
      .where("deleted_at", "is", null);

    if (entityType) {
      query = query.where("entity_type", "=", entityType);
    }

    const result = await query.execute();
    const count = Number(result[0]?.numUpdatedRows ?? 0);

    if (count > 0) {
      await this.auditWriter.write({
        ts: now.toISOString(),
        type: "comment.retention.archived",
        level: "info",
        actor: { kind: "system", id: "retention-service" },
        meta: {
          tenantId,
          count,
          cutoffDate: cutoffDate.toISOString(),
          policyId,
        },
      });
    }

    return count;
  }

  /**
   * Hard delete old comments (permanent)
   */
  async hardDeleteOldComments(
    tenantId: string,
    cutoffDate: Date,
    entityType?: string,
    policyId?: string
  ): Promise<number> {
    const now = new Date();

    // Build query
    let query = this.db
      .deleteFrom("core.entity_comment")
      .where("tenant_id", "=", tenantId)
      .where("created_at", "<", cutoffDate)
      .where("deleted_at", "is", null);

    if (entityType) {
      query = query.where("entity_type", "=", entityType);
    }

    const result = await query.execute();
    const count = Number(result[0]?.numDeletedRows ?? 0);

    if (count > 0) {
      await this.auditWriter.write({
        ts: now.toISOString(),
        type: "comment.retention.hard_deleted",
        level: "warning",
        actor: { kind: "system", id: "retention-service" },
        meta: {
          tenantId,
          count,
          cutoffDate: cutoffDate.toISOString(),
          policyId,
        },
      });

      this.logger.warn(
        {
          tenantId,
          count,
          cutoffDate: cutoffDate.toISOString(),
        },
        "[collab] Comments hard deleted by retention policy"
      );
    }

    return count;
  }

  /**
   * Restore archived comment
   */
  async restoreArchivedComment(
    tenantId: string,
    commentId: string,
    restoredBy: string
  ): Promise<void> {
    await this.db
      .updateTable("core.entity_comment")
      .set({
        archived_at: null,
        archived_by: null,
        retention_policy_id: null,
      })
      .where("id", "=", commentId)
      .where("tenant_id", "=", tenantId)
      .execute();

    await this.auditWriter.write({
      ts: new Date().toISOString(),
      type: "comment.retention.restored",
      level: "info",
      actor: { kind: "user", id: restoredBy },
      meta: {
        tenantId,
        commentId,
      },
    });

    this.logger.info(
      { commentId, restoredBy },
      "[collab] Archived comment restored"
    );
  }

  /**
   * Get retention statistics
   */
  async getRetentionStats(tenantId: string): Promise<RetentionStats> {
    const [totalResult, archivedResult, deletedResult] = await Promise.all([
      this.db
        .selectFrom("core.entity_comment")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("tenant_id", "=", tenantId)
        .executeTakeFirst(),

      this.db
        .selectFrom("core.entity_comment")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("tenant_id", "=", tenantId)
        .where("archived_at", "is not", null)
        .executeTakeFirst(),

      this.db
        .selectFrom("core.entity_comment")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("tenant_id", "=", tenantId)
        .where("deleted_at", "is not", null)
        .executeTakeFirst(),
    ]);

    const total = Number(totalResult?.count ?? 0);
    const archived = Number(archivedResult?.count ?? 0);
    const deleted = Number(deletedResult?.count ?? 0);

    return {
      totalComments: total,
      archivedComments: archived,
      deletedComments: deleted,
      pendingRetention: total - archived - deleted,
    };
  }

  /**
   * Bulk archive comments by entity
   */
  async archiveCommentsByEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
    archivedBy: string
  ): Promise<number> {
    const now = new Date();

    const result = await this.db
      .updateTable("core.entity_comment")
      .set({
        archived_at: now,
        archived_by: archivedBy,
      })
      .where("tenant_id", "=", tenantId)
      .where("entity_type", "=", entityType)
      .where("entity_id", "=", entityId)
      .where("archived_at", "is", null)
      .where("deleted_at", "is", null)
      .execute();

    const count = Number(result[0]?.numUpdatedRows ?? 0);

    if (count > 0) {
      await this.auditWriter.write({
        ts: now.toISOString(),
        type: "comment.retention.bulk_archived",
        level: "info",
        actor: { kind: "user", id: archivedBy },
        meta: {
          tenantId,
          entityType,
          entityId,
          count,
        },
      });
    }

    return count;
  }
}
