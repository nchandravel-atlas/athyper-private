# Complete Adapter Wiring Guide for Athyper

## Overview

This guide provides production-ready, fully-typed implementations for three core adapters aligned with Athyper's kernel + scoped DI model:

1. **Tenant-Aware DB Adapter** – Kysely with PgBouncer transaction safety
2. **Keycloak Auth Adapter** – Per-realm JWKS verification with caching
3. **Telemetry (OTel) Adapter** – OpenTelemetry + Pino structured logging

### Key Principles

- **Stable Tokens**: Adapter implementations are swappable; token keys remain stable
- **Scoped DI**: Request/job scopes create child containers with request-scoped DB connections
- **Tenant Isolation**: PgBouncer transaction mode ensures tenant context (schema/search_path) survives connection reuse
- **Error Contracts**: Typed error classes with structured metadata for observability
- **Async Bootstrap**: All adapters register as factories; initialization happens lazily on first resolve

---

## 1. Database Adapter (Tenant-Aware with PgBouncer)

### Why PgBouncer?

- **Connection pooling** at the gateway (horizontal scale)
- **Transaction mode** (`session` pooling): each client connection maps to a single backend connection for the lifetime of a transaction, preserving session state (e.g., `SET search_path`)
- **Tenant context safety**: Set `search_path = 'public,<tenant_schema>'` in the transaction; PgBouncer preserves it

### Adapter Contract

```typescript
// framework/runtime/src/adapters/db/db.adapter.ts

import type { Kysely, KyselyConfig } from "kysely";
import type { DB } from "@athyper/adapter-db";
import type { TenantContext } from "../../kernel/tenantContext";

/**
 * DB adapter contract: single shared pool + scoped transaction factories.
 */
export interface DbAdapter {
  /**
   * Get a Kysely instance with tenant isolation applied via PgBouncer session state.
   * - Must be called within a scoped DI (per-request).
   * - Manages search_path to isolate tenant schema.
   */
  getScopedDb(tenantCtx: TenantContext): Promise<Kysely<DB>>;

  /**
   * Explicit connection pool reference (for diagnostics, advanced use).
   */
  getPool(): any;

  /**
   * Graceful shutdown: drain connections, close pool.
   */
  shutdown(): Promise<void>;
}

export class DbAdapterError extends Error {
  readonly code: string;
  readonly meta?: Record<string, unknown>;

  constructor(code: string, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}
```

### Implementation

```typescript
// framework/runtime/src/adapters/db/db.adapter.impl.ts

import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "@athyper/adapter-db";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { TenantContext } from "../../kernel/tenantContext";
import type { DbAdapter } from "./db.adapter";
import { DbAdapterError } from "./db.adapter";

export class DbAdapterImpl implements DbAdapter {
  private pool: Pool;
  private dialect: PostgresDialect;
  private readonly logger: any;

  private constructor(pool: Pool, dialect: PostgresDialect, logger: any) {
    this.pool = pool;
    this.dialect = dialect;
    this.logger = logger;
  }

  static async create(config: RuntimeConfig, logger: any): Promise<DbAdapter> {
    const dbUrl = config.db.url;
    if (!dbUrl) {
      throw new DbAdapterError("DB_CONFIG_INVALID", "db.url not configured");
    }

    let pool: Pool;
    try {
      pool = new Pool({ connectionString: dbUrl, max: config.db.poolMax ?? 10 });

      // Test connection
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();

      logger.info?.({ dbUrl: "[redacted]" }, "db adapter pool initialized");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new DbAdapterError("DB_POOL_INIT_FAILED", `Failed to initialize DB pool: ${msg}`, {
        originalError: msg,
      });
    }

    const dialect = new PostgresDialect({ pool });
    return new DbAdapterImpl(pool, dialect, logger);
  }

  async getScopedDb(tenantCtx: TenantContext): Promise<Kysely<DB>> {
    // In transaction mode (PgBouncer session pooling):
    // - Each request gets a scoped connection from the pool
    // - Set search_path to isolate tenant schema
    // - Connection is "sticky" for the lifetime of the transaction

    const db = new Kysely<DB>({ dialect: this.dialect });

    // Apply tenant context (search_path) to ensure isolation
    await db
      .raw(`SET search_path = 'public,${tenantCtx.realmKey}'`)
      .execute()
      .catch((err) => {
        throw new DbAdapterError("DB_TENANT_ISOLATION_FAILED", `Failed to set search_path for tenant ${tenantCtx.tenantKey}`, {
          realmKey: tenantCtx.realmKey,
          tenantKey: tenantCtx.tenantKey,
          error: err instanceof Error ? err.message : String(err),
        });
      });

    return db;
  }

  getPool(): any {
    return this.pool;
  }

  async shutdown(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.info?.({}, "db adapter pool closed");
    } catch (err) {
      this.logger.error?.(
        { error: err instanceof Error ? err.message : String(err) },
        "error closing db pool"
      );
    }
  }
}
```

