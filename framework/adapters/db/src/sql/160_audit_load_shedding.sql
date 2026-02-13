-- ============================================================================
-- 160: Audit Load Shedding Policy Table
--
-- Per-tenant + global default policies for audit event load shedding.
-- Disposition: required (always write), sampled (write N%), disabled (drop).
-- NULL tenant_id = global default policy for all tenants.
-- ============================================================================

CREATE TABLE IF NOT EXISTS meta.audit_policy (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES core.tenant(id) ON DELETE CASCADE,
  event_category  TEXT NOT NULL,
  disposition     TEXT NOT NULL DEFAULT 'required',
  sample_rate     NUMERIC(4,3) NOT NULL DEFAULT 1.000,
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT audit_policy_disposition_chk
    CHECK (disposition IN ('required', 'sampled', 'disabled')),
  CONSTRAINT audit_policy_sample_rate_chk
    CHECK (sample_rate >= 0 AND sample_rate <= 1),
  CONSTRAINT audit_policy_uniq
    UNIQUE (tenant_id, event_category)
);

COMMENT ON TABLE meta.audit_policy IS
  'Per-tenant audit load shedding policies. NULL tenant_id = global default. disposition: required/sampled/disabled.';

CREATE INDEX IF NOT EXISTS idx_audit_policy_tenant
  ON meta.audit_policy (tenant_id, event_category);
