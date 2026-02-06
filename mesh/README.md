# athyper MESH - Infrastructure Stack

MESH (Managed Environment Services Hub) provides the complete infrastructure stack for the athyper platform, including gateway, identity management, caching, storage, and observability.

## Quick Start

```bash
# First-time setup
cd mesh/scripts
./up.sh              # Select environment when prompted
./init-data.sh       # Initialize database and IAM

# Daily use
./up.sh              # Start infrastructure
./logs.sh            # View logs
./down.sh            # Stop infrastructure
```

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MESH STACK                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         GATEWAY (Traefik)                            │    │
│  │                    Reverse Proxy & Load Balancer                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│        ┌───────────────────────────┼───────────────────────────┐            │
│        │                           │                           │            │
│        ▼                           ▼                           ▼            │
│  ┌───────────┐            ┌─────────────────┐          ┌─────────────┐     │
│  │    IAM    │            │  ObjectStorage  │          │  Telemetry  │     │
│  │ (Keycloak)│            │     (MinIO)     │          │  (Grafana)  │     │
│  └───────────┘            └─────────────────┘          └─────────────┘     │
│                                                               │              │
│                                                    ┌──────────┴──────────┐  │
│                                                    │                     │  │
│                                              ┌─────────┐ ┌───────┐ ┌─────┐  │
│                                              │ Metrics │ │Traces │ │Logs │  │
│                                              │(Prometheus)│(Tempo)│(Loki)│  │
│                                              └─────────┘ └───────┘ └─────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       MemoryCache (Redis)                            │    │
│  │                     Session & Cache Storage                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```text
mesh/
├── compose/                    # Docker Compose files
│   ├── mesh.base.yml          # Base configuration (networks, volumes)
│   ├── mesh.override.yml      # Default overrides
│   ├── mesh.override.local.yml       # Local environment overrides
│   ├── mesh.override.staging.yml     # Staging environment overrides
│   ├── mesh.override.production.yml  # Production environment overrides
│   ├── gateway/               # Traefik gateway
│   ├── iam/                   # Keycloak identity
│   ├── memorycache/           # Redis cache
│   ├── objectstorage/         # MinIO S3-compatible storage
│   ├── telemetry/             # Observability stack
│   └── apps/                  # Application services
├── config/                    # Service configurations
│   ├── gateway/               # Traefik dynamic config
│   ├── iam/                   # Keycloak realm exports
│   ├── telemetry/             # Grafana dashboards, Alloy config
│   └── apps/                  # Application configs
├── env/                       # Environment files
│   ├── .env                   # Active environment (git-ignored)
│   ├── local.env.example      # Local development template
│   ├── staging.env.example    # Staging template
│   └── production.env.example # Production template
└── scripts/                   # Management scripts
    ├── up.sh                  # Start services
    ├── down.sh                # Stop services
    ├── logs.sh                # View logs
    └── init-data.sh           # Initialize data
```

## Environments

MESH supports three environments with distinct hostname patterns:

| Environment | Domain Pattern | IP Address |
| ----------- | -------------- | ---------- |
| **local** | `*.athyper.local` | `127.0.0.1` |
| **staging** | `*-t.athyper.com` | `62.169.31.9` |
| **production** | `*.athyper.com` | `62.169.31.9` |

### Local Environment Hostnames

| Service | Hostname |
| ------- | -------- |
| Gateway | `gateway.mesh.athyper.local` |
| IAM | `iam.mesh.athyper.local` |
| Object Storage | `objectstorage.mesh.athyper.local` |
| Object Storage Console | `objectstorage.console.mesh.athyper.local` |
| Telemetry | `telemetry.mesh.athyper.local` |
| Metrics | `metrics.mesh.athyper.local` |
| Traces | `traces.mesh.athyper.local` |
| Logs | `logs.mesh.athyper.local` |
| Neon Web | `neon.athyper.local` |
| API | `api.athyper.local` |

### Staging Environment Hostnames

| Service | Hostname |
| ------- | -------- |
| Gateway | `gateway.mesh-t.athyper.com` |
| IAM | `iam.mesh-t.athyper.com` |
| Object Storage | `objectstorage.mesh-t.athyper.com` |
| Object Storage Console | `objectstorage.console.mesh-t.athyper.com` |
| Telemetry | `telemetry.mesh-t.athyper.com` |
| Metrics | `metrics.mesh-t.athyper.com` |
| Traces | `traces.mesh-t.athyper.com` |
| Logs | `logs.mesh-t.athyper.com` |
| Neon Web | `neon-t.athyper.com` |
| API | `api-t.athyper.com` |

### Production Environment Hostnames

| Service | Hostname |
| ------- | -------- |
| Gateway | `gateway.mesh.athyper.com` |
| IAM | `iam.mesh.athyper.com` |
| Object Storage | `objectstorage.mesh.athyper.com` |
| Object Storage Console | `objectstorage.console.mesh.athyper.com` |
| Telemetry | `telemetry.mesh.athyper.com` |
| Metrics | `metrics.mesh.athyper.com` |
| Traces | `traces.mesh.athyper.com` |
| Logs | `logs.mesh.athyper.com` |
| Neon Web | `neon.athyper.com` |
| API | `api.athyper.com` |

