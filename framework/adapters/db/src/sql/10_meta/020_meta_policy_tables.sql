/* ============================================================================
   Athyper — META: POLICY — Policy Versioning / Rules / Compiled
   PostgreSQL 16+ (pgcrypto)

   NOTE: Operations are defined in core.operation (20_core/042_permission_action_model.sql).
         This file defines the policy framework that references those operations.
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- META: Permission Policy (tenant-scoped container)
-- ----------------------------------------------------------------------------
create table if not exists meta.permission_policy (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  name          text not null,
  description   text,

  scope_type    text not null,
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

-- ----------------------------------------------------------------------------
-- META: Permission Policy Version
-- ----------------------------------------------------------------------------
create table if not exists meta.permission_policy_version (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  permission_policy_id uuid not null references meta.permission_policy(id) on delete cascade,

  version_no          int not null default 1,
  status              text not null default 'draft',
  published_at        timestamptz,
  published_by        text,

  created_at          timestamptz not null default now(),
  created_by          text not null,

  constraint policy_version_status_chk check (status in ('draft','published','archived')),
  constraint policy_version_uniq unique (tenant_id, permission_policy_id, version_no)
);

comment on table meta.permission_policy_version is 'Policy versioning & publish lifecycle (immutable once published).';

-- ----------------------------------------------------------------------------
-- META: Permission Rules
-- ----------------------------------------------------------------------------
create table if not exists meta.permission_rule (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,
  policy_version_id    uuid not null references meta.permission_policy_version(id) on delete cascade,

  scope_type           text not null,
  scope_key            text,

  subject_type         text not null,
  subject_key          text not null,

  effect               text not null,
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

-- ----------------------------------------------------------------------------
-- META: Permission Rule <-> Operation junction
-- NOTE: References core.operation (defined in 20_core/042_permission_action_model.sql)
-- ----------------------------------------------------------------------------
create table if not exists meta.permission_rule_operation (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,
  permission_rule_id   uuid not null references meta.permission_rule(id) on delete cascade,
  operation_id         uuid not null references core.operation(id) on delete restrict,

  operation_constraints jsonb,

  created_at           timestamptz not null default now(),
  created_by           text not null,

  constraint rule_operation_uniq unique (tenant_id, permission_rule_id, operation_id)
);

comment on table meta.permission_rule_operation is
'Junction linking permission rules to operations with optional per-operation constraints.';

create index if not exists idx_rule_operation_op
  on meta.permission_rule_operation (tenant_id, operation_id);

-- ----------------------------------------------------------------------------
-- META: Permission Policy Compiled
-- ----------------------------------------------------------------------------
create table if not exists meta.permission_policy_compiled (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,
  policy_version_id   uuid not null references meta.permission_policy_version(id) on delete cascade,

  compiled_json       jsonb not null,
  compiled_hash       text not null,
  generated_at        timestamptz not null default now(),

  created_at          timestamptz not null default now(),
  created_by          text not null,

  constraint policy_compiled_hash_uniq unique (tenant_id, policy_version_id, compiled_hash)
);

comment on table meta.permission_policy_compiled is
'Pre-resolved rule graph per tenant+policy_version for fast evaluation (compiled_hash).';
