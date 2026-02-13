/**
 * Enhancement: Private/Internal Comments
 *
 * Adds visibility control to comments:
 * - public: Visible to all users with read access
 * - internal: Visible only to internal users (employees, admins)
 * - private: Visible only to comment author and mentioned users
 */

-- Add visibility column to entity_comment
ALTER TABLE core.entity_comment
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
  ADD CONSTRAINT entity_comment_visibility_chk CHECK (visibility IN ('public', 'internal', 'private'));

-- Add visibility column to approval_comment
ALTER TABLE core.approval_comment
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by TEXT,
  ADD CONSTRAINT approval_comment_visibility_chk CHECK (visibility IN ('public', 'internal', 'private'));

-- Index for filtering by visibility
CREATE INDEX IF NOT EXISTS idx_entity_comment_visibility
  ON core.entity_comment (tenant_id, entity_type, entity_id, visibility, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_approval_comment_visibility
  ON core.approval_comment (tenant_id, approval_instance_id, visibility, created_at DESC)
  WHERE deleted_at IS NULL;

-- Comment: Privacy rules
-- public: Default, visible to all with entity read access
-- internal: Requires user.is_internal = true or admin role
-- private: Visible only to author, mentioned users, and admins
