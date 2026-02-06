/* ============================================================================
   Athyper -- Combined Deployment Script
   ============================================================================
   AUTO-GENERATED -- Do not edit manually.

   This file concatenates ALL SQL migration and seed files in FK dependency-
   resolved order (NOT numeric file-naming order) so that every CREATE TABLE,
   ALTER TABLE, and INSERT runs without violating foreign-key constraints.

   Execution order (21 steps):
     1.  00_bootstrap/001_create_schemas.sql                -- Schemas
     2.  00_bootstrap/002_extensions.sql                    -- Extensions
     3.  20_core/010_core_runtime_tables.sql                -- core.tenant MUST be first (everything references it)
     4.  20_core/015_alter_tenant_for_iam.sql               -- Alters core.tenant for multi-realm IAM support
     5.  30_ref/010_ref_master_tables.sql                   -- Ref tables (self-contained)
     6.  20_core/042_permission_action_model.sql            -- core.operation_category, core.operation, core.persona, core.module (needed by meta policy FK)
     7.  10_meta/010_meta_core_tables.sql                   -- Meta entity registry (needs core.tenant)
     8.  10_meta/020_meta_policy_tables.sql                 -- Meta policy (needs core.operation)
     9.  10_meta/030_meta_workflow_tables.sql               -- Meta workflow (needs core.tenant)
    10.  10_meta/040_meta_overlay_tables.sql                -- Meta overlays (needs meta.entity, meta.entity_version)
    11.  20_core/020_core_iam_tables.sql                    -- IAM (principal, group, role, ou_node, etc.)
    12.  20_core/030_core_workflow_runtime.sql              -- Workflow runtime (needs meta.lifecycle, core.principal, core.group)
    13.  20_core/041_field_security.sql                     -- Field security (needs meta.entity)
    14.  20_core/043_mfa_tables.sql                         -- MFA (needs core.principal)
    15.  40_mdm/010_mdm_master_tables.sql                   -- MDM (needs ref.currency, ref.country, core.ou_node)
    16.  90_seed/910_seed_operations.sql                    -- Seed: operations
    17.  90_seed/911_seed_personas.sql                      -- Seed: personas + capability matrix
    18.  90_seed/912_seed_modules.sql                       -- Seed: modules
    19.  90_seed/920_seed_default_deny_policy.sql           -- Seed: default deny policy
    20.  90_seed/930_seed_platform_admin_allow.sql          -- Seed: platform admin allow
    21.  90_seed/940_refresh_compiled_policies.sql          -- Seed: refresh compiled policies
   ============================================================================ */

BEGIN;

-- ============================================================================
-- STEP 1 of 21: 00_bootstrap/001_create_schemas.sql
-- Schemas
-- ============================================================================

/* ============================================================================
   Athyper — Schema Creation
   PostgreSQL 16+
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- SCHEMAS
-- ----------------------------------------------------------------------------
create schema if not exists core;
create schema if not exists meta;
create schema if not exists ref;
create schema if not exists mdm;

-- END (Step 1)

-- ============================================================================
-- STEP 2 of 21: 00_bootstrap/002_extensions.sql
-- Extensions
-- ============================================================================

/* ============================================================================
   Athyper — Extensions
   PostgreSQL 16+
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto; -- gen_random_uuid()

-- END (Step 2)

-- ============================================================================
-- STEP 3 of 21: 20_core/010_core_runtime_tables.sql
-- core.tenant MUST be first (everything references it)
-- ============================================================================

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

-- END (Step 3)

-- ============================================================================
-- STEP 4 of 21: 20_core/015_alter_tenant_for_iam.sql
-- Alters core.tenant for multi-realm IAM support
-- ============================================================================

/* ============================================================================
   Athyper — Alter core.tenant for IAM Support
   Adds realm_key and display_name columns required for multi-realm IAM.
   NOTE: Tenant active/inactive state is controlled via the existing status
         column ('active','suspended','archived') — no separate is_active flag.
   PostgreSQL 16+
   ============================================================================ */

-- add realm_key column (required for multi-realm support)
alter table core.tenant
add column if not exists realm_key text not null default 'main';

-- add display_name column (user-friendly name)
alter table core.tenant
add column if not exists display_name text;

-- backfill display_name from name for existing rows
update core.tenant
set display_name = name
where display_name is null;

-- make display_name not null after backfill
alter table core.tenant
alter column display_name set not null;

-- indexes for efficient queries
create index if not exists idx_tenant_realm_key
  on core.tenant (realm_key);

create index if not exists idx_tenant_status_active
  on core.tenant (status) where status = 'active';

-- comments
comment on column core.tenant.realm_key is 'IAM realm key (links to Keycloak realm).';
comment on column core.tenant.display_name is 'User-friendly display name.';

-- END (Step 4)

-- ============================================================================
-- STEP 5 of 21: 30_ref/010_ref_master_tables.sql
-- Ref tables (self-contained)
-- ============================================================================

