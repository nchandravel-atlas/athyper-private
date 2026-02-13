-- ============================================================================
-- 141: Document Services — Robustness Enhancements
-- ============================================================================
-- Depends on: 140_document_services.sql
-- Module:     DOC — Data model hardening, DLQ, capability flags
-- ============================================================================

-- ============================================================================
-- A) Strict single-default enforcement (UNIQUE partial indexes)
-- ============================================================================

DROP INDEX IF EXISTS core.idx_doc_letterhead_tenant_default;
CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_letterhead_tenant_default
    ON core.doc_letterhead (tenant_id) WHERE is_default = true;

DROP INDEX IF EXISTS core.idx_doc_brand_profile_tenant_default;
CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_brand_profile_tenant_default
    ON core.doc_brand_profile (tenant_id) WHERE is_default = true;


-- ============================================================================
-- B) Idempotency composite index on doc_output (in-flight dedup)
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_output_inflight_idempotency
    ON core.doc_output (tenant_id, template_version_id, entity_name, entity_id, operation, variant, input_payload_hash)
    WHERE status IN ('QUEUED', 'RENDERING');


-- ============================================================================
-- C) Storage versioning columns on doc_output
-- ============================================================================

ALTER TABLE core.doc_output ADD COLUMN IF NOT EXISTS storage_bucket TEXT;
ALTER TABLE core.doc_output ADD COLUMN IF NOT EXISTS storage_version_id TEXT;
ALTER TABLE core.doc_output ADD COLUMN IF NOT EXISTS manifest_version INT NOT NULL DEFAULT 1;
ALTER TABLE core.doc_output ADD COLUMN IF NOT EXISTS error_code TEXT;


-- ============================================================================
-- D) Template capability columns on doc_template
-- ============================================================================

ALTER TABLE core.doc_template ADD COLUMN IF NOT EXISTS supports_rtl BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE core.doc_template ADD COLUMN IF NOT EXISTS requires_letterhead BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE core.doc_template ADD COLUMN IF NOT EXISTS allowed_operations TEXT[];
ALTER TABLE core.doc_template ADD COLUMN IF NOT EXISTS supported_locales TEXT[];


-- ============================================================================
-- E) Render DLQ table
-- ============================================================================

CREATE TABLE IF NOT EXISTS core.doc_render_dlq (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES core.tenant(id) ON DELETE CASCADE,
    output_id       UUID NOT NULL REFERENCES core.doc_output(id),
    render_job_id   UUID REFERENCES core.doc_render_job(id),

    error_code      TEXT NOT NULL,
    error_detail    TEXT,
    error_category  TEXT NOT NULL CHECK (error_category IN ('transient','permanent','timeout','crash')),
    attempt_count   INT NOT NULL DEFAULT 0,
    payload         JSONB NOT NULL,

    replayed_at     TIMESTAMPTZ,
    replayed_by     TEXT,
    replay_count    INT NOT NULL DEFAULT 0,

    dead_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

comment on table core.doc_render_dlq is 'Dead-letter queue for permanently failed document render jobs.';

CREATE INDEX IF NOT EXISTS idx_doc_render_dlq_unreplayed
    ON core.doc_render_dlq (tenant_id) WHERE replayed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_doc_render_dlq_output
    ON core.doc_render_dlq (output_id);
