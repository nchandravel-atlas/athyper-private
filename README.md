# Athyper Platform

Multi-tenant SaaS platform built with TypeScript, Node.js, PostgreSQL, Redis, and React. Uses hexagonal architecture, DI-based runtime, and Redis-backed BFF auth.

## Documentation

See [docs/](docs/README.md) for full documentation:

- [Getting Started](docs/deployment/QUICKSTART.md) -- install, infrastructure, first run
- [Architecture](docs/architecture/README.md) -- system design, multi-tenancy, DDD, events
- [Framework](docs/framework/CORE.md) -- core modules, runtime kernel, adapters
- [Security](docs/security/README.md) -- auth, rate limiting, CSRF, validation
- [Infrastructure](docs/infrastructure/README.md) -- job queues, resilience, observability
- [Deployment](docs/deployment/README.md) -- environments, configuration
- [Runbooks](docs/runbooks/auth-operations.md) -- incident response, IAM setup
- [Meta Engine](docs/meta-engine/mvp.md) -- dynamic entity system, overlays

## Project Structure

```
athyper-private/
├── framework/                        # Core platform
│   ├── core/                         # @athyper/core — business logic, zero external deps
│   ├── runtime/                      # @athyper/runtime — kernel, DI, HTTP, middleware
│   └── adapters/
│       ├── auth/                     # @athyper/adapter-auth — Keycloak OIDC, JWKS (jose)
│       ├── db/                       # @athyper/adapter-db — PostgreSQL via Kysely + Prisma
│       ├── memorycache/              # @athyper/adapter-memorycache — Redis (ioredis)
│       ├── objectstorage/            # @athyper/adapter-objectstorage — S3/MinIO (AWS SDK)
│       └── telemetry/                # @athyper/adapter-telemetry — OpenTelemetry + Pino
├── products/neon/                    # Neon product
│   ├── apps/web/                     # @neon/web — Next.js 16 app (port 3001)
│   ├── auth/                         # @neon/auth — BFF session management, audit
│   ├── shared/ui/                    # @neon/ui — product-level UI components
│   └── themes/                       # @neon/theme — Tailwind theme presets
├── packages/                         # Shared libraries
│   ├── contracts/                    # @athyper/contracts — generated Zod + Kysely types
│   ├── ui/                           # @athyper/ui — Radix-based component library
│   ├── theme/                        # @athyper/theme — design tokens, Tailwind preset
│   ├── auth/                         # @athyper/auth — shared auth utilities
│   ├── api-client/                   # @athyper/api-client — typed API client
│   ├── i18n/                         # @athyper/i18n — internationalization (@formatjs)
│   ├── dashboard/                    # @athyper/dashboard — dashboard widgets
│   ├── workbench-admin/              # @athyper/workbench-admin — admin workbench
│   ├── workbench-user/               # @athyper/workbench-user — user workbench
│   └── workbench-partner/            # @athyper/workbench-partner — partner workbench
├── mesh/                             # Docker Compose infrastructure
│   ├── compose/                      # Base + per-environment overrides
│   ├── config/                       # Service configs (Keycloak, Traefik, etc.)
│   └── scripts/                      # up.sh, down.sh, logs.sh, init-data.sh
├── tools/codegen/                    # Prisma -> Zod + Kysely codegen pipeline
├── tooling/                          # ESLint config, shared tsconfig
└── docs/                             # All documentation
```

## Quick Start

```bash
pnpm install                          # Install dependencies
cd mesh/scripts && ./up.sh            # Start infrastructure (Docker)
pnpm dev                              # Start all services
```

See [docs/deployment/QUICKSTART.md](docs/deployment/QUICKSTART.md) for full setup.

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Node.js 20, TypeScript 5.9, Express 4, BullMQ |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Radix UI, Zustand 5 |
| Data | PostgreSQL 16, Kysely, Redis/ioredis, Prisma 6 |
| Auth | Keycloak, JOSE (JWT), PKCE, Redis sessions |
| Infra | Docker, Traefik, PgBouncer, MinIO (S3) |
| Observability | OpenTelemetry, Pino, Grafana, Prometheus, Tempo, Loki |
| Build | pnpm 10, Turbo 2.8, Vitest 4, tsup, ESLint 9 |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in dev mode |
| `pnpm build` | Build all packages |
| `pnpm test` | Run tests (Vitest) |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm check` | Lint + typecheck + test + depcheck |
| `pnpm mesh:up` | Start Docker infrastructure |
| `pnpm mesh:down` | Stop Docker infrastructure |
| `pnpm athyper:codegen` | Prisma -> Zod/Kysely codegen |
| `pnpm db:provision` | Seed database (DDL + data) |
| `pnpm db:migrate` | Run Prisma migrations (dev) |
| `pnpm db:studio` | Open Prisma Studio |
