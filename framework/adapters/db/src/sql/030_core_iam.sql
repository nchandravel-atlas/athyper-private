/* ============================================================================
   Athyper — CORE: Identity & Access Management (IAM)
   Principals, IDP Identities, Profiles, Groups, Roles, Organizational Units,
   Entitlements

   PostgreSQL 16+ (pgcrypto)

   MERGED: principal_profile columns (from 016_alter_principal_profile.sql)
   ============================================================================ */

-- ============================================================================
-- CORE: Principal (user, service, identity, group)
-- ============================================================================
create table if not exists core.principal (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  realm_key         text not null default 'main',
  principal_type    text not null,
  principal_code    text not null unique,
  display_name      text,
  email             text,
  phone             text,
  given_name        text,
  family_name       text,
  preferred_name    text,

  external_id       text,
  subject_id        text,

  is_active         boolean not null default true,
  is_service_account boolean not null default false,
  is_locked         boolean not null default false,

  password_hash     text,
  password_updated_at timestamptz,
  last_login_at     timestamptz,
  last_login_ip     text,

  idp_display_name  text,
  idp_family_name   text,
  idp_given_name    text,
  idp_email         text,
  idp_email_verified boolean,
  idp_phone_number  text,
  idp_phone_verified boolean,
  idp_picture       text,
  idp_locale        text,
  idp_timezone      text,

  created_at        timestamptz not null default now(),
  created_by        text not null,
  updated_at        timestamptz,
  updated_by        text,

  constraint principal_type_chk check (principal_type in ('user','service','identity','group')),
  constraint principal_tenant_external_uniq unique (tenant_id, external_id) deferrable
);

comment on table core.principal is 'Unified principal registry (users, services, identities, groups).';
comment on column core.principal.principal_type is 'One of: user, service, identity, group.';
comment on column core.principal.principal_code is 'Unique business code (e.g., demomalaysia_viewer).';
comment on column core.principal.external_id is 'External ID from IDP (Keycloak subject).';
comment on column core.principal.subject_id is 'OIDC subject claim (immutable).';

create index if not exists idx_principal_tenant_type
  on core.principal (tenant_id, principal_type);

create index if not exists idx_principal_email
  on core.principal (tenant_id, email);

create index if not exists idx_principal_code
  on core.principal (principal_code);

create index if not exists idx_principal_active
  on core.principal (tenant_id, is_active) where is_active = true;

create index if not exists idx_principal_external_id
  on core.principal (tenant_id, external_id);

-- ============================================================================
-- CORE: IDP Identity (OAuth/OIDC provider record)
-- ============================================================================
create table if not exists core.idp_identity (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references core.tenant(id) on delete cascade,
  principal_id       uuid not null references core.principal(id) on delete cascade,

  idp_name           text not null,
  idp_subject        text not null,

  access_token       text,
  access_token_expires_at timestamptz,
  refresh_token      text,
  refresh_token_expires_at timestamptz,

  id_token           text,
  id_token_expires_at timestamptz,

  token_type         text,
  scope              text,

  last_refreshed_at  timestamptz,
  last_authenticated_at timestamptz,

  raw_claims         jsonb,

  created_at         timestamptz not null default now(),
  created_by         text not null,
  updated_at         timestamptz,
  updated_by         text,

  constraint idp_identity_tenant_idp_subject_uniq unique (tenant_id, idp_name, idp_subject) deferrable
);

comment on table core.idp_identity is 'OAuth/OIDC provider identity link (tokens, claims).';

create index if not exists idx_idp_identity_principal
  on core.idp_identity (tenant_id, principal_id);

create index if not exists idx_idp_identity_idp_subject
  on core.idp_identity (tenant_id, idp_name, idp_subject);

-- ============================================================================
-- CORE: Principal Profile (merged from principal table above)
-- Keycloak-synced attributes
-- ============================================================================
create table if not exists core.principal_profile (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references core.tenant(id) on delete cascade,
  principal_id       uuid not null references core.principal(id) on delete cascade,

  -- Personal info
  first_name         text,
  last_name          text,
  locale             text,
  timezone           text,

  -- Keycloak source
  keycloak_id        text,
  keycloak_created_at_millis bigint,
  keycloak_federation_link text,

  -- Custom attributes
  attributes         jsonb,

  -- Keycloak singletons
  enabled_date       timestamptz,
  disabled_date      timestamptz,

  created_at         timestamptz not null default now(),
  created_by         text not null,
  updated_at         timestamptz,
  updated_by         text,

  constraint principal_profile_principal_uniq unique (principal_id)
);

comment on table core.principal_profile is 'Extended profile attributes for principals (personal info + Keycloak sync).';

create index if not exists idx_principal_profile_tenant
  on core.principal_profile (tenant_id);

create index if not exists idx_principal_profile_keycloak_id
  on core.principal_profile (tenant_id, keycloak_id);

-- ============================================================================
-- CORE: Tenant Profile (regional/business configuration per tenant)
-- ============================================================================
create table if not exists core.tenant_profile (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null unique references core.tenant(id) on delete cascade,

  country                text,
  currency               text,
  locale                 text,
  timezone               text,
  fiscal_year_start_month int,

  metadata               jsonb,

  created_at             timestamptz not null default now(),
  created_by             text not null,
  updated_at             timestamptz,
  updated_by             text
);

