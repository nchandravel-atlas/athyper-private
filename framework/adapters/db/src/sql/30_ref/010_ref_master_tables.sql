/* ============================================================================
   Athyper — REF: Global Reference Data (shared, NOT tenant-scoped)
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- REF: Currency
-- ----------------------------------------------------------------------------
create table if not exists ref.currency (
  code         text primary key,
  name         text,
  symbol       text,
  minor_units  int,
  metadata     jsonb
);

comment on table ref.currency is 'ISO 4217 currency codes.';

-- ----------------------------------------------------------------------------
-- REF: Unit of Measure
-- ----------------------------------------------------------------------------
create table if not exists ref.uom (
  code         text primary key,
  name         text,
  metadata     jsonb
);

comment on table ref.uom is 'Standard units of measure.';

-- ----------------------------------------------------------------------------
-- REF: Commodity Codes (UNSPSC / custom)
-- ----------------------------------------------------------------------------
create table if not exists ref.commodity_code (
  code         text primary key,
  scheme       text,
  name         text,
  parent_code  text,
  metadata     jsonb
);

comment on table ref.commodity_code is 'Commodity classification codes (UNSPSC, custom).';

create index if not exists idx_commodity_parent
  on ref.commodity_code (parent_code);

-- ----------------------------------------------------------------------------
-- REF: Language
-- ----------------------------------------------------------------------------
create table if not exists ref.language (
  code         text primary key,
  name         text
);

comment on table ref.language is 'ISO 639 language codes.';

-- ----------------------------------------------------------------------------
-- REF: Locale
-- ----------------------------------------------------------------------------
create table if not exists ref.locale (
  code         text primary key,
  language     text,
  is_rtl       boolean not null default false
);

comment on table ref.locale is 'Locale codes (en-US, ar-SA) with RTL indicator.';

-- ----------------------------------------------------------------------------
-- REF: Country (ISO)
-- ----------------------------------------------------------------------------
create table if not exists ref.country (
  code         text primary key,
  name         text,
  currency_code text references ref.currency(code),
  metadata     jsonb
);

comment on table ref.country is 'ISO 3166 country codes.';

-- ----------------------------------------------------------------------------
-- REF: Registration Kind
-- ----------------------------------------------------------------------------
create table if not exists ref.registration_kind (
  code         text primary key,
  name         text
);

comment on table ref.registration_kind is 'Business registration types (CR, VAT, GST, EIN, etc.).';

-- ----------------------------------------------------------------------------
-- REF: Contact Channel Types
-- ----------------------------------------------------------------------------
create table if not exists ref.contact_channel_type (
  code         text primary key,
  name         text
);

comment on table ref.contact_channel_type is 'Contact channel types (email, phone, whatsapp, website).';

-- ----------------------------------------------------------------------------
-- REF: Tax Identifier Types
-- ----------------------------------------------------------------------------
create table if not exists ref.tax_identifier_type (
  code         text primary key,
  name         text
);

comment on table ref.tax_identifier_type is 'Tax identifier types (SSN, TIN, PAN, etc.).';

-- ----------------------------------------------------------------------------
-- REF: Issuing Authority
-- ----------------------------------------------------------------------------
create table if not exists ref.issuing_authority (
  id           uuid primary key default gen_random_uuid(),
  country_code text references ref.country(code),
  name         text not null,
  metadata     jsonb
);

comment on table ref.issuing_authority is 'Government / regulatory issuing authorities.';

create index if not exists idx_issuing_authority_country
  on ref.issuing_authority (country_code);
