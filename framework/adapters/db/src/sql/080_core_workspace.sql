/* ============================================================================
   Athyper — CORE: Workspace Management
   Workspaces, Workspace Features, Feature Subscriptions, View

   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: Workspace (logical organizational namespace)
-- ============================================================================
create table if not exists core.workspace (
  id            uuid primary key default gen_random_uuid(),

  code          text not null unique,
  name          text not null,
  description   text,
  sort_order    int not null default 0,

  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'system',
  updated_at    timestamptz,
  updated_by    text
);

comment on table core.workspace is
'System-wide workspace definitions (Finance, Supply Chain, etc.).';

create index if not exists idx_workspace_sort
  on core.workspace (sort_order);

-- ============================================================================
-- CORE: Workspace Feature (feature enabled in workspace)
-- ============================================================================
create table if not exists core.workspace_feature (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  workspace_id  uuid not null references core.workspace(id) on delete cascade,

  feature_code  text not null,
  feature_name  text,

  is_enabled    boolean not null default true,
  enabled_at    timestamptz,

  config        jsonb,
  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint workspace_feature_ws_feat_uniq unique (workspace_id, feature_code)
);

comment on table core.workspace_feature is 'Feature availability and configuration per workspace.';

create index if not exists idx_workspace_feature_workspace
  on core.workspace_feature (workspace_id, is_enabled);

create index if not exists idx_workspace_feature_code
  on core.workspace_feature (feature_code);

-- ============================================================================
-- CORE: Principal Workspace Access (role in workspace)
-- ============================================================================
create table if not exists core.principal_workspace_access (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  principal_id  uuid not null references core.principal(id) on delete cascade,
  workspace_id  uuid not null references core.workspace(id) on delete cascade,

  role_id       uuid references core.role(id) on delete set null,
  persona_id    uuid references core.persona(id) on delete set null,

  access_level  text not null default 'member',

  granted_at    timestamptz not null default now(),
  granted_by    text,
  expires_at    timestamptz,

  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint principal_workspace_access_uniq unique (principal_id, workspace_id),
  constraint principal_workspace_access_level_chk
    check (access_level in ('owner','admin','manager','member','viewer','guest')),
  constraint principal_workspace_access_role_persona_ck check (
    (role_id is null or persona_id is null)
  )
);

comment on table core.principal_workspace_access is
'Principal access to workspaces (role or persona assignment).';

create index if not exists idx_principal_workspace_access_principal
  on core.principal_workspace_access (principal_id);

create index if not exists idx_principal_workspace_access_workspace
  on core.principal_workspace_access (workspace_id);

create index if not exists idx_principal_workspace_access_role
  on core.principal_workspace_access (role_id);

create index if not exists idx_principal_workspace_access_access_level
  on core.principal_workspace_access (access_level);

-- ============================================================================
-- CORE: Workspace Usage Metrics (audit/metering)
-- ============================================================================
create table if not exists core.workspace_usage_metric (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,
  workspace_id  uuid not null references core.workspace(id) on delete cascade,

  metric_key    text not null,
  metric_name   text,
  metric_value  numeric,
  metric_unit   text,

  period_start  timestamptz not null,
  period_end    timestamptz,

  recorded_at   timestamptz not null default now(),

  created_at    timestamptz not null default now()
);

comment on table core.workspace_usage_metric is 'Usage metrics per workspace for billing/quota enforcement.';

create index if not exists idx_workspace_usage_metric_workspace
  on core.workspace_usage_metric (workspace_id, period_end desc);

create index if not exists idx_workspace_usage_metric_metric_key
  on core.workspace_usage_metric (workspace_id, metric_key, period_end desc);

-- ============================================================================
-- VIEW: workspace_feature_view (denormalized workspace + feature)
-- ============================================================================
create or replace view core.workspace_feature_view as
  select
    wf.id,
    wf.tenant_id,
    wf.workspace_id,
    w.code as workspace_code,
    w.name as workspace_name,
    wf.feature_code,
    wf.feature_name,
    wf.is_enabled,
    wf.config
  from core.workspace_feature wf
  join core.workspace w on wf.workspace_id = w.id;

comment on view core.workspace_feature_view is
'Denormalized view: workspace + features.';
