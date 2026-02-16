# IAM Client Implementation Guide

## Option A: Hybrid BFF Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (User)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼ PKCE Flow (user session)
┌─────────────────────────────────────────────────────────────┐
│  neon-web (Public Client)                                    │
│  - User authentication                                       │
│  - PKCE + Authorization Code                                 │
│  - Access Token → includes audience: runtime-api             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─────────────────────────────────────────────┐
                 │                                             │
                 ▼ User Token                                  ▼ Service Account
┌────────────────────────────────┐      ┌─────────────────────────────────┐
│  runtime-api (Bearer-only)     │      │  svc-neon-server (Confidential) │
│  - Validates user tokens       │      │  - BFF system calls              │
│  - Runtime HTTP endpoints      │      │  - Client Credentials flow       │
└────────────────────────────────┘      └─────────────────────────────────┘
                                                       │
                                                       ▼ Service Token
                                        ┌─────────────────────────────────┐
                                        │  svc-runtime-worker             │
                                        │  - Background jobs               │
                                        │  - Schedulers, timers            │
                                        │  - Event handlers                │
                                        └─────────────────────────────────┘
```

## Implementation Steps

### Step 1: Clean Up Existing neon-web Client

#### Issues to Fix:
```json
{
  "redirectUris": [
    "",  // ❌ Remove empty string
    "http://localhost:3000/*",
    "https://neon.athyper.local/*",
    "http://localhost:3001/*"
  ]
}
```

#### Fixed Configuration:
```json
{
  "clientId": "neon-web",
  "enabled": true,
  "publicClient": true,
  "redirectUris": [
    "http://localhost:3000/*",
    "http://localhost:3001/*",
    "https://neon.athyper.local/*"
  ],
  "webOrigins": [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://neon.athyper.local"
  ],
  "attributes": {
    "pkce.code.challenge.method": "S256"
  }
}
```

**Production Configuration** (different realm or env-specific):
```json
{
  "redirectUris": [
    "https://neon.athyper.com/*"
  ],
  "webOrigins": [
    "https://neon.athyper.com"
  ]
}
```

### Step 2: Add New Clients

#### A) runtime-api (Bearer-only Resource Server)

**Purpose**: API endpoints that validate tokens

**Configuration**:
```yaml
Type: Bearer-only
Service Accounts: OFF
Direct Access Grants: OFF
Standard Flow: OFF
```

**Keycloak Admin Console Steps**:
1. Clients → Create Client
2. Client ID: `runtime-api`
3. Name: "Athyper Runtime API"
4. Client authentication: **OFF** (bearer-only has no secret)
5. Save
6. Settings tab:
   - Valid redirect URIs: (empty)
   - Valid post logout redirect URIs: (empty)
   - Web origins: (empty)
7. Advanced → **Bearer only**: ON

#### B) svc-neon-server (Confidential Service Account)

**Purpose**: BFF server-side system calls (not tied to user)

**Configuration**:
```yaml
Type: Confidential
Service Accounts: ON
Direct Access Grants: OFF
Standard Flow: OFF
Client Credentials Flow: ON (via service accounts)
```

**Keycloak Admin Console Steps**:
1. Clients → Create Client
2. Client ID: `svc-neon-server`
3. Name: "Neon Server Service Account"
4. Client authentication: **ON**
5. Service accounts roles: **ON**
6. Save
7. **Credentials tab** → Copy client secret to vault
8. **Service Account Roles tab** → Assign minimal roles:
   - `runtime-api` → (assign specific API roles)
   - Example: `runtime:invoke`, `document:create`

**Environment Variables**:
```bash
# Add to .env or vault
SVC_NEON_SERVER_CLIENT_ID=svc-neon-server
SVC_NEON_SERVER_CLIENT_SECRET=<from-keycloak-credentials-tab>
```

#### C) svc-runtime-worker (Confidential Service Account)

**Purpose**: Background jobs, schedulers, async workers

**Configuration**: Same as svc-neon-server

**Keycloak Admin Console Steps**:
1. Clients → Create Client
2. Client ID: `svc-runtime-worker`
3. Name: "Runtime Background Workers"
4. Client authentication: **ON**
5. Service accounts roles: **ON**
6. Save
7. **Credentials tab** → Copy secret
8. **Service Account Roles tab** → Assign:
   - `workflow:timer:run`
   - `event:process`
   - `audit:write`
   - `outbox:process`

**Environment Variables**:
```bash
SVC_RUNTIME_WORKER_CLIENT_ID=svc-runtime-worker
SVC_RUNTIME_WORKER_CLIENT_SECRET=<from-keycloak>
```

### Step 3: Add Audience Mapper to neon-web

**Why**: Tokens from neon-web need to include `runtime-api` in audience claim

**Steps**:
1. Clients → neon-web → **Client scopes** tab
2. Click neon-web-dedicated (or create new dedicated scope)
3. **Add mapper** → **By configuration**
4. Choose: **Audience**
5. Configure:
   - Name: `runtime-api audience`
   - Included Client Audience: `runtime-api`
   - Add to ID token: **OFF**
   - Add to access token: **ON**
6. Save

**Result**: Access tokens from neon-web will include:
```json
{
  "aud": ["neon-web", "runtime-api"],
  "azp": "neon-web"
}
```

### Step 4: Role Configuration

#### Define Client Roles for runtime-api

1. Clients → runtime-api → **Roles** tab
2. Create roles:
   - `runtime:invoke` - Basic API access
   - `document:read` - Read documents
   - `document:write` - Create/update documents
   - `workflow:execute` - Execute workflows
   - `workflow:timer:run` - Run workflow timers
   - `audit:write` - Write audit logs
   - `event:publish` - Publish events
   - `outbox:process` - Process outbox

#### Assign Roles to Service Accounts

**svc-neon-server** (BFF system calls):
```
runtime-api roles:
  ✓ runtime:invoke
  ✓ document:read
  ✓ document:write
  ✓ workflow:execute
