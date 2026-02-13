-- ============================================================================
-- 130_notification_phase2.sql — Phase 2 Notification Advanced Capabilities
-- ============================================================================
-- Tables:
--   core.notification_preference  (scoped preferences: user/org_unit/tenant)
--   core.notification_dlq         (dead-letter queue for failed deliveries)
--   core.notification_digest_staging (staging for digest aggregation)
--   core.whatsapp_consent         (WhatsApp opt-in/opt-out tracking)
-- ============================================================================

-- ─── 1. Scoped Notification Preferences ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS "core"."notification_preference" (
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

    CONSTRAINT "core_notification_preference_pkey"
        PRIMARY KEY ("id"),
    CONSTRAINT "core_notification_preference_tenant_fkey"
        FOREIGN KEY ("tenant_id")
        REFERENCES "core"."tenant"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "core_notification_preference_scope_check"
        CHECK ("scope" IN ('user', 'org_unit', 'tenant')),
    CONSTRAINT "core_notification_preference_frequency_check"
        CHECK ("frequency" IN ('immediate', 'hourly_digest', 'daily_digest', 'weekly_digest'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "core_notification_preference_scope_uniq"
    ON "core"."notification_preference"("tenant_id", "scope", "scope_id", "event_code", "channel");

CREATE INDEX IF NOT EXISTS "idx_core_notification_preference_lookup"
    ON "core"."notification_preference"("tenant_id", "scope_id", "event_code", "channel");

-- Migrate existing user-scope preferences from ui.notification_preference
INSERT INTO "core"."notification_preference" (
    "tenant_id", "scope", "scope_id", "event_code", "channel",
    "is_enabled", "frequency", "quiet_hours", "metadata",
    "created_at", "created_by", "updated_at", "updated_by"
)
SELECT
    p."tenant_id", 'user', p."principal_id", p."event_code", p."channel",
    p."is_enabled", p."frequency", p."quiet_hours", p."metadata",
    p."created_at", p."created_by", p."updated_at", p."updated_by"
FROM "ui"."notification_preference" p
WHERE EXISTS (SELECT 1 FROM "core"."tenant" t WHERE t."id" = p."tenant_id")
ON CONFLICT DO NOTHING;

-- ─── 2. Dead Letter Queue ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "core"."notification_dlq" (
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
    ON "core"."notification_dlq"("tenant_id", "dead_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_notification_dlq_unreplayed"
    ON "core"."notification_dlq"("tenant_id")
    WHERE "replayed_at" IS NULL;

-- ─── 3. Digest Staging ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "core"."notification_digest_staging" (
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
    ON "core"."notification_digest_staging"("tenant_id", "principal_id", "channel", "frequency")
    WHERE "delivered_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_digest_staging_frequency"
    ON "core"."notification_digest_staging"("frequency", "staged_at")
    WHERE "delivered_at" IS NULL;

-- ─── 4. WhatsApp Consent ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "core"."whatsapp_consent" (
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
    ON "core"."whatsapp_consent"("tenant_id", "phone_number");

CREATE INDEX IF NOT EXISTS "idx_whatsapp_consent_principal"
    ON "core"."whatsapp_consent"("principal_id")
    WHERE "principal_id" IS NOT NULL;
