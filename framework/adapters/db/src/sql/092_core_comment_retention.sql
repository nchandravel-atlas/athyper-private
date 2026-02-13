/**
 * Enhancement: Comment Retention Policies
 *
 * Adds retention management for comments with configurable policies.
 * Supports archiving, hard deletion, and compliance requirements.
 */

-- Add retention fields to entity_comment
ALTER TABLE core.entity_comment
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by TEXT,
  ADD COLUMN IF NOT EXISTS retention_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retention_policy_id UUID;

-- Add retention fields to approval_comment
ALTER TABLE core.approval_comment
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by TEXT,
  ADD COLUMN IF NOT EXISTS retention_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retention_policy_id UUID;

-- Retention Policy Configuration
CREATE TABLE IF NOT EXISTS core.comment_retention_policy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  entity_type TEXT,
  retention_days INT NOT NULL,
  action TEXT NOT NULL DEFAULT 'archive',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_retention_policy_action_chk CHECK (action IN ('archive', 'hard_delete', 'keep')),
  CONSTRAINT comment_retention_policy_days_chk CHECK (retention_days > 0)
);

-- Index for active policies
CREATE INDEX IF NOT EXISTS idx_comment_retention_policy_active
  ON core.comment_retention_policy (tenant_id, enabled)
  WHERE enabled = true;

-- Index for archived comments
CREATE INDEX IF NOT EXISTS idx_entity_comment_archived
  ON core.entity_comment (tenant_id, archived_at)
  WHERE archived_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_approval_comment_archived
  ON core.approval_comment (tenant_id, archived_at)
  WHERE archived_at IS NOT NULL;

-- Index for retention expiry
CREATE INDEX IF NOT EXISTS idx_entity_comment_retention
  ON core.entity_comment (tenant_id, retention_until)
  WHERE retention_until IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_approval_comment_retention
  ON core.approval_comment (tenant_id, retention_until)
  WHERE retention_until IS NOT NULL AND deleted_at IS NULL;

-- Retention Audit Log
CREATE TABLE IF NOT EXISTS core.comment_retention_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  comment_type TEXT NOT NULL,
  comment_id UUID NOT NULL,
  action TEXT NOT NULL,
  policy_id UUID REFERENCES core.comment_retention_policy(id) ON DELETE SET NULL,
  executed_by TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  comment_snapshot JSONB,

  CONSTRAINT comment_retention_log_type_chk CHECK (comment_type IN ('entity_comment', 'approval_comment')),
  CONSTRAINT comment_retention_log_action_chk CHECK (action IN ('archived', 'hard_deleted', 'restored'))
);

-- Index for retention audit trail
CREATE INDEX IF NOT EXISTS idx_comment_retention_log_comment
  ON core.comment_retention_log (tenant_id, comment_type, comment_id, executed_at DESC);

-- Index for retention audit by policy
CREATE INDEX IF NOT EXISTS idx_comment_retention_log_policy
  ON core.comment_retention_log (tenant_id, policy_id, executed_at DESC)
  WHERE policy_id IS NOT NULL;

COMMENT ON TABLE core.comment_retention_policy IS 'Configurable retention policies for automatic comment archival/deletion';
COMMENT ON TABLE core.comment_retention_log IS 'Audit log of all retention actions (archive, delete, restore)';
COMMENT ON COLUMN core.entity_comment.retention_until IS 'Date when comment is eligible for archival/deletion per retention policy';
COMMENT ON COLUMN core.entity_comment.archived_at IS 'Timestamp when comment was archived (soft-archived, can be restored)';
COMMENT ON COLUMN core.comment_retention_policy.action IS 'archive (soft), hard_delete (permanent), keep (retain forever)';
