# Athyper Platform Documentation

Central index for all platform documentation.

## Getting Started

| Document | Description |
| ---------- | ------------- |
| [Contributing Guide](../CONTRIBUTING.md) | New developer onboarding — setup, conventions, architecture rules, workflow |
| [Quick Start](./deployment/QUICKSTART.md) | Get running locally in under 10 minutes |

## Documentation Map

### Technical Reference

| Document | Description |
|----------|-------------|
| [Technical Specification](./TECHNICAL_SPECIFICATION.md) | Complete package catalog, 4-layer architecture, dependency matrix, META workflow, platform services |

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

### Neon Entity UI

| Document | Description |
|----------|-------------|
| [Entity UI Framework](./NEON_ENTITY_UI_FRAMEWORK.md) | Descriptor engine, plugin system, page shell, API surface, implementation phases |

### Meta Engine

| Document | Description |
|----------|-------------|
| [META Engine MVP](./meta-engine/mvp.md) | MVP specification |
| [Phase 1](./meta-engine/phase-1-complete.md) | Entity registration, versioning, compilation |
| [Phase 2](./meta-engine/phase-2-complete.md) | Policy engine, field-level security |
| [Phase 3](./meta-engine/phase-3-complete.md) | API layer, CRUD operations |
| [Advanced Features](./META_ENGINE_ADVANCED_FEATURES.md) | Advanced meta engine capabilities |
| [Compilation & Overlays](./COMPILATION_DETERMINISM.md) | Deterministic compilation, diagnostics, overlay engine |

### Platform Services

> These services are implemented in `framework/runtime/src/services/platform/` but do not yet have dedicated documentation.

| Service | Location | Description |
|---------|----------|-------------|
| Identity & Access | `identity-access/` | Role binding, group sync, OU membership, tenant resolution, entitlement snapshots |
| Policy Rules | `policy-rules/` | Policy compiler, rule evaluator, decision logging, simulation & testing |
| Workflow Engine | `workflow-engine/` | Workflow definitions, instance lifecycle, task management, SLA escalation, error recovery |
| Audit & Governance | `audit-governance/` | Audit log persistence, retention jobs, compliance API |
| Metadata Studio | `metadata-studio/` | Schema design, visual modeling, persistence & API layer |
| MFA | `foundation/iam/mfa/` | TOTP enrollment/verification, backup codes, middleware enforcement |

### Runbooks

| Document | Description |
|----------|-------------|
| [Auth Operations](./runbooks/auth-operations.md) | Session management, outage recovery, debugging |
| [Keycloak IAM Setup](./runbooks/keycloak-iam-setup.md) | Roles, groups, token mappers, test users |

---

## Key Capabilities

