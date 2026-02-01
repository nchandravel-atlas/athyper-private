# Athyper Runtime Adapters

> Complete, production-ready adapter layer for tenant-aware database, Keycloak authentication, and OpenTelemetry observability.

## Overview

This directory contains three fully-wired adapters integrated with Athyper's kernel **scoped DI model**:

| Adapter | Token | Purpose |
|---------|-------|---------|
| **DB** | `TOKENS.db` | Tenant-aware queries via PgBouncer transaction mode |
| **Auth** | `TOKENS.auth` | JWT verification with per-realm JWKS caching |
| **Telemetry** | `TOKENS.telemetry` | Structured logging + OpenTelemetry support |

## Quick Start

### 1. Resolve Adapter

```typescript
import { TOKENS } from "@athyper/kernel";
import type { DbAdapter } from "@athyper/runtime/adapters/db/db.adapter";

const dbAdapter = await scope.resolve<DbAdapter>(TOKENS.db);
```

### 2. Use Adapter

```typescript
// Tenant-isolated DB queries
const db = await dbAdapter.getScopedDb(tenantCtx);
const users = await db.selectFrom("users").selectAll().execute();

// Auth: Verify JWT token
const authAdapter = await scope.resolve<AuthAdapter>(TOKENS.auth);
const verifier = await authAdapter.getVerifier(tenantCtx.realmKey);
const claims = await verifier.verify(jwtToken);

// Telemetry: Log with correlation ID
const telemetry = await scope.resolve<TelemetryAdapter>(TOKENS.telemetry);
const logger = telemetry.getLogger(requestId);
logger.info("Request processed", { duration, statusCode });
```

## Directory Structure

```
adapters/
├── db/                              Tenant-aware database queries
│   ├── db.adapter.ts               Contract interface
│   ├── db.adapter.impl.ts          Implementation (Kysely + PgBouncer)
│   └── register.db.ts              DI registration factory
├── auth/                            JWT verification with JWKS caching
│   ├── auth.adapter.ts             Contract interface
│   ├── auth.adapter.impl.ts        Implementation (Keycloak + Jose)
│   └── register.auth.ts            DI registration factory
├── telemetry/                       Structured logging + OTel
│   ├── telemetry.adapter.ts        Contract interface
│   ├── telemetry.adapter.impl.ts   Implementation (Pino + OTel)
│   └── register.telemetry.ts       DI registration factory
└── register.adapters.ts            Central orchestration
```

## Key Features

### ✅ Tenant Isolation
- **Mechanism**: PgBouncer transaction mode + `SET search_path`
- **Benefit**: Zero-copy schema isolation, no per-tenant databases
- **Example**: Queries to `users` resolve to `tenant_acme.users` or `tenant_widget.users` based on search_path

### ✅ Scoped DI
- **Pattern**: Singletons (adapters) + request scope (context)
- **Benefit**: Clean separation, easy testing, zero coupling

### ✅ Error Contracts
- **Pattern**: Structured error classes with codes + metadata
- **Benefit**: Centralized error handling, observability

### ✅ Graceful Lifecycle
- **Pattern**: Adapters register shutdown handlers
- **Benefit**: Clean exit on SIGTERM, no orphaned connections

## Adapter Details

### Database Adapter

**File**: `db/`

```typescript
interface DbAdapter {
  getScopedDb(tenantCtx: TenantContext): Promise<Kysely<DB>>;
  getPool(): any;
  shutdown(): Promise<void>;
}
```

- **Implementation**: Kysely query builder + pg driver
- **Pooling**: PgBouncer (separate service)
- **Tenant Isolation**: `SET search_path = 'public,{realmKey}'` per transaction
- **Error Class**: `DbAdapterError` with codes like `DB_POOL_INIT_FAILED`

**Usage**:
```typescript
const db = await dbAdapter.getScopedDb({ realmKey: "main", tenantKey: "acme" });
const users = await db.selectFrom("users").selectAll().execute();
```