comment on table core.tenant_profile is
'Tenant-specific regional/business configuration (country, currency, fiscal year, etc.).';

create index if not exists idx_tenant_profile_tenant
  on core.tenant_profile (tenant_id);

-- ============================================================================
-- CORE: Group
-- ============================================================================
create table if not exists core.principal_group (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  description  text,
  metadata     jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null,
  updated_at   timestamptz,
  updated_by   text,

  constraint principal_group_tenant_code_uniq unique (tenant_id, code)
);

comment on table core.principal_group is 'Principal groups (for bulk assignment).';

create index if not exists idx_principal_group_tenant
  on core.principal_group (tenant_id);

-- ============================================================================
-- CORE: Group Membership
-- ============================================================================
create table if not exists core.group_member (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,
  group_id     uuid not null references core.principal_group(id) on delete cascade,
  principal_id uuid not null references core.principal(id) on delete cascade,

  joined_at    timestamptz not null default now(),

  constraint group_member_gp_princ_uniq unique (group_id, principal_id)
);

comment on table core.group_member is 'Group membership records.';

create index if not exists idx_group_member_principal
  on core.group_member (tenant_id, principal_id);

-- ============================================================================
-- CORE: Role
-- ============================================================================
create table if not exists core.role (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  code         text not null,
  name         text not null,
  description  text,
  category     text,
  metadata     jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null,
  updated_at   timestamptz,
  updated_by   text,

  constraint role_tenant_code_uniq unique (tenant_id, code)
);

comment on table core.role is 'Roles (for assignment to principals).';

create index if not exists idx_role_tenant
  on core.role (tenant_id);

create index if not exists idx_role_category
  on core.role (tenant_id, category);

-- ============================================================================
-- CORE: Principal Role Assignment
-- ============================================================================
create table if not exists core.principal_role (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,
  principal_id uuid not null references core.principal(id) on delete cascade,
  role_id      uuid not null references core.role(id) on delete cascade,

  assigned_at  timestamptz not null default now(),
  assigned_by  text,
  expires_at   timestamptz,

  constraint principal_role_principal_role_uniq unique (principal_id, role_id)
);

comment on table core.principal_role is 'Principal-to-role assignments.';

create index if not exists idx_principal_role_principal
  on core.principal_role (tenant_id, principal_id);

create index if not exists idx_principal_role_role
  on core.principal_role (tenant_id, role_id);

create index if not exists idx_principal_role_expires
  on core.principal_role (expires_at)
  where expires_at is not null;

-- ============================================================================
-- CORE: Organizational Unit (hierarchy support)
-- ============================================================================
create table if not exists core.organizational_unit (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code          text not null,
  name          text not null,
  description   text,
  parent_id     uuid references core.organizational_unit(id) on delete set null,

  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint organizational_unit_tenant_code_uniq unique (tenant_id, code)
);

comment on table core.organizational_unit is 'Hierarchical organizational units.';

create index if not exists idx_ou_tenant
  on core.organizational_unit (tenant_id);

create index if not exists idx_ou_parent
  on core.organizational_unit (parent_id);

-- ============================================================================
-- CORE: Principal OU Assignment
-- ============================================================================
create table if not exists core.principal_ou (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  principal_id  uuid not null references core.principal(id) on delete cascade,
  ou_id         uuid not null references core.organizational_unit(id) on delete cascade,

  assigned_at   timestamptz not null default now(),
  assigned_by   text,

  constraint principal_ou_principal_ou_uniq unique (principal_id, ou_id)
);

comment on table core.principal_ou is 'Principal assignment to organizational units.';

create index if not exists idx_principal_ou_principal
  on core.principal_ou (tenant_id, principal_id);

create index if not exists idx_principal_ou_ou
  on core.principal_ou (tenant_id, ou_id);

-- ============================================================================
-- CORE: Entitlement (capability grant)
-- ============================================================================
create table if not exists core.entitlement (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  principal_id  uuid references core.principal(id) on delete cascade,
  role_id       uuid references core.role(id) on delete cascade,
  group_id      uuid references core.principal_group(id) on delete cascade,

  capability    text not null,
  resource_type text,
  resource_id   text,

  effect        text not null default 'allow',
  granted_at    timestamptz not null default now(),
  granted_by    text,
  expires_at    timestamptz,

  metadata      jsonb,

  constraint entitlement_effect_chk check (effect in ('allow','deny')),
  constraint entitlement_has_grantee check (
    (principal_id is not null)::int
    + (role_id is not null)::int
    + (group_id is not null)::int
    = 1
  )
);

comment on table core.entitlement is 'Direct capability grants (principal, role, or group).';

create index if not exists idx_entitlement_principal
  on core.entitlement (tenant_id, principal_id);

create index if not exists idx_entitlement_role
  on core.entitlement (tenant_id, role_id);

create index if not exists idx_entitlement_group
  on core.entitlement (tenant_id, group_id);

create index if not exists idx_entitlement_capability
  on core.entitlement (tenant_id, capability);

create index if not exists idx_entitlement_expires
  on core.entitlement (expires_at)
  where expires_at is not null;
