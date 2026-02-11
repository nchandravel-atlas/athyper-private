/* ============================================================================
   Athyper — META: Numbering Sequence (Approvable Core Engine)
   Atomic counter table for gap-free document number generation.
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- META: Numbering Sequence Counters
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta.numbering_sequence (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,

  entity_name   TEXT NOT NULL,
  period_key    TEXT NOT NULL DEFAULT '__global__',
  current_value BIGINT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT numbering_seq_uniq UNIQUE (tenant_id, entity_name, period_key)
);

COMMENT ON TABLE meta.numbering_sequence IS
'Atomic numbering counters per entity+period for gap-free document number generation.';

CREATE INDEX IF NOT EXISTS idx_numbering_sequence_lookup
  ON meta.numbering_sequence (tenant_id, entity_name);
