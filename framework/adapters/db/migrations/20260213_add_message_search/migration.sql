-- Add Full-Text Search support to messages
-- Migration: 20260213_add_message_search

-- Step 1: Add tsvector column for full-text search
ALTER TABLE "core"."message"
    ADD COLUMN "body_tsv" tsvector;

-- Step 2: Create GIN index for fast full-text search
CREATE INDEX "idx_message_fts"
    ON "core"."message" USING GIN("body_tsv");

-- Step 3: Populate existing messages with tsvector
UPDATE "core"."message"
SET "body_tsv" = to_tsvector('english', COALESCE("body", ''))
WHERE "body_tsv" IS NULL;

-- Step 4: Create function to update tsvector on insert/update
CREATE OR REPLACE FUNCTION "core"."message_body_tsv_trigger"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.body_tsv := to_tsvector('english', COALESCE(NEW.body, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger to automatically update tsvector
CREATE TRIGGER "message_body_tsv_update"
    BEFORE INSERT OR UPDATE OF "body"
    ON "core"."message"
    FOR EACH ROW
    EXECUTE FUNCTION "core"."message_body_tsv_trigger"();

-- Step 6: Create compound index for tenant-scoped FTS queries
CREATE INDEX "idx_message_tenant_fts"
    ON "core"."message"("tenant_id", "body_tsv")
    WHERE "deleted_at" IS NULL;
