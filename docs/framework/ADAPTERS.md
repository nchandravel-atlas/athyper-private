# Adapters

> `framework/adapters/` -- hexagonal architecture boundary between runtime kernel and external infrastructure.

Each adapter: clean interface, factory function, health check, DI token.

```
framework/adapters/
├── auth/           Keycloak OIDC + JWKS (jose)
├── db/             PostgreSQL via Kysely + PgBouncer
├── memorycache/    Redis via ioredis
├── objectstorage/  S3-compatible via AWS SDK (MinIO locally)
└── telemetry/      OpenTelemetry + Pino structured logging
```

---

## Auth Adapter (`@athyper/adapter-auth`)

**DI Token**: `adapter.auth` | **Lib**: jose

JWT verification using Keycloak OIDC discovery and JWKS endpoints.

```typescript
interface AuthAdapter {
  verifyToken(token: string): Promise<Record<string, unknown>>;
  getIssuerUrl(): string;
  getVerifier(realmKey: string): Promise<JwtVerifier>;
  getJwksHealth(realmKey?: string): Record<string, JwksHealthStatus>;
  warmUp(): Promise<void>;
}
```

**JWKS Manager**: per-realm key sets, Redis warm-start cache, health tracking, 30s clock skew tolerance.

| File | Purpose |
|------|---------|
| [auth-adapter.ts](framework/adapters/auth/src/keycloak/auth-adapter.ts) | Factory + implementation |
| [jwks-manager.ts](framework/adapters/auth/src/keycloak/jwks-manager.ts) | Per-realm JWKS caching |

---

## Database Adapter (`@athyper/adapter-db`)

**DI Token**: `adapter.db` | **Lib**: Kysely, pg, Prisma (codegen)

Type-safe queries over PostgreSQL with PgBouncer connection pooling.

```typescript
interface DbAdapter {
  readonly kysely: Kysely<DB>;
  withTx: (db, fn) => Promise<T>;
  withTxIsolation: (db, level, fn) => Promise<T>;
  close(): Promise<void>;
  health(): Promise<{ healthy: boolean; message?: string }>;
}
```

**Pool defaults**: max 10, idle timeout 30s, connection timeout 10s, statement timeout 30s.

**PgBouncer constraints** (transaction mode): no prepared statements, no LISTEN/NOTIFY, no advisory locks.

**Migrations**: uses admin connection (direct Postgres, not PgBouncer) for DDL. Schemas: `core`, `meta`, `ref`, `ent`, `ui`.

**Codegen**: `schema.prisma` → Kysely types + Zod schemas via `pnpm athyper:codegen`.

| File | Purpose |
|------|---------|
| [adapter.ts](framework/adapters/db/src/adapter.ts) | Factory + interface |
| [pool.ts](framework/adapters/db/src/kysely/pool.ts) | PgBouncer-optimized pool |
| [db.ts](framework/adapters/db/src/kysely/db.ts) | Kysely instance |
| [tx.ts](framework/adapters/db/src/kysely/tx.ts) | Transaction helpers |
| [runner.ts](framework/adapters/db/src/migrations/runner.ts) | Migration runner |
| [schema.prisma](framework/adapters/db/src/prisma/schema.prisma) | Database schema source |

---

## Memory Cache Adapter (`@athyper/adapter-memorycache`)

**DI Token**: `adapter.cache` | **Lib**: ioredis

Redis client for caching, sessions, rate limiting, and job queues.

```typescript
const redis = createRedisClient({ host, port, lazyConnect: true, maxRetriesPerRequest: 2 });
```

**Defaults**: lazy connect, 2 retries per request, ready check enabled.

| File | Purpose |
|------|---------|
| [redis.ts](framework/adapters/memorycache/src/redis.ts) | Redis client factory |

---

## Object Storage Adapter (`@athyper/adapter-objectstorage`)

**DI Token**: `adapter.objectStorage` | **Lib**: @aws-sdk/client-s3

S3-compatible storage. MinIO locally, S3 in production.

```typescript
interface ObjectStorageAdapter {
  put(key, body, opts?): Promise<void>;
  get(key): Promise<Buffer>;
  delete(key): Promise<void>;
  exists(key): Promise<boolean>;
  list(prefix?): Promise<ObjectMetadata[]>;
  getPresignedUrl(key, expiry?): Promise<string>;
  putPresignedUrl(key, expiry?): Promise<string>;
  deleteMany(keys): Promise<void>;
  copyObject(src, dest): Promise<void>;
  healthCheck(): Promise<{ healthy: boolean }>;
}
```

| File | Purpose |
|------|---------|
| [types.ts](framework/adapters/objectstorage/src/types.ts) | Interface definitions |
| [client.ts](framework/adapters/objectstorage/src/s3/client.ts) | S3Client factory |
| [operations.ts](framework/adapters/objectstorage/src/s3/operations.ts) | Implementation |

---

## Telemetry Adapter (`@athyper/adapter-telemetry`)

**DI Token**: `adapter.telemetry` | **Lib**: @opentelemetry/api, Pino

Structured log emission with OpenTelemetry trace context correlation.

```typescript
interface TelemetryAdapter {
  logger: TelemetryLogger;   // emit, info, warn, error
  getTraceContext(): TraceContext | undefined;
}
```

Log envelopes auto-attach traceId/spanId/traceFlags from `AsyncLocalStorage`.

| File | Purpose |
|------|---------|
| [index.ts](framework/adapters/telemetry/src/index.ts) | Factory |
| [traceContext.ts](framework/adapters/telemetry/src/traceContext.ts) | OTel trace extraction |

---

## Adapter Protection

All adapters wrapped at runtime with:
- **Circuit breakers** -- prevent cascading failures
- **Retry logic** -- exponential/linear/fixed backoff
- **Health registration** -- per-adapter health checks

## Technology Summary

| Adapter | Library | Infrastructure |
|---------|---------|---------------|
| Auth | jose, Keycloak OIDC | Keycloak |
| Database | Kysely, pg, Prisma | PostgreSQL 16 + PgBouncer |
| Cache | ioredis | Redis |
| Object Storage | @aws-sdk/client-s3 | MinIO (local) / S3 (prod) |
| Telemetry | OpenTelemetry, Pino | Grafana + Prometheus + Tempo + Loki |

---

[Back to Documentation Home](../README.md)
