# Adapter Integration Checklist & Quick Start

## File Structure

All adapter implementations are located in the framework runtime:

```
framework/runtime/src/adapters/
├── db/
│   ├── db.adapter.ts           # Contract + error class
│   ├── db.adapter.impl.ts      # Implementation (Kysely + PgBouncer)
│   └── register.db.ts          # DI registration
├── auth/
│   ├── auth.adapter.ts         # Contract + error class
│   ├── auth.adapter.impl.ts    # Implementation (Keycloak + JWKS)
│   └── register.auth.ts        # DI registration
├── telemetry/
│   ├── telemetry.adapter.ts    # Contract + error class
│   ├── telemetry.adapter.impl.ts # Implementation (Pino + OTel)
│   └── register.telemetry.ts   # DI registration
└── register.adapters.ts        # Central orchestration (calls all three)
```

Updated kernel files:
- `framework/runtime/src/kernel/bootstrap.ts` – Calls `registerAdapters()` after kernel defaults
- `framework/runtime/src/kernel/tokens.ts` – Typed token mappings for adapters

## Quick Start: Using Adapters in Code

### 1. Get Adapters in a Request Handler

```typescript
// Example: API route handler

import { TOKENS } from "@athyper/kernel";
import type { DbAdapter } from "@athyper/runtime/adapters/db/db.adapter";
import type { AuthAdapter } from "@athyper/runtime/adapters/auth/auth.adapter";
import type { TenantContext } from "@athyper/kernel";

export async function handleApiRequest(
  scope: Container,
  tenantCtx: TenantContext
) {
  // Get adapters from DI (all singletons, reused across requests)
  const dbAdapter = await scope.resolve<DbAdapter>(TOKENS.db);
  const authAdapter = await scope.resolve<AuthAdapter>(TOKENS.auth);

  // Get scoped DB instance (applies tenant isolation)
  const db = await dbAdapter.getScopedDb(tenantCtx);

  // Query with automatic search_path isolation
  const users = await db
    .selectFrom("users")
    .select(["id", "email"])
    .execute();

  return { status: 200, data: users };
}
```

### 2. Verify Token & Get Claims

```typescript
import type { AuthAdapter } from "@athyper/runtime/adapters/auth/auth.adapter";

async function verifyUserToken(authAdapter: AuthAdapter, token: string, realmKey: string) {
  try {
    const verifier = await authAdapter.getVerifier(realmKey);
    const claims = await verifier.verify(token);
    
    console.log("[v0] Token verified for user:", claims.sub);
    return claims;
  } catch (err) {
    console.error("[v0] Token verification failed:", err);
    throw err;
  }
}
```

### 3. Access Logging from Telemetry Adapter

```typescript
import type { TelemetryAdapter } from "@athyper/runtime/adapters/telemetry/telemetry.adapter";

async function logRequestMetrics(
  telemetryAdapter: TelemetryAdapter,
  requestId: string,
  duration: number,
  statusCode: number
) {
  const logger = telemetryAdapter.getLogger(requestId);
  
  logger.info(`API request completed`, {
    requestId,
    duration,
    statusCode,
  });
}
```

## Environment Setup

### 1. Database

**PgBouncer** is required for transaction-mode connection pooling:

```bash
# Start PgBouncer (Docker or local)
docker run -d \
  --name pgbouncer \
  --network host \
  -e DATABASES_ATHYPER="host=postgres.local port=5432 dbname=athyper" \
  -e PGBOUNCER_POOL_MODE=transaction \
  pgbouncer/pgbouncer:latest
```

**Configuration** (already in `/mesh/config/pgbouncer.ini`):
- `pool_mode = transaction` – Critical for tenant isolation
- `default_pool_size = 25` – Adjust per workload
- `client_idle_timeout = 600` – Disconnect idle clients

### 2. Keycloak

**Environment variables** required:
```bash
KEYCLOAK_ISSUER_URL=https://keycloak.example.com/realms/main
KEYCLOAK_CLIENT_ID=athyper-api
KEYCLOAK_CLIENT_SECRET=your-secret
```

