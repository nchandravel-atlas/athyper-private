# IAM Naming Convention Migration Guide

## Overview

Migrate from ad-hoc naming to standardized `<product>-<type>-<name>` pattern.

## Migration Summary

| Current | New | Change Type |
|---------|-----|-------------|
| `neon-web` | `neon-web` | ✅ No change |
| `svc-neon-server` | `neon-svc-bff` | 🔄 Rename client |
| `svc-runtime-worker` | `athyper-svc-runtime-worker` | 🔄 Rename client |
| `runtime-api` | `athyper-api-runtime` | 🔄 Rename client |
| `neon:PERSONAS:*` | `neon:PERSONA:*` | 🔄 Rename roles |
| `neon:MODULES:*` | `neon:MODULE:*` | 🔄 Rename roles |

## Migration Steps

### Step 1: Create New Clients (Keycloak Admin Console)

#### 1.1 Create athyper-api-runtime

```yaml
Clients → Create Client
  Client ID: athyper-api-runtime
  Name: Athyper Runtime API
  Description: Bearer-only resource server for Athyper Runtime REST APIs
  Client authentication: OFF
  Bearer only: ON
  Save
```

**Create Client Roles** (Clients → athyper-api-runtime → Roles tab):
```
runtime:read
runtime:write
runtime:admin
runtime:invoke
wf:read
wf:execute
wf:timer:run
wf:approval:execute
doc:read
doc:write
doc:sign:url
content:read
content:write
content:overlay:apply
content:sign:url
audit:read
audit:write
event:read
event:publish
outbox:read
outbox:process
```

#### 1.2 Create neon-svc-bff

```yaml
Clients → Create Client
  Client ID: neon-svc-bff
  Name: Neon BFF Service Account
  Client authentication: ON
  Service accounts roles: ON
  Direct access grants: OFF
  Standard flow: OFF
  Save

Credentials tab:
  Copy client secret → Store in vault/env as NEON_SVC_BFF_CLIENT_SECRET

Service Account Roles tab:
  Client Roles → Select: athyper-api-runtime
  Assign roles:
    ✓ runtime:invoke
    ✓ doc:read
    ✓ doc:write
    ✓ content:read
    ✓ content:sign:url
```

#### 1.3 Create athyper-svc-runtime-worker

```yaml
Clients → Create Client
  Client ID: athyper-svc-runtime-worker
  Name: Athyper Runtime Background Worker
  Client authentication: ON
  Service accounts roles: ON
  Direct access grants: OFF
  Standard flow: OFF
  Save

Credentials tab:
  Copy client secret → Store as ATHYPER_SVC_RUNTIME_WORKER_CLIENT_SECRET

Service Account Roles tab:
  Client Roles → Select: athyper-api-runtime
  Assign roles:
    ✓ wf:timer:run
    ✓ wf:approval:execute
    ✓ event:publish
    ✓ audit:write
    ✓ outbox:process
```

### Step 2: Update neon-web Client

#### 2.1 Fix Redirect URIs

**Current**:
```json
{
  "redirectUris": [
    "",  // ❌ Remove this
    "http://localhost:3000/*",
    "https://neon.athyper.local/*",
    "http://localhost:3001/*"
  ]
}
```

**Fixed**:
```
Clients → neon-web → Settings tab
  Valid redirect URIs:
    - http://localhost:3000/*
    - http://localhost:3001/*
    - https://neon.athyper.local/*
  (Remove the empty string)
  Save
```

#### 2.2 Add Audience Mapper

```
Clients → neon-web → Client scopes tab
  → neon-web-dedicated
  → Add mapper
  → By configuration
  → Audience

Configure:
  Name: athyper-api-runtime audience
  Included Client Audience: athyper-api-runtime
  Add to ID token: OFF
  Add to access token: ON
  Add to introspection token claim: ON
  Save
```

#### 2.3 Rename Roles (Optional but Recommended)

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
- Assign both old and new roles to users during transition
- Gradually migrate code to check new role names
- Remove old roles after migration complete

### Step 3: Update Environment Variables

**Add new variables** (keep old ones temporarily):

