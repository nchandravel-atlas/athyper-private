/**
 * Audit Logger Service Implementation
 *
 * PostgreSQL-backed audit logging for META Engine.
 * Records all metadata changes and policy decisions.
 */

import type { DB } from "@athyper/adapter-db";
import type {
  AuditLogger,
  AuditEvent,
  AuditQueryFilters,
  ListOptions,
  PaginatedResponse,
  HealthCheckResult,
} from "@athyper/core/meta";
import type { Kysely } from "kysely";

/**
 * Audit Logger Service
 * Implements append-only audit logging to PostgreSQL
 */
export class AuditLoggerService implements AuditLogger {
  constructor(private readonly db: Kysely<DB>) {}

  async log(
    event: Omit<AuditEvent, "eventId" | "timestamp">
  ): Promise<void> {
    await this.db
      .insertInto("meta.meta_audit")
      .values({
        id: crypto.randomUUID(),
        event_id: this.generateEventId(),
        event_type: event.eventType,
        timestamp: new Date(),
        user_id: event.userId,
        tenant_id: event.tenantId,
        realm_id: event.realmId,
        action: event.action,
        resource: event.resource,
        details: event.details ? JSON.stringify(event.details) : null,
        result: event.result,
        error_message: event.errorMessage ?? null,
      })
      .execute();
  }

  async query(
    filters: AuditQueryFilters
  ): Promise<PaginatedResponse<AuditEvent>> {
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const offset = (page - 1) * pageSize;

    // Build query
    let query = this.db.selectFrom("meta.meta_audit").selectAll();

    // Apply filters
    if (filters.eventType) {
      if (Array.isArray(filters.eventType)) {
        query = query.where("event_type", "in", filters.eventType);
      } else {
        query = query.where("event_type", "=", filters.eventType);
      }
    }

    if (filters.userId) {
      query = query.where("user_id", "=", filters.userId);
    }

    if (filters.tenantId) {
      query = query.where("tenant_id", "=", filters.tenantId);
    }

    if (filters.resource) {
      query = query.where("resource", "=", filters.resource);
    }

    if (filters.result) {
      query = query.where("result", "=", filters.result);
    }

    if (filters.startDate) {
      query = query.where("timestamp", ">=", filters.startDate);
    }

    if (filters.endDate) {
      query = query.where("timestamp", "<=", filters.endDate);
    }

    // Order by timestamp desc
    query = query.orderBy("timestamp", "desc");

    // Execute count and data queries
    const [countResult, data] = await Promise.all([
      this.db
        .selectFrom("meta.meta_audit")
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirstOrThrow(),
      query.limit(pageSize).offset(offset).execute(),
    ]);

    const total = Number(countResult.count);
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data.map((e) => this.mapEventFromDb(e)),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getEvent(eventId: string): Promise<AuditEvent | undefined> {
    const event = await this.db
      .selectFrom("meta.meta_audit")
      .selectAll()
      .where("event_id", "=", eventId)
      .executeTakeFirst();

    return event ? this.mapEventFromDb(event) : undefined;
  }

  async getRecent(limit: number = 10): Promise<AuditEvent[]> {
    const events = await this.db
      .selectFrom("meta.meta_audit")
      .selectAll()
      .orderBy("timestamp", "desc")
      .limit(Math.min(limit, 100))
      .execute();

    return events.map((e) => this.mapEventFromDb(e));
  }

  async getResourceAudit(
    resource: string,
    options: ListOptions = {}
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.query({
      resource,
      page: options.page,
      pageSize: options.pageSize,
    });
  }

  async getUserAudit(
    userId: string,
    options: ListOptions = {}
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.query({
      userId,
      page: options.page,
      pageSize: options.pageSize,
    });
  }

  async getTenantAudit(
    tenantId: string,
    options: ListOptions = {}
  ): Promise<PaginatedResponse<AuditEvent>> {
    return this.query({
      tenantId,
      page: options.page,
      pageSize: options.pageSize,
    });
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      // Try to query the audit table
      await this.db
        .selectFrom("meta.meta_audit")
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirst();

      return {
        healthy: true,
        message: "Audit Logger healthy",
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Audit Logger unhealthy: ${String(error)}`,
        details: { error: String(error) },
      };
    }
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private generateEventId(): string {
    // Generate event ID: evt_<timestamp>_<random>
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `evt_${timestamp}_${random}`;
  }

  private mapEventFromDb(dbEvent: any): AuditEvent {
    return {
      eventId: dbEvent.event_id,
      eventType: dbEvent.event_type,
      timestamp: new Date(dbEvent.timestamp),
      userId: dbEvent.user_id,
      tenantId: dbEvent.tenant_id,
      realmId: dbEvent.realm_id,
      action: dbEvent.action,
      resource: dbEvent.resource,
      details:
        typeof dbEvent.details === "string"
          ? JSON.parse(dbEvent.details)
          : dbEvent.details,
      result: dbEvent.result,
      errorMessage: dbEvent.error_message ?? undefined,
    };
  }
}
