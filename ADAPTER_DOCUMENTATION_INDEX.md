# Athyper Adapters: Complete Documentation Index

## Overview

This documentation provides a **complete, production-ready implementation** of three core adapters for the Athyper runtime:

1. **Database Adapter** – Tenant-aware queries with PgBouncer transaction isolation
2. **Keycloak Auth Adapter** – JWT verification with per-realm JWKS caching
3. **Telemetry Adapter** – Structured logging (Pino) + OpenTelemetry support

All adapters are **fully wired into the kernel's scoped DI model** with robust error handling, graceful lifecycle management, and comprehensive observability.

---

## Documentation Structure

### 🚀 Start Here

**Choose based on your role:**

#### For Engineers Building Features
→ **[`/ADAPTER_QUICK_REFERENCE.md`](./ADAPTER_QUICK_REFERENCE.md)** (5 min read)
- At-a-glance adapter overview
- Resolve & use patterns in code
- Common middleware patterns
- Troubleshooting tips

#### For Architects & Reviewers
→ **[`/ADAPTER_IMPLEMENTATION_SUMMARY.md`](./ADAPTER_IMPLEMENTATION_SUMMARY.md)** (10 min read)
- What was built (high-level)
- Architecture decisions
- Registration flow
- File manifest
- Deployment checklist

#### For DevOps & Platform Engineers
→ **[`/ADAPTER_INTEGRATION_CHECKLIST.md`](./ADAPTER_INTEGRATION_CHECKLIST.md)** (15 min read)
- Environment setup
- NPM dependencies
- Verification checklist
- PgBouncer tuning
- Production deployment
- Monitoring strategies

#### For Deep Technical Understanding
→ **[`/ADAPTER_WIRING_GUIDE.md`](./ADAPTER_WIRING_GUIDE.md)** (30 min read)
- Complete adapter contracts (interfaces)
- Full implementations (code)
- DI registration patterns
- Tenant isolation deep dive
- PgBouncer configuration explained
- Test examples

---

## Document Details

| Document | Audience | Length | Focus |
|----------|----------|--------|-------|
| **Quick Reference** | Engineers | 5 min | Code patterns, quick lookup |
| **Implementation Summary** | Architects | 10 min | What, why, how (overview) |
| **Integration Checklist** | DevOps/QA | 15 min | Setup, verification, deployment |
| **Wiring Guide** | Senior Eng/Tech Lead | 30 min | Complete technical deep dive |

---

## Implementation Files

### Code Location

```
framework/runtime/src/adapters/
├── db/
│   ├── db.adapter.ts                (Contract + error class)
│   ├── db.adapter.impl.ts           (Implementation)
│   └── register.db.ts               (DI registration)
├── auth/
│   ├── auth.adapter.ts              (Contract + error class)
│   ├── auth.adapter.impl.ts         (Implementation)
│   └── register.auth.ts             (DI registration)
├── telemetry/
│   ├── telemetry.adapter.ts         (Contract + error class)
│   ├── telemetry.adapter.impl.ts    (Implementation)
│   └── register.telemetry.ts        (DI registration)
└── register.adapters.ts             (Central orchestration)
```

### Kernel Updates

```
framework/runtime/src/kernel/
├── tokens.ts                        (Added DbAdapter, AuthAdapter, TelemetryAdapter types)
└── bootstrap.ts                     (Added registerAdapters() call)
```

### Configuration

```
project-root/
├── mesh/
│   ├── config/
│   │   └── pgbouncer.ini            (PgBouncer transaction mode config)
│   └── env/
│       └── .env.example             (Environment variables)
```

---

## Key Features

### 1. Tenant Isolation
- **Mechanism**: PgBouncer transaction mode + `SET search_path`
- **Benefit**: Zero-copy schema isolation, no per-tenant databases
- **How it works**: See `/ADAPTER_WIRING_GUIDE.md` Section 8

### 2. Scoped DI
- **Pattern**: Singletons (adapters) + request scope (context)
- **Benefit**: Clean separation of concerns, easy testing
- **How it works**: See `/ADAPTER_WIRING_GUIDE.md` Section 5

### 3. Error Contracts
- **Pattern**: Structured error classes with codes + metadata
- **Benefit**: Centralized error handling, observability
- **Examples**: See `/ADAPTER_QUICK_REFERENCE.md` Error Handling

