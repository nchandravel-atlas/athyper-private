# Auth Architecture

> End-to-end authentication and session management for the Athyper platform.

---

## 1. Design Principles

| Principle | How |
|---|---|
| Tokens never reach browser | Cookie holds opaque `neon_sid`; JWTs stay in Redis |
| Fail closed | Redis down = 401 for all requests |
| Idle timeout is hard control | Idle-expired blocks refresh even if refresh token is valid |
| Defense in depth | CSRF double-submit, IP/UA binding, issuer validation |
| Tenant isolation | Every session key includes `tenantId`; cross-tenant = destroy + audit |
| Session ID rotation | New `sid` on every login callback and token refresh |

---

## 2. Architecture Overview

```
Browser                    Next.js BFF (API Routes)              Redis          Keycloak
  |                                   |                              |               |
  |--- GET /api/auth/login ---------> |--- store PKCE state ------> |               |
  |<--- 302 to Keycloak ------------- |                              |               |
  |                                   |                              |               |
  |--- GET /api/auth/callback ------> |--- exchange code+verifier --|-------------> |
  |                                   |<--- tokens ------------------|-------------- |
  |                                   |--- store session ----------> |               |
  |<--- Set-Cookie: neon_sid ---------|                              |               |
  |<--- Set-Cookie: __csrf ----------|                              |               |
  |                                   |                              |               |
  |--- GET /api/auth/session -------> |--- load session ----------> |               |
  |<--- { userId, roles, ... } ------|  (no tokens in response)     |               |
```

### Layers

1. **Neon BFF** (`products/neon/apps/web/app/api/auth/`) -- API routes for login, callback, session, refresh, touch, logout, debug
2. **Auth Server Library** (`products/neon/auth/server/`) -- PKCE, Keycloak token exchange, cookie management. Server-only.
3. **Framework Security** (`framework/runtime/.../security/`) -- RedisSessionStore, realm safety, env profiles, auth audit
4. **Framework IAM** (`framework/runtime/.../iam/`) -- Tenant IAM profiles, session invalidation
5. **Client Hooks** (`products/neon/apps/web/lib/`) -- `useSessionRefresh`, `useIdleTracker`, CSRF, session bootstrap

---

## 3. PKCE Authorization Code Flow

### Login (`GET /api/auth/login?workbench=admin&returnUrl=/dashboard`)

1. Generate PKCE: `codeVerifier` (32 bytes, base64url), `codeChallenge` (SHA-256), `state` (16 bytes, hex)
2. Store `{ codeVerifier, workbench, returnUrl }` in Redis as `pkce_state:{state}` (300s TTL)
3. Redirect to Keycloak with `prompt=login`

### Callback (`GET /api/auth/callback?code=...&state=...`)

1. Load + delete PKCE state from Redis (one-time use)
2. Exchange code for tokens via Keycloak
3. Compute `ipHash`/`uaHash` (SHA-256 of client IP and user-agent)
4. Generate `sid` (SHA-256 of UUID + timestamp) and CSRF token (UUID)
5. Store session in Redis: `sess:{tenantId}:{sid}` (8h TTL)
6. Add `sid` to user index: `user_sessions:{tenantId}:{userId}`
7. Set `neon_sid` (httpOnly) and `__csrf` (JS-readable) cookies
8. Redirect to `returnUrl`

---

## 4. Redis Session Model

### Keys

```
sess:{tenantId}:{sid}              → session object (TTL: 28800s / 8h)
user_sessions:{tenantId}:{userId}  → SET of active sids
pkce_state:{state}                 → PKCE verifier (TTL: 300s)
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
  ipHash: string;
  uaHash: string;
  csrfToken: string;
  createdAt: number;
  lastSeenAt: number;
  authzVersion?: number;
}
```

### Public Session (returned to browser)

```typescript
{ authenticated: true, userId, username, displayName, workbench, roles, persona, accessExpiresAt }
```

No tokens, no hashes, no internal fields exposed.

---

## 5. Cookie Strategy

| Cookie | httpOnly | secure | sameSite | Purpose |
|---|---|---|---|---|
| `neon_sid` | Yes | Yes (prod) | lax | Opaque session ID |
| `__csrf` | No | Yes (prod) | strict | CSRF double-submit token (client reads to send as header) |

