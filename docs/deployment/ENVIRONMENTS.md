# Environment Configuration

This document describes the three deployment environments for the athyper platform and provides a complete comparison of environment variables, kernel config parameters, and infrastructure wiring across all environments.

## Environment Overview

| | **Local** | **Staging** | **Production** |
|---|---|---|---|
| **Target OS** | Windows / macOS / Linux | Ubuntu | Ubuntu |
| **Purpose** | Developer workstations | Pre-production testing | Live system |
| **Domain suffix** | `*.athyper.local` | `*-stg.athyper.com` | `*.athyper.com` |
| **MESH .env template** | `mesh/env/local.env.example` | `mesh/env/staging.env.example` | `mesh/env/production.env.example` |
| **Kernel config** | `kernel.config.local.parameter.json` | `kernel.config.staging.parameter.json` | `kernel.config.production.parameter.json` |
| **TLS** | Self-signed (Traefik) | Real certificates | Real certificates |
| **Secrets source** | Hardcoded in `.env` | `${VAR}` references | `${VAR}` references |

## Two Config Files Per Environment

Each environment uses **two** configuration sources. They serve different purposes:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  1. MESH .env file  (mesh/env/.env)                                 │
│     Used by: Docker Compose (MESH infrastructure)                   │
│     Contains: Container settings, hostnames, memory limits,         │
│               database/Redis/S3 credentials for Docker services     │
│                                                                     │
│  2. Root .env file  (.env at repo root)                             │
│     Used by: Runtime kernel (pnpm runtime:start:dev)                │
│     Contains: Env vars for the Node.js process running on the host  │
│     Purpose: Infrastructure wiring (db, redis, s3) + kernel config  │
│                                                                     │
│  3. Kernel JSON config  (mesh/config/apps/athyper/kernel.config.*)  │
│     Used by: Runtime kernel config loader                           │
│     Contains: IAM realms, tenants, feature flags, policies          │
│     Note: LOCKED fields (db, redis, s3, telemetry) are stripped     │
└─────────────────────────────────────────────────────────────────────┘
```

## Config Precedence (Lowest to Highest)

```text
JSON config file  <  Standard env vars  <  Code overrides  <  SUPERSTAR env vars
```

SUPERSTAR variables (`ATHYPER_SUPER__*`) always win and cannot be overridden.

---

## Environment Variable Comparison

### Runtime Bootstrap

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `ENVIRONMENT` | `local` | `staging` | `production` |
| `MODE` | `api` | `api` | `api` |
| `SERVICE_NAME` | `athyper-runtime` | `athyper-runtime` | `athyper-runtime` |
| `PORT` | `3000` | `3000` | `3000` |
| `LOG_LEVEL` | `debug` | `info` | `warn` |
| `SHUTDOWN_TIMEOUT_MS` | `15000` | `30000` | `60000` |

### Public URLs

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `PUBLIC_BASE_URL` | `https://api.athyper.local` | `https://api-stg.athyper.com` | `https://api.athyper.com` |
| `PUBLIC_WEB_URL` | `https://neon.athyper.local` | `https://neon-stg.athyper.com` | `https://neon.athyper.com` |

### Base Paths (MESH .env only)

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `MESH_DATA` | `./mesh/data` | `/var/lib/athyper/mesh/data` | `/var/lib/athyper/mesh/data` |
| `MESH_CONFIG` | `./mesh/config` | `/etc/athyper/mesh/config` | `/etc/athyper/mesh/config` |

> **Windows note:** `MESH_DATA` and `MESH_CONFIG` use forward slashes (`./mesh/data`). Docker Compose handles them correctly on Windows. If you need absolute paths on Windows, use `C:/Users/you/athyper-private/mesh/data` (forward slashes).

### Database

