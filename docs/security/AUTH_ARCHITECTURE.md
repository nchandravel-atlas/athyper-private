# Auth Architecture

> **Scope:** End-to-end authentication and session management for the athyper platform.
> **Last updated:** 2025-02-06

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Architecture Overview](#2-architecture-overview)
3. [PKCE Authorization Code Flow](#3-pkce-authorization-code-flow)
4. [Redis Session Model](#4-redis-session-model)
5. [Cookie Strategy](#5-cookie-strategy)
6. [CSRF Protection](#6-csrf-protection)
7. [Token Refresh](#7-token-refresh)
8. [Idle Timeout and Auto-Logout](#8-idle-timeout-and-auto-logout)
9. [Session State Machine](#9-session-state-machine)
10. [Tenant Isolation](#10-tenant-isolation)
11. [Boot-Time Safety Checks](#11-boot-time-safety-checks)
12. [Environment Profiles](#12-environment-profiles)
13. [Session Invalidation on IAM Changes](#13-session-invalidation-on-iam-changes)
14. [Audit Events](#14-audit-events)
15. [File Map](#15-file-map)

---

## 1. Design Principles

| Principle | Implementation |
|---|---|
| **Tokens never reach the browser** | Cookie holds only an opaque `neon_sid`. All JWTs stay server-side in Redis. |
| **Fail closed** | Redis down = 401 for all requests. No fail-open fallback. |
| **Idle timeout is a hard security control** | An idle-expired session blocks token refresh, even if the refresh token is still valid. |
| **Defense in depth** | CSRF double-submit, IP/UA soft binding, issuer validation, environment guardrails. |
| **Tenant isolation by design** | Every session key includes `tenantId`. Cross-tenant access triggers anomaly detection and session destruction. |
| **Session ID rotation** | New `sid` on every auth event (login callback, token refresh) to prevent session fixation. |

---

## 2. Architecture Overview

```
Browser                    Next.js BFF (Edge + API Routes)         Redis          Keycloak
  |                                   |                              |               |
  |--- GET /api/auth/login ---------> |                              |               |
  |                                   |--- PKCE state (300s TTL) --> |               |
  |<--- 302 Redirect to Keycloak -----|                              |               |
  |                                   |                              |               |
  |--- (user authenticates) --------> |                              |               |
  |                                   |                              |               |
  |--- GET /api/auth/callback ------> |                              |               |
  |                                   |--- exchange code+verifier ---|-------------> |
  |                                   |<--- tokens ------------------|-------------- |
  |                                   |--- store session ----------> |               |
  |<--- Set-Cookie: neon_sid ---------|                              |               |
  |<--- Set-Cookie: __csrf ----------|                              |               |
  |                                   |                              |               |
  |--- GET /api/auth/session -------> |--- load session ----------> |               |
  |<--- { userId, roles, ... } ------|                              |               |
  |    (no tokens in response)        |                              |               |
```

### Layers

1. **Neon BFF** (`products/athyper-neon/`) — Next.js API routes handle login, callback, session, refresh, touch, logout, and debug. The BFF is the only component that touches tokens.
2. **Auth Server Library** (`products/athyper-neon/auth/server/`) — PKCE utilities, Keycloak token exchange, session cookie management. Marked `"server-only"` to prevent client import.
3. **Framework Security** (`framework/runtime/.../foundation/security/`) — RedisSessionStore, realm safety, environment profiles, auth audit events.
4. **Framework IAM** (`framework/runtime/.../foundation/iam/`) — Tenant IAM profiles, session invalidation on IAM changes.
5. **Client Hooks** (`products/athyper-neon/apps/web/lib/`) — `useSessionRefresh`, `useIdleTracker`, CSRF utilities, session bootstrap.

---

## 3. PKCE Authorization Code Flow

The platform uses **Authorization Code + PKCE (S256)** exclusively. Direct Grant (password) is disabled in staging and production.

### Login Initiation

`GET /api/auth/login?workbench=admin&returnUrl=/dashboard`

1. Generate PKCE challenge: `codeVerifier` (32 random bytes, base64url), `codeChallenge` (SHA-256 of verifier), `state` (16 random bytes, hex).
2. Store `{ codeVerifier, workbench, returnUrl }` in Redis under `pkce_state:{state}` with 300s TTL.
3. Redirect to Keycloak authorization endpoint with `prompt=login` (forces re-authentication, prevents SSO session reuse after logout).

### Callback

`GET /api/auth/callback?code=...&state=...`

1. Load and validate PKCE state from Redis (one-time use, deleted after load).
2. Exchange authorization code for tokens via Keycloak token endpoint.
3. Decode JWT claims (no verification needed — tokens come directly from Keycloak over HTTPS).
4. Compute `ipHash` and `uaHash` (SHA-256 of `x-forwarded-for` and `user-agent`).
5. Generate session ID (`sid` = SHA-256 of UUID + timestamp) and CSRF token (UUID).
6. Store full session in Redis under `sess:{tenantId}:{sid}` with 8-hour TTL.
7. Add `sid` to user session index: `user_sessions:{tenantId}:{userId}` (Redis SET).
8. Set `neon_sid` cookie (httpOnly) and `__csrf` cookie (JS-readable).
9. Redirect to `returnUrl`.

---

## 4. Redis Session Model

### Key Format

```
sess:{tenantId}:{sid}              → JSON session object (TTL: 28800s / 8h)
user_sessions:{tenantId}:{userId}  → Redis SET of active sids
pkce_state:{state}                 → JSON PKCE verifier (TTL: 300s)
```

### Session Object

```typescript
interface StoredSession {
  version: 1;
  sid: string;
  tenantId: string;
  userId: string;
  principalId: string;
  realmKey: string;
  workbench: "admin" | "user" | "partner";
  roles: string[];
  groups: string[];
  persona: string;
  accessToken: string;        // server-side only
  refreshToken?: string;      // server-side only
  accessExpiresAt: number;    // epoch seconds
  refreshExpiresAt?: number;
  idToken?: string;           // for Keycloak logout
  ipHash: string;             // SHA-256 of client IP
  uaHash: string;             // SHA-256 of user agent
  csrfToken: string;
  createdAt: number;
  lastSeenAt: number;
  authzVersion?: number;
}
```

### Public Session (returned to browser via `/api/auth/session`)

```typescript
{
  authenticated: true,
  userId, username, displayName, workbench, roles, persona, accessExpiresAt
}
```

No tokens, no IP/UA hashes, no internal fields.

---

## 5. Cookie Strategy

| Cookie | `httpOnly` | `secure` | `sameSite` | Purpose |
|---|---|---|---|---|
| `neon_sid` | Yes | Yes (prod/staging) | `lax` | Opaque session ID — only link between browser and Redis session |
| `__csrf` | **No** | Yes (prod/staging) | `strict` | CSRF double-submit token — client JS reads this to send as header |

Both cookies have `path=/` and `maxAge=28800` (8 hours).

---

## 6. CSRF Protection

### Double-Submit Cookie Pattern

1. On session creation, a random UUID `csrfToken` is generated and stored in both the Redis session and the `__csrf` cookie.
2. Client JS reads `__csrf` from `document.cookie` or from the `__SESSION_BOOTSTRAP__` window object.
3. On mutating requests (`POST/PUT/PATCH/DELETE`) to `/api/*`, the client sends the token as the `x-csrf-token` header.
4. Next.js middleware compares `x-csrf-token` header with `__csrf` cookie value. Mismatch returns `403 CSRF_VALIDATION_FAILED`.

### Exempt Paths

- `/api/auth/login` — no session exists yet.
- `/api/auth/callback` — no session exists yet.

### Enforcement Location

- [middleware.ts](products/athyper-neon/apps/web/middleware.ts) — Next.js edge middleware.

---

## 7. Token Refresh

### Server-Side (`POST /api/auth/refresh`)

1. Load Redis session by `neon_sid`.
2. **Idle timeout check**: if `lastSeenAt + 900s < now`, destroy session and return `401 idle_expired`.
3. If access token has > 120s remaining, return no-op.
4. Call Keycloak `grant_type=refresh_token` to get new tokens.
5. Rotate `sid` (new random value), generate new `csrfToken`.
6. Write new session key, delete old key.
7. Update `user_sessions` index (remove old sid, add new sid).
8. Set new `neon_sid` and `__csrf` cookies.
9. On failure: destroy session, clear cookies, return `{ redirect: "/api/auth/login" }`.

### Client-Side (`useSessionRefresh` hook)

- Reads `accessExpiresAt` from `window.__SESSION_BOOTSTRAP__`.
- Schedules `POST /api/auth/refresh` at `accessExpiresAt - 90s` (minimum 5s delay).
- After successful refresh: updates bootstrap in memory, calls `onRefreshSuccess` callback, reschedules.
- On failure: redirects to `/api/auth/login`.

---

## 8. Idle Timeout and Auto-Logout

### Server-Side Enforcement

The idle timeout (900 seconds / 15 minutes) is enforced on every server-side session access:

- **`POST /api/auth/touch`**: If `now - lastSeenAt >= 900`, returns `401 idle_expired`. Otherwise updates `lastSeenAt`.
- **`POST /api/auth/refresh`**: If idle expired, destroys session in Redis and returns `401 idle_expired`.
- **`GET /api/auth/debug`**: Computes `sessionState: idle_expired` when idle.

A stolen `neon_sid` cookie cannot call `/api/auth/touch` to keep a session alive indefinitely — the touch endpoint rejects calls when the session is already idle-expired.

### Client-Side (`useIdleTracker` hook)

1. Listens for user activity events: `mousemove`, `keydown`, `touchstart`, `scroll`, `click`.
2. Every second, computes `idleRemaining = max(0, 900 - secondsSinceLastActivity)`.
3. At `idleRemaining <= 180s`: sets `showWarning = true` with live countdown.
4. Periodically calls `POST /api/auth/touch` (every 60s, only when user was recently active) to sync `lastSeenAt` with server.
5. "Stay signed in" button: resets local activity timer + calls touch to reset server timer.
6. At `idleRemaining <= 0`: calls `POST /api/auth/logout` with CSRF token, follows `logoutUrl` redirect to end Keycloak SSO session.

### Idle Warning UI

The admin workbench displays a warning banner at `idleRemaining <= 180s` with:
- Live countdown: "Session expires in X:XX due to inactivity"
- "Stay signed in" button
- Auto-redirect at 0

---

## 9. Session State Machine

The debug endpoint (`GET /api/auth/debug`) computes orthogonal state dimensions:

### Session State (lifecycle)

| State | Condition |
|---|---|
| `active` | User active within idle timeout |
| `idle_warning` | `idleRemaining <= 180s` |
| `idle_expired` | `idleRemaining <= 0` (idle timeout reached) |
| `revoked` | Explicit `session.revoked = true` flag (admin kill) |

### Token State (access token)

| State | Condition |
|---|---|
| `valid` | Token has > 120s remaining |
| `expiring` | Token has <= 120s remaining |
| `expired` | Token past expiry |

### Verdict (combined)

| Verdict | Condition |
|---|---|
| `healthy` | Session active, token valid |
| `degraded` | Token expiring/expired (but recoverable via refresh), or idle warning |
| `reauth_required` | Token expired + no valid refresh, OR session idle_expired/revoked |

### Refresh Decision

```
                           idle_expired or revoked?
                          /                        \
                       YES                          NO
                        |                            |
                    blocked                    refreshValid?
                                              /            \
                                           NO               YES
                                            |                |
                                        disabled       refreshLocked?
                                                       /           \
                                                    YES             NO
                                                     |               |
                                                 disabled     shouldRefreshNow?
                                                              /              \
                                                           YES                NO
                                                            |                  |
                                                        immediate            auto
```

Key rule: **idle_expired blocks refresh** even if the refresh token is valid. This prevents stolen session cookies from silently keeping sessions alive.

---

## 10. Tenant Isolation

### Session-Level

Every Redis session key includes `tenantId`: `sess:{tenantId}:{sid}`. The `RedisSessionStore.load()` method compares the request's tenant ID with the session's `tenantId`. On mismatch:

1. Session is deleted.
2. `onCrossTenantAnomaly` callback fires (for audit/alerting).
3. Returns `null` (caller treats as unauthenticated).

### Request-Level

The debug endpoint resolves tenant from (in priority order):
1. `x-tenant-id` header (API gateway / reverse proxy)
2. Host-based subdomain extraction (future)
3. `DEFAULT_TENANT_ID` environment variable
4. Fallback: `"default"`

### Session Binding

Sessions store `ipHash` and `uaHash` at creation. The `/api/auth/session` endpoint performs soft binding:
- If **both** IP and UA differ from the session → `401 session_binding_mismatch` + session destroyed.
- If only one differs → allowed (users switch networks or update browsers).

---

## 11. Boot-Time Safety Checks

### Environment Guardrails (`assertEnvironmentGuardrails`)

Runs before DI setup. In production, rejects:
- Issuer URLs containing `localhost`, `127.0.0.1`, `-dev`, `.dev.`
- Missing `publicBaseUrl`

Exit code: `PROD_NONPROD_IDP: 7` or `PROD_MISSING_BASE_URL: 8`

### Realm Safety (`assertBootRealmSafety`)

Runs after adapter registration. For staging/production:
- Fetches `/.well-known/openid-configuration` for each configured realm.
- Compares discovered `issuer` with configured `issuerUrl`.
- Rejects wildcard entries in redirect URI allowlists.

Exit code: `ISSUER_REALM_MISMATCH: 6` or `PROD_WILDCARD_REDIRECT: 9`

---

## 12. Environment Profiles

| Setting | Local | Staging | Production |
|---|---|---|---|
| Access token TTL | 300s (5 min) | 600s (10 min) | 900s (15 min) |
| Session TTL | 3600s (1 hr) | 7200s (2 hr) | 28800s (8 hr) |
| Cookie `Secure` flag | No | Yes | Yes |
| Strict issuer check | No | Yes | Yes |
| Password grant allowed | Yes | No | No |
| Require HTTPS | No | Yes | Yes |
| PKCE state TTL | 300s | 300s | 300s |

Unknown environments fall back to the **production** profile (most secure).

---

## 13. Session Invalidation on IAM Changes

When IAM changes occur (role binding, group membership, OU assignment), the `SessionInvalidationService` destroys all Redis sessions for the affected user:

```
RoleBindingService.createBinding()   ──┐
GroupSyncService.addMember()          ──┤── onIAMChange(tenantId, userId, reason)
OUMembershipService.assignToOU()     ──┘         |
                                            destroyAllForUser()
                                                  |
                                           emitAuthAudit(SESSION_KILLED)
```

This ensures stale entitlements don't persist in cached sessions. The user must re-authenticate to receive updated roles/groups.

---

## 14. Audit Events

All auth events are emitted via `emitAuthAudit()` to the kernel audit writer:

| Event | Level | When |
|---|---|---|
| `auth.login_success` | info | Successful PKCE callback |
| `auth.login_failed` | warn | Failed token exchange |
| `auth.refresh_success` | info | Successful token refresh |
| `auth.refresh_failed` | warn | Refresh token rejected or Keycloak error |
| `auth.logout` | info | User or system-initiated logout |
| `auth.session_killed` | warn | IAM change forces session destruction |
| `auth.session_rotated` | info | Session ID rotated (login, refresh) |
| `auth.jwks_fetch_failed` | warn | JWKS endpoint unreachable |
| `auth.cross_tenant_rejection` | warn | Cross-tenant session access attempt |
| `auth.csrf_violation` | warn | CSRF double-submit mismatch |
| `auth.ip_binding_mismatch` | warn | Both IP and UA changed |
| `auth.issuer_mismatch` | warn | JWT issuer does not match config |
| `auth.mfa_challenge_success` | info | MFA verification passed |
| `auth.mfa_challenge_failed` | warn | MFA verification failed |

---

## 15. File Map

### Neon BFF — API Routes

| File | Purpose |
|---|---|
| [app/api/auth/login/route.ts](products/athyper-neon/apps/web/app/api/auth/login/route.ts) | PKCE login initiation (GET) |
| [app/api/auth/callback/route.ts](products/athyper-neon/apps/web/app/api/auth/callback/route.ts) | OAuth callback, session creation (GET) |
| [app/api/auth/session/route.ts](products/athyper-neon/apps/web/app/api/auth/session/route.ts) | Public session read (GET) + destroy (DELETE) |
| [app/api/auth/refresh/route.ts](products/athyper-neon/apps/web/app/api/auth/refresh/route.ts) | Token refresh with idle enforcement (POST) |
| [app/api/auth/touch/route.ts](products/athyper-neon/apps/web/app/api/auth/touch/route.ts) | Idle timer sync (POST) |
| [app/api/auth/logout/route.ts](products/athyper-neon/apps/web/app/api/auth/logout/route.ts) | Backchannel + front-channel logout (POST) |
| [app/api/auth/debug/route.ts](products/athyper-neon/apps/web/app/api/auth/debug/route.ts) | Debug console API — state machine, JWT introspection |

### Neon BFF — Client Hooks and Utilities

| File | Purpose |
|---|---|
| [lib/auth-refresh.ts](products/athyper-neon/apps/web/lib/auth-refresh.ts) | `useSessionRefresh` — proactive token refresh timer |
| [lib/idle-tracker.ts](products/athyper-neon/apps/web/lib/idle-tracker.ts) | `useIdleTracker` — idle warning + auto-logout |
| [lib/csrf.ts](products/athyper-neon/apps/web/lib/csrf.ts) | CSRF token generation and validation |
| [lib/session-bootstrap.ts](products/athyper-neon/apps/web/lib/session-bootstrap.ts) | SSR session bootstrap (Redis -> HTML inline) |
| [middleware.ts](products/athyper-neon/apps/web/middleware.ts) | CSRF enforcement + session cookie guard |
| [app/layout.tsx](products/athyper-neon/apps/web/app/layout.tsx) | Injects `__SESSION_BOOTSTRAP__` into HTML |

### Auth Server Library

| File | Purpose |
|---|---|
| [auth/server/keycloak.ts](products/athyper-neon/auth/server/keycloak.ts) | PKCE, token exchange, refresh, logout, JWT decode |
| [auth/server/session.ts](products/athyper-neon/auth/server/session.ts) | Cookie management (neon_sid, __csrf) |
| [auth/server/types.ts](products/athyper-neon/auth/server/types.ts) | Session and ServerSession interfaces |

### Framework — Security

| File | Purpose |
|---|---|
| [security/session-store.ts](framework/runtime/src/services/platform/foundation/security/session-store.ts) | `RedisSessionStore` — CRUD, tenant isolation, sid rotation |
| [security/realm-safety.ts](framework/runtime/src/services/platform/foundation/security/realm-safety.ts) | Redirect URI validation, issuer checks, boot assertions |
| [security/env-profiles.ts](framework/runtime/src/services/platform/foundation/security/env-profiles.ts) | Per-environment auth profiles (local/staging/production) |
| [security/auth-audit.ts](framework/runtime/src/services/platform/foundation/security/auth-audit.ts) | Auth audit event types and emitter |
| [security/auth-telemetry.ts](framework/runtime/src/services/platform/foundation/security/auth-telemetry.ts) | OTel span instrumentation for auth flows |

### Framework — IAM

| File | Purpose |
|---|---|
| [iam/tenant-iam-profile.ts](framework/runtime/src/services/platform/foundation/iam/tenant-iam-profile.ts) | Per-tenant MFA, password policy, brute-force settings |
| [iam/session-invalidation.ts](framework/runtime/src/services/platform/foundation/iam/session-invalidation.ts) | Destroy sessions on IAM changes |

### Framework — Bootstrap

| File | Purpose |
|---|---|
| [kernel/bootstrap.ts](framework/runtime/src/kernel/bootstrap.ts) | Boot sequence: env guardrails, realm safety, adapter registration |
| [kernel/config.schema.ts](framework/runtime/src/kernel/config.schema.ts) | IAM config schema (Zod), feature flags, realm config |
| [kernel/container.adapters.ts](framework/runtime/src/kernel/container.adapters.ts) | DI registration for auth adapter, per-realm verifiers |

---

## Related Documentation

- [Auth Operations Runbook](../runbooks/auth-operations.md) — incident response procedures
- [Environment Setup](../deployment/ENVIRONMENTS.md) — per-environment configuration
