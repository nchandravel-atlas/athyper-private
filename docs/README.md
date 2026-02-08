# Athyper Platform Documentation

Welcome to the Athyper platform documentation. This guide covers the architecture, implementation, and deployment of the production-ready multi-tenant platform.

## 📚 Documentation Structure

### [Architecture](./architecture/README.md)
System design, patterns, and architectural decisions
- [System Overview](./architecture/OVERVIEW.md)
- [Multi-Tenancy](./architecture/MULTI_TENANCY.md)
- [DDD Patterns](./architecture/DDD_PATTERNS.md)
- [Event-Driven Architecture](./architecture/EVENTS.md)

### [Framework](./framework/README.md)
Core framework and runtime documentation
- [Core Modules](./framework/CORE.md) - Domain models, events, lifecycle
- [Runtime](./framework/RUNTIME.md) - Kernel, DI container, lifecycle
- [Adapters](./framework/ADAPTERS.md) - Database, cache, storage, auth, telemetry

### [Infrastructure](./infrastructure/README.md)
Production-ready infrastructure patterns
- [Job Queue System](./infrastructure/JOBS.md)
- [Resilience Patterns](./infrastructure/RESILIENCE.md)
- [Observability](./infrastructure/OBSERVABILITY.md)

### [Security](./security/README.md)
Security features and best practices
- [Auth Architecture](./security/AUTH_ARCHITECTURE.md) - PKCE flow, Redis sessions, idle timeout, CSRF, tenant isolation
- [Rate Limiting](./security/RATE_LIMITING.md)
- [Input Validation](./security/VALIDATION.md)
- [Sanitization](./security/SANITIZATION.md)
- [Security Headers](./security/HEADERS.md)

### [Deployment](./deployment/README.md)
Deployment guides for all environments
- [Quick Start](./deployment/QUICKSTART.md)
- [Environments](./deployment/ENVIRONMENTS.md) - Local, Staging, Production setup
- [Configuration](./deployment/CONFIGURATION.md)
- [Environment Variables](./deployment/ENVIRONMENT_VARIABLES.md)
- [Production Deployment](./deployment/PRODUCTION.md)

### [MESH Infrastructure](../mesh/README.md)

Local infrastructure stack documentation

### [API Reference](./api/README.md)
Complete API documentation
- [Core API](./api/CORE.md)
- [Runtime API](./api/RUNTIME.md)
- [Middleware API](./api/MIDDLEWARE.md)

## 🚀 Quick Links

- **Getting Started**: [Deployment Quick Start](./deployment/QUICKSTART.md)
- **Core Concepts**: [Architecture Overview](./architecture/OVERVIEW.md)
- **Security**: [Rate Limiting Guide](./security/RATE_LIMITING.md)
- **Production**: [Production Deployment](./deployment/PRODUCTION.md)

## 📦 Project Structure

```
athyper-private/
├── framework/
│   ├── core/                 # Domain models, events, security
│   │   ├── src/
│   │   │   ├── access/      # RBAC and access control
│   │   │   ├── events/      # Event bus and domain events
│   │   │   ├── jobs/        # Job queue abstractions
│   │   │   ├── lifecycle/   # Component lifecycle
│   │   │   ├── meta/        # Metadata schema system
│   │   │   ├── model/       # DDD base types
│   │   │   ├── observability/ # Health, metrics, tracing
│   │   │   ├── registry/    # Tenant and IdP registries
│   │   │   ├── resilience/  # Retry, circuit breakers
│   │   │   └── security/    # Rate limiting, validation, sanitization
│   │   └── package.json
│   │
│   ├── runtime/             # Runtime kernel and services
│   │   ├── src/
│   │   │   ├── adapters/    # HTTP, telemetry adapters
│   │   │   ├── jobs/        # Redis job queue implementation
│   │   │   ├── kernel/      # Bootstrap, DI container, config
│   │   │   ├── middleware/  # Express middleware (observability, security)
│   │   │   ├── resilience/  # Adapter protection
│   │   │   ├── runtimes/    # API, worker, scheduler modes
│   │   │   ├── security/    # Redis rate limiters
│   │   │   └── services/    # Service registry and modules
│   │   └── package.json
│   │
│   └── adapters/            # External service adapters
│       ├── auth/            # Authentication (Keycloak, JOSE)
│       ├── db/              # Database (Kysely, PostgreSQL)
│       ├── memorycache/     # Redis cache
│       ├── objectstorage/   # S3-compatible storage
│       └── telemetry/       # OpenTelemetry integration
│
├── packages/                # Shared packages
│   ├── contracts/           # Shared types and schemas
│   ├── api-client/          # API client library
│   ├── auth/                # Auth utilities
│   ├── ui/                  # UI components
│   └── workbench-*/         # Workbench modules
│
├── products/                # Product applications
│   └── neon/                # Neon product
│       ├── apps/
│       │   └── web/         # Next.js web application
│       ├── auth/            # Auth server helpers (session, audit)
│       ├── shared/ui/       # Product-level UI components
│       └── themes/          # Theme presets
│
└── mesh/                    # Local infrastructure
    ├── compose/             # Docker Compose configs
    └── config/              # Configuration files
```

