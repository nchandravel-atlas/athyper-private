/* ============================================================================
   Athyper — Core Schemas + META + POLICY + WF + IAM + REF + MDM
   PostgreSQL 16+ (pgcrypto)
   Idempotent-ish: uses IF NOT EXISTS; some constraints require clean first-run.
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- SCHEMAS + EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto; -- gen_random_uuid()

create schema if not exists core;
create schema if not exists meta;
create schema if not exists ref;
create schema if not exists mdm;

-- ----------------------------------------------------------------------------
-- CORE: Tenant + Foundation Runtime
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

create table if not exists core.tenant_profile (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  currency     text,
  locale       text,
  timezone     text,
  fiscal_year_start_month int,

  security_defaults jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null,
  updated_at   timestamptz,
  updated_by   text,

  constraint tenant_profile_one_per_tenant_uniq unique (tenant_id)
);

comment on table core.tenant_profile is 'Tenant operational defaults (currency, locale, timezone, fiscal, security defaults).';

create table if not exists core.audit_log (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  occurred_at   timestamptz not null default now(),
  actor_id      uuid,
  actor_type    text not null,          -- user/service/system
  action        text not null,          -- stable action code
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

create table if not exists core.job (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code          text not null,
  name          text not null,
  schedule_kind text not null, -- cron/interval/manual
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

create index if not exists idx_job_run_tenant_job_time
  on core.job_run (tenant_id, job_id, created_at desc);

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

  created_at      timestamptz not null default now(),
  created_by      text not null
);

comment on table core.attachment is 'Object storage-backed attachments (MinIO/S3).';

create index if not exists idx_attachment_owner
  on core.attachment (tenant_id, owner_entity, owner_entity_id);

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

-- ----------------------------------------------------------------------------
-- CORE: POLICY — Permission Decision Log
-- ----------------------------------------------------------------------------
create table if not exists core.permission_decision_log (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  occurred_at       timestamptz not null default now(),

  actor_principal_id uuid,
  subject_snapshot  jsonb, -- roles/groups/scopes (optional)

  entity_name       text,
  entity_id         text,
  entity_version_id uuid,

  operation_code    text not null, -- e.g. READ/UPDATE
  effect            text not null, -- allow/deny
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
-- CORE: IAM — Principals / Groups / Roles / OU / Contacts
-- ----------------------------------------------------------------------------
create table if not exists core.principal (
  id          uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  principal_type text not null, -- user/service/external
  status      text not null default 'active',
  display_name text,
  email       text,

  created_at  timestamptz not null default now(),
  created_by  text not null,

  constraint principal_type_chk check (principal_type in ('user','service','external')),
  constraint principal_status_chk check (status in ('active','disabled','archived'))
);

comment on table core.principal is 'Canonical actor registry mapped from IdP; stable internal ID.';

create table if not exists core.idp_identity (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  principal_id   uuid not null references core.principal(id) on delete cascade,

  realm          text not null,
  provider       text not null,
  subject        text not null,
  username       text,

  created_at     timestamptz not null default now(),
  created_by     text not null,

  constraint idp_identity_uniq unique (tenant_id, realm, provider, subject)
);

comment on table core.idp_identity is 'IdP mapping (realm/provider/subject) -> principal_id.';

create table if not exists core.principal_profile (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  principal_id  uuid not null references core.principal(id) on delete cascade,

  locale       text,
  language     text,
  ui_prefs     jsonb,
  avatar_url   text,

  created_at   timestamptz not null default now(),
  created_by   text not null,
  updated_at   timestamptz,
  updated_by   text,

  constraint principal_profile_one_uniq unique (tenant_id, principal_id)
);

create table if not exists core."group" (
  id          uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  code        text not null,
  name        text not null,
  source_type text not null default 'local', -- local/idp/import
  source_ref  text,
  is_active   boolean not null default true,

  created_at  timestamptz not null default now(),
  created_by  text not null,

  constraint group_source_chk check (source_type in ('local','idp','import')),
  constraint group_code_uniq unique (tenant_id, code)
);

create table if not exists core.group_member (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  group_id      uuid not null references core."group"(id) on delete cascade,
  principal_id  uuid not null references core.principal(id) on delete cascade,

  valid_from    timestamptz,
  valid_until   timestamptz,

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint group_member_uniq unique (tenant_id, group_id, principal_id)
);

create index if not exists idx_group_member_principal
  on core.group_member (tenant_id, principal_id);

create table if not exists core.role (
  id          uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  code        text not null,
  name        text not null,
  scope_mode  text not null default 'tenant', -- tenant/ou/entity
  is_active   boolean not null default true,

  created_at  timestamptz not null default now(),
  created_by  text not null,

  constraint role_scope_mode_chk check (scope_mode in ('tenant','ou','entity')),
  constraint role_code_uniq unique (tenant_id, code)
);

create table if not exists core.role_binding (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  role_id      uuid not null references core.role(id) on delete cascade,

  -- subject can be principal OR group
  principal_id uuid,
  group_id     uuid,

  scope_kind   text not null default 'tenant', -- tenant/ou/entity
  scope_key    text, -- ou_node_id or entity_name/entity_id etc.
  priority     int not null default 100,

  valid_from   timestamptz,
  valid_until  timestamptz,

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint role_binding_scope_chk check (scope_kind in ('tenant','ou','entity')),
  constraint role_binding_subject_chk check (
    (principal_id is not null and group_id is null) or
    (principal_id is null and group_id is not null)
  )
);

create index if not exists idx_role_binding_subject
  on core.role_binding (tenant_id, coalesce(principal_id, group_id::uuid), priority);

create table if not exists core.principal_attribute (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  principal_id  uuid not null references core.principal(id) on delete cascade,

  attr_key      text not null,
  attr_value    text not null,
  valid_from    timestamptz,
  valid_until   timestamptz,

  created_at    timestamptz not null default now(),
  created_by    text not null
);

create index if not exists idx_principal_attribute_lookup
  on core.principal_attribute (tenant_id, principal_id, attr_key);

create table if not exists core.entitlement_snapshot (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  principal_id   uuid not null references core.principal(id) on delete cascade,

  snapshot       jsonb not null,
  expires_at     timestamptz not null,

  created_at     timestamptz not null default now(),

  constraint entitlement_snapshot_one_uniq unique (tenant_id, principal_id)
);

comment on table core.entitlement_snapshot is 'TTL cached effective entitlements (cache-only).';

create table if not exists core.ou_node (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  parent_id     uuid references core.ou_node(id) on delete set null,
  code          text not null,
  name          text not null,

  path          text not null, -- materialized path for subtree checks
  depth         int not null default 0,
  is_active     boolean not null default true,

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint ou_node_code_uniq unique (tenant_id, code),
  constraint ou_node_path_uniq unique (tenant_id, path)
);

create index if not exists idx_ou_node_path
  on core.ou_node (tenant_id, path);

create table if not exists core.address (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  country_code text,
  line1        text,
  line2        text,
  city         text,
  region       text,
  postal_code  text,

  created_at   timestamptz not null default now(),
  created_by   text not null
);

create table if not exists core.contact_point (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  owner_type   text not null, -- tenant/ou/partner/principal/etc.
  owner_id     uuid not null,

  channel_type text not null, -- email/phone/whatsapp/website/etc.
  value        text not null,
  purpose      text,
  is_primary   boolean not null default false,
  is_verified  boolean not null default false,

  created_at   timestamptz not null default now(),
  created_by   text not null
);

create index if not exists idx_contact_point_owner
  on core.contact_point (tenant_id, owner_type, owner_id);

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

-- ----------------------------------------------------------------------------
-- META: Entity Registry + Versioning + Fields + Relations + Indexes + Policies
-- ----------------------------------------------------------------------------
create table if not exists meta.entity (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  module_id     text not null,           -- META/ACC/BUY/...
  name          text not null,           -- stable entity name (DocType)
  kind          text not null default 'ent', -- ref/mdm/doc/ent
  table_schema  text not null default 'ent',
  table_name    text not null,
  naming_policy jsonb,
  feature_flags jsonb,                   -- auditable/approvable/cacheable etc.

  is_active     boolean not null default true,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint entity_kind_chk check (kind in ('ref','mdm','doc','ent')),
  constraint entity_name_uniq unique (tenant_id, name)
);

comment on table meta.entity is
'Entity (DocType) registry: kind, physical mapping, naming, feature flags, version links.';

create table if not exists meta.entity_version (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  entity_id     uuid not null references meta.entity(id) on delete cascade,

  version_no    int not null default 1,
  status        text not null default 'draft', -- draft/published/archived
  label         text,
  behaviors     jsonb, -- server/UI behaviors

  published_at  timestamptz,
  published_by  text,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint entity_version_status_chk check (status in ('draft','published','archived')),
  constraint entity_version_uniq unique (tenant_id, entity_id, version_no)
);

comment on table meta.entity_version is 'Versioned entity definition (draft→published).';

create index if not exists idx_entity_version_entity_status
  on meta.entity_version (tenant_id, entity_id, status);

create table if not exists meta.field (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,
  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  name             text not null, -- field name
  column_name      text,
  data_type        text not null, -- text/int/numeric/date/jsonb/etc
  ui_type          text,
  is_required      boolean not null default false,
  is_unique        boolean not null default false,
  is_searchable    boolean not null default false,
  is_filterable    boolean not null default false,

  default_value    jsonb,
  validation       jsonb,
  lookup_config    jsonb, -- reference/selector config

  sort_order       int not null default 0,
  is_active        boolean not null default true,

  created_at       timestamptz not null default now(),
  created_by       text not null,
  updated_at       timestamptz,
  updated_by       text,

  constraint field_name_uniq unique (tenant_id, entity_version_id, name)
);

comment on table meta.field is
'Field dictionary per entity_version: column mapping, datatype/ui type, validation/defaults, lookup config.';

create index if not exists idx_field_entity_version
  on meta.field (tenant_id, entity_version_id);

create table if not exists meta.relation (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,
  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  name            text not null,
  relation_kind   text not null, -- belongs_to/has_many/m2m
  target_entity   text not null, -- entity name
  fk_field        text,          -- local field
  target_key      text,          -- target key
  on_delete       text not null default 'restrict',
  ui_behavior     jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,

  constraint relation_kind_chk check (relation_kind in ('belongs_to','has_many','m2m')),
  constraint relation_on_delete_chk check (on_delete in ('restrict','cascade','set_null')),
  constraint relation_name_uniq unique (tenant_id, entity_version_id, name)
);

comment on table meta.relation is 'Relationship model per entity_version: FK wiring, delete rules, UI picker behavior.';

create table if not exists meta.index_def (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,
  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  name            text not null,
  is_unique       boolean not null default false,
  method          text not null default 'btree', -- btree/gin/gist
  columns         jsonb not null,                -- ordered list
  where_clause    text,                          -- partial index filter

  created_at      timestamptz not null default now(),
  created_by      text not null,

  constraint index_method_chk check (method in ('btree','gin','gist','hash')),
  constraint index_def_name_uniq unique (tenant_id, entity_version_id, name)
);

comment on table meta.index_def is 'Declarative index definitions per entity_version (used by migrations).';

create table if not exists meta.entity_policy (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  entity_id        uuid references meta.entity(id) on delete cascade,
  entity_version_id uuid references meta.entity_version(id) on delete cascade,

  access_mode      text not null default 'default_deny',
  ou_scope_mode    text not null default 'none', -- none/single/subtree/multi
  audit_mode       text not null default 'enabled',
  retention_policy jsonb,
  default_filters  jsonb,
  cache_flags      jsonb,

  created_at       timestamptz not null default now(),
  created_by       text not null,
  updated_at       timestamptz,
  updated_by       text,

  constraint entity_policy_access_chk check (access_mode in ('default_deny','default_allow','inherit')),
  constraint entity_policy_ou_chk check (ou_scope_mode in ('none','single','subtree','multi')),
  constraint entity_policy_audit_chk check (audit_mode in ('enabled','disabled')),
  constraint entity_policy_target_chk check (
    (entity_id is not null and entity_version_id is null) or
    (entity_id is null and entity_version_id is not null)
  )
);

comment on table meta.entity_policy is
'Default behavior policy per entity or entity_version (access, OU scope, audit, retention, caching).';

create index if not exists idx_entity_policy_target
  on meta.entity_policy (tenant_id, coalesce(entity_id, entity_version_id));

create table if not exists meta.entity_compiled (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,
  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  compiled_json     jsonb not null,
  compiled_hash     text not null,
  generated_at      timestamptz not null default now(),

  created_at        timestamptz not null default now(),
  created_by        text not null,

  constraint entity_compiled_one_uniq unique (tenant_id, entity_version_id, compiled_hash)
);

comment on table meta.entity_compiled is
'Precompiled snapshot per tenant+entity_version for fast runtime reads (flattened meta).';

create table if not exists meta.overlay (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  name         text not null,
  description  text,
  status       text not null default 'draft', -- draft/published/archived
  created_at   timestamptz not null default now(),
  created_by   text not null,
  updated_at   timestamptz,
  updated_by   text,

  constraint overlay_status_chk check (status in ('draft','published','archived')),
  constraint overlay_name_uniq unique (tenant_id, name)
);

comment on table meta.overlay is
'Overlay container for controlled changes (tenant/app patch packs, hotfixes).';

create table if not exists meta.overlay_change (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  overlay_id    uuid not null references meta.overlay(id) on delete cascade,

  target_entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  change_kind   text not null, -- add_field/modify_field/tweak_policy/add_index/...
  change_json   jsonb not null,
  sort_order    int not null default 0,
  conflict_mode text not null default 'fail', -- fail/overwrite/merge

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint overlay_change_kind_chk check (
    change_kind in ('add_field','modify_field','remove_field','tweak_policy','add_index','remove_index','tweak_relation')
  ),
  constraint overlay_conflict_mode_chk check (conflict_mode in ('fail','overwrite','merge'))
);

comment on table meta.overlay_change is
'Atomic overlay deltas with ordering + conflict rules (review/rollback).';

create index if not exists idx_overlay_change_overlay_order
  on meta.overlay_change (tenant_id, overlay_id, sort_order);

create table if not exists meta.entity_compiled_overlay (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,
  overlay_set       jsonb not null, -- list of overlay ids / versions applied

  compiled_json     jsonb not null,
  compiled_hash     text not null,
  generated_at      timestamptz not null default now(),

  created_at        timestamptz not null default now(),
  created_by        text not null
);

comment on table meta.entity_compiled_overlay is
'Resolved compiled snapshot after overlays applied for deterministic runtime execution.';

create index if not exists idx_entity_compiled_overlay_lookup
  on meta.entity_compiled_overlay (tenant_id, entity_version_id, compiled_hash);

-- ----------------------------------------------------------------------------
-- META: POLICY — Operation / Policy Versioning / Rules / Compiled
-- ----------------------------------------------------------------------------
create table if not exists meta.operation (
  id            uuid primary key default gen_random_uuid(),
  namespace     text not null,
  code          text not null,
  sort_order    int,
  name          text not null,
  description   text,
  source_type   text not null default 'system',
  source_ref    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,
  constraint operation_namespace_chk check (namespace in ('ENTITY','WORKFLOW','UTIL','DELEGATION','COLLAB')),
  constraint operation_code_uniq unique (namespace, code)
);

create table if not exists meta.permission_policy (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  name          text not null,
  description   text,

  scope_type    text not null, -- global/module/entity/entity_version
  scope_key     text,

  source_type   text not null default 'system',
  source_ref    text,
  is_active     boolean not null default true,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint permission_policy_scope_chk check (scope_type in ('global','module','entity','entity_version')),
  constraint permission_policy_name_uniq unique (tenant_id, name)
);

comment on table meta.permission_policy is 'Policy container per tenant/app with versioning control.';

create table if not exists meta.permission_policy_version (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  permission_policy_id uuid not null references meta.permission_policy(id) on delete cascade,

  version_no          int not null default 1,
  status              text not null default 'draft', -- draft/published/archived
  published_at        timestamptz,
  published_by        text,

  created_at          timestamptz not null default now(),
  created_by          text not null,

  constraint policy_version_status_chk check (status in ('draft','published','archived')),
  constraint policy_version_uniq unique (tenant_id, permission_policy_id, version_no)
);

comment on table meta.permission_policy_version is 'Policy versioning & publish lifecycle (immutable once published).';

create table if not exists meta.permission_rule (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,
  policy_version_id    uuid not null references meta.permission_policy_version(id) on delete cascade,

  -- scope target
  scope_type           text not null, -- global/module/entity/entity_version/record
  scope_key            text,

  subject_type         text not null, -- kc_role/kc_group/user/service
  subject_key          text not null,

  effect               text not null, -- allow/deny
  conditions           jsonb,
  priority             int not null default 100,

  is_active            boolean not null default true,
  comment              text,

  created_at           timestamptz not null default now(),
  created_by           text not null,

  constraint rule_scope_chk check (scope_type in ('global','module','entity','entity_version','record')),
  constraint rule_subject_chk check (subject_type in ('kc_role','kc_group','user','service')),
  constraint rule_effect_chk check (effect in ('allow','deny'))
);

comment on table meta.permission_rule is
'Rule logic bound to a specific policy_version (immutable once published): subject + scope + conditions + effect + priority.';

create index if not exists idx_permission_rule_lookup
  on meta.permission_rule (tenant_id, policy_version_id, scope_type, scope_key, subject_type, subject_key, priority);

create table if not exists meta.permission_rule_operation (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,
  permission_rule_id   uuid not null references meta.permission_rule(id) on delete cascade,
  operation_id         uuid not null references meta.operation(id) on delete restrict,

  operation_constraints jsonb, -- optional per-operation constraints

  created_at           timestamptz not null default now(),
  created_by           text not null,

  constraint rule_operation_uniq unique (tenant_id, permission_rule_id, operation_id)
);

create index if not exists idx_rule_operation_op
  on meta.permission_rule_operation (tenant_id, operation_id);

create table if not exists meta.permission_policy_compiled (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  policy_version_id   uuid not null references meta.permission_policy_version(id) on delete cascade,

  compiled_json       jsonb not null, -- decision tree / indexed form
  compiled_hash       text not null,
  generated_at        timestamptz not null default now(),

  created_at          timestamptz not null default now(),
  created_by          text not null,

  constraint policy_compiled_uniq unique (tenant_id, policy_version_id, compiled_hash)
);

comment on table meta.permission_policy_compiled is
'Pre-resolved rule graph per tenant+policy_version for fast evaluation (compiled_hash).';

-- ----------------------------------------------------------------------------
-- META: WF — Lifecycles + Approval Templates + Routing
-- ----------------------------------------------------------------------------
create table if not exists meta.lifecycle (
  id          uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  code        text not null,
  name        text not null,
  description text,
  version_no  int not null default 1,
  is_active   boolean not null default true,

  created_at  timestamptz not null default now(),
  created_by  text not null,

  constraint lifecycle_code_uniq unique (tenant_id, code, version_no)
);

create table if not exists meta.lifecycle_state (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  lifecycle_id  uuid not null references meta.lifecycle(id) on delete cascade,

  code         text not null, -- DRAFT/PENDING/APPROVED...
  name         text not null,
  is_terminal  boolean not null default false,
  sort_order   int not null default 0,

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint lifecycle_state_code_uniq unique (tenant_id, lifecycle_id, code)
);

create table if not exists meta.lifecycle_transition (
  id              uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,
  lifecycle_id     uuid not null references meta.lifecycle(id) on delete cascade,

  from_state_id    uuid not null references meta.lifecycle_state(id) on delete cascade,
  to_state_id      uuid not null references meta.lifecycle_state(id) on delete cascade,

  operation_code   text not null, -- SUBMIT/APPROVE/REJECT/CANCEL...
  is_active        boolean not null default true,

  created_at       timestamptz not null default now(),
  created_by       text not null
);

create index if not exists idx_transition_lookup
  on meta.lifecycle_transition (tenant_id, lifecycle_id, from_state_id, operation_code);

create table if not exists meta.lifecycle_transition_gate (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  transition_id       uuid not null references meta.lifecycle_transition(id) on delete cascade,

  required_operations jsonb, -- operation codes or operation ids list
  approval_template_id uuid,
  conditions           jsonb,
  threshold_rules      jsonb,

  created_at           timestamptz not null default now(),
  created_by           text not null
);

comment on table meta.lifecycle_transition_gate is
'Gate bindings: required permission ops, approval template, conditions, thresholds.';

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

create table if not exists meta.approval_template_stage (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,
  approval_template_id uuid not null references meta.approval_template(id) on delete cascade,

  stage_no             int not null,
  name                 text,
  mode                 text not null default 'serial', -- serial/parallel
  quorum               jsonb,

  created_at           timestamptz not null default now(),
  created_by           text not null,

  constraint stage_mode_chk check (mode in ('serial','parallel')),
  constraint template_stage_uniq unique (tenant_id, approval_template_id, stage_no)
);

create table if not exists meta.approval_template_rule (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,
  approval_template_id uuid not null references meta.approval_template(id) on delete cascade,

  priority             int not null default 100,
  conditions           jsonb not null, -- OU/amount/etc
  assign_to            jsonb not null, -- role/group/principal mapping

  created_at           timestamptz not null default now(),
  created_by           text not null
);

create index if not exists idx_approval_template_rule
  on meta.approval_template_rule (tenant_id, approval_template_id, priority);

create table if not exists meta.approval_sla_policy (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  timers       jsonb not null, -- reminders/escalation
  escalation_chain jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint approval_sla_code_uniq unique (tenant_id, code)
);

create table if not exists meta.lifecycle_timer_policy (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  rules        jsonb not null, -- auto-close/auto-cancel/reminders

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint lifecycle_timer_policy_code_uniq unique (tenant_id, code)
);

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

create index if not exists idx_entity_lifecycle_resolution
  on meta.entity_lifecycle (tenant_id, entity_name, priority);

create table if not exists meta.entity_lifecycle_route_compiled (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  entity_name   text not null,
  compiled_json jsonb not null,
  compiled_hash text not null,
  generated_at  timestamptz not null default now(),

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint route_compiled_uniq unique (tenant_id, entity_name, compiled_hash)
);

-- ----------------------------------------------------------------------------
-- CORE: WF Runtime (High volume)
-- ----------------------------------------------------------------------------
create table if not exists core.entity_lifecycle_instance (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  entity_name    text not null,
  entity_id      text not null,

  lifecycle_id   uuid not null references meta.lifecycle(id),
  state_id       uuid not null references meta.lifecycle_state(id),

  updated_at     timestamptz not null default now(),
  updated_by     text not null,

  constraint lifecycle_instance_uniq unique (tenant_id, entity_name, entity_id)
);

create index if not exists idx_lifecycle_instance_state
  on core.entity_lifecycle_instance (tenant_id, entity_name, state_id);

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

create index if not exists idx_lifecycle_event_tenant_time
  on core.entity_lifecycle_event (tenant_id, occurred_at desc);

create table if not exists core.approval_instance (
  id              uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,

  entity_name      text not null,
  entity_id        text not null,

  transition_id    uuid,
  approval_template_id uuid,
  status           text not null default 'open',

  created_at       timestamptz not null default now(),
  created_by       text not null,

  constraint approval_instance_status_chk check (status in ('open','completed','canceled'))
);

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

create index if not exists idx_approval_stage_instance
  on core.approval_stage (tenant_id, approval_instance_id, stage_no);

create table if not exists core.approval_task (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,
  approval_stage_id    uuid not null references core.approval_stage(id) on delete cascade,

  assignee_principal_id uuid,
  assignee_group_id     uuid,

  task_type            text not null default 'approver', -- approver/reviewer/watcher
  status               text not null default 'pending',  -- pending/approved/rejected/canceled/expired
  due_at               timestamptz,

  decided_at           timestamptz,
  decided_by           uuid,
  decision_note        text,

  created_at           timestamptz not null default now(),

  constraint approval_task_type_chk check (task_type in ('approver','reviewer','watcher')),
  constraint approval_task_status_chk check (status in ('pending','approved','rejected','canceled','expired'))
);

create index if not exists idx_approval_task_assignee
  on core.approval_task (tenant_id, coalesce(assignee_principal_id, assignee_group_id), status);

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

create table if not exists core.approval_escalation (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,
  kind               text not null, -- reminder/escalation/reassign
  payload            jsonb,
  occurred_at         timestamptz not null default now(),

  constraint approval_escalation_kind_chk check (kind in ('reminder','escalation','reassign'))
);

create index if not exists idx_approval_escalation_time
  on core.approval_escalation (tenant_id, occurred_at desc);

create table if not exists core.lifecycle_timer (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  entity_name    text not null,
  entity_id      text not null,

  policy_code    text,
  fire_at        timestamptz not null,
  status         text not null default 'scheduled',
  attempts       int not null default 0,

  last_error     text,

  created_at     timestamptz not null default now(),

  constraint lifecycle_timer_status_chk check (status in ('scheduled','running','completed','failed','canceled'))
);

create index if not exists idx_lifecycle_timer_pick
  on core.lifecycle_timer (tenant_id, status, fire_at);

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

create index if not exists idx_approval_event_tenant_time
  on core.approval_event (tenant_id, occurred_at desc);

-- ----------------------------------------------------------------------------
-- REF: Global Reference Data (shared, NOT tenant-scoped)
-- ----------------------------------------------------------------------------
create table if not exists ref.currency (
  code         text primary key,
  name         text,
  symbol       text,
  minor_units  int
);

create table if not exists ref.uom (
  code         text primary key,
  name         text
);

create table if not exists ref.commodity_code (
  code         text primary key,
  scheme       text, -- UNSPSC/custom
  name         text,
  parent_code  text
);

create index if not exists idx_commodity_parent
  on ref.commodity_code (parent_code);

create table if not exists ref.language (
  code         text primary key, -- en/ar/fr
  name         text
);

create table if not exists ref.locale (
  code         text primary key, -- en-US/ar-SA
  language     text,
  is_rtl       boolean not null default false
);

create table if not exists ref.country (
  code         text primary key, -- ISO country
  name         text,
  currency_code text
);

create table if not exists ref.registration_kind (
  code         text primary key, -- CR/VAT/GST/EIN/...
  name         text
);

create table if not exists ref.contact_channel_type (
  code         text primary key, -- email/phone/whatsapp/website
  name         text
);

create table if not exists ref.tax_identifier_type (
  code         text primary key, -- SSN/TIN/PAN/...
  name         text
);

create table if not exists ref.issuing_authority (
  id           uuid primary key default gen_random_uuid(),
  country_code text,
  name         text not null
);

-- ----------------------------------------------------------------------------
-- MDM: Company Code / Cost Center / Project / WBS (tenant-scoped)
-- ----------------------------------------------------------------------------
create table if not exists mdm.company_code (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  code          text not null,
  name          text not null,
  base_currency text,
  country_code  text,

  ou_node_id    uuid references core.ou_node(id),

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint company_code_uniq unique (tenant_id, code)
);

create table if not exists mdm.cost_center (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  company_code_id uuid references mdm.company_code(id) on delete set null,
  code          text not null,
  name          text not null,

  ou_node_id    uuid references core.ou_node(id),

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint cost_center_uniq unique (tenant_id, code)
);

create table if not exists mdm.project (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  code          text not null,
  name          text not null,
  project_kind  text not null default 'internal', -- internal/external
  status        text not null default 'active',

  ou_node_id    uuid references core.ou_node(id),

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint project_kind_chk check (project_kind in ('internal','external')),
  constraint project_status_chk check (status in ('active','closed','archived')),
  constraint project_uniq unique (tenant_id, code)
);

create table if not exists mdm.wbs_element (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  project_id    uuid not null references mdm.project(id) on delete cascade,
  parent_id     uuid references mdm.wbs_element(id) on delete set null,

  code          text not null,
  name          text not null,
  path          text, -- optional materialized path
  depth         int not null default 0,

  ou_node_id    uuid references core.ou_node(id),

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint wbs_code_uniq unique (tenant_id, project_id, code)
);

create index if not exists idx_wbs_project
  on mdm.wbs_element (tenant_id, project_id);

-- ----------------------------------------------------------------------------
-- DONE
-- ----------------------------------------------------------------------------