**Verify JWKS endpoint**:
```bash
curl https://keycloak.example.com/realms/main/protocol/openid-connect/certs
# Should return JSON with "keys" array
```

### 3. Telemetry (Optional)

**For OTel export** (optional but recommended):
```bash
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger.local:4318
OTEL_TRACES_SAMPLER=traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% sampling
```

## NPM Dependencies

Update adapter package.json files:

### DB Adapter

```bash
cd framework/adapters/db
npm install kysely pg
```

### Auth Adapter

```bash
cd framework/adapters/auth
npm install jose
```

### Telemetry Adapter

```bash
cd framework/adapters/telemetry
npm install pino pino-pretty

# Optional: OTel dependencies
npm install --optional @opentelemetry/sdk-node @opentelemetry/exporter-trace-otlp-http
```

## Verification Checklist

### Database Adapter

- [ ] PgBouncer running and listening on port 6432
- [ ] DATABASE_URL points to PgBouncer (not direct Postgres)
- [ ] Test connection: `psql postgresql://athyper:pass@pgbouncer:6432/athyper`
- [ ] Verify transaction mode: `SHOW pool_mode;` in pgbouncer admin console
- [ ] Scoped DB applies search_path: Run getScopedDb() → verify search_path set
- [ ] Pool stats healthy: `SHOW POOLS;` in pgbouncer admin

### Auth Adapter

- [ ] KEYCLOAK_ISSUER_URL reachable
- [ ] JWKS endpoint accessible: `curl $KEYCLOAK_ISSUER_URL/protocol/openid-connect/certs`
- [ ] Valid JWT token can be verified: `authAdapter.getVerifier(realmKey).then(v => v.verify(token))`
- [ ] Warmup succeeds on boot (check logs for verifier initialization)
- [ ] Multiple realms warm up correctly if multi_realm enabled

### Telemetry Adapter

- [ ] Pino logger initializes without errors
- [ ] Logs appear in stdout/stderr
- [ ] Scoped loggers include scopeId in output
- [ ] Shutdown flushes pending logs
- [ ] (Optional) OTel exporter connects to jaeger/otel-collector if OTEL_ENABLED=true

## Tenant Isolation Verification

### Step 1: Verify search_path in PgBouncer

```bash
# Connect via PgBouncer
psql postgresql://athyper:pass@pgbouncer:6432/athyper

# In session:
SET search_path = 'public,tenant_acme';
SHOW search_path;
# Output: public, tenant_acme

SELECT * FROM users;
# Queries resolve to tenant_acme.users
```

### Step 2: Verify Scoped DB Isolation

```typescript
// Pseudo-code verification
const db1 = await dbAdapter.getScopedDb({ realmKey: "main", tenantKey: "acme", ... });
const db2 = await dbAdapter.getScopedDb({ realmKey: "main", tenantKey: "widget", ... });

// db1's search_path points to tenant_acme
// db2's search_path points to tenant_widget
// No cross-tenant queries possible
```

### Step 3: Monitor Pool Health

```bash
# Connect to PgBouncer admin console
psql -p 6432 -U postgres pgbouncer

# Inside admin console:
SHOW POOLS;          # Pool utilization per database
SHOW CLIENTS;        # Connected clients
SHOW STATS;          # Connection statistics
SHOW SERVERS;        # Backend server connections
```

## Troubleshooting

### DB Adapter Issues

**Error: DB_POOL_INIT_FAILED**
- Check DATABASE_URL syntax: `postgresql://user:pass@host:port/dbname`
- Verify PgBouncer is running: `telnet pgbouncer 6432`
- Check PgBouncer logs: `docker logs pgbouncer`

**Error: DB_TENANT_ISOLATION_FAILED**
- Verify tenant schema exists: `psql postgres -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%'"`
- Check if realmKey matches schema names
- Verify search_path syntax

**Slow queries after isolation**
- Check index existence: `\di` in tenant schema
- Verify statistics are up-to-date: `ANALYZE tenant_schema.users`
- Monitor query plans: `EXPLAIN SELECT ...`

### Auth Adapter Issues

