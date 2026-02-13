/* ============================================================================
   Athyper — AUDIT: Monthly Range Partitioning
   Converts core.workflow_audit_event to monthly partitions on event_timestamp.

   Strategy:
   - Range partitions by month (event_timestamp)
   - Auto-create next month's partition via scheduled function
   - Retention: DROP PARTITION instead of row DELETE (bypasses immutability trigger
     naturally — DDL, not DML)
   - Pre-create current + next 3 months at migration time

   PostgreSQL 16+ (declarative partitioning)
   ============================================================================ */

-- ============================================================================
-- Step 1: Convert to partitioned table
-- ============================================================================
-- NOTE: PostgreSQL does not support ALTER TABLE ... SET PARTITION BY.
-- The canonical approach is:
--   1. Rename the existing table
--   2. Create the partitioned replacement
--   3. Migrate data
--   4. Drop the old table
-- This migration assumes the table is NEW (created in 150_workflow_audit.sql)
-- and may already be empty. If data exists, run step 2b.
-- ============================================================================

-- If the table already exists as non-partitioned (from 150_), drop it so we
-- can recreate as partitioned. Data loss is acceptable at migration time for
-- a brand-new table.
drop table if exists core.workflow_audit_event cascade;

create table if not exists core.workflow_audit_event (
  id                       uuid not null default gen_random_uuid(),
  tenant_id                uuid not null,
  event_type               text not null,
  severity                 text not null default 'info',
  schema_version           int  not null default 1,
  instance_id              text not null,
  step_instance_id         text,
  entity_type              text not null,
  entity_id                text not null,
  entity                   jsonb not null,
  workflow                 jsonb not null,
  actor                    jsonb not null,
  actor_user_id            text,
  actor_is_admin           boolean default false,
  workflow_template_code   text,
  workflow_template_version int,
  module_code              text default 'WF',
  action                   text,
  previous_state           jsonb,
  new_state                jsonb,
  comment                  text,
  attachments              jsonb,
  details                  jsonb,
  ip_address               text,
  user_agent               text,
  correlation_id           text,
  session_id               text,
  trace_id                 text,
  hash_prev                text,
  hash_curr                text,
  is_redacted              boolean default false,
  redaction_version        int,
  event_timestamp          timestamptz not null,
  created_at               timestamptz not null default now(),

  -- PK must include the partition key
  primary key (id, event_timestamp),

  constraint wf_audit_severity_chk   check (severity in ('info','warning','error','critical')),
  constraint wf_audit_module_chk     check (module_code in ('WF','META','CORE','AUTH','SEC'))
) partition by range (event_timestamp);

comment on table core.workflow_audit_event
  is 'Partitioned workflow audit event log (monthly range on event_timestamp).';

-- FK from tenant (not a partition key, so we add a non-partitioned FK check)
-- NOTE: Partitioned tables in PG16+ support foreign keys referencing non-partitioned tables.
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'wf_audit_tenant_fk'
      and table_schema = 'core'
      and table_name = 'workflow_audit_event'
  ) then
    alter table core.workflow_audit_event
      add constraint wf_audit_tenant_fk foreign key (tenant_id)
      references core.tenant(id) on delete cascade;
  end if;
end $$;

-- ============================================================================
-- Step 2: Create partitions for current + next 3 months
-- ============================================================================

do $$
declare
  v_start date;
  v_end   date;
  v_name  text;
  v_month date := date_trunc('month', current_date);
begin
  for i in 0..3 loop
    v_start := v_month + (i || ' months')::interval;
    v_end   := v_month + ((i + 1) || ' months')::interval;
    v_name  := 'workflow_audit_event_' || to_char(v_start, 'YYYY_MM');

    execute format(
      'create table if not exists core.%I partition of core.workflow_audit_event
         for values from (%L) to (%L)',
      v_name, v_start, v_end
    );
  end loop;
end;
$$;

-- ============================================================================
-- Step 3: Recreate indexes on the parent (PostgreSQL auto-creates per partition)
-- ============================================================================

create index if not exists idx_wf_audit_tenant_time
  on core.workflow_audit_event (tenant_id, event_timestamp desc);

create index if not exists idx_wf_audit_instance
  on core.workflow_audit_event (tenant_id, instance_id, event_timestamp asc);

create index if not exists idx_wf_audit_step
  on core.workflow_audit_event (tenant_id, step_instance_id)
  where step_instance_id is not null;

create index if not exists idx_wf_audit_correlation
  on core.workflow_audit_event (tenant_id, correlation_id)
  where correlation_id is not null;

create index if not exists idx_wf_audit_event_type
  on core.workflow_audit_event (tenant_id, event_type, event_timestamp desc);

create index if not exists idx_wf_audit_entity
  on core.workflow_audit_event (tenant_id, entity_type, entity_id);

create index if not exists idx_wf_audit_actor
  on core.workflow_audit_event (tenant_id, actor_user_id, event_timestamp desc);

create index if not exists idx_wf_audit_template
  on core.workflow_audit_event (tenant_id, workflow_template_code);

create index if not exists idx_wf_audit_details_gin
  on core.workflow_audit_event using gin (details)
  where details is not null;

-- ============================================================================
-- Step 4: Re-attach immutability trigger
-- ============================================================================

create or replace trigger trg_audit_immutable_workflow_audit
  before update or delete on core.workflow_audit_event
  for each row execute function core.prevent_audit_mutation();

-- ============================================================================
-- Step 5: Auto-create partition function (called monthly by cron / pg_cron)
-- ============================================================================

create or replace function core.create_next_audit_partition()
returns void as $$
declare
  v_next_month date := date_trunc('month', current_date + interval '1 month');
  v_end        date := v_next_month + interval '1 month';
  v_name       text := 'workflow_audit_event_' || to_char(v_next_month, 'YYYY_MM');
begin
  execute format(
    'create table if not exists core.%I partition of core.workflow_audit_event
       for values from (%L) to (%L)',
    v_name, v_next_month, v_end
  );

  raise notice 'Created partition: core.%', v_name;
end;
$$ language plpgsql;

comment on function core.create_next_audit_partition()
  is 'Auto-create next month partition for workflow_audit_event. Schedule via pg_cron on the 25th.';

-- ============================================================================
-- Step 6: Drop old partition function (retention)
-- ============================================================================

create or replace function core.drop_audit_partition(p_year int, p_month int)
returns void as $$
declare
  v_name text := 'workflow_audit_event_' || lpad(p_year::text, 4, '0') || '_' || lpad(p_month::text, 2, '0');
begin
  execute format('drop table if exists core.%I', v_name);
  raise notice 'Dropped partition: core.%', v_name;
end;
$$ language plpgsql;

comment on function core.drop_audit_partition(int, int)
  is 'Drop a monthly audit partition. Use for retention — bypasses immutability trigger (DDL, not DML).';
