-- 159_audit_replay_dedup.sql
-- Partial unique index for idempotent audit event replay.
--
-- Only events with a non-null correlation_id participate in dedup.
-- Replay operations always set correlation_id, so duplicates are
-- silently skipped via INSERT ... ON CONFLICT DO NOTHING.
--
-- Idempotent: uses IF NOT EXISTS.

BEGIN;

-- Partial unique index for deduplication during replay
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_event_dedup
  ON core.workflow_audit_event (
    tenant_id,
    correlation_id,
    event_timestamp,
    event_type,
    actor_user_id
  )
  WHERE correlation_id IS NOT NULL;

COMMIT;