/* ============================================================================
   Athyper — REF: Global Reference Data (shared, NOT tenant-scoped)
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- REF: Currency
-- ----------------------------------------------------------------------------
create table if not exists ref.currency (
  code         text primary key,
  name         text,
  symbol       text,
  minor_units  int,
  metadata     jsonb
);

comment on table ref.currency is 'ISO 4217 currency codes.';

-- ----------------------------------------------------------------------------
-- REF: Unit of Measure
-- ----------------------------------------------------------------------------
create table if not exists ref.uom (
  code         text primary key,
  name         text,
  metadata     jsonb
);

comment on table ref.uom is 'Standard units of measure.';

-- ----------------------------------------------------------------------------
-- REF: Commodity Codes (UNSPSC / custom)
-- ----------------------------------------------------------------------------
create table if not exists ref.commodity_code (
  code         text primary key,
  scheme       text,
  name         text,
  parent_code  text,
  metadata     jsonb
);

comment on table ref.commodity_code is 'Commodity classification codes (UNSPSC, custom).';

create index if not exists idx_commodity_parent
  on ref.commodity_code (parent_code);

-- ----------------------------------------------------------------------------
-- REF: Language
-- ----------------------------------------------------------------------------
create table if not exists ref.language (
  code         text primary key,
  name         text
);

comment on table ref.language is 'ISO 639 language codes.';

-- ----------------------------------------------------------------------------
-- REF: Locale
-- ----------------------------------------------------------------------------
create table if not exists ref.locale (
  code         text primary key,
  language     text,
  is_rtl       boolean not null default false
);

comment on table ref.locale is 'Locale codes (en-US, ar-SA) with RTL indicator.';

-- ----------------------------------------------------------------------------
-- REF: Country (ISO)
-- ----------------------------------------------------------------------------
create table if not exists ref.country (
  code         text primary key,
  name         text,
  currency_code text references ref.currency(code),
  metadata     jsonb
);

comment on table ref.country is 'ISO 3166 country codes.';

-- ----------------------------------------------------------------------------
-- REF: Registration Kind
-- ----------------------------------------------------------------------------
create table if not exists ref.registration_kind (
  code         text primary key,
  name         text
);

comment on table ref.registration_kind is 'Business registration types (CR, VAT, GST, EIN, etc.).';

-- ----------------------------------------------------------------------------
-- REF: Contact Channel Types
-- ----------------------------------------------------------------------------
create table if not exists ref.contact_channel_type (
  code         text primary key,
  name         text
);

comment on table ref.contact_channel_type is 'Contact channel types (email, phone, whatsapp, website).';

-- ----------------------------------------------------------------------------
-- REF: Tax Identifier Types
-- ----------------------------------------------------------------------------
create table if not exists ref.tax_identifier_type (
  code         text primary key,
  name         text
);

comment on table ref.tax_identifier_type is 'Tax identifier types (SSN, TIN, PAN, etc.).';

-- ----------------------------------------------------------------------------
-- REF: Issuing Authority
-- ----------------------------------------------------------------------------
create table if not exists ref.issuing_authority (
  id           uuid primary key default gen_random_uuid(),
  country_code text references ref.country(code),
  name         text not null,
  metadata     jsonb
);

comment on table ref.issuing_authority is 'Government / regulatory issuing authorities.';

create index if not exists idx_issuing_authority_country
  on ref.issuing_authority (country_code);

-- END (Step 5)

-- ============================================================================
-- STEP 6 of 21: 20_core/042_permission_action_model.sql
-- core.operation_category, core.operation, core.persona, core.module (needed by meta policy FK)
-- ============================================================================

/* ============================================================================
   Athyper — CORE: Permission Action Model (DDL only)
   Capability matrix: operations, personas, modules, tenant subscriptions.
   Seed data lives in 90_seed/ files.
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: Operation Categories
-- ============================================================================

create table if not exists core.operation_category (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text not null,
  description   text,
  sort_order    integer not null default 0,

  source_type   text not null default 'system',
  is_active     boolean not null default true,
  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'system',
  updated_at    timestamptz,
  updated_by    text,

  constraint operation_category_source_chk
    check (source_type in ('system', 'tenant', 'import'))
);

comment on table core.operation_category is
'Categories of operations (entity, workflow, utilities, delegation, collaboration).';

-- ============================================================================
-- CORE: Operations
-- ============================================================================

create table if not exists core.operation (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid not null references core.operation_category(id) on delete cascade,
  code              text not null,
  name              text not null,
  description       text,

  requires_record   boolean not null default false,
  requires_ownership boolean not null default false,
  sort_order        integer not null default 0,

  source_type       text not null default 'system',
  source_ref        text,
  is_active         boolean not null default true,
  metadata          jsonb,

  created_at        timestamptz not null default now(),
  created_by        text not null default 'system',
  updated_at        timestamptz,
  updated_by        text,

  constraint operation_code_uniq unique (category_id, code),
  constraint operation_source_chk
    check (source_type in ('system', 'tenant', 'import'))
);

comment on table core.operation is
'Individual operations within categories (single registry, referenced by meta.permission_rule_operation).';

comment on column core.operation.requires_record is 'Operation requires a specific record context.';
comment on column core.operation.requires_ownership is 'Operation is restricted to record owner.';
comment on column core.operation.source_type is 'Origin of the operation: system-defined, tenant-created, or imported.';

create index if not exists idx_operation_category
  on core.operation (category_id);

create index if not exists idx_operation_code
  on core.operation (code);

create index if not exists idx_operation_active
  on core.operation (is_active) where is_active = true;

-- ============================================================================
-- CORE: Persona Definitions
-- ============================================================================

create table if not exists core.persona (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text not null,
  description   text,

  scope_mode    text not null default 'tenant',
  priority      integer not null default 100,
  is_system     boolean not null default false,
  is_active     boolean not null default true,
  config        jsonb,
  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'system',
  updated_at    timestamptz,
  updated_by    text,

  constraint persona_scope_mode_chk
    check (scope_mode in ('tenant', 'ou', 'module'))
);

comment on table core.persona is
'Persona definitions (viewer, reporter, requester, agent, manager, module_admin, tenant_admin).';

comment on column core.persona.scope_mode is 'How the persona scopes access: tenant-wide, OU-scoped, or module-scoped.';
comment on column core.persona.priority is 'Higher priority personas take precedence when user has multiple.';
comment on column core.persona.is_system is 'System personas cannot be deleted.';

create index if not exists idx_persona_code
  on core.persona (code);

create index if not exists idx_persona_active
  on core.persona (is_active) where is_active = true;

-- ============================================================================
-- CORE: Persona Capability Grants
-- ============================================================================

create table if not exists core.persona_capability (
  id              uuid primary key default gen_random_uuid(),
  persona_id      uuid not null references core.persona(id) on delete cascade,
  operation_id    uuid not null references core.operation(id) on delete cascade,

  is_granted      boolean not null default false,
  constraint_type text not null default 'none',

  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null default 'system',
  updated_at      timestamptz,
  updated_by      text,

  constraint persona_capability_uniq unique (persona_id, operation_id),
  constraint persona_capability_constraint_chk
    check (constraint_type in ('none', 'own', 'ou', 'module'))
);

comment on table core.persona_capability is
'Maps personas to operations with constraint types (none=unrestricted, own=owner only, ou=OU scope, module=module scope).';

create index if not exists idx_persona_cap_persona
  on core.persona_capability (persona_id);

create index if not exists idx_persona_cap_operation
  on core.persona_capability (operation_id);

-- ============================================================================
-- CORE: Module Definitions
-- ============================================================================

create table if not exists core.module (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text not null,
  description   text,

  is_active     boolean not null default true,
  config        jsonb,
  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'system',
  updated_at    timestamptz,
  updated_by    text
);

comment on table core.module is
'Module definitions for module-based access control and entity grouping.';

create index if not exists idx_module_code
  on core.module (code);

create index if not exists idx_module_active
  on core.module (is_active) where is_active = true;

-- ============================================================================
-- CORE: Tenant Module Subscriptions
-- ============================================================================

create table if not exists core.tenant_module_subscription (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  module_id     uuid not null references core.module(id) on delete cascade,

  is_active     boolean not null default true,
  valid_from    timestamptz not null default now(),
  valid_until   timestamptz,
  config        jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint tenant_module_subscription_uniq unique (tenant_id, module_id),
  constraint tenant_module_subscription_validity_chk
    check (valid_from is null or valid_until is null or valid_from < valid_until)
);

comment on table core.tenant_module_subscription is
'Tenant subscriptions to modules with activation dates.';

create index if not exists idx_tenant_module_tenant
  on core.tenant_module_subscription (tenant_id);

create index if not exists idx_tenant_module_module
  on core.tenant_module_subscription (module_id);

create index if not exists idx_tenant_module_active
  on core.tenant_module_subscription (is_active) where is_active = true;

-- ============================================================================
-- CORE: Entity Module Mapping
-- ============================================================================

create table if not exists core.entity_module (
  id            uuid primary key default gen_random_uuid(),
  entity_key    text not null,
  module_id     uuid not null references core.module(id) on delete cascade,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'system',

  constraint entity_module_uniq unique (entity_key, module_id)
);

comment on table core.entity_module is
'Maps entities to their owning modules.';

create index if not exists idx_entity_module_entity
  on core.entity_module (entity_key);

create index if not exists idx_entity_module_module
  on core.entity_module (module_id);

-- END (Step 6)

-- ============================================================================
-- STEP 7 of 21: 10_meta/010_meta_core_tables.sql
-- Meta entity registry (needs core.tenant)
-- ============================================================================

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

-- END (Step 7)

-- ============================================================================
-- STEP 8 of 21: 10_meta/020_meta_policy_tables.sql
-- Meta policy (needs core.operation)
-- ============================================================================

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

-- END (Step 8)

-- ============================================================================
-- STEP 9 of 21: 10_meta/030_meta_workflow_tables.sql
-- Meta workflow (needs core.tenant)
-- ============================================================================

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

-- END (Step 9)

-- ============================================================================
-- STEP 10 of 21: 10_meta/040_meta_overlay_tables.sql
-- Meta overlays (needs meta.entity, meta.entity_version)
-- ============================================================================

/* ============================================================================
   Athyper — META: Overlay System + Compiled Overlay Snapshots
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- META: Overlay Container
-- ----------------------------------------------------------------------------
create table if not exists meta.overlay (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  overlay_key  text not null,
  description  text,

  base_entity_id  uuid not null references meta.entity(id) on delete cascade,
  base_version_id uuid references meta.entity_version(id) on delete set null,

  priority      int not null default 100,
  conflict_mode text not null default 'fail',
  is_active     boolean not null default true,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint overlay_conflict_mode_chk check (conflict_mode in ('fail','overwrite','merge')),
  constraint overlay_key_uniq unique (tenant_id, overlay_key)
);

comment on table meta.overlay is
'Schema overlay definitions for extending base entity schemas with deterministic merge.';

create index if not exists idx_overlay_base_entity
  on meta.overlay (tenant_id, base_entity_id);

create index if not exists idx_overlay_priority
  on meta.overlay (base_entity_id, priority);

create index if not exists idx_overlay_active
  on meta.overlay (is_active) where is_active = true;

-- ----------------------------------------------------------------------------
-- META: Overlay Change Deltas
-- ----------------------------------------------------------------------------
create table if not exists meta.overlay_change (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  overlay_id    uuid not null references meta.overlay(id) on delete cascade,

  change_order  int not null,
  kind          text not null,
  path          text not null,
  value         jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint overlay_change_kind_chk check (kind in (
    'addField','removeField','modifyField',
    'tweakPolicy','overrideValidation','overrideUi'
  )),
  constraint overlay_change_order_uniq unique (overlay_id, change_order)
);

comment on table meta.overlay_change is
'Individual change deltas within an overlay, applied in change_order sequence.';

create index if not exists idx_overlay_change_overlay
  on meta.overlay_change (overlay_id);

-- ----------------------------------------------------------------------------
-- META: Compiled Overlay Snapshot
-- ----------------------------------------------------------------------------
create table if not exists meta.entity_compiled_overlay (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,
  overlay_set       jsonb not null,

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

-- END (Step 10)

-- ============================================================================
-- STEP 11 of 21: 20_core/020_core_iam_tables.sql
-- IAM (principal, group, role, ou_node, etc.)
-- ============================================================================

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

-- END (Step 11)

-- ============================================================================
-- STEP 12 of 21: 20_core/030_core_workflow_runtime.sql
-- Workflow runtime (needs meta.lifecycle, core.principal, core.group)
-- ============================================================================

/* ============================================================================
   Athyper — CORE: WF Runtime (High Volume)
   Lifecycle instances, events, approval instances, tasks, escalation, timers.
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- CORE: Entity Lifecycle Instance
-- ----------------------------------------------------------------------------
create table if not exists core.entity_lifecycle_instance (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  entity_name    text not null,
  entity_id      text not null,

  lifecycle_id   uuid not null references meta.lifecycle(id),
  state_id       uuid not null references meta.lifecycle_state(id),

  context        jsonb,

  updated_at     timestamptz not null default now(),
  updated_by     text not null,

  constraint lifecycle_instance_uniq unique (tenant_id, entity_name, entity_id)
);

comment on table core.entity_lifecycle_instance is 'Current lifecycle state per entity record.';

create index if not exists idx_lifecycle_instance_state
  on core.entity_lifecycle_instance (tenant_id, entity_name, state_id);

-- ----------------------------------------------------------------------------
-- CORE: Entity Lifecycle Event Log (append-only, relaxed FKs intentional)
-- ----------------------------------------------------------------------------
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

comment on table core.entity_lifecycle_event is 'Append-only event log for lifecycle state transitions.';

create index if not exists idx_lifecycle_event_tenant_time
  on core.entity_lifecycle_event (tenant_id, occurred_at desc);

create index if not exists idx_lifecycle_event_entity
  on core.entity_lifecycle_event (tenant_id, entity_name, entity_id);

-- ----------------------------------------------------------------------------
-- CORE: Approval Instance
-- ----------------------------------------------------------------------------
create table if not exists core.approval_instance (
  id              uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,

  entity_name      text not null,
  entity_id        text not null,

  transition_id    uuid references meta.lifecycle_transition(id),
  approval_template_id uuid references meta.approval_template(id),
  status           text not null default 'open',
  context          jsonb,

  created_at       timestamptz not null default now(),
  created_by       text not null,

  constraint approval_instance_status_chk check (status in ('open','completed','canceled'))
);

comment on table core.approval_instance is 'Active approval workflow instances per entity record.';

create index if not exists idx_approval_instance_entity
  on core.approval_instance (tenant_id, entity_name, entity_id);

create index if not exists idx_approval_instance_status
  on core.approval_instance (tenant_id, status);

-- ----------------------------------------------------------------------------
-- CORE: Approval Stages
-- ----------------------------------------------------------------------------
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

comment on table core.approval_stage is 'Stages within an approval instance.';

create index if not exists idx_approval_stage_instance
  on core.approval_stage (tenant_id, approval_instance_id, stage_no);

-- ----------------------------------------------------------------------------
-- CORE: Approval Tasks
-- ----------------------------------------------------------------------------
create table if not exists core.approval_task (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,
  approval_stage_id    uuid not null references core.approval_stage(id) on delete cascade,

  assignee_principal_id uuid references core.principal(id),
  assignee_group_id     uuid references core."group"(id),

  task_type            text not null default 'approver',
  status               text not null default 'pending',
  due_at               timestamptz,
  metadata             jsonb,

  decided_at           timestamptz,
  decided_by           uuid,
  decision_note        text,

  created_at           timestamptz not null default now(),

  constraint approval_task_type_chk check (task_type in ('approver','reviewer','watcher')),
  constraint approval_task_status_chk check (status in ('pending','approved','rejected','canceled','expired'))
);

comment on table core.approval_task is 'Individual approval/review tasks assigned to principals or groups.';

create index if not exists idx_approval_task_assignee
  on core.approval_task (tenant_id, coalesce(assignee_principal_id, assignee_group_id), status);

create index if not exists idx_approval_task_instance
  on core.approval_task (approval_instance_id);

-- ----------------------------------------------------------------------------
-- CORE: Approval Assignment Snapshot
-- ----------------------------------------------------------------------------
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

comment on table core.approval_assignment_snapshot is 'Captured assignment resolution for audit trail.';

create index if not exists idx_approval_assignment_task
  on core.approval_assignment_snapshot (approval_task_id);

-- ----------------------------------------------------------------------------
-- CORE: Approval Escalation Log
-- ----------------------------------------------------------------------------
create table if not exists core.approval_escalation (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  approval_instance_id uuid not null references core.approval_instance(id) on delete cascade,
  kind               text not null,
  payload            jsonb,
  occurred_at         timestamptz not null default now(),

  constraint approval_escalation_kind_chk check (kind in ('reminder','escalation','reassign'))
);

comment on table core.approval_escalation is 'Escalation/reminder events for approvals.';

create index if not exists idx_approval_escalation_time
  on core.approval_escalation (tenant_id, occurred_at desc);

-- ----------------------------------------------------------------------------
-- CORE: Lifecycle Timers
-- ----------------------------------------------------------------------------
create table if not exists core.lifecycle_timer (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  entity_name    text not null,
  entity_id      text not null,

  policy_code    text,
  fire_at        timestamptz not null,
  status         text not null default 'scheduled',
  attempts       int not null default 0,
  config         jsonb,

  last_error     text,

  created_at     timestamptz not null default now(),

  constraint lifecycle_timer_status_chk check (status in ('scheduled','running','completed','failed','canceled'))
);

comment on table core.lifecycle_timer is 'Scheduled timers for auto-close, auto-cancel, reminders.';

create index if not exists idx_lifecycle_timer_pick
  on core.lifecycle_timer (tenant_id, status, fire_at);

-- ----------------------------------------------------------------------------
-- CORE: Approval Event Log
-- ----------------------------------------------------------------------------
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

comment on table core.approval_event is 'Append-only event log for approval workflow actions.';

create index if not exists idx_approval_event_tenant_time
  on core.approval_event (tenant_id, occurred_at desc);

-- END (Step 12)

-- ============================================================================
-- STEP 13 of 21: 20_core/041_field_security.sql
-- Field security (needs meta.entity)
-- ============================================================================

/* ============================================================================
   Athyper — CORE: Field-Level Security
   Column-level access control: read masking, write filtering, ABAC conditions.
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- META: Field Security Policy
-- ============================================================================

create table if not exists meta.field_security_policy (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  entity_id       uuid not null references meta.entity(id) on delete cascade,
  field_path      text not null,

  policy_type     text not null,
  role_list       text[],
  abac_condition  jsonb,

  mask_strategy   text,
  mask_config     jsonb,

  scope           text not null default 'entity',
  scope_ref       uuid,
  priority        integer not null default 100,
  is_active       boolean not null default true,

  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  version         integer not null default 1,

  constraint field_security_policy_type_chk
    check (policy_type in ('read', 'write', 'both')),
  constraint field_security_mask_strategy_chk
    check (mask_strategy in ('null', 'redact', 'hash', 'partial', 'remove')),
  constraint field_security_scope_chk
    check (scope in ('global', 'module', 'entity', 'entity_version', 'record')),
  constraint field_security_policy_uniq
    unique (tenant_id, entity_id, field_path, policy_type, scope, scope_ref)
);

comment on table meta.field_security_policy is
'Field-level security policies defining read/write access control with masking strategies.';

comment on column meta.field_security_policy.field_path is 'JSON path to field (e.g., ssn, address.zipCode).';
comment on column meta.field_security_policy.policy_type is 'Policy type: read, write, or both.';
comment on column meta.field_security_policy.role_list is 'Simple role-based access: array of role codes.';
comment on column meta.field_security_policy.abac_condition is 'ABAC expression for attribute-based access control.';
comment on column meta.field_security_policy.mask_strategy is 'Masking strategy for read access: null, redact, hash, partial, remove.';
comment on column meta.field_security_policy.mask_config is 'Strategy-specific masking configuration.';
comment on column meta.field_security_policy.scope is 'Policy scope: global > module > entity > entity_version > record.';
comment on column meta.field_security_policy.scope_ref is 'Reference ID for scope (module_id, version_id, record_id).';
comment on column meta.field_security_policy.priority is 'Priority (lower = evaluated first, first match wins).';

create index if not exists idx_field_security_entity
  on meta.field_security_policy (tenant_id, entity_id);

create index if not exists idx_field_security_field
  on meta.field_security_policy (field_path);

create index if not exists idx_field_security_type
  on meta.field_security_policy (policy_type);

create index if not exists idx_field_security_active
  on meta.field_security_policy (is_active) where is_active = true;

create index if not exists idx_field_security_scope
  on meta.field_security_policy (scope, scope_ref);

create index if not exists idx_field_security_priority
  on meta.field_security_policy (entity_id, priority);

create index if not exists idx_field_security_lookup
  on meta.field_security_policy (tenant_id, entity_id, field_path, policy_type, is_active);

-- ============================================================================
-- CORE: Field Access Audit Log (append-only)
-- ============================================================================

create table if not exists core.field_access_log (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  entity_key      text not null,
  record_id       uuid,

  subject_id      uuid not null,
  subject_type    text not null,

  action          text not null,
  field_path      text not null,
  was_allowed     boolean not null,

  mask_applied    text,
  policy_id       uuid references meta.field_security_policy(id) on delete set null,

  request_id      text,
  trace_id        text,
  correlation_id  text,

  created_at      timestamptz not null default now(),

  constraint field_access_log_subject_type_chk
    check (subject_type in ('user', 'service', 'system')),
  constraint field_access_log_action_chk
    check (action in ('read', 'write'))
);

comment on table core.field_access_log is
'Append-only audit log for field-level access decisions.';

comment on column core.field_access_log.entity_key is 'Entity key that was accessed.';
comment on column core.field_access_log.subject_type is 'Type of subject: user, service, system.';
comment on column core.field_access_log.was_allowed is 'Whether access was allowed.';
comment on column core.field_access_log.mask_applied is 'Masking strategy applied (if any).';
comment on column core.field_access_log.request_id is 'Request correlation ID.';
comment on column core.field_access_log.trace_id is 'OpenTelemetry trace ID.';

create index if not exists idx_field_access_log_entity
  on core.field_access_log (tenant_id, entity_key, created_at desc);

create index if not exists idx_field_access_log_subject
  on core.field_access_log (tenant_id, subject_id, created_at desc);

create index if not exists idx_field_access_log_record
  on core.field_access_log (record_id) where record_id is not null;

create index if not exists idx_field_access_log_policy
  on core.field_access_log (policy_id) where policy_id is not null;

create index if not exists idx_field_access_log_denied
  on core.field_access_log (tenant_id, created_at desc) where was_allowed = false;

create index if not exists idx_field_access_log_request
  on core.field_access_log (request_id) where request_id is not null;

-- partitioning hint for large deployments:
-- alter table core.field_access_log partition by range (created_at);

-- END (Step 13)

-- ============================================================================
-- STEP 14 of 21: 20_core/043_mfa_tables.sql
-- MFA (needs core.principal)
-- ============================================================================

/* ============================================================================
   Athyper — CORE: MFA (Multi-Factor Authentication)
   TOTP, WebAuthn, backup codes, trusted devices, tenant MFA policies.
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: MFA Configuration per Principal
-- ============================================================================

create table if not exists core.mfa_config (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  mfa_type        text not null default 'totp',
  totp_secret     text,
  recovery_email  text,

  is_enabled      boolean not null default false,
  is_verified     boolean not null default false,

  enabled_at      timestamptz,
  verified_at     timestamptz,
  last_used_at    timestamptz,

  metadata        jsonb,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz,

  constraint mfa_config_type_chk
    check (mfa_type in ('totp', 'webauthn', 'sms', 'email')),
  constraint mfa_config_uniq unique (principal_id, mfa_type)
);

comment on table core.mfa_config is
'MFA configuration per principal (TOTP, WebAuthn, SMS, email).';

create index if not exists idx_mfa_config_principal
  on core.mfa_config (principal_id);

create index if not exists idx_mfa_config_tenant
  on core.mfa_config (tenant_id);

create index if not exists idx_mfa_config_enabled
  on core.mfa_config (is_enabled) where is_enabled = true;

-- ============================================================================
-- CORE: Backup Codes (one-time use recovery codes)
-- ============================================================================

create table if not exists core.mfa_backup_code (
  id              uuid primary key default gen_random_uuid(),
  mfa_config_id   uuid not null references core.mfa_config(id) on delete cascade,

  code_hash       text not null,

  is_used         boolean not null default false,
  used_at         timestamptz,
  used_ip         text,
  used_user_agent text,

  created_at      timestamptz not null default now()
);

comment on table core.mfa_backup_code is
'One-time use backup codes for MFA recovery (bcrypt hashed).';

create index if not exists idx_mfa_backup_code_config
  on core.mfa_backup_code (mfa_config_id);

create index if not exists idx_mfa_backup_code_unused
  on core.mfa_backup_code (mfa_config_id) where is_used = false;

-- ============================================================================
-- CORE: MFA Challenges (pending verification during login)
-- ============================================================================

create table if not exists core.mfa_challenge (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  challenge_token text not null unique,

  session_id      text,
  ip_address      text,
  user_agent      text,

  is_completed    boolean not null default false,
  completed_at    timestamptz,

  attempt_count   integer not null default 0,
  max_attempts    integer not null default 5,
  locked_until    timestamptz,

  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);

comment on table core.mfa_challenge is
'Pending MFA verification challenges during login flow.';

create index if not exists idx_mfa_challenge_principal
  on core.mfa_challenge (principal_id);

create index if not exists idx_mfa_challenge_token
  on core.mfa_challenge (challenge_token);

create index if not exists idx_mfa_challenge_expires
  on core.mfa_challenge (expires_at) where is_completed = false;

-- ============================================================================
-- CORE: MFA Audit Log (append-only security events)
-- ============================================================================

create table if not exists core.mfa_audit_log (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  event_type      text not null,

  mfa_type        text,
  ip_address      text,
  user_agent      text,
  geo_location    text,

  details         jsonb,
  correlation_id  text,

  created_at      timestamptz not null default now(),

  constraint mfa_audit_event_type_chk check (event_type in (
    'mfa_enrolled',
    'mfa_verified',
    'mfa_disabled',
    'mfa_login_success',
    'mfa_login_failure',
    'backup_code_used',
    'backup_codes_regenerated',
    'recovery_initiated',
    'recovery_completed',
    'challenge_locked',
    'suspicious_activity'
  ))
);

comment on table core.mfa_audit_log is
'Append-only security audit log for MFA events.';

create index if not exists idx_mfa_audit_principal
  on core.mfa_audit_log (principal_id, created_at desc);

create index if not exists idx_mfa_audit_tenant
  on core.mfa_audit_log (tenant_id, created_at desc);

create index if not exists idx_mfa_audit_event
  on core.mfa_audit_log (event_type, created_at desc);

-- ============================================================================
-- CORE: Trusted Devices ("remember this device")
-- ============================================================================

create table if not exists core.mfa_trusted_device (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid not null references core.principal(id) on delete cascade,

  device_id       text not null,
  device_name     text,
  device_type     text,

  trust_token_hash text not null,

  last_used_at    timestamptz,
  last_ip         text,

  expires_at      timestamptz not null,
  is_revoked      boolean not null default false,
  revoked_at      timestamptz,

  metadata        jsonb,

  created_at      timestamptz not null default now(),

  constraint mfa_trusted_device_uniq unique (principal_id, device_id)
);

comment on table core.mfa_trusted_device is
'Devices trusted to skip MFA verification (with expiry and revocation).';

create index if not exists idx_mfa_trusted_device_principal
  on core.mfa_trusted_device (principal_id);

create index if not exists idx_mfa_trusted_device_token
  on core.mfa_trusted_device (trust_token_hash);

create index if not exists idx_mfa_trusted_device_active
  on core.mfa_trusted_device (expires_at)
  where is_revoked = false;

-- ============================================================================
-- CORE: Tenant MFA Policy (enforcement rules)
-- ============================================================================

create table if not exists core.mfa_policy (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  scope_type      text not null,
  scope_ref       text,

  is_required     boolean not null default false,
  allowed_methods text[] not null default array['totp'],
  grace_period_days integer default 7,

  allow_trusted_devices boolean not null default true,
  trusted_device_expiry_days integer default 30,
  backup_codes_count integer not null default 10,

  config          jsonb,
  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,

  constraint mfa_policy_scope_type_chk
    check (scope_type in ('tenant', 'role', 'group')),
  constraint mfa_policy_uniq unique (tenant_id, scope_type, scope_ref)
);

comment on table core.mfa_policy is
'Tenant-level MFA enforcement policies (tenant-wide, per role, per group).';

create index if not exists idx_mfa_policy_tenant
  on core.mfa_policy (tenant_id);

create index if not exists idx_mfa_policy_scope
  on core.mfa_policy (scope_type, scope_ref);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Check if MFA is required for a principal (fixed: joins through core.role)
create or replace function core.is_mfa_required(p_principal_id uuid, p_tenant_id uuid)
returns boolean as $$
declare
  v_required boolean := false;
begin
  -- check tenant-wide policy first
  select is_required into v_required
  from core.mfa_policy
  where tenant_id = p_tenant_id
    and scope_type = 'tenant'
    and scope_ref is null;

  if v_required then
    return true;
  end if;

  -- check role-based policies (join role_binding → role → mfa_policy via role_code)
  if exists (
    select 1
    from core.mfa_policy mp
    join core.role r on r.role_code = mp.scope_ref
    join core.role_binding rb on rb.role_id = r.id
    where mp.tenant_id = p_tenant_id
      and mp.scope_type = 'role'
      and rb.principal_id = p_principal_id
      and rb.is_active = true
      and mp.is_required = true
  ) then
    return true;
  end if;

  -- check group-based policies (join group_member → group → mfa_policy via group_id)
  if exists (
    select 1
    from core.mfa_policy mp
    join core."group" g on g.id::text = mp.scope_ref
    join core.group_member gm on gm.group_id = g.id
    where mp.tenant_id = p_tenant_id
      and mp.scope_type = 'group'
      and gm.principal_id = p_principal_id
      and gm.is_active = true
      and mp.is_required = true
  ) then
    return true;
  end if;

  return false;
end;
$$ language plpgsql stable;

comment on function core.is_mfa_required(uuid, uuid) is
'Check if MFA is required for a principal based on tenant, role, and group policies.';

-- Cleanup expired challenges (to be run periodically)
create or replace function core.cleanup_expired_mfa_challenges()
returns integer as $$
declare
  v_count integer;
begin
  delete from core.mfa_challenge
  where expires_at < now()
    and is_completed = false;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql;

comment on function core.cleanup_expired_mfa_challenges() is
'Cleanup expired MFA challenges. Run periodically via scheduler.';

-- Cleanup expired / revoked trusted devices
create or replace function core.cleanup_expired_trusted_devices()
returns integer as $$
declare
  v_count integer;
begin
  delete from core.mfa_trusted_device
  where expires_at < now()
    or is_revoked = true;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql;

comment on function core.cleanup_expired_trusted_devices() is
'Cleanup expired or revoked trusted devices. Run periodically via scheduler.';

-- END (Step 14)

-- ============================================================================
-- STEP 15 of 21: 40_mdm/010_mdm_master_tables.sql
-- MDM (needs ref.currency, ref.country, core.ou_node)
-- ============================================================================

/* ============================================================================
   Athyper — MDM: Company Code / Cost Center / Project / WBS (tenant-scoped)
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- MDM: Company Code
-- ----------------------------------------------------------------------------
create table if not exists mdm.company_code (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  code          text not null,
  name          text not null,
  base_currency text references ref.currency(code),
  country_code  text references ref.country(code),

  ou_node_id    uuid references core.ou_node(id),
  config        jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint company_code_uniq unique (tenant_id, code)
);

comment on table mdm.company_code is 'Legal entities / company codes (tenant-scoped).';

create index if not exists idx_company_code_ou
  on mdm.company_code (tenant_id, ou_node_id);

-- ----------------------------------------------------------------------------
-- MDM: Cost Center
-- ----------------------------------------------------------------------------
create table if not exists mdm.cost_center (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  company_code_id uuid references mdm.company_code(id) on delete set null,
  code          text not null,
  name          text not null,

  ou_node_id    uuid references core.ou_node(id),
  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint cost_center_uniq unique (tenant_id, code)
);

comment on table mdm.cost_center is 'Cost centers linked to company codes and OUs.';

create index if not exists idx_cost_center_ou
  on mdm.cost_center (tenant_id, ou_node_id);

-- ----------------------------------------------------------------------------
-- MDM: Project
-- ----------------------------------------------------------------------------
create table if not exists mdm.project (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  code          text not null,
  name          text not null,
  project_kind  text not null default 'internal',
  status        text not null default 'active',

  ou_node_id    uuid references core.ou_node(id),
  config        jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint project_kind_chk check (project_kind in ('internal','external')),
  constraint project_status_chk check (status in ('active','closed','archived')),
  constraint project_uniq unique (tenant_id, code)
);

comment on table mdm.project is 'Projects (internal/external) linked to OUs.';

create index if not exists idx_project_ou
  on mdm.project (tenant_id, ou_node_id);

-- ----------------------------------------------------------------------------
-- MDM: WBS Element (Work Breakdown Structure)
-- ----------------------------------------------------------------------------
create table if not exists mdm.wbs_element (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  project_id    uuid not null references mdm.project(id) on delete cascade,
  parent_id     uuid references mdm.wbs_element(id) on delete set null,

  code          text not null,
  name          text not null,
  path          text,
  depth         int not null default 0,

  ou_node_id    uuid references core.ou_node(id),
  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint wbs_code_uniq unique (tenant_id, project_id, code)
);

comment on table mdm.wbs_element is 'Work Breakdown Structure elements within projects.';

create index if not exists idx_wbs_project
  on mdm.wbs_element (tenant_id, project_id);

-- END (Step 15)

-- ============================================================================
-- STEP 16 of 21: 90_seed/910_seed_operations.sql
-- Seed: operations
-- ============================================================================

/* ============================================================================
   Athyper — SEED: Operation Categories + Operations
   Idempotent (ON CONFLICT DO NOTHING).
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- Operation Categories
-- ----------------------------------------------------------------------------
insert into core.operation_category (code, name, description, sort_order) values
  ('entity',        'Entity Operations',        'CRUD operations on entities',          1),
  ('workflow',       'Workflow Operations',       'State transitions and approvals',      2),
  ('utilities',      'Utility Operations',        'Copy, merge, import/export',           3),
  ('delegation',     'Delegation Operations',     'Sharing and delegation',               4),
  ('collaboration',  'Collaboration Operations',  'Comments, attachments, following',      5)
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- Entity Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('read',         'Read',         'View entity records',    true,  false, 1),
  ('create',       'Create',       'Create new records',     false, false, 2),
  ('update',       'Update',       'Update existing records', true,  false, 3),
  ('delete_draft', 'Delete Draft', 'Delete draft records',   true,  true,  4),
  ('delete',       'Delete',       'Delete any records',     true,  false, 5)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'entity'
on conflict (category_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- Workflow Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('submit',   'Submit',   'Submit for approval',          true, true,  1),
  ('amend',    'Amend',    'Amend submitted record',       true, true,  2),
  ('cancel',   'Cancel',   'Cancel record',                true, true,  3),
  ('close',    'Close',    'Close record',                 true, false, 4),
  ('reopen',   'Reopen',   'Reopen closed record',         true, false, 5),
  ('withdraw', 'Withdraw', 'Withdraw submission',          true, true,  6),
  ('escalate', 'Escalate', 'Escalate to higher authority', true, false, 7),
  ('approve',  'Approve',  'Approve record',               true, false, 8),
  ('deny',     'Deny',     'Deny/reject record',           true, false, 9)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'workflow'
on conflict (category_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- Utility Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('copy',        'Copy',        'Copy record',         true,  false, 1),
  ('merge',       'Merge',       'Merge records',       true,  false, 2),
  ('report',      'Report',      'Generate reports',    false, false, 3),
  ('print',       'Print',       'Print records',       true,  false, 4),
  ('import',      'Import',      'Import data',         false, false, 5),
  ('export',      'Export',      'Export data',          false, false, 6),
  ('bulk_import', 'Bulk Import', 'Bulk import data',    false, false, 7),
  ('bulk_export', 'Bulk Export', 'Bulk export data',    false, false, 8),
  ('bulk_update', 'Bulk Update', 'Bulk update records', false, false, 9),
  ('bulk_delete', 'Bulk Delete', 'Bulk delete records', false, false, 10)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'utilities'
on conflict (category_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- Delegation Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('delegate',       'Delegate',        'Delegate task to another user',       true, false, 1),
  ('share_readonly', 'Share Read-only', 'Share record with read-only access',  true, false, 2),
  ('share_editable', 'Share Editable',  'Share record with edit access',       true, false, 3)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'delegation'
on conflict (category_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- Collaboration Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('comment_add',             'Add Comment',              'Add comment to record',         true, false, 1),
  ('attachment_add',          'Add Attachment',           'Add attachment to record',       true, false, 2),
  ('comment_delete_other',    'Delete Other Comments',    'Delete comments by others',     true, false, 3),
  ('attachment_delete_other', 'Delete Other Attachments', 'Delete attachments by others',  true, false, 4),
  ('follow',                  'Follow',                   'Follow record for updates',     true, false, 5),
  ('tag',                     'Tag',                      'Add tags to record',            true, false, 6)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'collaboration'
on conflict (category_id, code) do nothing;

-- END (Step 16)

-- ============================================================================
-- STEP 17 of 21: 90_seed/911_seed_personas.sql
-- Seed: personas + capability matrix
-- ============================================================================

/* ============================================================================
   Athyper — SEED: Personas + Capability Matrix
   Idempotent (ON CONFLICT DO NOTHING / DO UPDATE).
   Depends on: 910_seed_operations.sql
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- Persona Definitions
-- ----------------------------------------------------------------------------
insert into core.persona (code, name, description, scope_mode, priority, is_system) values
  ('viewer',       'Viewer',       'Read-only access to records',          'tenant', 10,  true),
  ('reporter',     'Reporter',     'Viewer plus reporting capabilities',   'tenant', 20,  true),
  ('requester',    'Requester',    'Can create and manage own requests',   'tenant', 30,  true),
  ('agent',        'Agent',        'Process requests within assigned OU',  'ou',     40,  true),
  ('manager',      'Manager',      'Manage and approve within OU scope',   'ou',     50,  true),
  ('module_admin', 'Module Admin', 'Administer module entities',           'module', 60,  true),
  ('tenant_admin', 'Tenant Admin', 'Full tenant administration',           'tenant', 100, true)
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- Helper function for granting capabilities
-- ----------------------------------------------------------------------------
create or replace function core._seed_grant_capability(
  p_persona_code text,
  p_operation_code text,
  p_constraint_type text default 'none'
) returns void as $$
begin
  insert into core.persona_capability (persona_id, operation_id, is_granted, constraint_type)
  select p.id, o.id, true, p_constraint_type
  from core.persona p, core.operation o
  where p.code = p_persona_code and o.code = p_operation_code
  on conflict (persona_id, operation_id) do update set
    is_granted = true,
    constraint_type = p_constraint_type,
    updated_at = now();
end;
$$ language plpgsql;

-- ============================================================================
-- VIEWER capabilities
-- ============================================================================
select core._seed_grant_capability('viewer', 'read');
select core._seed_grant_capability('viewer', 'approve');
select core._seed_grant_capability('viewer', 'deny');
select core._seed_grant_capability('viewer', 'follow');
select core._seed_grant_capability('viewer', 'tag');

-- ============================================================================
-- REPORTER capabilities (viewer + reporting)
-- ============================================================================
select core._seed_grant_capability('reporter', 'read');
select core._seed_grant_capability('reporter', 'approve');
select core._seed_grant_capability('reporter', 'deny');
select core._seed_grant_capability('reporter', 'report');
select core._seed_grant_capability('reporter', 'print');
select core._seed_grant_capability('reporter', 'export');
select core._seed_grant_capability('reporter', 'follow');
select core._seed_grant_capability('reporter', 'tag');

-- ============================================================================
-- REQUESTER capabilities (create and manage own)
-- ============================================================================
select core._seed_grant_capability('requester', 'read');
select core._seed_grant_capability('requester', 'create');
select core._seed_grant_capability('requester', 'update',       'own');
select core._seed_grant_capability('requester', 'delete_draft', 'own');
select core._seed_grant_capability('requester', 'submit',       'own');
select core._seed_grant_capability('requester', 'amend',        'own');
select core._seed_grant_capability('requester', 'cancel',       'own');
select core._seed_grant_capability('requester', 'withdraw',     'own');
select core._seed_grant_capability('requester', 'escalate');
select core._seed_grant_capability('requester', 'copy');
select core._seed_grant_capability('requester', 'report');
select core._seed_grant_capability('requester', 'print');
select core._seed_grant_capability('requester', 'export');
select core._seed_grant_capability('requester', 'delegate');
select core._seed_grant_capability('requester', 'share_readonly');
select core._seed_grant_capability('requester', 'comment_add');
select core._seed_grant_capability('requester', 'attachment_add');
select core._seed_grant_capability('requester', 'follow');
select core._seed_grant_capability('requester', 'tag');

-- ============================================================================
-- AGENT capabilities (process within OU)
-- ============================================================================
select core._seed_grant_capability('agent', 'read',         'ou');
select core._seed_grant_capability('agent', 'create');
select core._seed_grant_capability('agent', 'update',       'ou');
select core._seed_grant_capability('agent', 'delete_draft', 'own');
select core._seed_grant_capability('agent', 'submit',       'own');
select core._seed_grant_capability('agent', 'amend',        'own');
select core._seed_grant_capability('agent', 'cancel',       'own');
select core._seed_grant_capability('agent', 'withdraw',     'own');
select core._seed_grant_capability('agent', 'escalate');
select core._seed_grant_capability('agent', 'approve',      'ou');
select core._seed_grant_capability('agent', 'deny',         'ou');
select core._seed_grant_capability('agent', 'copy');
select core._seed_grant_capability('agent', 'report');
select core._seed_grant_capability('agent', 'print');
select core._seed_grant_capability('agent', 'import');
select core._seed_grant_capability('agent', 'export');
select core._seed_grant_capability('agent', 'delegate');
select core._seed_grant_capability('agent', 'share_readonly');
select core._seed_grant_capability('agent', 'comment_add');
select core._seed_grant_capability('agent', 'attachment_add');
select core._seed_grant_capability('agent', 'follow');
select core._seed_grant_capability('agent', 'tag');

-- ============================================================================
-- MANAGER capabilities (manage and approve within OU)
-- ============================================================================
select core._seed_grant_capability('manager', 'read',                    'ou');
select core._seed_grant_capability('manager', 'close',                   'ou');
select core._seed_grant_capability('manager', 'reopen',                  'ou');
select core._seed_grant_capability('manager', 'escalate');
select core._seed_grant_capability('manager', 'approve',                 'ou');
select core._seed_grant_capability('manager', 'deny',                    'ou');
select core._seed_grant_capability('manager', 'report');
select core._seed_grant_capability('manager', 'print');
select core._seed_grant_capability('manager', 'export');
select core._seed_grant_capability('manager', 'delegate');
select core._seed_grant_capability('manager', 'share_readonly');
select core._seed_grant_capability('manager', 'share_editable');
select core._seed_grant_capability('manager', 'comment_add');
select core._seed_grant_capability('manager', 'attachment_add');
select core._seed_grant_capability('manager', 'comment_delete_other');
select core._seed_grant_capability('manager', 'attachment_delete_other');
select core._seed_grant_capability('manager', 'follow');
select core._seed_grant_capability('manager', 'tag');

-- ============================================================================
-- MODULE_ADMIN capabilities (module-scoped administration)
-- ============================================================================
select core._seed_grant_capability('module_admin', 'read',                    'module');
select core._seed_grant_capability('module_admin', 'delete',                  'module');
select core._seed_grant_capability('module_admin', 'merge',                   'module');
select core._seed_grant_capability('module_admin', 'report');
select core._seed_grant_capability('module_admin', 'print');
select core._seed_grant_capability('module_admin', 'import',                  'module');
select core._seed_grant_capability('module_admin', 'export');
select core._seed_grant_capability('module_admin', 'bulk_import',             'module');
select core._seed_grant_capability('module_admin', 'bulk_export',             'module');
select core._seed_grant_capability('module_admin', 'bulk_update',             'module');
select core._seed_grant_capability('module_admin', 'bulk_delete',             'module');
select core._seed_grant_capability('module_admin', 'delegate');
select core._seed_grant_capability('module_admin', 'share_readonly');
select core._seed_grant_capability('module_admin', 'share_editable');
select core._seed_grant_capability('module_admin', 'comment_add');
select core._seed_grant_capability('module_admin', 'attachment_add');
select core._seed_grant_capability('module_admin', 'comment_delete_other');
select core._seed_grant_capability('module_admin', 'attachment_delete_other');
select core._seed_grant_capability('module_admin', 'follow');
select core._seed_grant_capability('module_admin', 'tag');

-- ============================================================================
-- TENANT_ADMIN capabilities (full access, no constraints)
-- ============================================================================
select core._seed_grant_capability('tenant_admin', 'read');
select core._seed_grant_capability('tenant_admin', 'delete');
select core._seed_grant_capability('tenant_admin', 'merge');
select core._seed_grant_capability('tenant_admin', 'report');
select core._seed_grant_capability('tenant_admin', 'print');
select core._seed_grant_capability('tenant_admin', 'import');
select core._seed_grant_capability('tenant_admin', 'export');
select core._seed_grant_capability('tenant_admin', 'bulk_import');
select core._seed_grant_capability('tenant_admin', 'bulk_export');
select core._seed_grant_capability('tenant_admin', 'bulk_update');
select core._seed_grant_capability('tenant_admin', 'bulk_delete');
select core._seed_grant_capability('tenant_admin', 'delegate');
select core._seed_grant_capability('tenant_admin', 'share_readonly');
select core._seed_grant_capability('tenant_admin', 'share_editable');
select core._seed_grant_capability('tenant_admin', 'comment_add');
select core._seed_grant_capability('tenant_admin', 'attachment_add');
select core._seed_grant_capability('tenant_admin', 'comment_delete_other');
select core._seed_grant_capability('tenant_admin', 'attachment_delete_other');
select core._seed_grant_capability('tenant_admin', 'follow');
select core._seed_grant_capability('tenant_admin', 'tag');

-- ----------------------------------------------------------------------------
-- Drop helper function (cleanup)
-- ----------------------------------------------------------------------------
drop function if exists core._seed_grant_capability(text, text, text);

-- END (Step 17)

-- ============================================================================
-- STEP 18 of 21: 90_seed/912_seed_modules.sql
-- Seed: modules
-- ============================================================================

/* ============================================================================
   Athyper — SEED: Core Modules
   Platform + business module definitions.
   Idempotent (ON CONFLICT DO NOTHING).
   ============================================================================ */

