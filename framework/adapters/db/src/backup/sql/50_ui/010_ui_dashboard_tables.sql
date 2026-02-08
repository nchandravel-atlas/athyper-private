/* ============================================================================
   Athyper — UI: Dashboard Tables
   PostgreSQL 16+ (pgcrypto)

   Meta-driven dashboard engine tables:
   - ui.dashboard         — dashboard header + metadata
   - ui.dashboard_version — immutable versions (draft/published/archived)
   - ui.dashboard_acl     — role/group/user/persona access control
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- UI: Dashboard (header + metadata)
-- ----------------------------------------------------------------------------
create table if not exists ui.dashboard (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references core.tenant(id) on delete cascade,  -- NULL for system dashboards
  code            text not null,
  title_key       text not null,            -- i18n key: "dashboard.ACC.overview.title"
  description_key text,                      -- i18n key
  module_code     text not null,             -- matches core.module(code)
  workbench       text not null,             -- user | admin | partner
  visibility      text not null default 'system',  -- system | tenant | user
  icon            text,                      -- lucide icon name
  sort_order      int not null default 100,
  is_hidden       boolean not null default false,
  forked_from_id  uuid references ui.dashboard(id) on delete set null,
  owner_id        uuid,                      -- principal_id for visibility='user'

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,

  constraint dashboard_workbench_chk check (workbench in ('user','admin','partner')),
  constraint dashboard_visibility_chk check (visibility in ('system','tenant','user')),
  constraint dashboard_code_uniq unique (tenant_id, code, workbench)
);

comment on table ui.dashboard is 'Meta-driven dashboard definitions (system, tenant, or user-scoped).';

create index if not exists idx_dashboard_tenant_module
  on ui.dashboard (tenant_id, module_code);

create index if not exists idx_dashboard_tenant_workbench
  on ui.dashboard (tenant_id, workbench);

create index if not exists idx_dashboard_visibility
  on ui.dashboard (visibility);

create index if not exists idx_dashboard_module_workbench
  on ui.dashboard (module_code, workbench);

-- ----------------------------------------------------------------------------
-- UI: Dashboard Version (immutable versions with layout JSON)
-- ----------------------------------------------------------------------------
create table if not exists ui.dashboard_version (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references core.tenant(id) on delete cascade,
  dashboard_id    uuid not null references ui.dashboard(id) on delete cascade,
  version_no      int not null default 1,
  status          text not null default 'draft',    -- draft | published | archived
  layout          jsonb not null,                    -- DashboardLayout JSON
  published_at    timestamptz,
  published_by    text,

  created_at      timestamptz not null default now(),
  created_by      text not null,

  constraint dv_status_chk check (status in ('draft','published','archived')),
  constraint dv_version_uniq unique (tenant_id, dashboard_id, version_no)
);

comment on table ui.dashboard_version is 'Immutable dashboard versions with grid layout JSON (draft → published → archived).';

create index if not exists idx_dv_dashboard
  on ui.dashboard_version (dashboard_id);

create index if not exists idx_dv_status
  on ui.dashboard_version (status);

create index if not exists idx_dv_dashboard_status
  on ui.dashboard_version (dashboard_id, status);

-- ----------------------------------------------------------------------------
-- UI: Dashboard ACL (role/group/user/persona access control)
-- ----------------------------------------------------------------------------
create table if not exists ui.dashboard_acl (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid references core.tenant(id) on delete cascade,
  dashboard_id    uuid not null references ui.dashboard(id) on delete cascade,
  principal_type  text not null,              -- role | group | user | persona
  principal_key   text not null,              -- role code, group code, user id, persona code
  permission      text not null default 'view',  -- view | edit

  created_at      timestamptz not null default now(),
  created_by      text not null,

  constraint dacl_type_chk check (principal_type in ('role','group','user','persona')),
  constraint dacl_perm_chk check (permission in ('view','edit')),
  constraint dacl_uniq unique (tenant_id, dashboard_id, principal_type, principal_key)
);

comment on table ui.dashboard_acl is 'Dashboard access control entries (persona/role/group/user → view/edit).';

create index if not exists idx_dacl_dashboard
  on ui.dashboard_acl (dashboard_id);

create index if not exists idx_dacl_principal
  on ui.dashboard_acl (tenant_id, principal_type, principal_key);
