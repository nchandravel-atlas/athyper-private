/* ============================================================================
   Athyper — META: Overlay System + Compiled Overlay Snapshots
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- META: Overlay Container
-- ----------------------------------------------------------------------------
create table if not exists meta.overlay (
  id           uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  overlay_key  text not null,
  description  text,

  base_entity_id  uuid not null references meta.entity(id) on delete cascade,
  base_version_id uuid references meta.entity_version(id) on delete set null,

  priority      int not null default 100,
  conflict_mode text not null default 'fail',
  is_active     boolean not null default true,

  created_at    timestamptz not null default now(),
  created_by    text not null,
  updated_at    timestamptz,
  updated_by    text,

  constraint overlay_conflict_mode_chk check (conflict_mode in ('fail','overwrite','merge')),
  constraint overlay_key_uniq unique (tenant_id, overlay_key)
);

comment on table meta.overlay is
'Schema overlay definitions for extending base entity schemas with deterministic merge.';

create index if not exists idx_overlay_base_entity
  on meta.overlay (tenant_id, base_entity_id);

create index if not exists idx_overlay_priority
  on meta.overlay (base_entity_id, priority);

create index if not exists idx_overlay_active
  on meta.overlay (is_active) where is_active = true;

-- ----------------------------------------------------------------------------
-- META: Overlay Change Deltas
-- ----------------------------------------------------------------------------
create table if not exists meta.overlay_change (
  id            uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  overlay_id    uuid not null references meta.overlay(id) on delete cascade,

  change_order  int not null,
  kind          text not null,
  path          text not null,
  value         jsonb,

  created_at    timestamptz not null default now(),
  created_by    text not null,

  constraint overlay_change_kind_chk check (kind in (
    'addField','removeField','modifyField',
    'tweakPolicy','overrideValidation','overrideUi'
  )),
  constraint overlay_change_order_uniq unique (overlay_id, change_order)
);

comment on table meta.overlay_change is
'Individual change deltas within an overlay, applied in change_order sequence.';

create index if not exists idx_overlay_change_overlay
  on meta.overlay_change (overlay_id);

-- ----------------------------------------------------------------------------
-- META: Compiled Overlay Snapshot
-- ----------------------------------------------------------------------------
create table if not exists meta.entity_compiled_overlay (
  id               uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  entity_version_id uuid not null references meta.entity_version(id) on delete cascade,
  overlay_set       jsonb not null,

  compiled_json     jsonb not null,
  compiled_hash     text not null,
  generated_at      timestamptz not null default now(),

  created_at        timestamptz not null default now(),
  created_by        text not null
);

comment on table meta.entity_compiled_overlay is
'Resolved compiled snapshot after overlays applied for deterministic runtime execution.';

create index if not exists idx_entity_compiled_overlay_lookup
  on meta.entity_compiled_overlay (tenant_id, entity_version_id, compiled_hash);