### 4. Graceful Lifecycle
- **Pattern**: Adapters register shutdown handlers
- **Benefit**: Clean exit on SIGTERM, no orphaned connections
- **How it works**: See `/ADAPTER_INTEGRATION_CHECKLIST.md` Graceful Shutdown

---

## Quick Usage Examples

### Get All Adapters in a Request

```typescript
const dbAdapter = await scope.resolve<DbAdapter>(TOKENS.db);
const authAdapter = await scope.resolve<AuthAdapter>(TOKENS.auth);
const telemetryAdapter = await scope.resolve<TelemetryAdapter>(TOKENS.telemetry);
```

### Query with Tenant Isolation

```typescript
const db = await dbAdapter.getScopedDb(tenantCtx);
const users = await db.selectFrom("users").selectAll().execute();
// Automatically isolated to tenant's schema via search_path
```

### Verify JWT Token

```typescript
const verifier = await authAdapter.getVerifier(tenantCtx.realmKey);
const claims = await verifier.verify(jwtToken);
```

### Log with Correlation ID

```typescript
const logger = telemetryAdapter.getLogger(requestId);
logger.info("Request processed", { duration, statusCode });
```

---

## Environment Variables

**Minimal setup** (copy from `/mesh/env/.env.example`):

```bash
# Database
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/athyper
DATABASE_POOL_MAX=25

# Auth
KEYCLOAK_ISSUER_URL=https://keycloak.example.com/realms/main
KEYCLOAK_CLIENT_ID=athyper-api
KEYCLOAK_CLIENT_SECRET=secret

# Logging
LOG_LEVEL=info

# Telemetry (optional)
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318

# Multi-Tenancy
IAM_STRATEGY=single_realm
IAM_DEFAULT_REALM_KEY=main
IAM_DEFAULT_TENANT_KEY=default
```

---

## Dependencies

### Database Adapter
```json
{
  "kysely": "^0.27.4",
  "pg": "^8.13.0"
}
```

### Auth Adapter
```json
{
  "jose": "^5.9.0"
}
```

### Telemetry Adapter
```json
{
  "pino": "^9.4.0",
  "pino-pretty": "^10.2.0"
}
```

### Optional (OTel)
```json
{
  "@opentelemetry/sdk-node": "^0.53.0",
  "@opentelemetry/exporter-trace-otlp-http": "^0.53.0"
}
```

---

## Verification Checklist

**Pre-deployment verification**:

- [ ] PgBouncer: `pool_mode = transaction`, listening on port 6432
- [ ] Database: Tenant schemas exist (`tenant_acme`, `tenant_widget`, etc.)
- [ ] Keycloak: JWKS endpoint reachable and returns keys
- [ ] Auth: Token verification works with valid JWT
- [ ] DB: Scoped DB applies search_path correctly
- [ ] Telemetry: Logs appear in stdout or OTel collector
- [ ] Pool: `SHOW POOLS;` shows healthy connection distribution
- [ ] Shutdown: SIGTERM → graceful exit in < 15s

Full checklist: See `/ADAPTER_INTEGRATION_CHECKLIST.md`

---

## Production Deployment

### PgBouncer (Separate Service)
```yaml
services:
  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    ports:
      - "6432:6432"
    environment:
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_DEFAULT_POOL_SIZE: "50"
    volumes:
      - ./pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini
```

### App (Kubernetes)
```yaml
spec:
  terminationGracePeriodSeconds: 30
  containers:
  - name: athyper-api
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: adapters
          key: database-url
    - name: KEYCLOAK_CLIENT_SECRET
      valueFrom:
        secretKeyRef:
          name: adapters
          key: keycloak-secret
```

### Monitoring
- Pool utilization: Alert if > 80%
- Auth errors: Alert if > 10/min
- Log queue: Alert if depth > 1000
- Graceful shutdown: Alert if > 15s

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Application                          │
│  (Express Routes, API Handlers, etc.)                       │
└────────────┬──────────────────┬──────────────────┬──────────┘
             │                  │                  │
             ▼                  ▼                  ▼
        ┌─────────┐        ┌─────────┐      ┌──────────────┐
        │ DB      │        │ Auth    │      │ Telemetry    │
        │ Adapter │        │ Adapter │      │ Adapter      │
        └────┬────┘        └────┬────┘      └──────┬───────┘
             │                  │                  │
             ▼                  ▼                  ▼
        ┌─────────┐        ┌─────────┐      ┌──────────────┐
        │Kysely   │        │JWKS     │      │Pino Logger   │
        │Pool     │        │Cache    │      │+ OTel        │
        │(Singleton)        │(Singleton)    │(Singleton)   │
        └────┬────┘        └────┬────┘      └──────┬───────┘
             │                  │                  │
             ▼                  ▼                  ▼
        ┌─────────────────┬────────────┬───────────────────┐
        │   PgBouncer     │ Keycloak   │ Jaeger/Collector  │
        │ (Transaction    │ (OIDC)     │ (Traces/Metrics)  │
        │  Mode)          │            │                   │
        └────────┬────────┴────────────┴───────────────────┘
                 │
        ┌────────▼────────┐
        │  Postgres DB    │
        │  (Multi-schema) │
        └─────────────────┘