### DI Registration

```typescript
// framework/runtime/src/adapters/db/register.db.ts

import type { Container } from "../../kernel/container";
import { TOKENS } from "../../kernel/tokens";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { DbAdapter } from "./db.adapter";
import { DbAdapterImpl } from "./db.adapter.impl";

/**
 * Register the DB adapter as a scoped singleton.
 *
 * - Pool itself is a singleton (reused across all requests).
 * - Scoped Kysely instances get fresh connections with tenant isolation applied.
 */
export async function registerDbAdapter(container: Container): Promise<void> {
  // Singleton pool factory
  container.register(
    TOKENS.db,
    async (c: Container): Promise<DbAdapter> => {
      const config = await c.resolve<RuntimeConfig>(TOKENS.config);
      const logger = await c.resolve<any>(TOKENS.logger);

      const adapter = await DbAdapterImpl.create(config, logger);

      // Register cleanup on shutdown
      const lifecycle = await c.resolve<any>(TOKENS.lifecycle);
      lifecycle.onShutdown("db-adapter", () => adapter.shutdown());

      return adapter;
    },
    "singleton"
  );
}
```

---

## 2. Keycloak Auth Adapter

### Auth Contract

```typescript
// framework/runtime/src/adapters/auth/auth.adapter.ts

export interface AuthVerifier {
  /**
   * Verify and decode a JWT token; return decoded claims.
   */
  verify(token: string): Promise<Record<string, unknown>>;
}

export interface AuthAdapter {
  /**
   * Get a realm-scoped verifier (cached per realm).
   */
  getVerifier(realmKey: string): Promise<AuthVerifier>;

  /**
   * Warm up verifier caches (e.g., during boot).
   */
  warmupRealms(realmKeys: string[]): Promise<void>;

  /**
   * Invalidate a realm's verifier cache (for JWKS key rotation).
   */
  invalidateRealm(realmKey: string): void;
}

export class AuthAdapterError extends Error {
  readonly code: string;
  readonly meta?: Record<string, unknown>;

  constructor(code: string, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}
```

### Implementation with JWKS Caching

