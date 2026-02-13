/* ============================================================================
   Athyper — AUDIT: Covering Indexes for Activity Timeline UNION ALL

   Optimizes the timeline service's UNION ALL queries across 5 tables.
   Each index covers the common filter pattern: (tenant_id, entity, time)
   plus includes columns projected in the SELECT to enable index-only scans.

   PostgreSQL 16+
   ============================================================================ */

-- ============================================================================
-- security_event — timeline covering index
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_security_event_timeline
  ON core.security_event (tenant_id, occurred_at DESC)
  INCLUDE (event_type, severity, principal_id, details);

-- ============================================================================
-- permission_decision_log — timeline covering index
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_permission_decision_timeline
  ON core.permission_decision_log (tenant_id, occurred_at DESC)
  INCLUDE (effect, operation_code, actor_principal_id, entity_name, entity_id, reason);

-- Index for entity-filtered timeline queries
CREATE INDEX IF NOT EXISTS idx_permission_decision_entity_timeline
  ON core.permission_decision_log (tenant_id, entity_name, entity_id, occurred_at DESC);

-- ============================================================================
-- field_access_log — timeline covering index
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_field_access_timeline
  ON core.field_access_log (tenant_id, created_at DESC)
  INCLUDE (action, field_path, was_allowed, subject_id, entity_key, record_id);

-- Index for entity-filtered timeline queries
CREATE INDEX IF NOT EXISTS idx_field_access_entity_timeline
  ON core.field_access_log (tenant_id, entity_key, record_id, created_at DESC);

-- ============================================================================
-- audit_log — timeline covering index
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_audit_log_timeline
  ON core.audit_log (tenant_id, occurred_at DESC)
  INCLUDE (action, entity_name, entity_id, actor_id, payload);

-- Index for entity-filtered timeline queries
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_timeline
  ON core.audit_log (tenant_id, entity_name, entity_id, occurred_at DESC);

-- ============================================================================
-- workflow_audit_event — the main table already has good indexes from 151,
-- but add a covering index for timeline projections
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_wf_audit_timeline
  ON core.workflow_audit_event (tenant_id, event_timestamp DESC)
  INCLUDE (event_type, severity, entity_type, entity_id, actor_user_id, comment, details);
