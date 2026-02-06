/* ============================================================================
   Athyper — META: Entity Registry + Versioning + Fields + Relations +
                   Indexes + Policies + Compiled Snapshots
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- META: Entity Registry
-- ----------------------------------------------------------------------------
create table if not exists meta.entity (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  module_id     text not null,           -- META/ACC/BUY/...
  name          text not null,           -- stable entity name (DocType)
  kind          text not null default 'ent',
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

create index if not exists idx_entity_module
  on meta.entity (tenant_id, module_id);

-- ----------------------------------------------------------------------------
-- META: Entity Versioning
-- ----------------------------------------------------------------------------
create table if not exists meta.entity_version (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  entity_id     uuid not null references meta.entity(id) on delete cascade,

  version_no    int not null default 1,
  status        text not null default 'draft',
  label         text,
  behaviors     jsonb,

  published_at  timestamptz,
  published_by  text,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint entity_version_status_chk check (status in ('draft','published','archived')),
  constraint entity_version_uniq unique (tenant_id, entity_id, version_no)
);

comment on table meta.entity_version is 'Versioned entity definition (draft -> published -> archived).';

create index if not exists idx_entity_version_entity_status
  on meta.entity_version (tenant_id, entity_id, status);

-- ----------------------------------------------------------------------------
-- META: Field Dictionary
-- ----------------------------------------------------------------------------
create table if not exists meta.field (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,
  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  name             text not null,
  column_name      text,
  data_type        text not null,
  ui_type          text,
  is_required      boolean not null default false,
  is_unique        boolean not null default false,
  is_searchable    boolean not null default false,
  is_filterable    boolean not null default false,

  default_value    jsonb,
  validation       jsonb,
  lookup_config    jsonb,

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

-- ----------------------------------------------------------------------------
-- META: Relations
-- ----------------------------------------------------------------------------
create table if not exists meta.relation (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,
  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  name            text not null,
  relation_kind   text not null,
  target_entity   text not null,
  fk_field        text,
  target_key      text,
  on_delete       text not null default 'restrict',
  ui_behavior     jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,

  constraint relation_kind_chk check (relation_kind in ('belongs_to','has_many','m2m')),
  constraint relation_on_delete_chk check (on_delete in ('restrict','cascade','set_null')),
  constraint relation_name_uniq unique (tenant_id, entity_version_id, name)
);

comment on table meta.relation is 'Relationship model per entity_version: FK wiring, delete rules, UI picker behavior.';

-- ----------------------------------------------------------------------------
-- META: Index Definitions
-- ----------------------------------------------------------------------------
create table if not exists meta.index_def (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,
  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  name            text not null,
  is_unique       boolean not null default false,
  method          text not null default 'btree',
  columns         jsonb not null,
  where_clause    text,

  created_at      timestamptz not null default now(),
  created_by      text not null,

  constraint index_method_chk check (method in ('btree','gin','gist','hash')),
  constraint index_def_name_uniq unique (tenant_id, entity_version_id, name)
);

comment on table meta.index_def is 'Declarative index definitions per entity_version (used by migrations).';

-- ----------------------------------------------------------------------------
-- META: Entity Policy
-- ----------------------------------------------------------------------------
create table if not exists meta.entity_policy (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  entity_id        uuid references meta.entity(id) on delete cascade,
  entity_version_id uuid references meta.entity_version(id) on delete cascade,

  access_mode      text not null default 'default_deny',
  ou_scope_mode    text not null default 'none',
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

-- two partial indexes instead of coalesce for better query planner support
create index if not exists idx_entity_policy_entity
  on meta.entity_policy (tenant_id, entity_id) where entity_id is not null;

create index if not exists idx_entity_policy_version
  on meta.entity_policy (tenant_id, entity_version_id) where entity_version_id is not null;

-- ----------------------------------------------------------------------------
-- META: Compiled Entity Snapshot (base, no overlays)
-- ----------------------------------------------------------------------------
create table if not exists meta.entity_compiled (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,
  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,

  compiled_json     jsonb not null,
  compiled_hash     text not null,
  generated_at      timestamptz not null default now(),

  created_at        timestamptz not null default now(),
  created_by        text not null,

  constraint entity_compiled_hash_uniq unique (tenant_id, entity_version_id, compiled_hash)
);

comment on table meta.entity_compiled is
'Precompiled snapshot per tenant+entity_version for fast runtime reads (flattened meta).';
