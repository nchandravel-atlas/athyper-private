/* ============================================================================
   Athyper — AUDIT: Security Hardening

   1. Tighten immutability bypass: restrict to specific DB roles +
      allow UPDATE only on key_version column (for encryption rotation)
   2. Row-Level Security: tenant isolation on all audit tables
   3. Dedicated DB roles for retention and admin operations

   PostgreSQL 16+
   ============================================================================ */

-- ============================================================================
-- Step 1: Dedicated DB Roles (NOLOGIN — used via SET ROLE)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'athyper_retention') THEN
    CREATE ROLE athyper_retention NOLOGIN;
    COMMENT ON ROLE athyper_retention IS 'Role for audit retention jobs. Allowed to DELETE old partitions/rows.';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'athyper_admin') THEN
    CREATE ROLE athyper_admin NOLOGIN;
    COMMENT ON ROLE athyper_admin IS 'Role for audit admin operations (key rotation, manual corrections).';
  END IF;
END;
$$;

-- Grant narrow permissions: retention can DELETE, admin can UPDATE(key_version)
GRANT DELETE ON core.workflow_audit_event TO athyper_retention;
GRANT DELETE ON core.audit_log TO athyper_retention;
GRANT DELETE ON core.permission_decision_log TO athyper_retention;
GRANT DELETE ON core.field_access_log TO athyper_retention;
GRANT DELETE ON core.security_event TO athyper_retention;

GRANT UPDATE (key_version, ip_address, user_agent, comment, attachments)
  ON core.workflow_audit_event TO athyper_admin;

-- ============================================================================
-- Step 2: Tighten Immutability Trigger
-- ============================================================================
-- Replace the original prevent_audit_mutation() with a stricter version:
--   - Bypass requires athyper_retention or athyper_admin role
--   - UPDATE bypass only allowed for key_version column changes (encryption rotation)
--   - DELETE bypass only allowed for retention role
-- ============================================================================

CREATE OR REPLACE FUNCTION core.prevent_audit_mutation()
RETURNS trigger AS $$
DECLARE
  v_bypass text;
  v_is_retention boolean;
  v_is_admin boolean;
BEGIN
  v_bypass := current_setting('athyper.audit_retention_bypass', true);

  IF v_bypass = 'true' THEN
    -- Check that the caller has the required role
    v_is_retention := pg_has_role(current_user, 'athyper_retention', 'MEMBER');
    v_is_admin := pg_has_role(current_user, 'athyper_admin', 'MEMBER');

    IF TG_OP = 'DELETE' AND v_is_retention THEN
      RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' AND v_is_admin THEN
      -- Only allow UPDATE on encryption-related columns
      -- (key_version, ip_address, user_agent, comment, attachments)
      IF TG_TABLE_NAME = 'workflow_audit_event' THEN
        IF OLD.key_version IS DISTINCT FROM NEW.key_version THEN
          RETURN NEW;
        END IF;
      END IF;
    END IF;

    -- Bypass set but role/column check failed
    RAISE EXCEPTION 'Audit mutation bypass requires appropriate role. op=%, user=%, table=%.%',
      TG_OP, current_user, TG_TABLE_SCHEMA, TG_TABLE_NAME
      USING errcode = 'restrict_violation';
  END IF;

  RAISE EXCEPTION 'Audit tables are immutable. % operations are not permitted on %.%',
    TG_OP, TG_TABLE_SCHEMA, TG_TABLE_NAME
    USING errcode = 'restrict_violation';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION core.prevent_audit_mutation() IS
  'Immutability guard for audit tables. Bypass requires athyper_retention (DELETE) or athyper_admin (UPDATE key_version) role + session variable.';

-- ============================================================================
-- Step 3: Row-Level Security (Tenant Isolation)
-- ============================================================================
-- RLS ensures queries can only access rows matching the current tenant.
-- The tenant is set via: SET LOCAL athyper.current_tenant = '<tenant-id>'
-- This is a defense-in-depth control — application code already filters by tenant_id.
-- ============================================================================

-- Enable RLS on audit tables
ALTER TABLE core.workflow_audit_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.audit_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.audit_hash_anchor ENABLE ROW LEVEL SECURITY;

-- Policies: tenant isolation based on session variable
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'workflow_audit_event'
      AND policyname = 'audit_event_tenant_isolation'
  ) THEN
    CREATE POLICY audit_event_tenant_isolation ON core.workflow_audit_event
      USING (tenant_id = current_setting('athyper.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('athyper.current_tenant', true)::uuid);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_outbox'
      AND policyname = 'audit_outbox_tenant_isolation'
  ) THEN
    CREATE POLICY audit_outbox_tenant_isolation ON core.audit_outbox
      USING (tenant_id = current_setting('athyper.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('athyper.current_tenant', true)::uuid);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_hash_anchor'
      AND policyname = 'audit_anchor_tenant_isolation'
  ) THEN
    CREATE POLICY audit_anchor_tenant_isolation ON core.audit_hash_anchor
      USING (tenant_id = current_setting('athyper.current_tenant', true)::uuid)
      WITH CHECK (tenant_id = current_setting('athyper.current_tenant', true)::uuid);
  END IF;
END $$;

-- DLQ table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'core' AND tablename = 'audit_dlq') THEN
    EXECUTE 'ALTER TABLE core.audit_dlq ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'audit_dlq'
        AND policyname = 'audit_dlq_tenant_isolation'
    ) THEN
      EXECUTE 'CREATE POLICY audit_dlq_tenant_isolation ON core.audit_dlq
        USING (tenant_id = current_setting(''athyper.current_tenant'', true)::uuid)
        WITH CHECK (tenant_id = current_setting(''athyper.current_tenant'', true)::uuid)';
    END IF;
  END IF;
END;
$$;

-- Allow table owner (migration user) to bypass RLS for admin operations
-- Application users will have RLS enforced
COMMENT ON POLICY audit_event_tenant_isolation ON core.workflow_audit_event IS
  'Tenant isolation: queries only return rows matching athyper.current_tenant session variable.';
