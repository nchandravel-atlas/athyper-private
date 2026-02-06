/* ============================================================================
   Athyper — META: WF — Lifecycles + Approval Templates + Routing
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- META: Lifecycle Definitions
-- ----------------------------------------------------------------------------
create table if not exists meta.lifecycle (
  id          uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  code        text not null,
  name        text not null,
  description text,
  version_no  int not null default 1,
  is_active   boolean not null default true,
  config      jsonb,                    -- lifecycle-wide configuration

  created_at  timestamptz not null default now(),
  created_by  text not null,

  constraint lifecycle_code_uniq unique (tenant_id, code, version_no)
);

comment on table meta.lifecycle is 'Lifecycle (state machine) definitions with versioning.';

-- ----------------------------------------------------------------------------
-- META: Lifecycle States
-- ----------------------------------------------------------------------------
create table if not exists meta.lifecycle_state (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  lifecycle_id  uuid not null references meta.lifecycle(id) on delete cascade,

  code         text not null,
  name         text not null,
  is_terminal  boolean not null default false,
  sort_order   int not null default 0,
  config       jsonb,                   -- state-specific behaviors (auto-actions, UI hints)

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint lifecycle_state_code_uniq unique (tenant_id, lifecycle_id, code)
);

comment on table meta.lifecycle_state is 'States within a lifecycle (DRAFT, PENDING, APPROVED, etc.).';

-- ----------------------------------------------------------------------------
-- META: Lifecycle Transitions
-- ----------------------------------------------------------------------------
create table if not exists meta.lifecycle_transition (
  id              uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,
  lifecycle_id     uuid not null references meta.lifecycle(id) on delete cascade,

  from_state_id    uuid not null references meta.lifecycle_state(id) on delete cascade,
  to_state_id      uuid not null references meta.lifecycle_state(id) on delete cascade,

  operation_code   text not null,
  is_active        boolean not null default true,
  config           jsonb,               -- transition-specific configuration

  created_at       timestamptz not null default now(),
  created_by       text not null
);

comment on table meta.lifecycle_transition is 'Allowed state transitions (from -> to) triggered by operations.';

create index if not exists idx_transition_lookup
  on meta.lifecycle_transition (tenant_id, lifecycle_id, from_state_id, operation_code);

-- ----------------------------------------------------------------------------
-- META: Transition Gates
-- ----------------------------------------------------------------------------
create table if not exists meta.lifecycle_transition_gate (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  transition_id       uuid not null references meta.lifecycle_transition(id) on delete cascade,

  required_operations jsonb,
  approval_template_id uuid,
  conditions           jsonb,
  threshold_rules      jsonb,

  created_at           timestamptz not null default now(),
  created_by           text not null
);

comment on table meta.lifecycle_transition_gate is
'Gate bindings: required permission ops, approval template, conditions, thresholds.';

-- ----------------------------------------------------------------------------
-- META: Approval Templates
-- ----------------------------------------------------------------------------
create table if not exists meta.approval_template (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  behaviors    jsonb,
  escalation_style text,

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint approval_template_code_uniq unique (tenant_id, code)
);

comment on table meta.approval_template is 'Multi-stage approval workflow templates.';

-- ----------------------------------------------------------------------------
-- META: Approval Template Stages
-- ----------------------------------------------------------------------------
create table if not exists meta.approval_template_stage (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,
  approval_template_id uuid not null references meta.approval_template(id) on delete cascade,

  stage_no             int not null,
  name                 text,
  mode                 text not null default 'serial',
  quorum               jsonb,

  created_at           timestamptz not null default now(),
  created_by           text not null,

  constraint stage_mode_chk check (mode in ('serial','parallel')),
  constraint template_stage_uniq unique (tenant_id, approval_template_id, stage_no)
);

comment on table meta.approval_template_stage is 'Stages within an approval template (serial or parallel).';

-- ----------------------------------------------------------------------------
-- META: Approval Routing Rules
-- ----------------------------------------------------------------------------
create table if not exists meta.approval_template_rule (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,
  approval_template_id uuid not null references meta.approval_template(id) on delete cascade,

  priority             int not null default 100,
  conditions           jsonb not null,
  assign_to            jsonb not null,

  created_at           timestamptz not null default now(),
  created_by           text not null
);

comment on table meta.approval_template_rule is 'Routing rules: conditions (OU/amount/etc.) to approver assignment.';

create index if not exists idx_approval_template_rule
  on meta.approval_template_rule (tenant_id, approval_template_id, priority);

-- ----------------------------------------------------------------------------
-- META: Approval SLA Policies
-- ----------------------------------------------------------------------------
create table if not exists meta.approval_sla_policy (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  timers       jsonb not null,
  escalation_chain jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint approval_sla_code_uniq unique (tenant_id, code)
);

comment on table meta.approval_sla_policy is 'SLA policies with reminder/escalation timers.';

-- ----------------------------------------------------------------------------
-- META: Lifecycle Timer Policies
-- ----------------------------------------------------------------------------
create table if not exists meta.lifecycle_timer_policy (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  rules        jsonb not null,

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint lifecycle_timer_policy_code_uniq unique (tenant_id, code)
);

comment on table meta.lifecycle_timer_policy is 'Timer policies for auto-close, auto-cancel, reminders.';

-- ----------------------------------------------------------------------------
-- META: Entity <-> Lifecycle Binding
-- ----------------------------------------------------------------------------
create table if not exists meta.entity_lifecycle (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  entity_name   text not null,
  lifecycle_id  uuid not null references meta.lifecycle(id) on delete cascade,
  conditions    jsonb,
  priority      int not null default 100,

  created_at    timestamptz not null default now(),
  created_by    text not null
);

comment on table meta.entity_lifecycle is 'Binds entity types to lifecycle definitions with priority-based resolution.';

create index if not exists idx_entity_lifecycle_resolution
  on meta.entity_lifecycle (tenant_id, entity_name, priority);

-- ----------------------------------------------------------------------------
-- META: Compiled Lifecycle Route
-- ----------------------------------------------------------------------------
create table if not exists meta.entity_lifecycle_route_compiled (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  entity_name   text not null,
  compiled_json jsonb not null,
  compiled_hash text not null,
  generated_at  timestamptz not null default now(),

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint route_compiled_hash_uniq unique (tenant_id, entity_name, compiled_hash)
);

comment on table meta.entity_lifecycle_route_compiled is
'Precompiled lifecycle routing per entity for fast runtime resolution.';
