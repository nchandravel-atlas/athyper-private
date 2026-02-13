# IAM & RBAC Architecture

## Overview

The platform implements a two-layer authorization model combining **entity-level policies** (from META schema definitions) with **persona-based RBAC** (from the IAM security infrastructure). Field-level security adds a third dimension controlling which columns are visible/writable per role.

## RBAC Model

```
Principal ──→ Role(s) ──→ Persona ──→ Capabilities
     │
     └──→ Group(s) ──→ OU hierarchy
```

### Core Entities (SQL tables)

| Table | Purpose |
|-------|---------|
| `core.principal` | Users, service accounts, system actors |
| `core.role` | Named roles with `persona_code` mapping |
| `core.principal_role` | Role assignments (with optional `expires_at`) |
| `core.principal_group` | Named groups for organizational grouping |
| `core.group_member` | Group membership (principal → group) |
| `core.organizational_unit` | Hierarchical OU tree (parent_id self-ref) |
| `core.persona` | 7 system personas with priority ordering |
| `core.persona_capability` | Capability matrix (persona × operation → allowed) |
| `meta.field_security_policy` | Per-field access rules (role × entity × field) |

### 7 System Personas (priority order)

1. **super_admin** — Full platform access, bypasses all policy checks
2. **admin** — Tenant-wide administration
3. **manager** — Approval workflows, team oversight
4. **power_user** — Advanced data operations
5. **agent** — Standard operational user
6. **viewer** — Read-only access
7. **guest** — Minimal access, public-facing

## Persona Resolution Flow

```
JWT Bearer Token
  └─→ jose: verify signature, iss, aud, exp
  └─→ Defense-in-depth: typ=Bearer, azp=clientId, tenant_key match
  └─→ normalizeClaimsToAuthContext(): extract roles from realm_access + resource_access
  └─→ PersonaCapabilityService.resolveEffectivePersona(roles[])
      └─→ Maps role codes to personas via DB role.persona_code
      └─→ Returns highest-priority persona (lowest priority number wins)
  └─→ AuthContext.effectivePersona = resolved persona
```

This happens on every HTTP request in `express.httpServer.ts` after JWT verification. The persona resolution is best-effort — if the PersonaCapabilityService is not registered, the request proceeds without persona enrichment.

## Two-Layer Authorization

### Layer 1: Entity-Level Policies (META PolicyGate)

Defined in META entity schemas. Evaluated by `PolicyGateService` (in `meta/core/policy-gate.service.ts`). Checked inside `GenericDataAPIService` methods via `this.policyGate.enforce(operation, entityName, ctx)`.

Controls: Can this user perform this operation on this entity type?

### Layer 2: Persona-Based RBAC (Security PolicyGate)

Defined by role → persona → capability matrix. Evaluated by `PolicyGateService` (in `policy-rules/policy-gate.service.ts`). Checked via `MetaDataRbacPolicy` as a route-level `policyToken`.

Controls: Does this user's persona have the capability for this operation?

### Enforcement Point

Both layers are enforced on every Generic Data API request:

```
HTTP Request → Express Router
  └─→ policyToken: MetaDataRbacPolicy.assertAllowed()     ← Layer 2 (RBAC)
      └─→ Resolves PolicyGateService from DI
      └─→ Calls authorizeWithPersona(userId, tenantId, operation, { entityKey })
      └─→ Throws FORBIDDEN on denial → 403
      └─→ Graceful degradation if not registered (allows access)
  └─→ Handler → GenericDataAPIService.list/get/create/...
      └─→ this.policyGate.enforce(operation, entityName, ctx)  ← Layer 1 (Entity)
```

## Field-Level Security

### Architecture

```
FieldAccessService
  ├── IFieldSecurityRepository (DatabaseFieldSecurityRepository)
  │   └── Reads policies from meta.field_security_policy table
  ├── MaskingService
  │   └── 5 strategies: null, redact, hash, partial, remove
  └── Policy cache (TTL-based)
```

### Integration with GenericDataAPI

The `FieldSecurityFilter` structural interface decouples `GenericDataAPIService` from the concrete `FieldAccessService`:

