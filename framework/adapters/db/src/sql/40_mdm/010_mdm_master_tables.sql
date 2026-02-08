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
  base_currency char(3) references ref.currency(code),
  country_code  char(2) references ref.country(code2),

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
