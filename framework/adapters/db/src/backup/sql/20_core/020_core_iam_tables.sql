/* ============================================================================
   Athyper — Core IAM Tables (Phase B1-B6)

   B1. Canonical Identity Model (principal, idp_identity, principal_profile)
   B2. Tenant Resolution       (tenant_profile — consolidated)
   B3. Groups Model            (group, group_member)
   B4. Roles + Role Bindings   (role, role_binding)
   B5. OU Hierarchy            (ou_node, principal_attribute)
   B6. Entitlement Snapshot    (entitlement_snapshot)

   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- B1: Canonical Identity Model
-- ============================================================================

create table if not exists core.principal (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  realm_key       text not null,

  principal_type  text not null,
  principal_code  text not null unique,
  display_name    text not null,
  email           text,
  avatar_url      text,

  is_active       boolean not null default true,
  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  deleted_at      timestamptz,
  deleted_by      text,
  version         integer not null default 1,

  constraint principal_type_chk check (principal_type in ('user','service','system'))
);

comment on table core.principal is 'Canonical athyper actor (user, service, system).';

create index if not exists idx_principal_tenant on core.principal (tenant_id);
create index if not exists idx_principal_code on core.principal (principal_code);
create index if not exists idx_principal_type on core.principal (principal_type);
create index if not exists idx_principal_active on core.principal (is_active) where deleted_at is null;

-- ----------------------------------------------------------------------------
create table if not exists core.idp_identity (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,
  realm_key       text not null,

  provider        text not null,
  subject         text not null,
  email           text,
  claims          jsonb,

  last_login_at   timestamptz,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  version         integer not null default 1,

  constraint idp_identity_uniq unique (tenant_id, realm_key, provider, subject)
);

comment on table core.idp_identity is 'Maps external IdP identities (user.sub) to athyper principals.';

create index if not exists idx_idp_identity_principal on core.idp_identity (principal_id);
create index if not exists idx_idp_identity_tenant on core.idp_identity (tenant_id);
create index if not exists idx_idp_identity_subject on core.idp_identity (subject);
create index if not exists idx_idp_identity_email on core.idp_identity (email) where email is not null;

-- ----------------------------------------------------------------------------
create table if not exists core.principal_profile (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  first_name      text,
  last_name       text,
  phone           text,
  timezone        text,
  locale          text,
  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  version         integer not null default 1,

  constraint principal_profile_uniq unique (principal_id)
);

comment on table core.principal_profile is 'Extended profile attributes for principals.';

create index if not exists idx_principal_profile_principal on core.principal_profile (principal_id);

-- ============================================================================
-- B2: Tenant Resolution (consolidated tenant_profile)
-- ============================================================================

create table if not exists core.tenant_profile (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  country         text,
  currency        text,
  locale          text,
  timezone        text,
  fiscal_year_start_month int,

  config_defaults jsonb,
  features        jsonb,
  policies        jsonb,
  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,

  constraint tenant_profile_tenant_uniq unique (tenant_id)
);

comment on table core.tenant_profile is
'Tenant operational defaults (currency, locale, timezone, fiscal, config, features, policies).';

create index if not exists idx_tenant_profile_tenant on core.tenant_profile (tenant_id);

-- ============================================================================
-- B3: Groups Model
-- ============================================================================

create table if not exists core."group" (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  realm_key       text not null,

  group_code      text not null,
  display_name    text not null,
  description     text,

  source_type     text not null default 'local',
  source_ref      text,
  is_active       boolean not null default true,
  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  deleted_at      timestamptz,
  deleted_by      text,
  version         integer not null default 1,

  constraint group_source_chk check (source_type in ('local','idp','import')),
  constraint group_code_uniq unique (tenant_id, group_code)
);

comment on table core."group" is 'Groups (IdP-synced or athyper-native).';

-- partial unique index for source_ref (replaces invalid UNIQUE ... WHERE syntax)
create unique index if not exists idx_group_source_ref_uniq
  on core."group" (tenant_id, source_ref) where source_ref is not null;

create index if not exists idx_group_tenant on core."group" (tenant_id);
create index if not exists idx_group_source_type on core."group" (source_type);
create index if not exists idx_group_active on core."group" (is_active) where deleted_at is null;

-- ----------------------------------------------------------------------------
create table if not exists core.group_member (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  group_id        uuid not null references core."group"(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  is_active       boolean not null default true,
  valid_from      timestamptz,
  valid_until     timestamptz,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  version         integer not null default 1,

  constraint group_member_uniq unique (group_id, principal_id)
);

comment on table core.group_member is 'Group membership (principal <-> group).';

create index if not exists idx_group_member_group on core.group_member (group_id);
create index if not exists idx_group_member_principal on core.group_member (principal_id);
create index if not exists idx_group_member_tenant on core.group_member (tenant_id);
create index if not exists idx_group_member_active on core.group_member (is_active);

-- ============================================================================
-- B4: Roles + Role Bindings
-- ============================================================================

create table if not exists core.role (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  realm_key       text not null,

  role_code       text not null,
  display_name    text not null,
  description     text,

  permissions     text[] not null default '{}',
  scope_mode      text not null default 'tenant',
  is_system       boolean not null default false,
  is_active       boolean not null default true,
  config          jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  deleted_at      timestamptz,
  deleted_by      text,
  version         integer not null default 1,

  constraint role_scope_mode_chk check (scope_mode in ('tenant','ou','entity')),
  constraint role_code_uniq unique (tenant_id, role_code)
);

comment on table core.role is 'Role definitions with permissions (action:resource).';

create index if not exists idx_role_tenant on core.role (tenant_id);
create index if not exists idx_role_code on core.role (role_code);
create index if not exists idx_role_system on core.role (is_system);
create index if not exists idx_role_active on core.role (is_active) where deleted_at is null;

-- ----------------------------------------------------------------------------
create table if not exists core.role_binding (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  realm_key       text not null,

  role_id         uuid not null references core.role(id) on delete cascade,
  principal_id    uuid references core.principal(id) on delete cascade,
  group_id        uuid references core."group"(id) on delete cascade,

  scope_kind      text not null default 'tenant',
  scope_key       text,

  is_active       boolean not null default true,
  valid_from      timestamptz,
  valid_until     timestamptz,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  deleted_at      timestamptz,
  deleted_by      text,
  version         integer not null default 1,

  constraint role_binding_scope_chk check (scope_kind in ('tenant','ou','entity')),
  constraint role_binding_subject_chk check (
    (principal_id is not null and group_id is null) or
    (principal_id is null and group_id is not null)
  ),
  constraint role_binding_validity_chk check (
    valid_from is null or valid_until is null or valid_from < valid_until
  )
);

comment on table core.role_binding is 'Binds roles to principals or groups (with optional scoping).';

create index if not exists idx_role_binding_role on core.role_binding (role_id);
create index if not exists idx_role_binding_principal on core.role_binding (principal_id) where principal_id is not null;
create index if not exists idx_role_binding_group on core.role_binding (group_id) where group_id is not null;
create index if not exists idx_role_binding_tenant on core.role_binding (tenant_id);
create index if not exists idx_role_binding_scope on core.role_binding (scope_kind, scope_key);
create index if not exists idx_role_binding_active on core.role_binding (is_active);
create index if not exists idx_role_binding_validity on core.role_binding (valid_from, valid_until)
  where valid_from is not null or valid_until is not null;

-- ============================================================================
-- B5: OU Hierarchy & Membership
-- ============================================================================

create table if not exists core.ou_node (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  realm_key       text not null,

  parent_node_id  uuid references core.ou_node(id) on delete cascade,
  path            text not null,
  depth           integer not null default 0,

  ou_code         text not null,
  display_name    text not null,
  description     text,

  is_active       boolean not null default true,
  config          jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  deleted_at      timestamptz,
  deleted_by      text,
  version         integer not null default 1,

  constraint ou_node_code_uniq unique (tenant_id, ou_code),
  constraint ou_node_path_uniq unique (tenant_id, path)
);

comment on table core.ou_node is 'Organizational Unit hierarchy (materialized path).';

create index if not exists idx_ou_node_tenant on core.ou_node (tenant_id);
create index if not exists idx_ou_node_parent on core.ou_node (parent_node_id) where parent_node_id is not null;
create index if not exists idx_ou_node_path on core.ou_node (path);
create index if not exists idx_ou_node_depth on core.ou_node (depth);
create index if not exists idx_ou_node_active on core.ou_node (is_active) where deleted_at is null;

-- ----------------------------------------------------------------------------
create table if not exists core.principal_attribute (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  attribute_key   text not null,
  attribute_value text not null,

  valid_from      timestamptz,
  valid_until     timestamptz,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  version         integer not null default 1,

  constraint principal_attribute_uniq unique (principal_id, attribute_key)
);

comment on table core.principal_attribute is 'ABAC attributes and OU membership for principals.';

create index if not exists idx_principal_attribute_principal on core.principal_attribute (principal_id);
create index if not exists idx_principal_attribute_key on core.principal_attribute (attribute_key);
create index if not exists idx_principal_attribute_key_value on core.principal_attribute (attribute_key, attribute_value);
create index if not exists idx_principal_attribute_ou_node on core.principal_attribute (attribute_value)
  where attribute_key = 'ou_node_id';
create index if not exists idx_principal_attribute_ou_path on core.principal_attribute (attribute_value)
  where attribute_key = 'ou_path';

-- ============================================================================
-- B6: Entitlement Snapshot Cache
-- ============================================================================

create table if not exists core.entitlement_snapshot (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  snapshot        jsonb not null,
  expires_at      timestamptz not null,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz,

  constraint entitlement_snapshot_uniq unique (tenant_id, principal_id)
);

comment on table core.entitlement_snapshot is 'TTL-cached effective entitlements (roles, groups, OU, permissions).';

create index if not exists idx_entitlement_snapshot_tenant on core.entitlement_snapshot (tenant_id);
create index if not exists idx_entitlement_snapshot_principal on core.entitlement_snapshot (principal_id);
create index if not exists idx_entitlement_snapshot_expires on core.entitlement_snapshot (expires_at);