insert into core.module (code, name, description) values
  -- Platform modules
  ('FND',  'Foundation Runtime',             'Meta-driven runtime engine'),
  ('META', 'Metadata Studio',                'Declarative configuration'),
  ('IAM',  'Identity & Access Management',   'Authentication and authorization'),
  ('AUD',  'Audit & Governance',             'Audit trails and compliance'),
  ('POL',  'Policy & Rules Engine',          'Business rules and validations'),
  ('WFL',  'Workflow Engine',                'State machines and approvals'),
  ('JOB',  'Automation & Jobs',              'Schedulers and background tasks'),
  ('DOC',  'Document Services',              'PDF/HTML generation'),
  ('NTF',  'Notification Services',          'Email and alerts'),
  ('INT',  'Integration Hub',               'API gateway and webhooks'),
  ('CMS',  'Content Services',               'Document storage'),
  ('ACT',  'Activity & Commentary',          'Comments and timelines'),
  ('REL',  'Relationship Management',        'Address book'),

  -- Finance modules
  ('ACC',  'Finance (Core Accounting)',       'GL, AP, AR'),
  ('PAY',  'Payment Processing',             'Collections and disbursements'),
  ('TRE',  'Treasury & Cash Management',     'Cash and FX'),
  ('BUD',  'Budget & Funds Control',         'Budget planning'),

  -- Commercial modules
  ('CRM',  'Customer Relationship Management', 'Sales pipeline'),
  ('SRM',  'Supplier Relationship Management', 'Supplier lifecycle'),
  ('SRC',  'Sourcing Management',            'RFQs and bids'),
  ('CNT',  'Contract Management',            'Commercial contracts'),
  ('BUY',  'Buying',                         'Purchasing and POs'),
  ('SEL',  'Selling',                        'Sales orders'),

  -- Supply chain modules
  ('INV',  'Inventory Management',           'Stock control'),
  ('QAL',  'Quality Management',             'Inspections'),
  ('WHS',  'Warehouse Management',           'Bin management'),
  ('TRN',  'Transportation & Logistics',     'Shipping'),

  -- Operations modules
  ('MNT',  'Maintenance Management',         'Work orders'),
  ('MFG',  'Manufacturing',                  'BOMs and MRP'),
  ('AST',  'Asset Management',               'Fixed assets'),
  ('REM',  'Real Estate Asset Management',   'Property management'),
  ('FAC',  'Facility Management',            'Buildings and utilities'),

  -- HR modules
  ('HRM',  'Human Resources',               'Employee lifecycle'),
  ('PRL',  'Payroll',                        'Salary processing'),

  -- Project & service modules
  ('PRJ',  'Project Management',             'Projects and tasks'),
  ('SVC',  'Support & Service Management',   'Tickets and SLAs')
