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
