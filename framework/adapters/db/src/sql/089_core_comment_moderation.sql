/**
 * Enhancement: Comment Moderation & Flagging
 *
 * Allows users to flag inappropriate comments for moderation review.
 * Auto-hides comments after reaching flag threshold.
 * Provides moderation queue for administrators.
 */

-- Comment Flag Table
CREATE TABLE IF NOT EXISTS core.comment_flag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  comment_type TEXT NOT NULL,
  comment_id UUID NOT NULL,
  flagger_user_id UUID NOT NULL REFERENCES core.principal(id) ON DELETE CASCADE,
  flag_reason TEXT NOT NULL,
  flag_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES core.principal(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One flag per user per comment
  CONSTRAINT comment_flag_unique UNIQUE (tenant_id, comment_type, comment_id, flagger_user_id),
  CONSTRAINT comment_flag_type_chk CHECK (comment_type IN ('entity_comment', 'approval_comment')),
  CONSTRAINT comment_flag_reason_chk CHECK (flag_reason IN ('spam', 'offensive', 'harassment', 'misinformation', 'other')),
  CONSTRAINT comment_flag_status_chk CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned'))
);

-- Index for pending flags (moderation queue)
CREATE INDEX IF NOT EXISTS idx_comment_flag_pending
  ON core.comment_flag (tenant_id, status, created_at DESC)
  WHERE status = 'pending';

-- Index for comment flags lookup
CREATE INDEX IF NOT EXISTS idx_comment_flag_comment
  ON core.comment_flag (tenant_id, comment_type, comment_id, status);

-- Comment Moderation Status Table
CREATE TABLE IF NOT EXISTS core.comment_moderation_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  comment_type TEXT NOT NULL,
  comment_id UUID NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  hidden_reason TEXT,
  hidden_at TIMESTAMPTZ,
  hidden_by UUID REFERENCES core.principal(id) ON DELETE SET NULL,
  flag_count INT NOT NULL DEFAULT 0,
  last_flagged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One moderation status per comment
  CONSTRAINT comment_moderation_unique UNIQUE (tenant_id, comment_type, comment_id),
  CONSTRAINT comment_moderation_type_chk CHECK (comment_type IN ('entity_comment', 'approval_comment'))
);

-- Index for hidden comments
CREATE INDEX IF NOT EXISTS idx_comment_moderation_hidden
  ON core.comment_moderation_status (tenant_id, is_hidden, updated_at DESC)
  WHERE is_hidden = true;

-- Index for high flag count (auto-moderation)
CREATE INDEX IF NOT EXISTS idx_comment_moderation_flags
  ON core.comment_moderation_status (tenant_id, flag_count DESC, last_flagged_at DESC)
  WHERE flag_count > 0;

COMMENT ON TABLE core.comment_flag IS 'User-reported flags for inappropriate comments';
COMMENT ON TABLE core.comment_moderation_status IS 'Moderation status and flag count per comment';
COMMENT ON COLUMN core.comment_flag.flag_reason IS 'spam, offensive, harassment, misinformation, other';
COMMENT ON COLUMN core.comment_flag.status IS 'pending, reviewed, dismissed, actioned';