## 🎯 Key Features

### Production-Ready Infrastructure
- ✅ **Job Queue System** - Redis-backed with BullMQ, persistence, retry
- ✅ **Circuit Breakers** - Prevent cascading failures across services
- ✅ **Retry Logic** - Exponential backoff with jitter for transient errors
- ✅ **Health Checks** - Comprehensive per-adapter health monitoring
- ✅ **Distributed Tracing** - W3C Trace Context standard, OpenTelemetry compatible
- ✅ **Graceful Shutdown** - Priority-based cleanup with timeout protection

### Enterprise Security
- ✅ **Per-Tenant Rate Limiting** - Token bucket and sliding window algorithms
- ✅ **Request Validation** - Comprehensive input validation with 14+ types
- ✅ **Input Sanitization** - XSS, injection, and path traversal prevention
- ✅ **Security Headers** - OWASP-recommended headers (CSP, HSTS, etc.)
- ✅ **Redis-Backed Rate Limiting** - Distributed rate limiting with Lua scripts

### Multi-Tenancy
- ✅ **Single & Multi-Realm IAM** - Flexible identity provider strategies
- ✅ **Tenant Context** - Request-scoped tenant resolution
- ✅ **Per-Tenant Rate Limits** - Fair resource allocation
- ✅ **Tenant Isolation** - Data and resource isolation

### Developer Experience
- ✅ **TypeScript First** - Full type safety throughout
- ✅ **Dependency Injection** - Clean, testable architecture
- ✅ **Comprehensive Tests** - 158+ tests across all modules
- ✅ **Hot Reload** - Fast development iteration
- ✅ **Structured Logging** - JSON logs with trace correlation

## 📊 Test Coverage

- **Resilience**: 26/26 tests ✅ (Retry logic, Circuit breakers)
- **Observability**: 13/13 tests ✅ (Health checks)
- **Security**: 119/119 tests ✅ (Rate limiting, Validation, Sanitization)
- **Total**: 158/158 tests passing ✅

## 🔧 Technology Stack

### Runtime
- **Node.js** 20.11+ - JavaScript runtime
- **TypeScript** - Type-safe development
- **Express** - HTTP server
- **BullMQ** - Redis-backed job queue

### Data Layer
- **PostgreSQL** - Primary database
- **Kysely** - Type-safe SQL query builder
- **Redis** - Cache and job queue
- **MinIO/S3** - Object storage

### Infrastructure
- **Docker** - Containerization
- **PgBouncer** - Connection pooling
- **OpenTelemetry** - Observability
- **Keycloak** - Identity and access management

### Development
- **Vitest** - Testing framework
- **pnpm** - Package management
- **Turbo** - Monorepo build system
- **tsup** - TypeScript bundler

## 📖 Next Steps

1. **For New Developers**: Start with [Quick Start Guide](./deployment/QUICKSTART.md)
2. **For Architects**: Read [System Overview](./architecture/OVERVIEW.md)
3. **For DevOps**: Check [Production Deployment](./deployment/PRODUCTION.md)
4. **For Security**: Review [Security Best Practices](./security/README.md)

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on:
- Code style and conventions
- Testing requirements
- Pull request process
- Development workflow

## 📝 License

See [LICENSE](../LICENSE) for details.

---

**Built with ❤️ for production-grade multi-tenant SaaS applications**