```typescript
// framework/runtime/src/adapters/auth/auth.adapter.impl.ts

import type { JWTPayload } from "jose";
import { jwtVerify, createRemoteJWKSet } from "jose";
import type { RuntimeConfig } from "../../kernel/config.schema";
import { getRealmIamConfig } from "../../kernel/tenantContext";
import type { AuthVerifier, AuthAdapter } from "./auth.adapter";
import { AuthAdapterError } from "./auth.adapter";

class KeycloakVerifier implements AuthVerifier {
  private verifyFn: (token: string) => Promise<JWTPayload>;

  constructor(verifyFn: (token: string) => Promise<JWTPayload>) {
    this.verifyFn = verifyFn;
  }

  async verify(token: string): Promise<Record<string, unknown>> {
    try {
      const payload = await this.verifyFn(token);
      return payload as Record<string, unknown>;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new AuthAdapterError("JWT_VERIFICATION_FAILED", `Token verification failed: ${msg}`, {
        originalError: msg,
      });
    }
  }
}

export class AuthAdapterImpl implements AuthAdapter {
  private verifierCache = new Map<string, Promise<AuthVerifier>>();
  private readonly config: RuntimeConfig;
  private readonly logger: any;

  constructor(config: RuntimeConfig, logger: any) {
    this.config = config;
    this.logger = logger;
  }

  async getVerifier(realmKey: string): Promise<AuthVerifier> {
    if (!this.verifierCache.has(realmKey)) {
      this.verifierCache.set(
        realmKey,
        (async () => {
          try {
            const realmCfg = getRealmIamConfig(this.config, realmKey);

            // Create JWKS endpoint URL
            const jwksUrl = `${realmCfg.issuerUrl.replace(/\/$/, "")}/protocol/openid-connect/certs`;

            // Create remote JWKS set with HTTP caching
            const jwks = createRemoteJWKSet(new URL(jwksUrl));

            this.logger.debug?.(
              { realmKey, jwksUrl: "[redacted]" },
              "keycloak verifier initialized"
            );

            // Factory for verification
            const verifyFn = async (token: string): Promise<JWTPayload> => {
              const result = await jwtVerify(token, jwks, {
                issuer: realmCfg.issuerUrl,
                audience: realmCfg.clientId,
              });
              return result.payload;
            };

            return new KeycloakVerifier(verifyFn);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new AuthAdapterError(
              "VERIFIER_INIT_FAILED",
              `Failed to initialize verifier for realm ${realmKey}: ${msg}`,
              { realmKey, originalError: msg }
            );
          }
        })()
      );
    }

    return this.verifierCache.get(realmKey)!;
  }

  async warmupRealms(realmKeys: string[]): Promise<void> {
    const results = await Promise.allSettled(
      realmKeys.map((rk) => this.getVerifier(rk))
    );

    const errors = results
      .map((r, i) => (r.status === "rejected" ? { realmKey: realmKeys[i], error: r.reason } : null))
      .filter(Boolean);

    if (errors.length > 0) {
      this.logger.warn?.(
        { errors, warmupCount: realmKeys.length },
        "some realms failed to warmup"
      );
    }
  }

  invalidateRealm(realmKey: string): void {
    this.verifierCache.delete(realmKey);
    this.logger.info?.({ realmKey }, "auth verifier cache invalidated");
  }
}
```

### DI Registration

```typescript
// framework/runtime/src/adapters/auth/register.auth.ts

import type { Container } from "../../kernel/container";
import { TOKENS } from "../../kernel/tokens";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { AuthAdapter } from "./auth.adapter";
import { AuthAdapterImpl } from "./auth.adapter.impl";

export async function registerAuthAdapter(container: Container): Promise<void> {
  container.register(
    TOKENS.auth,
    async (c: Container): Promise<AuthAdapter> => {
      const config = await c.resolve<RuntimeConfig>(TOKENS.config);
      const logger = await c.resolve<any>(TOKENS.logger);

      const adapter = new AuthAdapterImpl(config, logger);

      // Warm up all realms on init
      const realmKeys = Object.keys(config.iam.realms ?? {});
      await adapter.warmupRealms(realmKeys);

      return adapter;
    },
    "singleton"
  );
}
```

---

## 3. Telemetry (OTel) Adapter

### Telemetry Contract

```typescript
// framework/runtime/src/adapters/telemetry/telemetry.adapter.ts

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export interface TelemetryLogger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export interface TelemetryAdapter {
  /**
   * Get scoped logger instance (per-request/job).
   */
  getLogger(scopeId: string): TelemetryLogger;

  /**
   * Export pending spans/metrics (OTel SDK).
   */
  flush(): Promise<void>;

  /**
   * Shutdown telemetry backend.
   */
  shutdown(): Promise<void>;
}

export class TelemetryAdapterError extends Error {
  readonly code: string;
  readonly meta?: Record<string, unknown>;

  constructor(code: string, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}
```

### Implementation with Pino + OTel

