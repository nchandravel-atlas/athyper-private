/* ============================================================================
   Athyper — ENT: Entity Master Data
   Customers, Suppliers, Employees, Products, Categories, Relationships

   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- ENT: Customer
-- ============================================================================
create table if not exists ent.customer (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  code           text not null,
  name           text not null,
  display_name   text,

  customer_type  text not null default 'individual',
  status         text not null default 'active',

  tax_id         text,
  industry_code  text,

  primary_contact_id uuid,
  primary_address_id uuid,

  metadata       jsonb,
  tags           text[],

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text,

  constraint customer_tenant_code_uniq unique (tenant_id, code),
  constraint customer_type_chk check (customer_type in ('individual','business','government','nonprofit')),
  constraint customer_status_chk check (status in ('active','inactive','suspended','archived'))
);

comment on table ent.customer is 'Master customer records.';

create index if not exists idx_customer_tenant
  on ent.customer (tenant_id);

create index if not exists idx_customer_status
  on ent.customer (tenant_id, status);

create index if not exists idx_customer_name
  on ent.customer (tenant_id, name);

create index if not exists idx_customer_tags
  on ent.customer using gin (tags);

-- ============================================================================
-- ENT: Supplier
-- ============================================================================
create table if not exists ent.supplier (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  code           text not null,
  name           text not null,
  display_name   text,

  supplier_type  text not null default 'vendor',
  status         text not null default 'active',

  tax_id         text,
  industry_code  text,

  primary_contact_id uuid,
  primary_address_id uuid,

  payment_terms  text,
  currency_code  text,

  metadata       jsonb,
  tags           text[],

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text,

  constraint supplier_tenant_code_uniq unique (tenant_id, code),
  constraint supplier_type_chk check (supplier_type in ('vendor','contractor','distributor','manufacturer')),
  constraint supplier_status_chk check (status in ('active','inactive','suspended','archived'))
);

comment on table ent.supplier is 'Master supplier/vendor records.';

create index if not exists idx_supplier_tenant
  on ent.supplier (tenant_id);

create index if not exists idx_supplier_status
  on ent.supplier (tenant_id, status);

create index if not exists idx_supplier_name
  on ent.supplier (tenant_id, name);

-- ============================================================================
-- ENT: Employee
-- ============================================================================
create table if not exists ent.employee (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,
  principal_id    uuid references core.principal(id) on delete set null,

  employee_number text not null,
  first_name      text not null,
  last_name       text not null,
  display_name    text,

  email           text,
  phone           text,

  status          text not null default 'active',
  employment_type text not null default 'full_time',

  department      text,
  title           text,
  manager_id      uuid references ent.employee(id) on delete set null,
  ou_id           uuid references core.organizational_unit(id) on delete set null,

  hire_date       date,
  termination_date date,

  metadata        jsonb,
  tags            text[],

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,

  constraint employee_tenant_number_uniq unique (tenant_id, employee_number),
  constraint employee_status_chk check (status in ('active','inactive','on_leave','terminated')),
  constraint employee_type_chk check (employment_type in ('full_time','part_time','contractor','intern','temporary'))
);

comment on table ent.employee is 'Master employee records.';

create index if not exists idx_employee_tenant
  on ent.employee (tenant_id);

create index if not exists idx_employee_principal
  on ent.employee (principal_id);

create index if not exists idx_employee_status
  on ent.employee (tenant_id, status);

create index if not exists idx_employee_manager
  on ent.employee (manager_id);

create index if not exists idx_employee_department
  on ent.employee (tenant_id, department);

-- ============================================================================
-- ENT: Product Category
-- ============================================================================
create table if not exists ent.product_category (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  code          text not null,
  name          text not null,
  description   text,

  parent_id     uuid references ent.product_category(id) on delete set null,

  sort_order    int,
  is_active     boolean not null default true,

  metadata      jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint product_category_tenant_code_uniq unique (tenant_id, code)
);

comment on table ent.product_category is 'Hierarchical product categories.';

create index if not exists idx_product_category_tenant
  on ent.product_category (tenant_id);

create index if not exists idx_product_category_parent
  on ent.product_category (parent_id);

-- ============================================================================
-- ENT: Product
-- ============================================================================
create table if not exists ent.product (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  code           text not null,
  sku            text,
  name           text not null,
  description    text,

  category_id    uuid references ent.product_category(id) on delete set null,

  status         text not null default 'active',
  product_type   text not null default 'physical',

  unit_of_measure text,
  base_price     numeric(18,4),
  currency_code  text,

  is_taxable     boolean not null default true,
  tax_code       text,

  metadata       jsonb,
  tags           text[],

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text,

  constraint product_tenant_code_uniq unique (tenant_id, code),
  constraint product_status_chk check (status in ('active','inactive','discontinued','draft')),
  constraint product_type_chk check (product_type in ('physical','digital','service','subscription','bundle'))
);

comment on table ent.product is 'Master product records.';

create index if not exists idx_product_tenant
  on ent.product (tenant_id);

create index if not exists idx_product_status
  on ent.product (tenant_id, status);

create index if not exists idx_product_category
  on ent.product (category_id);

create index if not exists idx_product_sku
  on ent.product (tenant_id, sku);

create index if not exists idx_product_tags
  on ent.product using gin (tags);

-- ============================================================================
-- ENT: Entity Relationship (generic entity-to-entity link)
-- ============================================================================
create table if not exists ent.entity_relationship (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  relationship_type text not null,

  entity_a_type    text not null,
  entity_a_id      uuid not null,

  entity_b_type    text not null,
  entity_b_id      uuid not null,

  is_bidirectional boolean not null default false,
  status           text not null default 'active',

  effective_from   timestamptz,
  effective_until  timestamptz,

  metadata         jsonb,

  created_at       timestamptz not null default now(),
  created_by       text not null,
  updated_at       timestamptz,
  updated_by       text,

  constraint entity_relationship_status_chk check (status in ('active','inactive','archived'))
);

comment on table ent.entity_relationship is 'Generic entity-to-entity relationships.';

create index if not exists idx_entity_relationship_a
  on ent.entity_relationship (tenant_id, entity_a_type, entity_a_id);

create index if not exists idx_entity_relationship_b
  on ent.entity_relationship (tenant_id, entity_b_type, entity_b_id);

create index if not exists idx_entity_relationship_type
  on ent.entity_relationship (tenant_id, relationship_type);
