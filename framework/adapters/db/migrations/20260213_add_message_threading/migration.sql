-- Add Threading Support to Messages
-- Migration: add_message_threading
-- Date: 2026-02-13

-- ============================================================================
-- Add parent_message_id column to message table
-- ============================================================================
ALTER TABLE "core"."message"
    ADD COLUMN "parent_message_id" UUID NULL;

-- ============================================================================
-- Add foreign key constraint
-- ============================================================================
ALTER TABLE "core"."message"
    ADD CONSTRAINT "message_parent_message_id_fkey"
    FOREIGN KEY ("parent_message_id")
    REFERENCES "core"."message"("id")
    ON DELETE SET NULL
    ON UPDATE NO ACTION;

-- ============================================================================
-- Add index for efficient thread queries
-- ============================================================================
CREATE INDEX "idx_message_parent_thread"
    ON "core"."message"("tenant_id", "parent_message_id", "created_at" DESC)
    WHERE "deleted_at" IS NULL AND "parent_message_id" IS NOT NULL;

-- ============================================================================
-- Add index for root messages (no parent)
-- ============================================================================
CREATE INDEX "idx_message_root"
    ON "core"."message"("tenant_id", "conversation_id", "created_at" DESC)
    WHERE "deleted_at" IS NULL AND "parent_message_id" IS NULL;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON COLUMN "core"."message"."parent_message_id" IS 'Parent message ID for threaded replies (NULL for root messages)';