```typescript
interface FieldSecurityFilter {
  filterReadable(entityId, record, subject, context): Promise<FieldFilterResult>;
  filterWritable(entityId, input, subject, context): Promise<FieldFilterResult>;
}
```

**Read path** (`list()`, `get()`):
1. Entity-level field filtering via `policyGate.getAllowedFields()` (existing)
2. Field-level security via `fieldSecurityFilter.filterReadable()` (new)
   - Applies masking strategies to sensitive fields
   - Removes fields the role cannot see

**Write path** (`create()`, `update()`):
1. Field-level security via `fieldSecurityFilter.filterWritable()` (new)
   - Strips fields the role cannot write
2. Schema validation (existing)
3. Dynamic rule validation (existing)

### Field Policy Management

CRUD API at `/api/iam/field-policies`:

```
GET    /api/iam/field-policies        — List policies (filtered by tenant)
POST   /api/iam/field-policies        — Create policy
GET    /api/iam/field-policies/:id    — Get policy by ID
PATCH  /api/iam/field-policies/:id    — Update policy
DELETE /api/iam/field-policies/:id    — Delete policy
```

## DI Tokens

| Token | Service | Location |
|-------|---------|----------|
| `security.policyGate` | PolicyGateService (RBAC) | `policy-rules/policy-gate.service.ts` |
| `security.fieldAccess` | FieldAccessService | `security/field-security/field-access.service.ts` |
| `security.fieldSecurityRepo` | DatabaseFieldSecurityRepository | `security/field-security/field-security.repository.ts` |
| `security.fieldProjection` | FieldProjectionBuilder | `security/field-security/field-projection.ts` |
| `iam.capabilityService` | PersonaCapabilityService | `iam/persona-model/persona-capability.service.ts` |

All registered in the IAM module (`iam.module.ts`) during `register()` phase.

## IAM Admin API

All routes require authentication. Endpoints follow REST conventions.

### Principals
- `GET /api/iam/principals` — List (search, filter by type)
- `GET /api/iam/principals/:id` — Get by ID
- `GET /api/iam/principals/:id/entitlements` — Roles, groups, effective persona
- `GET /api/iam/principals/:id/roles` — Assigned roles
- `GET /api/iam/principals/:id/groups` — Group memberships

### Groups
- `GET /api/iam/groups` — List (with search)
- `POST /api/iam/groups` — Create (name, code required)
- `GET /api/iam/groups/:id` — Get by ID
- `PATCH /api/iam/groups/:id` — Update
- `DELETE /api/iam/groups/:id` — Delete (cascades member removal)
- `GET /api/iam/groups/:id/members` — List members
- `POST /api/iam/groups/:id/members` — Add member
- `DELETE /api/iam/groups/:id/members/:principalId` — Remove member

### Roles
- `GET /api/iam/roles` — List all
- `POST /api/iam/roles` — Create (name, code, persona_code)
- `GET /api/iam/roles/:id` — Get by ID
- `PATCH /api/iam/roles/:id` — Update
- `DELETE /api/iam/roles/:id` — Delete (cascades role binding removal)

### Role Bindings
- `GET /api/iam/role-bindings` — List (filter by principal_id)
- `POST /api/iam/role-bindings` — Create (principal_id, role_id, optional expires_at)
- `GET /api/iam/role-bindings/:id` — Get by ID
- `DELETE /api/iam/role-bindings/:id` — Delete

### Organizational Units
- `GET /api/iam/ous/tree` — Full OU tree
- `POST /api/iam/ous` — Create (name, code, optional parent_id)
- `GET /api/iam/ous/:id` — Get by ID
- `PATCH /api/iam/ous/:id` — Update
- `DELETE /api/iam/ous/:id` — Delete (rejects if children exist)

### Capabilities
- `GET /api/iam/capabilities/matrix` — Full capability matrix
- `GET /api/iam/capabilities/personas` — List personas
- `GET /api/iam/capabilities/check` — Check capability (query: persona, operation)
- `GET /api/iam/capabilities/personas/:code` — Get persona capabilities
