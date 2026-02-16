# Athyper IAM Setup Guide

**Last Updated**: 2026-02-16
**Status**: Implementation Ready
**Estimated Time**: 2-4 hours

## Table of Contents

1. [Overview](#overview)
2. [Naming Conventions](#naming-conventions)
3. [Client Architecture](#client-architecture)
4. [Implementation Steps](#implementation-steps)
5. [Code Integration](#code-integration)
6. [Testing](#testing)
7. [Rollback Plan](#rollback-plan)

---

## Overview

This guide consolidates all IAM setup for the Athyper platform, migrating from ad-hoc naming to standardized `<product>-<type>-<name>` pattern with proper client architecture.

### Goals

- ✅ Standardized naming for clients, roles, and groups
- ✅ Proper separation: UI (PKCE) vs BFF (service account) vs API (bearer-only)
- ✅ Audience-based token validation
- ✅ Least-privilege service accounts
- ✅ Version-controlled IAM configuration

### Migration Summary

| Current | New | Type |
|---------|-----|------|
| `neon-web` | `neon-web` | ✅ Keep (already compliant) |
| `svc-neon-server` | `neon-svc-bff` | 🔄 Rename service account |
| `svc-runtime-worker` | `athyper-svc-runtime-worker` | 🔄 Rename service account |
| `runtime-api` | `athyper-api-runtime` | 🔄 Rename bearer-only API |
| `neon:PERSONAS:*` | `neon:PERSONA:*` | 🔄 Singular namespace |
| `neon:MODULES:*` | `neon:MODULE:*` | 🔄 Singular namespace |

---

## Naming Conventions

### Client ID Pattern: `<product>-<type>-<name>`

**Products:**
- `neon` - Neon ERP (consumer application)
- `athyper` - Platform services (backend, runtime)
- `mesh` - API Gateway / Infrastructure

**Types:**
- `web` - Browser-based UI (public client)
- `svc` - Service account (confidential)
- `api` - Resource server (bearer-only)
- `bff` - Backend-for-Frontend
- `worker` - Background worker

**Examples:**
- ✅ `neon-web` (public PKCE client)
- ✅ `neon-svc-bff` (BFF service account)
- ✅ `athyper-api-runtime` (bearer-only API)
- ✅ `athyper-svc-runtime-worker` (background worker)
- ❌ `svc-neon-server` (type before product)
- ❌ `runtime-api` (missing product)

### Role Naming

**UI Roles** (on neon-web client):
```
neon:WORKBENCH:ADMIN
neon:PERSONA:tenant_admin    (singular)
neon:MODULE:ACC              (singular)
```

**API Roles** (on athyper-api-runtime client):
```
runtime:invoke
wf:timer:run
doc:read
doc:write
content:sign:url
audit:write
event:publish
outbox:process
```

**Pattern**:
- UI: `neon:<NAMESPACE>:<role>` where NAMESPACE is singular (PERSONA, MODULE, WORKBENCH)
- API: `<domain>:<action>` or `<domain>:<subdomain>:<action>`

### Group Naming: `/<product>/<namespace>/<role>`

```
/neon/persona/manager
/neon/module/acc
/svc/neon/bff
```

---

## Client Architecture

### Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (User)                           │
└────────────────┬────────────────────────────────────────────┘
                 │ PKCE Flow
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  neon-web (Public Client)                                    │
│  - PKCE + Authorization Code                                 │
│  - Token includes aud: ["neon-web", "athyper-api-runtime"]   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─────────────────────────────────────────────┐
                 │                                             │
                 ▼ User Token                                  ▼ System Token
┌────────────────────────────────┐      ┌─────────────────────────────────┐
│  athyper-api-runtime           │      │  neon-svc-bff                    │
│  (Bearer-only)                 │      │  (Confidential)                  │
│  - Validates all tokens        │      │  - BFF system calls              │
│  - 21 API roles defined        │      │  - Client Credentials flow       │
└────────────────────────────────┘      └─────────────────────────────────┘
                                                       │
                                                       ▼
                                        ┌─────────────────────────────────┐
                                        │  athyper-svc-runtime-worker      │
                                        │  (Confidential)                  │
                                        │  - Background jobs, timers       │
                                        └─────────────────────────────────┘
```

### Client Roles

**athyper-api-runtime** (21 roles):
```
runtime:read, runtime:write, runtime:admin, runtime:invoke
wf:read, wf:execute, wf:timer:run, wf:approval:execute
doc:read, doc:write, doc:sign:url
content:read, content:write, content:overlay:apply, content:sign:url
audit:read, audit:write
event:read, event:publish
outbox:read, outbox:process
```

**neon-svc-bff** assigned roles (from athyper-api-runtime):
```
runtime:invoke
doc:read, doc:write
content:read, content:sign:url
```

**athyper-svc-runtime-worker** assigned roles:
```
wf:timer:run, wf:approval:execute
event:publish
audit:write
outbox:process
```

---

## Implementation Steps

### Prerequisites

- [ ] Backup current realm: `cd mesh/scripts && ./export-iam.sh`
- [ ] Document all service account secrets
- [ ] Verify tests pass with current config
- [ ] Schedule maintenance window (if needed)

### Step 1: Create athyper-api-runtime (Bearer-only)

**Keycloak Admin Console** → Clients → Create Client

```yaml
Client ID: athyper-api-runtime
Name: Athyper Runtime API
Description: Bearer-only resource server for Athyper Runtime REST APIs
Client authentication: OFF
Bearer only: ON
Save
```

**Create Client Roles** (Clients → athyper-api-runtime → Roles tab):

Create all 21 roles listed in `refactored-clients-config.json` or manually:
```
runtime:read, runtime:write, runtime:admin, runtime:invoke
wf:read, wf:execute, wf:timer:run, wf:approval:execute
doc:read, doc:write, doc:sign:url
content:read, content:write, content:overlay:apply, content:sign:url
audit:read, audit:write
event:read, event:publish
outbox:read, outbox:process
```

### Step 2: Create neon-svc-bff (Service Account)

**Keycloak Admin Console** → Clients → Create Client

```yaml
Client ID: neon-svc-bff
Name: Neon BFF Service Account
Client authentication: ON
Service accounts roles: ON
Direct access grants: OFF
Standard flow: OFF
Save
```

**Credentials tab:**
- Copy client secret → Store in vault/env as `NEON_SVC_BFF_CLIENT_SECRET`

**Service Account Roles tab:**
- Client Roles → Select: `athyper-api-runtime`
- Assign roles:
  - ✓ runtime:invoke
  - ✓ doc:read
  - ✓ doc:write
  - ✓ content:read
  - ✓ content:sign:url

### Step 3: Create athyper-svc-runtime-worker (Service Account)

**Keycloak Admin Console** → Clients → Create Client

```yaml
Client ID: athyper-svc-runtime-worker
Name: Athyper Runtime Background Worker
Client authentication: ON
Service accounts roles: ON
Direct access grants: OFF
Standard flow: OFF
Save
```

**Credentials tab:**
- Copy client secret → Store as `ATHYPER_SVC_RUNTIME_WORKER_CLIENT_SECRET`

**Service Account Roles tab:**
- Client Roles → Select: `athyper-api-runtime`
- Assign roles:
  - ✓ wf:timer:run
  - ✓ wf:approval:execute
  - ✓ event:publish
  - ✓ audit:write
  - ✓ outbox:process

### Step 4: Update neon-web Client

#### 4.1 Fix Redirect URIs

**Current issue**: Empty string in redirectUris array

Clients → neon-web → Settings tab:
- Remove empty string from Valid redirect URIs
- Keep only:
  - `http://localhost:3000/*`
  - `http://localhost:3001/*`
  - `https://neon.athyper.local/*`
- Save

#### 4.2 Add Audience Mapper

Clients → neon-web → Client scopes tab → neon-web-dedicated → Add mapper → By configuration → Audience

```yaml
Name: athyper-api-runtime audience
Included Client Audience: athyper-api-runtime
Add to ID token: OFF
Add to access token: ON
Add to introspection token claim: ON
Save
```

#### 4.3 Rename Roles (Optional but Recommended)

**Option A**: Rename existing roles
```
Clients → neon-web → Roles tab
For each role, click → Edit → Change name:
  neon:PERSONAS:tenant_admin → neon:PERSONA:tenant_admin
  neon:PERSONAS:module_admin → neon:PERSONA:module_admin
  ... (all PERSONAS → PERSONA)

  neon:MODULES:ACC → neon:MODULE:ACC
  neon:MODULES:PAY → neon:MODULE:PAY
  ... (all MODULES → MODULE)
```

**Option B**: Keep old roles temporarily, add new ones
- Create new roles with singular names
- Assign both old and new roles during transition
- Update code to check new role names
- Remove old roles after migration complete

### Step 5: Update Environment Variables

**Add to .env or vault** (keep old ones temporarily for rollback):

```bash
# New service account credentials
NEON_SVC_BFF_CLIENT_ID=neon-svc-bff
NEON_SVC_BFF_CLIENT_SECRET=<from-keycloak-credentials>

ATHYPER_SVC_RUNTIME_WORKER_CLIENT_ID=athyper-svc-runtime-worker
ATHYPER_SVC_RUNTIME_WORKER_CLIENT_SECRET=<from-keycloak-credentials>

# Keep old variables commented (for rollback)
# SVC_NEON_SERVER_CLIENT_ID=svc-neon-server
# SVC_NEON_SERVER_CLIENT_SECRET=<old-secret>
# SVC_RUNTIME_WORKER_CLIENT_ID=svc-runtime-worker
# SVC_RUNTIME_WORKER_CLIENT_SECRET=<old-secret>
```

### Step 6: Update Code References

#### 6.1 Update Client IDs

**BFF Service Account**:
```typescript
// Before
const clientId = process.env.SVC_NEON_SERVER_CLIENT_ID;

// After
const clientId = process.env.NEON_SVC_BFF_CLIENT_ID;
```

**Runtime Worker**:
```typescript
// Before
const clientId = process.env.SVC_RUNTIME_WORKER_CLIENT_ID;

// After
const clientId = process.env.ATHYPER_SVC_RUNTIME_WORKER_CLIENT_ID;
```

#### 6.2 Update Audience Checks

**Runtime API Token Validation**:
```typescript
// Before
if (!aud.includes('runtime-api')) {
  throw new Error('Invalid audience');
}

// After
if (!aud.includes('athyper-api-runtime')) {
  throw new Error('Invalid audience');
}
```

#### 6.3 Update Role Checks (If Renamed)

```typescript
// Before
const hasAccess = user.roles.includes('neon:PERSONAS:manager');
const hasModule = user.roles.includes('neon:MODULES:ACC');

// After
const hasAccess = user.roles.includes('neon:PERSONA:manager');
const hasModule = user.roles.includes('neon:MODULE:ACC');

// Or (if keeping both temporarily)
const hasAccess =
  user.roles.includes('neon:PERSONA:manager') ||
  user.roles.includes('neon:PERSONAS:manager'); // fallback
```

#### 6.4 Update Authorized Party Checks

```typescript
// Before
const allowedClients = ['neon-web', 'svc-neon-server', 'svc-runtime-worker'];

// After
const allowedClients = ['neon-web', 'neon-svc-bff', 'athyper-svc-runtime-worker'];
```

### Step 7: Deploy and Restart Services

```bash
# Deploy updated code
docker compose build

# Restart services
docker compose restart
```

### Step 8: Export & Commit

```bash
cd mesh/scripts
./export-iam.sh

# Review changes
git diff mesh/config/iam/realm-demosetup.json

# Commit
git add mesh/config/iam/realm-demosetup.json
git add docs/iam/
git commit -m "IAM: Migrate to standardized naming conventions

- Rename clients: svc-neon-server → neon-svc-bff
- Rename clients: svc-runtime-worker → athyper-svc-runtime-worker
- Add bearer-only: athyper-api-runtime
- Update neon-web with audience mapper
- Standardize role names (PERSONA/MODULE singular)

Ref: docs/iam/IAM-SETUP-GUIDE.md"
```

### Step 9: Disable Old Clients (After Verification)

**Only after verifying everything works for 1-2 weeks!**

```
Clients → svc-neon-server → Settings → Enabled: OFF
Clients → svc-runtime-worker → Settings → Enabled: OFF
Clients → runtime-api → Settings → Enabled: OFF

(Keep disabled for 1-2 weeks, then delete)
```

---

## Code Integration

### User Requests (neon-web token)

```typescript
// products/neon/apps/web/app/api/documents/route.ts
import { getServerSession } from 'next-auth';

export async function GET(req: Request) {
  const session = await getServerSession();

  // Use user's access token (includes athyper-api-runtime in audience)
  const response = await fetch('http://runtime:8080/api/documents', {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  return response.json();
}
```

### BFF System Calls (neon-svc-bff token)

```typescript
// products/neon/apps/web/lib/service-account-client.ts
import { ClientCredentials } from 'simple-oauth2';

const serviceAccountClient = new ClientCredentials({
  client: {
    id: process.env.NEON_SVC_BFF_CLIENT_ID!,
    secret: process.env.NEON_SVC_BFF_CLIENT_SECRET!,
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
      'X-Service-Account': 'neon-svc-bff'
    }
  });
}
```

### Background Worker (athyper-svc-runtime-worker token)

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
            client_id: process.env.ATHYPER_SVC_RUNTIME_WORKER_CLIENT_ID!,
            client_secret: process.env.ATHYPER_SVC_RUNTIME_WORKER_CLIENT_SECRET!,
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

    await fetch('http://runtime:8080/api/workflows/timers/process', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Service-Account': 'athyper-svc-runtime-worker'
      }
    });
  }
}
```

### Runtime API Token Validation

```typescript
// framework/runtime/src/middleware/auth.ts
export async function validateToken(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  // Validate with Keycloak JWKS
  const jwks = await fetchJWKS();
  const decoded = await jose.jwtVerify(token, jwks);

  // Check audience includes athyper-api-runtime
  const aud = Array.isArray(decoded.payload.aud)
    ? decoded.payload.aud
    : [decoded.payload.aud];

  if (!aud.includes('athyper-api-runtime')) {
    throw new Error('Token does not include athyper-api-runtime audience');
  }

  // Check authorized party (azp)
  const azp = decoded.payload.azp;
  const allowedClients = ['neon-web', 'neon-svc-bff', 'athyper-svc-runtime-worker'];

  if (!allowedClients.includes(azp)) {
    throw new Error(`Unauthorized client: ${azp}`);
  }

  // Extract roles from athyper-api-runtime resource_access
  const roles = decoded.payload.resource_access?.['athyper-api-runtime']?.roles || [];

  return {
    azp,
    sub: decoded.payload.sub,
    roles,
    isServiceAccount: azp.startsWith('svc-') || azp.includes('-svc-')
  };
}
```

---

## Testing

### Test 1: User Login Flow (neon-web)

```bash
# 1. Login to neon-web UI
# 2. Check browser console → Network → Token
# 3. Verify token includes:
#    - aud: ["neon-web", "athyper-api-runtime"]
#    - azp: "neon-web"

# Decode token and verify
curl -X POST http://localhost:8080/api/test/token \
  -H "Authorization: Bearer $USER_TOKEN"

# Should succeed if audience includes athyper-api-runtime
```

### Test 2: BFF Service Account (neon-svc-bff)

```bash
# Get service account token
TOKEN=$(curl -X POST \
  http://localhost/auth/realms/athyper/protocol/openid-connect/token \
  -d "grant_type=client_credentials" \
  -d "client_id=neon-svc-bff" \
  -d "client_secret=$NEON_SVC_BFF_CLIENT_SECRET" \
  | jq -r .access_token)

# Decode and verify
echo $TOKEN | jwt decode -

# Check:
# - aud: ["athyper-api-runtime"]
# - azp: "neon-svc-bff"
# - resource_access.athyper-api-runtime.roles contains expected roles

# Call Runtime API
curl -X POST http://localhost:8080/api/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Document"}'

# Should succeed if token has doc:write role
```

### Test 3: Worker Service Account

```bash
# Get worker token
WORKER_TOKEN=$(curl -X POST \
  http://localhost/auth/realms/athyper/protocol/openid-connect/token \
  -d "grant_type=client_credentials" \
  -d "client_id=athyper-svc-runtime-worker" \
  -d "client_secret=$ATHYPER_SVC_RUNTIME_WORKER_CLIENT_SECRET" \
  | jq -r .access_token)

# Trigger workflow timer
curl -X POST http://localhost:8080/api/workflows/timers/process \
  -H "Authorization: Bearer $WORKER_TOKEN"

# Should succeed if token has wf:timer:run role
```

### Test 4: Monitor Logs

```bash
# Check for authorization errors
docker logs athyper-runtime-1 --tail 100 -f

# Look for:
# - Token validation errors
# - Missing audience claims
# - Unauthorized client errors
# - Missing role errors
```

---

## Rollback Plan

### Quick Rollback (No Code Changes)

If issues occur within 24 hours:

```bash
# 1. Re-enable old clients in Keycloak Admin Console
Clients → svc-neon-server → Settings → Enabled: ON
Clients → svc-runtime-worker → Settings → Enabled: ON
Clients → runtime-api → Settings → Enabled: ON

# 2. Revert environment variables (use old SVC_* vars)

# 3. Restart services
docker compose restart
```

### Full Rollback (With Code Changes)

If code was deployed:

```bash
# 1. Revert code changes
git revert <migration-commit-hash>

# 2. Re-import old realm config
cd mesh/scripts
git checkout HEAD~1 -- ../config/iam/realm-demosetup.json
./initdb-iam.sh

# 3. Restart Keycloak
docker restart athyper-mesh-iam-1

# 4. Restart all services
docker compose restart
```

---

## Security Best Practices

### 1. Secret Management
- Store secrets in vault (not .env in production)
- Rotate service account secrets quarterly
- Audit secret access logs
- Never commit secrets to version control

### 2. Token Validation
Always validate:
1. Signature (JWKS)
2. Issuer (iss claim)
3. Audience (aud includes athyper-api-runtime)
4. Expiration (exp claim)
5. Not before (nbf claim)
6. Authorized party (azp claim)

### 3. Least Privilege
- Only assign roles that are absolutely needed
- Separate service accounts per concern
- Monitor service account token usage
- Regular access reviews

### 4. Audit Logging
```typescript
// Log all service account calls
logger.audit({
  action: 'api_call',
  azp: decodedToken.azp,
  sub: decodedToken.sub,
  endpoint: req.url,
  roles: decodedToken.resource_access['athyper-api-runtime'].roles
});
```

---

## Configuration Reference

See [refactored-clients-config.json](./refactored-clients-config.json) for complete client configurations including:
- All 4 clients (neon-web, neon-svc-bff, athyper-svc-runtime-worker, athyper-api-runtime)
- Protocol mappers
- Client roles (21 API roles)
- Service account role assignments
- Updated neon-web roles (singular PERSONA/MODULE namespaces)

---

## Checklist

### Pre-Migration
- [ ] Backup current realm export
- [ ] Document all service account secrets
- [ ] Verify tests pass with current config
- [ ] Schedule maintenance window (if needed)

### During Migration
- [ ] Create athyper-api-runtime client with 21 roles
- [ ] Create neon-svc-bff client
- [ ] Create athyper-svc-runtime-worker client
- [ ] Update neon-web (remove empty URI, add audience mapper)
- [ ] Optionally rename roles (PERSONAS → PERSONA, MODULES → MODULE)
- [ ] Update environment variables
- [ ] Update code references (client IDs, audience, roles, azp)
- [ ] Deploy updated code

### Post-Migration
- [ ] Test user login flow
- [ ] Test BFF service account calls
- [ ] Test worker service account calls
- [ ] Monitor logs for authorization errors (24-48 hours)
- [ ] Verify no references to old client IDs in logs
- [ ] Export updated realm
- [ ] Commit to version control
- [ ] After 1-2 weeks: Disable old clients
- [ ] After 4 weeks: Delete old clients

---

**Estimated Time**: 2-4 hours
**Risk Level**: Medium (reversible, but requires coordination)
**Best Practice**: Migrate in dev/staging first, then production