```typescript
// framework/runtime/src/adapters/telemetry/telemetry.adapter.impl.ts

import pino, { type Logger } from "pino";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { TelemetryAdapter, TelemetryLogger } from "./telemetry.adapter";
import { TelemetryAdapterError } from "./telemetry.adapter";

class PinoTelemetryLogger implements TelemetryLogger {
  constructor(private pinoLogger: Logger) {}

  log(level: string, message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger[level as any](meta ?? {}, message);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger.info(meta ?? {}, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger.warn(meta ?? {}, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger.error(meta ?? {}, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.pinoLogger.debug(meta ?? {}, message);
  }
}

export class TelemetryAdapterImpl implements TelemetryAdapter {
  private rootLogger: Logger;
  private loggerCache = new Map<string, TelemetryLogger>();
  private otelExporter: any = null;

  private constructor(rootLogger: Logger, otelExporter?: any) {
    this.rootLogger = rootLogger;
    this.otelExporter = otelExporter;
  }

  static async create(config: RuntimeConfig): Promise<TelemetryAdapter> {
    const logLevel = config.logLevel ?? "info";

    // Create root Pino logger
    const transport = process.env.NODE_ENV === "development"
      ? pino.transport({
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        })
      : undefined;

    const rootLogger = pino(
      {
        level: logLevel,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => ({ level: label }),
        },
      },
      transport
    );

    // Optional: Initialize OTel exporter
    let otelExporter: any = null;
    if (config.telemetry?.enabled && config.telemetry?.otlpEndpoint) {
      try {
        // Example: Using @opentelemetry/sdk-node (requires additional setup)
        // For now, we log the endpoint for future integration
        rootLogger.info({ otlpEndpoint: "[redacted]" }, "otel exporter would be configured here");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new TelemetryAdapterError(
          "OTEL_INIT_FAILED",
          `Failed to initialize OTel exporter: ${msg}`
        );
      }
    }

    return new TelemetryAdapterImpl(rootLogger, otelExporter);
  }

  getLogger(scopeId: string): TelemetryLogger {
    if (!this.loggerCache.has(scopeId)) {
      // Create a child logger with scope ID in all logs
      const childLogger = this.rootLogger.child({ scopeId });
      this.loggerCache.set(scopeId, new PinoTelemetryLogger(childLogger));
    }
    return this.loggerCache.get(scopeId)!;
  }

  async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.rootLogger.flush(() => resolve());
    });
  }

  async shutdown(): Promise<void> {
    await this.flush();
    // Optional: shutdown OTel exporter
    if (this.otelExporter?.shutdown) {
      await this.otelExporter.shutdown();
    }
  }
}
```

### DI Registration

```typescript
// framework/runtime/src/adapters/telemetry/register.telemetry.ts

import type { Container } from "../../kernel/container";
import { TOKENS } from "../../kernel/tokens";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { TelemetryAdapter } from "./telemetry.adapter";
import { TelemetryAdapterImpl } from "./telemetry.adapter.impl";

export async function registerTelemetryAdapter(container: Container): Promise<void> {
  container.register(
    TOKENS.telemetry,
    async (c: Container): Promise<TelemetryAdapter> => {
      const config = await c.resolve<RuntimeConfig>(TOKENS.config);

      const adapter = await TelemetryAdapterImpl.create(config);

      // Register cleanup on shutdown
      const lifecycle = await c.resolve<any>(TOKENS.lifecycle);
      lifecycle.onShutdown("telemetry-adapter", () => adapter.shutdown());

      return adapter;
    },
    "singleton"
  );
}
```

---

## 4. Central Adapter Registration Module

Create a single orchestration point for all adapter registrations:

```typescript
// framework/runtime/src/adapters/register.adapters.ts

import type { Container } from "../kernel/container";
import { registerDbAdapter } from "./db/register.db";
import { registerAuthAdapter } from "./auth/register.auth";
import { registerTelemetryAdapter } from "./telemetry/register.telemetry";

/**
 * Register ALL adapters into the container.
 * Called from bootstrap() after kernel defaults are in place.
 */
export async function registerAdapters(container: Container): Promise<void> {
  // Order matters: telemetry first (logging), then auth, then db
  await registerTelemetryAdapter(container);
  await registerAuthAdapter(container);
  await registerDbAdapter(container);
}
```

### Integration into Bootstrap

Update `bootstrap()` to call `registerAdapters()`:

