# Quick Start Guide

Get the Athyper platform running locally in under 10 minutes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Starting the Platform](#starting-the-platform)
- [Verifying Installation](#verifying-installation)
- [Running Tests](#running-tests)
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

### 1. Start Local Infrastructure

The platform requires PostgreSQL, Redis, Keycloak, MinIO, and observability stack. Start everything with:

```bash
# Start complete local mesh
pnpm mesh:up

# This starts:
# - PostgreSQL (port 5432)
# - PgBouncer (port 6432)
# - Redis (port 6379)
# - Keycloak (http://mesh.iam.local)
# - MinIO (http://mesh.objectstorage.local)
# - Grafana (http://mesh.telemetry.local)
# - Prometheus, Tempo, Loki
```

**Expected output**:
```
[+] Running 12/12
 ✔ Container mesh-db-1              Started
 ✔ Container mesh-pgbouncer-1       Started
 ✔ Container mesh-redis-1           Started
 ✔ Container mesh-keycloak-1        Started
 ✔ Container mesh-minio-1           Started
 ✔ Container mesh-prometheus-1      Started
 ✔ Container mesh-tempo-1           Started
 ✔ Container mesh-loki-1            Started
 ✔ Container mesh-grafana-1         Started
```

**Wait for services to be healthy** (30-60 seconds):
```bash
# Check status
docker compose -f mesh/compose/docker-compose.yml ps

# All services should show "healthy" status
```

### 2. Configure Hosts File

Add these entries to your hosts file:

**Linux/macOS** (`/etc/hosts`):
```bash
sudo nano /etc/hosts
```

**Windows** (`C:\Windows\System32\drivers\etc\hosts`):
```bash
notepad C:\Windows\System32\drivers\etc\hosts
```

Add:
```
127.0.0.1 mesh.gateway.local
127.0.0.1 mesh.iam.local
127.0.0.1 mesh.objectstorage.local
127.0.0.1 mesh.telemetry.local
127.0.0.1 athyper.local
127.0.0.1 athyper.api.local
```

### 3. Run Database Migrations

```bash
# Run migrations
pnpm db:migrate

# Or manually
cd framework/adapters/db
pnpm kysely migrate:latest
```

**Expected output**:
```
Running migrations...
Migration "001_initial_schema.ts" was executed successfully
Migration "002_add_tenants.ts" was executed successfully
Migrations complete!
```

### 4. Start Runtime

**Option A: Development Mode (with hot reload)**

```bash
# Start API server
pnpm dev

# Server starts on http://localhost:3000
```

**Option B: Production Mode**

```bash
# Build first
pnpm turbo run build

# Start in API mode
MODE=api pnpm start
```

**Option C: Worker Mode**

```bash
# Start worker
MODE=worker pnpm start
```

**Expected output**:
```json
{"level":"info","msg":"runtime_starting","mode":"api","port":3000}
{"level":"info","msg":"database_connected"}
{"level":"info","msg":"redis_connected"}
{"level":"info","msg":"http_server_listening","port":3000}
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
- URL: http://mesh.iam.local
- Admin: `admin` / `admin`

**MinIO** (Object Storage):
- URL: http://mesh.objectstorage.local
- Admin: `admin` / `password`

**Grafana** (Observability):
- URL: http://mesh.telemetry.local
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
```
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
pnpm mesh:logs

# View specific service
docker compose -f mesh/compose/docker-compose.yml logs -f keycloak

# View runtime logs (if running in background)
tail -f runtime.log
```

### 3. Stop Services

```bash
# Stop runtime (Ctrl+C if running in foreground)

# Stop mesh services
pnpm mesh:down

# Stop and remove volumes (clean slate)
pnpm mesh:clean
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
