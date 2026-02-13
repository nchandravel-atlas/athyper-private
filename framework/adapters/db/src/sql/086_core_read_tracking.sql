/**
 * Comment Read Tracking Schema
 *
 * Tracks which comments have been read by which users.
 * Primary storage: Redis (performance)
 * Fallback/Audit: PostgreSQL (persistence)
 */

-- Comment Read Status Table
CREATE TABLE IF NOT EXISTS core.comment_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  comment_type TEXT NOT NULL,
  comment_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES core.principal(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_read_status_type_chk CHECK (comment_type IN ('entity_comment', 'approval_comment')),
  CONSTRAINT comment_read_status_unique UNIQUE (tenant_id, comment_type, comment_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_comment_read_status_user
  ON core.comment_read_status (tenant_id, user_id, read_at DESC);

CREATE INDEX idx_comment_read_status_comment
  ON core.comment_read_status (tenant_id, comment_type, comment_id);

-- Cleanup old read status (retention policy: 90 days)
-- Run via cron: DELETE FROM core.comment_read_status WHERE read_at < NOW() - INTERVAL '90 days';

COMMENT ON TABLE core.comment_read_status IS 'Tracks which comments have been read by users (90-day retention)';