| Variable | Local (MESH .env) | Local (root .env) | Staging | Production |
|----------|-------------------|-------------------|---------|------------|
| `DATABASE_URL` | `postgresql://athyperadmin:athyperadmin@dbpool-apps:6432/athyper_dev1` | `postgresql://athyper_user:athyperadmin@localhost:6432/athyper_dev1` | `postgresql://athyper_user:${DB_PASSWORD}@mesh.dbpool...:6432/athyper_test1` | `${DATABASE_URL}` |
| `DATABASE_ADMIN_URL` | `postgresql://athyperadmin:athyperadmin@db:5432/athyper_dev1` | `postgresql://athyper_user:athyperadmin@localhost:5432/athyper_dev1` | `postgresql://athyper_user:${DB_ADMIN_PASSWORD}@...:5432/athyper_test1` | `${DATABASE_ADMIN_URL}` |
| `DB_POOL_MAX` | `5` | `10` | `20` | `50` |
| `DB_ADMIN_PASSWORD` | `athyperadmin` | — | — | — |

> **Why two DATABASE_URL values for local?** The MESH .env uses Docker-internal hostnames (`dbpool-apps`) for containers. The root .env uses `localhost` because the runtime runs on the host, outside Docker.

### Redis

| Variable | Local (MESH .env) | Local (root .env) | Staging | Production |
|----------|-------------------|-------------------|---------|------------|
| `REDIS_URL` | `redis://:athyperadmin@memorycache:6379/0` | `redis://:athyperadmin@localhost:6379/0` | `redis://:${REDIS_PASSWORD}@redis-staging...:6379/0` | `${REDIS_URL}` |
| `MEMORYCACHE_PASSWORD` | `athyperadmin` | — | `${REDIS_PASSWORD}` | `${REDIS_PASSWORD}` |

### S3 / Object Storage (MinIO)

| Variable | Local (MESH .env) | Local (root .env) | Staging | Production |
|----------|-------------------|-------------------|---------|------------|
| `S3_ENDPOINT` | `http://objectstorage:9000` | `https://objectstorage.mesh.athyper.local` | `https://s3.staging.athyper.io` | `${S3_ENDPOINT}` |
| `S3_ACCESS_KEY` | `athyperadmin` | `athyperadmin` | `${S3_ACCESS_KEY}` | `${S3_ACCESS_KEY}` |
| `S3_SECRET_KEY` | `athyperadmin` | `athyperadmin` | `${S3_SECRET_KEY}` | `${S3_SECRET_KEY}` |
| `S3_REGION` | `us-east-1` | `us-east-1` | `us-east-1` | `${S3_REGION}` |
| `S3_BUCKET` | `athyper-local` | `athyper-local` | `athyper-staging` | `${S3_BUCKET}` |
| `S3_USE_SSL` | `false` | `true` | `true` | `true` |

> **Local S3 endpoints differ:** Inside Docker, MinIO is at `http://objectstorage:9000` (no TLS). From the host, MinIO is accessed through Traefik at `https://objectstorage.mesh.athyper.local` (self-signed TLS), requiring `NODE_TLS_REJECT_UNAUTHORIZED=0`.

### IAM (Keycloak)

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `IAM_ADMIN` | `athyperadmin` | `${IAM_ADMIN_USER}` | `${IAM_ADMIN_USER}` |
| `IAM_ADMIN_PASSWORD` | `athyperadmin` | `${IAM_ADMIN_PASSWORD}` | `${IAM_ADMIN_PASSWORD}` |
| `IAM_ISSUER_URL` | `https://iam.mesh.athyper.local/realms/athyper` | `https://iam.mesh-stg.athyper.com/realms/athyper` | `${IAM_ISSUER_URL}` |
| `IAM_CLIENT_ID` | `athyper-api` | `athyper-api` | `${IAM_CLIENT_ID}` |
| `IAM_CLIENT_SECRET` | `athyperadmin` | `${IAM_CLIENT_SECRET}` | `${IAM_CLIENT_SECRET}` |
| `ATHYPER_SUPER__IAM_SECRET__IAM_ATHYPER_CLIENT_SECRET` | `athyperadmin` | `${IAM_CLIENT_SECRET}` | `${IAM_CLIENT_SECRET}` |

