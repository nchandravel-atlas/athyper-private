alter table core.address
  add constraint address_tenant_id_id_uq
  unique (tenant_id, id);
  
-- ----------------------------------------------------------------------------
-- CORE: Address Links (Polymorphic)
-- ----------------------------------------------------------------------------
create table if not exists core.address_link (
  id            uuid primary key default gen_random_uuid(),

  tenant_id     uuid not null
               references core.tenant(id)
               on delete cascade,

  address_id    uuid not null,

  owner_type    text not null,
  owner_id      uuid not null,

  purpose       text not null,
  is_primary    boolean not null default false,

  valid_from    date,
  valid_to      date,

  metadata      jsonb not null default '{}'::jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,

  updated_at    timestamptz,
  updated_by    text
);

comment on table core.address_link
is 'Polymorphic address assignments for tenant entities.';

-- --------------------------------------------------------------------
-- Constraints
-- --------------------------------------------------------------------

-- Enforce address role vocabulary
alter table core.address_link
  add constraint address_link_purpose_chk
  check (
    purpose in ('legal','billing','shipping','office','home','hq','other')
  );

-- Enforce allowed owner types (adjust as platform grows) LATER

-- Enforce valid date range
alter table core.address_link
  add constraint address_link_valid_range_chk
  check (
    valid_to is null
    or valid_from is null
    or valid_to >= valid_from
  );

-- Enforce tenant-safe address FK
alter table core.address_link
  add constraint address_link_address_fk
  foreign key (tenant_id, address_id)
  references core.address(tenant_id, id)
  on delete cascade;

-- --------------------------------------------------------------------
-- Uniqueness Rules
-- --------------------------------------------------------------------

-- Prevent duplicate same-purpose links
create unique index if not exists address_link_dedupe_uq
  on core.address_link (
    tenant_id,
    owner_type,
    owner_id,
    purpose,
    address_id
  );

-- Only one primary per owner + purpose
create unique index if not exists address_link_one_primary_uq
  on core.address_link (
    tenant_id,
    owner_type,
    owner_id,
    purpose
  )
  where is_primary;

-- --------------------------------------------------------------------
-- Performance Indexes
-- --------------------------------------------------------------------

-- Owner lookups
create index if not exists address_link_owner_idx
  on core.address_link (
    tenant_id,
    owner_type,
    owner_id
  );

-- Address reverse lookup
create index if not exists address_link_address_idx
  on core.address_link (
    tenant_id,
    address_id
  );

-- Fast primary resolution
create index if not exists address_link_primary_lookup_idx
  on core.address_link (
    tenant_id,
    owner_type,
    owner_id,
    purpose
  )
  where is_primary;
