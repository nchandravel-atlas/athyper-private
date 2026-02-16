# Audit Controls — Compliance Reference

> Last updated: 2026-02-12

## 1. Retention Policy

| Setting | Default | Source | Override |
|---------|---------|--------|----------|
| `retentionDays` | 90 | `config.audit.retentionDays` | Per-tenant via `core.feature_flag` |
| Partition granularity | Monthly | `workflow_event_log` range partitions | N/A |
| Pre-creation window | 3 months | `config.audit.partitionPreCreateMonths` | Per-tenant |

**Retention mechanism**: Daily BullMQ job (`auditPartitionLifecycle.worker`) drops partitions older than `retentionDays`. Uses DDL (`DROP TABLE`) which naturally bypasses the immutability trigger (DML-only protection).

**Outbox cleanup**: Persisted/dead outbox items older than `retentionDays` deleted by `processAuditLogRetention`.

## 2. Tamper Evidence Design

### Hash Chain
- **Algorithm**: `SHA-256(hash_prev + "|" + canonical_payload)`
- **Genesis**: `GENESIS_0000000000000000000000000000000000000000000000000000000000000000`
- **Scope**: Per-tenant chain (each tenant starts from genesis independently)
- **Canonical payload**: Deterministic JSON of `{tenant_id, event_timestamp, instance_id, event_type, actor_user_id, action, entity_id}`
- **Storage**: `hash_prev` and `hash_curr` columns on `core.workflow_event_log`

### Daily Anchors
- Table: `core.hash_anchor` (tenant_id, anchor_date, last_hash, event_count)
- Written daily by `AuditHashChainService.writeAnchor()`
- Enables efficient verification windows without replaying full chain

### Verification
- `AuditHashChainService.verifyChain(tenantId, events)` — replays and validates chain
- Detects: broken chain links, tampered hashes, missing events
- Runtime metric: `audit_hash_chain_discontinuity_total` (alert-worthy)

## 3. Access Control Matrix

| Role | SELECT | INSERT | UPDATE | DELETE | Scope |
|------|--------|--------|--------|--------|-------|
| Application user | Via RLS | Via RLS | Blocked | Blocked | Own tenant only |
| `athyper_admin` | Via RLS | Via RLS | `key_version` only | Blocked | With bypass variable |
| `athyper_retention` | Via RLS | Via RLS | Blocked | Allowed | With bypass variable |
| Table owner | Bypass RLS | Bypass RLS | Bypass RLS | Bypass RLS | All tenants |

### Row-Level Security (RLS)
- Enabled on: `workflow_event_log`, `audit_outbox`, `hash_anchor`, `dlq`
- Policy: `tenant_id = current_setting('athyper.current_tenant')::uuid`
- Set via: `SET LOCAL athyper.current_tenant = '<tenant-uuid>'` (transaction-scoped)

### Application-Level RBAC
- `view_own_events`: See own events only (actor_user_id filter enforced)
- `view_tenant_events`: See all events in tenant (ip_address, user_agent redacted)
- `security_admin`: Full access including PII fields, export, DLQ management

## 4. Field-Level Redaction Rules

### Denylist Keys (always redacted in `details` JSONB)
`password`, `secret`, `token`, `access_token`, `refresh_token`, `id_token`, `authorization`, `cookie`, `api_key`, `apiKey`, `private_key`, `privateKey`, `client_secret`, `clientSecret`, `credentials`, `ssn`, `national_id`, `bank_account`, `credit_card`

### PII Pattern Masking
| Pattern | Example | Masked |
|---------|---------|--------|
| Email | `user@example.com` | `us***@example.com` |
| Phone | `+1234567890123` | `***********0123` |
| IBAN | `DE89370400440532013000` | `DE89***********3000` |

### Taxonomy-Based Redaction
- IP addresses: Partial mask (first 6 chars visible)
- User agents: Truncated to browser family only
- Rules defined per event type in `event-taxonomy.ts`