### Telemetry

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `OTLP_ENDPOINT` | `http://logshipper:4318` | `http://logshipper:4318` | `${OTLP_ENDPOINT}` |
| `TELEMETRY_ADMIN_USER` | `athyperadmin` | `${GRAFANA_ADMIN_USER}` | `${GRAFANA_ADMIN_USER}` |
| `TELEMETRY_ADMIN_PASSWORD` | `athyperadmin` | `${GRAFANA_ADMIN_PASSWORD}` | `${GRAFANA_ADMIN_PASSWORD}` |

### Service Memory Limits (MESH .env only)

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `GATEWAY_MEMORY_LIMIT` | `128m` | `256m` | `512m` |
| `IAM_MEMORY_LIMIT` | `768m` | `1g` | `2g` |
| `OBJECTSTORAGE_MEMORY_LIMIT` | `256m` | `512m` | `1g` |
| `MEMORYCACHE_MEMORY_LIMIT` | `128m` | `256m` | `512m` |
| `MEMORYCACHE_EXPORTER_MEMORY_LIMIT` | `64m` | `64m` | `128m` |
| `TELEMETRY_MEMORY_LIMIT` | `256m` | `512m` | `1g` |
| `METRICS_MEMORY_LIMIT` | `384m` | `512m` | `1g` |
| `TRACING_MEMORY_LIMIT` | `256m` | `512m` | `1g` |
| `LOGGING_MEMORY_LIMIT` | `384m` | `512m` | `1g` |
| `LOGSHIPPER_MEMORY_LIMIT` | `64m` | `128m` | `256m` |
| `APPS_ATHYPER_MEMORY_LIMIT` | `256m` | `512m` | `1g` |
| `DB_MEMORY_LIMIT` | `512m` | `1g` | `2g` |
| `DBPOOL_APPS_MEMORY_LIMIT` | `64m` | `128m` | `256m` |
| `DBPOOL_AUTH_MEMORY_LIMIT` | `64m` | `128m` | `256m` |

### Hostnames (MESH .env only)

| Variable | Local | Staging | Production |
|----------|-------|---------|------------|
| `GATEWAY_HOST` | `gateway.mesh.athyper.local` | `gateway.mesh-stg.athyper.com` | `gateway.mesh.athyper.com` |
| `IAM_HOST` | `iam.mesh.athyper.local` | `iam.mesh-stg.athyper.com` | `iam.mesh.athyper.com` |
| `OBJECTSTORAGE_HOST` | `objectstorage.mesh.athyper.local` | `objectstorage.mesh-stg.athyper.com` | `objectstorage.mesh.athyper.com` |
| `OBJECTSTORAGE_CONSOLE_HOST` | `objectstorage.console.mesh.athyper.local` | `objectstorage.console.mesh-stg.athyper.com` | `objectstorage.console.mesh.athyper.com` |
| `TELEMETRY_HOST` | `telemetry.mesh.athyper.local` | `telemetry.mesh-stg.athyper.com` | `telemetry.mesh.athyper.com` |
| `METRICS_HOST` | `metrics.mesh.athyper.local` | `metrics.mesh-stg.athyper.com` | `metrics.mesh.athyper.com` |
| `TRACES_HOST` | `traces.mesh.athyper.local` | `traces.mesh-stg.athyper.com` | `traces.mesh.athyper.com` |
| `LOGS_HOST` | `logs.mesh.athyper.local` | `logs.mesh-stg.athyper.com` | `logs.mesh.athyper.com` |
| `APPS_ATHYPER_WEB_HOST` | `neon.athyper.local` | `neon-stg.athyper.com` | `neon.athyper.com` |
| `APPS_ATHYPER_API_HOST` | `api.athyper.local` | `api-stg.athyper.com` | `api.athyper.com` |

