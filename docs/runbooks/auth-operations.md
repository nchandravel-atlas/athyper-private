# Auth Operations Runbook

> **Audience:** Platform operators, on-call SREs, security engineers.
> **Last updated:** 2025-02-04
> **Applicable stack:** athyper Runtime, Keycloak (IdP), Redis (session store), PostgreSQL (IAM tables).

---

## Table of Contents

1. [Kill All Sessions for a Specific User](#1-kill-all-sessions-for-a-specific-user)
2. [Kill All Sessions for a Tenant](#2-kill-all-sessions-for-a-tenant)
3. [JWKS Outage Handling](#3-jwks-outage-handling)
4. [Redis Outage Behavior](#4-redis-outage-behavior)
5. [Keycloak Client Secret Rotation](#5-keycloak-client-secret-rotation)
6. [Adding a New Realm](#6-adding-a-new-realm)
7. [Debugging Auth Failures](#7-debugging-auth-failures)
8. [CSRF Issues Troubleshooting](#8-csrf-issues-troubleshooting)
9. [Session Fixation Prevention Verification](#9-session-fixation-prevention-verification)

---

## 1. Kill All Sessions for a Specific User

**When:** Compromised account, immediate user lockout request, post-password-reset, IAM role/group change that requires re-auth.

### Via Application API (Preferred)

The `SessionInvalidationService.onIAMChange()` method destroys all Redis sessions for a user and emits an audit event (`auth.session_killed`).

```
POST /api/platform/iam/sessions/revoke
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "tenantId": "<tenant-uuid>",
  "userId": "<user-id>",
  "reason": "compromised_account"
}
```

### Via Redis CLI (Incident Response)

Use the `admin` Redis user from a bastion host. **Never** run these commands with the `app` user.

```bash
# 1. List all session IDs for the user
redis-cli -u redis://admin:<password>@<host>:6379 \
  SMEMBERS "user_sessions:<tenantId>:<userId>"

# 2. Delete each session key
redis-cli -u redis://admin:<password>@<host>:6379 \
  DEL "sess:<tenantId>:<sid1>" "sess:<tenantId>:<sid2>" ...

# 3. Delete the user session index
redis-cli -u redis://admin:<password>@<host>:6379 \
  DEL "user_sessions:<tenantId>:<userId>"
```

### Via Keycloak Admin Console

To also revoke IdP-level sessions (refresh tokens at Keycloak):

1. Open Keycloak Admin Console for the appropriate realm.
2. Navigate to **Users** and search for the user.
3. Go to the **Sessions** tab.
4. Click **Logout all sessions**.

This does NOT invalidate athyper Redis sessions -- you must do both.

### Verification

- Confirm `SMEMBERS "user_sessions:<tenantId>:<userId>"` returns an empty set.
- Confirm the user receives `401 Unauthorized` on next API call.
- Check audit logs for `auth.session_killed` events:

```sql
SELECT * FROM core.audit_log
WHERE tenant_id = '<tenant-uuid>'
  AND action = 'auth.session_killed'
  AND payload->>'userId' = '<user-id>'
ORDER BY occurred_at DESC
LIMIT 10;
```

---

## 2. Kill All Sessions for a Tenant

**When:** Tenant-wide security breach, subscription suspension, compliance hold.

### Via Redis CLI

```bash
# 1. Find all session keys for the tenant
redis-cli -u redis://admin:<password>@<host>:6379 \
  --scan --pattern "sess:<tenantId>:*"

# 2. Delete all session keys (pipe to DEL)
redis-cli -u redis://admin:<password>@<host>:6379 \
  --scan --pattern "sess:<tenantId>:*" | \
  xargs -L 100 redis-cli -u redis://admin:<password>@<host>:6379 DEL

# 3. Delete all user session indexes for the tenant
redis-cli -u redis://admin:<password>@<host>:6379 \
  --scan --pattern "user_sessions:<tenantId>:*" | \
  xargs -L 100 redis-cli -u redis://admin:<password>@<host>:6379 DEL
```

### Via Database (Suspend Tenant)

Setting the tenant status to `suspended` prevents new logins at the application layer. Existing sessions must still be purged from Redis (above).

```sql
UPDATE core.tenant
SET status = 'suspended', updated_at = NOW(), updated_by = 'ops:<your-name>'
WHERE id = '<tenant-uuid>';
```

### Verification

- `--scan --pattern "sess:<tenantId>:*"` returns zero keys.
- All users in that tenant receive `401` or `403` on next request.
- Audit log contains one `auth.session_killed` entry per destroyed session.

---

## 3. JWKS Outage Handling

**Behavior:** The runtime caches JWKS key sets in Redis under `jwks:<realmKey>`. If Keycloak is unreachable, the cached JWKS is used until its TTL expires.

### Failure Modes

| Scenario | Behavior | User Impact |
|---|---|---|
| Keycloak down, JWKS cache warm | Cached keys used for validation | None (transparent) |
| Keycloak down, JWKS cache expired | JWT validation fails | All new requests receive `401` |
| Keycloak up, key rotation | New keys fetched automatically | None (transparent) |
| Keycloak up, JWKS endpoint 5xx | Retry with exponential backoff; falls back to cache | None if cache warm |

### Detecting JWKS Issues

Look for `auth.jwks_fetch_failed` audit events and `auth.jwks.fetch` spans with `status: error`:

```sql
SELECT * FROM core.audit_log
WHERE action = 'auth.jwks_fetch_failed'
ORDER BY occurred_at DESC
LIMIT 20;
```

Check telemetry spans:

```
span.name = "auth.jwks.fetch" AND span.status = "error"
```

Health endpoint:

```
GET /healthz
# Look for "jwks" in the components section
```

### Manual Intervention: Extend JWKS Cache TTL

If Keycloak is expected to be down for an extended period and the cache is still warm:

```bash
# Check current TTL
redis-cli -u redis://admin:<password>@<host>:6379 \
  TTL "jwks:<realmKey>"

# Extend TTL to 4 hours (14400 seconds)
redis-cli -u redis://admin:<password>@<host>:6379 \
  EXPIRE "jwks:<realmKey>" 14400
```

### Manual Intervention: Inject JWKS Manually

As a last resort, you can fetch the JWKS from a backup or another Keycloak node and inject it:

```bash
# Fetch JWKS from Keycloak (if partially available)
curl -s https://<keycloak-host>/realms/<realm>/protocol/openid-connect/certs > /tmp/jwks.json

# Inject into Redis
redis-cli -u redis://admin:<password>@<host>:6379 \
  SET "jwks:<realmKey>" "$(cat /tmp/jwks.json)" EX 14400
```

### Recovery

Once Keycloak is back:

1. The runtime will automatically fetch fresh JWKS on the next cache miss.
2. Verify with: `redis-cli GET "jwks:<realmKey>"` -- should contain fresh keys.
3. Confirm `auth.jwks.fetch` spans show `status: ok`.

---

## 4. Redis Outage Behavior

**Design principle:** Auth fails closed. If Redis is unavailable, the runtime cannot validate sessions or issue new ones.

### Impact Matrix

| Operation | Redis Down Behavior | HTTP Response |
|---|---|---|
| New login (BFF session creation) | Cannot store session | `503 Service Unavailable` |
| Existing session validation | Cannot load session | `401 Unauthorized` |
| Token refresh | Cannot update session | `401 Unauthorized` |
| Logout | Cannot delete session | `200` (best-effort; Keycloak logout still proceeds) |
| JWKS fetch (cache miss) | Falls back to direct Keycloak fetch | Transparent (but slower) |
| PKCE state storage | Cannot store verifier | `503 Service Unavailable` |

### Why Fail Closed?

Failing open (allowing requests without session validation) would:

1. Bypass tenant isolation enforcement (sessions carry `tenantId`).
2. Allow use of revoked sessions.
3. Skip CSRF double-submit validation.
4. Eliminate session fixation protections (sid rotation depends on Redis).

The security cost of failing open far exceeds the availability cost of brief `401` responses.

### Detection

- **Health endpoint:** `GET /healthz` reports Redis status.
- **Metrics:** `redis_connection_errors_total` counter (if Prometheus metrics enabled).
- **Spans:** `auth.session.redis_load` and `auth.session.redis_save` with `status: error`.
- **Logs:** `[error] Redis connection refused` in runtime stderr.

### Mitigation

1. **Verify Redis is actually down** (not just a network partition to the app):
   ```bash
   redis-cli -u redis://admin:<password>@<host>:6379 PING
   ```
2. **Check Redis memory** -- if maxmemory is hit with `allkeys-lfu`, sessions may be evicted:
   ```bash
   redis-cli -u redis://admin:<password>@<host>:6379 INFO memory
   ```
3. **Restart Redis** if the process has crashed.
4. **Check Docker/K8s** health checks and restart policies.
5. **Scale Redis** if memory pressure is the root cause.

### Recovery

Once Redis recovers:

- All existing users must re-authenticate (their sessions were lost).
- The runtime reconnects automatically (Redis client has reconnect logic).
- Monitor `auth.login_success` events to confirm users can log in again.

---

## 5. Keycloak Client Secret Rotation

**When:** Scheduled rotation (every 90 days minimum), after suspected credential compromise, when onboarding/offboarding IdP administrators.

### Prerequisites

- Access to Keycloak Admin Console for the target realm.
- Access to the secrets manager (Vault, AWS Secrets Manager, etc.).
- Ability to restart athyper runtime pods or trigger a config reload.

### Procedure

#### Step 1: Generate New Secret in Keycloak

1. Open Keycloak Admin Console.
2. Navigate to **Clients** and select the athyper client (e.g., `athyper-api`).
3. Go to the **Credentials** tab.
4. Click **Regenerate Secret**.
5. Copy the new secret value immediately (it cannot be retrieved again).

#### Step 2: Update Secrets Manager

```bash
# Example: AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id "athyper/iam/<realmKey>/client-secret" \
  --secret-string "<new-secret-value>"

# Example: HashiCorp Vault
vault kv put secret/athyper/iam/<realmKey> \
  client_secret="<new-secret-value>"
```

#### Step 3: Update Runtime Configuration

The runtime reads the client secret via the `clientSecretRef` indirection in `kernel.config.parameter.json`. The ref points to an environment variable:

```json
{
  "iam": {
    "realms": {
      "athyper": {
        "iam": {
          "clientSecretRef": "IAM_ATHYPER_CLIENT_SECRET"
        }
      }
    }
  }
}
```

Update the environment variable source (`.env`, Kubernetes Secret, ECS task definition, etc.):

```bash
# Kubernetes example
kubectl create secret generic athyper-iam-secrets \
  --from-literal=IAM_ATHYPER_CLIENT_SECRET="<new-secret-value>" \
  --dry-run=client -o yaml | kubectl apply -f -
```

#### Step 4: Rolling Restart

```bash
# Kubernetes
kubectl rollout restart deployment/athyper-runtime

# Docker Compose
docker compose --profile mesh restart athyper
```

#### Step 5: Verification

1. Confirm the runtime starts without auth errors in logs.
2. Test a login flow end-to-end (PKCE or direct grant depending on environment).
3. Check that `auth.keycloak.token_exchange` spans show `status: ok`.
4. Verify existing sessions still work (they use stored tokens, not the client secret).

#### Rollback

If the new secret causes failures:

1. Revert the secret in the secrets manager to the previous value.
2. Rolling restart the runtime again.
3. Keycloak retains the OLD secret for a brief grace period if you haven't saved/confirmed -- check Keycloak docs for your version.

---

## 6. Adding a New Realm

**When:** Onboarding a new customer segment, B2B partner federation, isolated compliance domain.

### Step 1: Create Realm in Keycloak

1. Open Keycloak Admin Console.
2. Click **Create Realm**.
3. Configure:
   - **Realm name:** e.g., `partner-acme`
   - **Display name:** e.g., `ACME Corp Partner Portal`
   - **Enabled:** Yes
4. Under **Realm Settings > Tokens**, configure:
   - Access token lifespan: 300 seconds (5 minutes)
   - Refresh token lifespan: 28800 seconds (8 hours)
   - Enable refresh token rotation

### Step 2: Create Client in Keycloak

1. Navigate to **Clients > Create client**.
2. Configure:
   - **Client ID:** `athyper-api` (or per-realm naming convention)
   - **Client authentication:** On (confidential)
   - **Authentication flow:** Standard flow + Direct access grants (dev only)
   - **Valid redirect URIs:** Only production URIs (no wildcards)
   - **Web origins:** Match redirect URI origins
3. Go to **Credentials** tab and copy the client secret.

### Step 3: Store Client Secret

```bash
# Add to secrets manager
vault kv put secret/athyper/iam/partner-acme \
  client_secret="<secret-from-keycloak>"
```

### Step 4: Update Runtime Configuration

Add the new realm to `kernel.config.parameter.json` (or the environment-specific variant):

```json
{
  "iam": {
    "realms": {
      "athyper": { "..." : "existing" },
      "partner-acme": {
        "iam": {
          "issuerUrl": "https://iam.mesh.athyper.local/realms/partner-acme",
          "clientId": "athyper-api",
          "clientSecretRef": "IAM_PARTNER_ACME_CLIENT_SECRET"
        },
        "defaults": {
          "features": { "metaStudio": false }
        },
        "redirectUriAllowlist": [
          "https://partner.acme.com/callback"
        ],
        "featureFlags": {
          "bffSessions": true,
          "refreshRotation": true,
          "csrfProtection": true,
          "strictIssuerCheck": true,
          "pkceFlow": true
        },
        "platformMinimums": {
          "passwordMinLength": 12,
          "passwordHistory": 5,
          "maxLoginFailures": 5,
          "lockoutDurationMinutes": 15
        },
        "tenants": {
          "acme-main": {
            "defaults": {
              "country": "US",
              "currency": "USD",
              "timezone": "America/New_York"
            },
            "orgs": {}
          }
        }
      }
    }
  }
}
```

### Step 5: Database Setup

Create tenant and tenant profile records:

```sql
INSERT INTO core.tenant (code, name, status, subscription, created_by)
VALUES ('acme-main', 'ACME Corporation', 'active', 'professional', 'ops:onboarding');

INSERT INTO core.tenant_profile (tenant_id, country, currency, locale, timezone, created_by, iam_profile)
VALUES (
  (SELECT id FROM core.tenant WHERE code = 'acme-main'),
  'US', 'USD', 'en-US', 'America/New_York', 'ops:onboarding',
  '{
    "mfaRequired": true,
    "allowedMfaTypes": ["totp", "webauthn"],
    "maxLoginFailures": 5,
    "lockoutDurationMinutes": 15,
    "passwordPolicy": {
      "minLength": 12,
      "history": 5,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireDigit": true,
      "requireSpecial": true
    }
  }'::jsonb
);
```

### Step 6: Deploy and Verify

1. Rolling restart the runtime.
2. Verify the new realm appears in `GET /healthz` realm status.
3. Test a full login flow against the new realm.
4. Verify tenant context resolution with `x-realm: partner-acme` header.

---

## 7. Debugging Auth Failures

### Where to Look

#### 1. OpenTelemetry Spans

All auth operations emit named spans (defined in `auth-telemetry.ts`):

| Span Name | What It Covers |
|---|---|
| `auth.login.flow` | Full login sequence |
| `auth.keycloak.token_exchange` | Keycloak token endpoint call |
| `auth.jwks.fetch` | JWKS key retrieval |
| `auth.jwt.verify` | JWT signature and claims validation |
| `auth.session.redis_load` | Session lookup from Redis |
| `auth.session.redis_save` | Session write to Redis |
| `auth.refresh.flow` | Token refresh sequence |
| `auth.mfa.verify` | MFA challenge verification |
| `auth.logout.flow` | Logout and session cleanup |

Query in your tracing backend (Jaeger, Tempo, etc.):

```
service.name = "athyper-runtime" AND span.name starts_with "auth."
```

Filter for errors:

```
span.status = "error" AND span.name starts_with "auth."
```

#### 2. Audit Logs (PostgreSQL)

All auth events are written to `core.audit_log` via `auth-audit.ts`:

```sql
-- Recent auth failures
SELECT occurred_at, action, payload
FROM core.audit_log
WHERE action IN (
  'auth.login_failed',
  'auth.refresh_failed',
  'auth.cross_tenant_rejection',
  'auth.csrf_violation',
  'auth.ip_binding_mismatch',
  'auth.issuer_mismatch',
  'auth.jwks_fetch_failed',
  'auth.mfa_challenge_failed'
)
ORDER BY occurred_at DESC
LIMIT 50;
```

```sql
-- Auth events for a specific user
SELECT occurred_at, action, payload
FROM core.audit_log
WHERE payload->>'userId' = '<user-id>'
  AND action LIKE 'auth.%'
ORDER BY occurred_at DESC
LIMIT 50;
```

#### 3. MFA Audit Log

For MFA-specific failures, check the dedicated MFA audit table:

```sql
SELECT * FROM core.mfa_audit_log
WHERE principal_id = '<principal-uuid>'
ORDER BY created_at DESC
LIMIT 20;
```

#### 4. Health Endpoint

```
GET /healthz
```

Returns component-level status including:
- Redis connectivity
- Keycloak/JWKS reachability
- Database connectivity

#### 5. Runtime Logs (stderr)

For low-level connection errors that may not make it to structured telemetry:

```bash
# Docker Compose
docker compose logs athyper --tail 200 | grep -i "auth\|jwt\|session\|keycloak\|jwks"

# Kubernetes
kubectl logs deployment/athyper-runtime --tail 200 | grep -i "auth\|jwt\|session\|keycloak\|jwks"
```

### Common Failure Scenarios

| Symptom | Likely Cause | Check |
|---|---|---|
| `401` on all requests | JWKS cache expired + Keycloak down | Span `auth.jwks.fetch`, health endpoint |
| `401` for one user | Session expired or revoked | `SMEMBERS user_sessions:<t>:<u>` |
| `403` after role change | Stale entitlement snapshot | `entitlement_snapshot.expires_at` |
| `401` after deploy | Client secret mismatch | Span `auth.keycloak.token_exchange` |
| `403 CSRF` | Missing or mismatched CSRF token | See [CSRF section](#8-csrf-issues-troubleshooting) |
| Intermittent `401` | Redis eviction under memory pressure | `redis-cli INFO memory` |
| `401` + `issuer_mismatch` audit | JWT `iss` does not match realm config | Compare JWT `iss` with `issuerUrl` |

---

## 8. CSRF Issues Troubleshooting

The athyper BFF uses a double-submit cookie pattern for CSRF protection (when `csrfProtection` feature flag is enabled).

### How It Works

1. On session creation, a random `csrfToken` is generated and stored in the Redis session.
2. The BFF sets a `__Host-csrf` cookie (or `csrf` in non-HTTPS dev) with the token value.
3. On state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`), the client must send the token in the `x-csrf-token` header.
4. The server compares the header value against the session-stored value. Mismatch results in `403` and an `auth.csrf_violation` audit event.

### Common CSRF Failures

#### "Missing x-csrf-token header"

- **Cause:** The frontend is not sending the CSRF header on mutating requests.
- **Fix:** Ensure the API client reads the `csrf` cookie and sends it as `x-csrf-token`:
  ```typescript
  // Example: axios interceptor
  axios.interceptors.request.use((config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      const csrfCookie = document.cookie
        .split('; ')
        .find(c => c.startsWith('__Host-csrf=') || c.startsWith('csrf='));
      if (csrfCookie) {
        config.headers['x-csrf-token'] = csrfCookie.split('=')[1];
      }
    }
    return config;
  });
  ```

#### "CSRF token mismatch"

- **Cause:** The token in the header does not match the session-stored token.
- **Possible reasons:**
  - Session was rotated (sid rotation generates a new CSRF token but cookie was not updated).
  - User has multiple tabs with stale cookies.
  - Proxy/CDN stripping or rewriting cookies.
- **Debug:**
  1. Check `auth.csrf_violation` audit events for the user.
  2. Compare the cookie value in the browser with the session-stored value:
     ```bash
     redis-cli -u redis://admin:<password>@<host>:6379 \
       GET "sess:<tenantId>:<sid>" | python3 -m json.tool | grep csrfToken
     ```
  3. Check whether a reverse proxy is stripping `__Host-` prefixed cookies (some proxies do this).

#### CSRF Not Enforced When Expected

- Verify the `csrfProtection` feature flag is `true` for the realm in `kernel.config.parameter.json`.
- Check the runtime logs for `[warn] CSRF protection disabled` messages.

---

## 9. Session Fixation Prevention Verification

Session fixation is prevented by rotating the session ID (`sid`) after authentication. The `RedisSessionStore.rotateSid()` method handles this.

### How It Works

1. **Pre-auth:** An anonymous or unauthenticated session may exist (e.g., PKCE state stored against a temporary sid).
2. **Post-auth:** After successful token exchange, the runtime calls `rotateSid()`:
   - A new random `sid` is generated (32 bytes, hex-encoded).
   - The session data is written to a new Redis key.
   - The old Redis key is deleted.
   - The `user_sessions` index is updated (old sid removed, new sid added).
   - The session cookie is updated with the new sid value.
3. **Effect:** An attacker who obtained the pre-auth sid cannot use it -- it no longer exists in Redis.

### Verification Steps

#### 1. Confirm Rotation Happens

Perform a login and observe the session cookie before and after authentication:

```bash
# Step 1: Start auth flow -- note the initial sid cookie value
curl -v https://<host>/api/auth/login 2>&1 | grep "Set-Cookie"
# Output: Set-Cookie: sid=<old-sid-value>; ...

# Step 2: Complete auth flow -- note the new sid cookie value
# (Follow the redirect from Keycloak callback)
curl -v https://<host>/api/auth/callback?code=<code>&state=<state> 2>&1 | grep "Set-Cookie"
# Output: Set-Cookie: sid=<new-sid-value>; ...

# old-sid-value and new-sid-value MUST be different
```

#### 2. Confirm Old SID Is Destroyed

```bash
# The old sid key should not exist
redis-cli -u redis://admin:<password>@<host>:6379 \
  EXISTS "sess:<tenantId>:<old-sid-value>"
# Expected: (integer) 0

# The new sid key should exist
redis-cli -u redis://admin:<password>@<host>:6379 \
  EXISTS "sess:<tenantId>:<new-sid-value>"
# Expected: (integer) 1
```

#### 3. Confirm User Session Index Is Updated

```bash
redis-cli -u redis://admin:<password>@<host>:6379 \
  SMEMBERS "user_sessions:<tenantId>:<userId>"
# Expected: Should contain <new-sid-value> but NOT <old-sid-value>
```

#### 4. Confirm Audit Trail

```sql
SELECT * FROM core.audit_log
WHERE action = 'auth.session_rotated'
  AND payload->>'userId' = '<user-id>'
ORDER BY occurred_at DESC
LIMIT 5;
```

### What to Check If Rotation Is NOT Happening

1. **Feature flag:** Ensure `bffSessions` is `true` in the realm config. Session rotation only applies to BFF (Redis-backed) sessions, not stateless JWT-only flows.
2. **Code path:** Verify the login callback handler calls `sessionStore.rotateSid()` after token exchange. Check `auth.session_rotated` audit events -- if absent, rotation is not being triggered.
3. **Redis connectivity:** If Redis is having issues, rotation may silently fail. Check `auth.session.redis_save` spans for errors.
4. **Cookie attributes:** Ensure the session cookie has `Secure`, `HttpOnly`, `SameSite=Lax` (or `Strict`) attributes. Without `Secure` in production, the cookie may leak over HTTP.

### Periodic Validation

Add this to your security review checklist:

- [ ] Login flow produces a different `sid` cookie value before and after authentication.
- [ ] The pre-auth `sid` key does not exist in Redis after login completes.
- [ ] `auth.session_rotated` audit events are being generated for every login.
- [ ] Session cookies have `Secure; HttpOnly; SameSite=Lax` attributes in production.
- [ ] Session cookies use `__Host-` prefix in production (binds to origin, prevents subdomain attacks).
