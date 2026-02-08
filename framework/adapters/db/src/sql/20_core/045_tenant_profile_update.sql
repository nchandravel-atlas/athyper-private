/* ============================================================================
   Athyper — CORE: Workspace + Feature Catalog + Tenant Feature Subscriptions
   Additive migration on top of existing core.module + core.tenant_module_subscription
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: Workspace Definitions (Business Domains)
-- ============================================================================

create table if not exists core.workspace (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text not null,
  description   text,

  is_active     boolean not null default true,
  sort_order    integer not null default 0,

  config        jsonb,
  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'system',
  updated_at    timestamptz,
  updated_by    text
);

comment on table core.workspace is
'Workspace definitions (Business Domains) that group modules for navigation, packaging, and authorization.';

create index if not exists idx_workspace_code
  on core.workspace (code);

create index if not exists idx_workspace_active
  on core.workspace (is_active) where is_active = true;

-- ============================================================================
-- CORE: Link Module -> Workspace (1 workspace to many modules)
-- ============================================================================

alter table core.module
  add column if not exists workspace_id uuid
    references core.workspace(id) on delete set null;

create index if not exists idx_module_workspace
  on core.module (workspace_id);

comment on column core.module.workspace_id is
'Optional workspace (business domain) that owns/groups this module.';

-- ============================================================================
-- CORE: Feature Definitions (Capabilities) linked to Modules
-- ============================================================================

create table if not exists core.feature (
  id              uuid primary key default gen_random_uuid(),
  module_id        uuid not null references core.module(id) on delete cascade,

  code            text not null,
  name            text not null,
  description     text,

  is_active       boolean not null default true,
  sort_order      integer not null default 0,

  -- If true, feature is enabled for tenant whenever the module is subscribed,
  -- without needing a tenant_feature_subscription row.
  default_enabled boolean not null default false,

  config          jsonb,
  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null default 'system',
  updated_at      timestamptz,
  updated_by      text,

  constraint feature_code_uniq unique (module_id, code)
);

comment on table core.feature is
'Feature registry (capabilities) linked to modules; used for UI routing and fine-grained entitlements.';

create index if not exists idx_feature_module
  on core.feature (module_id);

create index if not exists idx_feature_code
  on core.feature (code);

create index if not exists idx_feature_active
  on core.feature (is_active) where is_active = true;

-- ============================================================================
-- CORE: Tenant Feature Subscriptions (fine-grained capability gating)
-- ============================================================================

create table if not exists core.tenant_feature_subscription (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  feature_id    uuid not null references core.feature(id) on delete cascade,

  is_active     boolean not null default true,
  valid_from    timestamptz not null default now(),
  valid_until   timestamptz,
  config        jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint tenant_feature_subscription_uniq unique (tenant_id, feature_id),
  constraint tenant_feature_subscription_validity_chk
    check (valid_from is null or valid_until is null or valid_from < valid_until)
);

comment on table core.tenant_feature_subscription is
'Tenant subscriptions to features with activation dates; fine-grained capability control under a module subscription.';

create index if not exists idx_tenant_feature_tenant
  on core.tenant_feature_subscription (tenant_id);

create index if not exists idx_tenant_feature_feature
  on core.tenant_feature_subscription (feature_id);

create index if not exists idx_tenant_feature_active
  on core.tenant_feature_subscription (is_active) where is_active = true;

-- ============================================================================
-- OPTIONAL: Effective entitlement view (module subscription + feature defaults/overrides)
-- Enable if you want a stable read model for UI/runtime.
-- ============================================================================
create or replace view core.v_tenant_enabled_feature as
select
  tms.tenant_id,
  f.id        as feature_id,
  f.module_id as module_id,
  f.code      as feature_code,
  f.name      as feature_name,
  (f.default_enabled or (tfs.id is not null)) as enabled
from core.feature f
join core.tenant_module_subscription tms
  on tms.module_id = f.module_id
  and tms.is_active = true
  and (tms.valid_until is null or tms.valid_until > now())
left join core.tenant_feature_subscription tfs
  on tfs.tenant_id = tms.tenant_id
  and tfs.feature_id = f.id
  and tfs.is_active = true
  and (tfs.valid_until is null or tfs.valid_until > now())
where f.is_active = true;

comment on view core.v_tenant_enabled_feature is
'Effective feature enablement per tenant: requires active module subscription plus (feature default_enabled OR tenant feature subscription).';

-- ============================================================================
-- OPTIONAL: Entity -> Feature mapping (only if you need feature-level entity gating)
-- Keep commented until required.
-- ============================================================================
/*
create table if not exists core.entity_feature (
  id          uuid primary key default gen_random_uuid(),
  entity_key  text not null,
  feature_id  uuid not null references core.feature(id) on delete cascade,

  created_at  timestamptz not null default now(),
  created_by  text not null default 'system',

  constraint entity_feature_uniq unique (entity_key, feature_id)
);

comment on table core.entity_feature is
'Optional mapping of entities to features for fine-grained gating of entity screens/actions.';

create index if not exists idx_entity_feature_entity
  on core.entity_feature (entity_key);

create index if not exists idx_entity_feature_feature
  on core.entity_feature (feature_id);
*/
