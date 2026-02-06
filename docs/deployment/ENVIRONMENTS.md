# Environment Configuration

This document describes the three deployment environments for the athyper platform: **local**, **staging**, and **production**.

## Environment Overview

| Environment | Purpose | Domain Pattern | Configuration |
| ----------- | ------- | -------------- | ------------- |
| **local** | Developer workstations | `*.athyper.local` | `local.env.example` |
| **staging** | Pre-production testing | `*-t.athyper.com` | `staging.env.example` |
| **production** | Live system | `*.athyper.com` | `production.env.example` |

## How Environments Are Detected

### MESH Infrastructure

When you run `./mesh/scripts/up.sh`, the environment is determined by:

1. **First run**: Script prompts you to select an environment template
2. **Subsequent runs**: Reads `ENVIRONMENT` variable from `mesh/env/.env`

```text
mesh/env/.env (line 12):
ENVIRONMENT=local      # or staging, production
```

This value selects the Docker Compose override file:

| ENVIRONMENT | Override File |
| ----------- | ------------- |
| `local` | `mesh.override.local.yml` |
| `staging` | `mesh.override.staging.yml` |
| `production` | `mesh.override.production.yml` |

### Kernel Runtime

The kernel uses environment variables to determine configuration:

```bash
# Config file path
ATHYPER_KERNEL_CONFIG_PATH=apps/athyper/kernel.config.local.parameter.json

# Locked configuration (SUPERSTAR variables)
ATHYPER_SUPER__DB_URL=postgresql://...
ATHYPER_SUPER__REDIS_URL=redis://...
ATHYPER_SUPER__IAM_DEFAULT_REALM=athyper
```

## Local Environment

Development environment for individual developer workstations.

### Characteristics

- Runs on `127.0.0.1` (localhost)
- Uses `.athyper.local` domain suffix
- Debug logging enabled
- Relaxed security for development
- Local Docker containers for all services

### Hostname Mapping

| Component | Hostname |
| --------- | -------- |
| Gateway | `gateway.mesh.athyper.local` |
| IAM (Keycloak) | `iam.mesh.athyper.local` |
| Object Storage API | `objectstorage.mesh.athyper.local` |
| Object Storage Console | `objectstorage.console.mesh.athyper.local` |
| Telemetry (Grafana) | `telemetry.mesh.athyper.local` |
| Metrics (Prometheus) | `metrics.mesh.athyper.local` |
| Traces (Tempo) | `traces.mesh.athyper.local` |
| Logs (Loki) | `logs.mesh.athyper.local` |
| Neon Web App | `neon.athyper.local` |
| API Server | `api.athyper.local` |

### Hosts File Setup

Add to `/etc/hosts` (Linux/macOS) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

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

### Default Credentials (Local Only)

| Service | Username | Password |
| ------- | -------- | -------- |
| IAM (Keycloak) | `admin` | `admin` |
| Object Storage (MinIO) | `admin` | `password` |
| Telemetry (Grafana) | `admin` | `admin` |
| Redis | - | `redis_password` |

### Configuration File

Template: `mesh/env/local.env.example`

Key settings:

```bash
ENVIRONMENT=local
LOG_LEVEL=debug
SHUTDOWN_TIMEOUT_MS=10000

# Public URLs
PUBLIC_BASE_URL=https://api.athyper.local
PUBLIC_WEB_URL=https://neon.athyper.local
```

## Staging Environment

Pre-production testing environment that mirrors production configuration.

### Characteristics

- IP: `62.169.31.9`
- Uses `-t.athyper.com` domain suffix (test subdomain pattern)
- Info-level logging
- Production-like security settings
- Real TLS certificates

### Hostname Mapping

| Component | Hostname |
| --------- | -------- |
| Gateway | `gateway.mesh-t.athyper.com` |
| IAM (Keycloak) | `iam.mesh-t.athyper.com` |
| Object Storage API | `objectstorage.mesh-t.athyper.com` |
| Object Storage Console | `objectstorage.console.mesh-t.athyper.com` |
| Telemetry (Grafana) | `telemetry.mesh-t.athyper.com` |
| Metrics (Prometheus) | `metrics.mesh-t.athyper.com` |
| Traces (Tempo) | `traces.mesh-t.athyper.com` |
| Logs (Loki) | `logs.mesh-t.athyper.com` |
| Neon Web App | `neon-t.athyper.com` |
| API Server | `api-t.athyper.com` |

### Configuration File

Template: `mesh/env/staging.env.example`

Key settings:

```bash
ENVIRONMENT=staging
LOG_LEVEL=info
SHUTDOWN_TIMEOUT_MS=30000

# Public URLs
PUBLIC_BASE_URL=https://api-t.athyper.com
PUBLIC_WEB_URL=https://neon-t.athyper.com

# IAM
IAM_ISSUER_URL=https://iam.mesh-t.athyper.com/realms/athyper
```

