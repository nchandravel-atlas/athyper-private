-- ============================================================================
-- Lifecycle Timer Schedule Table
-- ============================================================================
-- Tracks active lifecycle timer jobs for auto-transitions and reminders.
-- Enables timer cancellation when manual transitions occur.
-- ============================================================================

create table if not exists core.lifecycle_timer_schedule (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  -- Entity identification
  entity_name         text not null,
  entity_id           text not null,
  lifecycle_id        uuid not null references meta.lifecycle(id) on delete cascade,
  state_id            uuid not null references meta.lifecycle_state(id) on delete cascade,

  -- Timer configuration
  timer_type          text not null,  -- 'auto_close', 'auto_cancel', 'reminder', 'auto_transition'
  transition_id       uuid references meta.lifecycle_transition(id) on delete cascade,

  -- Scheduling information
  scheduled_at        timestamptz not null default now(),
  fire_at             timestamptz not null,
  job_id              text not null,  -- BullMQ job ID for cancellation

  -- Policy snapshot (immutable - policy changes don't affect scheduled timers)
  policy_id           uuid references meta.lifecycle_timer_policy(id) on delete set null,
  policy_snapshot     jsonb not null,

  -- Status tracking
  status              text not null default 'scheduled',  -- 'scheduled', 'fired', 'canceled'

  -- Audit fields
  created_at          timestamptz not null default now(),
  created_by          text not null,

  -- Constraints
  constraint lifecycle_timer_schedule_status_chk
    check (status in ('scheduled','fired','canceled')),
  constraint lifecycle_timer_schedule_type_chk
    check (timer_type in ('auto_close','auto_cancel','reminder','auto_transition'))
);

comment on table core.lifecycle_timer_schedule is
  'Active lifecycle timer jobs for auto-transitions and reminders. Enables timer cancellation and audit trail.';

comment on column core.lifecycle_timer_schedule.policy_snapshot is
  'Immutable snapshot of timer policy rules at scheduling time. Policy changes do not affect already-scheduled timers.';

comment on column core.lifecycle_timer_schedule.job_id is
  'BullMQ job ID for cancellation. Allows removing jobs from queue when entity transitions manually.';

-- ============================================================================
-- Indexes
-- ============================================================================

-- Query timers by entity (for cancellation on manual transition)
create index idx_lifecycle_timer_schedule_entity
  on core.lifecycle_timer_schedule (tenant_id, entity_name, entity_id);

-- Query timers by fire time (for rehydration and monitoring)
create index idx_lifecycle_timer_schedule_fire_at
  on core.lifecycle_timer_schedule (tenant_id, status, fire_at);

-- Query by job ID (for job completion tracking)
create index idx_lifecycle_timer_schedule_job_id
  on core.lifecycle_timer_schedule (job_id);

-- Query by state (for impact analysis)
create index idx_lifecycle_timer_schedule_state
  on core.lifecycle_timer_schedule (tenant_id, state_id, status);
