/**
 * Enhancement: Auto-save Comment Drafts
 *
 * Stores unsaved comment drafts for users to prevent data loss.
 * Auto-saves as users type, allows recovery if they navigate away.
 */

-- Comment Draft Table
CREATE TABLE IF NOT EXISTS core.comment_draft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES core.principal(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES core.entity_comment(id) ON DELETE CASCADE,
  draft_text TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One draft per user per entity (or per parent comment for replies)
  CONSTRAINT comment_draft_unique UNIQUE (tenant_id, user_id, entity_type, entity_id, parent_comment_id),
  CONSTRAINT comment_draft_visibility_chk CHECK (visibility IN ('public', 'internal', 'private'))
);

-- Index for fetching user's drafts
CREATE INDEX IF NOT EXISTS idx_comment_draft_user
  ON core.comment_draft (tenant_id, user_id, updated_at DESC);

-- Index for entity-specific drafts
CREATE INDEX IF NOT EXISTS idx_comment_draft_entity
  ON core.comment_draft (tenant_id, entity_type, entity_id);

-- Cleanup old drafts automatically (7 days retention)
-- Note: This would typically be handled by a scheduled job/worker
-- CREATE OR REPLACE FUNCTION cleanup_old_comment_drafts() RETURNS void AS $$
-- BEGIN
--   DELETE FROM core.comment_draft
--   WHERE updated_at < NOW() - INTERVAL '7 days';
-- END;
-- $$ LANGUAGE plpgsql;

COMMENT ON TABLE core.comment_draft IS 'Auto-saved comment drafts for preventing data loss';
COMMENT ON COLUMN core.comment_draft.parent_comment_id IS 'NULL for top-level comments, UUID for reply drafts';
