/* ============================================================================
   Athyper — SEED: Workspaces (Business Domains) + Module→Workspace Linkage
   Idempotent (ON CONFLICT DO NOTHING).
   Depends on: 912_seed_modules.sql
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- Workspace Definitions
-- ----------------------------------------------------------------------------
insert into core.workspace (code, name, description, sort_order) values
  ('FIN', 'Finance',                    'Financial accounting, payments, treasury, and budgeting',   10),
  ('SCM', 'Supply Chain',               'Procurement, inventory, warehousing, and logistics',        20),
  ('CXP', 'Customer Experience',        'Sales, sourcing, contracts, and commercial operations',     30),
  ('PPL', 'People Management',          'Human resources and payroll',                               40),
  ('PMO', 'Project Management',         'Projects, tasks, and service management',                   50),
  ('MFO', 'Manufacturing & Operations', 'Manufacturing, maintenance, and production operations',     60),
  ('ASM', 'Asset Management',           'Fixed assets, real estate, and facility management',        70)
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- Link Modules → Workspaces
-- Platform modules (FND, META, IAM, etc.) intentionally have no workspace.
-- ----------------------------------------------------------------------------

-- Finance workspace
update core.module set workspace_id = (select id from core.workspace where code = 'FIN')
where code in ('ACC', 'PAY', 'TREASURY', 'BUDGET', 'PAYG')
  and workspace_id is null;

-- Customer Experience workspace
update core.module set workspace_id = (select id from core.workspace where code = 'CXP')
where code in ('CRM', 'SALE')
  and workspace_id is null;

-- Supply Chain workspace
update core.module set workspace_id = (select id from core.workspace where code = 'SCM')
where code in ('SRM', 'SOURCE', 'CONTRACT', 'BUY', 'INVENTORY', 'QMS', 'SUBCON', 'DEMAND', 'WMS', 'LOGISTICS')
  and workspace_id is null;

-- People Management workspace
update core.module set workspace_id = (select id from core.workspace where code = 'PPL')
where code in ('HR', 'PAYROLL')
  and workspace_id is null;

-- Project Management workspace
update core.module set workspace_id = (select id from core.workspace where code = 'PMO')
where code in ('PRJCOST', 'ITSM')
  and workspace_id is null;

-- Manufacturing & Operations workspace
update core.module set workspace_id = (select id from core.workspace where code = 'MFO')
where code in ('MAINT', 'MFG')
  and workspace_id is null;

-- Asset Management workspace
update core.module set workspace_id = (select id from core.workspace where code = 'ASM')
where code in ('ASSET', 'ASSETREMS', 'ASSETFM')
  and workspace_id is null;
