-- ============================================================================
-- 157: Audit Role Separation + SECURITY DEFINER Functions
--
-- Replaces ad-hoc SET LOCAL bypass with SECURITY DEFINER functions.
-- Introduces 4 granular roles (up from 2):
--   1. athyper_app_writer   — INSERT-only for application writes
--   2. athyper_audit_reader  — SELECT with RLS enforcement
--   3. athyper_audit_admin   — Integrity verification + export + audit-of-audit
--   4. athyper_retention     — (existing) DELETE for partition retention
--   5. athyper_admin         — (existing) Owns key rotation bypass function
-- ============================================================================

-- ── Step 1: Create new roles ─────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'athyper_app_writer') THEN
    CREATE ROLE athyper_app_writer NOLOGIN;
    COMMENT ON ROLE athyper_app_writer IS 'INSERT-only role for audit tables. Used by application code during event ingestion.';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'athyper_audit_reader') THEN
    CREATE ROLE athyper_audit_reader NOLOGIN;
    COMMENT ON ROLE athyper_audit_reader IS 'SELECT-only role for audit tables with RLS enforcement. Used by query services.';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'athyper_audit_admin') THEN
    CREATE ROLE athyper_audit_admin NOLOGIN;
    COMMENT ON ROLE athyper_audit_admin IS 'Integrity verification, export operations, and audit-of-audit on audit tables.';
  END IF;
END;
$$;

-- ── Step 2: GRANT INSERT to athyper_app_writer ───────────────────────────

GRANT INSERT ON core.workflow_audit_event TO athyper_app_writer;
GRANT INSERT ON core.audit_outbox TO athyper_app_writer;
GRANT INSERT ON core.audit_hash_anchor TO athyper_app_writer;
GRANT INSERT ON core.audit_dlq TO athyper_app_writer;
GRANT INSERT ON core.security_event TO athyper_app_writer;

-- ── Step 3: GRANT SELECT to athyper_audit_reader ─────────────────────────

GRANT SELECT ON core.workflow_audit_event TO athyper_audit_reader;
GRANT SELECT ON core.audit_outbox TO athyper_audit_reader;
GRANT SELECT ON core.audit_hash_anchor TO athyper_audit_reader;
GRANT SELECT ON core.audit_dlq TO athyper_audit_reader;
GRANT SELECT ON core.security_event TO athyper_audit_reader;
GRANT SELECT ON core.permission_decision_log TO athyper_audit_reader;
GRANT SELECT ON core.field_access_log TO athyper_audit_reader;
GRANT SELECT ON core.audit_log TO athyper_audit_reader;

-- ── Step 4: GRANT to athyper_audit_admin ─────────────────────────────────

GRANT SELECT ON core.workflow_audit_event TO athyper_audit_admin;
GRANT SELECT ON core.audit_hash_anchor TO athyper_audit_admin;
GRANT SELECT ON core.audit_dlq TO athyper_audit_admin;
GRANT SELECT ON core.security_event TO athyper_audit_admin;
GRANT INSERT ON core.security_event TO athyper_audit_admin;
GRANT SELECT ON core.permission_decision_log TO athyper_audit_admin;
GRANT SELECT ON core.field_access_log TO athyper_audit_admin;
GRANT SELECT ON core.audit_log TO athyper_audit_admin;

-- ── Step 5: SECURITY DEFINER for key rotation UPDATE ─────────────────────
-- Replaces: SET LOCAL athyper.audit_retention_bypass = 'true' + direct UPDATE
-- event_timestamp is needed because the partitioned table PK is (id, event_timestamp)

CREATE OR REPLACE FUNCTION core.audit_key_rotation_update(
  p_tenant_id        uuid,
  p_row_id           uuid,
  p_event_timestamp  timestamptz,
  p_ip_address       text,
  p_user_agent       text,
  p_comment          text,
  p_attachments      text,
  p_key_version      int
)
RETURNS void
SECURITY DEFINER
SET search_path = core, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  SET LOCAL athyper.audit_retention_bypass = 'true';

  UPDATE core.workflow_audit_event
  SET ip_address   = p_ip_address,
      user_agent   = p_user_agent,
      comment      = p_comment,
      attachments  = p_attachments,
      key_version  = p_key_version
  WHERE id              = p_row_id
    AND tenant_id       = p_tenant_id
    AND event_timestamp = p_event_timestamp;
END;
$$;

-- Ownership: athyper_admin so the immutability trigger sees the correct role
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'athyper_admin') THEN
    ALTER FUNCTION core.audit_key_rotation_update(uuid, uuid, timestamptz, text, text, text, text, int)
      OWNER TO athyper_admin;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION core.audit_key_rotation_update(uuid, uuid, timestamptz, text, text, text, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION core.audit_key_rotation_update(uuid, uuid, timestamptz, text, text, text, text, int) TO athyper_audit_admin;

COMMENT ON FUNCTION core.audit_key_rotation_update IS
  'SECURITY DEFINER: Re-encrypt audit event columns during key rotation. Owned by athyper_admin to satisfy immutability trigger bypass.';

-- ── Step 6: SECURITY DEFINER for retention DELETE ────────────────────────
-- Replaces: SET LOCAL athyper.audit_retention_bypass = 'true' + direct DELETE

CREATE OR REPLACE FUNCTION core.audit_retention_delete(
  p_table_name  text,
  p_cutoff_date timestamptz,
  p_tenant_id   uuid DEFAULT NULL
)
RETURNS bigint
SECURITY DEFINER
SET search_path = core, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_count   bigint;
  v_allowed text[] := ARRAY[
    'workflow_audit_event',
    'audit_log',
    'permission_decision_log',
    'field_access_log',
    'security_event'
  ];
BEGIN
  -- Validate table name against allowlist (prevents SQL injection)
  IF NOT (p_table_name = ANY(v_allowed)) THEN
    RAISE EXCEPTION 'audit_retention_delete: table "%" not in allowlist', p_table_name
      USING errcode = 'restrict_violation';
  END IF;

  SET LOCAL athyper.audit_retention_bypass = 'true';

  IF p_tenant_id IS NOT NULL THEN
    EXECUTE format(
      'WITH deleted AS (
         DELETE FROM core.%I WHERE created_at < $1 AND tenant_id = $2 RETURNING id
       ) SELECT COUNT(*) FROM deleted',
      p_table_name
    ) INTO v_count USING p_cutoff_date, p_tenant_id;
  ELSE
    EXECUTE format(
      'WITH deleted AS (
         DELETE FROM core.%I WHERE created_at < $1 RETURNING id
       ) SELECT COUNT(*) FROM deleted',
      p_table_name
    ) INTO v_count USING p_cutoff_date;
  END IF;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Ownership: athyper_retention so the immutability trigger sees the correct role
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'athyper_retention') THEN
    ALTER FUNCTION core.audit_retention_delete(text, timestamptz, uuid)
      OWNER TO athyper_retention;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION core.audit_retention_delete(text, timestamptz, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION core.audit_retention_delete(text, timestamptz, uuid) TO athyper_retention;

COMMENT ON FUNCTION core.audit_retention_delete IS
  'SECURITY DEFINER: Delete old audit rows for retention. Validates table name against allowlist. Owned by athyper_retention to satisfy immutability trigger bypass.';
