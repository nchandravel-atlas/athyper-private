-- ============================================================================
-- Content Management Enhancements Migration
--
-- Features:
-- 1. File preview/thumbnail support
-- 2. File expiration support
-- 3. Content deduplication (reference counting)
-- 4. File access audit trail (high-volume table)
-- 5. File comments/annotations
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Extend core.attachment for previews, expiry, and reference counting
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE core.attachment
  ADD COLUMN thumbnail_key TEXT,                    -- Thumbnail (200x200)
  ADD COLUMN preview_key TEXT,                      -- Preview (800x800)
  ADD COLUMN preview_generated_at TIMESTAMPTZ(6),   -- When preview was generated
  ADD COLUMN preview_generation_failed BOOLEAN DEFAULT false,
  ADD COLUMN expires_at TIMESTAMPTZ(6),             -- Expiration date
  ADD COLUMN auto_delete_on_expiry BOOLEAN DEFAULT false,
  ADD COLUMN reference_count INTEGER DEFAULT 1;     -- For deduplication

-- Indexes for preview management
CREATE INDEX idx_attachment_preview_pending ON core.attachment(tenant_id, created_at)
  WHERE preview_key IS NULL AND preview_generation_failed = false AND content_type LIKE 'image/%';

CREATE INDEX idx_attachment_expired ON core.attachment(tenant_id, expires_at)
  WHERE expires_at IS NOT NULL AND is_current = true;

CREATE INDEX idx_attachment_reference_count ON core.attachment(sha256, reference_count)
  WHERE sha256 IS NOT NULL AND reference_count > 0;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. File Access Audit Trail (high-volume, separate table)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE core.attachment_access_log (
  id BIGSERIAL PRIMARY KEY,                         -- Use BIGSERIAL for high volume
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  attachment_id UUID NOT NULL,                      -- No FK to allow independent cleanup
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('download', 'preview', 'metadata')),
  ip_address TEXT,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

-- Partitioning key: tenant_id + accessed_at (monthly partitions recommended)
CREATE INDEX idx_access_log_tenant_time ON core.attachment_access_log(tenant_id, accessed_at DESC);
CREATE INDEX idx_access_log_attachment ON core.attachment_access_log(attachment_id, accessed_at DESC);
CREATE INDEX idx_access_log_actor ON core.attachment_access_log(tenant_id, actor_id, accessed_at DESC);

COMMENT ON TABLE core.attachment_access_log IS 'High-volume audit trail for file access. Consider partitioning by month and retention policy (30-90 days).';

-- ────────────────────────────────────────────────────────────────────────────
-- 3. File Comments/Annotations
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE core.attachment_comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  attachment_id UUID NOT NULL REFERENCES core.attachment(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES core.attachment_comment(id) ON DELETE CASCADE,  -- For threaded replies
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  mentions JSONB,                                   -- Array of user IDs mentioned
  edited_at TIMESTAMPTZ(6),
  edited_by TEXT,
  deleted_at TIMESTAMPTZ(6),                        -- Soft delete
  deleted_by TEXT,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

-- Indexes for comment queries
CREATE INDEX idx_comment_attachment ON core.attachment_comment(tenant_id, attachment_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_comment_parent ON core.attachment_comment(parent_id, created_at)
  WHERE parent_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_comment_author ON core.attachment_comment(tenant_id, author_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- GIN index for mentions search (if using mentions feature)
CREATE INDEX idx_comment_mentions ON core.attachment_comment USING GIN (mentions)
  WHERE mentions IS NOT NULL;

COMMENT ON TABLE core.attachment_comment IS 'Comments and annotations for attachments. Supports threaded replies and mentions.';

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Multipart Upload Tracking (optional - can use attachment table)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE core.multipart_upload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
  attachment_id UUID NOT NULL REFERENCES core.attachment(id) ON DELETE CASCADE,
  s3_upload_id TEXT NOT NULL,                       -- S3 multipart upload ID
  total_parts INTEGER NOT NULL,
  completed_parts INTEGER DEFAULT 0,
  part_etags JSONB,                                 -- Array of {PartNumber, ETag}
  status TEXT NOT NULL CHECK (status IN ('initiated', 'uploading', 'completed', 'aborted', 'failed')),
  initiated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ(6),
  expires_at TIMESTAMPTZ(6) NOT NULL,               -- Multipart uploads expire after 7 days

  UNIQUE(s3_upload_id)
);

CREATE INDEX idx_multipart_attachment ON core.multipart_upload(attachment_id);
CREATE INDEX idx_multipart_status ON core.multipart_upload(tenant_id, status, expires_at)
  WHERE status IN ('initiated', 'uploading');

COMMENT ON TABLE core.multipart_upload IS 'Tracks S3 multipart uploads for large files (>100MB). Cleanup job aborts expired uploads.';

-- ────────────────────────────────────────────────────────────────────────────
-- Data Migration: Set reference_count = 1 for existing attachments
-- ────────────────────────────────────────────────────────────────────────────

UPDATE core.attachment SET reference_count = 1 WHERE reference_count IS NULL;
