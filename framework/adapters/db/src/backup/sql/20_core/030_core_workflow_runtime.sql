/* ============================================================================
   Athyper — CORE: WF Runtime (High Volume)
   Lifecycle instances, events, approval instances, tasks, escalation, timers.
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- CORE: Entity Lifecycle Instance
-- ----------------------------------------------------------------------------
create table if not exists core.entity_lifecycle_instance (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  entity_name    text not null,
  entity_id      text not null,

  lifecycle_id   uuid not null references meta.lifecycle(id),
  state_id       uuid not null references meta.lifecycle_state(id),

  context        jsonb,

  updated_at     timestamptz not null default now(),
  updated_by     text not null,

  constraint lifecycle_instance_uniq unique (tenant_id, entity_name, entity_id)
);

comment on table core.entity_lifecycle_instance is 'Current lifecycle state per entity record.';

create index if not exists idx_lifecycle_instance_state
  on core.entity_lifecycle_instance (tenant_id, entity_name, state_id);

-- ----------------------------------------------------------------------------
-- CORE: Entity Lifecycle Event Log (append-only, relaxed FKs intentional)
-- ----------------------------------------------------------------------------
create table if not exists core.entity_lifecycle_event (
  id             uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  entity_name     text not null,
  entity_id       text not null,

  lifecycle_id    uuid not null,
  from_state_id   uuid,
  to_state_id     uuid,

  operation_code  text not null,
  occurred_at     timestamptz not null default now(),
  actor_id        uuid,
  payload         jsonb,

  correlation_id  text
);

comment on table core.entity_lifecycle_event is 'Append-only event log for lifecycle state transitions.';

create index if not exists idx_lifecycle_event_tenant_time
  on core.entity_lifecycle_event (tenant_id, occurred_at desc);

create index if not exists idx_lifecycle_event_entity
  on core.entity_lifecycle_event (tenant_id, entity_name, entity_id);

-- ----------------------------------------------------------------------------
-- CORE: Approval Instance
-- ----------------------------------------------------------------------------
create table if not exists core.approval_instance (
  id              uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,

  entity_name      text not null,
  entity_id        text not null,

  transition_id    uuid references meta.lifecycle_transition(id),
  approval_template_id uuid references meta.approval_template(id),
  status           text not null default 'open',
  context          jsonb,

  created_at       timestamptz not null default now(),
  created_by       text not null,

  constraint approval_instance_status_chk check (status in ('open','completed','canceled'))
);

comment on table core.approval_instance is 'Active approval workflow instances per entity record.';

create index if not exists idx_approval_instance_entity
  on core.approval_instance (tenant_id, entity_name, entity_id);

create index if not exists idx_approval_instance_status
  on core.approval_instance (tenant_id, status);

-- ----------------------------------------------------------------------------
-- CORE: Approval Stages
-- ----------------------------------------------------------------------------
create table if not exists core.approval_stage (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,

  stage_no            int not null,
  mode                text not null default 'serial',
  status              text not null default 'open',

  created_at          timestamptz not null default now(),

  constraint approval_stage_mode_chk check (mode in ('serial','parallel')),
  constraint approval_stage_status_chk check (status in ('open','completed','canceled'))
);

comment on table core.approval_stage is 'Stages within an approval instance.';

create index if not exists idx_approval_stage_instance
  on core.approval_stage (tenant_id, approval_instance_id, stage_no);

-- ----------------------------------------------------------------------------
-- CORE: Approval Tasks
-- ----------------------------------------------------------------------------
create table if not exists core.approval_task (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,
  approval_stage_id    uuid not null references core.approval_stage(id) on delete cascade,

  assignee_principal_id uuid references core.principal(id),
  assignee_group_id     uuid references core."group"(id),

  task_type            text not null default 'approver',
  status               text not null default 'pending',
  due_at               timestamptz,
  metadata             jsonb,

  decided_at           timestamptz,
  decided_by           uuid,
  decision_note        text,

  created_at           timestamptz not null default now(),

  constraint approval_task_type_chk check (task_type in ('approver','reviewer','watcher')),
  constraint approval_task_status_chk check (status in ('pending','approved','rejected','canceled','expired'))
);

comment on table core.approval_task is 'Individual approval/review tasks assigned to principals or groups.';

create index if not exists idx_approval_task_assignee
  on core.approval_task (tenant_id, coalesce(assignee_principal_id, assignee_group_id), status);

create index if not exists idx_approval_task_instance
  on core.approval_task (approval_instance_id);

-- ----------------------------------------------------------------------------
-- CORE: Approval Assignment Snapshot
-- ----------------------------------------------------------------------------
create table if not exists core.approval_assignment_snapshot (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  approval_task_id    uuid not null references core.approval_task(id) on delete cascade,
  resolved_assignment jsonb not null,
  resolved_from_rule_id uuid,
  resolved_from_version_id uuid,

  created_at          timestamptz not null default now(),
  created_by          text not null
);

comment on table core.approval_assignment_snapshot is 'Captured assignment resolution for audit trail.';

create index if not exists idx_approval_assignment_task
  on core.approval_assignment_snapshot (approval_task_id);

-- ----------------------------------------------------------------------------
-- CORE: Approval Escalation Log
-- ----------------------------------------------------------------------------
create table if not exists core.approval_escalation (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,
  kind               text not null,
  payload            jsonb,
  occurred_at         timestamptz not null default now(),

  constraint approval_escalation_kind_chk check (kind in ('reminder','escalation','reassign'))
);

comment on table core.approval_escalation is 'Escalation/reminder events for approvals.';

create index if not exists idx_approval_escalation_time
  on core.approval_escalation (tenant_id, occurred_at desc);

-- ----------------------------------------------------------------------------
-- CORE: Lifecycle Timers
-- ----------------------------------------------------------------------------
create table if not exists core.lifecycle_timer (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  entity_name    text not null,
  entity_id      text not null,

  policy_code    text,
  fire_at        timestamptz not null,
  status         text not null default 'scheduled',
  attempts       int not null default 0,
  config         jsonb,

  last_error     text,

  created_at     timestamptz not null default now(),

  constraint lifecycle_timer_status_chk check (status in ('scheduled','running','completed','failed','canceled'))
);

comment on table core.lifecycle_timer is 'Scheduled timers for auto-close, auto-cancel, reminders.';

create index if not exists idx_lifecycle_timer_pick
  on core.lifecycle_timer (tenant_id, status, fire_at);

-- ----------------------------------------------------------------------------
-- CORE: Approval Event Log
-- ----------------------------------------------------------------------------
create table if not exists core.approval_event (
  id             uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  approval_instance_id uuid,
  approval_task_id     uuid,

  event_type      text not null,
  payload         jsonb,
  occurred_at     timestamptz not null default now(),
  actor_id        uuid,

  correlation_id  text
);

comment on table core.approval_event is 'Append-only event log for approval workflow actions.';

create index if not exists idx_approval_event_tenant_time
  on core.approval_event (tenant_id, occurred_at desc);