```

**svc-runtime-worker** (Background jobs):
```
runtime-api roles:
  ✓ workflow:timer:run
  ✓ event:publish
  ✓ audit:write
  ✓ outbox:process
```

### Step 5: Code Integration

#### A) BFF User Requests (use neon-web token)

```typescript
// products/neon/apps/web/app/api/documents/route.ts
import { getServerSession } from 'next-auth';

export async function GET(req: Request) {
  const session = await getServerSession();

  // Use the user's access token from neon-web
  const response = await fetch('http://runtime:8080/api/documents', {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}
```

#### B) BFF System Calls (use svc-neon-server token)

```typescript
// products/neon/apps/web/lib/service-account-client.ts
import { ClientCredentials } from 'simple-oauth2';

const serviceAccountClient = new ClientCredentials({
  client: {
    id: process.env.SVC_NEON_SERVER_CLIENT_ID!,
    secret: process.env.SVC_NEON_SERVER_CLIENT_SECRET!,
  },
  auth: {
    tokenHost: process.env.KEYCLOAK_ISSUER!,
    tokenPath: '/realms/athyper/protocol/openid-connect/token',
  },
});

export async function getServiceAccountToken() {
  const result = await serviceAccountClient.getToken({
    scope: 'openid profile'
  });
  return result.token.access_token;
}

// Usage in system operation:
export async function syncDocumentsToS3() {
  const token = await getServiceAccountToken();

  await fetch('http://runtime:8080/api/internal/sync', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Service-Account': 'svc-neon-server'
    }
  });
}
```

#### C) Background Worker (use svc-runtime-worker token)

```typescript
// framework/runtime/src/workers/workflow-timer.ts
export class WorkflowTimerWorker {
  private token: string | null = null;

