# Audit Go-Live Verification Checklist

> Use this checklist before enabling audit in production.
> Each section must be verified and signed off.

## Pre-Flight: Infrastructure

- [ ] **Partition existence**: Verify partitions exist for current + 3 months ahead
  ```sql
  SELECT * FROM core.list_audit_partitions();
  -- Expected: 4+ partitions with correct date ranges
  ```

- [ ] **Immutability triggers**: Verify triggers are attached to all 5 tables
  ```sql
  SELECT tgname, tgrelid::regclass
  FROM pg_trigger
  WHERE tgfoid = (SELECT oid FROM pg_proc WHERE proname = 'prevent_audit_mutation');
  -- Expected: 5 triggers (workflow_audit_event, audit_log, permission_decision_log, field_access_log, security_event)
  ```

- [ ] **RLS policies**: Verify RLS enabled and policies exist
  ```sql
  SELECT relname, relrowsecurity
  FROM pg_class
  WHERE relname IN ('workflow_audit_event', 'audit_outbox', 'audit_hash_anchor', 'audit_dlq')
    AND relnamespace = 'core'::regnamespace;
  -- Expected: relrowsecurity = true for all 4
  ```

- [ ] **DB roles**: Verify dedicated roles exist
  ```sql
  SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname IN ('athyper_retention', 'athyper_admin');
  -- Expected: 2 roles, both rolcanlogin = false
  ```

- [ ] **Feature flags**: Verify default flags in config
  ```sql
  SELECT flag_key, is_enabled, config
  FROM core.feature_flag
  WHERE flag_key LIKE 'AUDIT_%';
  -- Verify: AUDIT_WRITE_MODE = outbox, AUDIT_HASHCHAIN = enabled
  ```

- [ ] **Encryption key**: If encryption enabled, verify master key is set
  ```bash
  # On each application node:
  echo $AUDIT_ENCRYPTION_MASTER_KEY | wc -c
  # Expected: 33+ (32 chars + newline)
  ```

- [ ] **Index coverage**: Verify covering indexes for timeline
  ```sql
  SELECT indexname FROM pg_indexes
  WHERE schemaname = 'core'
    AND indexname LIKE 'idx_%_timeline%';
  -- Expected: 7+ timeline indexes
  ```

## Functional: Write Path

- [ ] **Write event (outbox mode)**: Enqueue an audit event and verify it reaches the outbox
  ```sql
  -- After triggering a workflow action:
  SELECT COUNT(*) FROM core.audit_outbox WHERE status = 'pending';
  -- Expected: > 0 (pending items waiting to be drained)
  ```

- [ ] **Drain worker**: Verify drain worker processes pending outbox items
  ```sql
  -- Wait 10 seconds, then:
  SELECT COUNT(*) FROM core.workflow_audit_event WHERE tenant_id = '<tenant>';
  -- Expected: > 0 (events persisted from outbox)
  ```

- [ ] **Hash chain**: Verify first event has GENESIS hash_prev
  ```sql
  SELECT hash_prev, hash_curr
  FROM core.workflow_audit_event
  WHERE tenant_id = '<tenant>'
  ORDER BY event_timestamp ASC
  LIMIT 1;
  -- Expected: hash_prev = 'GENESIS_000...', hash_curr = 64-char hex
  ```

- [ ] **Redaction**: Verify sensitive fields are redacted
  ```sql
  SELECT id, is_redacted, redaction_version
  FROM core.workflow_audit_event
  WHERE tenant_id = '<tenant>' AND is_redacted = true
  LIMIT 5;
  ```

- [ ] **Toggle flags**: Set writeMode to "off", send event, verify dropped
  ```sql
  INSERT INTO core.feature_flag (id, tenant_id, flag_key, is_enabled, config)
  VALUES (gen_random_uuid(), '<tenant>', 'AUDIT_WRITE_MODE', false, '{}');
  -- Trigger workflow action → verify NO new audit events
  -- Then delete the flag to restore normal operation
  ```

## Functional: Read Path

- [ ] **Activity Timeline**: Query timeline and verify events from multiple sources
  ```sql
  -- Via API: GET /api/audit/timeline?entityType=PO&entityId=<id>
  -- Expected: events from workflow_audit, permission_decision, audit_log, etc.
  ```

