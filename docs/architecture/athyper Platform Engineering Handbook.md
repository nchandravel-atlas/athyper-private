# athyper Developer Handbook (Engineers • Architects • Developers)
## athyper Framework Runtime + Mesh Network Infra + NeonUI Monorepo

**Version:** 1.0  
**Status:** athyper Framework Engineering Handbook  
**Applies To:** `athyper` monorepo (NeonUI + Framework + Mesh)  
**Audience:** Platform Engineers, Backend Engineers, Frontend Engineers, DevOps/SRE, Architects

---

## Table of Contents

1. Purpose and Scope  
2. athyper Architecture at a Glance  
3. Repository Layout and Package Boundaries  
4. Mesh Network Infrastructure (Runtime Platform)  
5. Identity & Access (Keycloak)  
6. Data Platform (Postgres + PgBouncer + Prisma + Kysely)  
7. Observability (Alloy + Prometheus + Tempo + Loki + Grafana)  
8. NeonUI (Next.js) and Workbench Composition  
9. athyper Framework: Core vs Runtime vs Adapters  
10. Module Catalog (Foundation → ERP)  
11. Engineering Conventions (Naming, Modules, DTOs, Domain)  
12. Dependency Rules (Hard Boundaries)  
13. Local Development (Developer Setup)  
14. Environments (localdev / staging / prod)  
15. CI/CD (Build, Lint, Test, Migrations)  
16. Operations Runbook (Start/Stop/Logs/Backups)  
17. Security Baseline  
18. Troubleshooting Guide  
19. Appendices (Templates)

---

## 1) Purpose and Scope

athyper is a **multi-tenant Business Operating Network Platform** built on:

- **Mesh Network Infrastructure** (gateway, IAM, cache, storage, observability, DB, pooler)
- **NeonUI monorepo** (Next.js UI + shared packages + workbenches)
- **athyper Framework** (meta-driven runtime, services/modules, API + jobs + middlewares)

This handbook defines the **engineering model**: how we structure code, enforce boundaries, deploy, observe, and operate the system.

---

## 2) Framework Architecture at a Glance

### Request Flow (Simplified)

```
Client → Gateway → NeonUI (Next.js) → Auth (IAM) → Runtime/API → DB (dbPool → DB)
                                        │
                                        └─ Telemetry → OTel (Alloy) → Monitoring / Tracing / Logging → observability
```

### Three-Layer Model

1. **Presentation**: NeonUI (Next.js + workbenches)
2. **Application Runtime**: athyper Runtime (REST/GraphQL, jobs, services, policies, workflows)
3. **Platform / Infra**: Mesh (Gateway, IAM, Memory Cache, ObjectStorage, Telemetry, Database)

---

## 3) Repository Layout and Package Boundaries

This handbook assumes the following top-level structure:

```
ATHYPER
├─ docs/
├─ framework/
│  ├─ adapters/
│  ├─ core/
│  └─ runtime/
├─ mesh/
├─ packages/
├─ products/
├─ tooling/
└─ tools/
```

### Key Concepts

- `mesh/` is **Network Platform infra** (compose + config + scripts)
- `framework/` is the **athyper engine** (core + runtime + adapters)
- `packages/` are **shared libraries** (auth/theme/ui/workbenches)
- `products/` are **product bundles** (athyper-business, athyper-neon, athyper-mesh)
- `tooling/` is **governance** (eslint-config, tsconfig)
- `tools/` are **devtools/cli/migrator/seeders**

---

## 4) Mesh Network Infrastructure (Runtime Platform)

### Network Infra Images

| Layer | Image | Purpose |
|------|------|---------|
| Gateway | `traefik:v3.6.7` | Ingress, TLS, routing, gateway policies |
| IAM | `quay.io/keycloak/keycloak:26.5.1` | OIDC / SSO, realms, roles, groups |
| Memory Cache | `redis:7.4.7-alpine` | Low-latency shared cache |
| Cache Exporter | `oliver006/redis_exporter:v1.80.1` | Redis metrics to Prometheus |
| Object Storage | `minio/minio:RELEASE.2025-09-07T16-13-09Z` | S3-compatible tenant storage |
| Logging | `grafana/loki:3.6.3` | Log aggregation |
| Telemetry Shipper | `grafana/alloy:v1.12.2` | OTel collector (logs/metrics/traces) |
| Metrics | `prom/prometheus:v3.9.1` | Metrics collection + alerting |
| Tracing | `grafana/tempo:2.9.0` | Distributed tracing |
| Dashboards | `grafana/grafana:12.3.1` | Unified observability UI |

