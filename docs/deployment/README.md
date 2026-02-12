# Deployment

Environment setup, configuration, and deployment for the Athyper platform.

## Contents

| Document | Description |
|----------|-------------|
| [Quick Start](./QUICKSTART.md) | Get running locally in under 10 minutes |
| [Environments](./ENVIRONMENTS.md) | Local, staging, production configuration |

## Prerequisites

- **Node.js** 20.20.0 (pinned in `.nvmrc`, engine: `>=20.11.0 <21`)
- **pnpm** 10.28.2 (pinned in `package.json`, use `corepack enable`)
- **Docker** + **Docker Compose**

## Two-Phase Startup

```
Phase 1: MESH Infrastructure (Docker Compose)
  ├── Gateway (Traefik)         — reverse proxy, routing
  ├── IAM (Keycloak)            — identity provider
  ├── Database (PostgreSQL)     — primary store + PgBouncer
  ├── Cache (Redis)             — sessions, jobs, rate limiting
  ├── Storage (MinIO)           — S3-compatible objects
  └── Telemetry (Grafana stack) — metrics, traces, logs

Phase 2: Application
  └── Runtime kernel (API / Worker / Scheduler mode)
```

## Quick Commands

```bash
pnpm install                          # Install dependencies
cd mesh/scripts && ./up.sh            # Start infrastructure
cd mesh/scripts && ./init-data.sh     # Initialize data (first time)
pnpm runtime:start:dev                # Start kernel (dev)
pnpm runtime:start:watch              # Start kernel (watch mode)
```

## Environments

| Environment | Domain | Config |
|-------------|--------|--------|
| Local | `*.athyper.local` | `mesh/env/local.env.example` |
| Staging | `*-t.athyper.com` | `mesh/env/staging.env.example` |
| Production | `*.athyper.com` | `mesh/env/production.env.example` |

See [Environments](./ENVIRONMENTS.md) for complete setup.

## Runtime Modes

| Mode | Purpose |
|------|---------|
| `api` | HTTP API server (Express, routes, middleware, auth) |
| `worker` | Background job processing (BullMQ consumer) |
| `scheduler` | Cron-like scheduled tasks |

Set via `MODE` environment variable.

## Configuration

**JSON parameter files** -- per-environment config (IAM realms, tenants, feature flags):
- Path: `ATHYPER_KERNEL_CONFIG_PATH`
- Validated via Zod (`kernel/config.schema.ts`)

**SUPERSTAR env vars** -- secrets and infrastructure endpoints:
- Prefix: `ATHYPER_SUPER__`
- Examples: `ATHYPER_SUPER__DB_URL`, `ATHYPER_SUPER__REDIS_URL`, `ATHYPER_SUPER__IAM_SECRET__*`

## Codegen

```bash
pnpm athyper:codegen                  # Prisma -> Zod + Kysely -> @athyper/contracts
pnpm athyper:codegen:watch            # Watch mode
```

Input: `framework/adapters/db/src/prisma/schema.prisma`
Output: `packages/contracts/generated/prisma/{zod,kysely}/`

## Verification

```bash
curl http://localhost:3000/health      # Health check
curl http://localhost:3000/readyz      # Readiness
curl http://localhost:3000/metrics     # Prometheus metrics
```

## Web Interfaces (Local)

| Service | URL | Credentials |
|---------|-----|-------------|
| Keycloak | `http://iam.mesh.athyper.local` | admin / admin |
| MinIO | `http://objectstorage.console.mesh.athyper.local` | admin / password |
| Grafana | `http://telemetry.mesh.athyper.local` | admin / admin |

---

[Back to Documentation Home](../README.md)
