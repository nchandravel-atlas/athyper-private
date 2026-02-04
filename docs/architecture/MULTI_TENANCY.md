# Multi-Tenancy Architecture

This document describes the multi-tenant architecture of the Athyper platform, covering tenant isolation, IAM strategies, and data partitioning.

## Table of Contents

- [Multi-Tenancy Overview](#multi-tenancy-overview)
- [IAM Strategies](#iam-strategies)
- [Tenant Isolation](#tenant-isolation)
- [Tenant Registry](#tenant-registry)
- [Request Context Flow](#request-context-flow)
- [Data Partitioning](#data-partitioning)
- [Rate Limiting per Tenant](#rate-limiting-per-tenant)

## Multi-Tenancy Overview

Athyper implements **multi-tenancy** with two key strategies:

1. **Single Realm**: All tenants share one identity provider
2. **Multi Realm**: Each tenant can have separate identity providers

**Tenant Hierarchy**:
```
Realm → Tenant → Organization
```

- **Realm**: Identity provider boundary (Keycloak realm)
- **Tenant**: Customer/company (data isolation boundary)
- **Organization**: Department/team within tenant (optional sub-grouping)

## IAM Strategies

### Single Realm Strategy

All tenants authenticate against the same identity provider (Keycloak realm).

**Configuration** (`kernel.config.json`):
```json
{
  "iam": {
    "strategy": "single_realm",
    "defaultRealmKey": "main",
    "realms": {
      "main": {
        "iam": {
          "issuerUrl": "https://auth.example.com/realms/main",
          "clientId": "athyper-runtime",
          "clientSecretRef": "MAIN_CLIENT_SECRET"
        },
        "tenants": {
          "customer-a": {
            "defaults": { "country": "US" }
          },
          "customer-b": {
            "defaults": { "country": "CA" }
          }
        }
      }
    }
  }
}
```

**Use Cases**:
- SaaS products with uniform authentication
- Internal applications
- Cost optimization (single IdP to manage)

**Tenant Resolution**:
- From JWT token claims (`tenant_key`, `tenant_id`)
- From subdomain (`customer-a.example.com`)
- From API key
- From default tenant in configuration

### Multi Realm Strategy

Each tenant (or group of tenants) can have separate identity providers.

**Configuration** (`kernel.config.json`):
```json
{
  "iam": {
    "strategy": "multi_realm",
    "defaultRealmKey": "main",
    "realms": {
      "main": {
        "iam": {
          "issuerUrl": "https://auth.example.com/realms/main",
          "clientId": "athyper-runtime",
          "clientSecretRef": "MAIN_CLIENT_SECRET"
        },
        "tenants": {
          "tenant-1": {},
          "tenant-2": {}
        }
      },
      "enterprise-customer": {
        "iam": {
          "issuerUrl": "https://auth.customer.com/realms/customer",
          "clientId": "athyper-runtime",
          "clientSecretRef": "CUSTOMER_CLIENT_SECRET"
        },
        "tenants": {
          "customer-a": {
            "defaults": { "features": { "sso": true } }
          }
        }
      }
    }
  }
}
```

**Use Cases**:
- Enterprise customers requiring SSO with their IdP
- Regulated industries requiring data sovereignty
- White-label solutions

**Realm Resolution**:
1. From JWT issuer URL (`iss` claim)
2. From subdomain (`customer-a.example.com` → realm lookup)
3. From tenant registry (tenant → realm mapping)
4. From default realm in configuration

## Tenant Isolation

### Data Isolation

**Database Level**:
- All tables include `tenant_id` column
- Row-level security policies enforce tenant isolation
- Indexes on `(tenant_id, ...)` for performance

**Example Schema**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);

-- Index for tenant-scoped queries
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

**Cache Isolation**:
- Cache keys prefixed with tenant ID: `tenant:<tenant-id>:<key>`
- Prevents cross-tenant data leaks
- Separate eviction policies per tenant

**Example**:
```typescript
// Cache key format
const cacheKey = `tenant:${tenantId}:user:${userId}`;
await cache.set(cacheKey, userData, { ttl: 3600 });
```

**Object Storage Isolation**:
- S3 bucket structure: `/<tenant-id>/<path>`
- IAM policies restrict access by tenant
- Presigned URLs scoped to tenant

**Example**:
```typescript
// Storage path format
const storagePath = `${tenantId}/uploads/${fileId}`;
await storage.put(storagePath, fileBuffer);
```

### Network Isolation

**Rate Limiting**:
- Per-tenant rate limits prevent one tenant from affecting others
- Separate buckets per tenant
- Configurable limits per tenant tier

**Circuit Breakers**:
- Shared circuit breakers across all tenants
- Prevents cascading failures affecting all tenants

### Compute Isolation

**API Mode**:
- Requests processed in isolated request context
- No shared state between tenant requests
- Memory isolation via Node.js event loop

**Worker Mode**:
- Jobs tagged with tenant ID
- Worker pool processes jobs fairly across tenants
- No tenant can monopolize workers

## Tenant Registry

The tenant registry maintains tenant configuration and metadata.

**Interface** (`framework/core/src/registry/tenantRegistry.ts`):
```typescript
export interface TenantRegistry {
  get(tenantKey: string): Promise<TenantInfo | undefined>;
  getByRealmAndId(realmKey: string, tenantId: string): Promise<TenantInfo | undefined>;
  list(realmKey?: string): Promise<TenantInfo[]>;
}

export type TenantInfo = {
  tenantKey: string;
  tenantId: string;
  realmKey: string;

  defaults?: {
    country?: string;
    timezone?: string;
    currency?: string;
    [key: string]: unknown;
  };

  features?: Record<string, boolean>;
  metadata?: Record<string, unknown>;
};
```

**Implementation**:

**In-Memory Registry** (reads from kernel config):
```typescript
// framework/core/src/registry/tenantRegistry.ts
export class InMemoryTenantRegistry implements TenantRegistry {
  private tenants = new Map<string, TenantInfo>();

  constructor(tenants: TenantInfo[]) {
    for (const tenant of tenants) {
      this.tenants.set(tenant.tenantKey, tenant);
    }
  }

  async get(tenantKey: string): Promise<TenantInfo | undefined> {
    return this.tenants.get(tenantKey);
  }

  async getByRealmAndId(realmKey: string, tenantId: string): Promise<TenantInfo | undefined> {
    return Array.from(this.tenants.values()).find(
      (t) => t.realmKey === realmKey && t.tenantId === tenantId
    );
  }

  async list(realmKey?: string): Promise<TenantInfo[]> {
    const all = Array.from(this.tenants.values());
    return realmKey ? all.filter((t) => t.realmKey === realmKey) : all;
  }
}
```

**Database-Backed Registry** (future):
- Tenants stored in `tenants` table
- Dynamic tenant provisioning via admin API
- Cached in Redis for performance

## Request Context Flow

Every request carries tenant context throughout the system.

### 1. Authentication

**JWT Token** includes tenant claims:
```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "tenant_key": "customer-a",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
  "realm_key": "main",
  "org_key": "HQ",
  "roles": ["user", "admin"]
}
```

### 2. Middleware Extraction

**Authentication Middleware** extracts tenant from JWT:
```typescript
// framework/runtime/src/middleware/auth.ts
export function authMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    const decoded = await verifyJwt(token);

    // Store in request context
    req.context = {
      userId: decoded.sub,
      tenantKey: decoded.tenant_key,
      tenantId: decoded.tenant_id,
      realmKey: decoded.realm_key,
      orgKey: decoded.org_key,
      roles: decoded.roles
    };

    next();
  };
}
```

### 3. Request Context Storage

**AsyncLocalStorage** maintains context throughout async calls:
```typescript
// framework/core/src/observability/tracing.ts
export class RequestContextStorage {
  private storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  get(): RequestContext | undefined {
    return this.storage.getStore();
  }
}
```

### 4. Database Queries

**Set session variable** before query:
```typescript
// framework/adapters/db/src/kysely.ts
export async function withTenantContext<T>(
  db: Kysely<Database>,
  tenantId: string,
  fn: (db: Kysely<Database>) => Promise<T>
): Promise<T> {
  await db.raw(`SET LOCAL app.tenant_id = '${tenantId}'`).execute();
  return fn(db);
}
```

**Row-level security** enforces isolation:
```sql
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

### 5. Cache Operations

**Prefix cache keys** with tenant ID:
```typescript
// framework/runtime/src/cache/tenant-cache.ts
export class TenantScopedCache {
  constructor(private cache: CacheAdapter, private tenantId: string) {}

  async get<T>(key: string): Promise<T | null> {
    const scopedKey = `tenant:${this.tenantId}:${key}`;
    return this.cache.get(scopedKey);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const scopedKey = `tenant:${this.tenantId}:${key}`;
    return this.cache.set(scopedKey, value, ttl);
  }
}
```

### 6. Storage Operations

**Prefix storage paths** with tenant ID:
```typescript
// framework/runtime/src/storage/tenant-storage.ts
export class TenantScopedStorage {
  constructor(private storage: ObjectStorageAdapter, private tenantId: string) {}

  async put(key: string, body: Buffer): Promise<void> {
    const scopedKey = `${this.tenantId}/${key}`;
    return this.storage.put(scopedKey, body);
  }

  async get(key: string): Promise<Buffer> {
    const scopedKey = `${this.tenantId}/${key}`;
    return this.storage.get(scopedKey);
  }
}
```

## Data Partitioning

### Logical Partitioning

**Single Database, Tenant Column**:
- All tenant data in one database
- `tenant_id` column on every table
- Simplest to implement and maintain
- Suitable for < 1000 tenants

**Advantages**:
- Easy migrations (single database)
- Simple backup/restore
- Cost-effective

**Disadvantages**:
- Performance degrades with many tenants
- Cannot isolate noisy neighbors
- Compliance challenges (data residency)

### Physical Partitioning

**Database per Tenant** (future):
- Each tenant has dedicated database
- Complete data isolation
- Scale independently per tenant

**Advantages**:
- Strong isolation
- Independent scaling
- Easier compliance

**Disadvantages**:
- Complex migrations (N databases)
- Higher operational overhead
- More expensive

**Sharding** (future):
- Tenants distributed across multiple databases
- Shard routing based on tenant key hash
- Balance between isolation and cost

## Rate Limiting per Tenant

### Per-Tenant Buckets

Each tenant has independent rate limit buckets:

```typescript
// framework/runtime/src/middleware/rate-limit.ts
export function perTenantRateLimiter(limiter: RateLimiter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const tenantKey = req.context?.tenantKey;
    if (!tenantKey) {
      return res.status(401).json({ error: 'Tenant not identified' });
    }

    const key = `tenant:${tenantKey}`;
    const result = await limiter.consume(key);

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: result.retryAfter
      });
    }

    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', result.resetTime.toString());

    next();
  };
}
```

### Tiered Rate Limits

Different rate limits per tenant tier:

```typescript
// Tenant metadata includes tier
{
  "tenantKey": "enterprise-customer",
  "tier": "enterprise",
  "features": { "advancedReporting": true }
}

// Rate limit configuration
const TIER_RATE_LIMITS = {
  free: { maxRequests: 100, windowMs: 60000 },      // 100/min
  basic: { maxRequests: 1000, windowMs: 60000 },    // 1000/min
  premium: { maxRequests: 10000, windowMs: 60000 }, // 10000/min
  enterprise: { maxRequests: 50000, windowMs: 60000 } // 50000/min
};

// Apply rate limit based on tier
const tenant = await tenantRegistry.get(tenantKey);
const tierLimits = TIER_RATE_LIMITS[tenant.tier || 'free'];
const limiter = new RedisRateLimiter(tierLimits);
```

### Distributed Rate Limiting

**Redis-backed counters** ensure accurate rate limiting across multiple API instances:

```typescript
// framework/runtime/src/security/redis-rate-limiter.ts
export class RedisRateLimiter implements RateLimiter {
  private lua = `
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
  `;

  async consume(key: string, cost: number = 1): Promise<RateLimitResult> {
    const fullKey = `${this.keyPrefix}:${key}`;
    const now = Date.now();

    try {
      const [allowed, remaining] = await this.redis.eval(
        this.lua,
        1,
        fullKey,
        this.maxRequests,
        this.windowMs,
        cost,
        now
      ) as [number, number];

      return {
        allowed: allowed === 1,
        remaining,
        limit: this.maxRequests,
        resetTime: now + this.windowMs,
        retryAfter: allowed === 0 ? Math.ceil(this.windowMs / 1000) : 0
      };
    } catch (error) {
      // Fail open on Redis errors
      return {
        allowed: true,
        remaining: this.maxRequests,
        limit: this.maxRequests,
        resetTime: now + this.windowMs,
        retryAfter: 0
      };
    }
  }
}
```

## Tenant Onboarding

### Manual Onboarding

1. **Add tenant to kernel config**:
   ```json
   {
     "tenants": {
       "new-customer": {
         "defaults": {
           "country": "US",
           "timezone": "America/New_York"
         }
       }
     }
   }
   ```

2. **Create tenant in database**:
   ```sql
   INSERT INTO tenants (id, tenant_key, name, created_at)
   VALUES (gen_random_uuid(), 'new-customer', 'New Customer Inc.', NOW());
   ```

3. **Create Keycloak user** for tenant admin

4. **Restart runtime** to load new tenant configuration

### Automated Onboarding (future)

1. **Admin API endpoint**: `POST /api/admin/tenants`
2. **Provision resources**:
   - Create database tenant record
   - Create S3 bucket prefix
   - Create Keycloak user
   - Update tenant registry
3. **No runtime restart required**

## See Also

- [System Architecture Overview](./OVERVIEW.md)
- [Domain-Driven Design Patterns](./DDD_PATTERNS.md)
- [Rate Limiting](../security/RATE_LIMITING.md)
- [Configuration](../deployment/CONFIGURATION.md)

---

[← Back to Architecture](./README.md) | [Back to Documentation Home](../README.md)
