# Infrastructure

Production infrastructure patterns: job processing, resilience, observability, and the MESH stack.

## Contents

| Document | Description |
|----------|-------------|
| [Job Queue System](./JOBS.md) | BullMQ job processing, retry, priority queues |

---

## Job Queue System

Redis-backed (BullMQ) with priority queues (critical/high/normal/low), retry with backoff, concurrency control, delayed jobs, bulk enqueue, graceful shutdown, and queue metrics.

- **Producer** (API mode): `jobQueue.add()`
- **Consumer** (Worker mode): `jobQueue.process()` with registered handlers

See [Job Queue System](./JOBS.md) for full API.

## Resilience Patterns

### Circuit Breakers (`framework/core/src/resilience/circuit-breaker.ts`)

CLOSED → OPEN → HALF_OPEN → CLOSED. Configurable failure/success thresholds. Per-adapter instances.

### Retry Logic (`framework/core/src/resilience/retry.ts`)

Strategies: exponential, linear, fixed backoff with jitter. Pre-configured: `DB_RETRY_POLICY`, `API_RETRY_POLICY`.

### Adapter Protection (`framework/runtime/src/resilience/adapter-protection.ts`)

Wraps every adapter with circuit breaker + retry + health check registration.

## Observability

### Health Checks (`framework/core/src/observability/health.ts`)

- `HealthCheckRegistry` with required vs optional checks
- Endpoints: `/health` (full status), `/readyz` (readiness)
- Aggregation: all required pass = healthy, some fail = degraded

### Metrics (`framework/core/src/observability/metrics.ts`)

Counter, Gauge, Histogram, Summary. HTTP metrics helper. Prometheus format at `/metrics`.

### Distributed Tracing (`framework/core/src/observability/tracing.ts`)

W3C Trace Context (traceparent). `RequestContextStorage` via `AsyncLocalStorage`. OpenTelemetry integration.

### Structured Logging

JSON via Pino. Automatic trace correlation (requestId, traceId, spanId).

### Graceful Shutdown (`framework/core/src/observability/shutdown.ts`)

Priority-based hooks: stop HTTP → drain jobs → close adapters. SIGTERM/SIGINT handlers with timeout.

## MESH Infrastructure Stack

Local infrastructure via Docker Compose (`mesh/`):

| Service | Technology | Purpose |
|---------|-----------|---------|
| Gateway | Traefik | Reverse proxy, TLS, routing |
| IAM | Keycloak | Identity provider, OIDC |
| Database | PostgreSQL 16 + PgBouncer | Data store + connection pooling |
| Cache | Redis | Sessions, jobs, rate limiting, caching |
| Storage | MinIO | S3-compatible object storage |
| Telemetry | Grafana + Prometheus + Tempo + Loki | Dashboards, metrics, traces, logs |

### Environments

| Environment | Domain |
|-------------|--------|
| Local | `*.athyper.local` |
| Staging | `*-t.athyper.com` |
| Production | `*.athyper.com` |

---

[Back to Documentation Home](../README.md)
