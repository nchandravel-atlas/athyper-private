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