- [ ] **Instance Audit Trail**: Query full workflow instance trail
  ```sql
  -- Via API: GET /api/audit/trail/<instanceId>
  -- Expected: chronological events with step summaries
  ```

- [ ] **DLQ management**: Verify DLQ admin endpoints work
  ```sql
  -- Via API: GET /api/admin/audit/dlq?tenant=<tenantId>
  -- Expected: 200 OK with empty or populated list
  ```

- [ ] **Export**: Trigger NDJSON export and verify in object storage
  ```bash
  # Via API: POST /api/admin/audit/export { startDate, endDate }
  # Verify: .ndjson and .manifest.json files in S3 bucket
  ```

## Chaos: Resilience

- [ ] **DB unavailable → buffer → recover**
  1. Stop PostgreSQL
  2. Trigger 5 workflow actions
  3. Verify memory buffer depth > 0 (health check shows "degraded")
  4. Start PostgreSQL
  5. Trigger `flushBuffer()` or wait for automatic flush
  6. Verify all 5 events eventually persisted
  7. Health check returns "healthy"

- [ ] **Outbox backlog → degraded health**
  1. Pause drain worker
  2. Enqueue 100+ audit events
  3. Verify health check shows "degraded" (outbox lag > 10K)
  4. Resume drain worker
  5. Verify health returns to "healthy"

- [ ] **Rate limit exceeded**
  1. Send 600+ events for one tenant within 60 seconds
  2. Verify rate limiter triggers (events queued or rejected)
  3. Verify other tenants unaffected

- [ ] **DLQ replay**
  1. Create a deliberately failing outbox entry (corrupt payload)
  2. Let drain worker exhaust retries → entry moves to DLQ
  3. Fix the entry payload
  4. Replay via admin API
  5. Verify event persisted to workflow_audit_event

## Integrity: Hash Chain

- [ ] **100-event chain verification**
  1. Generate 100 audit events for one tenant
  2. Query all events ordered by timestamp
  3. Run `AuditHashChainService.verifyChain()` → should return `valid: true`

- [ ] **Tamper detection**
  1. Manually UPDATE one event's `hash_curr` (with bypass)
  2. Run `verifyChain()` → should detect break at tampered event
  3. Restore original hash

- [ ] **Daily anchor check**
  1. Run `AuditHashChainService.writeAnchor()` for today
  2. Verify anchor row in `core.audit_hash_anchor`
  3. Verify `last_hash` matches latest event's `hash_curr`

## Performance: Timeline

- [ ] **Timeline < 200ms p95 with 10K events**
  1. Seed 10,000 audit events across 5 tables for one tenant
  2. Query timeline: `GET /api/audit/timeline?entityType=PO&entityId=<id>`
  3. Measure response time — must be < 200ms at p95
  4. If slow: check covering indexes, enable timeline cache

- [ ] **Cache hit rate**
  1. Query same timeline twice within 60s
  2. Second query should be < 10ms (cache hit)
  3. Verify cache backend is "redis" in production

## Encryption (if enabled)

- [ ] **Encrypt on write**: Insert event with `comment` and `ip_address`
  ```sql
  SELECT comment, ip_address, key_version
  FROM core.workflow_audit_event
  WHERE tenant_id = '<tenant>'
  ORDER BY created_at DESC LIMIT 1;
  -- Expected: comment and ip_address contain JSON-encoded encrypted payloads, key_version = 1
  ```

- [ ] **Decrypt on read**: Query the same event via API
  ```bash
  # Expected: comment and ipAddress returned as plaintext
  ```

- [ ] **Tenant isolation**: Events encrypted with different tenant cannot be decrypted
  ```sql
  -- Take encrypted ip_address from tenant-A, try decrypting as tenant-B
  -- Expected: authentication tag mismatch error
  ```

- [ ] **Key rotation**: Rotate key and re-encrypt
  1. Call `TenantKeyProvider.rotateKek(tenantId)` → returns version 2
  2. New writes get `key_version = 2`
  3. Run key rotation worker for old version
  4. Verify: `SELECT COUNT(*) WHERE key_version = 1` → 0

## Sign-Off

| Checkpoint | Verified By | Date |
|-----------|-------------|------|
| Pre-flight infrastructure | | |
| Functional write path | | |
| Functional read path | | |
| Chaos resilience | | |
| Hash chain integrity | | |
| Timeline performance | | |
| Encryption (if enabled) | | |
