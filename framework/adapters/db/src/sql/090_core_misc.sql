/* ============================================================================
   Athyper — CORE: Miscellaneous
   Address Link (entity-address association), Tenant Locale Policy

   PostgreSQL 16+ (pgcrypto)

   MERGED: address link from 046_address_link.sql
   ============================================================================ */

-- ============================================================================
-- Deferred FK: field_access_log.policy_id → meta.field_security_policy
-- (Deferred because core_foundation runs before meta_tables)
-- ============================================================================
alter table core.field_access_log
  drop constraint if exists field_access_log_policy_fk;

alter table core.field_access_log
  add constraint field_access_log_policy_fk
  foreign key (policy_id) references meta.field_security_policy(id)
  on delete set null;

-- ============================================================================
-- Deferred FK: module.workspace_id → core.workspace
-- (Deferred because core_permissions runs before core_workspace)
-- ============================================================================
alter table core.module
  drop constraint if exists module_workspace_fk;

alter table core.module
  add constraint module_workspace_fk
  foreign key (workspace_id) references core.workspace(id)
  on delete set null;

-- ============================================================================
-- CORE: Address Link (entity-address association)
-- Maps addresses to entities (customers, employees, etc.)
-- ============================================================================
create table if not exists core.address_link (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  owner_type     text not null,
  owner_id       uuid not null,

  address_id     uuid not null references core.address(id) on delete cascade,

  purpose        text not null,
  priority       int not null default 0,
  is_primary     boolean not null default false,

  effective_from timestamptz not null default now(),
  effective_until timestamptz,

  metadata       jsonb,

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text,

  constraint address_link_owner_purpose_address_uniq
    unique (tenant_id, owner_type, owner_id, purpose, address_id),
  constraint address_link_purpose_chk check (
    purpose in ('billing','shipping','mailing','office','home','hq','legal','other')
  )
);

comment on table core.address_link is
'Entity-address association (tenant/customer/employee/org address links).';

create index if not exists idx_address_link_owner
  on core.address_link (tenant_id, owner_type, owner_id);

create index if not exists idx_address_link_address
  on core.address_link (address_id);

create index if not exists idx_address_link_purpose
  on core.address_link (tenant_id, purpose);

create index if not exists idx_address_link_primary
  on core.address_link (tenant_id, owner_type, owner_id) where is_primary = true;

-- ============================================================================
-- CORE: Tenant Locale Policy (regional/locale configuration)
-- ============================================================================
create table if not exists core.tenant_locale_policy (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references core.tenant(id) on delete cascade,

  code                  text not null,
  name                  text,

  -- Language/regional defaults
  default_locale        text not null default 'en-US',
  default_timezone      text not null default 'UTC',
  default_currency      text not null default 'USD',
  default_date_format   text not null default 'MM/dd/yyyy',
  default_time_format   text not null default 'hh:mm:ss a',
  default_decimal_sep   text not null default '.',
  default_thousands_sep text not null default ',',

  -- Compliance/regulatory
  data_residency        text,
  language_requirements text[],

  -- Contact/communication
  phone_format_hint     text,
  postal_code_pattern   text,

  metadata              jsonb,

  created_at            timestamptz not null default now(),
  created_by            text not null,
  updated_at            timestamptz,
  updated_by            text,

  constraint tenant_locale_policy_tenant_code_uniq unique (tenant_id, code)
);

comment on table core.tenant_locale_policy is
'Tenant-specific locale, regional, and compliance policies.';

comment on column core.tenant_locale_policy.data_residency is
'e.g., EU, US, APAC for GDPR/data sovereignty compliance.';

create index if not exists idx_tenant_locale_policy_tenant
  on core.tenant_locale_policy (tenant_id);

create index if not exists idx_tenant_locale_policy_code
  on core.tenant_locale_policy (tenant_id, code);

-- ============================================================================
-- CORE: Tenant Locale Assignment (principal-specific locale override)
-- ============================================================================
create table if not exists core.principal_locale_override (
  id                         uuid primary key default gen_random_uuid(),
  tenant_id                  uuid not null references core.tenant(id) on delete cascade,
  principal_id               uuid not null references core.principal(id) on delete cascade,

  preferred_locale           text not null,
  preferred_timezone         text not null,
  preferred_currency         text,
  preferred_date_format      text,
  preferred_time_format      text,

  created_at                 timestamptz not null default now(),
  created_by                 text not null,
  updated_at                 timestamptz,
  updated_by                 text,

  constraint principal_locale_override_principal_uniq unique (principal_id)
);

comment on table core.principal_locale_override is
'Per-principal locale/timezone/currency preferences (overrides tenant policy).';

create index if not exists idx_principal_locale_override_principal
  on core.principal_locale_override (principal_id);

-- ============================================================================
-- CORE: Entity Tag (flexible entity tagging)
-- ============================================================================
create table if not exists core.entity_tag (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  entity_type  text not null,
  entity_id    uuid not null,

  tag_key      text not null,
  tag_value    text,

  created_at   timestamptz not null default now(),
  created_by   text not null,

  constraint entity_tag_entity_tag_uniq unique (entity_type, entity_id, tag_key)
);

comment on table core.entity_tag is 'Generic entity tagging (key-value metadata).';

create index if not exists idx_entity_tag_entity
  on core.entity_tag (tenant_id, entity_type, entity_id);

create index if not exists idx_entity_tag_key_value
  on core.entity_tag (tenant_id, tag_key, tag_value);

-- ============================================================================
-- CORE: System Configuration (key-value configuration store)
-- ============================================================================
create table if not exists core.system_config (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid references core.tenant(id) on delete cascade,

  config_key    text not null,
  config_value  text not null,
  config_type   text not null default 'string',
  description   text,

  is_encrypted  boolean not null default false,
  is_global     boolean not null default false,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint system_config_type_chk check (
    config_type in ('string', 'integer', 'boolean', 'json', 'secret')
  )
);

-- Functional unique index: one key per tenant (NULL tenant coalesced to sentinel)
create unique index if not exists idx_system_config_key_uniq
  on core.system_config (coalesce(tenant_id, '00000000-0000-0000-0000-000000000000'::uuid), config_key);

comment on table core.system_config is
'Tenant-scoped or global configuration key-value store.';

create index if not exists idx_system_config_tenant_key
  on core.system_config (tenant_id, config_key);

create index if not exists idx_system_config_global
  on core.system_config (config_key) where is_global = true;

-- ============================================================================
-- CORE: Feature Flag (runtime feature toggles)
-- ============================================================================
create table if not exists core.feature_flag (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  flag_key      text not null,
  flag_name     text,
  description   text,

  is_enabled    boolean not null default false,
  enabled_at    timestamptz,
  disabled_at   timestamptz,

  rollout_pct   int default 100,

  config        jsonb,
  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint feature_flag_tenant_key_uniq unique (tenant_id, flag_key),
  constraint feature_flag_rollout_pct_chk check (rollout_pct >= 0 and rollout_pct <= 100)
);

comment on table core.feature_flag is 'Feature toggles with rollout percentage.';

create index if not exists idx_feature_flag_tenant_enabled
  on core.feature_flag (tenant_id, is_enabled);
