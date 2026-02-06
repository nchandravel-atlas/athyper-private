/* ============================================================================
   Athyper — Core: Tenant + Foundation Runtime Tables
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- CORE: Tenant
-- ----------------------------------------------------------------------------
create table if not exists core.tenant (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text not null,
  status        text not null default 'active',
  region        text,
  subscription  text not null default 'base',

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint tenant_status_chk check (status in ('active','suspended','archived')),
  constraint tenant_subscription_chk check (subscription in ('base','professional','enterprise'))
);

comment on table core.tenant is 'Canonical tenant registry (subscription, status, region).';

-- ----------------------------------------------------------------------------
-- CORE: Audit Log
-- ----------------------------------------------------------------------------
create table if not exists core.audit_log (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  occurred_at   timestamptz not null default now(),
  actor_id      uuid,
  actor_type    text not null,
  action        text not null,
  entity_name   text,
  entity_id     text,
  entity_version_id uuid,
  correlation_id text,
  ip_address    text,
  user_agent    text,
  payload       jsonb,

  constraint audit_actor_type_chk check (actor_type in ('user','service','system'))
);

comment on table core.audit_log is 'Unified platform audit (append-only).';

create index if not exists idx_audit_log_tenant_time
  on core.audit_log (tenant_id, occurred_at desc);

-- ----------------------------------------------------------------------------
-- CORE: Outbox
-- ----------------------------------------------------------------------------
create table if not exists core.outbox (
  id              uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,

  topic           text not null,
  event_key       text,
  payload         jsonb not null,
  status          text not null default 'pending',
  attempts        int not null default 0,
  available_at    timestamptz not null default now(),
  locked_at       timestamptz,
  locked_by       text,
  last_error      text,

  created_at      timestamptz not null default now(),
  created_by      text not null,

  constraint outbox_status_chk check (status in ('pending','processing','sent','failed','dead'))
);

comment on table core.outbox is 'Platform event outbox for reliable async processing.';

create index if not exists idx_outbox_pick
  on core.outbox (tenant_id, status, available_at);

-- ----------------------------------------------------------------------------
-- CORE: Job Definitions
-- ----------------------------------------------------------------------------
create table if not exists core.job (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code          text not null,
  name          text not null,
  schedule_kind text not null,
  schedule_expr text,
  is_active     boolean not null default true,
  config        jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint job_schedule_kind_chk check (schedule_kind in ('cron','interval','manual')),
  constraint job_code_uniq unique (tenant_id, code)
);

comment on table core.job is 'Scheduler/job definitions (tenant-scoped).';

-- ----------------------------------------------------------------------------
-- CORE: Job Runs
-- ----------------------------------------------------------------------------
create table if not exists core.job_run (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,
  job_id       uuid not null references core.job(id) on delete cascade,

  status       text not null default 'queued',
  started_at   timestamptz,
  finished_at  timestamptz,
  attempts     int not null default 0,
  max_attempts int not null default 3,
  log_ref      text,
  last_error   text,

  created_at   timestamptz not null default now(),

  constraint job_run_status_chk check (status in ('queued','running','succeeded','failed','canceled'))
);

comment on table core.job_run is 'Individual job execution records.';

create index if not exists idx_job_run_tenant_job_time
  on core.job_run (tenant_id, job_id, created_at desc);

-- ----------------------------------------------------------------------------
-- CORE: Attachments
-- ----------------------------------------------------------------------------
create table if not exists core.attachment (
  id             uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  owner_entity    text,
  owner_entity_id text,
  file_name       text not null,
  content_type    text,
  size_bytes      bigint,
  storage_bucket  text not null,
  storage_key     text not null,

  is_virus_scanned boolean not null default false,
  retention_until  timestamptz,
  metadata         jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null
);

comment on table core.attachment is 'Object storage-backed attachments (MinIO/S3).';

create index if not exists idx_attachment_owner
  on core.attachment (tenant_id, owner_entity, owner_entity_id);

-- ----------------------------------------------------------------------------
-- CORE: Documents
-- ----------------------------------------------------------------------------
create table if not exists core.document (
  id             uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  code           text,
  title          text,
  tags           text[],
  metadata       jsonb,

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text
);

comment on table core.document is 'Logical document registry (metadata separate from blobs).';

create index if not exists idx_document_tenant_code
  on core.document (tenant_id, code);

create index if not exists idx_document_tags
  on core.document using gin (tags);

-- ----------------------------------------------------------------------------
-- CORE: Permission Decision Log
-- ----------------------------------------------------------------------------
create table if not exists core.permission_decision_log (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  occurred_at       timestamptz not null default now(),

  actor_principal_id uuid,
  subject_snapshot  jsonb,

  entity_name       text,
  entity_id         text,
  entity_version_id uuid,

  operation_code    text not null,
  effect            text not null,
  matched_rule_id   uuid,
  matched_policy_version_id uuid,

  reason            text,
  correlation_id    text,

  constraint decision_effect_chk check (effect in ('allow','deny'))
);

comment on table core.permission_decision_log is
'Append-only audit log for access decisions (allow/deny + matched rule/version).';

create index if not exists idx_decision_log_tenant_time
  on core.permission_decision_log (tenant_id, occurred_at desc);

-- ----------------------------------------------------------------------------
-- CORE: Addresses
-- ----------------------------------------------------------------------------
create table if not exists core.address (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  country_code text,
  line1        text,
  line2        text,
  city         text,
  region       text,
  postal_code  text,
  metadata     jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null
);

comment on table core.address is 'Physical/mailing addresses (tenant-scoped).';

create index if not exists idx_address_tenant
  on core.address (tenant_id);

-- ----------------------------------------------------------------------------
-- CORE: Contact Points
-- ----------------------------------------------------------------------------
create table if not exists core.contact_point (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  owner_type   text not null,
  owner_id     uuid not null,

  channel_type text not null,
  value        text not null,
  purpose      text,
  is_primary   boolean not null default false,
  is_verified  boolean not null default false,
  metadata     jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null
);

comment on table core.contact_point is 'Contact channels (email, phone, whatsapp, website, etc.).';

create index if not exists idx_contact_point_owner
  on core.contact_point (tenant_id, owner_type, owner_id);

-- ----------------------------------------------------------------------------
-- CORE: Contact Phone Details
-- ----------------------------------------------------------------------------
create table if not exists core.contact_phone (
  id             uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  contact_point_id uuid not null references core.contact_point(id) on delete cascade,

  e164           text,
  country_code   text,
  national_number text,
  carrier_hint   text,

  created_at     timestamptz not null default now(),
  created_by     text not null
);

comment on table core.contact_phone is 'Structured phone data linked to a contact point.';
