# Adapter Quick Reference Card

## At-a-Glance

| Adapter | Purpose | Token | Contract | Key Method |
|---------|---------|-------|----------|------------|
| **DB** | Tenant-aware queries | `TOKENS.db` | `DbAdapter` | `getScopedDb(tenantCtx)` |
| **Auth** | JWT verification | `TOKENS.auth` | `AuthAdapter` | `getVerifier(realmKey).verify(token)` |
| **Telemetry** | Structured logging | `TOKENS.telemetry` | `TelemetryAdapter` | `getLogger(scopeId).info(msg, meta)` |

---

## Resolve Adapters in Code

```typescript
// Get adapters from any scope (scoped or root)
const dbAdapter = await scope.resolve<DbAdapter>(TOKENS.db);
const authAdapter = await scope.resolve<AuthAdapter>(TOKENS.auth);
const telemetryAdapter = await scope.resolve<TelemetryAdapter>(TOKENS.telemetry);
```

---

## DB Adapter Workflow

```typescript
// 1. Get adapter (singleton)
const dbAdapter = await scope.resolve<DbAdapter>(TOKENS.db);

// 2. Get scoped DB (applies tenant isolation)
const db = await dbAdapter.getScopedDb(tenantCtx);
// → Internally: SET search_path = 'public,{realmKey}'

// 3. Query (automatic tenant isolation)
const users = await db.selectFrom("users").selectAll().execute();
// → Resolves to {realmKey}.users via search_path

// 4. Shutdown (automatic)
// → On SIGTERM: adapter.shutdown() drains pool
```

---

## Auth Adapter Workflow

```typescript
// 1. Get adapter (singleton)
const authAdapter = await scope.resolve<AuthAdapter>(TOKENS.auth);

// 2. Get verifier (cached per realm)
const verifier = await authAdapter.getVerifier(tenantCtx.realmKey);
// → Fetches JWKS on first call, cached thereafter

// 3. Verify token
const claims = await verifier.verify(jwtToken);
// → Throws AuthAdapterError if invalid

// 4. Invalidate realm (e.g., key rotation)
authAdapter.invalidateRealm(realmKey);
// → Next getVerifier() call refetches JWKS
```

---

## Telemetry Adapter Workflow

```typescript
// 1. Get adapter (singleton)
const telemetryAdapter = await scope.resolve<TelemetryAdapter>(TOKENS.telemetry);

// 2. Get scoped logger
const logger = telemetryAdapter.getLogger(requestId);

// 3. Log (includes requestId automatically)
logger.info("Request started", { path, method });
logger.warn("Slow query", { duration: 1500 });
logger.error("Query failed", { error: err.message });

// 4. Flush on shutdown
await telemetryAdapter.flush();
```

---

## Error Handling

### DB Errors
```typescript
import { DbAdapterError } from "@athyper/runtime/adapters/db";

try {
  const db = await dbAdapter.getScopedDb(tenantCtx);
} catch (err) {
  if (err instanceof DbAdapterError) {
    console.error(err.code);        // "DB_POOL_INIT_FAILED"
    console.error(err.meta);        // { originalError: "..." }
  }
}
```

### Auth Errors
```typescript
import { AuthAdapterError } from "@athyper/runtime/adapters/auth";

try {
  await verifier.verify(token);
} catch (err) {
  if (err instanceof AuthAdapterError) {
    console.error(err.code);        // "JWT_VERIFICATION_FAILED"
    console.error(err.meta);        // { originalError: "..." }
  }
}
```

### Telemetry Errors
```typescript
import { TelemetryAdapterError } from "@athyper/runtime/adapters/telemetry";

try {
  const adapter = await TelemetryAdapterImpl.create(config);
} catch (err) {
  if (err instanceof TelemetryAdapterError) {
    console.error(err.code);        // "OTEL_INIT_FAILED"
  }
}
```

---

## Configuration Essentials

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

