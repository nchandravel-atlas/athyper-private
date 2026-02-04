# Core Framework

The **Core Framework** (`framework/core`) contains pure business logic with no infrastructure dependencies. It implements DDD patterns, resilience primitives, observability abstractions, and security utilities.

## Table of Contents

- [Module Overview](#module-overview)
- [Jobs](#jobs)
- [Resilience](#resilience)
- [Observability](#observability)
- [Security](#security)
- [Domain Models](#domain-models)
- [Events](#events)
- [Lifecycle](#lifecycle)
- [Meta](#meta)
- [Registry](#registry)
- [Access Control](#access-control)

## Module Overview

```
framework/core/src/
├── jobs/              # Job abstractions
├── resilience/        # Retry logic, circuit breakers
├── observability/     # Health checks, metrics, tracing, shutdown
├── security/          # Rate limiting, validation, sanitization
├── model/             # DDD building blocks (Entity, ValueObject, Aggregate)
├── events/            # Event bus, domain events, event store
├── lifecycle/         # Component lifecycle hooks
├── meta/              # Metadata schema system
├── registry/          # Tenant registry, IdP registry
└── access/            # RBAC policies
```

**Dependencies**: ZERO external dependencies (except dev dependencies for testing)

**Test Coverage**: 158/158 tests passing

## Jobs

### Module: `framework/core/src/jobs/`

Job queue abstractions for background processing.

### Types

**File**: [framework/core/src/jobs/types.ts](../../framework/core/src/jobs/types.ts)

```typescript
export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Job<T = unknown> {
  id: string;
  type: string;
  data: JobData<T>;
  status: JobStatus;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedReason?: string;
}

export interface JobQueue {
  add<T>(data: JobData<T>, options?: JobOptions): Promise<Job<T>>;
  addBulk<T>(jobs: Array<{ data: JobData<T>; options?: JobOptions }>): Promise<Job<T>[]>;
  process<TInput, TOutput>(
    jobType: string,
    concurrency: number,
    handler: JobHandler<TInput, TOutput>
  ): Promise<void>;
  getJob(jobId: string): Promise<Job | null>;
  getJobs(status: JobStatus): Promise<Job[]>;
  remove(jobId: string): Promise<void>;
  close(): Promise<void>;
  getMetrics(): Promise<QueueMetrics>;
}
```

**Usage**:
```typescript
import type { JobQueue, JobData } from '@athyper/core';

// Add job to queue
await jobQueue.add<EmailJobData>({
  type: 'email',
  payload: {
    template: 'welcome',
    to: 'user@example.com',
    data: { name: 'John' }
  }
}, {
  priority: 'normal',
  maxAttempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
});

// Process jobs
await jobQueue.process<EmailJobData, void>(
  'email',
  5, // concurrency
  async (job) => {
    await emailService.send(job.data.payload);
    return { success: true };
  }
);
```

## Resilience

### Module: `framework/core/src/resilience/`

Production-grade resilience patterns.

### Retry Logic

**File**: [framework/core/src/resilience/retry.ts](../../framework/core/src/resilience/retry.ts)

**Test Coverage**: 14/14 tests passing

```typescript
export type RetryStrategy = 'exponential' | 'linear' | 'fixed';

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  strategy: RetryStrategy;
  multiplier: number;
  jitter: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  policy: Partial<RetryPolicy> = {}
): Promise<T>;

// Pre-configured policies
export const DB_RETRY_POLICY: RetryPolicy;
export const API_RETRY_POLICY: RetryPolicy;

// Helper
export function isTransientError(error: Error): boolean;
```

**Example**:
```typescript
import { withRetry, DB_RETRY_POLICY, isTransientError } from '@athyper/core';

// Retry database query with exponential backoff
const users = await withRetry(
  () => db.selectFrom('users').selectAll().execute(),
  {
    ...DB_RETRY_POLICY,
    onRetry: (attempt, error) => {
      logger.warn({ attempt, error }, 'Retrying database query');
    }
  }
);

// Custom retry policy
const data = await withRetry(
  () => externalApi.fetch(),
  {
    maxAttempts: 5,
    baseDelayMs: 1000,
    strategy: 'exponential',
    multiplier: 2,
    jitter: true
  }
);
```

### Circuit Breaker

**File**: [framework/core/src/resilience/circuit-breaker.ts](../../framework/core/src/resilience/circuit-breaker.ts)

**Test Coverage**: 12/12 tests passing

**State Machine**: CLOSED → OPEN → HALF_OPEN → CLOSED

```typescript
export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  halfOpenMaxCalls: number;
}

export class CircuitBreaker {
  constructor(config: CircuitBreakerConfig);

  async execute<T>(fn: () => Promise<T>): Promise<T>;
  getMetrics(): CircuitBreakerMetrics;
  reset(): void;
  forceOpen(): void;
}
```

**Example**:
```typescript
import { CircuitBreaker } from '@athyper/core';

const breaker = new CircuitBreaker({
  name: 'external-api',
  failureThreshold: 5,    // Open after 5 failures
  successThreshold: 2,    // Close after 2 successes
  timeout: 60000,         // 60 seconds
  halfOpenMaxCalls: 3     // Allow 3 calls in half-open state
});

// Protected call
try {
  const result = await breaker.execute(() => externalApi.fetch());
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    // Circuit is open, use fallback
    return fallbackData;
  }
  throw error;
}
```

## Observability

### Module: `framework/core/src/observability/`

Production observability abstractions.

### Health Checks

**File**: [framework/core/src/observability/health.ts](../../framework/core/src/observability/health.ts)

**Test Coverage**: 13/13 tests passing

```typescript
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckRegistry {
  register(name: string, checker: HealthChecker, options?: HealthCheckOptions): void;
  checkOne(name: string): Promise<DependencyHealth>;
  checkAll(): Promise<DependencyHealth[]>;
  getSystemHealth(options?: SystemHealthOptions): Promise<SystemHealth>;
  isReady(): Promise<boolean>;
}

export type HealthChecker = () => Promise<HealthCheckResult>;

// Helper functions
export function createHealthChecker(fn: () => Promise<boolean>, name: string): HealthChecker;
export function createDbHealthChecker(db: any): HealthChecker;
export function createCacheHealthChecker(cache: any): HealthChecker;
```

**Example**:
```typescript
import { HealthCheckRegistry, createDbHealthChecker } from '@athyper/core';

const healthRegistry = new HealthCheckRegistry();

// Register database health check
healthRegistry.register(
  'database',
  createDbHealthChecker(db),
  { required: true, critical: true, timeout: 5000 }
);

// Register cache health check (non-critical)
healthRegistry.register(
  'cache',
  createCacheHealthChecker(redis),
  { required: false, critical: false }
);

// Check system health
const health = await healthRegistry.getSystemHealth();
// {
//   status: 'healthy',
//   dependencies: [
//     { name: 'database', status: 'healthy', responseTime: 45 },
//     { name: 'cache', status: 'healthy', responseTime: 12 }
//   ]
// }
```

### Metrics

**File**: [framework/core/src/observability/metrics.ts](../../framework/core/src/observability/metrics.ts)

```typescript
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricsRegistry {
  registerCounter(name: string, labels?: string[]): void;
  registerGauge(name: string, labels?: string[]): void;
  registerHistogram(name: string, buckets?: number[], labels?: string[]): void;

  incrementCounter(name: string, labels?: Record<string, string>): void;
  setGauge(name: string, value: number, labels?: Record<string, string>): void;
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;

  getMetric(name: string, labels?: Record<string, string>): Metric | undefined;
  getAllMetrics(): Metric[];
  clear(): void;
}

// HTTP metrics helper
export function createHttpMetrics(): {
  registerMetrics(registry: MetricsRegistry): void;
  recordRequest(method: string, path: string, status: number, duration: number): void;
};
```

**Example**:
```typescript
import { MetricsRegistry, createHttpMetrics } from '@athyper/core';

const metricsRegistry = new MetricsRegistry();

// Register HTTP metrics
const httpMetrics = createHttpMetrics();
httpMetrics.registerMetrics(metricsRegistry);

// Record request
httpMetrics.recordRequest('GET', '/api/users', 200, 45);

// Custom metrics
metricsRegistry.registerCounter('jobs_processed', ['job_type', 'status']);
metricsRegistry.incrementCounter('jobs_processed', {
  job_type: 'email',
  status: 'success'
});

// Get metrics
const metric = metricsRegistry.getMetric('http_requests_total', {
  method: 'GET',
  path: '/api/users',
  status: '200'
});
```

### Distributed Tracing

**File**: [framework/core/src/observability/tracing.ts](../../framework/core/src/observability/tracing.ts)

**W3C Trace Context** standard implementation.

```typescript
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  traceFlags?: string;
}

export interface CorrelationIds {
  requestId: string;
  traceContext?: TraceContext;
}

export class RequestContextStorage {
  run<T>(context: RequestContext, fn: () => T): T;
  get(): RequestContext | undefined;
}

// W3C Trace Context parsing
export function parseTraceContext(traceparent?: string): TraceContext | undefined;
export function createTraceparent(context: TraceContext): string;

// Correlation ID helpers
export function generateRequestId(): string;
export function extractCorrelationIds(headers: Record<string, string | string[] | undefined>): CorrelationIds;
```

**Example**:
```typescript
import { RequestContextStorage, parseTraceContext, generateRequestId } from '@athyper/core';

const contextStorage = new RequestContextStorage();

// In middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  const traceContext = parseTraceContext(req.headers['traceparent']);

  contextStorage.run({ requestId, traceContext }, () => {
    next();
  });
});

// In business logic
function someBusinessLogic() {
  const context = contextStorage.get();
  logger.info({ requestId: context?.requestId }, 'Processing request');
}
```

### Graceful Shutdown

**File**: [framework/core/src/observability/shutdown.ts](../../framework/core/src/observability/shutdown.ts)

```typescript
export type ShutdownHook = () => void | Promise<void>;

export class GracefulShutdown {
  register(name: string, hook: ShutdownHook, priority?: number): void;
  async shutdown(reason: string, timeout?: number): Promise<void>;
}

export function installSignalHandlers(shutdown: GracefulShutdown): void;
```

**Example**:
```typescript
import { GracefulShutdown, installSignalHandlers } from '@athyper/core';

const gracefulShutdown = new GracefulShutdown();

// Register shutdown hooks (lower priority = runs first)
gracefulShutdown.register('http-server', async () => {
  await httpServer.close();
}, 100);

gracefulShutdown.register('database', async () => {
  await db.destroy();
}, 200);

gracefulShutdown.register('redis', async () => {
  await redis.quit();
}, 200);

// Install signal handlers for SIGTERM/SIGINT
installSignalHandlers(gracefulShutdown);

// Manual shutdown
await gracefulShutdown.shutdown('Manual shutdown', 30000);
```

## Security

### Module: `framework/core/src/security/`

### Rate Limiting

**File**: [framework/core/src/security/rate-limiter.ts](../../framework/core/src/security/rate-limiter.ts)

**Test Coverage**: 20/20 tests passing

```typescript
export interface RateLimiter {
  consume(key: string, cost?: number): Promise<RateLimitResult>;
  check(key: string): Promise<RateLimitResult>;
  reset(key: string): Promise<void>;
  getStatus(key: string): Promise<RateLimitStatus>;
}

export class MemoryRateLimiter implements RateLimiter {
  constructor(config: RateLimitConfig);
}

// Pre-configured profiles
export const RATE_LIMIT_PROFILES: {
  public: RateLimitConfig;      // 100/min
  authenticated: RateLimitConfig; // 1000/min
  premium: RateLimitConfig;      // 10000/min
  write: RateLimitConfig;        // 100/min
  sensitive: RateLimitConfig;    // 5/min
};

// Helper
export function createRateLimitKey(context: RateLimitContext): string;
```

**Example**:
```typescript
import { MemoryRateLimiter, RATE_LIMIT_PROFILES, createRateLimitKey } from '@athyper/core';

const limiter = new MemoryRateLimiter(RATE_LIMIT_PROFILES.authenticated);

// Consume from rate limit
const key = createRateLimitKey({
  tenantKey: 'customer-a',
  userId: 'user-123'
});

const result = await limiter.consume(key);
if (!result.allowed) {
  throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}s`);
}
```

### Validation

**File**: [framework/core/src/security/validator.ts](../../framework/core/src/security/validator.ts)

**Test Coverage**: 32/32 tests passing

```typescript
export type ValidationType =
  | 'string' | 'number' | 'boolean' | 'object' | 'array'
  | 'email' | 'url' | 'uuid';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: ValidationType;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

export function validate(data: any, rules: ValidationRule[]): ValidationResult;

// Pre-defined patterns
export const ValidationPatterns: {
  ALPHANUMERIC: RegExp;
  SLUG: RegExp;
  USERNAME: RegExp;
  PHONE: RegExp;
  HEX_COLOR: RegExp;
  ISO_DATE: RegExp;
  SEMVER: RegExp;
};

// Pre-defined rulesets
export const ValidationRulesets: {
  userRegistration: ValidationRule[];
  login: ValidationRule[];
  pagination: ValidationRule[];
};
```

**Example**:
```typescript
import { validate, ValidationPatterns, ValidationRulesets } from '@athyper/core';

// Validate user registration
const result = validate(req.body, ValidationRulesets.userRegistration);
if (!result.valid) {
  return res.status(400).json({ errors: result.errors });
}

// Custom validation
const rules: ValidationRule[] = [
  { field: 'username', required: true, type: 'string', pattern: ValidationPatterns.USERNAME },
  { field: 'age', type: 'number', min: 18, max: 100 },
  {
    field: 'password',
    required: true,
    custom: (value) => {
      if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter';
      if (!/[0-9]/.test(value)) return 'Must contain number';
      return true;
    }
  }
];

const result = validate(userData, rules);
```

### Sanitization

**File**: [framework/core/src/security/sanitizer.ts](../../framework/core/src/security/sanitizer.ts)

**Test Coverage**: 67/67 tests passing

```typescript
// HTML sanitization
export function sanitizeHtml(input: string): string;
export function stripHtml(input: string): string;

// Injection prevention
export function sanitizeSqlLike(input: string): string;
export function sanitizeDeep<T>(obj: T): T;  // Prevents prototype pollution

// Path traversal prevention
export function sanitizeFilename(input: string): string;

// URL safety
export function sanitizeUrl(input: string): string;

// Data normalization
export function sanitizeEmail(input: string): string;
export function sanitizePhone(input: string): string;
export function normalizeWhitespace(input: string): string;
export function removeNullBytes(input: string): string;

// Type conversion
export function sanitizeInteger(input: any, defaultValue?: number): number;
export function sanitizeFloat(input: any, defaultValue?: number): number;
export function sanitizeBoolean(input: any): boolean;

// String utilities
export function limitLength(input: string, maxLength: number, suffix?: string): string;

// Object sanitization
export function sanitizeObject<T>(obj: T): T;
export function trimObject<T>(obj: T): T;

// JSON sanitization
export function sanitizeJson<T>(input: string, defaultValue?: T): T | null;

// Pre-configured profiles
export const SanitizationProfiles: {
  basic: (input: string) => string;
  strict: (input: string) => string;
  username: (input: string) => string;
  slug: (input: string) => string;
  searchQuery: (input: string) => string;
  richText: (html: string) => string;
};
```

**Example**:
```typescript
import { sanitizeHtml, sanitizeDeep, SanitizationProfiles } from '@athyper/core';

// Prevent XSS
const safeHtml = sanitizeHtml(userInput);  // Escapes HTML special chars

// Prevent prototype pollution
const safeData = sanitizeDeep(JSON.parse(untrustedJson));

// Use profiles
const username = SanitizationProfiles.username(input);  // Lowercase, alphanumeric + -_
const slug = SanitizationProfiles.slug(title);          // URL-friendly slug
```

## Domain Models

### Module: `framework/core/src/model/`

DDD building blocks.

**File**: [framework/core/src/model/index.ts](../../framework/core/src/model/index.ts)

```typescript
// Entity
export abstract class Entity<ID extends EntityId = string> {
  constructor(public readonly id: ID);
  equals(other: Entity<ID>): boolean;
}

// Value Object
export abstract class ValueObject<T> {
  constructor(protected readonly value: T);
  equals(other: ValueObject<T>): boolean;
  getValue(): T;
}

// Aggregate Root
export interface AggregateRoot<ID extends EntityId = string> {
  readonly id: ID;
  readonly version?: number;
}

// Domain Event
export type DomainEventPayload<T = unknown> = {
  eventType: string;
  aggregateId: EntityId;
  payload: T;
  occurredAt: Date;
};
```

See [DDD Patterns Documentation](../architecture/DDD_PATTERNS.md) for usage examples.

## Events

### Module: `framework/core/src/events/`

**Files**:
- [framework/core/src/events/eventBus.ts](../../framework/core/src/events/eventBus.ts)
- [framework/core/src/events/domainEvent.ts](../../framework/core/src/events/domainEvent.ts)
- [framework/core/src/events/eventStore.ts](../../framework/core/src/events/eventStore.ts)

See [Event-Driven Architecture Documentation](../architecture/EVENTS.md) for detailed usage.

## Lifecycle

### Module: `framework/core/src/lifecycle/`

Component lifecycle hooks.

**File**: [framework/core/src/lifecycle/index.ts](../../framework/core/src/lifecycle/index.ts)

```typescript
export interface ComponentLifecycle {
  onStarting?(): void | Promise<void>;
  onStarted?(): void | Promise<void>;
  onStopping?(): void | Promise<void>;
  onStopped?(): void | Promise<void>;
  checkHealth?(): Promise<{ healthy: boolean; message?: string }>;
}

export class LifecycleManager {
  register(component: ComponentLifecycle): void;
  async start(): Promise<void>;
  async stop(): Promise<void>;
  async healthCheck(): Promise<{ healthy: boolean; checks: Record<string, boolean> }>;
}
```

## Meta

### Module: `framework/core/src/meta/`

Metadata schema system for dynamic model introspection.

**File**: [framework/core/src/meta/index.ts](../../framework/core/src/meta/index.ts)

```typescript
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'reference' | 'enum';

export type FieldMetadata = {
  name: string;
  type: FieldType;
  required: boolean;
  label?: string;
  description?: string;
  referenceTo?: string;
  enumValues?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

export type EntityMetadata = {
  name: string;
  label: string;
  description?: string;
  fields: FieldMetadata[];
  permissions?: {
    create?: string[];
    read?: string[];
    update?: string[];
    delete?: string[];
  };
};

export class MetadataRegistry {
  register(entity: EntityMetadata): void;
  get(entityName: string): EntityMetadata | undefined;
  getAll(): EntityMetadata[];
  getFieldMetadata(entityName: string, fieldName: string): FieldMetadata | undefined;
}
```

## Registry

### Module: `framework/core/src/registry/`

**Tenant Registry** - Multi-tenant tenant registry
**File**: [framework/core/src/registry/tenantRegistry.ts](../../framework/core/src/registry/tenantRegistry.ts)

**Identity Provider Registry** - Multi-realm IdP registry
**File**: [framework/core/src/registry/identityProviderRegistry.ts](../../framework/core/src/registry/identityProviderRegistry.ts)

See [Multi-Tenancy Documentation](../architecture/MULTI_TENANCY.md) for usage.

## Access Control

### Module: `framework/core/src/access/`

RBAC (Role-Based Access Control) policies.

**File**: [framework/core/src/access/rbac-policy.ts](../../framework/core/src/access/rbac-policy.ts)

```typescript
export interface AccessPolicy {
  can(action: string, resource: string, ctx: AccessContext): boolean;
}

export class RbacPolicy implements AccessPolicy {
  constructor(rules?: Record<string, string[]>);
  can(action: string, resource: string, ctx: AccessContext): boolean;
  addRule(role: string, permission: string): void;
  removeRule(role: string, permission: string): void;
}
```

**Example**:
```typescript
import { RbacPolicy } from '@athyper/core';

const policy = new RbacPolicy();

// Check permission
const allowed = policy.can('delete', 'document', {
  userId: 'user-123',
  tenantId: 'tenant-a',
  roles: ['admin']
});
```

## See Also

- [Runtime Framework Documentation](./RUNTIME.md)
- [Adapters Documentation](./ADAPTERS.md)
- [Architecture Overview](../architecture/OVERVIEW.md)

---

[← Back to Documentation Home](../README.md)
