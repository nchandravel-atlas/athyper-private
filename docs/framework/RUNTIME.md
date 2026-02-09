# Runtime

> `framework/runtime/` -- kernel of the Athyper platform. Bootstraps DI, loads config, wires adapters, manages lifecycle.

## Kernel Structure

```
kernel/
├── container.ts       DI container (token-based, scoped)
├── tokens.ts          Token registry (all injectable keys)
├── config.ts          Layered config loader (file → env → SUPERSTAR)
├── config.schema.ts   Zod schema for RuntimeConfig
├── lifecycle.ts       Shutdown handler (LIFO)
├── scope.ts           Request/job scope factories
├── tenantContext.ts   Multi-tenant context resolution
├── audit.ts           Audit event types and writers
└── logger.ts          Pino structured logger
```

---

## DI Container

Token-based dependency injection. Every service/adapter registered against a named token, resolved lazily.

### Token Categories

| Category | Examples |
|----------|---------|
| Kernel | `kernel.config`, `kernel.logger`, `kernel.lifecycle`, `kernel.env` |
| Context | `context.request`, `context.tenant`, `context.auth` |
| Adapters | `adapter.db`, `adapter.auth`, `adapter.cache`, `adapter.objectStorage`, `adapter.telemetry` |
| Runtime | `runtime.httpServer`, `runtime.jobQueue`, `runtime.scheduler`, `runtime.circuitBreakers` |
| Observability | `observability.health`, `observability.metrics`, `observability.shutdown` |
| Registries | `registry.routes`, `registry.services`, `registry.jobs` |

### Cache Modes

- `singleton` -- one instance for container lifetime
- `scoped` -- one instance per child scope
- `transient` -- new instance on every resolve

### Scoping

```
Root Container (singletons: config, db, cache, logger)
  └── Request Scope (scoped: requestContext, tenantContext)
  └── Job Scope (scoped: requestContext, tenantContext)
```

- `createHttpScope(root, req)` -- per-request with requestId, tenant context
- `createJobScope(root, payload)` -- per-job with job context

---

## Configuration

### Layered Precedence (lowest → highest)

```
JSON file → env vars → overrides → SUPERSTAR env
```

### SUPERSTAR Variables (`ATHYPER_SUPER__*`)

| Variable | Maps to |
|----------|---------|
| `ATHYPER_SUPER__DB_URL` | `db.url` |
| `ATHYPER_SUPER__REDIS_URL` | `redis.url` |
| `ATHYPER_SUPER__S3_ENDPOINT` | `s3.endpoint` |
| `ATHYPER_SUPER__IAM_SECRET__<realmKey>` | Realm client secret |

### Locked Paths (SUPERSTAR-only)

`db.url`, `db.adminUrl`, `redis.url`, `s3.*`, `telemetry.otlpEndpoint`, `iam.strategy`

### Config Schema (key fields)

```typescript
RuntimeConfig {
  env: "local" | "staging" | "production"
  mode: "api" | "worker" | "scheduler"
  port: number                // default 3000
  db: { url, adminUrl?, poolMax }
  iam: { strategy, defaultRealmKey, realms: Record<string, RealmConfig> }
  redis: { url }
  s3: { endpoint, accessKey, secretKey, bucket }
  telemetry: { otlpEndpoint?, enabled }
}
```

### Realm Config

Each realm: IAM settings (issuerUrl, clientId), feature flags (bffSessions, refreshRotation, csrfProtection, pkceFlow), platform minimums (password policy, lockout), tenant definitions.

---

## Tenant Context Resolution

### HTTP Requests (priority order)

1. Headers: `x-realm`, `x-tenant`, `x-org`
2. JWT claims: `realmKey`, `tenantKey`, `orgKey`
3. Config defaults

In production with `requireTenantClaimsInProd`: claims override headers, `tenantKey` required.

### Defaults Cascade

`realm.defaults → tenant.defaults → org.defaults` (deep merge, later overrides earlier)

---

## Lifecycle

LIFO shutdown hooks with timeout protection:

```
Register order:   close DB → drain jobs → stop HTTP
Execution order:  stop HTTP → drain jobs → close DB
```

---

## Logging

Pino-based structured JSON. Levels: fatal, error, warn, info, debug, trace. Pretty mode in local dev.

## Audit

Structured `AuditEvent` with type, level, actor, timestamp, requestId, meta. Writers: console (dev), noop (test), custom.

## Runtime Modes

| Mode | Purpose |
|------|---------|
| `api` | Express HTTP server, routes, middleware, auth, health endpoints |
| `worker` | BullMQ consumer, worker pool, job handlers |
| `scheduler` | Cron triggers, job scheduling |

## Services

### Platform

| Service | Purpose |
|---------|---------|
| Security | Session store, realm safety, env profiles, auth audit/telemetry |
| IAM | Session invalidation, tenant IAM profiles |
| Workflow Engine | Admin, audit, instance management, recovery, task execution |
| Policy Rules | Rule evaluation engine |
| Metadata Studio | Dynamic entity metadata management |
| Integration Hub | External system connectors |

### Business

Finance, Customer, Supply, Operations, Assets, People, Projects, ITSM

### Enterprise

Content, Collaboration, Messaging, Sharing, Regulatory, AI, Analytics

## Key Files

| File | Purpose |
|------|---------|
| [container.ts](framework/runtime/src/kernel/container.ts) | DI container |
| [tokens.ts](framework/runtime/src/kernel/tokens.ts) | Token definitions |
| [config.ts](framework/runtime/src/kernel/config.ts) | Config loader |
| [config.schema.ts](framework/runtime/src/kernel/config.schema.ts) | Zod schema |
| [lifecycle.ts](framework/runtime/src/kernel/lifecycle.ts) | Shutdown manager |
| [scope.ts](framework/runtime/src/kernel/scope.ts) | Scope factories |
| [tenantContext.ts](framework/runtime/src/kernel/tenantContext.ts) | Tenant resolution |
| [audit.ts](framework/runtime/src/kernel/audit.ts) | Audit events |
| [logger.ts](framework/runtime/src/kernel/logger.ts) | Pino logger |

---

[Back to Documentation Home](../README.md)