### DNS Configuration

Staging DNS records point to `62.169.31.9`:

```text
gateway.mesh-t.athyper.com    A    62.169.31.9
iam.mesh-t.athyper.com        A    62.169.31.9
neon-t.athyper.com            A    62.169.31.9
api-t.athyper.com             A    62.169.31.9
# ... etc
```

## Production Environment

Live production system.

### Characteristics

- IP: `62.169.31.9`
- Uses `.athyper.com` domain suffix
- Warn-level logging (minimal verbosity)
- Full security hardening
- Real TLS certificates
- All secrets via secure secrets management

### Hostname Mapping

| Component | Hostname |
| --------- | -------- |
| Gateway | `gateway.mesh.athyper.com` |
| IAM (Keycloak) | `iam.mesh.athyper.com` |
| Object Storage API | `objectstorage.mesh.athyper.com` |
| Object Storage Console | `objectstorage.console.mesh.athyper.com` |
| Telemetry (Grafana) | `telemetry.mesh.athyper.com` |
| Metrics (Prometheus) | `metrics.mesh.athyper.com` |
| Traces (Tempo) | `traces.mesh.athyper.com` |
| Logs (Loki) | `logs.mesh.athyper.com` |
| Neon Web App | `neon.athyper.com` |
| API Server | `api.athyper.com` |

### Configuration File

Template: `mesh/env/production.env.example`

Key settings:

```bash
ENVIRONMENT=production
LOG_LEVEL=warn
SHUTDOWN_TIMEOUT_MS=60000

# Public URLs
PUBLIC_BASE_URL=https://api.athyper.com
PUBLIC_WEB_URL=https://neon.athyper.com

# Secrets via environment/secrets manager
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
IAM_CLIENT_SECRET=${IAM_CLIENT_SECRET}
```

### DNS Configuration

Production DNS records point to `62.169.31.9`:

```text
gateway.mesh.athyper.com    A    62.169.31.9
iam.mesh.athyper.com        A    62.169.31.9
neon.athyper.com            A    62.169.31.9
api.athyper.com             A    62.169.31.9
# ... etc
```

## Environment Variables

### Common Variables (All Environments)

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `ENVIRONMENT` | Environment identifier | `local`, `staging`, `production` |
| `COMPOSE_PROJECT_NAME` | Docker project name | `athyper-mesh-local` |
| `MODE` | Runtime mode | `api`, `worker`, `scheduler` |
| `PORT` | HTTP server port | `3000` |
| `LOG_LEVEL` | Logging verbosity | `debug`, `info`, `warn` |

### MESH Hostnames

| Variable | Description |
| -------- | ----------- |
| `MESH_GATEWAY_HOST` | Traefik gateway hostname |
| `MESH_IAM_HOST` | Keycloak hostname |
| `MESH_OBJECTSTORAGE_HOST` | MinIO S3 API hostname |
| `MESH_OBJECTSTORAGE_CONSOLE_HOST` | MinIO console hostname |
| `MESH_TELEMETRY_HOST` | Grafana hostname |
| `MESH_METRICS_HOST` | Prometheus hostname |
| `MESH_TRACES_HOST` | Tempo hostname |
| `MESH_LOGS_HOST` | Loki hostname |
| `APPS_ATHYPER_WEB_HOST` | Neon web app hostname |
| `APPS_ATHYPER_API_HOST` | API server hostname |

### SUPERSTAR Variables (Kernel Secrets)

Variables with `ATHYPER_SUPER__` prefix are "locked" configuration that overrides file-based config:

| Variable | Description |
| -------- | ----------- |
| `ATHYPER_SUPER__DB_URL` | PostgreSQL connection string |
| `ATHYPER_SUPER__REDIS_URL` | Redis connection string |
| `ATHYPER_SUPER__S3_ENDPOINT` | S3-compatible endpoint URL |
| `ATHYPER_SUPER__S3_ACCESS_KEY` | S3 access key |
| `ATHYPER_SUPER__S3_SECRET_KEY` | S3 secret key |
| `ATHYPER_SUPER__IAM_DEFAULT_REALM` | Default Keycloak realm |
| `ATHYPER_SUPER__IAM_SECRET__*` | IAM client secrets |

## Switching Environments

### Reset to Different Environment

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
# View current environment
grep ENVIRONMENT mesh/env/.env

# View full configuration
cat mesh/env/.env | grep -v "^#" | grep -v "^$"
```

## See Also

- [Quick Start Guide](./QUICKSTART.md)
- [MESH Infrastructure](../../mesh/README.md)
- [Architecture Overview](../architecture/OVERVIEW.md)

---

[Back to Documentation Home](../README.md)
