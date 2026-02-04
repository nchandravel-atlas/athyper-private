# Rate Limiting

Comprehensive rate limiting system for API protection and fair resource distribution.

## Table of Contents

- [Overview](#overview)
- [Rate Limiting Strategies](#rate-limiting-strategies)
- [Per-Tenant Rate Limiting](#per-tenant-rate-limiting)
- [Multi-Dimensional Rate Limiting](#multi-dimensional-rate-limiting)
- [Rate Limit Profiles](#rate-limit-profiles)
- [Distributed Rate Limiting](#distributed-rate-limiting)
- [Configuration](#configuration)
- [Monitoring](#monitoring)

## Overview

The rate limiting system provides:
- **Per-tenant isolation** - Each tenant has independent rate limits
- **Multiple algorithms** - Token bucket, sliding window
- **Distributed** - Redis-backed for multi-instance deployments
- **Fail-open** - Continues serving requests if Redis is down
- **Standard headers** - RateLimit-* headers per RFC draft
- **Flexible policies** - Combine multiple rate limiters

**Test Coverage**: 20/20 tests passing in core, full coverage in runtime

## Rate Limiting Strategies

### Token Bucket Algorithm

**How it works**:
1. Bucket starts with N tokens
2. Each request consumes 1 token (or custom cost)
3. Tokens refill at constant rate
4. Request allowed only if tokens available

**Advantages**:
- Allows bursts up to bucket size
- Smooth refill over time
- Simple and efficient

**Implementation**: `framework/core/src/security/rate-limiter.ts`

```typescript
import { MemoryRateLimiter } from '@athyper/core';

const limiter = new MemoryRateLimiter({
  maxRequests: 100,    // Bucket size
  windowMs: 60000,     // Refill window (1 minute)
  strategy: 'token_bucket'
});

const result = await limiter.consume('user-123');
if (!result.allowed) {
  throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter}s`);
}
```

### Sliding Window Algorithm

**How it works**:
1. Track request timestamps in rolling window
2. Count requests in current window
3. Remove old requests outside window
4. Allow if count < limit

**Advantages**:
- More accurate than fixed window
- Prevents burst at window boundaries
- Fair distribution over time

**Implementation**: `framework/runtime/src/security/redis-rate-limiter.ts`

```typescript
import { RedisSlidingWindowRateLimiter } from '@athyper/runtime';

const limiter = new RedisSlidingWindowRateLimiter(
  redis,
  {
    maxRequests: 1000,
    windowMs: 60000,
    keyPrefix: 'ratelimit'
  }
);

const result = await limiter.consume('tenant:customer-a');
```

## Per-Tenant Rate Limiting

### Basic Per-Tenant Limiting

**Middleware**: `framework/runtime/src/middleware/rate-limit.ts`

```typescript
import { perTenantRateLimiter } from '@athyper/runtime';

// Apply rate limiting per tenant
app.use(perTenantRateLimiter(limiter));
```

**How it works**:
1. Extract tenant from request context (JWT token)
2. Create rate limit key: `tenant:<tenant-key>`
3. Check rate limit for tenant
4. Block if exceeded, allow otherwise

**Example**:
```typescript
// Request 1 from customer-a
// Key: "tenant:customer-a"
// Remaining: 999/1000

// Request 2 from customer-b
// Key: "tenant:customer-b"
// Remaining: 999/1000 (independent bucket)
```

### Tiered Rate Limits

Different limits based on tenant tier:

```typescript
import { rateLimitMiddleware } from '@athyper/runtime';

const TIER_LIMITS = {
  free: { maxRequests: 100, windowMs: 60000 },
  basic: { maxRequests: 1000, windowMs: 60000 },
  premium: { maxRequests: 10000, windowMs: 60000 },
  enterprise: { maxRequests: 50000, windowMs: 60000 }
};

app.use(async (req, res, next) => {
  const tenant = await tenantRegistry.get(req.context.tenantKey);
  const tierLimits = TIER_LIMITS[tenant?.tier || 'free'];

  const limiter = new RedisRateLimiter(redis, tierLimits);
  const middleware = rateLimitMiddleware({ limiter });

  middleware(req, res, next);
});
```

## Multi-Dimensional Rate Limiting

### Stacking Rate Limiters

Apply multiple rate limiters simultaneously:

```typescript
import { combineRateLimiters, perTenantRateLimiter, perUserRateLimiter, perIpRateLimiter } from '@athyper/runtime';

// Tenant limit: 10,000/min
const tenantLimiter = new RedisRateLimiter(redis, {
  maxRequests: 10000,
  windowMs: 60000
});

// User limit: 1,000/min
const userLimiter = new RedisRateLimiter(redis, {
  maxRequests: 1000,
  windowMs: 60000
});

// IP limit: 100/min (prevent abuse)
const ipLimiter = new RedisRateLimiter(redis, {
  maxRequests: 100,
  windowMs: 60000
});

// Apply all limiters
app.use(
  combineRateLimiters([
    perTenantRateLimiter(tenantLimiter),
    perUserRateLimiter(userLimiter),
    perIpRateLimiter(ipLimiter)
  ])
);
```

**Evaluation**:
1. Check tenant limit first
2. If tenant OK, check user limit
3. If user OK, check IP limit
4. Allow only if all pass

### Per-Endpoint Rate Limiting

Different limits for different endpoints:

```typescript
import { perEndpointRateLimiter } from '@athyper/runtime';

// Write endpoints: stricter limits
app.use('/api/write', perEndpointRateLimiter(
  new RedisRateLimiter(redis, RATE_LIMIT_PROFILES.write)
));

// Sensitive endpoints: very strict
app.use('/api/auth', perEndpointRateLimiter(
  new RedisRateLimiter(redis, RATE_LIMIT_PROFILES.sensitive)
));

// Public endpoints: relaxed
app.use('/api/public', perEndpointRateLimiter(
  new RedisRateLimiter(redis, RATE_LIMIT_PROFILES.public)
));
```

### Custom Cost

Assign different costs to operations:

```typescript
app.post('/api/export', async (req, res, next) => {
  // Export costs 10 tokens (expensive operation)
  const result = await limiter.consume('user-123', 10);

  if (!result.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: result.retryAfter
    });
  }

  next();
});

app.get('/api/users', async (req, res, next) => {
  // Read costs 1 token (cheap operation)
  const result = await limiter.consume('user-123', 1);
  // ...
});
```

## Rate Limit Profiles

### Pre-configured Profiles

**File**: `framework/core/src/security/rate-limiter.ts`

```typescript
export const RATE_LIMIT_PROFILES = {
  // Public endpoints (no auth)
  public: {
    maxRequests: 100,
    windowMs: 60000,  // 100 requests/minute
    strategy: 'token_bucket' as const
  },

  // Authenticated users
  authenticated: {
    maxRequests: 1000,
    windowMs: 60000,  // 1,000 requests/minute
    strategy: 'token_bucket' as const
  },

  // Premium tier
  premium: {
    maxRequests: 10000,
    windowMs: 60000,  // 10,000 requests/minute
    strategy: 'token_bucket' as const
  },

  // Write operations
  write: {
    maxRequests: 100,
    windowMs: 60000,  // 100 writes/minute
    strategy: 'token_bucket' as const
  },

  // Sensitive operations (login, password reset)
  sensitive: {
    maxRequests: 5,
    windowMs: 60000,  // 5 requests/minute
    strategy: 'fixed_window' as const
  }
};
```

**Usage**:
```typescript
import { RATE_LIMIT_PROFILES } from '@athyper/core';

const publicLimiter = new MemoryRateLimiter(RATE_LIMIT_PROFILES.public);
const writeLimiter = new MemoryRateLimiter(RATE_LIMIT_PROFILES.write);
```

## Distributed Rate Limiting

### Redis-Backed Rate Limiter

**File**: `framework/runtime/src/security/redis-rate-limiter.ts`

**Features**:
- **Atomic operations** - Lua scripts ensure consistency
- **Multi-instance safe** - All instances share Redis state
- **Fail-open** - Continues if Redis unavailable

**Implementation**:
```typescript
import { RedisRateLimiter } from '@athyper/runtime';
import { createRedisClient } from '@athyper/adapter-memorycache';

const redis = createRedisClient({
  host: 'localhost',
  port: 6379
});

const limiter = new RedisRateLimiter(redis, {
  maxRequests: 1000,
  windowMs: 60000,
  keyPrefix: 'ratelimit'
});

// Use in middleware
app.use(rateLimitMiddleware({ limiter }));
```

**Lua Script** (atomic consume):
```lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local count = redis.call('GET', key)
if count == false then
  count = 0
else
  count = tonumber(count)
end

if count + cost <= limit then
  redis.call('INCRBY', key, cost)
  redis.call('PEXPIRE', key, window)
  return {1, limit - count - cost}
else
  return {0, 0}
end
```

### Sliding Window Implementation

```typescript
import { RedisSlidingWindowRateLimiter } from '@athyper/runtime';

const limiter = new RedisSlidingWindowRateLimiter(redis, {
  maxRequests: 1000,
  windowMs: 60000,
  keyPrefix: 'ratelimit'
});

// More accurate than fixed window
// Prevents burst at window boundaries
```

**Lua Script** (sliding window):
```lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Remove old entries outside window
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

-- Count entries in current window
local count = redis.call('ZCARD', key)

if count < limit then
  -- Add new entry
  redis.call('ZADD', key, now, now .. math.random())
  redis.call('PEXPIRE', key, window)
  return {1, limit - count - 1}
else
  return {0, 0}
end
```

## Configuration

### Middleware Configuration

```typescript
import { rateLimitMiddleware } from '@athyper/runtime';

app.use(rateLimitMiddleware({
  limiter: redisLimiter,

  // Extract key from request
  keyGenerator: (req) => {
    return `tenant:${req.context.tenantKey}:user:${req.context.userId}`;
  },

  // Custom error handler
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  },

  // Skip rate limiting for certain requests
  skip: (req) => {
    // Skip for admin users
    return req.context.roles.includes('admin');
  },

  // Custom headers
  headers: true,           // Enable RateLimit-* headers
  legacyHeaders: false,    // Disable X-RateLimit-* headers

  // Store client info (for logging)
  requestWasSuccessful: (req, res) => res.statusCode < 400
}));
```

### Header Configuration

**Standard Headers** (RFC draft):
```
RateLimit-Limit: 1000
RateLimit-Remaining: 950
RateLimit-Reset: 1640000000
```

**Legacy Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1640000000
```

**Retry-After** (on 429):
```
Retry-After: 60
```

## Monitoring

### Metrics

**Collect rate limit metrics**:
```typescript
import { metricsRegistry } from '@athyper/runtime';

// In rate limit middleware
if (!result.allowed) {
  metricsRegistry.incrementCounter('rate_limit_exceeded', {
    tenant: req.context.tenantKey,
    endpoint: req.path
  });
}

metricsRegistry.recordHistogram('rate_limit_remaining', result.remaining, {
  tenant: req.context.tenantKey
});
```

**Prometheus Metrics**:
```
# Rate limit exceeded counter
rate_limit_exceeded_total{tenant="customer-a",endpoint="/api/users"} 5

# Rate limit remaining distribution
rate_limit_remaining_bucket{tenant="customer-a",le="100"} 10
rate_limit_remaining_bucket{tenant="customer-a",le="500"} 45
rate_limit_remaining_bucket{tenant="customer-a",le="1000"} 100
```

### Alerting

**Alert on high rate limit usage**:
```yaml
# Prometheus alert
groups:
  - name: rate_limiting
    rules:
      - alert: HighRateLimitUsage
        expr: |
          (
            rate(rate_limit_exceeded_total[5m])
            / rate(http_requests_total[5m])
          ) > 0.1
        for: 5m
        annotations:
          summary: "High rate limit rejection rate"
          description: "{{ $labels.tenant }} is being rate limited frequently"
```

### Logging

```typescript
import { logger } from '@athyper/runtime';

if (!result.allowed) {
  logger.warn({
    msg: 'rate_limit_exceeded',
    tenant: req.context.tenantKey,
    userId: req.context.userId,
    endpoint: req.path,
    remaining: result.remaining,
    retryAfter: result.retryAfter
  });
}
```

## Examples

### Complete Rate Limiting Setup

```typescript
// app.ts
import express from 'express';
import { createRedisClient } from '@athyper/adapter-memorycache';
import {
  RedisRateLimiter,
  rateLimitMiddleware,
  perTenantRateLimiter,
  perUserRateLimiter,
  combineRateLimiters
} from '@athyper/runtime';
import { RATE_LIMIT_PROFILES } from '@athyper/core';

const app = express();
const redis = createRedisClient({ host: 'localhost', port: 6379 });

// Global rate limiters
const globalLimiter = new RedisRateLimiter(redis, {
  maxRequests: 50000,
  windowMs: 60000,
  keyPrefix: 'global'
});

const tenantLimiter = new RedisRateLimiter(redis, {
  maxRequests: 10000,
  windowMs: 60000,
  keyPrefix: 'tenant'
});

const userLimiter = new RedisRateLimiter(redis, {
  maxRequests: 1000,
  windowMs: 60000,
  keyPrefix: 'user'
});

// Apply global limits
app.use(
  combineRateLimiters([
    rateLimitMiddleware({ limiter: globalLimiter }),
    perTenantRateLimiter(tenantLimiter),
    perUserRateLimiter(userLimiter)
  ])
);

// Sensitive endpoints
const sensitiveLimiter = new RedisRateLimiter(redis, RATE_LIMIT_PROFILES.sensitive);
app.use('/api/auth/login', rateLimitMiddleware({ limiter: sensitiveLimiter }));
app.use('/api/auth/reset-password', rateLimitMiddleware({ limiter: sensitiveLimiter }));

// Write endpoints
const writeLimiter = new RedisRateLimiter(redis, RATE_LIMIT_PROFILES.write);
app.post('/api/*', rateLimitMiddleware({ limiter: writeLimiter }));
app.put('/api/*', rateLimitMiddleware({ limiter: writeLimiter }));
app.delete('/api/*', rateLimitMiddleware({ limiter: writeLimiter }));

app.listen(3000);
```

## See Also

- [Security Overview](./README.md)
- [Validation](./VALIDATION.md)
- [Sanitization](./SANITIZATION.md)
- [Multi-Tenancy](../architecture/MULTI_TENANCY.md)

---

[← Back to Documentation Home](../README.md)