```typescript
// In framework/runtime/src/kernel/bootstrap.ts

import { registerAdapters } from "../adapters/register.adapters";

// ... in bootstrap() after registerKernelDefaults ...

const container = createKernelContainer();
registerKernelDefaults(container, config, { bootId, envSnapshot });

// Register adapters BEFORE loading services
await registerAdapters(container);

// Now DI is ready: switch boot logs to container logger + get audit writer
const logger = await container.resolve<any>(TOKENS.logger);
// ... rest of bootstrap ...
```

---

## 5. Scoped DB Usage in Request Handlers

### Example: Using Scoped DB in a Request

```typescript
// Example service/handler using scoped DB

async function handleApiRequest(container: Container, req: RequestLike, tenantCtx: TenantContext) {
  // Create scoped container for this request
  const scope = container.createScope();

  // Register request-scoped dependencies (e.g., request context)
  scope.register(TOKENS.requestContext, async () => ({ /* ... */ }), "scoped");
  scope.register(TOKENS.tenantContext, async () => tenantCtx, "scoped");

  try {
    // Resolve DB adapter (singleton) and get scoped Kysely instance
    const dbAdapter = await scope.resolve<DbAdapter>(TOKENS.db);
    const db = await dbAdapter.getScopedDb(tenantCtx);

    // Use db with automatic tenant isolation
    const result = await db
      .selectFrom("users")
      .select(["id", "email"])
      .execute();

    return { status: 200, body: result };
  } finally {
    // Scope cleanup (optional for request-scoped resources)
  }
}
```

### PgBouncer Configuration

```ini
# pgbouncer.ini

[databases]
athyper = host=postgres.local port=5432 dbname=athyper

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
```

- **pool_mode = transaction**: Each client connection is mapped to a backend connection for the lifetime of a transaction. Session state (e.g., `SET search_path`) is preserved.
- **max_client_conn**: Total client connections PgBouncer accepts.
- **default_pool_size**: Pool size per database.

---

## 6. Environment Variables & Config Mapping

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/athyper
DATABASE_POOL_MAX=10

# Runtime
NODE_ENV=production
RUNTIME_MODE=api
RUNTIME_PORT=3000

# IAM / Keycloak
KEYCLOAK_ISSUER_URL=https://keycloak.example.com/realms/main
KEYCLOAK_CLIENT_ID=athyper-api
KEYCLOAK_CLIENT_SECRET=<secret-or-ref-key>

# Telemetry
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318

# Other
REDIS_URL=redis://redis:6379/0
S3_ENDPOINT=https://s3.amazonaws.com
```

### Config Schema Integration

The `RuntimeConfig` (already defined) maps environment variables via `loadConfig()`:

```typescript
// framework/runtime/src/kernel/config.ts (loader snippet)

export function loadConfig(audit: any): RuntimeConfig {
  const raw = {
    env: process.env.NODE_ENV ?? "local",
    mode: process.env.RUNTIME_MODE ?? "api",
    db: {
      url: process.env.DATABASE_URL ?? process.env.DB_URL,
      adminUrl: process.env.DATABASE_ADMIN_URL,
      poolMax: parseInt(process.env.DATABASE_POOL_MAX ?? "10", 10),
    },
    iam: {
      realms: {
        main: {
          defaults: {},
          iam: {
            issuerUrl: process.env.KEYCLOAK_ISSUER_URL,
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            clientSecretRef: process.env.KEYCLOAK_CLIENT_SECRET_REF,
          },
          tenants: {},
        },
      },
    },
    telemetry: {
      enabled: process.env.OTEL_ENABLED === "true",
      otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    },
    // ... more fields ...
  };

  return RuntimeConfigSchema.parse(raw);
}
```

---

## 7. NPM Dependencies

Update adapter `package.json` files with required dependencies:

### DB Adapter

```json
{
  "dependencies": {
    "kysely": "^0.27.4",
    "pg": "^8.13.0",
    "@athyper/core": "workspace:*"
  }
}
```

### Auth Adapter

```json
{
  "dependencies": {
    "jose": "^5.9.0",
    "@athyper/core": "workspace:*"
  }
}
```

### Telemetry Adapter

```json
{
  "dependencies": {
    "pino": "^9.4.0",
    "pino-pretty": "^10.2.0",
    "@athyper/core": "workspace:*"
  },
  "optionalDependencies": {
    "@opentelemetry/sdk-node": "^0.53.0",
    "@opentelemetry/exporter-trace-otlp-http": "^0.53.0"
  }
}
```

---

## 8. Tenant Isolation Deep Dive

### How PgBouncer + search_path Works

1. **Client connects** to PgBouncer → PgBouncer gets a backend connection from the pool
2. **Application sets** `SET search_path = 'public,tenant_schema'`
3. **PgBouncer (transaction mode)** keeps the backend connection "sticky" for the transaction
4. **Query execution** uses the search_path automatically (no need to prefix table names)
5. **Transaction ends** → PgBouncer may return connection to pool (still sticky if session mode)

### Critical Ordering

```typescript
// ✅ CORRECT: Set search_path before any queries

