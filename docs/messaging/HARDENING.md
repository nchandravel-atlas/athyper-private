# Messaging System Hardening

This document describes the security hardening, observability, and reliability features implemented in the messaging system.

## Overview

Phase E implements three critical pillars of production readiness:

1. **Audit Logging** - Complete audit trail for compliance and security
2. **Rate Limiting** - Abuse prevention and fair resource allocation
3. **Observability** - Metrics, monitoring, and performance tracking

## 1. Audit Logging

### Purpose

- Compliance with regulatory requirements (GDPR, SOC 2, HIPAA)
- Security incident investigation
- User activity tracking
- Access control decision trail

### Implementation

**File**: `framework/runtime/src/services/enterprise-services/in-app-messaging/domain/audit/MessagingAuditLogger.ts`

### Audit Events

The system logs 12 event types:

1. **message.sent** - Message created
2. **message.edited** - Message modified
3. **message.deleted** - Message soft-deleted
4. **message.read** - Message marked as read
5. **conversation.created** - New conversation
6. **conversation.updated** - Conversation modified
7. **participant.added** - User added to conversation
8. **participant.removed** - User removed from conversation
9. **search.executed** - Search query performed
10. **access.granted** - Access control check passed
11. **access.denied** - Access control check failed
12. **rate_limit.exceeded** - Rate limit triggered

### Audit Event Structure

```typescript
interface MessagingAuditEvent {
    eventType: MessagingAuditEventType;
    tenantId: string;
    userId: string;
    timestamp: Date;
    conversationId?: ConversationId;
    messageId?: MessageId;
    metadata?: Record<string, unknown>;
    outcome: "success" | "failure";
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
}
```

### Usage Example

```typescript
// Log message sent
await auditLogger.logMessageSent(
    tenantId,
    userId,
    conversationId,
    messageId,
    {
        bodyLength: 250,
        bodyFormat: "plain",
        deliveryCount: 3,
        isThreadReply: false,
    }
);

// Log access denied
await auditLogger.logAccessDenied(
    tenantId,
    userId,
    "conversation",
    "send_message",
    "User is not a participant",
    conversationId
);
```

### Production Integration

In production, integrate with your central audit system:

```typescript
class MessagingAuditLogger {
    constructor(private kernelAuditWriter: AuditWriter) {}

    async log(event: MessagingAuditEvent): Promise<void> {
        // Write to kernel audit database
        await this.kernelAuditWriter.write({
            service: "in-app-messaging",
            ...event,
        });

        // Also stream to SIEM (Security Information and Event Management)
        await this.siemClient.send(event);
    }
}
```

### Retention Policy

- **Hot storage**: 90 days (fast query)
- **Cold storage**: 7 years (compliance)
- **Archive**: Encrypted backup for legal hold

## 2. Rate Limiting

### Purpose

- Prevent spam and abuse
- Protect system resources
- Ensure fair usage across tenants
- DDoS mitigation

### Implementation

**File**: `framework/runtime/src/services/enterprise-services/in-app-messaging/domain/rate-limit/MessagingRateLimiter.ts`

### Rate Limits

| Operation | Window | Max Requests | Purpose |
|-----------|--------|--------------|---------|
| Message Send | 60s | 100 | Prevent spam |
| Search Query | 60s | 20 | Protect FTS performance |
| Conversation Create | 60s | 10 | Prevent abuse |

### Algorithm

Sliding window algorithm with Redis:

```
┌─────────────────────────────────┐
│ Sliding Window (60 seconds)     │
├─────────────────────────────────┤
│ Request timestamps in sorted set│
│ - Remove old entries             │
│ - Count current entries          │
│ - Allow if < max                 │
│ - Add new timestamp              │
└─────────────────────────────────┘
```

### Usage Example

```typescript
// Check rate limit (returns result)
const result = await rateLimiter.checkMessageSendLimit(tenantId, userId);
if (!result.allowed) {
    throw new RateLimitExceededError("message_send", result.retryAfter);
}

// Or enforce directly (throws if exceeded)
await rateLimiter.enforceMessageSendLimit(tenantId, userId);
```

### Response Headers

