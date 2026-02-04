# Architecture Documentation

This section covers the architectural decisions, patterns, and design principles of the Athyper platform.

## 📋 Contents

1. [System Overview](./OVERVIEW.md) - High-level architecture and components
2. [Multi-Tenancy](./MULTI_TENANCY.md) - Multi-tenant architecture and isolation
3. [DDD Patterns](./DDD_PATTERNS.md) - Domain-Driven Design implementation
4. [Event-Driven Architecture](./EVENTS.md) - Event bus and domain events

## 🏗️ Architectural Principles

### 1. Hexagonal Architecture (Ports & Adapters)

The platform follows hexagonal architecture to maintain clean separation between business logic and infrastructure:

```
┌─────────────────────────────────────────────┐
│           Application Core                   │
│  ┌─────────────────────────────────────┐   │
│  │     Domain Models & Business Logic   │   │
│  │  (framework/core)                    │   │
│  └─────────────────────────────────────┘   │
│               ▲           ▲                  │
│               │  Ports    │                  │
│  ┌────────────┴───────────┴────────────┐   │
│  │         Runtime Kernel               │   │
│  │  (framework/runtime)                 │   │
│  └────────────┬───────────┬────────────┘   │
│               │  Adapters │                  │
│               ▼           ▼                  │
│  ┌─────────────────────────────────────┐   │
│  │  Database │ Cache │ Auth │ Storage  │   │
│  │  (framework/adapters)                │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Benefits:**
- Business logic independent of infrastructure
- Easy testing with mock adapters
- Flexible adapter swapping without core changes

### 2. Dependency Injection

All dependencies are resolved through the DI container:

```typescript
// Registration
container.register(TOKENS.db, createDbAdapter, "singleton");

// Resolution
const db = await container.resolve(TOKENS.db);
```

**Benefits:**
- Loose coupling between components
- Testability through dependency mocking
- Lazy initialization with async resolution

### 3. Multi-Mode Runtime

The runtime supports three operational modes:

| Mode | Purpose | Components |
|------|---------|------------|
| `api` | HTTP API server | Express, Routes, Middleware |
| `worker` | Background jobs | Job queue, Worker pool |
| `scheduler` | Cron-like tasks | Scheduler, Job triggers |

### 4. Resilience Patterns

Built-in patterns for production reliability:

- **Circuit Breakers** - Prevent cascading failures
- **Retry Logic** - Exponential backoff for transient errors
- **Graceful Shutdown** - Clean resource cleanup
- **Health Checks** - Dependency health monitoring

### 5. Observability First

Comprehensive observability built-in:

- **Structured Logging** - JSON logs with trace correlation
- **Distributed Tracing** - W3C Trace Context standard
- **Metrics Collection** - Counter, Gauge, Histogram
- **Health Endpoints** - `/health`, `/readyz`, `/metrics`

## 🎯 Design Goals

### Scalability
- **Horizontal Scaling** - Stateless design, Redis-backed coordination
- **Per-Tenant Isolation** - Resource limits and rate limiting
- **Caching Strategy** - Multi-layer caching (Redis, in-memory)

### Security
- **Zero Trust** - Validate all inputs, sanitize outputs
- **Rate Limiting** - Per-tenant, per-user, per-endpoint
- **Security Headers** - OWASP best practices
- **Audit Logging** - Comprehensive security event tracking

### Maintainability
- **TypeScript** - Type safety reduces runtime errors
- **Modular Design** - Clear module boundaries
- **Comprehensive Tests** - 158+ tests across modules
- **Documentation** - Code comments and external docs

### Performance
- **Connection Pooling** - PgBouncer for database
- **Async Everything** - Non-blocking I/O throughout
- **Lazy Loading** - Deferred initialization where possible
- **Optimized Queries** - Kysely for type-safe SQL

## 📁 Module Organization

### Core (`framework/core`)
Pure business logic, no infrastructure dependencies:
- Domain models and value objects
- Business rules and validation
- Event definitions
- Security abstractions (validation, sanitization)

### Runtime (`framework/runtime`)
Infrastructure and orchestration:
- Kernel bootstrap and lifecycle
- DI container and service registry
- HTTP server and middleware
- Job queue implementation

### Adapters (`framework/adapters`)
External service integrations:
- Database (PostgreSQL via Kysely)
- Cache (Redis)
- Object Storage (S3/MinIO)
- Authentication (Keycloak/JOSE)
- Telemetry (OpenTelemetry)

## 🔄 Request Flow

### API Request
```
1. HTTP Request → Express
2. Middleware Stack:
   - Correlation (request ID, trace context)
   - Security Headers
   - Rate Limiting (per-tenant)
   - Validation & Sanitization
   - Authentication
3. Route Handler → Business Logic
4. Adapter Call (DB, Cache, etc.) with:
   - Circuit Breaker protection
   - Retry logic
   - Telemetry tracking
5. Response → JSON with:
   - Security headers
   - Rate limit headers
   - Trace correlation
```

### Background Job
```
1. Job Enqueued → Redis (BullMQ)
2. Worker Pool picks up job
3. Handler execution with:
   - Circuit Breaker protection
   - Retry on failure (exponential backoff)
   - Progress tracking
4. Job completion or failure
5. Metrics and telemetry recorded
```

## 🎨 Design Patterns Used

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Factory** | Adapters | Create configured instances |
| **Singleton** | DI Container | Single instances of services |
| **Observer** | Event Bus | Pub/sub for domain events |
| **Strategy** | Rate Limiting | Pluggable rate limit algorithms |
| **Decorator** | Adapter Protection | Add resilience to adapters |
| **Builder** | Configuration | Flexible config construction |
| **Repository** | Data Access | Abstract data persistence |

## 📚 Further Reading

- [System Overview](./OVERVIEW.md) - Detailed system architecture
- [Multi-Tenancy](./MULTI_TENANCY.md) - Multi-tenant implementation
- [DDD Patterns](./DDD_PATTERNS.md) - Domain-Driven Design patterns
- [Event-Driven Architecture](./EVENTS.md) - Event system design

---

[← Back to Documentation Home](../README.md)