### Auth Adapter

**File**: `auth/`

```typescript
interface AuthAdapter {
  getVerifier(realmKey: string): Promise<AuthVerifier>;
  warmupRealms(realmKeys: string[]): Promise<void>;
  invalidateRealm(realmKey: string): void;
}
```

- **Implementation**: Keycloak JWKS + jose JWT verification
- **Caching**: Per-realm verifier cache (JWKS fetched once)
- **Warmup**: All realms initialized on boot
- **Error Class**: `AuthAdapterError` with codes like `JWT_VERIFICATION_FAILED`

**Usage**:
```typescript
const verifier = await authAdapter.getVerifier("main");
const claims = await verifier.verify(jwtToken);
```

### Telemetry Adapter

**File**: `telemetry/`

```typescript
interface TelemetryAdapter {
  getLogger(scopeId: string): TelemetryLogger;
  flush(): Promise<void>;
  shutdown(): Promise<void>;
}
```

- **Implementation**: Pino structured logging + optional OTel exporter
- **Scoping**: Each request gets logger with correlation ID
- **OTel**: Ready for traces/metrics export to jaeger/collector
- **Error Class**: `TelemetryAdapterError` with codes like `OTEL_INIT_FAILED`

**Usage**:
```typescript
const logger = telemetryAdapter.getLogger(requestId);
logger.info("Request completed", { duration, statusCode });
```

## Configuration

### Environment Variables (see `/mesh/env/.env.example`)

```bash
# Database
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/athyper
DATABASE_POOL_MAX=25

# Auth
KEYCLOAK_ISSUER_URL=https://keycloak.example.com/realms/main
KEYCLOAK_CLIENT_ID=athyper-api
KEYCLOAK_CLIENT_SECRET=secret

# Telemetry
LOG_LEVEL=info
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318
```

### PgBouncer Configuration (see `/mesh/config/pgbouncer.ini`)

```ini
[pgbouncer]
pool_mode = transaction              # Critical for tenant isolation
default_pool_size = 25               # Adjust per workload
max_client_conn = 1000
```

## Registration

Adapters are automatically registered during bootstrap:

```typescript
// In framework/runtime/src/kernel/bootstrap.ts

const container = createKernelContainer();
registerKernelDefaults(container, config);

await registerAdapters(container);  // ← Registers all three adapters

const logger = await container.resolve(TOKENS.logger);
// ... rest of bootstrap
```

Each adapter's `register.ts` function is called in order:
1. `registerTelemetryAdapter()` – Logging setup
2. `registerAuthAdapter()` – JWKS warmup
3. `registerDbAdapter()` – Pool initialization

## Error Handling

All adapters throw structured errors with diagnostic metadata:

```typescript
import { DbAdapterError } from "./db/db.adapter";
import { AuthAdapterError } from "./auth/auth.adapter";
import { TelemetryAdapterError } from "./telemetry/telemetry.adapter";

try {
  const db = await dbAdapter.getScopedDb(tenantCtx);
} catch (err) {
  if (err instanceof DbAdapterError) {
    console.error(err.code);        // "DB_POOL_INIT_FAILED"
    console.error(err.meta);        // { originalError: "..." }
  }
}
```

## Lifecycle Management

Adapters register shutdown handlers automatically:

```typescript
// On SIGTERM:
// 1. Lifecycle.shutdown() called
// 2. Each adapter's shutdown() invoked
// 3. DB pool drained, connections closed
// 4. Telemetry flushes pending spans
// 5. Process exits
```

## Dependencies

### Database Adapter
- `kysely@^0.27.4` – Query builder
- `pg@^8.13.0` – PostgreSQL driver

### Auth Adapter
- `jose@^5.9.0` – JWT verification + JWKS

### Telemetry Adapter
- `pino@^9.4.0` – Structured logging
- `pino-pretty@^10.2.0` – Pretty printing (optional)

