-- ═══════════════════════════════════════════════════════════════
-- Content Management System - Database Migration
-- Created: 2026-02-13
-- Purpose: Extend core.attachment table for robust document management
--          with versioning, entity linking, and access control
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. Extend core.attachment table
-- ───────────────────────────────────────────────────────────────

-- Add new columns for content management
ALTER TABLE core.attachment
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'attachment',
  ADD COLUMN IF NOT EXISTS sha256 TEXT,
  ADD COLUMN IF NOT EXISTS original_filename TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by TEXT,
  ADD COLUMN IF NOT EXISTS shard INTEGER,
  ADD COLUMN IF NOT EXISTS version_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS parent_attachment_id UUID,
  ADD COLUMN IF NOT EXISTS replaced_at TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS replaced_by TEXT;

-- Add foreign key for versioning (parent-child relationship)
ALTER TABLE core.attachment
  ADD CONSTRAINT attachment_parent_fkey
    FOREIGN KEY (parent_attachment_id)
    REFERENCES core.attachment(id)
    ON DELETE SET NULL ON UPDATE NO ACTION;

-- Add constraint for kind taxonomy validation
ALTER TABLE core.attachment
  ADD CONSTRAINT attachment_kind_check
    CHECK (kind IN (
      'attachment',
      'generated',
      'export',
      'template',
      'letterhead',
      'avatar',
      'signature',
      'certificate',
      'invoice',
      'receipt',
      'contract',
      'report'
    ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attachment_kind
  ON core.attachment(tenant_id, kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attachment_parent
  ON core.attachment(parent_attachment_id)
  WHERE parent_attachment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_attachment_sha256
  ON core.attachment(tenant_id, sha256)
  WHERE sha256 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_attachment_current
  ON core.attachment(tenant_id, owner_entity, owner_entity_id, is_current)
  WHERE is_current = true;

-- Add column comments
COMMENT ON COLUMN core.attachment.kind IS
  'Document kind taxonomy - determines storage path, size limits, and permissions';

COMMENT ON COLUMN core.attachment.sha256 IS
  'SHA-256 checksum for content verification and deduplication';

COMMENT ON COLUMN core.attachment.original_filename IS
  'Original filename as provided by user during upload';

COMMENT ON COLUMN core.attachment.uploaded_by IS
  'User ID who initiated the upload';

COMMENT ON COLUMN core.attachment.shard IS
  'Shard number (0-999) derived from file ID for storage distribution';

COMMENT ON COLUMN core.attachment.version_no IS
  'Version number within version chain (1..n)';

COMMENT ON COLUMN core.attachment.is_current IS
  'Whether this is the current/active version of the document';

COMMENT ON COLUMN core.attachment.parent_attachment_id IS
  'Reference to previous version (creates version chain)';

COMMENT ON COLUMN core.attachment.replaced_at IS
  'Timestamp when this version was superseded by a newer version';

COMMENT ON COLUMN core.attachment.replaced_by IS
  'User ID who created the version that replaced this one';


-- ───────────────────────────────────────────────────────────────
-- 2. Create entity_document_link table (many-to-many relationships)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS core.entity_document_link (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID NOT NULL,
  attachment_id   UUID NOT NULL,
  link_kind       TEXT NOT NULL DEFAULT 'related',
  display_order   INTEGER NOT NULL DEFAULT 0,
  metadata        JSONB,
  created_at      TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  created_by      TEXT NOT NULL,

  CONSTRAINT entity_document_link_pkey PRIMARY KEY (id),

  CONSTRAINT entity_document_link_tenant_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES core.tenant(id)
    ON DELETE CASCADE ON UPDATE NO ACTION,

  CONSTRAINT entity_document_link_attachment_fkey
    FOREIGN KEY (attachment_id)
    REFERENCES core.attachment(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Ensure one attachment can only be linked once per entity
CREATE UNIQUE INDEX IF NOT EXISTS entity_document_link_entity_attachment_uniq
  ON core.entity_document_link(tenant_id, entity_type, entity_id, attachment_id);

-- Index for fast entity lookups
CREATE INDEX IF NOT EXISTS idx_entity_document_link_entity
  ON core.entity_document_link(tenant_id, entity_type, entity_id, link_kind);

-- Index for reverse lookup (find entities linked to attachment)
CREATE INDEX IF NOT EXISTS idx_entity_document_link_attachment
  ON core.entity_document_link(attachment_id);

-- Add link_kind constraint
ALTER TABLE core.entity_document_link
  ADD CONSTRAINT entity_document_link_kind_check
    CHECK (link_kind IN ('primary', 'related', 'supporting', 'compliance', 'audit'));

-- Add table comment
COMMENT ON TABLE core.entity_document_link IS
  'Many-to-many links between entities and documents with categorization';

COMMENT ON COLUMN core.entity_document_link.entity_type IS
  'Polymorphic entity type (e.g., "invoice", "customer", "vendor")';

COMMENT ON COLUMN core.entity_document_link.entity_id IS
  'UUID of the linked entity';

COMMENT ON COLUMN core.entity_document_link.link_kind IS
  'Category of relationship: primary (main doc), related, supporting, compliance, audit';

COMMENT ON COLUMN core.entity_document_link.display_order IS
  'Sort order for displaying documents within a link_kind group';


-- ───────────────────────────────────────────────────────────────
-- 3. Create document_acl table (optional per-document access control)
-- ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS core.document_acl (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  attachment_id   UUID NOT NULL,
  principal_id    UUID,
  role_id         UUID,
  permission      TEXT NOT NULL,
  granted         BOOLEAN NOT NULL DEFAULT true,
  granted_by      TEXT NOT NULL,
  granted_at      TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ(6),

  CONSTRAINT document_acl_pkey PRIMARY KEY (id),

  CONSTRAINT document_acl_tenant_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES core.tenant(id)
    ON DELETE CASCADE ON UPDATE NO ACTION,

  CONSTRAINT document_acl_attachment_fkey
    FOREIGN KEY (attachment_id)
    REFERENCES core.attachment(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Index for fast ACL checks
CREATE INDEX IF NOT EXISTS idx_document_acl_attachment
  ON core.document_acl(attachment_id, permission);

-- Add permission constraint
ALTER TABLE core.document_acl
  ADD CONSTRAINT document_acl_permission_check
    CHECK (permission IN ('read', 'download', 'delete', 'share'));

-- Ensure either principal_id OR role_id is set (not both, not neither)
ALTER TABLE core.document_acl
  ADD CONSTRAINT document_acl_principal_or_role_check
    CHECK (
      (principal_id IS NOT NULL AND role_id IS NULL) OR
      (principal_id IS NULL AND role_id IS NOT NULL)
    );

-- Add table comment
COMMENT ON TABLE core.document_acl IS
  'Optional per-document access control list (supplements PolicyGateService)';

COMMENT ON COLUMN core.document_acl.principal_id IS
  'User ID if ACL entry is for a specific user';

COMMENT ON COLUMN core.document_acl.role_id IS
  'Role ID if ACL entry is for a role (mutually exclusive with principal_id)';

COMMENT ON COLUMN core.document_acl.permission IS
  'Permission being granted or denied: read, download, delete, share';

COMMENT ON COLUMN core.document_acl.granted IS
  'true = allow, false = deny (deny takes precedence)';

COMMENT ON COLUMN core.document_acl.expires_at IS
  'Optional expiration timestamp for time-limited access';


-- ═══════════════════════════════════════════════════════════════
-- Migration Complete
-- ═══════════════════════════════════════════════════════════════