### Mesh Folder Model (Canonical)

```
mesh/
├─ compose/
│  ├─ compose.yml
│  ├─ docker/
│  ├─ mesh.base.yml
│  ├─ mesh.override.localdev.yml
│  ├─ mesh.override.staging.yml
│  ├─ gateway/ iam/ memorycache/ objectstorage/ telemetry/
│  └─ apps/mesh-athyper.yml
├─ config/
│  ├─ db/ (postgres configs)
│  ├─ dbpool/ (pgbouncer configs)
│  ├─ gateway/ (certs + dynamic config)
│  ├─ iam/ (realm export + themes)
│  ├─ memorycache/
│  ├─ objectstorage/
│  └─ telemetry/ (alloy + datasources + dashboards)
├─ env/ (.env + examples)
└─ scripts/ (up/down/logs/init-data/certs/backup-restore)
```

### Mesh Compose Principles

- **Base compose** contains shared infra definitions.
- Overrides provide environment-specific values:
  - `mesh.override.localdev.yml`
  - `mesh.override.staging.yml`
  - `mesh.override.yml` (generic override, optional)

---

## 5) Identity & Access

### IAM Strategy

- **Realm-per-tenant** (recommended for strict isolation)
- A **platform realm** may exist for shared trust / federation (optional advanced)
- **Service accounts** for internal runtime and automation
- **Role catalogs** and **group mappings** implement entitlements

### Core Responsibilities

- Authentication (OIDC login, refresh tokens)
- Authorization (roles + groups)
- Tenant context identification (realm + OU rules)
- Token exchange (for cross-tenant mesh-network scenarios)

### Practical Guidance

- Keep realm JSON exports under:
  ```
  mesh/config/iam/realm-export.json
  ```
- Keep NeonUI auth helpers under:
  ```
  packages/auth/src/keycloak.ts
  packages/auth/src/session.ts
  ```

---

## 6) Data Platform (Postgres + PgBouncer + Prisma + Kysely)

### Canonical Hybrid Access Model

- **Prisma** owns schema + migrations (DX + governance)
- **Kysely** handles runtime queries (speed + typed SQL)
- **PgBouncer** protects Postgres from connection storms

### Where Code Lives Today (Canonical)

**Prisma & migrations:**
```
framework/adapters/db/prisma/schema.prisma
framework/adapters/db/migrations/
framework/adapters/db/sql/
```

**Kysely runtime:**
```
framework/adapters/db/kysely/
  db.ts
  dialect.ts
  pool.ts
  tx.ts
```

**DB types & schema-mapping:**
```
framework/adapters/db/types/
framework/adapters/db/types/schemas/
  core.ts cus.ts ent.ts int.ts meta.ts ref.ts
```

### Recommended Rules

- Prisma:
  - **DDL only** (migrations, schema evolution)
  - Do not embed business logic in migrations
- Kysely:
  - Runtime queries must be:
    - tenant-aware
    - transaction-safe
    - pool-safe

---

## 7) Observability (Alloy + Prometheus + Tempo + Loki + Grafana)

### Canonical OTel Pipeline

```
App logs/metrics/traces → OTel SDK → Alloy → Loki/Tempo/Prometheus → Grafana
```

### Mesh Config Paths (Canonical)

```
mesh/config/telemetry/logging/alloy.alloy
mesh/config/telemetry/metrics/config.yml
mesh/config/telemetry/tracing/config.yml
mesh/config/telemetry/provisioning/datasources/datasources.yml
```

### Application Conventions

Every service must emit:

- **Correlation ID** (request id)
- **Tenant ID** (realm/tenant identifier)
- **Module code** (CORE, META, INT, etc.)
- **Latency metrics**
- **Error counters**
- **Trace spans** around IO boundaries

---

## 8) NeonUI (Next.js) and Workbench Composition

