/* ============================================================================
   Athyper — CORE: Workflow Runtime
   Lifecycle Definitions, Workflow Instances, Approval Process Engine

   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: Lifecycle Definition (state machine template)
-- ============================================================================
create table if not exists core.lifecycle (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  description  text,
  entity_type  text not null,

  definition   jsonb not null default '{"states": [], "transitions": []}',

  is_active    boolean not null default true,

  created_at   timestamptz not null default now(),
  created_by   text not null,
  updated_at   timestamptz,
  updated_by   text,

  constraint lifecycle_tenant_code_uniq unique (tenant_id, code)
);

comment on table core.lifecycle is 'State machine definitions (ordered state → transition rules).';

create index if not exists idx_lifecycle_tenant
  on core.lifecycle (tenant_id);

create index if not exists idx_lifecycle_entity_type
  on core.lifecycle (tenant_id, entity_type);

-- ============================================================================
-- CORE: Lifecycle Version (immutable version of lifecycle)
-- ============================================================================
create table if not exists core.lifecycle_version (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,
  lifecycle_id uuid not null references core.lifecycle(id) on delete cascade,

  version      int not null,
  definition   jsonb not null,

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint lifecycle_version_lc_ver_uniq unique (lifecycle_id, version)
);

comment on table core.lifecycle_version is 'Immutable lifecycle definition snapshots (audit trail).';

create index if not exists idx_lifecycle_version_lifecycle
  on core.lifecycle_version (lifecycle_id, version desc);

-- ============================================================================
-- CORE: Workflow Instance (runtime execution of state machine)
-- ============================================================================
create table if not exists core.workflow_instance (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  entity_type        text not null,
  entity_id          uuid not null,
  entity_version_id  uuid,

  lifecycle_id       uuid not null references core.lifecycle(id) on delete restrict,
  lifecycle_version_id uuid not null references core.lifecycle_version(id) on delete restrict,

  current_state      text not null,
  previous_state     text,

  status             text not null default 'active',

  data               jsonb,
  context            jsonb,

  initiated_by       uuid references core.principal(id) on delete set null,
  initiated_at       timestamptz not null default now(),

  completed_by       uuid references core.principal(id) on delete set null,
  completed_at       timestamptz,

  created_at         timestamptz not null default now(),
  created_by         text not null,
  updated_at         timestamptz,
  updated_by         text,

  constraint workflow_instance_entity_uniq unique (entity_type, entity_id),
  constraint workflow_instance_status_chk check (status in ('active','paused','completed','failed','canceled'))
);

comment on table core.workflow_instance is 'Runtime execution of lifecycle state machines per entity.';

create index if not exists idx_workflow_instance_tenant_status
  on core.workflow_instance (tenant_id, status);

create index if not exists idx_workflow_instance_entity
  on core.workflow_instance (tenant_id, entity_type, entity_id);

create index if not exists idx_workflow_instance_current_state
  on core.workflow_instance (tenant_id, current_state);

-- ============================================================================
-- CORE: Workflow Transition Record (audit trail of state changes)
-- ============================================================================
create table if not exists core.workflow_transition (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  workflow_instance_id uuid not null references core.workflow_instance(id) on delete cascade,

  from_state         text not null,
  to_state           text not null,

  transition_name    text,
  transition_data    jsonb,

  triggered_by       uuid not null references core.principal(id) on delete set null,
  triggered_at       timestamptz not null default now(),

  created_at         timestamptz not null default now()
);

comment on table core.workflow_transition is 'Append-only audit log of state transitions.';

create index if not exists idx_workflow_transition_instance
  on core.workflow_transition (workflow_instance_id, triggered_at desc);

create index if not exists idx_workflow_transition_tenant_time
  on core.workflow_transition (tenant_id, triggered_at desc);

-- ============================================================================
-- CORE: Approval Definition (approval workflow template)
-- ============================================================================
create table if not exists core.approval_definition (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  description  text,
  entity_type  text not null,

  rules        jsonb not null default '{"approvers": [], "conditions": []}',

  is_active    boolean not null default true,

  created_at   timestamptz not null default now(),
  created_by   text not null,
  updated_at   timestamptz,
  updated_by   text,

  constraint approval_definition_tenant_code_uniq unique (tenant_id, code)
);

comment on table core.approval_definition is 'Approval workflow rules (approvers, conditions, paths).';

create index if not exists idx_approval_definition_tenant
  on core.approval_definition (tenant_id);

create index if not exists idx_approval_definition_entity_type
  on core.approval_definition (tenant_id, entity_type);

-- ============================================================================
-- CORE: Approval Instance (runtime approval session)
-- ============================================================================
create table if not exists core.approval_instance (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  approval_definition_id uuid not null references core.approval_definition(id) on delete restrict,

  entity_type        text not null,
  entity_id          uuid not null,
  entity_version_id  uuid,
  entity_snapshot    jsonb,

  status             text not null default 'pending',
  decision           text,

  requested_by       uuid not null references core.principal(id) on delete set null,
  requested_at       timestamptz not null default now(),

  decided_by         uuid references core.principal(id) on delete set null,
  decided_at         timestamptz,

  reason             text,
  metadata           jsonb,

  created_at         timestamptz not null default now(),
  created_by         text not null,
  updated_at         timestamptz,
  updated_by         text,

  constraint approval_instance_status_chk check (status in ('pending','approved','rejected','escalated','canceled')),
  constraint approval_instance_decision_chk check (decision is null or decision in ('approve','reject','escalate'))
);

comment on table core.approval_instance is 'Runtime approval request (single decision point).';

create index if not exists idx_approval_instance_status
  on core.approval_instance (tenant_id, status);

create index if not exists idx_approval_instance_entity
  on core.approval_instance (tenant_id, entity_type, entity_id);

create index if not exists idx_approval_instance_requested_by
  on core.approval_instance (requested_by, requested_at desc);

-- ============================================================================
-- CORE: Approval Task (individual approver action item)
-- ============================================================================
create table if not exists core.approval_task (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,

  approver_id        uuid not null references core.principal(id) on delete cascade,

  order_index        int not null,
  status             text not null default 'pending',

  assigned_at        timestamptz not null default now(),
  started_at         timestamptz,
  completed_at       timestamptz,

  decision           text,
  reason             text,
  metadata           jsonb,

  created_at         timestamptz not null default now(),
  created_by         text not null,
  updated_at         timestamptz,
  updated_by         text,

  constraint approval_task_status_chk check (status in ('pending','assigned','in_progress','approved','rejected','skipped','escalated')),
  constraint approval_task_decision_chk check (decision is null or decision in ('approve','reject','escalate'))
);

comment on table core.approval_task is 'Individual approval task assigned to one approver.';

create index if not exists idx_approval_task_instance
  on core.approval_task (approval_instance_id, order_index);

create index if not exists idx_approval_task_approver
  on core.approval_task (approver_id, status);

create index if not exists idx_approval_task_status
  on core.approval_task (tenant_id, status);

-- ============================================================================
-- CORE: Approval Comment (audit trail of approval discussion)
-- ============================================================================
create table if not exists core.approval_comment (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,
  approval_task_id    uuid references core.approval_task(id) on delete set null,

  commenter_id       uuid not null references core.principal(id) on delete set null,
  comment_text       text not null,

  created_at         timestamptz not null default now(),
  created_by         text not null
);

comment on table core.approval_comment is 'Comments/discussion on an approval request.';

create index if not exists idx_approval_comment_instance
  on core.approval_comment (approval_instance_id, created_at asc);

create index if not exists idx_approval_comment_commenter
  on core.approval_comment (commenter_id, created_at desc);
