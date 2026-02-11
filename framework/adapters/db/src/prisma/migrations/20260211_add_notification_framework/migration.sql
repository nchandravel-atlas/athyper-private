-- Notification Framework Tables
-- Phase: MVP (Slice 1)

-- ═══════════════════════════════════════════════════════════════════════
-- meta.notification_channel — Reference data for available channels
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE "meta"."notification_channel" (
    "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
    "code"        TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "is_enabled"  BOOLEAN NOT NULL DEFAULT true,
    "config"      JSONB,
    "sort_order"  INTEGER NOT NULL DEFAULT 0,
    "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "created_by"  TEXT NOT NULL,

    CONSTRAINT "notification_channel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_channel_code_key"
    ON "meta"."notification_channel"("code");

COMMENT ON TABLE "meta"."notification_channel"
    IS 'Reference: available notification channels (EMAIL, TEAMS, WHATSAPP, IN_APP, etc.)';

-- Seed default channels
INSERT INTO "meta"."notification_channel" ("id", "code", "name", "sort_order", "created_by") VALUES
    (gen_random_uuid(), 'EMAIL',    'Email',          1, 'system'),
    (gen_random_uuid(), 'TEAMS',    'Microsoft Teams', 2, 'system'),
    (gen_random_uuid(), 'WHATSAPP', 'WhatsApp',       3, 'system'),
    (gen_random_uuid(), 'IN_APP',   'In-App',         0, 'system'),
    (gen_random_uuid(), 'SMS',      'SMS',            4, 'system'),
    (gen_random_uuid(), 'WEBHOOK',  'Webhook',        5, 'system');


-- ═══════════════════════════════════════════════════════════════════════
-- meta.notification_provider — Provider instances per channel
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE "meta"."notification_provider" (
    "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
    "channel_id"  UUID NOT NULL,
    "code"        TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "adapter_key" TEXT NOT NULL,
    "priority"    INTEGER NOT NULL DEFAULT 1,
    "is_enabled"  BOOLEAN NOT NULL DEFAULT true,
    "config"      JSONB NOT NULL DEFAULT '{}',
    "rate_limit"  JSONB,
    "health"      TEXT NOT NULL DEFAULT 'healthy',
    "created_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "created_by"  TEXT NOT NULL,
    "updated_at"  TIMESTAMPTZ(6),
    "updated_by"  TEXT,

    CONSTRAINT "notification_provider_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_provider_channel_id_fkey"
        FOREIGN KEY ("channel_id")
        REFERENCES "meta"."notification_channel"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "notification_provider_code_key"
    ON "meta"."notification_provider"("code");

CREATE INDEX "idx_notification_provider_channel"
    ON "meta"."notification_provider"("channel_id", "priority");

COMMENT ON TABLE "meta"."notification_provider"
    IS 'Provider instances for each channel (SendGrid, SES, Graph API, etc.)';

-- Provider health status constraint
ALTER TABLE "meta"."notification_provider"
    ADD CONSTRAINT "notification_provider_health_check"
    CHECK ("health" IN ('healthy', 'degraded', 'down'));


-- ═══════════════════════════════════════════════════════════════════════
-- meta.notification_template — Versioned, localized templates
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE "meta"."notification_template" (
    "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"        UUID,
    "template_key"     TEXT NOT NULL,
    "channel"          TEXT NOT NULL,
    "locale"           TEXT NOT NULL DEFAULT 'en',
    "version"          INTEGER NOT NULL DEFAULT 1,
    "status"           TEXT NOT NULL DEFAULT 'draft',
    "subject"          TEXT,
    "body_text"        TEXT,
    "body_html"        TEXT,
    "body_json"        JSONB,
    "variables_schema" JSONB,
    "metadata"         JSONB,
    "created_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "created_by"       TEXT NOT NULL,
    "updated_at"       TIMESTAMPTZ(6),
    "updated_by"       TEXT,

    CONSTRAINT "notification_template_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_template_tenant_id_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "notification_template_key_channel_locale_version_uniq"
    ON "meta"."notification_template"("tenant_id", "template_key", "channel", "locale", "version");

CREATE INDEX "idx_notification_template_lookup"
    ON "meta"."notification_template"("template_key", "channel", "locale", "status");

ALTER TABLE "meta"."notification_template"
    ADD CONSTRAINT "notification_template_status_check"
    CHECK ("status" IN ('draft', 'active', 'retired'));

COMMENT ON TABLE "meta"."notification_template"
    IS 'Versioned, localized notification templates per channel';


-- ═══════════════════════════════════════════════════════════════════════
-- meta.notification_rule — Event-to-recipient routing rules
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE "meta"."notification_rule" (
    "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       UUID,
    "code"            TEXT NOT NULL,
    "name"            TEXT NOT NULL,
    "description"     TEXT,
    "event_type"      TEXT NOT NULL,
    "entity_type"     TEXT,
    "lifecycle_state" TEXT,
    "condition_expr"  JSONB,
    "template_key"    TEXT NOT NULL,
    "channels"        TEXT[] NOT NULL,
    "priority"        TEXT NOT NULL DEFAULT 'normal',
    "recipient_rules" JSONB NOT NULL,
    "sla_minutes"     INTEGER,
    "dedup_window_ms" INTEGER DEFAULT 300000,
    "is_enabled"      BOOLEAN NOT NULL DEFAULT true,
    "sort_order"      INTEGER NOT NULL DEFAULT 0,
    "created_at"      TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "created_by"      TEXT NOT NULL,
    "updated_at"      TIMESTAMPTZ(6),
    "updated_by"      TEXT,

    CONSTRAINT "notification_rule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_rule_tenant_id_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "notification_rule_tenant_code_uniq"
    ON "meta"."notification_rule"("tenant_id", "code");

CREATE INDEX "idx_notification_rule_event"
    ON "meta"."notification_rule"("event_type", "is_enabled");

ALTER TABLE "meta"."notification_rule"
    ADD CONSTRAINT "notification_rule_priority_check"
    CHECK ("priority" IN ('low', 'normal', 'high', 'critical'));

COMMENT ON TABLE "meta"."notification_rule"
    IS 'Rules mapping domain events to notification plans';


-- ═══════════════════════════════════════════════════════════════════════
-- core.notification_message — One logical notification (fan-out root)
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE "core"."notification_message" (
    "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"        UUID NOT NULL,
    "event_id"         TEXT NOT NULL,
    "event_type"       TEXT NOT NULL,
    "rule_id"          UUID,
    "template_key"     TEXT NOT NULL,
    "template_version" INTEGER NOT NULL,
    "subject"          TEXT,
    "payload"          JSONB NOT NULL,
    "priority"         TEXT NOT NULL DEFAULT 'normal',
    "status"           TEXT NOT NULL DEFAULT 'pending',
    "recipient_count"  INTEGER NOT NULL DEFAULT 0,
    "delivered_count"  INTEGER NOT NULL DEFAULT 0,
    "failed_count"     INTEGER NOT NULL DEFAULT 0,
    "entity_type"      TEXT,
    "entity_id"        UUID,
    "correlation_id"   TEXT,
    "metadata"         JSONB,
    "created_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "completed_at"     TIMESTAMPTZ(6),
    "expires_at"       TIMESTAMPTZ(6),

    CONSTRAINT "notification_message_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_message_tenant_id_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "notification_message_rule_id_fkey"
        FOREIGN KEY ("rule_id")
        REFERENCES "meta"."notification_rule"("id")
        ON UPDATE NO ACTION
);

CREATE INDEX "idx_notification_message_tenant"
    ON "core"."notification_message"("tenant_id", "created_at" DESC);

CREATE INDEX "idx_notification_message_event"
    ON "core"."notification_message"("event_id");

CREATE INDEX "idx_notification_message_status"
    ON "core"."notification_message"("status")
    WHERE "status" NOT IN ('completed');

ALTER TABLE "core"."notification_message"
    ADD CONSTRAINT "notification_message_status_check"
    CHECK ("status" IN ('pending', 'planning', 'delivering', 'completed', 'partial', 'failed'));

ALTER TABLE "core"."notification_message"
    ADD CONSTRAINT "notification_message_priority_check"
    CHECK ("priority" IN ('low', 'normal', 'high', 'critical'));

COMMENT ON TABLE "core"."notification_message"
    IS 'Logical notification messages (one per event per rule)';


-- ═══════════════════════════════════════════════════════════════════════
-- core.notification_delivery — One delivery attempt per channel per recipient
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE "core"."notification_delivery" (
    "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
    "message_id"      UUID NOT NULL,
    "tenant_id"       UUID NOT NULL,
    "channel"         TEXT NOT NULL,
    "provider_code"   TEXT NOT NULL,
    "recipient_id"    UUID,
    "recipient_addr"  TEXT NOT NULL,
    "status"          TEXT NOT NULL DEFAULT 'pending',
    "attempt_count"   INTEGER NOT NULL DEFAULT 0,
    "max_attempts"    INTEGER NOT NULL DEFAULT 3,
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

    CONSTRAINT "notification_delivery_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_delivery_message_id_fkey"
        FOREIGN KEY ("message_id")
        REFERENCES "core"."notification_message"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "notification_delivery_tenant_id_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "idx_notification_delivery_message"
    ON "core"."notification_delivery"("message_id");

CREATE INDEX "idx_notification_delivery_status"
    ON "core"."notification_delivery"("status")
    WHERE "status" IN ('pending', 'queued', 'sent');

CREATE INDEX "idx_notification_delivery_external"
    ON "core"."notification_delivery"("external_id")
    WHERE "external_id" IS NOT NULL;

CREATE INDEX "idx_notification_delivery_tenant_time"
    ON "core"."notification_delivery"("tenant_id", "created_at" DESC);

ALTER TABLE "core"."notification_delivery"
    ADD CONSTRAINT "notification_delivery_status_check"
    CHECK ("status" IN ('pending', 'queued', 'sent', 'delivered', 'bounced', 'failed', 'cancelled'));

ALTER TABLE "core"."notification_delivery"
    ADD CONSTRAINT "notification_delivery_error_category_check"
    CHECK ("error_category" IS NULL OR "error_category" IN ('transient', 'permanent', 'rate_limit', 'auth'));

COMMENT ON TABLE "core"."notification_delivery"
    IS 'Individual delivery attempts per channel per recipient';


-- ═══════════════════════════════════════════════════════════════════════
-- core.notification_suppression — Bounces, opt-outs, compliance blocks
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE "core"."notification_suppression" (
    "id"             UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      UUID NOT NULL,
    "channel"        TEXT NOT NULL,
    "address"        TEXT NOT NULL,
    "reason"         TEXT NOT NULL,
    "source"         TEXT,
    "provider_code"  TEXT,
    "metadata"       JSONB,
    "suppressed_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "expires_at"     TIMESTAMPTZ(6),
    "created_by"     TEXT NOT NULL,

    CONSTRAINT "notification_suppression_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_suppression_tenant_id_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "notification_suppression_tenant_channel_address_uniq"
    ON "core"."notification_suppression"("tenant_id", "channel", "address");

CREATE INDEX "idx_notification_suppression_lookup"
    ON "core"."notification_suppression"("channel", "address");

ALTER TABLE "core"."notification_suppression"
    ADD CONSTRAINT "notification_suppression_reason_check"
    CHECK ("reason" IN ('hard_bounce', 'complaint', 'opt_out', 'compliance_block', 'manual'));

COMMENT ON TABLE "core"."notification_suppression"
    IS 'Suppression list for bounces, opt-outs, and compliance blocks';