## Environment Detection

The MESH scripts automatically detect and configure the environment:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT DETECTION FLOW                    │
└─────────────────────────────────────────────────────────────────┘

  ./up.sh
      │
      ▼
  ┌─────────────────────┐
  │ Check mesh/env/.env │
  └─────────────────────┘
      │
      ├── EXISTS ──────────────────────────────────────┐
      │                                                │
      ▼                                                ▼
  ┌─────────────────────┐              ┌──────────────────────────┐
  │ Prompt for template │              │ Read ENVIRONMENT value   │
  │ [local|staging|     │              │ from .env file           │
  │  production]        │              └──────────────────────────┘
  └─────────────────────┘                              │
      │                                                ▼
      ▼                                ┌──────────────────────────┐
  ┌─────────────────────┐              │ Select override file:    │
  │ Copy template to    │              │                          │
  │ mesh/env/.env       │              │ local → mesh.override.   │
  └─────────────────────┘              │         local.yml        │
      │                                │ staging → mesh.override. │
      └────────────────────────────────│           staging.yml    │
                                       │ production → mesh.       │
                                       │   override.production.yml│
                                       └──────────────────────────┘
                                                       │
                                                       ▼
                                       ┌──────────────────────────┐
                                       │ docker compose up with   │
                                       │ selected override file   │
                                       └──────────────────────────┘
```

## Scripts Reference

### up.sh - Start Services

```bash
# Start with default profile (mesh)
./up.sh

# Start specific profile
./up.sh mesh        # Core infrastructure only
./up.sh telemetry   # Telemetry stack only
./up.sh apps        # Application services only
./up.sh all         # All services (no profile filter)
```

### down.sh - Stop Services

```bash
# Stop all services
./down.sh

# Stop specific profile
./down.sh mesh
./down.sh telemetry
```

### logs.sh - View Logs

```bash
# View all logs
./logs.sh

# View specific service logs
./logs.sh iam
./logs.sh gateway
./logs.sh memorycache
```

### init-data.sh - Initialize Data

```bash
# Run database migrations and IAM setup
./init-data.sh
```

## Service Profiles

MESH uses Docker Compose profiles to organize services:

| Profile | Services |
| ------- | -------- |
| `mesh` | gateway, iam, memorycache, objectstorage |
| `telemetry` | metrics, tracing, logging, logshipper, telemetry (Grafana) |
| `apps` | athyper (runtime application) |

## Ports Reference

### Local Development Ports

| Service | Internal Port | Host Port | Notes |
| ------- | ------------- | --------- | ----- |
| Gateway | 80 | 80 | HTTP |
| Gateway | 443 | 443 | HTTPS |
| Gateway | 8080 | 8080 | Dashboard |
| IAM | 8080 | - | Via gateway |
| MemoryCache | 6379 | 6379 | Redis |
| ObjectStorage | 9000 | 9000 | S3 API |
| ObjectStorage | 9001 | 9001 | Console |
| Metrics | 9090 | - | Prometheus |
| Tracing | 4317 | - | OTLP gRPC |
| Tracing | 4318 | - | OTLP HTTP |
| Logging | 3100 | - | Loki |
| Telemetry | 3000 | - | Grafana |

## Configuration

### Environment Variables

Key environment variables (see `env/*.env.example` for full list):

```bash
# Identity
ENVIRONMENT=local|staging|production
COMPOSE_PROJECT_NAME=athyper-mesh-{env}

# Hostnames
MESH_GATEWAY_HOST=gateway.mesh.athyper.local
MESH_IAM_HOST=iam.mesh.athyper.local
# ... (see env files for complete list)

# Secrets (local development only)
MESH_MEMORYCACHE_PASSWORD=redis_password
MESH_IAM_ADMIN=admin
MESH_IAM_ADMIN_PASSWORD=admin
MESH_OBJECTSTORAGE_ADMIN=admin
MESH_OBJECTSTORAGE_ADMIN_PASSWORD=password
```

### Local Hosts File

For local development, add these entries to your hosts file:

**Linux/macOS**: `/etc/hosts`
**Windows**: `C:\Windows\System32\drivers\etc\hosts`

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

## Troubleshooting

### Services Not Starting

```bash
# Check Docker is running
docker version

# Check service status
docker compose ps

# View logs for specific service
./logs.sh <service-name>
```

### Port Conflicts

```bash
# Check what's using a port
# Linux/macOS
lsof -i :80
lsof -i :443

# Windows
netstat -ano | findstr :80
```

### Reset Environment

```bash
# Stop all services and remove volumes
./down.sh
docker volume prune -f

# Restart fresh
./up.sh
./init-data.sh
```

### Database Connection Issues

```bash
# Check Redis is running
docker exec -it athyper-mesh-memorycache redis-cli ping
# Expected: PONG

# Check IAM database
docker exec -it athyper-mesh-iam /opt/keycloak/bin/kc.sh show-config
```

## See Also

- [Quick Start Guide](../docs/deployment/QUICKSTART.md)
- [Environment Configuration](../docs/deployment/ENVIRONMENTS.md)
- [Architecture Overview](../docs/architecture/OVERVIEW.md)
