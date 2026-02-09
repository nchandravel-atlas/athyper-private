# Security

Security architecture for the Athyper platform: authentication, authorization, and protection mechanisms.

## Contents

| Document | Description |
|----------|-------------|
| [Auth Architecture](./AUTH_ARCHITECTURE.md) | Full auth design: PKCE, sessions, CSRF, refresh, idle timeout |
| [Rate Limiting](./RATE_LIMITING.md) | Per-tenant rate limiting with token bucket + sliding window |

## Authentication (BFF Pattern)

- **PKCE Authorization Code flow** -- only grant type in staging/production
- **Redis-backed sessions** -- opaque `neon_sid` cookie; JWTs never reach browser
- **Session ID rotation** -- new `sid` on every auth event
- **Idle timeout (900s)** -- server-side enforcement; blocks refresh when expired
- **Proactive token refresh** -- client timer at `expiresAt - 90s`
- **Boot-time safety** -- realm issuer validation, environment guardrails

See [Auth Architecture](./AUTH_ARCHITECTURE.md) for full details.

## CSRF Protection

- **Double-submit cookie** -- `__csrf` cookie + `x-csrf-token` header
- **Middleware enforcement** -- Next.js edge middleware on `POST/PUT/PATCH/DELETE` to `/api/*`
- **Exempt**: `/api/auth/login`, `/api/auth/callback`

## Tenant Isolation

- **Session**: Redis key includes `tenantId`; cross-tenant = destroy + audit
- **Database**: `tenant_id` column with row-level security
- **Cache**: keys prefixed `tenant:<tenantId>:`
- **Storage**: S3 paths prefixed `<tenantId>/`
- **Rate limiting**: independent per-tenant buckets

## Input Validation & Sanitization

**Validation** (`framework/core/src/security/validator.ts`):
- 14+ types (string, number, email, URL, UUID, etc.)
- Pre-defined rulesets for common operations

**Sanitization** (`framework/core/src/security/sanitizer.ts`):
- HTML/XSS, prototype pollution, path traversal, SQL LIKE injection
- Profiles: basic, strict, username, slug, searchQuery, richText

## Rate Limiting

- **Token bucket** -- burst-friendly with smooth refill
- **Sliding window** -- Redis-backed, accurate across boundaries
- **Per-tenant buckets** -- prevent noisy neighbors
- **Profiles**: public (100/min), authenticated (1000/min), premium (10K/min), write (100/min), sensitive (5/min)
- **Fail-open** on Redis errors

See [Rate Limiting](./RATE_LIMITING.md) for details.

## Audit Logging

**Framework** (14 event types via `emitAuthAudit()`): login, refresh, logout, session killed, session rotated, JWKS failure, cross-tenant rejection, CSRF violation, IP binding mismatch, issuer mismatch, MFA

**BFF** (`@neon/auth/audit`): Redis LIST `audit:auth:{tenantId}`, 10K cap, 10 event types

## Environment Profiles

| Setting | Local | Staging | Production |
|---------|-------|---------|------------|
| Access token TTL | 300s | 600s | 900s |
| Session TTL | 3600s | 7200s | 28800s |
| Cookie Secure | No | Yes | Yes |
| Password grant | Yes | No | No |
| HTTPS required | No | Yes | Yes |

Unknown environments default to **production** profile.

## Key Files

| Area | Path |
|------|------|
| BFF auth routes | `products/neon/apps/web/app/api/auth/*/route.ts` |
| Client hooks | `products/neon/apps/web/lib/{auth-refresh,idle-tracker,csrf,session-bootstrap}.ts` |
| Auth server lib | `products/neon/auth/server/{keycloak,session,types,audit}.ts` |
| Middleware | `products/neon/apps/web/middleware.ts` |
| Session store | `framework/runtime/src/services/platform/foundation/security/session-store.ts` |
| Rate limiter | `framework/core/src/security/rate-limiter.ts` |
| Validator | `framework/core/src/security/validator.ts` |
| Sanitizer | `framework/core/src/security/sanitizer.ts` |

---

[Back to Documentation Home](../README.md)
