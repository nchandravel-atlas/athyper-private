# System Architecture Overview

This document provides a detailed overview of the Athyper platform architecture, covering system components, data flow, and integration patterns.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Component Overview](#component-overview)
- [Data Flow](#data-flow)
- [Runtime Modes](#runtime-modes)
- [Integration Patterns](#integration-patterns)
- [Scalability Architecture](#scalability-architecture)

## High-Level Architecture

The Athyper platform follows a **hexagonal architecture** (ports and adapters) pattern with three main layers:

```
┌─────────────────────────────────────────────────────────┐
│                     Products Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Web Apps   │  │  API Apps   │  │   Workers   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                 Runtime Kernel Layer                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │   HTTP Server   │   Job Queue   │   Scheduler   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │      DI Container & Service Registry             │  │
│  ├──────────────────────────────────────────────────┤  │
│  │   Middleware: Security, Observability, Resil...  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                    Core Layer                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Business Logic: Jobs, Resilience, Security      │  │
│  │  Domain Models: Entity, ValueObject, Aggregate  │  │
│  │  Observability: Health, Metrics, Tracing        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                   Adapters Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Database │ │  Cache   │ │  Storage │ │   Auth   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐                                           │
│  │Telemetry │                                           │
│  └──────────┘                                           │
└──────────────────────────────────────────────────────────┘
```

## Component Overview

### Framework Core (`framework/core`)

Pure business logic with no infrastructure dependencies:

- **Jobs** (`framework/core/src/jobs/`)
  - Job abstractions: `JobQueue`, `JobData`, `JobStatus`, `JobPriority`
  - Queue metrics and lifecycle management
  - No external dependencies

- **Resilience** (`framework/core/src/resilience/`)
  - `retry.ts` - Retry logic with exponential/linear/fixed backoff
  - `circuit-breaker.ts` - Circuit breaker pattern (CLOSED → OPEN → HALF_OPEN)
  - Pre-configured policies: `DB_RETRY_POLICY`, `API_RETRY_POLICY`

- **Observability** (`framework/core/src/observability/`)
  - `health.ts` - Health check system with dependency tracking
  - `metrics.ts` - Metrics registry (Counter, Gauge, Histogram, Summary)
  - `tracing.ts` - W3C Trace Context standard implementation
  - `shutdown.ts` - Graceful shutdown with priority-based hooks

- **Security** (`framework/core/src/security/`)
  - `rate-limiter.ts` - Token bucket rate limiting
  - `validator.ts` - Input validation (14+ types)
  - `sanitizer.ts` - XSS prevention, prototype pollution protection

- **Domain Models** (`framework/core/src/model/`)
  - `Entity` - Base class for entities with identity
  - `ValueObject` - Immutable value objects
  - `AggregateRoot` - Consistency boundaries

- **Events** (`framework/core/src/events/`)
  - `eventBus.ts` - In-memory event bus (pub/sub)
  - `domainEvent.ts` - Domain event types
  - `eventStore.ts` - Event store contract

- **Lifecycle** (`framework/core/src/lifecycle/`)
  - Component lifecycle hooks (starting, started, stopping, stopped)
  - Health check integration

- **Meta** (`framework/core/src/meta/`)
  - Metadata schema system for dynamic model introspection
  - Field metadata, entity metadata

- **Registry** (`framework/core/src/registry/`)
  - `tenantRegistry.ts` - Multi-tenant tenant registry
  - `identityProviderRegistry.ts` - Multi-realm IdP registry

### Framework Runtime (`framework/runtime`)

Infrastructure and orchestration:

- **Kernel** (`framework/runtime/src/kernel/`)
  - `bootstrap.ts` - Application bootstrap
  - `container.ts` - DI container with lazy async resolution
  - `container.adapters.ts` - Adapter registration with health checks
  - `container.defaults.ts` - Observability singletons registration
  - `tokens.ts` - DI tokens for all services

- **Jobs** (`framework/runtime/src/jobs/`)
  - `redis-queue.ts` - Redis-backed job queue (BullMQ)
  - `worker-pool.ts` - Worker pool for job processing
  - Lua scripts for atomic operations

- **Resilience** (`framework/runtime/src/resilience/`)
  - `adapter-protection.ts` - Wraps adapters with circuit breakers and retry logic
  - Protection for: DB, Cache, Storage, Auth adapters

- **Middleware** (`framework/runtime/src/middleware/`)
  - `observability.ts` - Correlation, metrics, logging, health endpoints
  - `rate-limit.ts` - Rate limiting middleware (per-tenant, per-user, per-IP)
  - `validation.ts` - Request validation and sanitization
  - `security-headers.ts` - OWASP security headers

- **HTTP Server** (`framework/runtime/src/express/`)
  - Express server with graceful shutdown
  - Middleware stack integration
  - Request/response handling

- **Services** (`framework/runtime/src/services/`)
  - Service registry for lazy service initialization
  - HTTP server, auth service registration

### Framework Adapters (`framework/adapters`)

External service integrations:

- **Database** (`framework/adapters/db/`)
  - PostgreSQL via Kysely
  - PgBouncer connection pooling
  - Transaction support with isolation levels

- **Cache** (`framework/adapters/memorycache/`)
  - Redis client (ioredis)
  - Pub/sub support
  - Cluster mode

- **Object Storage** (`framework/adapters/objectstorage/`)
  - S3-compatible storage (AWS SDK v3)
  - MinIO compatibility
  - Presigned URLs

- **Authentication** (`framework/adapters/auth/`)
  - OIDC/OAuth2 (Keycloak)
  - JWT validation
  - Multi-realm support

- **Telemetry** (`framework/adapters/telemetry/`)
  - OpenTelemetry integration
  - Trace context extraction
  - Structured logging

## Data Flow

### API Request Flow

```
1. HTTP Request
   ↓
2. Express Middleware Stack
   ├─ Correlation Middleware (Request ID, Trace Context)
   ├─ Security Headers Middleware
   ├─ Rate Limiting Middleware (Per-tenant/user/IP)
   ├─ Validation Middleware (Body/Query/Params)
   ├─ Authentication Middleware
   └─ Metrics Middleware
   ↓
3. Route Handler
   ↓
4. Business Logic (Core)
   ↓
5. Adapter Call (with Circuit Breaker + Retry)
   ├─ Database Adapter
   ├─ Cache Adapter
   ├─ Storage Adapter
   └─ Auth Adapter
   ↓
6. Response
   ├─ Security Headers
   ├─ Rate Limit Headers
   ├─ Correlation Headers (X-Request-ID, traceparent)
   └─ JSON Body
```

### Background Job Flow

```
1. Job Enqueued → Redis (BullMQ)
   ├─ Job Data
   ├─ Job Priority
   └─ Job Options (retry, backoff, delay)
   ↓
2. Worker Pool Picks Up Job
   ├─ Worker concurrency control
   └─ Job status: waiting → active
   ↓
3. Handler Execution
   ├─ Circuit Breaker Protection
   ├─ Retry Logic (exponential backoff)
   └─ Progress Tracking
   ↓
4. Job Completion
   ├─ Success → completed status
   ├─ Failure → failed status
   └─ Metrics & Telemetry Recorded
```

### Health Check Flow

```
1. Health Endpoint Request (/health, /readyz)
   ↓
2. HealthCheckRegistry.checkAll()
   ↓
3. Parallel Health Checks
   ├─ Database Health Check (connection test)
   ├─ Cache Health Check (ping)
   ├─ Storage Health Check (list operation)
   └─ Custom Health Checks
   ↓
4. System Health Aggregation
   ├─ All required checks pass → healthy
   ├─ Some non-required checks fail → degraded
   └─ Required checks fail → unhealthy
   ↓
5. Response
   ├─ HTTP 200 (healthy/degraded)
   ├─ HTTP 503 (unhealthy)
   └─ JSON with dependency statuses
```

## Runtime Modes

The runtime supports three operational modes via `MODE` environment variable:

### API Mode (`MODE=api`)

**Purpose**: HTTP API server for user-facing requests

**Components**:
- Express HTTP server (port 3000 default)
- All middleware (security, observability, rate limiting)
- Route handlers
- Authentication
- Graceful shutdown on SIGTERM/SIGINT

**Startup**:
```typescript
// framework/runtime/src/startup/startApiRuntime.ts
export async function startApiRuntime(ctx: BootstrapContext) {
  const httpServer = await ctx.container.resolve(TOKENS.httpServer);
  await httpServer.listen(config.port);
  installSignalHandlers(gracefulShutdown);
}
```

**Scaling**: Stateless, can run multiple instances behind load balancer

### Worker Mode (`MODE=worker`)

**Purpose**: Background job processing

**Components**:
- Redis job queue consumer
- Worker pool (configurable concurrency)
- Job handlers
- No HTTP server
- Graceful shutdown (finishes in-progress jobs)

**Startup**:
```typescript
// framework/runtime/src/startup/startWorkerRuntime.ts
export async function startWorkerRuntime(ctx: BootstrapContext) {
  const jobQueue = await ctx.container.resolve(TOKENS.jobQueue);

  // Register job handlers
  await jobQueue.process('email', 5, emailHandler);
  await jobQueue.process('export', 2, exportHandler);

  installSignalHandlers(gracefulShutdown);
}
```

**Scaling**: Run multiple worker instances to increase throughput

### Scheduler Mode (`MODE=scheduler`)

**Purpose**: Cron-like scheduled tasks

**Components**:
- Scheduler service
- Cron job definitions
- Job enqueuing
- No HTTP server

**Startup**:
```typescript
// framework/runtime/src/startup/startSchedulerRuntime.ts
export async function startSchedulerRuntime(ctx: BootstrapContext) {
  const scheduler = await ctx.container.resolve(TOKENS.scheduler);

  // Schedule recurring jobs
  scheduler.schedule('0 0 * * *', () => dailyReportJob());
  scheduler.schedule('*/15 * * * *', () => healthCheckJob());

  installSignalHandlers(gracefulShutdown);
}
```

**Scaling**: Run single instance (leader election for multiple instances)

## Integration Patterns

### Adapter Integration

All adapters follow the same integration pattern:

1. **Factory Function** - Creates configured adapter instance
2. **Health Check Registration** - Registers health check with registry
3. **Circuit Breaker Wrapping** - Wraps adapter with resilience patterns
4. **DI Registration** - Registers wrapped adapter in container

**Example: Database Adapter**

```typescript
// framework/runtime/src/kernel/container.adapters.ts
export async function registerAdapters(container: Container, config: RuntimeConfig) {
  const healthRegistry = await container.resolve(TOKENS.healthRegistry);
  const breakers = new AdapterCircuitBreakers();

  // Database Adapter
  container.register(TOKENS.db, async () => {
    const adapter = await createDbAdapter(config.db);

    // Register health check
    healthRegistry.register('database',
      createDbHealthChecker(adapter),
      { required: true, critical: true }
    );

    // Wrap with resilience
    return protectDbAdapter(adapter, breakers);
  }, 'singleton');
}
```

### Middleware Stack

Middleware is applied in specific order for security and correctness:

```typescript
// framework/runtime/src/express/httpServer.ts
app.use(correlationMiddleware(requestContextStorage));  // 1. Request ID
app.use(securityHeaders());                              // 2. Security headers
app.use(rateLimitMiddleware({ limiter }));              // 3. Rate limiting
app.use(validationMiddleware({ rules }));               // 4. Validation
app.use(authMiddleware());                               // 5. Authentication
app.use(metricsMiddleware(metricsRegistry));            // 6. Metrics
app.use(loggingMiddleware(logger));                     // 7. Logging
```

### Event-Driven Communication

Domain events enable loose coupling between components:

```typescript
// Publish event
const event: DomainEvent = {
  eventId: generateId(),
  eventType: 'user.created',
  occurredAt: new Date(),
  aggregateId: user.id,
  aggregateType: 'User',
  payload: { userId: user.id, email: user.email }
};
await eventBus.publish(event);

// Subscribe to event
eventBus.subscribe('user.created', async (event) => {
  // Send welcome email
  await jobQueue.add('email', {
    template: 'welcome',
    to: event.payload.email
  });
});
```

## Scalability Architecture

### Horizontal Scaling

**API Mode**:
- Stateless design (no in-memory session state)
- Session state in Redis
- Load balancer distributes requests
- Scale by adding more API instances

**Worker Mode**:
- Redis-backed job queue (BullMQ) handles distribution
- Each worker processes jobs independently
- Scale by adding more worker instances
- Concurrency controlled per worker

**Scheduler Mode**:
- Leader election prevents duplicate scheduling
- Single active scheduler
- Standby schedulers for high availability

### Vertical Scaling

**Database**:
- PgBouncer connection pooling (max connections configurable)
- Read replicas for read-heavy workloads
- Connection pooling per instance

**Cache**:
- Redis cluster mode for distributed cache
- Consistent hashing for key distribution
- Replica sets for read scaling

### Caching Strategy

**Multi-Layer Caching**:

```
1. In-Memory Cache (fast, limited, per-instance)
   ↓ miss
2. Redis Cache (shared, fast, distributed)
   ↓ miss
3. Database (slow, authoritative)
```

**Cache Invalidation**:
- Time-based (TTL)
- Event-based (on update/delete)
- Manual (via admin API)

### Rate Limiting

**Per-Tenant Isolation**:
- Each tenant has separate rate limit bucket
- Prevents one tenant from affecting others
- Configurable limits per tenant tier

**Distributed Rate Limiting**:
- Redis-backed counters (atomic operations via Lua)
- Sliding window algorithm for accuracy
- Fail-open behavior on Redis errors

### Database Scaling

**Connection Pooling**:
```
Application Instances → PgBouncer (pooler) → PostgreSQL
   (100 connections)     (pool: 20)           (max: 200)
```

**Sharding**:
- Tenant-based sharding (future)
- Each shard contains subset of tenants
- Shard routing based on tenant key

## Performance Characteristics

### API Latency Targets

- P50: < 100ms
- P95: < 500ms
- P99: < 1000ms

### Job Processing

- Low priority: < 1 minute
- Normal priority: < 10 seconds
- High priority: < 1 second

### Availability Targets

- Uptime: 99.9% (8.76 hours downtime/year)
- Recovery Time Objective (RTO): < 5 minutes
- Recovery Point Objective (RPO): < 1 minute

## See Also

- [Multi-Tenancy Architecture](./MULTI_TENANCY.md)
- [Domain-Driven Design Patterns](./DDD_PATTERNS.md)
- [Event-Driven Architecture](./EVENTS.md)
- [Resilience Patterns](../infrastructure/RESILIENCE.md)
- [Observability](../infrastructure/OBSERVABILITY.md)

---

[← Back to Architecture](./README.md) | [Back to Documentation Home](../README.md)