- **Auth**: PKCE flow, Redis-backed sessions (no tokens in browser), CSRF, idle timeout, session rotation
- **Multi-Tenancy**: Per-tenant isolation at DB (RLS), cache (key prefix), storage (path prefix), and session levels
- **Identity & Access**: Role binding, group sync, OU membership, tenant resolution, entitlement snapshots
- **MFA**: TOTP enrollment/verification, backup codes, MFA middleware enforcement
- **Policy Rules**: Policy compiler, rule evaluator, decision logging, policy simulation/testing
- **Workflow Engine**: Workflow definitions, instance lifecycle, task management, SLA escalation, error recovery
- **Audit & Governance**: Audit log persistence, retention jobs, compliance API
- **Metadata Studio**: Schema design, visual modeling, API layer
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
│   │   └── services/platform/
│   │       ├── automation-jobs/  BullMQ job processing
│   │       ├── audit-governance/ Audit logging, retention, compliance
│   │       ├── foundation/       Security, IAM, MFA, middleware, generic API
│   │       ├── identity-access/  Role binding, group sync, tenant resolver
│   │       ├── meta/             Dynamic entity registration, compilation
│   │       ├── metadata-studio/  Schema design, visual modeling
│   │       ├── policy-rules/     Policy evaluation, rule engine, testing
│   │       ├── ui/               Server-driven UI definitions
│   │       └── workflow-engine/  Workflow instances, tasks, recovery, SLA
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
├── tooling/
│   ├── eslint-config/            @athyper/eslint-config — shared ESLint rules
│   └── tsconfig/                 @athyper/tsconfig — shared TypeScript configs
├── tools/
│   ├── codegen/                  @athyper/codegen — Prisma -> Zod + Kysely pipeline
│   ├── devtools/                 Developer utilities (scripts)
│   ├── migrator/                 Database migration tooling
│   └── seeders/                  Database seed data
├── mesh/                         Docker Compose infrastructure
└── docs/                         This documentation
```

## Technology Stack

| Category | Technologies |
|----------|-------------|
| Runtime | Node.js 20, TypeScript 5.9, Express 4 |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Radix UI, Zustand 5 |
| Database | PostgreSQL 16, Kysely, Prisma 6 |
| Cache | Redis 7 (ioredis), BullMQ |
| Auth | Keycloak, JOSE, PKCE (S256) |
| Storage | S3 (AWS SDK v3), MinIO |
| Observability | OpenTelemetry, Pino, Grafana, Prometheus, Tempo, Loki |
| Gateway | Traefik |
| Build | pnpm 10, Turbo 2.8, Vitest 4, tsup, ESLint 9 |

## pnpm Scripts Reference

All scripts are run from the monorepo root via `pnpm run <script>`.

### Development

| Script | Description |
|--------|-------------|
| `dev` | Start all packages in dev/watch mode (Turbo, parallel) |
| `runtime:start` | Start the runtime kernel |
| `runtime:start:dev` | Start the runtime kernel in development mode |
| `runtime:start:watch` | Start the runtime kernel with file watching |

### Build & Quality

| Script | Description |
|--------|-------------|
| `build` | Build all packages (Turbo) |
| `build:all` | Build all packages, continue on errors |
| `lint` | Lint all packages (Turbo) |
| `lint:all` | Lint all packages, continue on errors |
| `lint:root` | Lint root config only (zero warnings) |
| `lint:fix` | Auto-fix lint issues across the repo |
| `typecheck` | Type-check all packages (Turbo) |
| `typecheck:all` | Type-check all packages, continue on errors |
| `format` | Format all files with Prettier |
| `format:changed` | Format only changed files |
| `format:check` | Check formatting without writing |
| `depcheck` | Run dependency-cruiser boundary validation |
| `check` | Full check: lint + typecheck + test + depcheck |
| `check:ci` | CI check: format:check + check |

### Testing

| Script | Description |
|--------|-------------|
| `test` | Run all tests (Turbo) |
| `test:all` | Run all tests, continue on errors |
| `test:policy` | Run policy engine tests only |
| `test:policy:ci` | Run policy engine tests (CI mode) |

### Database (Prisma)

| Script | Description |
|--------|-------------|
| `db:migrate` | Create a new Prisma migration |
| `db:migrate:dev` | Alias for `db:migrate` |
| `db:migrate:deploy` | Alias for `db:deploy` |
| `db:deploy` | Apply pending migrations to the database |
| `db:reset` | Reset database and re-apply all migrations |
| `db:generate` | Regenerate Prisma client |
| `db:pull` | Introspect database and update Prisma schema |
| `db:pull:force` | Force introspect (overwrite local schema) |
| `db:studio` | Open Prisma Studio (visual DB browser) |
| `kysely:codegen` | Generate Kysely types from database |

### Database Provisioning

| Script | Description |
|--------|-------------|
| `db:provision` | Provision database (DDL + seed) |
| `db:provision:ddl` | Run DDL provisioning only |
| `db:provision:seed` | Run seed data only |
| `db:provision:reset` | Reset and re-provision |
| `db:provision:status` | Show provisioning status |
| `db:provision:force` | Force re-provision |

### Meta Engine Migrations

| Script | Description |
|--------|-------------|
| `meta:migrate:plan` | Plan meta engine schema migration |
| `meta:migrate:dev` | Apply meta migration in development |
| `meta:migrate:deploy` | Deploy meta migration to target environment |
| `meta:migrate:sql` | Generate raw SQL for meta migration |

### Code Generation

| Script | Description |
|--------|-------------|
| `athyper:codegen` | Run Prisma -> Zod + Kysely code generation pipeline |
| `athyper:codegen:watch` | Run codegen in watch mode |
| `db:publish` | Publish generated types to packages |
| `db:publish:dry-run` | Preview publish without writing |

### Infrastructure (MESH)

| Script | Description |
|--------|-------------|
| `mesh:up` | Start all infrastructure services (Docker Compose) |
| `mesh:down` | Stop all infrastructure services |
| `mesh:logs` | Tail infrastructure logs (last 200 lines) |
| `mesh:ps` | Show running infrastructure containers |

### Maintenance

| Script | Description |
|--------|-------------|
| `clean` | Clean build artifacts across all packages |
| `clean:deps` | Remove node_modules and Turbo cache |
| `clean:all` | Full clean: artifacts + deps + lockfile |
| `clean:reset` | Full clean then reinstall and rebuild |
| `clean:deep` | Deep clean including generated files |
| `doctor` | Print Node.js, pnpm, and Turbo versions |
| `deps:why` | Show why a dependency is installed |
| `deps:outdated` | Show outdated dependencies across workspaces |
| `prune:neon-web` | Prune workspace for @neon/web Docker build |

## Quick Links

- **Technical Specification**: [Full Package & Architecture Reference](./TECHNICAL_SPECIFICATION.md)
- **Getting Started**: [Quick Start Guide](./deployment/QUICKSTART.md)
- **Architecture**: [System Overview](./architecture/OVERVIEW.md)
- **Auth Deep Dive**: [Auth Architecture](./security/AUTH_ARCHITECTURE.md)
- **Environments**: [Environment Configuration](./deployment/ENVIRONMENTS.md)
- **IAM Setup**: [Keycloak IAM Setup](./runbooks/keycloak-iam-setup.md)
- **Operations**: [Auth Operations Runbook](./runbooks/auth-operations.md)
- **Meta Engine**: [META Engine MVP](./meta-engine/mvp.md)
