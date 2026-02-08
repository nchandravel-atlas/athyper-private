/* ============================================================================
   Athyper — REF: Global Reference Data (shared, NOT tenant-scoped)
   PostgreSQL 16+

   Standards:
     ref.country           ISO 3166-1
     ref.state_region      ISO 3166-2
     ref.currency          ISO 4217
     ref.language          ISO 639
     ref.locale            BCP 47 (recommended) + links to language/country
     ref.timezone          IANA tzdb
     ref.uom               UN/ECE Rec 20
     ref.commodity_domain  (UNSPSC + HS + custom)
     ref.commodity_code    per domain
     ref.industry_domain   (ISIC/NAICS + custom)
     ref.industry_code     per domain

   NOTE: This file performs DROP CASCADE for dev/test environments.
         For production migrations use ALTER TABLE / CREATE IF NOT EXISTS.
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- DROP existing ref.* tables (safe recreate — dev/test only)
-- ----------------------------------------------------------------------------
drop table if exists ref.label cascade;

drop table if exists ref.industry_code cascade;
drop table if exists ref.industry_domain cascade;

drop table if exists ref.commodity_code cascade;
drop table if exists ref.commodity_domain cascade;

drop table if exists ref.state_region cascade;

drop table if exists ref.locale cascade;
drop table if exists ref.timezone cascade;
drop table if exists ref.language cascade;
drop table if exists ref.currency cascade;
drop table if exists ref.uom cascade;
drop table if exists ref.country cascade;

-- ============================================================================
-- REF: Country (ISO 3166-1)
-- ============================================================================
create table ref.country (
  code2        char(2) primary key,                 -- ISO 3166-1 alpha-2 (e.g., "SA")
  code3        char(3) unique,                      -- ISO 3166-1 alpha-3 (e.g., "SAU")
  numeric3     char(3) unique,                      -- ISO 3166-1 numeric-3 (e.g., "682")
  name         text not null,                       -- short name (English canonical)
  official_name text,

  region       text,                                -- UN M49: "Asia", "Europe", etc.
  subregion    text,                                -- UN M49: "Western Asia", etc.

  status       text not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'seed',
  updated_at   timestamptz,
  updated_by   text,

  constraint country_status_chk check (status in ('active','deprecated'))
);

comment on table ref.country is 'ISO 3166-1 country codes (alpha-2 PK).';

-- ============================================================================
-- REF: State/Region Codes (ISO 3166-2)
-- ============================================================================
create table ref.state_region (
  code          text primary key,                   -- ISO 3166-2 code (e.g., "SA-01")
  country_code2 char(2) not null
               references ref.country(code2)
               on delete cascade,
  name          text not null,                      -- subdivision name
  category      text,                               -- "region", "province", "state", "emirate", etc.
  parent_code   text references ref.state_region(code),
  status        text not null default 'active',
  metadata      jsonb not null default '{}'::jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'seed',
  updated_at    timestamptz,
  updated_by    text,

  constraint state_region_status_chk check (status in ('active','deprecated'))
);

comment on table ref.state_region is 'ISO 3166-2 subdivision codes.';
create index if not exists idx_state_region_country on ref.state_region(country_code2);
create index if not exists idx_state_region_parent on ref.state_region(parent_code);
create index if not exists idx_state_region_category on ref.state_region(category);

-- ============================================================================
-- REF: Currency (ISO 4217)
-- ============================================================================
create table ref.currency (
  code         char(3) primary key,                 -- ISO 4217 (e.g., "SAR")
  name         text not null,
  symbol       text,
  minor_units  int,                                 -- e.g., 2
  numeric3     char(3) unique,                      -- ISO 4217 numeric
  status       text not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'seed',
  updated_at   timestamptz,
  updated_by   text,

  constraint currency_status_chk check (status in ('active','deprecated'))
);

comment on table ref.currency is 'ISO 4217 currency codes.';

-- ============================================================================
-- REF: Language (ISO 639)
-- ============================================================================
create table ref.language (
  code         text primary key,                    -- ISO 639-1 preferred (e.g., "en","ar")
  name         text not null,                       -- English name
  native_name  text,
  iso639_2     text,                                -- ISO 639-2/T (3-letter)
  direction    text not null default 'ltr',         -- ltr/rtl

  status       text not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'seed',
  updated_at   timestamptz,
  updated_by   text,

  constraint language_dir_chk check (direction in ('ltr','rtl')),
  constraint language_status_chk check (status in ('active','deprecated'))
);

comment on table ref.language is 'ISO 639 language codes (prefer ISO 639-1).';

-- ============================================================================
-- REF: Locale (BCP 47 recommended)
--   Examples: "en", "en-US", "ar-SA", "fr-FR"
-- ============================================================================
create table ref.locale (
  code          text primary key,                   -- BCP 47 tag (recommended)
  language_code text not null
                references ref.language(code),
  country_code2 char(2)
                references ref.country(code2),
  script        text,                               -- optional: Latn, Arab, etc.
  name          text not null,                      -- display label, e.g. "English (United States)"
  direction     text,                               -- override language direction if needed
  status        text not null default 'active',
  metadata      jsonb not null default '{}'::jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'seed',
  updated_at    timestamptz,
  updated_by    text,

  constraint locale_status_chk check (status in ('active','deprecated')),
  constraint locale_dir_chk check (direction is null or direction in ('ltr','rtl'))
);

comment on table ref.locale is 'Locales (BCP 47 tags) linked to language and optional country.';
create index if not exists idx_locale_language on ref.locale(language_code);
create index if not exists idx_locale_country on ref.locale(country_code2);

-- ============================================================================
-- REF: Time Zone (IANA tzdb)
-- ============================================================================
create table ref.timezone (
  tzid          text primary key,                   -- e.g., "Asia/Riyadh"
  display_name  text,                               -- optional (UI label)
  utc_offset    text,                               -- e.g., "+03:00" (standard offset)
  is_alias      boolean not null default false,
  canonical_tzid text references ref.timezone(tzid),

  status        text not null default 'active',
  metadata      jsonb not null default '{}'::jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null default 'seed',
  updated_at    timestamptz,
  updated_by    text,

  constraint timezone_status_chk check (status in ('active','deprecated'))
);

comment on table ref.timezone is 'IANA tzdb time zone identifiers.';
create index if not exists idx_timezone_canonical on ref.timezone(canonical_tzid);

-- ============================================================================
-- REF: Unit of Measure (UN/ECE Rec 20)
-- ============================================================================
create table ref.uom (
  code         text primary key,                    -- UN/ECE Rec 20 code (e.g., "KGM", "MTR", "LTR")
  name         text not null,                       -- "Kilogram", "Metre", "Litre"
  symbol       text,                                -- "kg", "m", "L"
  quantity_type text,                               -- mass, length, volume, etc.
  status       text not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'seed',
  updated_at   timestamptz,
  updated_by   text,

  constraint uom_status_chk check (status in ('active','deprecated')),
  constraint uom_qty_type_chk check (
    quantity_type is null or quantity_type in (
      'mass','length','volume','area','time','temperature',
      'count','force','pressure','energy','data','speed',
      'density','frequency','electric','angle','currency'
    )
  )
);

comment on table ref.uom is 'UN/ECE Recommendation 20 units of measure.';

-- ============================================================================
-- REF: Commodity Domains (UNSPSC, HS, and custom)
-- ============================================================================
create table ref.commodity_domain (
  code         text primary key,                    -- "unspsc" | "hs" | "customCommodityGroup" | etc.
  name         text not null,
  standard     text,                                -- e.g. "UNSPSC", "HS", "CUSTOM"
  version      text,
  status       text not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'seed',
  updated_at   timestamptz,
  updated_by   text,

  constraint commodity_domain_status_chk check (status in ('active','deprecated'))
);

comment on table ref.commodity_domain is 'Commodity code domains (UNSPSC, HS, custom).';

create table ref.commodity_code (
  domain_code  text not null
               references ref.commodity_domain(code)
               on delete cascade,
  code         text not null,                       -- code in that scheme
  name         text not null,
  description  text,                                -- longer description for search/display
  parent_code  text,
  level_no     int,
  status       text not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'seed',
  updated_at   timestamptz,
  updated_by   text,

  primary key (domain_code, code),

  constraint commodity_code_status_chk check (status in ('active','deprecated')),
  constraint commodity_code_parent_fk
    foreign key (domain_code, parent_code)
    references ref.commodity_code(domain_code, code)
);

comment on table ref.commodity_code is 'Commodity classification codes per domain (UNSPSC/HS/custom).';

create index if not exists idx_commodity_code_parent
  on ref.commodity_code(domain_code, parent_code);
create index if not exists idx_commodity_code_level
  on ref.commodity_code(domain_code, level_no);

-- ============================================================================
-- REF: Industry Domains (ISIC, NAICS, and custom)
-- ============================================================================
create table ref.industry_domain (
  code         text primary key,                    -- "isic" | "naics" | "customIndustryGroup" | etc.
  name         text not null,
  standard     text,                                -- "ISIC", "NAICS", "CUSTOM"
  version      text,
  status       text not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'seed',
  updated_at   timestamptz,
  updated_by   text,

  constraint industry_domain_status_chk check (status in ('active','deprecated'))
);

comment on table ref.industry_domain is 'Industry code domains (ISIC, NAICS, custom).';

create table ref.industry_code (
  domain_code  text not null
               references ref.industry_domain(code)
               on delete cascade,
  code         text not null,
  name         text not null,
  description  text,                                -- longer description for search/display
  parent_code  text,
  level_no     int,
  status       text not null default 'active',
  metadata     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  created_by   text not null default 'seed',
  updated_at   timestamptz,
  updated_by   text,

  primary key (domain_code, code),

  constraint industry_code_status_chk check (status in ('active','deprecated')),
  constraint industry_code_parent_fk
    foreign key (domain_code, parent_code)
    references ref.industry_code(domain_code, code)
);

comment on table ref.industry_code is 'Industry classification codes per domain (ISIC/NAICS/custom).';

create index if not exists idx_industry_code_parent
  on ref.industry_code(domain_code, parent_code);
create index if not exists idx_industry_code_level
  on ref.industry_code(domain_code, level_no);

-- ============================================================================
-- REF: Label (i18n translations for reference data)
--
--   Translates the `name` (and optional `description`) of any ref entity
--   into any locale. The English canonical name stays on the source table;
--   this table holds non-English translations.
--
--   Entity names: 'country','state_region','currency','language','locale',
--                 'timezone','uom','commodity_domain','commodity_code',
--                 'industry_domain','industry_code'
--
--   For composite-PK entities (commodity_code, industry_code), encode
--   the code as "domain_code:code" (e.g., "isic:10").
-- ============================================================================
create table ref.label (
  entity      text    not null,                     -- ref table name
  code        text    not null,                     -- PK value in source table
  locale_code text    not null
              references ref.locale(code),
  name        text    not null,                     -- translated display name
  description text,                                 -- translated description (optional)

  created_at  timestamptz not null default now(),
  created_by  text not null default 'seed',
  updated_at  timestamptz,
  updated_by  text,

  primary key (entity, code, locale_code)
);

comment on table ref.label is 'i18n translations for ref entity names. English canonical stays on source table.';

create index if not exists idx_label_locale on ref.label(locale_code);
create index if not exists idx_label_entity_locale on ref.label(entity, locale_code);

-- ============================================================================
-- Helper: resolve a localized name with fallback
--
--   1. Try exact locale (e.g., 'ar-SA')
--   2. Try base language (e.g., 'ar')
--   3. Return NULL (caller falls back to source table's English name)
-- ============================================================================
create or replace function ref.localized_name(
  p_entity text,
  p_code   text,
  p_locale text
) returns text
language sql stable
as $$
  select coalesce(
    (select name from ref.label
     where entity = p_entity and code = p_code and locale_code = p_locale),
    (select name from ref.label
     where entity = p_entity and code = p_code and locale_code = split_part(p_locale, '-', 1))
  );
$$;