When rate limit is hit, API returns:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1738567890
Retry-After: 45

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many messages. Retry after 45 seconds."
  }
}
```

### Production with Redis

Replace in-memory store with Redis:

```typescript
async checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count current requests
    const currentCount = await redis.zcard(key);

    if (currentCount >= config.maxRequests) {
        const oldestScore = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetAt = new Date(parseInt(oldestScore[1]) + config.windowMs);
        return {
            allowed: false,
            remaining: 0,
            resetAt,
            retryAfter: Math.ceil((resetAt.getTime() - now) / 1000),
        };
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, Math.ceil(config.windowMs / 1000));

    return {
        allowed: true,
        remaining: config.maxRequests - currentCount - 1,
        resetAt: new Date(now + config.windowMs),
    };
}
```

### Per-Tenant vs Per-User

Current implementation: **Per-user** (prevents individual abuse)

Alternative: **Per-tenant** (shared quota across organization)

```typescript
// Per-tenant key
const key = `msg:send:${tenantId}`;

// Per-user key (current)
const key = `msg:send:${tenantId}:${userId}`;
```

## 3. Observability

### Purpose

- Performance monitoring
- Anomaly detection
- Capacity planning
- Debugging and troubleshooting

### Implementation

**File**: `framework/runtime/src/services/enterprise-services/in-app-messaging/domain/observability/MessagingMetrics.ts`

### Metrics Types

#### Counters (cumulative)
- `messaging.messages.sent`
- `messaging.messages.edited`
- `messaging.messages.deleted`
- `messaging.search.queries`
- `messaging.rate_limits.exceeded`
- `messaging.errors`

#### Histograms (distributions)
- `messaging.search.latency_ms`
- `messaging.search.result_count`
- `messaging.operations.latency_ms`
- `messaging.db.query_latency_ms`

#### Gauges (current values)
- `messaging.rate_limits.remaining`

### Labels

All metrics include labels for filtering:
- `tenantId` - Multi-tenant isolation
- `conversationId` - Conversation-level analysis
- `operation` - Operation type
- `status` - success/failure
- `errorType` - Error classification

### Usage Example

```typescript
// Track message sent
metrics.trackMessageSent(tenantId, conversationId);

// Track with latency
const timer = new MetricTimer(metrics);
// ... perform operation ...
timer.stop("sendMessage", tenantId);

// Track error
metrics.trackError("ValidationError", "sendMessage", tenantId);
```

### Prometheus Integration

```typescript
import { Counter, Histogram, Gauge, Registry } from "prom-client";

class MessagingMetrics {
    private messagesSent: Counter;
    private searchLatency: Histogram;
    private rateLimitRemaining: Gauge;

    constructor(registry: Registry) {
        this.messagesSent = new Counter({
            name: "messaging_messages_sent_total",
            help: "Total messages sent",
            labelNames: ["tenantId", "conversationId", "status"],
            registers: [registry],
        });

        this.searchLatency = new Histogram({
            name: "messaging_search_latency_milliseconds",
            help: "Search query latency",
            labelNames: ["tenantId", "conversationId"],
            buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
            registers: [registry],
        });
    }

    trackMessageSent(tenantId: string, conversationId: string): void {
        this.messagesSent.inc({ tenantId, conversationId, status: "success" });
    }
}
```

### Grafana Dashboards

Recommended dashboards:

1. **Messaging Overview**
   - Messages sent (rate)
   - Active conversations
   - Error rate
   - P50/P95/P99 latency

2. **Search Performance**
   - Search queries per second
   - Average latency
   - Result counts
   - Slow queries (>1s)

3. **Rate Limiting**
   - Rate limit hits per tenant
   - Most limited users
   - Limit headroom

4. **Errors**
   - Error rate by type
   - Top failing operations
   - Error spike alerts

### Alerts

Configure alerts for:

```yaml
# High error rate
alert: MessagingHighErrorRate
expr: rate(messaging_errors[5m]) > 0.05
severity: warning
message: "Messaging error rate above 5%"

# Search latency
alert: MessagingSlowSearch
expr: histogram_quantile(0.95, messaging_search_latency_milliseconds) > 1000
severity: warning
message: "95th percentile search latency > 1 second"