### Local-Only Variables (root .env)

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_TLS_REJECT_UNAUTHORIZED` | `0` | Allow self-signed TLS certs from MESH Traefik gateway |
| `AUTH_DEBUG_EXPOSE_TOKENS` | `true` | Enable `/api/auth/debug` route (never in production) |

---

## Kernel Config Parameter Comparison

These values come from the JSON config files in `mesh/config/apps/athyper/`. Fields marked **LOCKED** are stripped from the file at load time and must be set via environment variables.

### Runtime Settings (read from file)

| Field | Local | Staging | Production |
|-------|-------|---------|------------|
| `env` | `local` | `staging` | `production` |
| `mode` | `api` | `api` | `api` |
| `serviceName` | `athyper-runtime` | `athyper-runtime` | `athyper-runtime` |
| `port` | `3000` | `3000` | `3000` |
| `logLevel` | `debug` | `info` | `warn` |
| `shutdownTimeoutMs` | `15000` | `30000` | `60000` |
| `publicBaseUrl` | `https://api.athyper.local` | `https://api-stg.athyper.com` | `https://api.athyper.com` |
| `publicWebUrl` | `https://neon.athyper.local` | `https://neon-stg.athyper.com` | `https://neon.athyper.com` |

### Database (LOCKED from file)

| Field | Source | Local env var | Staging env var | Production env var |
|-------|--------|---------------|-----------------|---------------------|
| `db.url` | `DATABASE_URL` | `postgresql://...@localhost:6432/athyper_dev1` | `postgresql://...@mesh.dbpool...:6432/athyper_test1` | `${DATABASE_URL}` |
| `db.adminUrl` | `DATABASE_ADMIN_URL` | `postgresql://...@localhost:5432/athyper_dev1` | `postgresql://...@...:5432/athyper_test1` | `${DATABASE_ADMIN_URL}` |
| `db.poolMax` | File (not locked) | `5` | `20` | `50` |

### Redis (LOCKED from file)

| Field | Source | Local env var | Staging env var | Production env var |
|-------|--------|---------------|-----------------|---------------------|
| `redis.url` | `REDIS_URL` | `redis://:athyperadmin@localhost:6379/0` | `redis://:${REDIS_PASSWORD}@...:6379/0` | `${REDIS_URL}` |

### S3 / Object Storage (ALL LOCKED from file)

| Field | Source | Local | Staging | Production |
|-------|--------|-------|---------|------------|
| `s3.endpoint` | `S3_ENDPOINT` | `https://objectstorage.mesh.athyper.local` | `https://s3.staging.athyper.io` | `${S3_ENDPOINT}` |
| `s3.accessKey` | `S3_ACCESS_KEY` | `athyperadmin` | `${S3_ACCESS_KEY}` | `${S3_ACCESS_KEY}` |
| `s3.secretKey` | `S3_SECRET_KEY` | `athyperadmin` | `${S3_SECRET_KEY}` | `${S3_SECRET_KEY}` |
| `s3.region` | `S3_REGION` | `us-east-1` | `us-east-1` | `${S3_REGION}` |
| `s3.bucket` | `S3_BUCKET` | `athyper-local` | `athyper-staging` | `${S3_BUCKET}` |
| `s3.useSSL` | `S3_USE_SSL` | `true` | `true` | `true` |

### IAM (read from file, except strategy/defaults which are LOCKED)

| Field | Locked? | Local | Staging | Production |
|-------|---------|-------|---------|------------|
| `iam.strategy` | LOCKED | `single_realm` | `single_realm` | `single_realm` |
| `iam.defaultRealmKey` | LOCKED | `athyper` | `athyper` | `athyper` |
| `iam.defaultTenantKey` | LOCKED | `default` | `null` | `null` |
| `iam.defaultOrgKey` | LOCKED | `null` | `null` | `null` |
| `iam.requireTenantClaimsInProd` | No | `false` | `false` | **`true`** |

### IAM Realm Configuration (read from file — NOT locked)