Both: `path=/`, `maxAge=28800` (8h).

---

## 6. CSRF Protection

1. On session creation: random UUID stored in Redis + `__csrf` cookie
2. Client reads `__csrf` from cookie or `__SESSION_BOOTSTRAP__`
3. Mutating requests (`POST/PUT/PATCH/DELETE` to `/api/*`): client sends `x-csrf-token` header
4. Middleware compares header vs cookie; mismatch = `403 CSRF_VALIDATION_FAILED`

**Exempt**: `/api/auth/login`, `/api/auth/callback` (no session yet)

**Enforced in**: [middleware.ts](products/neon/apps/web/middleware.ts)

---

## 7. Token Refresh

### Server (`POST /api/auth/refresh`)

1. Load session by `neon_sid`
2. Idle check: `lastSeenAt + 900s < now` → destroy session, return `401 idle_expired`
3. If access token has >120s remaining → no-op
4. Call Keycloak `grant_type=refresh_token`
5. Rotate `sid` + generate new `csrfToken`
6. Write new session key, delete old; update user index
7. Set new cookies
8. On failure: destroy session, redirect to login

### Client (`useSessionRefresh` hook)

- Reads `accessExpiresAt` from `window.__SESSION_BOOTSTRAP__`
- Schedules `POST /api/auth/refresh` at `expiresAt - 90s` (min 5s delay)
- On success: update bootstrap, reschedule
- On failure: redirect to login

---

## 8. Idle Timeout (900s / 15 min)

### Server-Side

- **`POST /api/auth/touch`**: If `now - lastSeenAt >= 900` → `401 idle_expired`. Otherwise update `lastSeenAt`.
- **`POST /api/auth/refresh`**: If idle → destroy session, `401 idle_expired`

### Client (`useIdleTracker` hook)

1. Tracks activity: mousemove, keydown, touchstart, scroll, click
2. Computes `idleRemaining = max(0, 900 - secondsSinceLastActivity)`
3. At 180s remaining: shows warning with live countdown + "Stay signed in" button
4. Calls `POST /api/auth/touch` every 60s when active
5. At 0s: calls logout, redirects to end Keycloak SSO session

---

## 9. Session State Machine

Debug endpoint (`GET /api/auth/debug`) computes:

**Session State**: `active` | `idle_warning` (<=180s) | `idle_expired` (<=0) | `revoked`

**Token State**: `valid` (>120s) | `expiring` (<=120s) | `expired`

**Verdict**: `healthy` | `degraded` | `reauth_required`

**Key rule**: `idle_expired` blocks refresh even if refresh token is valid.

---

## 10. Tenant Isolation

- **Session keys** include `tenantId`: `sess:{tenantId}:{sid}`
- **Cross-tenant access**: session deleted, anomaly callback fires, returns 401
- **Tenant resolution** (priority): `x-tenant-id` header → host subdomain → `DEFAULT_TENANT_ID` → `"default"`
- **IP/UA soft binding**: both must differ to trigger session destruction; single change is allowed

---

## 11. Boot-Time Safety

### Environment Guardrails

In production, rejects: localhost/127.0.0.1 issuer URLs, missing `publicBaseUrl`. Exit codes: 7, 8.

### Realm Safety

In staging/production: fetches OIDC discovery, compares issuer URLs, rejects wildcard redirects. Exit codes: 6, 9.

---

## 12. Environment Profiles

| Setting | Local | Staging | Production |
|---|---|---|---|
| Access token TTL | 300s | 600s | 900s |
| Session TTL | 3600s | 7200s | 28800s |
| Cookie Secure | No | Yes | Yes |
| Password grant | Yes | No | No |
| HTTPS required | No | Yes | Yes |
| Strict issuer check | No | Yes | Yes |

Unknown environments default to **production** profile.

---

## 13. Session Invalidation on IAM Changes

When roles/groups/OU membership change, `SessionInvalidationService.onIAMChange()` destroys all Redis sessions for the user. User must re-authenticate to get updated entitlements.

---

## 14. Audit Events

### Framework Level (14 events via `emitAuthAudit()`)

