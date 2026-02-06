# Quick Start Guide

Get the Athyper platform running locally in under 10 minutes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Starting the Platform](#starting-the-platform)
  - [Step 1: Start MESH Infrastructure](#step-1-start-mesh-infrastructure)
  - [Step 2: Initialize Data](#step-2-initialize-data)
  - [Step 3: Start Kernel](#step-3-start-kernel)
- [Verifying Installation](#verifying-installation)
- [Running Tests](#running-tests)
- [Daily Development Workflow](#daily-development-workflow)
- [Next Steps](#next-steps)

## Prerequisites

### Required Software

- **Node.js** >= 20.11.0 < 21
- **pnpm** 10.28.2 (exact version required)
- **Docker** & **Docker Compose** (for local infrastructure)
- **Git**

### System Requirements

- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 10GB free space
- **OS**: Windows, macOS, or Linux

### Installation

**Node.js**:
```bash
# Using nvm (recommended)
nvm install 20.11.0
nvm use 20.11.0

# Verify
node --version  # Should output v20.11.0
```

**pnpm**:
```bash
# Install specific version
npm install -g pnpm@10.28.2

# Verify
pnpm --version  # Should output 10.28.2
```

**Docker**:
- Download from [docker.com](https://www.docker.com/products/docker-desktop)
- Ensure Docker daemon is running

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd athyper-private
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# This installs dependencies for:
# - framework packages (core, runtime, adapters)
# - shared packages (contracts, ui, auth, etc.)
# - products (athyper-neon)
```

**Expected output**:
```
Lockfile is up to date, resolution step is skipped
Packages: +XXX
++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded 0, added XXX, done
```

### 3. Build Packages

```bash
# Build all packages in dependency order
pnpm turbo run build

# Or build specific packages
pnpm --filter @athyper/core build
pnpm --filter @athyper/runtime build
```

**Expected output**:
```
• Packages in scope: 15
• Running build in 15 packages
• Remote caching enabled

@athyper/core:build: cache hit, replaying logs [0.1s]
@athyper/runtime:build: cache hit, replaying logs [0.2s]
...

Tasks:    15 successful, 15 total
Cached:   15 cached, 15 total
Time:     1.5s >>> FULL TURBO
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings (optional for local development)
# The defaults work out of the box
```

**Minimal `.env` for local development**:
```env
ENVIRONMENT=local
MODE=api
PORT=3000
LOG_LEVEL=debug

# These will be set automatically by mesh:up
DATABASE_URL=postgres://athyper:athyper@localhost:6432/athyper
REDIS_URL=redis://localhost:6379

ATHYPER_KERNEL_CONFIG_PATH=mesh/config/apps/athyper/kernel.config.local.parameter.json
```

## Starting the Platform

The platform uses a two-phase startup: **MESH** (infrastructure) first, then **Kernel** (application).

```text
┌─────────────────────────────────────────────────────────────────┐
│                    STARTUP SEQUENCE                              │
├─────────────────────────────────────────────────────────────────┤
│  Phase 1: MESH Infrastructure                                    │
│  ├── Gateway (Traefik)                                          │
│  ├── IAM (Keycloak)                                             │
│  ├── MemoryCache (Redis)                                        │
│  ├── ObjectStorage (MinIO)                                      │
│  └── Telemetry (Grafana, Loki, Tempo, Prometheus)              │
│                           ↓                                      │
│  Phase 2: Kernel (Application)                                   │
│  └── Runtime API Server                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Start MESH Infrastructure

Navigate to the mesh scripts directory and run the startup script:

```bash
cd mesh/scripts
./up.sh
```

**First-time setup**: The script will prompt you to select an environment:

```
WARNING: .env not found: /path/to/mesh/env/.env

Select env template [local | staging | production] (blank=local): local

ENV_DIR       = /path/to/mesh/env
ENV TEMPLATE  = local
TEMPLATE_FILE = /path/to/mesh/env/local.env.example
TARGET_ENV    = /path/to/mesh/env/.env

Creating .env from template...
✅ Created: /path/to/mesh/env/.env
```

The script automatically:
1. Creates `.env` from the selected template
2. Reads `ENVIRONMENT` variable to determine which override file to use
3. Starts all Docker services with the correct configuration

**Expected output**:

```text
==========================
COMPOSE_DIR  = /path/to/mesh/compose
ENV_FILE     = /path/to/mesh/env/.env
ENVIRONMENT  = local
RUN_PROFILE  = mesh
OVERRIDE     = /path/to/mesh/compose/mesh.override.local.yml
==========================

✅ Mesh is UP (profile=mesh, env=local)
```

**Wait for services to be healthy** (30-60 seconds):
```bash
# Check status
./logs.sh   # View service logs
```

### Step 2: Initialize Data

Run the initialization script to set up database and IAM:

```bash
./init-data.sh
```

This runs:
- Database migrations
- IAM realm configuration
- Initial seed data

### Step 3: Start Kernel

Open a **new terminal** and start the kernel:

```bash
# Return to repository root
cd ../..

# Development mode (with hot reload)
pnpm runtime:start:dev

# Or with file watching
pnpm runtime:start:watch
```

**Expected output**:
```json
{"level":"info","msg":"runtime_starting","mode":"api","port":3000}
{"level":"info","msg":"database_connected"}
{"level":"info","msg":"redis_connected"}
{"level":"info","msg":"http_server_listening","port":3000}
```

### Configure Hosts File

Add these entries to your hosts file for local development:

**Linux/macOS** (`/etc/hosts`):
```bash
sudo nano /etc/hosts
```

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):

```bash
notepad C:\Windows\System32\drivers\etc\hosts
```

Add:

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

## Verifying Installation

### 1. Health Check

```bash
# Check API health
curl http://localhost:3000/health

# Expected response
{
  "status": "healthy",
  "dependencies": [
    { "name": "database", "status": "healthy", "responseTime": 45 },
    { "name": "cache", "status": "healthy", "responseTime": 12 },
    { "name": "storage", "status": "healthy", "responseTime": 23 }
  ]
}
```

### 2. Readiness Check

```bash
curl http://localhost:3000/readyz

# Expected: HTTP 200 OK
```

### 3. Metrics

```bash
# Check Prometheus metrics
curl http://localhost:3000/metrics

# Expected: Prometheus text format
# http_requests_total{method="GET",path="/health",status="200"} 1
# ...
```

### 4. Access Web Interfaces

**Keycloak** (IAM):

- URL: <http://iam.mesh.athyper.local>
- Admin: `admin` / `admin`

**MinIO** (Object Storage):

- Console: <http://objectstorage.console.mesh.athyper.local>
- Admin: `admin` / `password`

**Grafana** (Observability):

- URL: <http://telemetry.mesh.athyper.local>
- Admin: `admin` / `admin`

## Running Tests

### All Tests

```bash
# Run all tests
pnpm test

# With coverage
pnpm test:coverage

# With UI
pnpm test:ui
```

### Specific Package Tests

```bash
# Core tests
pnpm --filter @athyper/core test

# Runtime tests
pnpm --filter @athyper/runtime test

# Adapter tests
pnpm --filter @athyper/adapter-db test
```

### Watch Mode

```bash
# Watch mode (re-runs on file changes)
pnpm --filter @athyper/core test -- --watch
```

**Expected output**:

```text
✓ framework/core/src/resilience/retry.test.ts (14)
✓ framework/core/src/resilience/circuit-breaker.test.ts (12)
✓ framework/core/src/observability/health.test.ts (13)
✓ framework/core/src/security/rate-limiter.test.ts (20)
✓ framework/core/src/security/validator.test.ts (32)
✓ framework/core/src/security/sanitizer.test.ts (67)

Test Files  6 passed (6)
     Tests  158 passed (158)
  Start at  10:30:00
  Duration  2.5s (transform 150ms, setup 0ms, collect 800ms, tests 1.2s, environment 0ms, prepare 300ms)
```

## Daily Development Workflow

Once initial setup is complete, use this workflow for daily development:

```bash
# ═══════════════════════════════════════════════════════════
# Terminal 1: Start/verify MESH infrastructure
# ═══════════════════════════════════════════════════════════
cd mesh/scripts
./up.sh                    # Starts if not running, no-op if already up

# ═══════════════════════════════════════════════════════════
# Terminal 2: Start kernel with hot-reload
# ═══════════════════════════════════════════════════════════
pnpm runtime:start:watch   # Auto-restarts on file changes

# ═══════════════════════════════════════════════════════════
# When done: Shutdown
# ═══════════════════════════════════════════════════════════
# Stop kernel: Ctrl+C in Terminal 2

# Stop MESH infrastructure (optional - can leave running)
cd mesh/scripts
./down.sh
```

### Available MESH Scripts

| Script | Description |
| ------ | ----------- |
| `./up.sh` | Start all MESH services |
| `./up.sh mesh` | Start only core mesh profile |
| `./up.sh telemetry` | Start only telemetry profile |
| `./up.sh all` | Start all profiles |
| `./down.sh` | Stop all services |
| `./logs.sh` | View service logs |
| `./init-data.sh` | Initialize database and IAM |

### Available Kernel Scripts

| Script | Description |
| ------ | ----------- |
| `pnpm runtime:start` | Start kernel (production build) |
| `pnpm runtime:start:dev` | Start kernel (development mode) |
| `pnpm runtime:start:watch` | Start kernel with file watching |

## Next Steps

### 1. Explore the API

**Create a Test Request**:
```bash
# Example: List users (requires auth token)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/users

# Example: Create user
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"email":"test@example.com","name":"Test User"}' \
  http://localhost:3000/api/users
```

### 2. View Logs

```bash
# View mesh service logs
cd mesh/scripts
./logs.sh

# View specific service logs
./logs.sh iam
./logs.sh gateway

# View runtime logs (if running in background)
tail -f runtime.log
```

### 3. Stop Services

```bash
# Stop runtime (Ctrl+C if running in foreground)

# Stop mesh services
cd mesh/scripts
./down.sh
```

### 4. Read Documentation

- [System Architecture](../architecture/OVERVIEW.md)
- [Multi-Tenancy](../architecture/MULTI_TENANCY.md)
- [Core Framework](../framework/CORE.md)
- [Configuration](./CONFIGURATION.md)

### 5. Development Workflow

```bash
# 1. Make code changes
# 2. Run tests
pnpm test

# 3. Type check
pnpm turbo run typecheck

# 4. Lint
pnpm turbo run lint

# 5. Build
pnpm turbo run build

# 6. Test locally
pnpm dev
```

## Troubleshooting

### Port Conflicts

If ports are already in use:

```bash
# Check what's using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Stop conflicting service or change port
PORT=3001 pnpm dev
```

### Docker Issues

```bash
# Restart Docker daemon
# macOS: Docker Desktop > Restart
# Linux: sudo systemctl restart docker

# Clean up containers
docker compose -f mesh/compose/docker-compose.yml down -v
pnpm mesh:up
```

### Database Connection Failed

```bash
# Check PgBouncer is running
docker ps | grep pgbouncer

# Check connection
psql postgres://athyper:athyper@localhost:6432/athyper -c "SELECT 1"

# Reset database
pnpm mesh:down
pnpm mesh:up
pnpm db:migrate
```

### Redis Connection Failed

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli -h localhost -p 6379 ping
# Expected: PONG
```

### Build Errors

```bash
# Clear Turbo cache
pnpm turbo run build --force

# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
pnpm turbo run build
```

### Tests Failing

```bash
# Run tests with verbose output
pnpm test -- --reporter=verbose

# Run specific test file
pnpm test framework/core/src/security/validator.test.ts
```

## Getting Help

- **Documentation**: [docs/](../README.md)
- **Architecture**: [docs/architecture/](../architecture/README.md)
- **GitHub Issues**: [GitHub Issues](https://github.com/your-org/athyper/issues)

---

[← Back to Documentation Home](../README.md)
