# Audit & Governance Architecture

## Overview

The Audit & Governance module provides enterprise-grade audit trail capabilities for the athyper platform. It replaces the previous in-memory audit storage with durable, tamper-evident, privacy-aware PostgreSQL-backed persistence.

### Compliance Requirements

- **Durability**: All audit events survive process restarts and are persisted to PostgreSQL
- **Immutability**: Audit records cannot be modified or deleted (enforced by DB triggers)
- **Tamper Evidence**: Cryptographic hash chain detects unauthorized modifications
- **Privacy**: PII is redacted before persistence; sensitive fields are masked
- **Tenant Isolation**: All queries are tenant-scoped; cross-tenant access is impossible
- **Auditability**: Audit access itself is logged (audit-of-audit)

## Data Flow

```
Workflow Engine
       │
       ▼
 ResilientAuditWriter          (never throws)
       │
       ├──→ AuditRedactionPipeline   (strip PII, denylist keys)
       ├──→ AuditHashChainService    (compute hash_prev/hash_curr)
       ├──→ AuditRateLimiter         (backpressure check)
       │
       ▼
 CircuitBreaker.execute()
       │
       ├── OK ──→ AuditOutboxRepo.enqueue()     ──→ core.audit_outbox
       │
       └── OPEN ──→ Memory Buffer (bounded)      ──→ flush on recovery
                          │
                          ▼
              Metric: audit_events_buffered

                    ┌──────────────────┐
                    │  BullMQ Worker   │
                    │ drain-audit-outbox│
                    └──────┬───────────┘
                           │
                           ▼
              WorkflowAuditRepository.recordEvent()
                           │
                           ▼
              core.workflow_audit_event  (partitioned)
```

## Table Schemas

### core.workflow_audit_event (partitioned by month)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Event ID |
| tenant_id | UUID FK | Tenant isolation key |
| event_type | TEXT | One of 30+ AuditEventType values |
| severity | TEXT | info / warning / error / critical |
| schema_version | INT | Payload version for forward compatibility |
| instance_id | TEXT | Approval workflow instance |
| step_instance_id | TEXT | Optional step reference |
| entity_type | TEXT | Denormalized from entity JSONB |
| entity_id | TEXT | Denormalized from entity JSONB |
| entity | JSONB | Full entity object |
| workflow | JSONB | Template metadata |
| actor | JSONB | Full actor object |
| actor_user_id | TEXT | Denormalized for fast queries |
| actor_is_admin | BOOLEAN | Denormalized for admin filtering |
| workflow_template_code | TEXT | Denormalized for template reporting |
| hash_prev | TEXT | Previous event's hash (chain link) |
| hash_curr | TEXT | This event's hash |
| is_redacted | BOOLEAN | Whether PII was stripped |
| trace_id | TEXT | OTel trace correlation |
| event_timestamp | TIMESTAMPTZ | Business event time (partition key) |

### core.audit_hash_anchor

Daily checkpoint of the hash chain per tenant. Enables efficient verification windows.

### core.audit_outbox

Async ingestion buffer. Status flow: `pending → processing → persisted | failed → dead`

## Index Strategy

- `(tenant_id, event_timestamp DESC)` — time-range queries
- `(tenant_id, instance_id, event_timestamp ASC)` — instance audit trail
- `(tenant_id, actor_user_id, event_timestamp DESC)` — actor queries (denormalized)
- `(tenant_id, entity_type, entity_id)` — entity lookups
- `(tenant_id, workflow_template_code)` — template reporting
- `GIN(details)` — JSONB queries for compliance reporting

## Event Taxonomy

All 30+ event types are registered in `event-taxonomy.ts` with:
- Default severity
- Category (workflow / step / action / admin / sla / entity / error / recovery)
- Required fields per event type
- Privileged flag (requires elevated audit access)
- Redaction rules (field paths to strip for non-admin callers)
- Schema version

Categories map to the workflow lifecycle: entity creation → workflow start → step activation → approver actions → SLA events → completion/rejection.

## Tamper Evidence (Hash Chain)

Each event's hash is computed as:

```
hash_curr = SHA-256(hash_prev + "|" + canonical_payload)
```

Where `canonical_payload` is a deterministic JSON string of:
`{ tenant_id, event_timestamp, instance_id, event_type, actor_user_id, action, entity_id }`

- First event uses `GENESIS_0000...` as hash_prev
- Chains are per-tenant (Map<tenantId, lastHash>)
- Daily anchors written to `core.audit_hash_anchor` for external verification
- `verifyChain()` walks events and recomputes hashes to detect tampering

## Immutability Guarantees

The `core.prevent_audit_mutation()` trigger function blocks all UPDATE and DELETE on:
- `core.workflow_audit_event`
- `core.audit_log`
- `core.permission_decision_log`
- `core.field_access_log`
- `core.security_event`

**Retention bypass**: `SET LOCAL athyper.audit_retention_bypass = 'true'` (transaction-scoped only).

## Redaction / PII Policy

The `AuditRedactionPipeline` runs before persistence:

1. **Denylist keys**: `password`, `secret`, `token`, `access_token`, `api_key`, etc. → replaced with `[REDACTED]`
2. **PII patterns**: emails → partial mask (`jo***@example.com`), phones → last 4 visible, IBANs → first 4 + last 4
3. **Taxonomy rules**: admin events get `ip_address` partially masked, `user_agent` truncated
4. **Actor email**: masked if present

Redaction version is tracked in `redaction_version` column for auditability.

## Audit Access Model

The `AuditQueryPolicyGate` enforces three roles:

| Role | Scope | PII Fields |
|------|-------|------------|
| `view_own_events` | Own events only (enforced actorUserId filter) | Stripped |
| `view_tenant_events` | All events in tenant | Stripped |
| `security_admin` | Full access | Visible |

Every query is logged to `core.security_event` as `AUDIT_VIEWED`.

## Backpressure & Tenant Quotas

The `AuditRateLimiter` uses Redis token bucket (500 events/tenant/minute default):

- **Always captured**: critical, error, admin.*, security events
- **Rate-limited**: info/warning events per tenant+eventType
- **Sampling**: When limit is hit, events are sampled at configurable rate (default 10%)
- **Fail-open**: Redis errors → capture the event

## Partitioning Strategy

`core.workflow_audit_event` uses monthly range partitions on `event_timestamp`:

- Partitions auto-created monthly via `core.create_next_audit_partition()` (schedule on 25th)
- Retention: `core.drop_audit_partition(year, month)` — DDL, not DML — bypasses immutability
- Indexes are defined on parent table, auto-propagated to partitions

## Resilient Writer

The `ResilientAuditWriter` guarantees audit never blocks or crashes workflows:

1. Redact → Hash → Enqueue to outbox (circuit-breaker protected)
2. On circuit open / DB error → push to bounded memory buffer (default 1000)
3. Buffer full → drop oldest + emit `audit_events_dropped` metric
4. `flushBuffer()` drains memory buffer when circuit recovers

## Metrics & Health

### Metrics (via MetricsRegistry)

| Metric | Type | Description |
|--------|------|-------------|
| `audit_events_ingested_total` | Counter | Events accepted into pipeline |
| `audit_events_persisted_total` | Counter | Events written to audit table |
| `audit_events_dropped_total` | Counter | Events lost (buffer overflow, dead-letter) |
| `audit_outbox_lag` | Gauge | Pending outbox rows |
| `audit_outbox_dead` | Gauge | Dead-letter items |
| `audit_insert_latency_ms` | Histogram | Write latency |
| `audit_memory_buffer_depth` | Gauge | In-memory buffer depth |

### Health Check

Registered as `audit-pipeline` (internal, non-required):

| Outbox Lag | Buffer | Status |
|-----------|--------|--------|
| < 10,000 | 0 | healthy |
| < 50,000 | any | degraded |
| >= 50,000 | any | unhealthy |

## Unified Activity Timeline

The `ActivityTimelineService` merges events from 5 tables via UNION ALL:

- `core.workflow_audit_event` — workflow events
- `core.permission_decision_log` — access decisions
- `core.field_access_log` — field access tracking
- `core.security_event` — security events
- `core.audit_log` — entity CRUD

Query by `(tenant, entity_type, entity_id, time_range)`, ordered by occurrence time.

## DI Registration

The module registers as `platform.audit-governance` in `registry.ts`.

### Tokens (TOKENS.*)

| Token | Service |
|-------|---------|
| `auditWorkflowRepo` | WorkflowAuditRepository |
| `auditOutboxRepo` | AuditOutboxRepo |
| `auditHashChain` | AuditHashChainService |
| `auditRedaction` | AuditRedactionPipeline |
| `auditRateLimiter` | AuditRateLimiter |
| `auditQueryGate` | AuditQueryPolicyGate |
| `auditResilientWriter` | ResilientAuditWriter |
| `auditTimeline` | ActivityTimelineService |
| `auditMetrics` | AuditMetrics |

### Workers

| Job Type | Concurrency | Description |
|----------|-------------|-------------|
| `drain-audit-outbox` | 2 | Drains outbox → audit table |

## File Structure

```
audit-governance/
├── domain/
│   ├── event-taxonomy.ts          # 30+ event types, validation, categories
│   ├── redaction-pipeline.ts      # PII stripping, denylist, masking
│   ├── hash-chain.service.ts      # SHA-256 tamper evidence chain
│   ├── resilient-audit-writer.ts  # Main ingestion entrypoint
│   ├── audit-rate-limiter.ts      # Per-tenant backpressure
│   ├── audit-query-gate.ts        # Role-based access control
│   └── activity-timeline.service.ts # Unified cross-table timeline
├── persistence/
│   ├── WorkflowAuditRepository.ts # IAuditRepository implementation
│   └── AuditOutboxRepo.ts         # Async outbox buffer
├── jobs/workers/
│   └── drainAuditOutbox.worker.ts # BullMQ drain worker
├── observability/
│   └── metrics.ts                 # Counters, gauges, health check
├── __tests__/                     # 10 test files, 81 tests
├── audit-log-retention.job.ts     # Retention job (updated)
└── index.ts                       # RuntimeModule composition root
```

## Operational Runbook

### Outbox lag growing

1. Check `audit_outbox_lag` metric
2. Verify drain worker is running: `SELECT count(*) FROM core.audit_outbox WHERE status = 'pending'`
3. Check dead-letter: `SELECT count(*) FROM core.audit_outbox WHERE status = 'dead'`
4. Increase drain worker concurrency if needed

### Hash chain verification

```typescript
const svc = container.resolve(TOKENS.auditHashChain);
const events = await repo.getEvents(tenantId, { sortBy: "timestamp", sortDirection: "asc" });
const result = svc.verifyChain(tenantId, events);
// result.valid, result.brokenAtEventId, result.message
```

### Retention

Retention job runs daily via BullMQ schedule. For partitioned tables, prefer:
```sql
SELECT core.drop_audit_partition(2025, 1); -- Drop January 2025
```

### New partition creation

Schedule monthly: `SELECT core.create_next_audit_partition();`