| Event | Level |
|---|---|
| `auth.login_success` / `auth.login_failed` | info / warn |
| `auth.refresh_success` / `auth.refresh_failed` | info / warn |
| `auth.logout` | info |
| `auth.session_killed` | warn |
| `auth.session_rotated` | info |
| `auth.jwks_fetch_failed` | warn |
| `auth.cross_tenant_rejection` | warn |
| `auth.csrf_violation` | warn |
| `auth.ip_binding_mismatch` | warn |
| `auth.issuer_mismatch` | warn |
| `auth.mfa_challenge_success` / `auth.mfa_challenge_failed` | info / warn |

### BFF Level (`@neon/auth/audit`)

- Redis LIST: `audit:auth:{tenantId}` (10K cap, best-effort)
- 10 event types via `emitBffAudit()`, session IDs hashed via `hashSidForAudit()`

---

## 15. File Map

### BFF API Routes

| File | Purpose |
|---|---|
| [login/route.ts](products/neon/apps/web/app/api/auth/login/route.ts) | PKCE login initiation |
| [callback/route.ts](products/neon/apps/web/app/api/auth/callback/route.ts) | OAuth callback, session creation |
| [session/route.ts](products/neon/apps/web/app/api/auth/session/route.ts) | Public session read + destroy |
| [refresh/route.ts](products/neon/apps/web/app/api/auth/refresh/route.ts) | Token refresh with idle check |
| [touch/route.ts](products/neon/apps/web/app/api/auth/touch/route.ts) | Idle timer sync |
| [logout/route.ts](products/neon/apps/web/app/api/auth/logout/route.ts) | Logout (backchannel + front-channel) |
| [debug/route.ts](products/neon/apps/web/app/api/auth/debug/route.ts) | Debug: state machine, JWT introspection |

### Client Hooks

| File | Purpose |
|---|---|
| [lib/auth-refresh.ts](products/neon/apps/web/lib/auth-refresh.ts) | `useSessionRefresh` — proactive token refresh |
| [lib/idle-tracker.ts](products/neon/apps/web/lib/idle-tracker.ts) | `useIdleTracker` — idle warning + auto-logout |
| [lib/csrf.ts](products/neon/apps/web/lib/csrf.ts) | CSRF token utilities |
| [lib/session-bootstrap.ts](products/neon/apps/web/lib/session-bootstrap.ts) | SSR session bootstrap |
| [middleware.ts](products/neon/apps/web/middleware.ts) | CSRF + session cookie enforcement |

### Auth Server Library

| File | Purpose |
|---|---|
| [auth/server/keycloak.ts](products/neon/auth/server/keycloak.ts) | PKCE, token exchange, refresh, logout |
| [auth/server/session.ts](products/neon/auth/server/session.ts) | Cookie management (neon_sid, __csrf) |
| [auth/server/types.ts](products/neon/auth/server/types.ts) | Session interfaces |
| [auth/server/audit.ts](products/neon/auth/server/audit.ts) | BFF audit logging |
| [auth/server/index.ts](products/neon/auth/server/index.ts) | Barrel re-export |

### Framework Security

| File | Purpose |
|---|---|
| [session-store.ts](framework/runtime/src/services/platform/foundation/security/session-store.ts) | RedisSessionStore — CRUD, tenant isolation, rotation |
| [realm-safety.ts](framework/runtime/src/services/platform/foundation/security/realm-safety.ts) | Redirect URI + issuer validation |
| [env-profiles.ts](framework/runtime/src/services/platform/foundation/security/env-profiles.ts) | Per-environment auth profiles |
| [auth-audit.ts](framework/runtime/src/services/platform/foundation/security/auth-audit.ts) | Auth audit event emitter |
| [auth-telemetry.ts](framework/runtime/src/services/platform/foundation/security/auth-telemetry.ts) | OTel instrumentation for auth |

### Framework IAM

| File | Purpose |
|---|---|
| [tenant-iam-profile.ts](framework/runtime/src/services/platform/foundation/iam/tenant-iam-profile.ts) | Per-tenant MFA, password policy |
| [session-invalidation.ts](framework/runtime/src/services/platform/foundation/iam/session-invalidation.ts) | Destroy sessions on IAM changes |

---

## Related

- [Auth Operations Runbook](../runbooks/auth-operations.md)
- [Environment Setup](../deployment/ENVIRONMENTS.md)