```

---

## FAQ

**Q: Do I need all three adapters?**
A: Adapters are optional. You can use custom implementations by swapping the token factory. DB adapter is strongly recommended for multi-tenant apps.

**Q: How do I add a cache adapter?**
A: Create `framework/runtime/src/adapters/cache/` following the same pattern (contract + impl + register). Add to `register.adapters.ts`.

**Q: Can I use a different database (e.g., MongoDB)?**
A: Yes. Implement `DbAdapter` interface and swap the factory in `register.db.ts`. Tenant isolation mechanism would differ.

**Q: What if Keycloak is down?**
A: JWKS verifiers cache for ~5 min. Requests will fail with `VERIFIER_INIT_FAILED` on first attempt. Retry after Keycloak is back.

**Q: How do I scale to multiple app instances?**
A: All instances connect to the same PgBouncer → single DB pool. PgBouncer handles multiplexing. Deploy PgBouncer separately.

---

## Support & Troubleshooting

### Common Issues

**Tenant queries hitting public schema:**
- Check: PgBouncer running? `pool_mode = transaction`? search_path set? See: `/ADAPTER_INTEGRATION_CHECKLIST.md` Troubleshooting

**Token verification fails:**
- Check: Keycloak reachable? JWKS endpoint up? Token not expired? See: `/ADAPTER_INTEGRATION_CHECKLIST.md` Auth Adapter Issues

**Missing logs:**
- Check: LOG_LEVEL appropriate? Process stdout not redirected? See: `/ADAPTER_INTEGRATION_CHECKLIST.md` Telemetry Issues

Full troubleshooting: See `/ADAPTER_INTEGRATION_CHECKLIST.md` Troubleshooting section

---

## Next Steps

1. **Read appropriate docs** based on your role (see Start Here section)
2. **Copy configuration** from `/mesh/env/.env.example`
3. **Deploy PgBouncer** using `/mesh/config/pgbouncer.ini`
4. **Run tests** to verify adapter implementations
5. **Integrate adapters** into API routes (see Usage Examples)
6. **Deploy to staging** with monitoring enabled
7. **Monitor production** per checklist

---

## Document Versions

- **Version**: 1.0
- **Last Updated**: 2026-02-01
- **Status**: Production Ready
- **Files**: 9 implementation files + 4 documentation files

---

## Credits

Designed and implemented for Athyper's enterprise platform engineering framework.

- **Architecture**: Kernel + Scoped DI + Stable tokens
- **Pattern**: Adapter contracts + swappable implementations
- **Tenant Isolation**: PgBouncer transaction mode + schema search_path
- **Observability**: Structured errors + OTel-ready logging

---

## Related Projects

- **Core Framework**: `framework/` (kernel, runtimes, services)
- **Database**: `framework/adapters/db/` (Prisma schema, migrations, seed)
- **Auth**: `framework/adapters/auth/` (Keycloak integration)
- **Business Services**: `framework/runtime/src/services/` (40+ modules)

---

## Quick Links

| Link | Purpose |
|------|---------|
| `/ADAPTER_QUICK_REFERENCE.md` | 5-min overview for engineers |
| `/ADAPTER_IMPLEMENTATION_SUMMARY.md` | 10-min summary for architects |
| `/ADAPTER_INTEGRATION_CHECKLIST.md` | 15-min setup for DevOps |
| `/ADAPTER_WIRING_GUIDE.md` | 30-min deep dive for tech leads |
| `framework/runtime/src/adapters/` | Implementation code |
| `mesh/config/pgbouncer.ini` | PgBouncer config |
| `mesh/env/.env.example` | Environment variables |

---

**Ready to deploy?** Start with `/ADAPTER_QUICK_REFERENCE.md` → `/ADAPTER_INTEGRATION_CHECKLIST.md` → Deploy! 🚀