| Field | Local | Staging | Production |
|-------|-------|---------|------------|
| `realms.athyper.iam.issuerUrl` | `https://iam.mesh.athyper.local/realms/athyper` | `https://iam.mesh-stg.athyper.com/realms/athyper` | `https://iam.mesh.athyper.com/realms/athyper` |
| `realms.athyper.iam.clientId` | `athyper-api` | `athyper-api` | `athyper-api` |
| `realms.athyper.iam.clientSecretRef` | `IAM_ATHYPER_CLIENT_SECRET` | `IAM_ATHYPER_CLIENT_SECRET` | `IAM_ATHYPER_CLIENT_SECRET` |

### Feature Flags & Policies (read from file — NOT locked)

| Field | Local | Staging | Production |
|-------|-------|---------|------------|
| `features.metaStudio` | `true` | `true` | **`false`** |
| `features.debugMode` | `true` | **`false`** | **`false`** |
| `policies.strictTenantIsolation` | `false` | **`true`** | **`true`** |

### Tenants (read from file — NOT locked)

| Field | Local | Staging | Production |
|-------|-------|---------|------------|
| Default tenant | `"default"` (with US/USD/UTC) | None (empty) | None (empty) |

### Telemetry (LOCKED from file)

| Field | Source | Local | Staging | Production |
|-------|--------|-------|---------|------------|
| `telemetry.enabled` | `TELEMETRY_ENABLED` | `true` | `true` | `true` |
| `telemetry.otlpEndpoint` | `OTLP_ENDPOINT` | `http://logshipper:4318` | `http://logshipper:4318` | `${OTLP_ENDPOINT}` |
| `telemetry.serviceName` | File (not locked) | `athyper-runtime` | `athyper-runtime` | `athyper-runtime` |
| `telemetry.serviceVersion` | File (not locked) | `1.0.0` | `1.0.0` | `1.0.0` |

---

## Locked Fields Reference

These fields are **stripped from JSON config files** at load time (see `LOCK_FROM_FILE` in `framework/runtime/src/kernel/config.ts`). They must be set via environment variables.

| Locked Config Path | Standard Env Var | SUPERSTAR Env Var |
|-------------------|------------------|-------------------|
| `db.url` | `DATABASE_URL` | `ATHYPER_SUPER__DATABASE_URL` |
| `db.adminUrl` | `DATABASE_ADMIN_URL` | `ATHYPER_SUPER__DATABASE_ADMIN_URL` |
| `redis.url` | `REDIS_URL` | `ATHYPER_SUPER__REDIS_URL` |
| `s3.endpoint` | `S3_ENDPOINT` | `ATHYPER_SUPER__S3_ENDPOINT` |
| `s3.accessKey` | `S3_ACCESS_KEY` | `ATHYPER_SUPER__S3_ACCESS_KEY` |
| `s3.secretKey` | `S3_SECRET_KEY` | `ATHYPER_SUPER__S3_SECRET_KEY` |
| `s3.region` | `S3_REGION` | `ATHYPER_SUPER__S3_REGION` |
| `s3.bucket` | `S3_BUCKET` | `ATHYPER_SUPER__S3_BUCKET` |
| `s3.useSSL` | `S3_USE_SSL` | `ATHYPER_SUPER__S3_USE_SSL` |
| `iam.strategy` | `IAM_STRATEGY` | `ATHYPER_SUPER__IAM_STRATEGY` |
| `iam.defaultRealmKey` | `IAM_DEFAULT_REALM` | `ATHYPER_SUPER__IAM_DEFAULT_REALM` |
| `iam.defaultTenantKey` | `IAM_DEFAULT_TENANT` | `ATHYPER_SUPER__IAM_DEFAULT_TENANT` |
| `iam.defaultOrgKey` | `IAM_DEFAULT_ORG` | `ATHYPER_SUPER__IAM_DEFAULT_ORG` |
| `telemetry.otlpEndpoint` | `OTLP_ENDPOINT` | `ATHYPER_SUPER__OTLP_ENDPOINT` |
| `telemetry.enabled` | `TELEMETRY_ENABLED` | `ATHYPER_SUPER__TELEMETRY_ENABLED` |
| IAM client secrets | — | `ATHYPER_SUPER__IAM_SECRET__<REF_NAME>` |

