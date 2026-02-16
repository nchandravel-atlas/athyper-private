# Keycloak Naming Conventions

## Pattern: `<product>-<type>-<name>`

### Products
- **neon** - Neon ERP (consumer application)
- **athyper** - Platform services (backend, runtime)
- **mesh** - API Gateway / Infrastructure

### Types
- **web** - Browser-based UI
- **bff** - Backend-for-Frontend
- **api** - Resource server (bearer-only)
- **svc** - Service account (confidential)
- **worker** - Background worker

---

## Client ID Mappings

### Current → Recommended

| Component | Current | ✅ Recommended | Rationale |
|-----------|---------|---------------|-----------|
| **UI Login** | `neon-web` | `neon-web` | Keep (already follows pattern) |
| **BFF System** | `svc-neon-server` | `neon-svc-bff` | Product-first, clearer purpose |
| **Runtime Worker** | `svc-runtime-worker` | `athyper-svc-runtime-worker` | Platform-scoped (not Neon-specific) |
| **Runtime API** | `runtime-api` | `athyper-api-runtime` | Platform-scoped, type-first |

### Complete Client Architecture

```
Product: neon (Application Clients)
├── neon-web                    Public (PKCE)       UI authentication
└── neon-svc-bff                Confidential        BFF system calls

Product: athyper (Platform Clients)
├── athyper-api-runtime         Bearer-only         Runtime REST API
├── athyper-svc-runtime-worker  Confidential        Background workers
├── athyper-svc-content         Confidential        Content service
├── athyper-svc-notification    Confidential        Notification service
└── athyper-svc-audit           Confidential        Audit service

Product: mesh (Infrastructure - Future)
├── mesh-api-gateway            Bearer-only         API Gateway validation
└── mesh-svc-router             Confidential        Internal routing
```

---

## Role Naming Conventions

### 1. UI Roles (Client: neon-web)

**Current:**
```
neon:WORKBENCH:ADMIN
neon:PERSONAS:tenant_admin
neon:MODULES:ACC
```

**Recommended (Consistent Singular):**
```
neon:WORKBENCH:ADMIN
neon:WORKBENCH:USER
neon:WORKBENCH:OPS
neon:WORKBENCH:PARTNER

neon:PERSONA:tenant_admin      # Singular
neon:PERSONA:module_admin
neon:PERSONA:manager
neon:PERSONA:viewer
neon:PERSONA:reporter
neon:PERSONA:requester
neon:PERSONA:agent

neon:MODULE:ACC                # Singular
neon:MODULE:PAY
neon:MODULE:WF
neon:MODULE:DOC
```

**Pattern**: `neon:<NAMESPACE>:<ROLE>`
- NAMESPACE: WORKBENCH | PERSONA | MODULE (singular, uppercase)
- ROLE: lowercase_snake_case or UPPERCASE (depending on namespace)

### 2. Runtime API Roles (Client: athyper-api-runtime)

**Purpose**: Service/API permissions (not UI personas)

```
# Core Runtime
runtime:read
runtime:write
runtime:admin
runtime:invoke

# Workflow
wf:read
wf:execute
wf:timer:run
wf:approval:execute

# Document
doc:read
doc:write
doc:sign:url

# Content
content:read
content:write
content:overlay:apply
content:sign:url

# Audit
audit:read
audit:write

# Event
event:read
event:publish

# Outbox
outbox:read
outbox:process
```

**Pattern**: `<domain>:<action>` or `<domain>:<subdomain>:<action>`
- domain: runtime | wf | doc | content | audit | event | outbox
- action: read | write | execute | run | publish | process

### 3. Service Account Roles (Clients: *-svc-*)

**Assigned to**: neon-svc-bff, athyper-svc-runtime-worker

**From athyper-api-runtime client roles:**

**neon-svc-bff** (BFF system calls):
```
# Assigned from athyper-api-runtime:
runtime:invoke
doc:read
doc:write
content:read
content:sign:url
```

**athyper-svc-runtime-worker** (Background jobs):
```
# Assigned from athyper-api-runtime:
wf:timer:run
event:publish
audit:write
outbox:process
```

**Pattern**: No `svc:` prefix needed - these are normal API roles

---

## Group Naming Conventions

### Structure: `/<product>/<namespace>/<role>`

### 1. Neon UI Groups

```
/neon
├── /neon/workbench
│   ├── /neon/workbench/admin
│   ├── /neon/workbench/user
│   ├── /neon/workbench/ops
│   └── /neon/workbench/partner
├── /neon/persona
│   ├── /neon/persona/tenant_admin
│   ├── /neon/persona/module_admin
│   ├── /neon/persona/manager
│   ├── /neon/persona/viewer
│   ├── /neon/persona/reporter
│   ├── /neon/persona/requester
│   └── /neon/persona/agent
└── /neon/module
    ├── /neon/module/acc
    ├── /neon/module/pay
    ├── /neon/module/wf
    └── /neon/module/doc
```

### 2. Service Account Groups (Optional)

```
/svc
├── /svc/neon
│   └── /svc/neon/bff
└── /svc/runtime
    ├── /svc/runtime/worker
    ├── /svc/runtime/content
    └── /svc/runtime/audit
```

**Usage**: Organize service accounts for easier role assignment

---

## Organization Naming (Already Good)