on conflict (code) do nothing;

-- END (Step 18)

-- ============================================================================
-- STEP 19 of 21: 90_seed/920_seed_default_deny_policy.sql
-- Seed: default deny policy
-- ============================================================================

/* ============================================================================
   Athyper — SEED: Default Deny Policy
   Creates a default-deny permission policy for all tenants.
   This ensures no access is granted unless explicitly allowed.
   Idempotent.
   ============================================================================ */

-- placeholder: default deny policy seed will be added when
-- the permission policy compiler is finalized.
-- see meta.permission_policy + meta.permission_policy_compiled

-- END (Step 19)

-- ============================================================================
-- STEP 20 of 21: 90_seed/930_seed_platform_admin_allow.sql
-- Seed: platform admin allow
-- ============================================================================

/* ============================================================================
   Athyper — SEED: Platform Admin Allow Policy
   Grants platform/tenant admins full access.
   Idempotent.
   ============================================================================ */

-- placeholder: platform admin allow policy seed will be added when
-- the permission policy compiler is finalized.
-- see meta.permission_policy + meta.permission_policy_compiled

-- END (Step 20)

-- ============================================================================
-- STEP 21 of 21: 90_seed/940_refresh_compiled_policies.sql
-- Seed: refresh compiled policies
-- ============================================================================

/* ============================================================================
   Athyper — SEED: Refresh Compiled Policies
   Triggers recompilation of permission policy decision trees after seeding.
   Idempotent.
   ============================================================================ */

-- placeholder: compiled policy refresh will be added when
-- the permission policy compiler is finalized.
-- see meta.permission_policy_compiled

-- END (Step 21)

COMMIT;