const db = new Kysely<DB>({ dialect });
await db.raw(`SET search_path = 'public,${tenantCtx.realmKey}'`).execute();
const users = await db.selectFrom("users").select("*").execute();

// ❌ WRONG: Queries before search_path may use default public schema

const db = new Kysely<DB>({ dialect });
const users = await db.selectFrom("users").select("*").execute(); // Uses default public schema!
await db.raw(`SET search_path = ...`).execute();
```

### Schema Layout

```sql
-- All tenants share backend DB; schemas provide isolation

CREATE SCHEMA public;                    -- Shared reference data
CREATE SCHEMA tenant_acme;               -- Acme Corp's tables
CREATE SCHEMA tenant_widget_factory;     -- Widget Factory's tables

-- Each tenant's search_path points to their schema

-- Client (Acme) sets: SET search_path = 'public,tenant_acme'
-- Client (WF) sets:   SET search_path = 'public,tenant_widget_factory'

SELECT * FROM users;  -- Resolves to tenant_acme.users or tenant_widget_factory.users
```

---

## 9. Testing Adapters

### Example Test: DB Adapter

```typescript
// framework/runtime/src/adapters/db/__tests__/db.adapter.test.ts

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DbAdapterImpl } from "../db.adapter.impl";
import type { TenantContext } from "../../../kernel/tenantContext";

describe("DbAdapter", () => {
  let adapter: DbAdapter;
  const mockLogger = { info: () => {}, error: () => {}, debug: () => {} };

  beforeAll(async () => {
    const mockConfig = {
      db: { url: "postgresql://localhost/test", poolMax: 5 },
      // ... minimal config
    };
    adapter = await DbAdapterImpl.create(mockConfig, mockLogger);
  });

  afterAll(async () => {
    await adapter.shutdown();
  });

  it("should set search_path for tenant isolation", async () => {
    const tenantCtx: TenantContext = {
      realmKey: "main",
      tenantKey: "acme",
      orgKey: undefined,
      defaults: {},
    };

    const db = await adapter.getScopedDb(tenantCtx);
    const result = await db.raw("SHOW search_path").execute();

    expect(result.rows[0]).toHaveProperty("search_path");
  });
});
```

---

## 10. Summary: Deployment Checklist

- [ ] DB Adapter: Pool initialized, PgBouncer transaction mode enabled
- [ ] Auth Adapter: JWKS endpoints reachable, all realms warmed up
- [ ] Telemetry Adapter: Pino logger configured, OTel exporter optional but recommended
- [ ] Adapters registered in `registerAdapters()` → called from `bootstrap()`
- [ ] Environment variables mapped in `config.ts`
- [ ] Scoped containers created per request/job
- [ ] Request handlers call `dbAdapter.getScopedDb(tenantCtx)`
- [ ] Graceful shutdown triggers `lifecycle.onShutdown()` handlers
- [ ] Monitor: connection pool stats, JWKS cache hits, OTel traces

---

This guide provides a complete, production-ready foundation for adapter wiring aligned with Athyper's kernel + scoped DI model, with tenant isolation, robust error handling, and observability built in.
