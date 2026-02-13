# Audit Data Flow — End-to-End Architecture

> Last updated: 2026-02-12

## Data Flow Diagram

```
┌─────────────────┐
│ Workflow Engine  │
│ (event source)  │
└────────┬────────┘
         │ write(tenantId, event)
         ▼
┌─────────────────────────────────────────────┐
│          ResilientAuditWriter               │
│                                             │
│  1. Feature Flag Check (off/sync/outbox)    │
│  2. Redaction Pipeline (denylist + PII)     │
│  3. Hash Chain (SHA-256 tamper evidence)    │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │ Mode: "off"  → drop + metric        │   │
│  │ Mode: "sync" → direct DB write      │   │
│  │ Mode: "outbox" → async outbox path  │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  Circuit Breaker → Memory Buffer (fallback) │
└──────────────┬──────────────────────────────┘
               │ enqueue
               ▼
┌──────────────────────────┐
│    core.audit_outbox     │
│  (async buffer table)    │
│  status: pending/failed  │
└──────────────┬───────────┘
               │ drain (BullMQ worker, concurrency=2)
               ▼
┌──────────────────────────────────────────────┐
│         drainAuditOutbox.worker              │
│                                              │
│  1. Pick pending items (batch of 50)         │
│  2. Write to workflow_audit_event via repo   │
│  3. Encrypt columns if enabled               │
│  4. Mark outbox entry as "persisted"         │
│  5. On failure: retry with backoff           │
│  6. On dead: move to DLQ                     │
└──────────────┬───────────────────────────────┘
               │
         ┌─────┴─────┐
         ▼           ▼
┌────────────┐ ┌──────────────┐
│  Success   │ │   Failure    │
│            │ │ (exhausted)  │
└─────┬──────┘ └──────┬───────┘
      │               │ moveToDlq()
      ▼               ▼
┌──────────────┐ ┌──────────────┐
│ workflow_    │ │ core.        │
│ audit_event  │ │ audit_dlq    │
│ (partitioned)│ │ (dead letter)│
└──────┬───────┘ └──────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         Read Path (multiple consumers)   │
│                                          │
│  • Activity Timeline (UNION ALL 5 tables)│
│  • Instance Audit Trail (single entity)  │
│  • Compliance Reports (aggregation)      │
│  • NDJSON Export (WORM to object storage)│
│                                          │
│  All reads go through:                   │
│    1. AuditQueryPolicyGate (RBAC)        │
│    2. Column decryption (if encrypted)   │
│    3. Field redaction (per role)          │
│    4. Audit-of-audit logging             │
└──────────────────────────────────────────┘
```

## Encryption at Rest

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| Disk encryption | PostgreSQL `data_directory` on encrypted volume | All data |
| Column encryption | AES-256-GCM per-tenant keys | ip_address, user_agent, comment, attachments |
| Object storage | S3 server-side encryption (SSE-S3 or SSE-KMS) | Audit exports |

## Encryption in Transit

| Path | Protocol | Notes |
|------|----------|-------|
| App → PostgreSQL | TLS 1.3 (require-ssl) | Enforced in connection string |
| App → Redis | TLS 1.3 (if deployed) | Session cache, timeline cache |
| App → S3 | HTTPS (TLS 1.3) | Audit exports |
| Client → App | HTTPS (TLS 1.2+) | API layer |

## Key Management Lifecycle

```
Master Key (env: AUDIT_ENCRYPTION_MASTER_KEY)
  │
  ├── PBKDF2(master, "audit:tenant-a:1", 100K, SHA-512) → KEK_a_v1
  ├── PBKDF2(master, "audit:tenant-a:2", 100K, SHA-512) → KEK_a_v2
  ├── PBKDF2(master, "audit:tenant-b:1", 100K, SHA-512) → KEK_b_v1
  └── ...
```

### Rotation Flow
1. Call `TenantKeyProvider.rotateKek(tenantId)` → increments version
2. New writes use the new key version
3. `auditKeyRotation.worker` batch re-encrypts old rows:
   - Query: `WHERE tenant_id = ? AND key_version = ?` (old version)
   - Transaction: `SET LOCAL athyper.audit_retention_bypass = 'true'`
   - Decrypt with old key → re-encrypt with new key → UPDATE row
4. Verify: `SELECT COUNT(*) ... GROUP BY key_version` shows all rows on new version

### Key Hierarchy
```
Level 0: Master Key (environment variable, 256+ bits)
Level 1: Tenant KEK (derived, 256 bits, versioned)
Level 2: Per-row IV (random, 96 bits, stored alongside ciphertext)
```

## Feature Flag Architecture

```
┌─────────────────────────────────┐
│    core.feature_flag (DB)       │
│  ┌───────────────────────────┐  │
│  │ AUDIT_WRITE_MODE: outbox  │  │
│  │ AUDIT_HASHCHAIN: true     │  │
│  │ AUDIT_TIMELINE: true      │  │
│  │ AUDIT_ENCRYPTION: false   │  │
│  └───────────────────────────┘  │
└────────────────┬────────────────┘
                 │ resolve(tenantId)
                 ▼
┌─────────────────────────────────┐
│   AuditFeatureFlagResolver      │
│                                 │
│   DB override → Config default  │
│   In-memory cache (30s TTL)     │
│   invalidateCache(tenantId)     │
└─────────────────────────────────┘
```

## Observability

| Metric | Type | Alert Threshold |
|--------|------|----------------|
| `audit_events_ingested_total` | Counter | N/A (rate monitoring) |
| `audit_events_persisted_total` | Counter | N/A |
| `audit_events_dropped_total` | Counter | > 0 → investigate |
| `audit_events_buffered_total` | Counter | > 0 → circuit open |
| `audit_memory_buffer_depth` | Gauge | > 0 → degraded |
| `audit_outbox_lag` | Gauge | > 50K → unhealthy |
| `audit_outbox_dead` | Gauge | > 100 → degraded |
| `audit_dlq_depth` | Gauge | > 0 → degraded, > 100 → unhealthy |
| `audit_hash_chain_discontinuity_total` | Counter | > 0 → alert |
| `audit_insert_latency_ms` | Histogram | p95 > 100ms → investigate |
| `audit_outbox_lag_seconds` | Gauge | > 300s → investigate |