### Where NeonUI Lives

You have two “shapes”:

1) Shared packages:
```
packages/theme
packages/ui
packages/auth
packages/workbench-*
```

2) Product-level Next.js app:
```
products/athyper-neon/apps/web
```

### Workbenches

- `packages/workbench-admin`
- `packages/workbench-partner`
- `packages/workbench-user`

These packages should remain **UI-only**: routing, components, view models, API client calls.

### Key NeonUI Rules

- UI must not call Postgres / Redis directly.
- UI must not import Prisma.
- Auth flows via Keycloak helpers only.
- DTO validation via Zod at boundaries.

---

## 9) athyper Framework: Core vs Runtime vs Adapters

athyper Framework is intentionally separated:

### 9.1 `framework/core` (PURE domain core)

Purpose:
- meta engine
- policy and lifecycle primitives
- registries and loaders
- common abstractions (no infra coupling)

### 9.2 `framework/runtime` (EXECUTION)

Purpose:
- API runtime (REST/GraphQL)
- jobs/queues/schedulers/workers
- middlewares (authn/authz/tenant/rate-limit/logging)
- kernel bootstrap + DI container
- runtime services registry

Key runtime areas:
```
framework/runtime/api/
framework/runtime/jobs/
framework/runtime/kernel/
framework/runtime/middlewares/
framework/runtime/services/
```

### 9.3 `framework/adapters` (INFRA integration)

Purpose:
- DB adapter (prisma + kysely)
- auth adapter
- memorycache adapter
- objectstorage adapter
- telemetry adapter

Adapters represent the **edge** of the system.

---

## 10) Module Catalog (Foundation → ERP)

This module catalog is used for:
- entitlement catalog
- packaging
- pricing tiers (Base / Professional / Enterprise)
- dependency graph

### 10.1 Platform Runtime

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Platform Runtime | Foundation Runtime | CORE | – | Yes | Base | Meta-driven runtime engine for entities, persistence, access control, lifecycle |
| Platform Runtime | Metadata Studio | META | CORE | Yes | Base | Declarative config of fields, scripts, policies, validations, extensions |
| Platform Runtime | Identity & Access Management | IAM | CORE | Yes | Base | OIDC, SSO, RBAC, policy enforcement, token services |
| Platform Runtime | Audit & Governance | AUDIT | CORE | Yes | Base | Immutable audit trails, activity timelines, compliance reporting |
| Platform Runtime | Policy & Rules Engine | POLICY | CORE | Yes | Base | Rules, validations, decision tables |
| Platform Runtime | Workflow Engine | WF | CORE | Yes | Base | Approval workflows, transitions, state machines |
| Platform Runtime | Automation & Jobs | SCHED | CORE | Yes | Base | Schedulers, triggers, background execution |

### 10.2 Platform Services

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Platform Services | Document Services | DOC | CORE | Yes | Base | HTML/PDF generation, templates, outputs |
| Platform Services | Notification Services | NOTIFY | CORE, DOC | Yes | Base | Email delivery, templates, alerts |
| Platform Services | Voice & Channel Integrations | TEL | CORE | Yes | Enterprise | CTI integration, call logging, external channels |
| Platform Services | Integration Hub | INT | CORE | Yes | Base | API/Webhooks/Auth/Rate-limit/Event gateway + runtime |
| Platform Services | Integration Enterprise Connectors | CNX | INT | Yes | Enterprise | Prebuilt ERP connectors (SAP/Ariba/legacy) |

### 10.3 Enterprise Services

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Enterprise Services | Content Services | CONTENT | CORE | Yes | Base | Secure document storage, entity-linked content |
| Enterprise Services | Activity & Commentary | COLLAB | CORE | Yes | Base | Threaded comments, mentions, record timelines |
| Enterprise Services | In-App Messaging | COMM | CORE | Yes | Professional | Messaging, collaboration inbox |
| Enterprise Services | Delegation & Sharing | SHARE | CORE | Yes | Professional | Controlled sharing, delegation, temp access |
| Enterprise Services | Regulatory Compliance | REG | CORE, POLICY, AUDIT | Yes | Enterprise | Country-specific statutory / tax / regulatory |