# Multi-Tenancy
IAM_STRATEGY=single_realm
IAM_DEFAULT_REALM_KEY=main
IAM_DEFAULT_TENANT_KEY=default
```

---

## Key Files

**Implementation**:
- `framework/runtime/src/adapters/db/` – Database adapter
- `framework/runtime/src/adapters/auth/` – Auth adapter
- `framework/runtime/src/adapters/telemetry/` – Telemetry adapter
- `framework/runtime/src/adapters/register.adapters.ts` – Orchestration

**Configuration**:
- `framework/runtime/src/kernel/tokens.ts` – Token type mappings
- `framework/runtime/src/kernel/bootstrap.ts` – Calls registerAdapters()

**Examples**:
- `/mesh/config/pgbouncer.ini` – PgBouncer transaction mode config
- `/mesh/env/.env.example` – Environment variables template

**Documentation**:
- `/ADAPTER_WIRING_GUIDE.md` – Complete implementation guide
- `/ADAPTER_INTEGRATION_CHECKLIST.md` – Quick start + verification
- `/ADAPTER_IMPLEMENTATION_SUMMARY.md` – Architecture overview

---

## Common Patterns

### Middleware: Tenant + Auth Verification

```typescript
app.use(async (req, res, next) => {
  try {
    // 1. Resolve tenant context
    const tenantCtx = resolveContextFromRequest(config, req);
    
    // 2. Create scoped container
    const scope = container.createScope();
    scope.register(TOKENS.tenantContext, async () => tenantCtx, "scoped");
    
    // 3. Verify token
    const authAdapter = await scope.resolve<AuthAdapter>(TOKENS.auth);
    const verifier = await authAdapter.getVerifier(tenantCtx.realmKey);
    const claims = await verifier.verify(req.headers.authorization?.split(" ")[1]);
    
    // 4. Attach to request
    req.user = claims;
    req.tenantCtx = tenantCtx;
    req.scope = scope;
    
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});
```

### Route Handler: Query with Tenant Isolation

```typescript
app.get("/users", async (req, res) => {
  const { dbAdapter } = await req.scope.resolve<DbAdapter>(TOKENS.db);
  const db = await dbAdapter.getScopedDb(req.tenantCtx);
  
  const users = await db.selectFrom("users").selectAll().execute();
  
  res.json(users);
});
```

### Logging: Scoped Logger

```typescript
app.use((req, res, next) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  res.setHeader("x-request-id", requestId);
  
  const telemetry = await container.resolve<TelemetryAdapter>(TOKENS.telemetry);
  const logger = telemetry.getLogger(requestId);
  
  logger.info("Request received", { method: req.method, path: req.path });
  
  next();
});
```

---

## Troubleshooting Quick Tips

| Issue | Check |
|-------|-------|
| DB queries hit public schema instead of tenant | PgBouncer running? `pool_mode = transaction`? search_path set? |
| Token verification fails | KEYCLOAK_ISSUER_URL reachable? JWKS endpoint up? Token expired? |
| Slow logs or missing output | LOG_LEVEL set? Process stdout not redirected? |
| Pool exhausted (too many connections) | Increase DATABASE_POOL_MAX? Check for leaks? |
| OTel not exporting traces | OTEL_EXPORTER_OTLP_ENDPOINT reachable? Sampler rate > 0? |

---

## Deployment Checklist

- [ ] PgBouncer: `pool_mode = transaction`, `default_pool_size = 25-50`
- [ ] Environment variables: DATABASE_URL, KEYCLOAK_*, LOG_LEVEL
- [ ] Database: Tenant schemas created (`tenant_acme`, `tenant_widget`, etc.)
- [ ] Keycloak: JWKS endpoint accessible, client credentials valid
- [ ] Telemetry: Log level appropriate for environment
- [ ] Monitoring: Pool stats, auth errors, log queue depth
- [ ] Graceful shutdown: SIGTERM → 15s timeout → exit
- [ ] Secrets: Use vault for DATABASE_URL, KEYCLOAK_CLIENT_SECRET, S3 keys

---

## Related Documentation

- **Full Guide**: `/ADAPTER_WIRING_GUIDE.md`
- **Integration**: `/ADAPTER_INTEGRATION_CHECKLIST.md`
- **Summary**: `/ADAPTER_IMPLEMENTATION_SUMMARY.md`
- **Code**: `framework/runtime/src/adapters/`

---

**Quick Start**: Copy `/mesh/env/.env.example` → `.env.local`, update values, run bootstrap. Done! 🚀
