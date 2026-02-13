-- 158_audit_integrity_report.sql
-- Persistent integrity verification reports for evidence-grade audit.
--
-- Reports capture hash-chain continuity, anchor match, partition completeness,
-- and export SHA-256 verification results.
--
-- Idempotent: uses IF NOT EXISTS.

BEGIN;

-- ============================================================================
-- Table: core.audit_integrity_report
-- ============================================================================

CREATE TABLE IF NOT EXISTS core.audit_integrity_report (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL,
  verification_type   TEXT NOT NULL CHECK (verification_type IN ('range', 'export', 'full')),
  start_date          TIMESTAMPTZ,
  end_date            TIMESTAMPTZ,

  -- Result
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'running', 'passed', 'failed', 'error')),
  events_checked      INT DEFAULT 0,
  chain_valid         BOOLEAN,
  anchor_match        BOOLEAN,
  partitions_complete BOOLEAN,
  export_hash_valid   BOOLEAN,

  -- Failure details
  broken_at_event_id  TEXT,
  broken_at_index     INT,
  error_message       TEXT,
  details             JSONB DEFAULT '{}',

  -- Provenance
  initiated_by        TEXT NOT NULL,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE core.audit_integrity_report ENABLE ROW LEVEL SECURITY;

-- RLS policy: tenant isolation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_integrity_report'
      AND policyname = 'tenant_isolation_integrity_report'
  ) THEN
    CREATE POLICY tenant_isolation_integrity_report
      ON core.audit_integrity_report
      FOR ALL
      USING (tenant_id::text = current_setting('athyper.current_tenant', true));
  END IF;
END $$;

-- Grants: athyper_audit_admin can read and create reports
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'athyper_audit_admin') THEN
    GRANT SELECT, INSERT, UPDATE ON core.audit_integrity_report TO athyper_audit_admin;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integrity_report_tenant_created
  ON core.audit_integrity_report (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_integrity_report_tenant_status
  ON core.audit_integrity_report (tenant_id, status, created_at DESC);

COMMIT;
