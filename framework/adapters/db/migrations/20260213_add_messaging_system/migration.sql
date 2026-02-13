-- CreateTable: Messaging System
-- Migration: add_messaging_system
-- Date: 2026-02-13

-- ============================================================================
-- Table: conversation
-- ============================================================================
CREATE TABLE "core"."conversation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "updated_by" TEXT,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- Table: conversation_participant
-- ============================================================================
CREATE TABLE "core"."conversation_participant" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMPTZ(6),
    "last_read_message_id" UUID,
    "last_read_at" TIMESTAMPTZ(6),

    CONSTRAINT "conversation_participant_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- Table: message
-- ============================================================================
CREATE TABLE "core"."message" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "body_format" TEXT NOT NULL DEFAULT 'plain',
    "client_message_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- Table: message_delivery
-- ============================================================================
CREATE TABLE "core"."message_delivery" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "delivered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "message_delivery_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- Unique Constraints
-- ============================================================================
CREATE UNIQUE INDEX "conversation_participant_tenant_conv_user_uniq"
    ON "core"."conversation_participant"("tenant_id", "conversation_id", "user_id");

CREATE UNIQUE INDEX "message_tenant_client_id_uniq"
    ON "core"."message"("tenant_id", "client_message_id")
    WHERE "client_message_id" IS NOT NULL;

CREATE UNIQUE INDEX "message_delivery_message_recipient_uniq"
    ON "core"."message_delivery"("message_id", "recipient_id");

-- ============================================================================
-- Indexes: conversation
-- ============================================================================
CREATE INDEX "idx_conversation_tenant_type"
    ON "core"."conversation"("tenant_id", "type", "created_at" DESC);

CREATE INDEX "idx_conversation_tenant_time"
    ON "core"."conversation"("tenant_id", "created_at" DESC);

-- ============================================================================
-- Indexes: conversation_participant
-- ============================================================================
CREATE INDEX "idx_conversation_participant_user"
    ON "core"."conversation_participant"("tenant_id", "user_id", "left_at")
    WHERE "left_at" IS NULL;

CREATE INDEX "idx_conversation_participant_conv"
    ON "core"."conversation_participant"("conversation_id", "left_at")
    WHERE "left_at" IS NULL;

CREATE INDEX "idx_conversation_participant_unread"
    ON "core"."conversation_participant"("tenant_id", "user_id", "last_read_at" DESC);

-- ============================================================================
-- Indexes: message
-- ============================================================================
CREATE INDEX "idx_message_conversation_time"
    ON "core"."message"("tenant_id", "conversation_id", "created_at" DESC)
    WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_message_sender_time"
    ON "core"."message"("tenant_id", "sender_id", "created_at" DESC)
    WHERE "deleted_at" IS NULL;

CREATE INDEX "idx_message_client_id"
    ON "core"."message"("client_message_id")
    WHERE "client_message_id" IS NOT NULL;

-- ============================================================================
-- Indexes: message_delivery
-- ============================================================================
CREATE INDEX "idx_message_delivery_recipient_unread"
    ON "core"."message_delivery"("tenant_id", "recipient_id", "read_at")
    WHERE "read_at" IS NULL;

CREATE INDEX "idx_message_delivery_recipient_time"
    ON "core"."message_delivery"("tenant_id", "recipient_id", "delivered_at" DESC);

CREATE INDEX "idx_message_delivery_message"
    ON "core"."message_delivery"("message_id");

-- ============================================================================
-- Foreign Keys: conversation
-- ============================================================================
ALTER TABLE "core"."conversation"
    ADD CONSTRAINT "conversation_tenant_id_fkey"
    FOREIGN KEY ("tenant_id")
    REFERENCES "core"."tenant"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

-- ============================================================================
-- Foreign Keys: conversation_participant
-- ============================================================================
ALTER TABLE "core"."conversation_participant"
    ADD CONSTRAINT "conversation_participant_conversation_id_fkey"
    FOREIGN KEY ("conversation_id")
    REFERENCES "core"."conversation"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "core"."conversation_participant"
    ADD CONSTRAINT "conversation_participant_tenant_id_fkey"
    FOREIGN KEY ("tenant_id")
    REFERENCES "core"."tenant"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "core"."conversation_participant"
    ADD CONSTRAINT "conversation_participant_user_id_fkey"
    FOREIGN KEY ("user_id")
    REFERENCES "core"."principal"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "core"."conversation_participant"
    ADD CONSTRAINT "conversation_participant_last_read_message_id_fkey"
    FOREIGN KEY ("last_read_message_id")
    REFERENCES "core"."message"("id")
    ON UPDATE NO ACTION;

-- ============================================================================
-- Foreign Keys: message
-- ============================================================================
ALTER TABLE "core"."message"
    ADD CONSTRAINT "message_conversation_id_fkey"
    FOREIGN KEY ("conversation_id")
    REFERENCES "core"."conversation"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "core"."message"
    ADD CONSTRAINT "message_sender_id_fkey"
    FOREIGN KEY ("sender_id")
    REFERENCES "core"."principal"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "core"."message"
    ADD CONSTRAINT "message_tenant_id_fkey"
    FOREIGN KEY ("tenant_id")
    REFERENCES "core"."tenant"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

-- ============================================================================
-- Foreign Keys: message_delivery
-- ============================================================================
ALTER TABLE "core"."message_delivery"
    ADD CONSTRAINT "message_delivery_message_id_fkey"
    FOREIGN KEY ("message_id")
    REFERENCES "core"."message"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "core"."message_delivery"
    ADD CONSTRAINT "message_delivery_recipient_id_fkey"
    FOREIGN KEY ("recipient_id")
    REFERENCES "core"."principal"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

ALTER TABLE "core"."message_delivery"
    ADD CONSTRAINT "message_delivery_tenant_id_fkey"
    FOREIGN KEY ("tenant_id")
    REFERENCES "core"."tenant"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE "core"."conversation" IS 'Container for direct or group messaging';
COMMENT ON TABLE "core"."conversation_participant" IS 'Join table tracking conversation participants with read tracking';
COMMENT ON TABLE "core"."message" IS 'Individual messages within conversations';
COMMENT ON TABLE "core"."message_delivery" IS 'Per-recipient delivery and read tracking';

COMMENT ON COLUMN "core"."conversation"."type" IS 'Conversation type: direct | group';
COMMENT ON COLUMN "core"."conversation"."title" IS 'Conversation title (nullable for direct conversations)';
COMMENT ON COLUMN "core"."conversation_participant"."role" IS 'Participant role: member | admin';
COMMENT ON COLUMN "core"."conversation_participant"."left_at" IS 'When participant left conversation (soft delete)';
COMMENT ON COLUMN "core"."conversation_participant"."last_read_message_id" IS 'Pointer to last message read by participant';
COMMENT ON COLUMN "core"."message"."body_format" IS 'Message format: plain | markdown';
COMMENT ON COLUMN "core"."message"."client_message_id" IS 'Idempotency key from client for safe retries';
COMMENT ON COLUMN "core"."message"."deleted_at" IS 'Soft delete timestamp';
COMMENT ON COLUMN "core"."message_delivery"."delivered_at" IS 'When message was delivered to recipient';
COMMENT ON COLUMN "core"."message_delivery"."read_at" IS 'When message was read by recipient';
