/**
 * Audit Explainability Service
 *
 * "Explain this event" — resolves a correlation_id into a full event
 * chain with workflow context, trace links, and human-readable summaries.
 */

import type { Kysely } from "kysely";
import { sql } from "kysely";
import type { DB } from "@athyper/adapter-db";

// ============================================================================
// Types
// ============================================================================

export interface EventExplanation {
  correlationId: string;
  events: ExplainedEvent[];
  workflowInstance?: {
    instanceId: string;
    workflowName?: string;
    status?: string;
  };
  traceUrl?: string;
}

export interface ExplainedEvent {
  id: string;
  eventType: string;
  severity: string;
  actorUserId?: string;
  timestamp: Date;
  summary: string;
  traceId?: string;
}

export interface ExplainabilityConfig {
  traceBaseUrl?: string;
}

// ============================================================================
// Service
// ============================================================================

export class AuditExplainabilityService {
  constructor(
    private readonly db: Kysely<DB>,
    private readonly config: ExplainabilityConfig = {},
  ) {}

  /**
   * Explain an audit event chain by correlation_id.
   */
  async explain(tenantId: string, correlationId: string): Promise<EventExplanation> {
    // 1. Get all events with this correlation_id
    const eventsResult = await sql<any>`
      SELECT id, event_type, severity, actor_user_id, event_timestamp,
             comment, instance_id, trace_id
      FROM core.workflow_event_log
      WHERE tenant_id = ${tenantId}::uuid
        AND correlation_id = ${correlationId}
      ORDER BY event_timestamp ASC
    `.execute(this.db);

    const events: ExplainedEvent[] = (eventsResult.rows ?? []).map((r: any) => ({
      id: r.id,
      eventType: r.event_type,
      severity: r.severity ?? "info",
      actorUserId: r.actor_user_id ?? undefined,
      timestamp: new Date(r.event_timestamp),
      summary: r.comment ?? r.event_type,
      traceId: r.trace_id ?? undefined,
    }));

    // 2. Try to resolve workflow instance
    let workflowInstance: EventExplanation["workflowInstance"];
    if (events.length > 0) {
      const firstEvent = eventsResult.rows[0];
      if (firstEvent?.instance_id) {
        workflowInstance = await this.resolveWorkflowInstance(firstEvent.instance_id);
      }
    }

    // 3. Build trace URL
    let traceUrl: string | undefined;
    const traceId = events.find((e) => e.traceId)?.traceId;
    if (traceId && this.config.traceBaseUrl) {
      traceUrl = `${this.config.traceBaseUrl}/trace/${traceId}`;
    }

    return {
      correlationId,
      events,
      workflowInstance,
      traceUrl,
    };
  }

  private async resolveWorkflowInstance(
    instanceId: string,
  ): Promise<EventExplanation["workflowInstance"] | undefined> {
    try {
      const result = await sql<any>`
        SELECT id, status
        FROM core.approval_instance
        WHERE id = ${instanceId}::uuid
        LIMIT 1
      `.execute(this.db);

      const row = result.rows?.[0];
      if (!row) return undefined;

      return {
        instanceId: row.id,
        status: row.status,
      };
    } catch {
      // Table may not exist in test env
      return undefined;
    }
  }
}
