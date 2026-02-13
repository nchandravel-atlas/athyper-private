/* ============================================================================
   Athyper — CORE: Collaboration Module
   Entity Comments, Mentions, Attachment Links

   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- CORE: Entity Comment (record-level commentary)
-- ============================================================================
create table if not exists core.entity_comment (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  -- Polymorphic entity link
  entity_type       text not null,
  entity_id         uuid not null,

  -- Comment metadata
  commenter_id      uuid not null references core.principal(id) on delete set null,
  comment_text      text not null,

  -- Threading support (Phase 6)
  parent_comment_id uuid references core.entity_comment(id) on delete cascade,
  thread_depth      int not null default 0,

  -- Soft delete
  deleted_at        timestamptz,
  deleted_by        text,

  created_at        timestamptz not null default now(),
  created_by        text not null,
  updated_at        timestamptz,
  updated_by        text,

  constraint entity_comment_text_len_chk check (char_length(comment_text) <= 5000),
  constraint entity_comment_depth_chk check (thread_depth between 0 and 5)
);

comment on table core.entity_comment is 'Record-level comments with optional threading (max depth 5).';

create index if not exists idx_entity_comment_entity
  on core.entity_comment (tenant_id, entity_type, entity_id, created_at desc)
  where deleted_at is null;

create index if not exists idx_entity_comment_commenter
  on core.entity_comment (commenter_id, created_at desc)
  where deleted_at is null;

create index if not exists idx_entity_comment_parent
  on core.entity_comment (parent_comment_id, created_at asc)
  where parent_comment_id is not null and deleted_at is null;

-- ============================================================================
-- CORE: Comment Mention (@mentions parser results)
-- ============================================================================
create table if not exists core.comment_mention (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  -- Comment reference (polymorphic: entity_comment OR approval_comment)
  comment_type      text not null,
  comment_id        uuid not null,

  mentioned_user_id uuid not null references core.principal(id) on delete cascade,
  mention_text      text not null,
  position          int not null,

  created_at        timestamptz not null default now(),

  constraint comment_mention_type_chk check (comment_type in ('entity_comment','approval_comment'))
);

comment on table core.comment_mention is 'Parsed @mention references for notifications + search.';

create index if not exists idx_comment_mention_comment
  on core.comment_mention (comment_type, comment_id);

create index if not exists idx_comment_mention_user
  on core.comment_mention (mentioned_user_id, created_at desc);

-- ============================================================================
-- ALTER: Extend core.attachment with comment link
-- ============================================================================
alter table core.attachment
  add column if not exists comment_type text,
  add column if not exists comment_id uuid;

-- Add constraint if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'attachment_comment_type_chk'
  ) then
    alter table core.attachment
      add constraint attachment_comment_type_chk check
        (comment_type is null or comment_type in ('entity_comment','approval_comment'));
  end if;
end $$;

comment on column core.attachment.comment_type is 'Optional: type of comment this attachment belongs to.';
comment on column core.attachment.comment_id is 'Optional: ID of comment this attachment belongs to.';

create index if not exists idx_attachment_comment
  on core.attachment (comment_type, comment_id)
  where comment_type is not null and comment_id is not null;

-- ============================================================================
-- CORE: Comment Reaction (emoji reactions)
-- ============================================================================
create table if not exists core.comment_reaction (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references core.tenant(id) on delete cascade,

  -- Comment reference (polymorphic)
  comment_type  text not null,
  comment_id    uuid not null,

  user_id       uuid not null references core.principal(id) on delete cascade,
  reaction_type text not null,

  created_at    timestamptz not null default now(),

  constraint comment_reaction_type_chk check (comment_type in ('entity_comment','approval_comment')),
  constraint comment_reaction_emoji_chk check (reaction_type in ('👍','❤️','🎉','👀','👎','🚀','💡','🤔')),
  constraint comment_reaction_uniq unique (tenant_id, comment_type, comment_id, user_id, reaction_type)
);

comment on table core.comment_reaction is 'Emoji reactions on comments (unique per user per comment per reaction type).';

create index if not exists idx_comment_reaction_comment
  on core.comment_reaction (tenant_id, comment_type, comment_id);

create index if not exists idx_comment_reaction_user
  on core.comment_reaction (tenant_id, user_id, created_at desc);

-- ============================================================================
-- CORE: Comment Read Status (read tracking)
-- ============================================================================
create table if not exists core.comment_read_status (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references core.tenant(id) on delete cascade,

  -- Comment reference (polymorphic)
  comment_type text not null,
  comment_id   uuid not null,

  user_id      uuid not null references core.principal(id) on delete cascade,
  read_at      timestamptz not null default now(),

  constraint comment_read_status_type_chk check (comment_type in ('entity_comment','approval_comment')),
  constraint comment_read_status_uniq unique (tenant_id, comment_type, comment_id, user_id)
);

comment on table core.comment_read_status is 'Tracks which comments have been read by which users (for unread badges).';

create index if not exists idx_comment_read_status_user
  on core.comment_read_status (tenant_id, user_id, comment_type);

create index if not exists idx_comment_read_status_comment
  on core.comment_read_status (tenant_id, comment_type, comment_id);

-- ============================================================================
-- CORE: Comment Flag (moderation flags)
-- ============================================================================
create table if not exists core.comment_flag (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  -- Comment reference (polymorphic)
  comment_type      text not null,
  comment_id        uuid not null,

  flagger_user_id   uuid not null references core.principal(id) on delete cascade,
  flag_reason       text not null,
  flag_details      text,

  status            text not null default 'pending',
  reviewed_by       uuid references core.principal(id) on delete set null,
  reviewed_at       timestamptz,
  resolution        text,

  created_at        timestamptz not null default now(),

  constraint comment_flag_type_chk check (comment_type in ('entity_comment','approval_comment')),
  constraint comment_flag_reason_chk check (flag_reason in ('spam','offensive','harassment','misinformation','other')),
  constraint comment_flag_status_chk check (status in ('pending','reviewed','dismissed','actioned')),
  constraint comment_flag_uniq unique (tenant_id, comment_type, comment_id, flagger_user_id)
);

comment on table core.comment_flag is 'User-submitted moderation flags on comments (one flag per user per comment).';

create index if not exists idx_comment_flag_pending
  on core.comment_flag (tenant_id, status, created_at desc)
  where status = 'pending';

create index if not exists idx_comment_flag_comment
  on core.comment_flag (tenant_id, comment_type, comment_id, status);

-- ============================================================================
-- CORE: Comment Moderation Status (aggregate moderation state)
-- ============================================================================
create table if not exists core.comment_moderation_status (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,

  -- Comment reference (polymorphic)
  comment_type     text not null,
  comment_id       uuid not null,

  is_hidden        boolean not null default false,
  hidden_reason    text,
  hidden_at        timestamptz,
  hidden_by        uuid references core.principal(id) on delete set null,

  flag_count       int not null default 0,
  last_flagged_at  timestamptz,

  updated_at       timestamptz not null default now(),

  constraint comment_moderation_status_type_chk check (comment_type in ('entity_comment','approval_comment')),
  constraint comment_moderation_status_uniq unique (tenant_id, comment_type, comment_id)
);

comment on table core.comment_moderation_status is 'Aggregate moderation state per comment (denormalized for performance).';

create index if not exists idx_comment_moderation_hidden
  on core.comment_moderation_status (tenant_id, is_hidden, updated_at desc)
  where is_hidden = true;

create index if not exists idx_comment_moderation_flags
  on core.comment_moderation_status (tenant_id, flag_count desc, last_flagged_at desc)
  where flag_count > 0;

-- ============================================================================
-- CORE: Comment Draft (auto-save drafts)
-- ============================================================================
create table if not exists core.comment_draft (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references core.tenant(id) on delete cascade,

  user_id           uuid not null references core.principal(id) on delete cascade,
  entity_type       text not null,
  entity_id         uuid not null,
  parent_comment_id uuid,

  draft_text        text not null,
  visibility        text default 'public',

  updated_at        timestamptz not null default now(),

  constraint comment_draft_visibility_chk check (visibility in ('public','internal','private')),
  constraint comment_draft_uniq unique (tenant_id, user_id, entity_type, entity_id, parent_comment_id)
);

comment on table core.comment_draft is 'Auto-saved comment drafts (one draft per user per entity per parent comment).';

create index if not exists idx_comment_draft_user
  on core.comment_draft (tenant_id, user_id, updated_at desc);

create index if not exists idx_comment_draft_entity
  on core.comment_draft (tenant_id, entity_type, entity_id);

-- ============================================================================
-- CORE: Comment SLA Config (SLA policies per entity type)
-- ============================================================================
create table if not exists core.comment_sla_config (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references core.tenant(id) on delete cascade,

  entity_type          text not null,
  sla_target_seconds   int not null,
  business_hours_only  boolean not null default false,
  enabled              boolean not null default true,

  created_at           timestamptz not null default now(),
  created_by           text not null,

  constraint comment_sla_config_target_chk check (sla_target_seconds > 0),
  constraint comment_sla_config_uniq unique (tenant_id, entity_type)
);

comment on table core.comment_sla_config is 'SLA response time targets per entity type.';

create index if not exists idx_comment_sla_config_active
  on core.comment_sla_config (tenant_id, enabled)
  where enabled = true;

-- ============================================================================
-- CORE: Comment SLA Tracking (SLA compliance per entity)
-- ============================================================================
create table if not exists core.comment_sla_tracking (
  id                         uuid primary key default gen_random_uuid(),
  tenant_id                  uuid not null references core.tenant(id) on delete cascade,

  entity_type                text not null,
  entity_id                  uuid not null,

  first_comment_at           timestamptz not null,
  first_comment_by           uuid references core.principal(id) on delete set null,

  first_response_at          timestamptz,
  first_response_by          uuid references core.principal(id) on delete set null,
  first_response_time_seconds int,

  sla_target_seconds         int,
  is_sla_met                 boolean,

  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz,

  constraint comment_sla_tracking_uniq unique (tenant_id, entity_type, entity_id)
);

comment on table core.comment_sla_tracking is 'SLA violation tracking per entity (first comment and first response times).';

create index if not exists idx_comment_sla_tracking_breached
  on core.comment_sla_tracking (tenant_id, is_sla_met, first_comment_at desc)
  where is_sla_met = false;

create index if not exists idx_comment_sla_tracking_pending
  on core.comment_sla_tracking (tenant_id, first_comment_at desc)
  where first_response_at is null;

-- ============================================================================
-- CORE: Comment Analytics Daily (pre-aggregated metrics)
-- ============================================================================
create table if not exists core.comment_analytics_daily (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references core.tenant(id) on delete cascade,

  date                date not null,
  entity_type         text,

  total_comments      int not null default 0,
  total_replies       int not null default 0,
  unique_commenters   int not null default 0,
  total_reactions     int not null default 0,
  total_flags         int not null default 0,
  avg_comment_length  numeric(10,2),
  avg_thread_depth    numeric(5,2),

  created_at          timestamptz not null default now(),

  constraint comment_analytics_daily_uniq unique (tenant_id, date, entity_type)
);

comment on table core.comment_analytics_daily is 'Daily pre-aggregated comment metrics for dashboards.';

create index if not exists idx_comment_analytics_daily_date
  on core.comment_analytics_daily (tenant_id, date desc);

-- ============================================================================
-- CORE: Comment Retention Policy (retention policies)
-- ============================================================================
create table if not exists core.comment_retention_policy (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references core.tenant(id) on delete cascade,

  policy_name    text not null,
  entity_type    text,
  retention_days int not null,
  action         text not null,
  enabled        boolean not null default true,

  created_at     timestamptz not null default now(),
  created_by     text not null,
  updated_at     timestamptz,
  updated_by     text,

  constraint comment_retention_policy_days_chk check (retention_days > 0),
  constraint comment_retention_policy_action_chk check (action in ('archive','hard_delete','keep')),
  constraint comment_retention_policy_uniq unique (tenant_id, entity_type)
);

comment on table core.comment_retention_policy is 'Configurable retention policies for comments (GDPR compliance).';

create index if not exists idx_comment_retention_policy_active
  on core.comment_retention_policy (tenant_id, enabled)
  where enabled = true;

-- ============================================================================
-- CORE: Comment Retention Log (retention audit trail)
-- ============================================================================
create table if not exists core.comment_retention_log (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references core.tenant(id) on delete cascade,

  comment_type     text not null,
  comment_id       uuid not null,

  action           text not null,
  policy_id        uuid references core.comment_retention_policy(id) on delete set null,
  executed_by      text,
  executed_at      timestamptz not null default now(),
  comment_snapshot jsonb,

  constraint comment_retention_log_type_chk check (comment_type in ('entity_comment','approval_comment')),
  constraint comment_retention_log_action_chk check (action in ('archived','hard_deleted','restored'))
);

comment on table core.comment_retention_log is 'Audit trail for retention policy execution (compliance).';

create index if not exists idx_comment_retention_log_comment
  on core.comment_retention_log (tenant_id, comment_type, comment_id, executed_at desc);

create index if not exists idx_comment_retention_log_policy
  on core.comment_retention_log (tenant_id, policy_id, executed_at desc)
  where policy_id is not null;
