-- ============================================================================
-- 153: Audit Column-Level Encryption Support
-- ============================================================================
-- Adds key_version tracking for encrypted audit columns.
-- Encrypted columns: ip_address, user_agent, comment, attachments
-- These columns store AES-256-GCM encrypted payloads as JSON strings
-- when encryption is enabled. Unencrypted data remains as-is.
-- ============================================================================

-- Track which key version was used to encrypt each row.
-- NULL = unencrypted (pre-encryption or encryption disabled).
ALTER TABLE core.workflow_audit_event
  ADD COLUMN IF NOT EXISTS key_version int;

-- Index for key rotation worker: find rows with old key versions
CREATE INDEX IF NOT EXISTS idx_audit_event_key_version
  ON core.workflow_audit_event (tenant_id, key_version)
  WHERE key_version IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN core.workflow_audit_event.key_version
  IS 'Encryption key version used for ip_address, user_agent, comment, attachments columns. NULL = plaintext.';