---

## Exposed Ports (Local Development)

When MESH runs on a developer workstation, these ports are exposed to `localhost` for the runtime (which runs outside Docker):

| Service | Container | Host Port | Used By |
|---------|-----------|-----------|---------|
| PostgreSQL | `db` | `5432` | Admin/migrations (`DATABASE_ADMIN_URL`) |
| PgBouncer (apps) | `dbpool-apps` | `6432` | Runtime queries (`DATABASE_URL`) |
| PgBouncer (auth) | `dbpool-auth` | `6433` | Keycloak only |
| Redis | `memorycache` | `6379` | Runtime sessions/cache (`REDIS_URL`) |
| Traefik HTTP | `gateway` | `80` | HTTP redirect |
| Traefik HTTPS | `gateway` | `443` | All HTTPS traffic (IAM, MinIO, apps) |

> **MinIO (S3) is not directly exposed.** It is accessed through the Traefik gateway at `https://objectstorage.mesh.athyper.local` (port 443). This requires the hosts file entry and `NODE_TLS_REJECT_UNAUTHORIZED=0`.

---

## Default Credentials (Local Only)

| Service | Username/Key | Password |
|---------|-------------|----------|
| PostgreSQL (admin) | `athyperadmin` | `athyperadmin` |
| PostgreSQL (app user) | `athyper_user` | `athyperadmin` |
| Redis | — | `athyperadmin` |
| MinIO (S3) | `athyperadmin` | `athyperadmin` |
| Keycloak (admin) | `athyperadmin` | `athyperadmin` |
| Grafana | `athyperadmin` | `athyperadmin` |
| IAM client secret | — | `athyperadmin` |

---

## Hostname Mapping (Local)

Add these to your hosts file (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):

```text
127.0.0.1 gateway.mesh.athyper.local
127.0.0.1 iam.mesh.athyper.local
127.0.0.1 objectstorage.mesh.athyper.local
127.0.0.1 objectstorage.console.mesh.athyper.local
127.0.0.1 telemetry.mesh.athyper.local
127.0.0.1 metrics.mesh.athyper.local
127.0.0.1 traces.mesh.athyper.local
127.0.0.1 logs.mesh.athyper.local
127.0.0.1 neon.athyper.local
127.0.0.1 api.athyper.local
```

---

## Switching Environments

### Reset MESH to a Different Environment

```bash
# Remove current .env
rm mesh/env/.env

# Run up.sh and select new environment
cd mesh/scripts
./up.sh
# Select: local | staging | production
```

### Check Current Environment

```bash
# View current MESH environment
grep ENVIRONMENT mesh/env/.env

# View kernel config path
grep ATHYPER_KERNEL_CONFIG_PATH .env
```

---

## File Map

```text
athyper-private/
├── .env.example                          # Root env template (runtime on host)
├── .gitattributes                        # Line ending rules (LF/CRLF)
├── mesh/
│   ├── env/
│   │   ├── .env.example                  # MESH generic template
│   │   ├── local.env.example             # MESH local (Windows/macOS/Linux)
│   │   ├── staging.env.example           # MESH staging (Ubuntu)
│   │   └── production.env.example        # MESH production (Ubuntu)
│   └── config/apps/athyper/
│       ├── kernel.config.schema.json     # JSON Schema (IDE validation)
│       ├── kernel.config.parameter.json  # Base template (reference only)
│       ├── kernel.config.local.parameter.json      # Local dev
│       ├── kernel.config.staging.parameter.json     # Staging
│       └── kernel.config.production.parameter.json  # Production
└── framework/runtime/src/kernel/
    ├── config.ts                         # Config loader (locks, merge, validate)
    └── config.schema.ts                  # Zod schema (RuntimeConfigSchema)
```

---

## See Also

- [Quick Start Guide](./QUICKSTART.md)
- [MESH Infrastructure](../../mesh/README.md)
- [Architecture Overview](../architecture/OVERVIEW.md)

---

[Back to Documentation Home](../README.md)