### Optional (OpenTelemetry)
- `@opentelemetry/sdk-node@^0.53.0`
- `@opentelemetry/exporter-trace-otlp-http@^0.53.0`

## Testing

See test templates in `/ADAPTER_WIRING_GUIDE.md` Section 9.

Quick example:
```typescript
import { describe, it, expect } from "vitest";

describe("DbAdapter", () => {
  it("should set search_path for tenant isolation", async () => {
    const db = await adapter.getScopedDb({
      realmKey: "main",
      tenantKey: "test"
    });
    const result = await db.raw("SHOW search_path").execute();
    expect(result.rows[0]).toContain("test");
  });
});
```

## Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| `/ADAPTER_QUICK_REFERENCE.md` | 5-min overview | Engineers |
| `/ADAPTER_IMPLEMENTATION_SUMMARY.md` | 10-min summary | Architects |
| `/ADAPTER_INTEGRATION_CHECKLIST.md` | 15-min deployment | DevOps |
| `/ADAPTER_WIRING_GUIDE.md` | 30-min deep dive | Tech Leads |
| `/ADAPTER_DOCUMENTATION_INDEX.md` | Navigation | Everyone |

## Production Checklist

- [ ] PgBouncer: `pool_mode = transaction`, listening on port 6432
- [ ] Database: Tenant schemas exist (`tenant_acme`, `tenant_widget`, etc.)
- [ ] Keycloak: JWKS endpoint reachable
- [ ] Auth: Token verification works
- [ ] DB: Scoped DB applies search_path
- [ ] Telemetry: Logs appear or OTel exporting
- [ ] Pool: `SHOW POOLS;` shows healthy distribution
- [ ] Shutdown: SIGTERM → graceful exit in < 15s

## Examples

### Middleware: Auth + Tenant Verification

```typescript
app.use(async (req, res, next) => {
  const tenantCtx = resolveContextFromRequest(config, req);
  const scope = container.createScope();
  
  const authAdapter = await scope.resolve<AuthAdapter>(TOKENS.auth);
  const verifier = await authAdapter.getVerifier(tenantCtx.realmKey);
  const claims = await verifier.verify(req.headers.authorization?.split(" ")[1]);
  
  req.user = claims;
  req.tenantCtx = tenantCtx;
  req.scope = scope;
  
  next();
});
```

### Route: Query with Tenant Isolation

```typescript
app.get("/users", async (req, res) => {
  const dbAdapter = await req.scope.resolve<DbAdapter>(TOKENS.db);
  const db = await dbAdapter.getScopedDb(req.tenantCtx);
  
  const users = await db.selectFrom("users").selectAll().execute();
  
  res.json(users);
});
```

### Logging: Scoped Logger

```typescript
app.use((req, res, next) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const telemetry = await container.resolve<TelemetryAdapter>(TOKENS.telemetry);
  const logger = telemetry.getLogger(requestId);
  
  logger.info("Request received", { method: req.method });
  next();
});
```

## Troubleshooting

**DB queries hitting public schema:**
- PgBouncer running? `pool_mode = transaction`?
- search_path set? Check `/ADAPTER_INTEGRATION_CHECKLIST.md` Troubleshooting

**Token verification fails:**
- Keycloak reachable? JWKS endpoint up?
- See `/ADAPTER_INTEGRATION_CHECKLIST.md` Auth Issues

**Missing logs:**
- LOG_LEVEL appropriate? Process stdout redirected?
- See `/ADAPTER_INTEGRATION_CHECKLIST.md` Telemetry Issues

## Related

- **Kernel**: `framework/runtime/src/kernel/` (DI, bootstrap)
- **Services**: `framework/runtime/src/services/` (business logic)
- **Database**: `framework/adapters/db/` (Prisma schema, migrations)

## License

Athyper Platform Engineering Framework © 2026

---

**Ready to deploy?** See `/ADAPTER_INTEGRATION_CHECKLIST.md` for setup instructions.