### 10.4 Reference & Master Data

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Ref & Master Data | Global Reference Data | REF | CORE | Shared | Base | Countries, currencies, timezones |
| Ref & Master Data | Relationship Management | REL | CORE | Yes | Base | People/orgs/business relationships |
| Ref & Master Data | Master Data Governance | MDG | CORE, WF, AUDIT | Yes | Professional | Master data workflows + governance |

### 10.5 Analytics & Intelligence

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Analytics & Intelligence | Applied Intelligence | AI | CORE | Yes | Enterprise | AI/ML inference, copilots, recommendations |
| Analytics & Intelligence | Insights & Analytics | INSIGHTS | CORE | Yes | Enterprise | Reports, dashboards, KPIs across domains |

### 10.6 Experience (Neon UI)

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Experience (Neon UI) | User Workbench | USERWB | CORE | Yes | Base | Internal interface for operational users |
| Experience (Neon UI) | Admin Workbench | ADMINWB | CORE | Yes | Base | Admin console |
| Experience (Neon UI) | Partner Workbench | PARTNERWB | CORE | Yes | Professional | Partner portal (suppliers/customers/logistics/banks/subcontractors) |
| Experience (Neon UI) | Service Manager Workbench | SERVICEMANAGERWB | CORE | Yes | Base | Production admin + product support |
| Experience (Neon UI) | Public Web Experience | PUBLICUX | CORE | Yes | Enterprise | Anonymous pages/forms/landing sites |

### 10.7 Business Module (Finance)

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Business Platform - Finance | Finance (Core Accounting) | ACC | CORE | Yes | Base | GL, AP, AR, fiscal controls |
| Business Platform - Finance | Payment Processing | PAY | ACC | Yes | Base | Collections, disbursements, reconciliation |
| Business Platform - Finance | Treasury & Cash | TREASURY | ACC, PAY | Yes | Base | Cash positioning, liquidity, bank reconciliation |
| Business Platform - Finance | Budget & Funds Control | BUDGET | ACC, WF, MDG | Yes | Enterprise | Budget planning, commitment control, availability checks |
| Business Platform - Finance | Payment Gateways | PAYG | PAY | Yes | Professional | Stripe and external payments |

### 10.8 Business Module (Customer + Supply Chain + Ops)

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Business Platform - Customer | CRM | CRM | REL | Yes | Base | Leads, opportunities, pipeline |
| Business Platform - Supply Chain | Supplier Relationship Mgmt | SRM | REL, WF, AUDIT | Yes | Base | Supplier lifecycle & performance |
| Business Platform - Supply Chain | Sourcing | SOURCE | REL, WF, DOC, NOTIFY | Yes | Base | RFQs, bids, vendor selection |
| Business Platform - Supply Chain | Contract Mgmt | CONTRACT | REL, WF, DOC, NOTIFY | Yes | Base | Contracts, terms, obligations |
| Business Platform - Supply Chain | Buying | BUY | CORE, REL | Yes | Base | Purchasing, requisitions, POs |
| Business Platform - Customer | Selling | SALE | CORE, REL | Yes | Base | Orders, invoicing |
| Business Platform - Supply Chain | Inventory | INVENTORY | CORE, REL, ACC | Yes | Base | Valuation, movements |
| Business Platform - Supply Chain | Quality | QMS | INVENTORY | Yes | Base | Inspections, QC |
| Business Platform - Supply Chain | Subcontracting | SUBCON | BUY, INVENTORY | Yes | Base | Job subcontract workflows |
| Business Platform - Supply Chain | Demand Planning | DEMAND | INVENTORY, SALE, AI | Yes | Enterprise | Forecasting + planning scenarios |
| Business Platform - Supply Chain | Warehouse | WMS | INVENTORY | Yes | Enterprise | Putaway/pick/pack, RFID/barcode |
| Business Platform - Supply Chain | Logistics | LOGISTICS | WMS, INVENTORY | Yes | Enterprise | Shipments, carriers, freight, tracking |
| Business Platform - Manufacturing & Ops | Maintenance | MAINT | BUY, ASSET, INVENTORY | Yes | Base | Preventive & corrective maintenance |
| Business Platform - Manufacturing & Ops | Manufacturing | MFG | INVENTORY, MDG | Yes | Base | BOMs, work orders, MRP |

