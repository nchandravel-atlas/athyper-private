# Athyper IAM Setup Guide

**Last Updated**: 2026-02-18
**Status**: Steps 1–4 Complete, Security Hardening Applied
**Estimated Time**: 2-4 hours (initial setup)

## Table of Contents

1. [Overview](#overview)
2. [Naming Conventions](#naming-conventions)
3. [Client Architecture](#client-architecture)
4. [RBAC Matrix](#rbac-matrix)
5. [Implementation Steps](#implementation-steps)
6. [Code Integration](#code-integration)
7. [Testing](#testing)
8. [Rollback Plan](#rollback-plan)

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
| `neon:PERSONAS:*` | `neon:PERSONA:*` | ✅ Done (singular namespace) |
| `neon:MODULES:*` | `neon:MODULE:*` | ✅ Done (singular namespace) |

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

#### 📦 athyper-api-runtime (Bearer-only Resource Server)

**Purpose**: Resource server roles used by Runtime APIs.

**Assigned to**:
- User tokens (via neon-web)
- Service accounts (neon-svc-bff, athyper-svc-runtime-worker, etc.)

---

#### 🧠 1. Core Runtime Roles

**runtime:read**
- **Description**: Read-only access to core runtime entities (metadata, state, configurations, execution logs)
- **Use cases**:
  - View entity details
  - Fetch lifecycle state
  - Query runtime status dashboards

**runtime:write**
- **Description**: Mutation of runtime-managed entities and state transitions (excluding administrative operations)
- **Use cases**:
  - Submit entity updates
  - Trigger lifecycle transitions
  - Modify runtime-managed records

**runtime:admin**
- **Description**: Full administrative control over runtime configuration and execution, including override capabilities
- **Use cases**:
  - Force transition override
  - Rebuild projections
  - Clear stuck workflows
  - System repair actions
- **⚠ Security**: Should be restricted to platform administrators only

**runtime:invoke**
- **Description**: Invoke internal runtime services (commands, handlers, orchestrations) without broad write privileges
- **Use cases**:
  - Service-to-service calls
  - Internal command execution
  - Controlled orchestration triggers
- **Ideal for**: BFF service accounts (neon-svc-bff)

---

#### 🔄 2. Workflow (wf) Roles

**wf:read**
- **Description**: Read access to workflow definitions, instances, tasks, and history
- **Use cases**:
  - View approval status
  - View workflow timeline
  - Inspect workflow audit trail

**wf:execute**
- **Description**: Execute workflow actions such as completing tasks or triggering transitions
- **Use cases**:
  - Approve/reject actions
  - Complete workflow step
  - Trigger next stage
- **Assigned to**: Business users via neon-web

**wf:timer:run**
- **Description**: Permission for automated timer workers to execute scheduled workflow events
- **Use cases**:
  - SLA escalation
  - Auto-approval timeout
  - Scheduled state transitions
- **⚠ Security**: Should ONLY be assigned to athyper-svc-runtime-worker

**wf:approval:execute**
- **Description**: Execute approval engine decisions including rule evaluation and multi-level approvals
- **Use cases**:
  - Auto-approval rules
  - Policy-driven approval routing

---

#### 📄 3. Document (doc) Roles

**doc:read**
- **Description**: Read access to documents and metadata

**doc:write**
- **Description**: Create, update, or modify document records and attachments

**doc:sign:url**
- **Description**: Generate secure signed URLs for document access (temporary download/upload links)
- **Use cases**:
  - Presigned S3/MinIO download
  - Controlled upload sessions
- **Note**: Typically granted to BFF service account, not users directly

---

#### 📁 4. Content Roles

**content:read**
- **Description**: Read access to stored content objects

**content:write**
- **Description**: Upload, update, or modify content records

**content:overlay:apply**
- **Description**: Apply metadata overlays or schema-driven modifications to content entities
- **Use cases**:
  - Meta-driven schema patching
  - Dynamic policy overlays
- **⚠ Security**: High privilege — usually admin/service role only

**content:sign:url**
- **Description**: Generate secure signed URLs for content access

---

#### 🧾 5. Audit Roles

**audit:read**
- **Description**: Read audit logs, permission decisions, integrity reports
- **⚠ Security**: Restricted to compliance/admin roles

**audit:write**
- **Description**: Write audit entries (used internally by runtime)
- **⚠ Security**: Usually assigned only to service accounts

---

#### 📡 6. Event Roles

**event:read**
- **Description**: Consume published platform events

**event:publish**
- **Description**: Publish domain events into the platform event bus
- **Used by**: Services emitting domain events

---

#### 📤 7. Outbox Roles

**outbox:read**
- **Description**: Read pending outbox entries

**outbox:process**
- **Description**: Process and mark outbox events as dispatched
- **⚠ Security**: Should ONLY be granted to background worker service account (athyper-svc-runtime-worker)

---

#### Role Summary (21 total)
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

## RBAC Matrix

### Principles (Athyper-Friendly)

**Core Tenets**:

1. **UI roles ≠ API roles**
   - UI (neon-web) decides what menus/actions show
   - Runtime (athyper-api-runtime) decides what is authorized

2. **Grant runtime roles via Groups, not per-user assignments**
   - Users join groups like `/org/demo_in/persona/manager`
   - Groups carry the runtime role mappings

3. **Use composites at Runtime to bundle permissions**
   - Don't assign 10 primitive roles to each user
   - Create composites like `base:operator`, `mod:ACC:admin`

4. **Separate human roles vs service roles**
   - Humans: personas + modules
   - Workers/BFF: automation-only roles (timers, outbox, etc.)

5. **Anti–role explosion strategy**
   - Keep primitive roles stable (~21 total)
   - Use composites for human-facing bundles
   - Fine-grained actions → Runtime policy engine (not Keycloak roles)

---

### Current Realm State

**neon-web client roles (UI)**:

| Category | Roles | Count |
|----------|-------|-------|
| **Personas** | `tenant_admin`, `module_admin`, `manager`, `requester`, `viewer`, `reporter`, `agent` | 7 |
| **Workbenches** | `ADMIN`, `USER`, `OPS`, `PARTNER` | 4 |
| **Modules** | `ACC`, `PAY` | 2 |

**athyper-api-runtime client roles (API)**: 21 primitive roles (documented above)

**Groups**: Currently empty - **this is what we need to build**

---

### Persona → Runtime Roles Matrix

#### Base Access (Recommended Defaults)

| Persona | Base Runtime Roles | Notes |
|---------|-------------------|-------|
| **tenant_admin** | `base:editor` composite | Plus module-admin roles via module groups |
| **module_admin** | `base:editor` composite | Scoped by module groups |
| **manager** | `base:operator` composite | Approve/execute workflows |
| **requester** | `base:operator` composite | Submit and track requests |
| **viewer** | `base:viewer` composite | Read-only access |
| **reporter** | `base:auditor` composite | Read + audit access for reporting |
| **agent** | `base:operator` + `audit:read` | Support/ops hybrid |

#### High-Privilege Roles (Restricted)

| Persona | Additional Role | When to Grant |
|---------|----------------|---------------|
| **tenant_admin** | `runtime:admin` | ⚠ Platform administrators only |
| **module_admin** | `content:overlay:apply` | ⚠ Meta/policy admin only |

#### ❌ Never Grant to Humans

These are **automation-only roles** (service accounts only):

- `wf:timer:run`
- `outbox:process`
- `audit:write`
- `event:publish`

---

### Composite Role Definitions

#### Base Composites (Foundation)

**base:viewer** (read-only)
```yaml
Includes:
  - runtime:read
  - wf:read
  - doc:read
  - content:read

Use cases:
  - View entities
  - View workflow status
  - Read documents
  - Dashboard access
```

**base:operator** (execute + read)
```yaml
Includes:
  - All roles from base:viewer
  - wf:execute

Use cases:
  - Approve/reject workflows
  - Complete tasks
  - Submit requests
```

**base:editor** (write + execute)
```yaml
Includes:
  - All roles from base:operator
  - runtime:write
  - doc:write
  - content:write

Use cases:
  - Create/modify documents
  - Update runtime entities
  - Full CRUD operations
```

**base:auditor** (read + audit)
```yaml
Includes:
  - runtime:read
  - audit:read

Use cases:
  - Compliance reporting
  - Audit log review
  - Security monitoring
```

---

#### Module Composites (Business Capabilities)

**mod:ACC:user** (Accounting User)
```yaml
Includes:
  - base:operator (or base:viewer depending on business rules)

Use cases:
  - View accounting entries
  - Submit GL journals for approval
  - Approve within authority limits
```

**mod:ACC:admin** (Accounting Admin)
```yaml
Includes:
  - base:editor

Use cases:
  - Configure chart of accounts
  - Force-post corrections
  - Manage accounting policies
```

**mod:PAY:user** (Payments User)
```yaml
Includes:
  - base:operator

Use cases:
  - Submit payment requests
  - View payment status
  - Approve within limits
```

**mod:PAY:admin** (Payments Admin)
```yaml
Includes:
  - base:editor

Optional (high privilege):
  - audit:read (for payment audit trails)

Use cases:
  - Configure payment methods
  - Override payment limits
  - Investigate payment issues
```

---

#### Service Composites (Automation)

**svc:bff** (Backend-for-Frontend)
```yaml
Assigned to: neon-svc-bff
Includes:
  - runtime:invoke
  - doc:read
  - doc:write
  - doc:sign:url
  - content:read
  - content:sign:url

Use cases:
  - Generate presigned URLs
  - Server-side orchestration
  - BFF system operations
```

**svc:worker** (Background Workers)
```yaml
Assigned to: athyper-svc-runtime-worker
Includes:
  - wf:timer:run
  - wf:approval:execute
  - event:publish
  - audit:write
  - outbox:process

Use cases:
  - SLA timers
  - Auto-approval rules
  - Event publishing
  - Outbox processing
```

---

### Group Structure & Naming

#### Pattern: `/org/<orgAlias>/persona/<persona>`

**Purpose**: Assign base persona capabilities

**Examples**:
```
/org/demo_in/persona/tenant_admin   → base:editor composite
/org/demo_in/persona/module_admin   → base:editor composite
/org/demo_in/persona/manager        → base:operator composite
/org/demo_in/persona/requester      → base:operator composite
/org/demo_in/persona/viewer         → base:viewer composite
/org/demo_in/persona/reporter       → base:auditor composite
/org/demo_in/persona/agent          → base:operator + audit:read
```

#### Pattern: `/org/<orgAlias>/module/<MOD>/<tier>`

**Purpose**: Grant module-specific capabilities

**Examples**:
```
/org/demo_in/module/ACC/user        → mod:ACC:user composite
/org/demo_in/module/ACC/admin       → mod:ACC:admin composite
/org/demo_in/module/PAY/user        → mod:PAY:user composite
/org/demo_in/module/PAY/admin       → mod:PAY:admin composite
```

#### Pattern: `/svc/<product>/<component>`

**Purpose**: Service account role isolation

**Examples**:
```
/svc/neon/bff                       → svc:bff composite
/svc/athyper/runtime-worker         → svc:worker composite
```

---

### User Assignment Example

**Scenario**: Accounting manager in India org

**User**: `chandravel.n@demo.in`

**Groups assigned**:
1. `/org/demo_in/persona/manager` → gets `base:operator` composite
2. `/org/demo_in/module/ACC/admin` → gets `mod:ACC:admin` composite (includes `base:editor`)

**Effective roles** (via composite inheritance):
- `runtime:read`, `runtime:write`
- `wf:read`, `wf:execute`
- `doc:read`, `doc:write`
- `content:read`, `content:write`

**Token audience**: `["neon-web", "athyper-api-runtime"]`

**Token resource_access**:
```json
{
  "neon-web": {
    "roles": ["neon:PERSONA:manager", "neon:MODULE:ACC"]
  },
  "athyper-api-runtime": {
    "roles": [
      "runtime:read", "runtime:write",
      "wf:read", "wf:execute",
      "doc:read", "doc:write",
      "content:read", "content:write"
    ]
  }
}
```

---

### Anti–Role Explosion Strategy

#### ✅ What Goes in Keycloak

**Primitive roles** (stable, ~21 total):
- Core runtime capabilities
- Infrastructure operations
- High-level domain actions

**Composite roles** (bundles, ~10-15 total):
- Base access tiers (viewer, operator, editor, auditor)
- Module bundles (mod:ACC:user, mod:ACC:admin, etc.)
- Service bundles (svc:bff, svc:worker)

#### ❌ What DOES NOT Go in Keycloak

**Fine-grained actions** (handled by Runtime policy engine):
- `invoice:approve` (use wf:execute + policy)
- `invoice:post` (use runtime:write + entity-level rules)
- `po:release` (use wf:execute + state machine)
- `gl:journal:create` (use doc:write + module check)

**Entity-level permissions** (handled by Runtime ABAC):
- Ownership checks
- Org/tenant isolation
- Lifecycle state validation
- Attribute-based rules

**UI visibility** (handled by neon-web roles):
- Menu toggles
- Button visibility
- Tab access
- Feature flags

---

### Implementation Blueprint

#### Phase 1: Create Composite Roles (Keycloak Admin Console)

**Clients → athyper-api-runtime → Roles tab**

Create composite roles:

1. `base:viewer` → Add roles: `runtime:read`, `wf:read`, `doc:read`, `content:read`
2. `base:operator` → Add composite: `base:viewer`, Add role: `wf:execute`
3. `base:editor` → Add composite: `base:operator`, Add roles: `runtime:write`, `doc:write`, `content:write`
4. `base:auditor` → Add roles: `runtime:read`, `audit:read`
5. `mod:ACC:user` → Add composite: `base:operator`
6. `mod:ACC:admin` → Add composite: `base:editor`
7. `mod:PAY:user` → Add composite: `base:operator`
8. `mod:PAY:admin` → Add composite: `base:editor`
9. `svc:bff` → Add roles: `runtime:invoke`, `doc:read`, `doc:write`, `doc:sign:url`, `content:read`, `content:sign:url`
10. `svc:worker` → Add roles: `wf:timer:run`, `wf:approval:execute`, `event:publish`, `audit:write`, `outbox:process`

#### Phase 2: Create Groups (Keycloak Admin Console)

**Groups → New**

Create group hierarchy:

```
/org
  /demo_in
    /persona
      /tenant_admin
      /module_admin
      /manager
      /requester
      /viewer
      /reporter
      /agent
    /module
      /ACC
        /user
        /admin
      /PAY
        /user
        /admin
  /demo_us
    /persona
      /manager
      /requester
      /viewer
    /module
      /ACC
        /user
      /PAY
        /user
/svc
  /neon
    /bff
  /athyper
    /runtime-worker
```

#### Phase 3: Assign Roles to Groups

**Groups → [group] → Role mapping tab**

**Client Roles → athyper-api-runtime**

| Group | Assigned Composite Role |
|-------|------------------------|
| `/org/demo_in/persona/manager` | `base:operator` |
| `/org/demo_in/persona/viewer` | `base:viewer` |
| `/org/demo_in/module/ACC/admin` | `mod:ACC:admin` |
| `/org/demo_in/module/PAY/user` | `mod:PAY:user` |
| `/svc/neon/bff` | `svc:bff` |
| `/svc/athyper/runtime-worker` | `svc:worker` |

#### Phase 4: Assign Users to Groups

**Users → [user] → Groups tab**

**Join groups**:
- Select groups from available list
- Click "Join"

**Example**: Accounting manager gets:
- `/org/demo_in/persona/manager`
- `/org/demo_in/module/ACC/admin`

#### Phase 5: Assign Service Accounts to Groups

**Users → service-account-neon-svc-bff → Groups tab**
- Join: `/svc/neon/bff`

**Users → service-account-athyper-svc-runtime-worker → Groups tab**
- Join: `/svc/athyper/runtime-worker`

---

### Validation

#### Test Group → Role Inheritance

**Keycloak Admin Console → Users → [test user] → Role mapping → Effective Roles**

Should show:
- Composite roles from all groups
- Inherited primitive roles

#### Test Token Claims

```bash
# Get user token
TOKEN=$(curl -X POST \
  http://localhost/auth/realms/athyper/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=neon-web" \
  -d "username=test.user@demo.in" \
  -d "password=password" \
  | jq -r .access_token)

# Decode token
echo $TOKEN | jwt decode -

# Verify:
# 1. aud includes "athyper-api-runtime"
# 2. resource_access.athyper-api-runtime.roles contains expected roles
# 3. groups claim includes group paths
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

#### 4.3 Rename Roles ✅ DONE

Roles have been renamed to singular namespaces in both Keycloak and application code:

```
neon:PERSONAS:tenant_admin → neon:PERSONA:tenant_admin   ✅
neon:PERSONAS:module_admin → neon:PERSONA:module_admin   ✅
neon:PERSONAS:manager      → neon:PERSONA:manager        ✅
neon:PERSONAS:requester    → neon:PERSONA:requester      ✅
neon:PERSONAS:viewer       → neon:PERSONA:viewer         ✅
neon:PERSONAS:reporter     → neon:PERSONA:reporter       ✅
neon:PERSONAS:agent        → neon:PERSONA:agent          ✅

neon:MODULES:ACC           → neon:MODULE:ACC             ✅
neon:MODULES:PAY           → neon:MODULE:PAY             ✅
```

Application code updated in:

- `lib/auth/types.ts` — role domains, `parseNeonRole()` with workbench case normalization
- `lib/auth/claims-normalizer.ts` — switch cases
- `lib/auth/auth-context.tsx` — `can()` method
- `app/api/nav/modules/route.ts` — `requiredRole` strings
- `app/api/auth/callback/route.ts` — comments

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

#### 6.1 Update Client IDs ✅ DONE

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

#### 6.2 Update Audience Checks ✅ DONE

Kernel config `clientId` updated from `athyper-api` to `athyper-api-runtime` in all 4 environment files:

- `kernel.config.local.parameter.json`
- `kernel.config.parameter.json`
- `kernel.config.staging.parameter.json`
- `kernel.config.production.parameter.json`

#### 6.3 Role Checks ✅ DONE

All role checks use singular namespaces. The `parseNeonRole()` function in `lib/auth/types.ts`
handles parsing and normalizes workbench values to lowercase (Keycloak `ADMIN` → app `admin`).

```typescript
// lib/auth/types.ts — parseNeonRole() handles all three domains:
//   "neon:WORKBENCH:ADMIN"      → { domain: "WORKBENCH", value: "admin" }
//   "neon:MODULE:ACC"           → { domain: "MODULE",    value: "ACC" }
//   "neon:PERSONA:tenant_admin" → { domain: "PERSONA",  value: "tenant_admin" }

// claims-normalizer.ts uses parseNeonRole() to populate:
//   allowedWorkbenches, modules, personas

// Nav module gating uses singular roles:
//   requiredRole: "neon:MODULE:procurement"
```

#### 6.4 Authorized Party (azp) Validation ✅ DONE

The runtime API validates `azp` against a configurable allowlist instead of a single client ID.
Configuration lives in each realm's `iam.allowedAzp` array in kernel config files.

```typescript
// framework/runtime/src/adapters/http/express.httpServer.ts
// azp is checked against the allowedAzp config array:
const allowedAzp = realmConfig?.iam?.allowedAzp;
if (allowedAzp && allowedAzp.length > 0 && !allowedAzp.includes(azp)) {
    throw new Error(`JWT azp "${azp}" is not in allowedAzp [${allowedAzp.join(", ")}]`);
}

// kernel config (all environments):
// "allowedAzp": ["neon-web", "neon-svc-bff", "athyper-svc-runtime-worker"]
```

Config schema (`config.schema.ts`) includes `allowedAzp` as `z.array(z.string().min(1)).optional()`.

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

## Security Hardening ✅ DONE

Applied 2026-02-18 to both `realm-demosetup.json` and live Keycloak (47/47 sync checks passed).

### P0 — Remove Wildcard Redirect URIs from Service Clients

Service-account clients should never have browser redirect URIs. Wildcard `/*` was removed:

| Client | `redirectUris` | `webOrigins` |
| ------ | -------------- | ------------ |
| `neon-svc-bff` | `[]` | `[]` |
| `athyper-svc-runtime-worker` | `[]` | `[]` |

### P1 — Fix Bearer-Only Contradictions

Bearer-only clients had `standardFlowEnabled: true`, which is contradictory. Fixed:

| Client | `bearerOnly` | `standardFlowEnabled` |
| ------ | ------------ | --------------------- |
| `broker` | `true` | `false` |
| `realm-management` | `true` | `false` |

### P2 — Least-Privilege Token Scope (neon-web)

Set `fullScopeAllowed: false` on `neon-web` with explicit scope mappings for all 13 `neon:*` roles.
This ensures tokens only contain roles that are explicitly mapped, not all realm/client roles.

**Scope-mapped roles** (in `clientScopeMappings.neon-web`):

- 4 workbench: `neon:WORKBENCH:ADMIN`, `USER`, `OPS`, `PARTNER`
- 7 persona: `neon:PERSONA:tenant_admin`, `module_admin`, `manager`, `requester`, `viewer`, `reporter`, `agent`
- 2 module: `neon:MODULE:ACC`, `neon:MODULE:PAY`

### P3 — Refresh Token Revocation

Enabled `revokeRefreshToken: true` at realm level. Each use of a refresh token now invalidates
the previous token, preventing replay of stolen refresh tokens.

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

- [x] Backup current realm export
- [x] Document all service account secrets
- [x] Verify tests pass with current config
- [x] Schedule maintenance window (if needed)

### During Migration (Steps 1–4) ✅ DONE

- [x] Create athyper-api-runtime client with 21 roles
- [x] Create neon-svc-bff client
- [x] Create athyper-svc-runtime-worker client
- [x] Update neon-web (remove empty URI, add audience mapper)
- [x] Rename roles (PERSONAS → PERSONA, MODULES → MODULE)
- [x] Update environment variables
- [x] Update code references (client IDs, audience, roles, azp)
- [x] Apply security hardening (P0–P3)

### Post-Migration

- [x] Test user token claims (verified roles present after fullScopeAllowed:false)
- [x] Verify realm-demosetup.json and live Keycloak in sync (47/47 checks)
- [x] Export updated realm
- [ ] Commit to version control
- [ ] Test full login flow end-to-end (with running app)
- [ ] Test BFF service account calls
- [ ] Test worker service account calls
- [ ] Monitor logs for authorization errors (24-48 hours)
- [ ] After 1-2 weeks: Disable old clients
- [ ] After 4 weeks: Delete old clients

---

**Estimated Time**: 2-4 hours (initial setup — completed)
**Risk Level**: Medium (reversible, but requires coordination)
**Best Practice**: Migrate in dev/staging first, then production
**Last Hardened**: 2026-02-18 (P0–P3 applied)