### Tracking
- `is_redacted`: Boolean flag on each event
- `redaction_version`: Integer tracking which redaction rules version was applied

## 5. Column-Level Encryption

### Algorithm
- **Cipher**: AES-256-GCM (authenticated encryption)
- **IV**: 96-bit random per encryption (NIST recommended)
- **Auth tag**: 128-bit
- **Key derivation**: PBKDF2(master_key, "audit:{tenantId}:{version}", 100K iterations, SHA-512) → 256-bit key

### Encrypted Columns
| Column | Data Type | Example Content |
|--------|-----------|----------------|
| `ip_address` | text | Client IP addresses |
| `user_agent` | text | Browser user agent strings |
| `comment` | text | Approver comments, notes |
| `attachments` | jsonb (serialized) | File attachment metadata |

### Storage Format
```json
{"c":"<base64-ciphertext>","iv":"<base64-iv>","t":"<base64-tag>","v":1}
```

### Key Rotation
- `key_version` column tracks which key encrypted each row
- Key rotation worker (`auditKeyRotation.worker`) batch re-encrypts rows
- Uses immutability bypass with `athyper_admin` role
- Old key versions kept indefinitely for decryption of historical data

### Master Key
- Environment variable: `AUDIT_ENCRYPTION_MASTER_KEY` (min 32 chars)
- Never stored in config files or database
- Tenant isolation: Each tenant derives a unique KEK from the master key + tenant_id salt

## 6. Incident Response Procedures

### Hash Chain Break Detected
1. Alert fires on `audit_hash_chain_discontinuity_total > 0`
2. Identify affected tenant and event range from alert labels
3. Run `AuditHashChainService.verifyChain()` to find exact break point
4. Compare with daily anchors to narrow window
5. Investigate: was it a legitimate system issue or tamper attempt?
6. Document finding in incident report

### DLQ Depth Alert
1. Alert fires on `dlq_depth > 100` (unhealthy) or `> 0` (degraded)
2. List unreplayed DLQ entries via admin API
3. Inspect failure reasons: DB connectivity, schema drift, data corruption
4. Replay once root cause resolved: `AuditDlqManager.bulkReplay()`
5. Monitor: hash chain is reset on replay to ensure consistency

### Encryption Key Compromise
1. Immediately rotate the master key in environment
2. Deploy new key to all application instances
3. Run key rotation worker for each tenant
4. Verify: all rows have new `key_version`
5. Revoke/invalidate old key material

## 7. Evidence SQL Queries

### Verify hash chain for a tenant
```sql
SELECT id, event_type, hash_prev, hash_curr, event_timestamp
FROM core.workflow_event_log
WHERE tenant_id = '<tenant-uuid>'
ORDER BY event_timestamp ASC;
```

### Check for gaps in chain
```sql
WITH ordered AS (
  SELECT id, hash_prev, hash_curr, event_timestamp,
         LAG(hash_curr) OVER (ORDER BY event_timestamp) AS expected_prev
  FROM core.workflow_event_log
  WHERE tenant_id = '<tenant-uuid>'
)
SELECT * FROM ordered
WHERE hash_prev != COALESCE(expected_prev, 'GENESIS_0000000000000000000000000000000000000000000000000000000000000000');
```

### Count redacted events
```sql
SELECT COUNT(*), is_redacted, redaction_version
FROM core.workflow_event_log
WHERE tenant_id = '<tenant-uuid>'
GROUP BY is_redacted, redaction_version;
```

### Check encryption coverage
```sql
SELECT COUNT(*), key_version
FROM core.workflow_event_log
WHERE tenant_id = '<tenant-uuid>'
GROUP BY key_version;
```

### DLQ health
```sql
SELECT COUNT(*), error_category, replayed_at IS NOT NULL AS replayed
FROM core.dlq
WHERE tenant_id = '<tenant-uuid>'
GROUP BY error_category, replayed;
```

### Partition inventory
```sql
SELECT * FROM core.list_audit_partitions();
```