# Rate limit exhaustion
alert: MessagingRateLimitExhaustion
expr: rate(messaging_rate_limits_exceeded[1m]) > 10
severity: critical
message: "High rate of rate limit hits"
```

## 4. Error Handling

### Error Types

```typescript
// Rate limit
class RateLimitExceededError extends Error {
    constructor(public limitType: string, public retryAfter: number) {
        super(`Rate limit exceeded for ${limitType}`);
    }
}

// Access control
class AccessDeniedError extends Error {
    constructor(public resource: string, public action: string) {
        super(`Access denied: ${action} on ${resource}`);
    }
}

// Validation
class ValidationError extends Error {
    constructor(public field: string, public constraint: string) {
        super(`Validation failed: ${field} ${constraint}`);
    }
}
```

### API Error Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many messages. Retry after 45 seconds.",
    "details": {
      "limitType": "message_send",
      "retryAfter": 45,
      "limit": 100,
      "window": "60s"
    }
  }
}
```

## 5. Security Best Practices

### Input Validation

- Message body: Max 10,000 characters
- Search query: Max 200 characters, sanitized
- Tenant ID: UUID format validation
- User ID: UUID format validation

### SQL Injection Prevention

- Use parameterized queries (Kysely)
- Never interpolate user input into SQL
- Use sql template tag for FTS queries

### XSS Prevention

- Client-side: Use React's built-in escaping
- Search results: `dangerouslySetInnerHTML` only for ts_headline (Postgres-generated)
- Sanitize user input before storage

### CSRF Protection

- Double-submit cookie pattern (implemented in auth middleware)
- SameSite=Strict cookies
- Custom header validation

## 6. Performance Considerations

### Database Indexes

All critical queries use indexes:
- Message list: `idx_message_conversation_created`
- Search: `idx_message_fts` (GIN)
- Thread queries: `idx_message_parent_thread`

### Connection Pooling

- Kysely with pg pool
- Max connections: Configured per environment
- Connection timeout: 30 seconds

### Caching Strategy

- SWR client-side caching (5s deduplication)
- Redis rate limit state (distributed)
- No server-side message caching (real-time priority)

### Scalability

- Stateless services (horizontal scaling)
- Redis for distributed rate limiting
- Postgres read replicas for search queries
- CDN for static assets

## 7. Monitoring Checklist

- [ ] Set up Prometheus metrics collection
- [ ] Create Grafana dashboards
- [ ] Configure alerts (PagerDuty/Opsgenie)
- [ ] Set up log aggregation (ELK/Splunk)
- [ ] Configure distributed tracing (Jaeger/DataDog)
- [ ] Set up uptime monitoring (Pingdom/UptimeRobot)
- [ ] Configure error tracking (Sentry/Rollbar)
- [ ] Set up APM (New Relic/Datadog APM)

## 8. Incident Response

### High Error Rate

1. Check Grafana for error breakdown
2. Review audit logs for failed operations
3. Check rate limit metrics (abuse?)
4. Review database slow query log
5. Scale up if load spike
6. Roll back if recent deployment

### Rate Limit Alerts

1. Identify affected tenant/user
2. Check audit logs for behavior
3. Determine if legitimate or abuse
4. Adjust limits if legitimate use case
5. Ban user if malicious

### Performance Degradation

1. Check P95 latency metrics
2. Review slow query log
3. Check database connection pool
4. Check Redis latency
5. Review recent code changes
6. Consider read replica failover

## 9. Compliance

### GDPR

- Audit logs: User consent, data access tracking
- Right to erasure: Message deletion workflow
- Data portability: Export API (future)
- Privacy by design: Tenant isolation, encryption

### SOC 2

- Access controls: Participant-only access enforced
- Audit trails: Complete logging
- Encryption: TLS in transit, at rest (Postgres)
- Monitoring: Real-time alerts

### HIPAA (if applicable)

- PHI protection: End-to-end encryption
- Audit logging: All data access logged
- Access controls: Role-based permissions
- Data retention: Configurable retention policies

## 10. Future Enhancements

- [ ] Adaptive rate limiting (ML-based)
- [ ] Anomaly detection (unusual patterns)
- [ ] Auto-scaling based on metrics
- [ ] Cost attribution per tenant
- [ ] Advanced search analytics
- [ ] Tenant-specific rate limit customization
- [ ] Message retention policies per tenant
- [ ] Archive/export functionality
- [ ] Read receipts aggregation optimization
- [ ] Delivery status tracking improvements
