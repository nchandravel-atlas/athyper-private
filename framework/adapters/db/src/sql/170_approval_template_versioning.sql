/* ============================================================================
   Athyper — Approval Template Versioning + Compilation Columns
   PostgreSQL 16+

   Adds version management and compiled artifact storage to approval templates,
   matching the pattern used by meta.lifecycle (code + version_no unique).
   ============================================================================ */

-- Add versioning columns
ALTER TABLE meta.approval_template ADD COLUMN IF NOT EXISTS version_no int NOT NULL DEFAULT 1;
ALTER TABLE meta.approval_template ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE meta.approval_template ADD COLUMN IF NOT EXISTS updated_at timestamptz;
ALTER TABLE meta.approval_template ADD COLUMN IF NOT EXISTS updated_by text;

-- Add compilation artifact columns
ALTER TABLE meta.approval_template ADD COLUMN IF NOT EXISTS compiled_json jsonb;
ALTER TABLE meta.approval_template ADD COLUMN IF NOT EXISTS compiled_hash text;

-- Replace single-code unique constraint with versioned unique constraint
-- (allows multiple versions of the same template code)
ALTER TABLE meta.approval_template DROP CONSTRAINT IF EXISTS approval_template_code_uniq;
ALTER TABLE meta.approval_template ADD CONSTRAINT approval_template_code_version_uniq
  UNIQUE (tenant_id, code, version_no);

-- Index for fast active-version lookup
CREATE INDEX IF NOT EXISTS idx_approval_template_active
  ON meta.approval_template (tenant_id, code, is_active)
  WHERE is_active = true;
