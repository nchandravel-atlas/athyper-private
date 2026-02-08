/* ============================================================================
   Athyper — UI: User Interface & Notification Runtime
   Notifications, User Preferences, Saved Views, Dashboard Widgets

   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- UI: Notification (in-app notifications)
-- ============================================================================
create table if not exists ui.notification (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  recipient_id   uuid not null references core.principal(id) on delete cascade,
  sender_id      uuid references core.principal(id) on delete set null,

  channel        text not null default 'in_app',
  category       text,
  priority       text not null default 'normal',

  title          text not null,
  body           text,
  icon           text,
  action_url     text,

  entity_type    text,
  entity_id      uuid,

  is_read        boolean not null default false,
  read_at        timestamptz,
  is_dismissed   boolean not null default false,
  dismissed_at   timestamptz,

  expires_at     timestamptz,

  metadata       jsonb,

  created_at     timestamptz not null default now(),
  created_by     text not null,

  constraint notification_channel_chk check (channel in ('in_app','email','sms','push','webhook')),
  constraint notification_priority_chk check (priority in ('low','normal','high','urgent'))
);

comment on table ui.notification is 'User notifications (in-app, email, push, etc.).';

create index if not exists idx_notification_recipient_unread
  on ui.notification (recipient_id, is_read, created_at desc)
  where is_read = false;

create index if not exists idx_notification_recipient_time
  on ui.notification (tenant_id, recipient_id, created_at desc);

create index if not exists idx_notification_entity
  on ui.notification (tenant_id, entity_type, entity_id);

create index if not exists idx_notification_expires
  on ui.notification (expires_at) where expires_at is not null;

-- ============================================================================
-- UI: Notification Preference (per-principal notification settings)
-- ============================================================================
create table if not exists ui.notification_preference (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  principal_id   uuid not null references core.principal(id) on delete cascade,

  event_code     text not null,
  channel        text not null,
  is_enabled     boolean not null default true,

  frequency      text not null default 'immediate',
  quiet_hours    jsonb,

  metadata       jsonb,

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text,

  constraint notification_preference_principal_event_channel_uniq
    unique (principal_id, event_code, channel),
  constraint notification_preference_channel_chk
    check (channel in ('in_app','email','sms','push','webhook')),
  constraint notification_preference_frequency_chk
    check (frequency in ('immediate','hourly','daily','weekly','never'))
);

comment on table ui.notification_preference is 'Per-principal notification channel preferences.';

create index if not exists idx_notification_preference_principal
  on ui.notification_preference (principal_id);

create index if not exists idx_notification_preference_event
  on ui.notification_preference (event_code, channel);

-- ============================================================================
-- UI: User Preference (generic key-value preferences)
-- ============================================================================
create table if not exists ui.user_preference (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  principal_id   uuid not null references core.principal(id) on delete cascade,

  preference_key text not null,
  preference_value jsonb not null,

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text,

  constraint user_preference_principal_key_uniq unique (principal_id, preference_key)
);

comment on table ui.user_preference is 'Generic user preference storage (theme, layout, etc.).';

create index if not exists idx_user_preference_principal
  on ui.user_preference (principal_id);

-- ============================================================================
-- UI: Saved View (saved list/grid filters and sorts)
-- ============================================================================
create table if not exists ui.saved_view (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  principal_id   uuid not null references core.principal(id) on delete cascade,

  entity_type    text not null,
  view_name      text not null,
  description    text,

  is_default     boolean not null default false,
  is_shared      boolean not null default false,

  filters        jsonb,
  sort_order     jsonb,
  columns        jsonb,
  group_by       jsonb,

  metadata       jsonb,

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text
);

comment on table ui.saved_view is 'Saved list/grid view configurations (filters, sorts, columns).';

create index if not exists idx_saved_view_principal_entity
  on ui.saved_view (principal_id, entity_type);

create index if not exists idx_saved_view_shared
  on ui.saved_view (tenant_id, entity_type) where is_shared = true;

-- ============================================================================
-- UI: Dashboard Widget (per-user dashboard layout)
-- ============================================================================
create table if not exists ui.dashboard_widget (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  principal_id   uuid not null references core.principal(id) on delete cascade,

  widget_type    text not null,
  widget_name    text,
  description    text,

  position       jsonb not null default '{"x": 0, "y": 0, "w": 4, "h": 3}',

  config         jsonb,
  data_source    jsonb,

  is_visible     boolean not null default true,

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text
);

comment on table ui.dashboard_widget is 'Per-user dashboard widget configurations.';

create index if not exists idx_dashboard_widget_principal
  on ui.dashboard_widget (principal_id);

create index if not exists idx_dashboard_widget_type
  on ui.dashboard_widget (widget_type);

-- ============================================================================
-- UI: Recent Activity (quick access to recently viewed entities)
-- ============================================================================
create table if not exists ui.recent_activity (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  principal_id   uuid not null references core.principal(id) on delete cascade,

  entity_type    text not null,
  entity_id      uuid not null,
  entity_name    text,

  action         text not null default 'view',
  accessed_at    timestamptz not null default now(),

  metadata       jsonb,

  created_at     timestamptz not null default now()
);

comment on table ui.recent_activity is 'Recently accessed entities per user.';

create index if not exists idx_recent_activity_principal_time
  on ui.recent_activity (principal_id, accessed_at desc);

create index if not exists idx_recent_activity_entity
  on ui.recent_activity (tenant_id, entity_type, entity_id);

-- ============================================================================
-- UI: Search History (user search tracking)
-- ============================================================================
create table if not exists ui.search_history (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,
  principal_id   uuid not null references core.principal(id) on delete cascade,

  query_text     text not null,
  entity_type    text,
  result_count   int,

  searched_at    timestamptz not null default now(),

  created_at     timestamptz not null default now()
);

comment on table ui.search_history is 'User search history for autocomplete and analytics.';

create index if not exists idx_search_history_principal_time
  on ui.search_history (principal_id, searched_at desc);
