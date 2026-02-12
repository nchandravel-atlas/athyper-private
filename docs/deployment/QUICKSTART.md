# Quick Start Guide

Get the Athyper platform running locally in under 10 minutes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Starting the Platform](#starting-the-platform)
  - [Step 1: Start MESH Infrastructure](#step-1-start-mesh-infrastructure)
  - [Step 2: Initialize Data](#step-2-initialize-data)
  - [Step 3: Start Kernel](#step-3-start-kernel)
  - [Step 4: Start Neon Web App](#step-4-start-neon-web-app)
- [Verifying Installation](#verifying-installation)
- [Running Tests](#running-tests)
- [Daily Development Workflow](#daily-development-workflow)
- [Next Steps](#next-steps)

## Prerequisites

### Required Software

| Tool | Version | Notes |
| ------ | --------- | ------- |
| **Node.js** | 20.20.0 (pinned in `.nvmrc`) | Engine constraint: `>=20.11.0 <21` |
| **pnpm** | 10.28.2 (pinned in `package.json`) | Managed via corepack |
| **Docker** & **Docker Compose** | Latest stable | For local MESH infrastructure |
| **Git** | >= 2.30 | |

### System Requirements

- **RAM**: 8GB minimum (16GB recommended — Docker services use ~4GB)
- **Disk**: 10GB free space
- **OS**: Windows, macOS, or Linux

### Install Node.js

```bash
# Using nvm (recommended)
nvm install    # Reads .nvmrc automatically → installs 20.20.0
nvm use        # Activates the correct version

# Verify
node --version  # Should output v20.20.0
```

> **Tip**: If `nvm install` doesn't read `.nvmrc` automatically, run `nvm install 20.20.0` explicitly.

### Install pnpm via Corepack

The project uses the `packageManager` field in `package.json` to pin pnpm 10.28.2. Corepack (bundled with Node.js) handles this automatically:

```bash
# Enable corepack (one-time)
corepack enable

# Verify — pnpm is now available at the correct version
pnpm --version  # Should output 10.28.2
```

> **Why corepack?** It reads `"packageManager": "pnpm@10.28.2"` from `package.json` and ensures every developer uses the exact same version. No manual `npm install -g pnpm` needed.

### Install Docker

- **Windows**: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop) (requires WSL2)
- **macOS**: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
- **Linux**: `sudo apt install docker.io docker-compose-plugin` (or equivalent)

Ensure the Docker daemon is running before proceeding.

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
# - products (neon)
```

**Expected output**:

```text
Lockfile is up to date, resolution step is skipped
Packages: +XXX
++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved XXX, reused XXX, downloaded 0, added XXX, done
```

### 3. Build Packages

```bash
# Build all packages in dependency order
pnpm build

# Or build specific packages
pnpm --filter @athyper/core build
pnpm --filter @athyper/runtime build
```

### 4. Configure Environment (Required)

> **This step is mandatory.** The runtime requires database, Redis, and S3 connection
> details that can only be provided via environment variables (they are locked from
> the JSON config file for security). Skipping this step causes a
> `CONFIG_VALIDATION_ERROR` at startup.

```bash
# Copy example environment file
# Windows (PowerShell):
Copy-Item .env.example .env

# macOS/Linux:
cp .env.example .env
```

Review the `.env` and ensure these values are set. The defaults in `.env.example` work with the local MESH stack on **both Windows and Linux/macOS** — no OS-specific edits needed:

```env
ENVIRONMENT=local
MODE=api
PORT=3000
LOG_LEVEL=debug

# ── Kernel config file (IAM realms, feature flags, etc.) ──
ATHYPER_KERNEL_CONFIG_PATH=mesh/config/apps/athyper/kernel.config.local.parameter.json

# ── Database (PgBouncer exposed on localhost:6432 by MESH) ──
DATABASE_URL=postgresql://athyper_user:athyperadmin@localhost:6432/athyper_dev1

# ── Redis (exposed on localhost:6379 by MESH) ──
REDIS_URL=redis://:athyperadmin@localhost:6379/0

# ── S3 / MinIO (accessed via Traefik gateway) ──
S3_ENDPOINT=https://objectstorage.mesh.athyper.local
S3_ACCESS_KEY=athyperadmin
S3_SECRET_KEY=athyperadmin
S3_REGION=us-east-1
S3_BUCKET=athyper-local
S3_USE_SSL=true

# ── IAM client secret (Keycloak) ──
ATHYPER_SUPER__IAM_SECRET__IAM_ATHYPER_CLIENT_SECRET=athyperadmin

# ── Local TLS (MESH uses self-signed certs) ──
NODE_TLS_REJECT_UNAUTHORIZED=0
```

> **Why env vars instead of the JSON config?** Infrastructure wiring (`db.url`,
> `redis.url`, `s3.*`) is *locked* from JSON config files to prevent secrets from
> being committed to version control. These values must come from environment
> variables or SUPERSTAR (`ATHYPER_SUPER__*`) overrides.
>
> **Path note:** `ATHYPER_KERNEL_CONFIG_PATH` uses forward slashes, which work on
> all operating systems. The path resolves relative to the repo root (`process.cwd()`).

### 5. Configure Hosts File

Add these entries to your hosts file for local domain resolution:

**Windows** (`C:\Windows\System32\drivers\etc\hosts` — run Notepad as Administrator):

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

**Linux/macOS** (`/etc/hosts`):

```bash
sudo nano /etc/hosts
# Add the same entries as above
```

## Starting the Platform

The platform uses a two-phase startup: **MESH** (infrastructure) first, then **Application** (kernel + web).

```text
┌─────────────────────────────────────────────────────────────────┐
│                    STARTUP SEQUENCE                              │
├─────────────────────────────────────────────────────────────────┤
│  Phase 1: MESH Infrastructure (Docker Compose)                  │
│  ├── Database (PostgreSQL 16 + PgBouncer)                       │
│  ├── MemoryCache (Redis 7)                                      │
│  ├── IAM (Keycloak)                                             │
│  ├── Gateway (Traefik)                                          │
│  ├── ObjectStorage (MinIO)                                      │
│  └── Telemetry (Grafana, Loki, Tempo, Prometheus)              │
│                           ↓                                      │
│  Phase 2: Application                                            │
│  ├── Runtime Kernel (Express API on port 3000)                  │
│  └── Neon Web App (Next.js on port 3001)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Start MESH Infrastructure

```bash
# From repo root — use pnpm script
pnpm mesh:up

# Or use the shell script directly (macOS/Linux/WSL)
cd mesh/scripts
./up.sh
```

**First-time setup**: The script will prompt you to select an environment:

```text
WARNING: .env not found: /path/to/mesh/env/.env

Select env template [local | staging | production] (blank=local): local

ENV_DIR       = /path/to/mesh/env
ENV TEMPLATE  = local
TEMPLATE_FILE = /path/to/mesh/env/local.env.example
TARGET_ENV    = /path/to/mesh/env/.env

Creating .env from template...
✅ Created: /path/to/mesh/env/.env
```

**Wait for services to be healthy** (30-60 seconds):

```bash
# Check status
pnpm mesh:ps      # Show running containers
pnpm mesh:logs    # Tail service logs
```

### Step 2: Initialize Data

Run the initialization script to set up database and IAM (first time only):

```bash
cd mesh/scripts
./init-data.sh
```

This runs:

- Database migrations (creates tables)
- IAM realm configuration (Keycloak setup)
- Initial seed data

### Step 3: Start Kernel

> **Prerequisites:** MESH must be running (Step 1), data initialized (Step 2), and
> `.env` configured (Installation Step 4). If you skip the `.env` setup, the kernel
> will fail with `CONFIG_VALIDATION_ERROR` for missing `db.url`, `redis.url`, and
> `s3.*` values.

Open a **new terminal** and start the runtime kernel:

```bash
# Development mode (with hot reload)
pnpm runtime:start:dev

# Or with file watching (auto-restart on changes)
pnpm runtime:start:watch
```

**Expected output**:

```json
{"level":"info","msg":"runtime_starting","mode":"api","port":3000}
{"level":"info","msg":"database_connected"}
{"level":"info","msg":"redis_connected"}
{"level":"info","msg":"http_server_listening","port":3000}
```

### Step 4: Start Neon Web App

Open a **third terminal** and start the Next.js frontend:

```bash
# Start the Neon web app (port 3001)
pnpm --filter @neon/web dev
```

**Expected output**:

```text
▲ Next.js 16.x.x
- Local:    http://localhost:3001
- Network:  http://xxx.xxx.xxx.xxx:3001

✓ Starting...
✓ Ready in Xs
```

Access the web app at: `http://neon.athyper.local` (via Traefik gateway) or `http://localhost:3001` (direct).

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
```

### 4. Access Web Interfaces

| Service | URL | Credentials |
| --------- | ------- | --------------- |
| **Neon Web App** | `http://neon.athyper.local` or `http://localhost:3001` | — |
| **Keycloak** (IAM) | `http://iam.mesh.athyper.local` | admin / admin |
| **MinIO** (Storage) | `http://objectstorage.console.mesh.athyper.local` | admin / password |
| **Grafana** (Observability) | `http://telemetry.mesh.athyper.local` | admin / admin |

## Running Tests

### All Tests

```bash
# Run all tests via Turbo
pnpm test

# Run all with continuation on failure
pnpm test:all
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

### Full Quality Check

```bash
# Lint + typecheck + test + dependency boundary validation
pnpm check

# CI-mode (also checks formatting)
pnpm check:ci
```

## Daily Development Workflow

Once initial setup is complete, this is the typical daily workflow:

```bash
# ═══════════════════════════════════════════════════════════
# Terminal 1: Start/verify MESH infrastructure
# ═══════════════════════════════════════════════════════════
pnpm mesh:up                   # Starts if not running, no-op if already up

# ═══════════════════════════════════════════════════════════
# Terminal 2: Start runtime kernel with hot-reload
# ═══════════════════════════════════════════════════════════
pnpm runtime:start:watch       # Auto-restarts on file changes

# ═══════════════════════════════════════════════════════════
# Terminal 3: Start Neon web app
# ═══════════════════════════════════════════════════════════
pnpm --filter @neon/web dev    # Next.js dev server on port 3001

# ═══════════════════════════════════════════════════════════
# Terminal 4 (optional): Run dev across all packages
# ═══════════════════════════════════════════════════════════
pnpm dev                       # Turbo runs all dev scripts in parallel

# ═══════════════════════════════════════════════════════════
# When done
# ═══════════════════════════════════════════════════════════
# Stop kernel: Ctrl+C in Terminal 2
# Stop web app: Ctrl+C in Terminal 3
# Stop MESH (optional — can leave running):
pnpm mesh:down
```

### Available MESH Scripts

| Script | Description |
| ------ | ----------- |
| `pnpm mesh:up` | Start all MESH services |
| `pnpm mesh:down` | Stop all MESH services |
| `pnpm mesh:logs` | Tail MESH service logs |
| `pnpm mesh:ps` | Show running MESH containers |

For advanced MESH control (shell scripts in `mesh/scripts/`):

| Script | Description |
| ------ | ----------- |
| `./up.sh` | Start with default profile (mesh) |
| `./up.sh mesh` | Start only core mesh profile |
| `./up.sh telemetry` | Start only telemetry profile |
| `./up.sh all` | Start all profiles |
| `./down.sh` | Stop all services |
| `./logs.sh` | View service logs |
| `./init-data.sh` | Initialize database and IAM |

## Next Steps

After getting the platform running:

1. **Read the architecture docs** — [System Architecture](../architecture/OVERVIEW.md), [Multi-Tenancy](../architecture/MULTI_TENANCY.md)
2. **Understand the codebase** — [Contributing Guide](../../CONTRIBUTING.md) covers conventions, boundaries, and workflow
3. **Explore the API** — Health check at `http://localhost:3000/health`, Prisma Studio via `pnpm db:studio`
4. **Run the quality checks** — `pnpm check` runs lint + typecheck + test + depcheck
5. **Check dependency boundaries** — `pnpm depcheck` validates architecture rules

## Troubleshooting

### CONFIG_VALIDATION_ERROR at Startup

If the kernel exits immediately with an error like:

```text
KernelConfigError: Invalid runtime config:
db.url: Required
redis.url: Required
s3.endpoint: Required
s3.accessKey: Required
s3.secretKey: Required
```

This means the `.env` file at the repo root is missing or incomplete. Fix:

1. Ensure `.env` exists: `cp .env.example .env`
2. Verify it contains `DATABASE_URL`, `REDIS_URL`, and all `S3_*` variables (see [Installation Step 4](#4-configure-environment-required))
3. Ensure MESH is running: `pnpm mesh:ps` — the database and Redis must be up before the kernel can connect

> **Note:** These values cannot come from the JSON config file — `db.url`, `redis.url`,
> and `s3.*` are locked from file sources and must be set via environment variables.

### Port Conflicts

```bash
# Check what's using a port
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# macOS/Linux
lsof -i :3000
lsof -i :3001

# Change port if needed
PORT=3002 pnpm runtime:start:dev
```

### Docker Issues

```bash
# Check Docker is running
docker version

# Restart from scratch
pnpm mesh:down
docker volume prune -f
pnpm mesh:up
cd mesh/scripts && ./init-data.sh
```

### Database Connection Failed

```bash
# Check PgBouncer is running
docker ps | grep pgbouncer

# Check connection
psql postgres://athyperadmin:athyperadmin@localhost:6432/athyper_dev1 -c "SELECT 1"

# Reset database
pnpm mesh:down
pnpm mesh:up
cd mesh/scripts && ./init-data.sh
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
# Clear Turbo cache and rebuild
pnpm build --force

# Nuclear option: clear everything and start fresh
pnpm clean:reset
```

### Tests Failing

```bash
# Run tests with verbose output
pnpm test -- --reporter=verbose

# Run a specific test file
pnpm --filter @athyper/core test -- src/security/validator.test.ts
```

### Windows-Specific Issues

**Shell scripts**: MESH scripts (`up.sh`, `down.sh`, etc.) require a bash-compatible shell. Options:

- **WSL2** (recommended): Run from a WSL terminal
- **Git Bash**: Included with Git for Windows
- **Use pnpm scripts instead**: `pnpm mesh:up`, `pnpm mesh:down`, `pnpm mesh:logs`

**Line endings**: Ensure Git is configured for the project:

```bash
git config core.autocrlf input
```

**Long paths**: Enable long path support if you encounter path length errors:

```bash
git config core.longpaths true
```

## Getting Help

- **Documentation**: [docs/](../README.md)
- **Contributing**: [CONTRIBUTING.md](../../CONTRIBUTING.md)
- **Architecture**: [docs/architecture/](../architecture/README.md)

---

[← Back to Documentation Home](../README.md)
