# Athyper Platform Documentation

Central index for all platform documentation.

## Documentation Map

### Architecture

| Document | Description |
|----------|-------------|
| [Architecture Overview](./architecture/README.md) | Design principles, module organization |
| [System Overview](./architecture/OVERVIEW.md) | Components, data flows, runtime modes |
| [Multi-Tenancy](./architecture/MULTI_TENANCY.md) | Single/multi-realm IAM, tenant isolation, data partitioning |
| [DDD Patterns](./architecture/DDD_PATTERNS.md) | Entity, ValueObject, AggregateRoot, Repository, domain events |
| [Event-Driven Architecture](./architecture/EVENTS.md) | Event bus, saga, outbox, event sourcing |

### Framework

| Document | Description |
|----------|-------------|
| [Core Modules](./framework/CORE.md) | Resilience, observability, security, DDD models, lifecycle, RBAC |
| [Runtime Kernel](./framework/RUNTIME.md) | Bootstrap, DI container, config, HTTP server, tenant context |
| [Adapters](./framework/ADAPTERS.md) | DB (Kysely), cache (Redis), storage (S3), auth (Keycloak), telemetry (OTel) |

### Security

| Document | Description |
|----------|-------------|
| [Security Overview](./security/README.md) | Security architecture summary |
| [Auth Architecture](./security/AUTH_ARCHITECTURE.md) | PKCE flow, Redis sessions, CSRF, token refresh, idle timeout, audit |
| [Rate Limiting](./security/RATE_LIMITING.md) | Token bucket, sliding window, per-tenant limiting |

### Infrastructure

| Document | Description |
|----------|-------------|
| [Infrastructure Overview](./infrastructure/README.md) | Resilience, observability, MESH stack |
| [Job Queue System](./infrastructure/JOBS.md) | BullMQ job processing, retry, priority queues |

### Deployment

| Document | Description |
|----------|-------------|
| [Deployment Overview](./deployment/README.md) | Prerequisites, startup, environments |
| [Quick Start](./deployment/QUICKSTART.md) | Install, start infrastructure, run kernel |
| [Environments](./deployment/ENVIRONMENTS.md) | Local, staging, production configuration |

### Meta Engine

| Document | Description |
|----------|-------------|
| [META Engine MVP](./meta-engine/mvp.md) | MVP specification |
| [Phase 1](./meta-engine/phase-1-complete.md) | Entity registration, versioning, compilation |
| [Phase 2](./meta-engine/phase-2-complete.md) | Policy engine, field-level security |
| [Phase 3](./meta-engine/phase-3-complete.md) | API layer, CRUD operations |
| [Advanced Features](./META_ENGINE_ADVANCED_FEATURES.md) | Advanced meta engine capabilities |
| [Compilation & Overlays](./COMPILATION_DETERMINISM.md) | Deterministic compilation, diagnostics, overlay engine |

### Runbooks

| Document | Description |
|----------|-------------|
| [Auth Operations](./runbooks/auth-operations.md) | Session management, outage recovery, debugging |
| [Keycloak IAM Setup](./runbooks/keycloak-iam-setup.md) | Roles, groups, token mappers, test users |

---

## Key Capabilities

- **Auth**: PKCE flow, Redis-backed sessions (no tokens in browser), CSRF, idle timeout, session rotation
- **Multi-Tenancy**: Per-tenant isolation at DB (RLS), cache (key prefix), storage (path prefix), and session levels
- **Resilience**: Circuit breakers, retry with backoff, adapter protection, graceful shutdown
- **Observability**: Health checks, Prometheus metrics, distributed tracing (W3C), structured JSON logging
- **Job Processing**: BullMQ with priority queues, retry strategies, concurrency control
- **Security**: Input validation (14+ types), XSS sanitization, rate limiting (token bucket + sliding window)
- **Meta Engine**: Dynamic entity registration, versioned schemas, deterministic compilation, tenant overlays

## Project Structure

```
athyper-private/
├── framework/
│   ├── core/                     @athyper/core — pure business logic
│   ├── runtime/                  @athyper/runtime — kernel, DI, HTTP, middleware
│   └── adapters/
│       ├── auth/                 @athyper/adapter-auth — Keycloak, JWKS
│       ├── db/                   @athyper/adapter-db — Kysely, PostgreSQL
│       ├── memorycache/          @athyper/adapter-memorycache — Redis
│       ├── objectstorage/        @athyper/adapter-objectstorage — S3/MinIO
│       └── telemetry/            @athyper/adapter-telemetry — OpenTelemetry
├── products/neon/
│   ├── apps/web/                 @neon/web — Next.js 16 application
│   ├── auth/                     @neon/auth — BFF session management
│   ├── shared/ui/                @neon/ui — product UI components
│   └── themes/                   @neon/theme — theme presets
├── packages/
│   ├── contracts/                @athyper/contracts — generated Zod + Kysely types
│   ├── ui/                       @athyper/ui — Radix component library
│   ├── theme/                    @athyper/theme — design tokens
│   ├── auth/                     @athyper/auth — shared auth utilities
│   ├── api-client/               @athyper/api-client — typed API client
│   ├── i18n/                     @athyper/i18n — internationalization
│   ├── dashboard/                @athyper/dashboard — dashboard widgets
│   └── workbench-*/              Admin, user, partner workbenches
├── mesh/                         Docker Compose infrastructure
├── tools/codegen/                Prisma -> Zod + Kysely pipeline
└── docs/                         This documentation
```

## Technology Stack

| Category | Technologies |
|----------|-------------|
| Runtime | Node.js 20, TypeScript 5.9, Express 4 |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Radix UI, Zustand 5 |
| Database | PostgreSQL 16, Kysely, Prisma 6, PgBouncer |
| Cache | Redis (ioredis), BullMQ |
| Auth | Keycloak, JOSE, PKCE (S256) |
| Storage | S3 (AWS SDK v3), MinIO |
| Observability | OpenTelemetry, Pino, Grafana, Prometheus, Tempo, Loki |
| Gateway | Traefik |
| Build | pnpm 10, Turbo 2.8, Vitest 4, tsup, ESLint 9 |

## Quick Links

- **Getting Started**: [Quick Start Guide](./deployment/QUICKSTART.md)
- **Architecture**: [System Overview](./architecture/OVERVIEW.md)
- **Auth Deep Dive**: [Auth Architecture](./security/AUTH_ARCHITECTURE.md)
- **Operations**: [Auth Operations Runbook](./runbooks/auth-operations.md)