### 10.9 Business Module (Assets + People + Projects + ITSM)

| Athyper Framework Layer | Module Name | Code | Depends On | Tenant Scoped | Subscription | Description |
|---|---|---:|---|:---:|---|---|
| Business Platform - Asset Mgmt | Asset Management | ASSET | CORE, ACC, MDG, AUDIT | Yes | Enterprise | Asset lifecycle, depreciation |
| Business Platform - Asset Mgmt | Real Estate Asset Mgmt | ASSETREMS | ASSET, ACC, CONTRACT | Yes | Enterprise | Lease, tenancy, rental billing, CAM |
| Business Platform - Asset Mgmt | Facility Mgmt | ASSETFM | ASSET, MAINT | Yes | Base | Buildings, utilities, space, cost centers |
| Business Platform - People | Human Resources | HR | CORE, REL | Yes | Base | Employee lifecycle, org structure |
| Business Platform - People | Payroll | PAYROLL | HR, ACC, REG | Yes | Base | Salaries, statutory compliance |
| Business Platform - Projects | Project Costing | PRJCOST | ACC, BUDGET | Yes | Base | WBS, budgets, cost tracking, revenue recognition |
| Business Platform - ITSM | Support & Service Mgmt | ITSM | CORE, WF, ASSET, NOTIFY, AUDIT | Yes | Base | Tickets, SLAs, service workflows |

---

## 11) Engineering Conventions (How We Build Modules)

### 11.1 Module Folder Template (Canonical)

Canonical module template:

```
<module>/
├─ index.ts
├─ module.json
├─ adapters/
├─ api/
├─ domain/
├─ jobs/
├─ observability/
└─ persistence/
```

**Meaning:**
- `domain/`: aggregate roots, policies, domain events, invariants
- `api/`: REST/GraphQL controllers + DTOs + routes
- `persistence/`: repositories, data mappers, query abstractions
- `adapters/`: integrations (external APIs, storage, queues) for this module
- `jobs/`: background processors, schedules, workers
- `observability/`: module-specific metrics/loggers/tracing helpers

### 11.2 module.json (Recommended Fields)

```json
{
  "code": "ACC",
  "name": "Finance (Core Accounting)",
  "layer": "athyper Business Platform - Finance",
  "dependsOn": ["CORE"],
  "tenantScoped": true,
  "subscription": "Base",
  "routes": ["/api/finance/*"],
  "features": ["gl", "ap", "ar"],
  "owners": ["platform-team"],
  "status": "active"
}
```

### 11.3 API Conventions

- REST controllers under:
  - `framework/runtime/api/rest/controllers`
  - module-specific under: `<module>/api/controllers`
- DTOs under:
  - `framework/runtime/api/rest/dtos`
- Validation:
  - Zod schemas (preferred)
- Errors:
  - typed error codes, never raw strings

### 11.4 Domain Conventions

- Domain code must be side-effect free.
- Domain emits events; runtime handles integration side effects.
- Prefer:
  - `Policy` objects for rules
  - `Service` objects for orchestration
  - `Aggregate` objects for invariants

---

## 12) Dependency Rules (Hard Boundaries)

### 12.1 Allowed Imports (Guideline)

```
framework/core      → (nothing infra)
framework/runtime   → core + adapters (through interfaces)
framework/adapters  → external libs (db/auth/cache/storage/telemetry)
NeonUI              → auth/env/api-client/ui/theme
```

### 12.2 Forbidden Imports (Examples)

- UI importing Prisma / Postgres / Redis directly ❌
- Core importing runtime/adapters ❌
- Domain importing framework/runtime APIs ❌
- Cross-module importing internals directly ❌  
  (use module public exports or service interfaces)

### 12.3 Enforcement

- `tooling/eslint-config` should enforce:
  - workspace boundaries
  - no deep imports
  - module code ownership

---

## 13) Local Development (Day-1 Setup)

### 13.1 Start Mesh Infra

From repo root:

```
mesh/scripts/up.bat
# or
mesh/scripts/up.sh
```

### 13.2 Tail Logs

```
mesh/scripts/logs.bat
# or
mesh/scripts/logs.sh
```

