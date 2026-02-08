# Keycloak IAM Setup — Workbench Authorization

This runbook covers the Keycloak configuration needed for the unified workbench switcher and role-based navigation/action gating.

## Prerequisites

- Keycloak admin access to the `neon-dev` realm (or target realm)
- The `neon-web` client already exists (created during initial auth setup)

---

## 1. Client Roles on `neon-web`

Navigate to: **Clients → neon-web → Roles**

Create the following client roles:

### Workbench Access Roles

| Role | Description |
|------|-------------|
| `wb:admin` | Access to Admin Workbench |
| `wb:partner` | Access to Partner Workbench |
| `wb:user` | Access to User Workbench |
| `wb:analytics` | Access to Analytics Workbench (read-only) |

### Module Permission Roles

| Role | Description |
|------|-------------|
| `module:dashboard:view` | View dashboards |
| `module:dashboard:edit` | Create/edit dashboards |
| `module:dashboard:admin` | Manage all dashboards |
| `module:supplier:view` | View suppliers |
| `module:supplier:edit` | Create/edit suppliers |
| `module:supplier:approve` | Approve supplier changes |
| `module:supplier:admin` | Full supplier management |
| `module:purchaseorder:view` | View purchase orders |
| `module:purchaseorder:edit` | Create/edit purchase orders |
| `module:purchaseorder:approve` | Approve purchase orders |
| `module:purchaseorder:admin` | Full PO management |

---

## 2. Groups for Data Restriction

Navigate to: **Groups**

Create groups following this hierarchy:

```
/branches
  /branches/HQ
  /branches/North
  /branches/South
  /branches/East

/costCenters
  /costCenters/CC100
  /costCenters/CC200
  /costCenters/CC300
```

Users assigned to these groups will have their data visibility restricted to matching branches/cost centers. Users with no group assignments see all data (unrestricted).

---

## 3. Token Mapper: Groups

Navigate to: **Client Scopes → (create or edit a scope assigned to neon-web) → Mappers**

Create a new mapper:

| Field | Value |
|-------|-------|
| Name | `groups` |
| Mapper Type | Group Membership |
| Token Claim Name | `groups` |
| Full group path | ON |
| Add to ID token | ON |
| Add to access token | ON |
| Add to userinfo | ON |

This ensures the `groups` claim appears in the JWT with paths like `["/branches/HQ", "/costCenters/CC100"]`.

---

## 4. Token Mapper: Tenant ID

Navigate to: **Client Scopes → (same scope) → Mappers**

Create a new mapper:

| Field | Value |
|-------|-------|
| Name | `tenant_id` |
| Mapper Type | Hardcoded claim |
| Token Claim Name | `tenant_id` |
| Claim value | `default` (or tenant-specific value) |
| Claim JSON type | String |
| Add to ID token | ON |
| Add to access token | ON |
| Add to userinfo | ON |

For multi-tenant deployments, use a User Attribute mapper instead, mapping the `tenant_id` user attribute to the claim.

---

## 5. Test Users

Create the following users for testing:

### admin-user
- **Realm roles:** `admin`
- **Client roles (neon-web):** `wb:admin`, `wb:user`, `wb:analytics`, `module:dashboard:admin`, `module:supplier:admin`, `module:purchaseorder:admin`
- **Groups:** (none — unrestricted)

### partner-user
- **Realm roles:** `user`
- **Client roles (neon-web):** `wb:partner`, `module:dashboard:view`
- **Groups:** `/branches/North`

### restricted-user
- **Realm roles:** `user`
- **Client roles (neon-web):** `wb:user`, `module:dashboard:view`
- **Groups:** `/branches/HQ`, `/costCenters/CC100`

### analytics-user
- **Realm roles:** `user`
- **Client roles (neon-web):** `wb:analytics`, `module:dashboard:view`
- **Groups:** (none — unrestricted)

### no-roles-user (backward compat test)
- **Realm roles:** `admin`
- **Client roles (neon-web):** (none)
- **Groups:** (none)
- **Expected behavior:** Fallback — `admin` realm role grants full access to all workbenches

---

## 6. Verification

After configuration, log in as each test user and verify:

1. **admin-user:** Sees Admin + User + Analytics workbenches in switcher. All modules visible. Full edit access.
2. **partner-user:** Sees only Partner workbench. Only dashboard + orders modules visible. Data restricted to North branch.
3. **restricted-user:** Sees only User workbench. Only dashboard + tasks modules visible. Data restricted to HQ branch and CC100 cost center.
4. **analytics-user:** Sees only Analytics workbench. Dashboards are read-only (no edit/create buttons).
5. **no-roles-user:** Sees all workbenches (backward compat fallback from `admin` realm role). All modules visible.

---

## Backward Compatibility

The application's claims normalizer (`lib/auth/claims-normalizer.ts`) handles the case where no client roles are configured:

- If `resource_access["neon-web"].roles` is empty/absent, it falls back to deriving access from `realm_access.roles`:
  - `admin` realm role → all workbenches + all module permissions
  - `partner` realm role → partner + user workbenches
  - Otherwise → user workbench only

This means the app works correctly even before this Keycloak configuration is applied.
