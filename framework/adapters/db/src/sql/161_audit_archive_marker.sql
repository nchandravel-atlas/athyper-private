-- 161_audit_archive_marker.sql
-- Archive markers for storage tiering (hot/warm/cold).
--
-- Tracks which partitions have been archived to object storage,
-- preventing re-archiving and enabling cold-tier query routing.
--
-- Idempotent: uses IF NOT EXISTS.

BEGIN;

-- ============================================================================
-- Table: core.audit_archive_marker
-- ============================================================================

CREATE TABLE IF NOT EXISTS core.audit_archive_marker (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partition_name  TEXT NOT NULL UNIQUE,
  partition_month DATE NOT NULL UNIQUE,
  ndjson_key      TEXT NOT NULL,
  sha256          TEXT NOT NULL,
  row_count       BIGINT NOT NULL DEFAULT 0,
  archived_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_by     TEXT NOT NULL,
  detached_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookup by month range
CREATE INDEX IF NOT EXISTS idx_archive_marker_month
  ON core.audit_archive_marker (partition_month);

COMMIT;
