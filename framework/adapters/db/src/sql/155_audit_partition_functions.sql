/* ============================================================================
   Athyper — AUDIT: Partition Lifecycle Helper Functions

   Utility functions for partition management automation:
   1. create_audit_partition_for_month(target_date) — create a specific month's partition
   2. list_audit_partitions() — list all existing partitions with date ranges
   3. check_audit_partition_indexes(partition_name) — check for missing indexes

   PostgreSQL 16+
   ============================================================================ */

-- ============================================================================
-- 1. Create a partition for a specific month
-- ============================================================================

CREATE OR REPLACE FUNCTION core.create_audit_partition_for_month(p_target date)
RETURNS text AS $$
DECLARE
  v_start date := date_trunc('month', p_target);
  v_end   date := v_start + interval '1 month';
  v_name  text := 'workflow_audit_event_' || to_char(v_start, 'YYYY_MM');
BEGIN
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS core.%I PARTITION OF core.workflow_audit_event
       FOR VALUES FROM (%L) TO (%L)',
    v_name, v_start, v_end
  );

  RETURN v_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION core.create_audit_partition_for_month(date) IS
  'Create a monthly partition for workflow_audit_event. Returns partition name.';

-- ============================================================================
-- 2. List all existing audit partitions
-- ============================================================================

CREATE OR REPLACE FUNCTION core.list_audit_partitions()
RETURNS TABLE (
  partition_name text,
  range_start   text,
  range_end     text,
  row_count     bigint,
  size_bytes    bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::text AS partition_name,
    pg_get_expr(c.relpartbound, c.oid, true) AS range_start,  -- partition bounds expression
    ''::text AS range_end,  -- extracted from bounds below
    pg_stat_get_live_tuples(c.oid) AS row_count,
    pg_relation_size(c.oid) AS size_bytes
  FROM pg_inherits i
  JOIN pg_class c ON c.oid = i.inhrelid
  JOIN pg_class p ON p.oid = i.inhparent
  JOIN pg_namespace n ON n.oid = p.relnamespace
  WHERE n.nspname = 'core'
    AND p.relname = 'workflow_audit_event'
  ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION core.list_audit_partitions() IS
  'List all partitions of workflow_audit_event with row counts and sizes.';

-- ============================================================================
-- 3. Check for missing indexes on a partition
-- ============================================================================

CREATE OR REPLACE FUNCTION core.check_audit_partition_indexes(p_partition text)
RETURNS TABLE (
  expected_index text,
  exists_  boolean
) AS $$
DECLARE
  v_expected_prefixes text[] := ARRAY[
    'idx_wf_audit_tenant_time',
    'idx_wf_audit_instance',
    'idx_wf_audit_step',
    'idx_wf_audit_correlation',
    'idx_wf_audit_event_type',
    'idx_wf_audit_entity',
    'idx_wf_audit_actor',
    'idx_wf_audit_template',
    'idx_wf_audit_details_gin'
  ];
  v_prefix text;
BEGIN
  FOREACH v_prefix IN ARRAY v_expected_prefixes
  LOOP
    expected_index := v_prefix;
    -- Check if an index starting with this prefix exists on this partition
    SELECT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'core'
        AND tablename = p_partition
        AND indexname LIKE v_prefix || '%'
    ) INTO exists_;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION core.check_audit_partition_indexes(text) IS
  'Check which expected indexes exist on a given audit partition.';
