# Keycloak Client Architecture Plan

## Current State (2026-02-16)

### Existing Clients
1. **neon-web** (Public, PKCE) - ✅ UI Client
2. Built-in Keycloak clients (account, admin-cli, etc.)

## Proposed Architecture

### Tier 1: Browser Apps
**Status**: ✅ Complete

```
neon-web (Public + PKCE)
├── Redirect URIs: localhost:3000, localhost:3001, neon.athyper.local
├── Consent: Required
└── Use Case: Next.js UI authentication
```

### Tier 2: Backend APIs (Bearer-Only)
**Status**: ⚠️ MISSING - High Priority

#### A) runtime-api
```json
{
  "clientId": "runtime-api",
  "name": "Athyper Runtime API",
  "description": "Bearer-only resource server for Runtime REST APIs",
  "bearerOnly": true,
  "publicClient": false,
  "enabled": true,
  "standardFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "serviceAccountsEnabled": false
}
```

**Purpose**:
- Validates access tokens from neon-web
- Protects Runtime HTTP endpoints
- No login flows (bearer-only)

**Required Audience Mappers**:
- Add audience mapper to include "runtime-api" in tokens

#### B) mesh-api (Optional)
```json
{
  "clientId": "mesh-api",
  "name": "Mesh API Gateway",
  "bearerOnly": true,
  "description": "Central API gateway token validation"
}
```

### Tier 3: Service-to-Service (Machine Identities)
**Status**: ⚠️ MISSING - Critical for Production

#### C) svc-runtime-worker
```json
{
  "clientId": "svc-runtime-worker",
  "name": "Runtime Background Workers",
  "description": "Service account for async jobs, schedulers, timers",
  "publicClient": false,
  "bearerOnly": false,
  "serviceAccountsEnabled": true,
  "authorizationServicesEnabled": false,
  "standardFlowEnabled": false,
  "directAccessGrantsEnabled": false,
  "clientAuthenticatorType": "client-secret"
}
```

**Use Cases**:
- Workflow timers
- Scheduled jobs
- Outbox processor
- Event handlers
- Audit log writer

**Required Roles**:
```
Service Account Roles (Least Privilege):
- runtime:worker:execute
- runtime:events:publish
- runtime:audit:write
```

#### D) svc-neon-bff (If BFF is separate service)
```json
{
  "clientId": "svc-neon-bff",
  "name": "Neon BFF Service",
  "description": "Backend-for-Frontend service account",
  "serviceAccountsEnabled": true,
  "standardFlowEnabled": false
}
```

**Decision Point**: Do you need this?
- **Yes**: If BFF runs as separate Node.js service
- **No**: If BFF is same Next.js process as UI (reuse neon-web for user flows, add svc-neon-bff for system flows)

### Tier 4: Integration Clients (Future)
**Status**: 📅 Planned

```
svc-integration-sap       - SAP connector
svc-integration-ariba     - Ariba connector
svc-integration-m365      - M365 connector
svc-integration-custom    - Custom integrations
```

## Implementation Phases

### Phase 1: Core APIs (Week 1) ⚠️ HIGH PRIORITY
1. Add `runtime-api` (bearer-only)
2. Add audience mapper to neon-web tokens
3. Update Runtime to validate against runtime-api client
4. Test token validation

### Phase 2: Service Accounts (Week 2) ⚠️ CRITICAL
1. Add `svc-runtime-worker`
2. Configure service account roles
3. Update background jobs to use client credentials
4. Audit service account usage

### Phase 3: BFF Decision (Week 3)
1. Decide: Is BFF separate or same process?
2. If separate: Add `svc-neon-bff`
3. If same: Use neon-web + svc-runtime-worker

### Phase 4: Integrations (As Needed)
1. Add integration clients when connectors are built
2. One client per integration
3. Scoped roles per integration

## Security Checklist

### ✅ Current (Good)
- [x] neon-web uses PKCE
- [x] No password grant flows
- [x] Consent screen enabled
- [x] HTTPS enforced

### ⚠️ Missing (Fix Now)
- [ ] No bearer-only API client (runtime-api)
- [ ] No service accounts for workers
- [ ] No audience validation
- [ ] No client for background jobs

### 📅 Future (Plan)
- [ ] Client secrets in vault (not env vars)
- [ ] Rotate service account secrets quarterly
- [ ] Monitor service account token usage
- [ ] Implement token introspection

## Token Flow Examples

### Flow 1: User Login (Current - Working)
```
User → neon-web (PKCE) → Keycloak → neon-web
      ← Access Token (with neon-web roles)
```

### Flow 2: API Call (Phase 1 - Add This)
```
neon-web → runtime-api (Bearer Token)
         → Validates: audience = "runtime-api"
         → Validates: roles match endpoint
         ← API Response
```

### Flow 3: Background Job (Phase 2 - Critical)
```
Runtime Worker → Client Credentials Grant
               → Keycloak (svc-runtime-worker)
               ← Service Account Token
               → Call Runtime API
               → Process job
```

## Audience Configuration

### neon-web Token Should Include:
```json
{
  "aud": ["neon-web", "runtime-api", "mesh-api"],
  "azp": "neon-web",
  "resource_access": {
    "neon-web": {
      "roles": ["neon:WORKBENCH:USER", ...]
    }
  }
}
```

### svc-runtime-worker Token Should Include:
```json
{
  "aud": ["runtime-api"],
  "azp": "svc-runtime-worker",
  "resource_access": {
    "runtime-api": {
      "roles": ["runtime:worker:execute"]
    }
  }
}
```

## References
- Current Export: `mesh/config/iam/realm-demosetup.json`
- Keycloak Docs: https://www.keycloak.org/docs/latest/server_admin/
- Auth Architecture: `docs/security/AUTH_ARCHITECTURE.md`

---

**Last Updated**: 2026-02-16
**Status**: Planning Phase
**Next Action**: Create runtime-api client