**Error: VERIFIER_INIT_FAILED**
- Verify KEYCLOAK_ISSUER_URL: `curl $KEYCLOAK_ISSUER_URL/.well-known/openid-configuration`
- Check network connectivity: `ping keycloak.example.com`
- Verify JWKS endpoint: `curl $KEYCLOAK_ISSUER_URL/protocol/openid-connect/certs`

**Error: JWT_VERIFICATION_FAILED**
- Verify token is valid: `jwt.io` (paste token)
- Check token expiration: decoded `exp` claim
- Verify audience matches KEYCLOAK_CLIENT_ID
- Check token issuer matches KEYCLOAK_ISSUER_URL

### Telemetry Adapter Issues

**Missing logs**
- Check LOG_LEVEL: Set to `debug` to see all logs
- Verify process stderr/stdout not redirected
- In Docker: Check `docker logs <container>`

**OTel exporter fails silently**
- Check OTEL_EXPORTER_OTLP_ENDPOINT reachable: `curl $OTEL_EXPORTER_OTLP_ENDPOINT/v1/traces -X POST`
- Verify jaeger/otel-collector running: `docker ps | grep jaeger`

## Production Deployment

### 1. Secrets Management

Store sensitive values in a secrets manager (not in .env):

```bash
# Recommended: Vercel Environment Variables, AWS Secrets Manager, HashiCorp Vault
KEYCLOAK_CLIENT_SECRET=<from-vault>
S3_SECRET_ACCESS_KEY=<from-vault>
DATABASE_URL=<from-vault>
```

### 2. PgBouncer Tuning

For production workloads:

```ini
[pgbouncer]
max_client_conn = 2000        # Higher for many concurrent requests
default_pool_size = 50        # Increase for higher concurrency
min_pool_size = 10
server_lifetime = 600         # Recycle backend connections
server_idle_timeout = 600
statement_timeout = 30000     # 30s for long queries
idle_in_transaction_session_timeout = 300  # Force-disconnect idle txns
```

### 3. Monitoring

Set up alerts for:
- DB adapter: Pool utilization > 80%, connection errors
- Auth adapter: Token verification failures, JWKS fetch errors
- Telemetry: Log queue depth, flush failures

```typescript
// Example: Monitor pool stats
setInterval(async () => {
  const pool = dbAdapter.getPool();
  const stats = pool._pendingCount;
  if (stats > 0.8 * poolMax) {
    logger.warn("DB pool utilization high", { stats, poolMax });
  }
}, 60000);
```

### 4. Graceful Shutdown

Adapters automatically register shutdown handlers:

```typescript
// When process receives SIGTERM:
// 1. Lifecycle.shutdown() is called
// 2. Each adapter's shutdown() is invoked
// 3. DB pool drained, connections closed
// 4. Telemetry flushes pending spans
// 5. Process exits
```

## Testing Adapters

See test examples in `/ADAPTER_WIRING_GUIDE.md` section 9 for vitest/jest patterns.

Quick test template:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("DbAdapter", () => {
  let adapter: DbAdapter;

  beforeAll(async () => {
    // Initialize adapter
    adapter = await DbAdapterImpl.create(mockConfig, mockLogger);
  });

  afterAll(async () => {
    await adapter.shutdown();
  });

  it("should set search_path for tenant isolation", async () => {
    const db = await adapter.getScopedDb({
      realmKey: "main",
      tenantKey: "test",
      defaults: {},
    });
    const result = await db.raw("SHOW search_path").execute();
    expect(result.rows[0]).toContain("test");
  });
});
```

## Next Steps

1. **Deploy PgBouncer** – Use the config in `/mesh/config/pgbouncer.ini`
2. **Set environment variables** – Use `/mesh/env/.env.example` as template
3. **Run migrations** – `pnpm db:migrate:deploy`
4. **Boot the runtime** – `node -e "import('./bootstrap').then(b => b.bootstrap())"`
5. **Verify health** – Check adapter startup logs and pool stats
6. **Deploy to production** – Use secrets manager, enable OTel tracing

---

For detailed implementation, see `/ADAPTER_WIRING_GUIDE.md`.