  async getToken() {
    if (!this.token) {
      const response = await fetch(
        `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.SVC_RUNTIME_WORKER_CLIENT_ID!,
            client_secret: process.env.SVC_RUNTIME_WORKER_CLIENT_SECRET!,
          }),
        }
      );
      const data = await response.json();
      this.token = data.access_token;
    }
    return this.token;
  }

  async processTimers() {
    const token = await this.getToken();

    // Call Runtime API with service account token
    await fetch('http://runtime:8080/api/workflows/timers/process', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Service-Account': 'svc-runtime-worker'
      }
    });
  }
}
```

#### D) Runtime API Token Validation

```typescript
// framework/runtime/src/middleware/auth.ts
export async function validateToken(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  // Validate with Keycloak
  const jwks = await fetchJWKS();
  const decoded = await jose.jwtVerify(token, jwks);

  // Check audience includes runtime-api
  const aud = Array.isArray(decoded.payload.aud)
    ? decoded.payload.aud
    : [decoded.payload.aud];

  if (!aud.includes('runtime-api')) {
    throw new Error('Token does not include runtime-api audience');
  }

  // Check azp (authorized party)
  const azp = decoded.payload.azp;
  const allowedClients = ['neon-web', 'svc-neon-server', 'svc-runtime-worker'];

  if (!allowedClients.includes(azp)) {
    throw new Error(`Unauthorized client: ${azp}`);
  }

  // Extract roles
  const roles = decoded.payload.resource_access?.['runtime-api']?.roles || [];

  return {
    azp,
    sub: decoded.payload.sub,
    roles,
    isServiceAccount: azp.startsWith('svc-')
  };
}
```

## Checklist Summary

### neon-web (Public Client)
- [x] PKCE enabled
- [ ] Remove empty redirect URI (`""`)
- [ ] Keep only prod origins in prod realm
- [ ] Add audience mapper for runtime-api
- [ ] Consent required: true
- [ ] Direct access grants: false

### runtime-api (Bearer-only)
- [ ] Create client
- [ ] Bearer-only: true
- [ ] No redirect URIs
- [ ] Define client roles
- [ ] Configure strict validation

### svc-neon-server (Service Account)
- [ ] Create client
- [ ] Client authentication: ON
- [ ] Service accounts: ON
- [ ] Direct access grants: OFF
- [ ] Store secret in vault
- [ ] Assign minimal roles

### svc-runtime-worker (Service Account)
- [ ] Create client
- [ ] Client authentication: ON
- [ ] Service accounts: ON
- [ ] Direct access grants: OFF
- [ ] Store secret in vault
- [ ] Assign worker-specific roles

## Security Best Practices

### 1. Secret Management
```bash
# Use vault for secrets (not .env files in production)
# Rotate quarterly
# Audit access logs
```

### 2. Token Validation
```typescript
// Always validate:
// 1. Signature (JWKS)
// 2. Issuer (iss claim)
// 3. Audience (aud claim includes runtime-api)
// 4. Expiration (exp claim)
// 5. Not before (nbf claim)
// 6. Authorized party (azp claim)
```

### 3. Least Privilege
- Only assign roles that are absolutely needed
- Separate service accounts per concern
- Monitor service account token usage

### 4. Audit Logging
```typescript
// Log all service account calls
logger.audit({
  action: 'api_call',
  azp: decodedToken.azp,
  sub: decodedToken.sub,
  endpoint: req.url,
  roles: decodedToken.resource_access['runtime-api'].roles
});
```

## Testing

### Test User Token Flow
```bash
# 1. Login as user via neon-web
# 2. Get access token
# 3. Call Runtime API
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:8080/api/documents

# Should work if token includes runtime-api audience
```

### Test Service Account Flow
```bash
# Get service account token
TOKEN=$(curl -X POST \
  http://localhost/auth/realms/athyper/protocol/openid-connect/token \
  -d "grant_type=client_credentials" \
  -d "client_id=svc-neon-server" \
  -d "client_secret=$SECRET" \
  | jq -r .access_token)

# Call API
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/internal/sync

# Should work if service account has correct roles
```

---

**Last Updated**: 2026-02-16
**Status**: Implementation Ready
**Next**: Create clients in Keycloak Admin Console
