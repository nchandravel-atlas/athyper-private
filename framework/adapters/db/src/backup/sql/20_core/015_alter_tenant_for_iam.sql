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
