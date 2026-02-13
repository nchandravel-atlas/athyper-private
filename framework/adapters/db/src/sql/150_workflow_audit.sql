/* ============================================================================
   Athyper — CORE: Workflow Audit & Governance
   Durable workflow audit trail, tamper-evidence hash chain,
   async audit outbox, immutability guards.

   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: Workflow Audit Event (append-only, immutable)
-- ============================================================================
create table if not exists core.workflow_audit_event (
  id                        uuid primary key default gen_random_uuid(),
  tenant_id                 uuid not null references core.tenant(id) on delete cascade,

  -- Event classification
  event_type                text not null,
  severity                  text not null default 'info',
  schema_version            int  not null default 1,

  -- Workflow instance references
  instance_id               text not null,
  step_instance_id          text,

  -- Entity info (denormalized for query perf + full JSONB)
  entity_type               text not null,
  entity_id                 text not null,
  entity                    jsonb not null,

  -- Workflow info (denormalized + full JSONB)
  workflow                  jsonb not null,
  workflow_template_code    text,
  workflow_template_version int,

  -- Actor info (denormalized + full JSONB)
  actor                     jsonb not null,
  actor_user_id             text,
  actor_is_admin            boolean default false,

  -- Module origin
  module_code               text default 'WF',

  -- Action & state transition
  action                    text,
  previous_state            jsonb,
  new_state                 jsonb,

  -- Human-readable
  comment                   text,
  attachments               jsonb,

  -- Freeform details
  details                   jsonb,

  -- Request context
  ip_address                text,
  user_agent                text,
  correlation_id            text,
  session_id                text,
  trace_id                  text,

  -- Tamper evidence (hash chain)
  hash_prev                 text,
  hash_curr                 text,

  -- PII redaction tracking
  is_redacted               boolean default false,
  redaction_version         int,

  -- Timestamps
  event_timestamp           timestamptz not null default now(),
  created_at                timestamptz not null default now(),

  -- Constraints
  constraint wf_audit_severity_chk
    check (severity in ('info', 'warning', 'error', 'critical')),
  constraint wf_audit_module_code_chk
    check (module_code in ('WF', 'META', 'CORE', 'AUTH', 'SEC'))
);

comment on table core.workflow_audit_event is
  'Append-only audit trail for approval workflow events. Immutable after insert.';

-- Time-range queries
create index if not exists idx_wf_audit_tenant_time
  on core.workflow_audit_event (tenant_id, event_timestamp desc);

-- Instance audit trail
create index if not exists idx_wf_audit_instance
  on core.workflow_audit_event (tenant_id, instance_id, event_timestamp asc);

-- Step queries
create index if not exists idx_wf_audit_step
  on core.workflow_audit_event (tenant_id, step_instance_id, event_timestamp asc)
  where step_instance_id is not null;

-- Correlation tracing
create index if not exists idx_wf_audit_correlation
  on core.workflow_audit_event (tenant_id, correlation_id)
  where correlation_id is not null;

-- Event type filtering
create index if not exists idx_wf_audit_event_type
  on core.workflow_audit_event (tenant_id, event_type, event_timestamp desc);

-- Entity lookups
create index if not exists idx_wf_audit_entity
  on core.workflow_audit_event (tenant_id, entity_type, entity_id);

-- Actor queries (denormalized column)
create index if not exists idx_wf_audit_actor
  on core.workflow_audit_event (tenant_id, actor_user_id, event_timestamp desc)
  where actor_user_id is not null;

-- Template reporting (denormalized column)
create index if not exists idx_wf_audit_template
  on core.workflow_audit_event (tenant_id, workflow_template_code)
  where workflow_template_code is not null;

-- JSONB details queries for compliance reporting
create index if not exists idx_wf_audit_details_gin
  on core.workflow_audit_event using gin (details)
  where details is not null;


-- ============================================================================
-- CORE: Audit Hash Anchor (daily tamper-evidence checkpoints)
-- ============================================================================
create table if not exists core.audit_hash_anchor (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  anchor_date   date not null,
  last_hash     text not null,
  event_count   int  not null,

  created_at    timestamptz not null default now(),

  constraint audit_hash_anchor_uniq unique (tenant_id, anchor_date)
);

comment on table core.audit_hash_anchor is
  'Daily hash chain anchors for tamper-evidence verification.';

create index if not exists idx_audit_hash_anchor_tenant
  on core.audit_hash_anchor (tenant_id, anchor_date desc);


-- ============================================================================
-- CORE: Audit Outbox (async ingestion buffer)
-- ============================================================================
create table if not exists core.audit_outbox (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null,

  event_type    text not null,
  payload       jsonb not null,

  status        text not null default 'pending',
  attempts      int  not null default 0,
  max_attempts  int  not null default 5,
  available_at  timestamptz not null default now(),
  locked_at     timestamptz,
  locked_by     text,
  last_error    text,

  created_at    timestamptz not null default now(),

  constraint audit_outbox_status_chk
    check (status in ('pending', 'processing', 'persisted', 'failed', 'dead'))
);

comment on table core.audit_outbox is
  'Async audit ingestion buffer. Worker drains to workflow_audit_event with retries.';

-- Worker pick: pending items ordered by availability
create index if not exists idx_audit_outbox_pick
  on core.audit_outbox (status, available_at)
  where status in ('pending', 'failed');

-- Dead-letter monitoring
create index if not exists idx_audit_outbox_dead
  on core.audit_outbox (status, created_at desc)
  where status = 'dead';

-- Tenant monitoring
create index if not exists idx_audit_outbox_tenant
  on core.audit_outbox (tenant_id, status);


-- ============================================================================
-- IMMUTABILITY GUARD: Prevent UPDATE/DELETE on audit tables
-- ============================================================================

create or replace function core.prevent_audit_mutation()
returns trigger as $$
begin
  -- Allow authorized retention job bypass via session variable
  if current_setting('athyper.audit_retention_bypass', true) = 'true' then
    if tg_op = 'DELETE' then
      return old;
    end if;
  end if;

  raise exception 'Audit tables are immutable. % operations are not permitted on %.%',
    tg_op, tg_table_schema, tg_table_name
    using errcode = 'restrict_violation';
  return null;
end;
$$ language plpgsql;

comment on function core.prevent_audit_mutation() is
  'Trigger function enforcing immutability on audit tables. Bypass with SET LOCAL athyper.audit_retention_bypass = true.';

-- Attach to workflow_audit_event
create or replace trigger trg_workflow_audit_event_immutable
  before update or delete on core.workflow_audit_event
  for each row execute function core.prevent_audit_mutation();

-- Attach to existing audit tables
create or replace trigger trg_audit_log_immutable
  before update or delete on core.audit_log
  for each row execute function core.prevent_audit_mutation();

create or replace trigger trg_permission_decision_log_immutable
  before update or delete on core.permission_decision_log
  for each row execute function core.prevent_audit_mutation();

create or replace trigger trg_field_access_log_immutable
  before update or delete on core.field_access_log
  for each row execute function core.prevent_audit_mutation();

create or replace trigger trg_security_event_immutable
  before update or delete on core.security_event
  for each row execute function core.prevent_audit_mutation();
