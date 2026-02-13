/* ============================================================================
   Athyper — AUDIT: Dead-Letter Queue
   Stores permanently failed audit outbox items for inspection and replay.
   Follows core.notification_dlq pattern.

   PostgreSQL 16+
   ============================================================================ */

create table if not exists core.audit_dlq (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,

  -- Link back to original outbox entry
  outbox_id        uuid not null,

  -- Event metadata
  event_type       text not null,
  payload          jsonb not null,

  -- Failure info
  last_error       text,
  error_category   text,
  attempt_count    int not null default 0,

  -- Lifecycle
  dead_at          timestamptz not null default now(),
  replayed_at      timestamptz,
  replayed_by      text,
  replay_count     int not null default 0,

  -- Correlation
  correlation_id   text,

  created_at       timestamptz not null default now()
);

comment on table core.audit_dlq is
  'Dead-letter queue for audit outbox items that exceeded max retry attempts.';

-- Unreplayed items per tenant (admin dashboard)
create index if not exists idx_audit_dlq_unreplayed
  on core.audit_dlq (tenant_id, dead_at desc)
  where replayed_at is null;

-- Tenant + status overview
create index if not exists idx_audit_dlq_tenant
  on core.audit_dlq (tenant_id, created_at desc);

-- Correlation lookup
create index if not exists idx_audit_dlq_correlation
  on core.audit_dlq (correlation_id)
  where correlation_id is not null;