**Current (Keep)**:
```
demo_ca - Canada
demo_ch - Switzerland
demo_de - Germany
demo_fr - France
demo_in - India
demo_my - Malaysia
demo_qa - Qatar
demo_sa - Saudi Arabia
demo_us - USA
```

**Pattern**: `<env>_<country_code>`
- env: demo | dev | staging | prod
- country_code: ISO 3166-1 alpha-2 (lowercase)

---

## Scope Naming (Client Scopes)

**Pattern**: `<product>:<feature>` or `<product>:<namespace>`

```
# Product-specific scopes
neon:workbench
neon:persona
neon:module

# Platform scopes
athyper:runtime
athyper:workflow
athyper:document
athyper:audit

# Standard OIDC scopes (keep as-is)
openid
profile
email
roles
offline_access
```

---

## Examples: Complete Configuration

### Example 1: UI User with Roles

**User**: john.doe@example.com
**Organization**: demo_my (Malaysia)
**Groups**:
- `/neon/workbench/user`
- `/neon/persona/requester`
- `/neon/module/acc`

**Token from neon-web**:
```json
{
  "aud": ["neon-web", "athyper-api-runtime"],
  "azp": "neon-web",
  "sub": "user-uuid",
  "preferred_username": "john.doe@example.com",
  "organization": ["demo_my"],
  "resource_access": {
    "neon-web": {
      "roles": [
        "neon:WORKBENCH:USER",
        "neon:PERSONA:requester",
        "neon:MODULE:ACC"
      ]
    }
  }
}
```

### Example 2: BFF Service Account

**Client**: neon-svc-bff
**Purpose**: BFF system operations
**Roles** (from athyper-api-runtime):
- `runtime:invoke`
- `doc:read`
- `doc:write`

**Token**:
```json
{
  "aud": ["athyper-api-runtime"],
  "azp": "neon-svc-bff",
  "sub": "service-account-neon-svc-bff",
  "clientId": "neon-svc-bff",
  "resource_access": {
    "athyper-api-runtime": {
      "roles": [
        "runtime:invoke",
        "doc:read",
        "doc:write"
      ]
    }
  }
}
```

### Example 3: Background Worker

**Client**: athyper-svc-runtime-worker
**Purpose**: Workflow timers, event processing
**Roles** (from athyper-api-runtime):
- `wf:timer:run`
- `event:publish`
- `audit:write`

**Token**:
```json
{
  "aud": ["athyper-api-runtime"],
  "azp": "athyper-svc-runtime-worker",
  "sub": "service-account-athyper-svc-runtime-worker",
  "clientId": "athyper-svc-runtime-worker",
  "resource_access": {
    "athyper-api-runtime": {
      "roles": [
        "wf:timer:run",
        "event:publish",
        "audit:write"
      ]
    }
  }
}
```

---

## Migration Checklist

### Phase 1: Rename Clients
- [ ] `svc-neon-server` → `neon-svc-bff`
- [ ] `svc-runtime-worker` → `athyper-svc-runtime-worker`
- [ ] `runtime-api` → `athyper-api-runtime`
- [ ] Keep `neon-web` as-is ✅

### Phase 2: Update Roles
- [ ] Rename `neon:PERSONAS:*` → `neon:PERSONA:*` (singular)
- [ ] Rename `neon:MODULES:*` → `neon:MODULE:*` (singular)
- [ ] Create runtime API roles on `athyper-api-runtime`
- [ ] Migrate service account roles

### Phase 3: Create Groups
- [ ] Create `/neon/workbench/*` groups
- [ ] Create `/neon/persona/*` groups
- [ ] Create `/neon/module/*` groups
- [ ] Assign users to groups

### Phase 4: Update Code
- [ ] Update client ID references in code
- [ ] Update role checks in authorization middleware
- [ ] Update environment variables

### Phase 5: Export & Version Control
- [ ] Export updated realm
- [ ] Commit to version control
- [ ] Update documentation

---

## Quick Reference

### Client ID Patterns
```
<product>-<type>-<name>

Examples:
✅ neon-web
✅ neon-svc-bff
✅ athyper-api-runtime
✅ athyper-svc-runtime-worker
✅ mesh-api-gateway

❌ svc-neon-server        (type before product)
❌ runtime-api            (missing product)
❌ neon_web               (use dash not underscore)
```

### Role Patterns
```
UI Roles:        neon:<NAMESPACE>:<role>
API Roles:       <domain>:<action> or <domain>:<subdomain>:<action>

Examples:
✅ neon:WORKBENCH:ADMIN
✅ neon:PERSONA:manager
✅ neon:MODULE:ACC
✅ runtime:invoke
✅ wf:timer:run
✅ content:sign:url

❌ NEON_WORKBENCH_ADMIN   (use colon separator)
❌ neonWorkbenchAdmin     (use colon separator)
❌ svc:runtime:invoke     (no svc prefix for API roles)
```

### Group Patterns
```
/<product>/<namespace>/<role>

Examples:
✅ /neon/workbench/admin
✅ /neon/persona/manager
✅ /neon/module/acc
✅ /svc/neon/bff
✅ /svc/runtime/worker

❌ /NEON/WORKBENCH/ADMIN  (lowercase paths)
❌ neon-workbench-admin   (use slash separator)
```

---

**Last Updated**: 2026-02-16
**Status**: Approved Convention
**Next**: Implement Phase 1 (Rename Clients)