```bash
# .env or vault

# New service account credentials
NEON_SVC_BFF_CLIENT_ID=neon-svc-bff
NEON_SVC_BFF_CLIENT_SECRET=<from-keycloak-credentials>

ATHYPER_SVC_RUNTIME_WORKER_CLIENT_ID=athyper-svc-runtime-worker
ATHYPER_SVC_RUNTIME_WORKER_CLIENT_SECRET=<from-keycloak-credentials>

# Keep old variables temporarily (for rollback)
# SVC_NEON_SERVER_CLIENT_ID=svc-neon-server
# SVC_NEON_SERVER_CLIENT_SECRET=<old-secret>
# SVC_RUNTIME_WORKER_CLIENT_ID=svc-runtime-worker
# SVC_RUNTIME_WORKER_CLIENT_SECRET=<old-secret>
```

### Step 4: Update Code References

#### 4.1 Update Client ID References

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

#### 4.2 Update Audience Checks

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

#### 4.3 Update Role Checks (If Renamed)

**Before**:
```typescript
const hasAccess = user.roles.includes('neon:PERSONAS:manager');
const hasModule = user.roles.includes('neon:MODULES:ACC');
```

**After**:
```typescript
const hasAccess = user.roles.includes('neon:PERSONA:manager');
const hasModule = user.roles.includes('neon:MODULE:ACC');
```

**Or (if keeping both temporarily)**:
```typescript
const hasAccess =
  user.roles.includes('neon:PERSONA:manager') ||
  user.roles.includes('neon:PERSONAS:manager'); // fallback
```

#### 4.4 Update Authorized Party (azp) Checks

**Before**:
```typescript
const allowedClients = ['neon-web', 'svc-neon-server', 'svc-runtime-worker'];
```

**After**:
```typescript
const allowedClients = ['neon-web', 'neon-svc-bff', 'athyper-svc-runtime-worker'];
```

### Step 5: Test Migration

#### 5.1 Test User Login (neon-web)
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

#### 5.2 Test BFF Service Account (neon-svc-bff)
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

#### 5.3 Test Worker Service Account
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

### Step 6: Disable/Delete Old Clients

**Only after verifying everything works!**

```
Clients → svc-neon-server
  Settings → Enabled: OFF
  (Keep disabled for 1-2 weeks, then delete)

Clients → svc-runtime-worker
  Settings → Enabled: OFF
  (Keep disabled for 1-2 weeks, then delete)

Clients → runtime-api
  Settings → Enabled: OFF
  (Keep disabled for 1-2 weeks, then delete)
```

### Step 7: Export & Commit

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

Ref: docs/iam/NAMING-CONVENTIONS.md"
```

---

## Rollback Plan

If issues occur, rollback is straightforward:

### Quick Rollback (No Code Changes)
```bash
# 1. Re-enable old clients
Clients → svc-neon-server → Settings → Enabled: ON
Clients → svc-runtime-worker → Settings → Enabled: ON
Clients → runtime-api → Settings → Enabled: ON

# 2. Revert environment variables
# Use old SVC_NEON_SERVER_* and SVC_RUNTIME_WORKER_* vars

# 3. Restart services
docker compose restart
```

### Full Rollback (With Code Changes)
```bash
# 1. Revert code changes
git revert <migration-commit-hash>

# 2. Re-import old realm config
cd mesh/scripts
git checkout HEAD~1 -- ../config/iam/realm-demosetup.json
./initdb-iam.sh

# 3. Restart Keycloak
docker restart athyper-mesh-iam-1
```

---

## Checklist

### Pre-Migration
- [ ] Backup current realm export
- [ ] Document all service account secrets
- [ ] Verify tests pass with current config
- [ ] Schedule maintenance window (if needed)

### During Migration
- [ ] Create athyper-api-runtime client
- [ ] Create neon-svc-bff client
- [ ] Create athyper-svc-runtime-worker client
- [ ] Update neon-web (remove empty URI, add audience mapper)
- [ ] Optionally rename roles (PERSONAS → PERSONA, MODULES → MODULE)
- [ ] Update environment variables
- [ ] Update code references
- [ ] Deploy updated code

### Post-Migration
- [ ] Test user login flow
- [ ] Test BFF service account calls
- [ ] Test worker service account calls
- [ ] Monitor logs for authorization errors
- [ ] Verify no references to old client IDs
- [ ] Export updated realm
- [ ] Commit to version control
- [ ] After 2 weeks: Disable old clients
- [ ] After 4 weeks: Delete old clients

---

**Estimated Time**: 2-4 hours
**Risk Level**: Medium (reversible, but requires coordination)
**Best Practice**: Migrate in dev/staging first, then production

---

**Last Updated**: 2026-02-16
**Status**: Ready for Execution
