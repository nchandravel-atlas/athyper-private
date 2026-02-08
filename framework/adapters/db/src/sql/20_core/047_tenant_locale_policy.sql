/* ============================================================================
   Athyper — Core: Tenant Locale Policy
   PostgreSQL 16+

   Per-tenant locale selection from the global ref.locale catalog.
   Global ref.locale stays immutable — tenants choose what they support.

   Depends on: core.tenant (010), ref.locale (030_ref)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- CORE: Tenant Locale Policy
-- ----------------------------------------------------------------------------
create table if not exists core.tenant_locale_policy (
  tenant_id    uuid    not null
               references core.tenant(id)
               on delete cascade,
  locale_code  text    not null
               references ref.locale(code),

  support      text    not null default 'supported',
  ui_visible   boolean not null default true,       -- show in locale picker
  is_default   boolean not null default false,       -- tenant's primary locale
  sort_order   int     not null default 0,           -- display order in picker

  created_at   timestamptz not null default now(),
  created_by   text not null default 'system',
  updated_at   timestamptz,
  updated_by   text,

  primary key (tenant_id, locale_code),

  constraint tenant_locale_support_chk
    check (support in ('supported','limited','planned','disabled'))
);

comment on table core.tenant_locale_policy is
  'Per-tenant locale enablement policy. Global ref.locale is the catalog; this table records what each tenant supports.';

-- Only one default per tenant
create unique index if not exists idx_tenant_locale_one_default
  on core.tenant_locale_policy (tenant_id)
  where is_default = true;

-- Fast lookup: "which locales does this tenant support?"
create index if not exists idx_tenant_locale_supported
  on core.tenant_locale_policy (tenant_id, support)
  where support = 'supported' and ui_visible = true;

-- Fast lookup: "which tenants support this locale?"
create index if not exists idx_tenant_locale_by_locale
  on core.tenant_locale_policy (locale_code);
