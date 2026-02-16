/* ============================================================================
   Athyper — NOTIFY Schema
   In-App: Notifications
   Preferences: Scoped Notification Preferences
   Delivery: DLQ, Digest Staging
   Consent: WhatsApp Opt-in/Opt-out

   PostgreSQL 16+
   ============================================================================ */

-- ============================================================================
-- NOTIFY: Notification (in-app notifications)
-- ============================================================================
create table if not exists notify.notification (
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

comment on table notify.notification is 'User notifications (in-app, email, push, etc.).';

create index if not exists idx_notification_recipient_unread
  on notify.notification (recipient_id, is_read, created_at desc)
  where is_read = false;

create index if not exists idx_notification_recipient_time
  on notify.notification (tenant_id, recipient_id, created_at desc);

create index if not exists idx_notification_entity
  on notify.notification (tenant_id, entity_type, entity_id);

create index if not exists idx_notification_expires
  on notify.notification (expires_at) where expires_at is not null;

-- ============================================================================
-- NOTIFY: Scoped Notification Preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS "notify"."notification_preference" (
    "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"    UUID        NOT NULL,
    "scope"        TEXT        NOT NULL,       -- 'user' | 'org_unit' | 'tenant'
    "scope_id"     UUID        NOT NULL,       -- principal_id, ou_id, or tenant_id
    "event_code"   TEXT        NOT NULL,
    "channel"      TEXT        NOT NULL,
    "is_enabled"   BOOLEAN     NOT NULL DEFAULT true,
    "frequency"    TEXT        NOT NULL DEFAULT 'immediate',
    "quiet_hours"  JSONB,
    "metadata"     JSONB,
    "created_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "created_by"   TEXT        NOT NULL,
    "updated_at"   TIMESTAMPTZ(6),
    "updated_by"   TEXT,

    CONSTRAINT "notify_notification_preference_pkey"
        PRIMARY KEY ("id"),
    CONSTRAINT "notify_notification_preference_tenant_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "notify_notification_preference_scope_check"
        CHECK ("scope" IN ('user', 'org_unit', 'tenant')),
    CONSTRAINT "notify_notification_preference_frequency_check"
        CHECK ("frequency" IN ('immediate', 'hourly_digest', 'daily_digest', 'weekly_digest'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "notify_notification_preference_scope_uniq"
    ON "notify"."notification_preference"("tenant_id", "scope", "scope_id", "event_code", "channel");

CREATE INDEX IF NOT EXISTS "idx_notify_notification_preference_lookup"
    ON "notify"."notification_preference"("tenant_id", "scope_id", "event_code", "channel");

-- ============================================================================
-- NOTIFY: Dead Letter Queue
-- ============================================================================
CREATE TABLE IF NOT EXISTS "notify"."notification_dlq" (
    "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       UUID        NOT NULL,
    "delivery_id"     UUID        NOT NULL,
    "message_id"      UUID        NOT NULL,
    "channel"         TEXT        NOT NULL,
    "provider_code"   TEXT        NOT NULL,
    "recipient_id"    UUID,
    "recipient_addr"  TEXT        NOT NULL,
    "last_error"      TEXT,
    "error_category"  TEXT,
    "attempt_count"   INTEGER     NOT NULL DEFAULT 0,
    "payload"         JSONB       NOT NULL,       -- Full delivery payload for replay
    "metadata"        JSONB,
    "dead_at"         TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "replayed_at"     TIMESTAMPTZ(6),             -- NULL until replayed
    "replayed_by"     TEXT,
    "replay_count"    INTEGER     NOT NULL DEFAULT 0,
    "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "notification_dlq_pkey"
        PRIMARY KEY ("id"),
    CONSTRAINT "notification_dlq_tenant_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_notification_dlq_tenant"
    ON "notify"."notification_dlq"("tenant_id", "dead_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_notification_dlq_unreplayed"
    ON "notify"."notification_dlq"("tenant_id")
    WHERE "replayed_at" IS NULL;

-- ============================================================================
-- NOTIFY: Digest Staging
-- ============================================================================
CREATE TABLE IF NOT EXISTS "notify"."notification_digest_staging" (
    "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       UUID        NOT NULL,
    "principal_id"    UUID        NOT NULL,
    "channel"         TEXT        NOT NULL,
    "frequency"       TEXT        NOT NULL,       -- 'hourly_digest' | 'daily_digest' | 'weekly_digest'
    "message_id"      UUID        NOT NULL,
    "event_type"      TEXT        NOT NULL,
    "subject"         TEXT,
    "payload"         JSONB       NOT NULL,
    "template_key"    TEXT        NOT NULL,
    "priority"        TEXT        NOT NULL DEFAULT 'normal',
    "metadata"        JSONB,
    "staged_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "delivered_at"    TIMESTAMPTZ(6),             -- NULL until included in a digest

    CONSTRAINT "notification_digest_staging_pkey"
        PRIMARY KEY ("id"),
    CONSTRAINT "notification_digest_staging_tenant_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "notification_digest_staging_frequency_check"
        CHECK ("frequency" IN ('hourly_digest', 'daily_digest', 'weekly_digest'))
);

CREATE INDEX IF NOT EXISTS "idx_digest_staging_pending"
    ON "notify"."notification_digest_staging"("tenant_id", "principal_id", "channel", "frequency")
    WHERE "delivered_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_digest_staging_frequency"
    ON "notify"."notification_digest_staging"("frequency", "staged_at")
    WHERE "delivered_at" IS NULL;

-- ============================================================================
-- NOTIFY: WhatsApp Consent
-- ============================================================================
CREATE TABLE IF NOT EXISTS "notify"."whatsapp_consent" (
    "id"                          UUID        NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"                   UUID        NOT NULL,
    "phone_number"                TEXT        NOT NULL,
    "principal_id"                UUID,
    "opted_in"                    BOOLEAN     NOT NULL DEFAULT false,
    "opted_in_at"                 TIMESTAMPTZ(6),
    "opted_out_at"                TIMESTAMPTZ(6),
    "opt_in_method"               TEXT,       -- 'user_action' | 'admin' | 'webhook'
    "conversation_window_start"   TIMESTAMPTZ(6),
    "conversation_window_end"     TIMESTAMPTZ(6),
    "metadata"                    JSONB,
    "created_at"                  TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at"                  TIMESTAMPTZ(6),

    CONSTRAINT "whatsapp_consent_pkey"
        PRIMARY KEY ("id"),
    CONSTRAINT "whatsapp_consent_tenant_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS "whatsapp_consent_tenant_phone_uniq"
    ON "notify"."whatsapp_consent"("tenant_id", "phone_number");

CREATE INDEX IF NOT EXISTS "idx_whatsapp_consent_principal"
    ON "notify"."whatsapp_consent"("principal_id")
    WHERE "principal_id" IS NOT NULL;

-- ============================================================================
-- NOTIFY: Notification Message (fan-out root per event per rule)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "notify"."notification_message" (
    "id"               UUID        NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"        UUID        NOT NULL,
    "event_id"         TEXT        NOT NULL,
    "event_type"       TEXT        NOT NULL,
    "rule_id"          UUID,
    "template_key"     TEXT        NOT NULL,
    "template_version" INTEGER     NOT NULL,
    "subject"          TEXT,
    "payload"          JSONB       NOT NULL,
    "priority"         TEXT        NOT NULL DEFAULT 'normal',
    "status"           TEXT        NOT NULL DEFAULT 'pending',
    "recipient_count"  INTEGER     NOT NULL DEFAULT 0,
    "delivered_count"  INTEGER     NOT NULL DEFAULT 0,
    "failed_count"     INTEGER     NOT NULL DEFAULT 0,
    "entity_type"      TEXT,
    "entity_id"        UUID,
    "correlation_id"   TEXT,
    "metadata"         JSONB,
    "created_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "completed_at"     TIMESTAMPTZ(6),
    "expires_at"       TIMESTAMPTZ(6),

    CONSTRAINT "notification_message_pkey"
        PRIMARY KEY ("id"),
    CONSTRAINT "notification_message_tenant_id_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "notification_message_rule_id_fkey"
        FOREIGN KEY ("rule_id")
        REFERENCES "meta"."notification_rule"("id")
        ON UPDATE NO ACTION,
    CONSTRAINT "notification_message_status_check"
        CHECK ("status" IN ('pending', 'planning', 'delivering', 'completed', 'partial', 'failed')),
    CONSTRAINT "notification_message_priority_check"
        CHECK ("priority" IN ('low', 'normal', 'high', 'critical'))
);

COMMENT ON TABLE "notify"."notification_message"
    IS 'Logical notification messages (one per event per rule)';

CREATE INDEX IF NOT EXISTS "idx_notification_message_tenant"
    ON "notify"."notification_message"("tenant_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_notification_message_event"
    ON "notify"."notification_message"("event_id");

CREATE INDEX IF NOT EXISTS "idx_notification_message_status"
    ON "notify"."notification_message"("status")
    WHERE "status" NOT IN ('completed');

-- ============================================================================
-- NOTIFY: Notification Delivery (per-channel per-recipient delivery attempts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "notify"."notification_delivery" (
    "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
    "message_id"      UUID        NOT NULL,
    "tenant_id"       UUID        NOT NULL,
    "channel"         TEXT        NOT NULL,
    "provider_code"   TEXT        NOT NULL,
    "recipient_id"    UUID,
    "recipient_addr"  TEXT        NOT NULL,
    "status"          TEXT        NOT NULL DEFAULT 'pending',
    "attempt_count"   INTEGER     NOT NULL DEFAULT 0,
    "max_attempts"    INTEGER     NOT NULL DEFAULT 3,
    "last_error"      TEXT,
    "error_category"  TEXT,
    "external_id"     TEXT,
    "sent_at"         TIMESTAMPTZ(6),
    "delivered_at"    TIMESTAMPTZ(6),
    "opened_at"       TIMESTAMPTZ(6),
    "clicked_at"      TIMESTAMPTZ(6),
    "bounced_at"      TIMESTAMPTZ(6),
    "metadata"        JSONB,
    "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at"      TIMESTAMPTZ(6),

    CONSTRAINT "notification_delivery_pkey"
        PRIMARY KEY ("id"),
    CONSTRAINT "notification_delivery_message_id_fkey"
        FOREIGN KEY ("message_id")
        REFERENCES "notify"."notification_message"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "notification_delivery_tenant_id_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "notification_delivery_status_check"
        CHECK ("status" IN ('pending', 'queued', 'sent', 'delivered', 'bounced', 'failed', 'cancelled')),
    CONSTRAINT "notification_delivery_error_category_check"
        CHECK ("error_category" IS NULL OR "error_category" IN ('transient', 'permanent', 'rate_limit', 'auth'))
);

COMMENT ON TABLE "notify"."notification_delivery"
    IS 'Individual delivery attempts per channel per recipient';

CREATE INDEX IF NOT EXISTS "idx_notification_delivery_message"
    ON "notify"."notification_delivery"("message_id");

CREATE INDEX IF NOT EXISTS "idx_notification_delivery_status"
    ON "notify"."notification_delivery"("status")
    WHERE "status" IN ('pending', 'queued', 'sent');

CREATE INDEX IF NOT EXISTS "idx_notification_delivery_external"
    ON "notify"."notification_delivery"("external_id")
    WHERE "external_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_notification_delivery_tenant_time"
    ON "notify"."notification_delivery"("tenant_id", "created_at" DESC);

-- ============================================================================
-- NOTIFY: Notification Suppression (bounces, opt-outs, compliance blocks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "notify"."notification_suppression" (
    "id"             UUID        NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID        NOT NULL,
    "channel"        TEXT        NOT NULL,
    "address"        TEXT        NOT NULL,
    "reason"         TEXT        NOT NULL,
    "source"         TEXT,
    "provider_code"  TEXT,
    "metadata"       JSONB,
    "suppressed_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "expires_at"     TIMESTAMPTZ(6),
    "created_by"     TEXT        NOT NULL,

    CONSTRAINT "notification_suppression_pkey"
        PRIMARY KEY ("id"),
    CONSTRAINT "notification_suppression_tenant_id_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "notification_suppression_reason_check"
        CHECK ("reason" IN ('hard_bounce', 'complaint', 'opt_out', 'compliance_block', 'manual'))
);

COMMENT ON TABLE "notify"."notification_suppression"
    IS 'Suppression list for bounces, opt-outs, and compliance blocks';

CREATE UNIQUE INDEX IF NOT EXISTS "notification_suppression_tenant_channel_address_uniq"
    ON "notify"."notification_suppression"("tenant_id", "channel", "address");

CREATE INDEX IF NOT EXISTS "idx_notification_suppression_lookup"
    ON "notify"."notification_suppression"("channel", "address");
