/* ============================================================================
   Athyper — CORE: Permissions & Modules
   Operation Categories, Operations, Personas, Persona Capabilities,
   Modules, Tenant Module Subscriptions

   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: Operation Category (system-wide operation classification)
-- ============================================================================
create table if not exists core.operation_category (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  description  text,
  sort_order   int not null default 0,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'system',
  updated_at   timestamptz,
  updated_by   text
);

comment on table core.operation_category is
'System-wide operation categories (entity, workflow, utilities, etc.).';

create index if not exists idx_operation_category_sort
  on core.operation_category (sort_order);

-- ============================================================================
-- CORE: Operation (atomic permission action — system-wide)
-- ============================================================================
create table if not exists core.operation (
  id                 uuid primary key default gen_random_uuid(),
  category_id        uuid not null references core.operation_category(id) on delete cascade,

  code               text not null,
  name               text not null,
  description        text,

  requires_record    boolean not null default false,
  requires_ownership boolean not null default false,
  sort_order         int not null default 0,

  created_at         timestamptz not null default now(),
  created_by         text not null default 'system',
  updated_at         timestamptz,
  updated_by         text,

  constraint operation_category_code_uniq unique (category_id, code)
);

comment on table core.operation is
'Atomic permission actions (create, read, update, delete, etc.).';

create index if not exists idx_operation_category
  on core.operation (category_id);

create index if not exists idx_operation_code
  on core.operation (code);

-- ============================================================================
-- CORE: Persona (permission bundle — system-wide)
-- ============================================================================
create table if not exists core.persona (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  description  text,

  scope_mode   text not null default 'tenant',
  priority     int not null default 0,
  is_system    boolean not null default false,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'system',
  updated_at   timestamptz,
  updated_by   text,

  constraint persona_scope_mode_chk check (scope_mode in ('tenant','ou','module'))
);

comment on table core.persona is
'Permission bundling/specialization (viewer, agent, manager, admin, etc.).';

create index if not exists idx_persona_scope_mode
  on core.persona (scope_mode);

create index if not exists idx_persona_system
  on core.persona (is_system) where is_system = true;

-- ============================================================================
-- CORE: Persona Capability (persona -> operation grant)
-- ============================================================================
create table if not exists core.persona_capability (
  id              uuid primary key default gen_random_uuid(),
  persona_id      uuid not null references core.persona(id) on delete cascade,
  operation_id    uuid not null references core.operation(id) on delete cascade,

  is_granted      boolean not null default true,
  constraint_type text not null default 'none',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz,

  constraint persona_capability_persona_op_uniq unique (persona_id, operation_id)
);

comment on table core.persona_capability is
'Persona-to-operation capability mapping with constraint type.';

create index if not exists idx_persona_capability_persona
  on core.persona_capability (persona_id);

create index if not exists idx_persona_capability_operation
  on core.persona_capability (operation_id);

-- ============================================================================
-- CORE: Module (logical feature grouping — system-wide)
-- ============================================================================
create table if not exists core.module (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         text not null,
  description  text,

  workspace_id uuid,  -- FK to core.workspace deferred to 090_core_misc.sql

  config       jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'system',
  updated_at   timestamptz,
  updated_by   text
);

comment on table core.module is
'Logical feature/permission modules (billing, analytics, etc.).';

comment on column core.module.workspace_id is
'FK to core.workspace — constraint added in 090_core_misc.sql (deferred due to file ordering).';

create index if not exists idx_module_code
  on core.module (code);

create index if not exists idx_module_workspace
  on core.module (workspace_id) where workspace_id is not null;

-- ============================================================================
-- CORE: Tenant Module Subscription (tenant -> module activation)
-- ============================================================================
create table if not exists core.tenant_module_subscription (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,
  module_id    uuid not null references core.module(id) on delete cascade,

  is_active    boolean not null default true,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'system',
  updated_at   timestamptz,
  updated_by   text,

  constraint tenant_module_subscription_uniq unique (tenant_id, module_id)
);

comment on table core.tenant_module_subscription is
'Tenant-to-module activation/subscription mapping.';

create index if not exists idx_tenant_module_sub_tenant
  on core.tenant_module_subscription (tenant_id);

create index if not exists idx_tenant_module_sub_module
  on core.tenant_module_subscription (module_id);

create index if not exists idx_tenant_module_sub_active
  on core.tenant_module_subscription (tenant_id, is_active) where is_active = true;