### 13.3 Stop Mesh

```
mesh/scripts/down.bat
# or
mesh/scripts/down.sh
```

### 13.4 Run Apps

- Install dependencies:
  ```
  pnpm install
  ```
- Run dev:
  ```
  pnpm dev
  ```
- Or:
  ```
  turbo run dev
  ```

---

## 14) Environments (localdev / staging / prod)

Environment templates exist under:

```
mesh/env/.env.example
mesh/env/localdev.env.example
mesh/env/staging.env.example
```

Rules:
- Never commit secrets
- Keep env schemas in a single source-of-truth (env validation)
- Every deploy must validate required env at boot (fail-fast)

---

## 15) CI/CD (Build, Lint, Test, Migrations)

### 15.1 Build Pipeline (Canonical)

1) `turbo run lint`  
2) `turbo run test`  
3) `turbo run build`  
4) run migrations (Prisma)  
5) deploy stateless artifacts  
6) smoke tests + rollback gates  

### 15.2 Migrations

- Migrations are owned by the DB schema package / adapter:
  - `framework/adapters/db/prisma/`
  - `framework/adapters/db/migrations/`

Rule:
- Migrations must be reversible where possible.
- Data migrations must be explicit and tested.

---

## 16) Operations Runbook (Start/Stop/Logs/Backups)

### 16.1 Mesh Scripts (Canonical)

```
mesh/scripts/up.*
mesh/scripts/down.*
mesh/scripts/logs.*
mesh/scripts/init-data.*
mesh/scripts/generate-mesh-certs.*
mesh/scripts/backup-restore/
```

### 16.2 Backup / Restore (Guideline)

- Postgres:
  - logical backups + encrypted store (MinIO or offsite)
- MinIO:
  - bucket replication or periodic export
- Keycloak:
  - scheduled realm export + config backup

---

## 17) Security Baseline

### 17.1 Required Controls

- TLS at gateway
- Strict CORS
- JWT validation
- Role/group authorization at API boundary
- Tenant scoping enforced in DB queries
- Secrets stored outside git
- Audit trails for privileged actions

### 17.2 Tenant Isolation

- Auth context defines tenant
- DB query layer must always include tenant boundary checks
- Cache keys: prefix with tenant identifier
- Storage buckets: tenant-aware prefix/bucket

---

## 18) Troubleshooting Guide

### Common Issues

**DB timeouts**
- Likely: PgBouncer config, pool size, long transactions
- Fix: tune pool, reduce query time, add indexes, set timeouts

**Auth failures**
- Likely: wrong realm, token expiry, clock drift
- Fix: verify Keycloak config, refresh flow, time sync

**High latency**
- Likely: cache misses, cold starts, heavy queries
- Fix: add caching, tune queries, enable pagination

**No telemetry**
- Likely: OTel exporter misconfigured, Alloy down
- Fix: verify Alloy config + env, check Grafana datasources

---

## 19) Appendices

### Appendix A — New Module Checklist

- [ ] Add `module.json` with code, deps, subscription tier
- [ ] Add domain model and invariants
- [ ] Add API contract (REST/GraphQL)
- [ ] Add persistence repository (tenant-aware)
- [ ] Add telemetry (metrics + traces + structured logs)
- [ ] Add jobs if needed
- [ ] Add tests (domain + API)
- [ ] Add docs entry under `docs/architecture` or `docs/api`

### Appendix B — Minimal Module Skeleton (Copy/Paste)

```
<module>/
  index.ts
  module.json
  adapters/.gitkeep
  api/.gitkeep
  domain/.gitkeep
  jobs/.gitkeep
  observability/.gitkeep
  persistence/.gitkeep
```

### Appendix C — Glossary

| Term | Meaning |
|------|---------|
| Mesh | Canonical infrastructure layer (Traefik/IAM/DB/Cache/Obs) |
| NeonUI | Next.js UI system + workbenches + shared packages |
| LGTM | Loki + Grafana + Tempo + Metrics (Prometheus) |
| Tenant Scoped | Feature is isolated per tenant |
| Shared | Single global dataset shared across tenants (rare, controlled) |

---

**© athyper Platform Engineering — Handbook**
