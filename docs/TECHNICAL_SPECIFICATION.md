# Athyper Platform — Technical Specification

> Comprehensive reference for the Athyper platform architecture, packages, layered data model, dependency rules, and development tooling.

---

## Table of Contents

1. [Layered Architecture](#1-layered-architecture)
2. [Dependency Matrix & Rules](#2-dependency-matrix--rules)
3. [META Change Workflow](#3-meta-change-workflow)
4. [Package Catalog — Framework](#4-package-catalog--framework)
5. [Package Catalog — Adapters](#5-package-catalog--adapters)
6. [Package Catalog — Shared Libraries](#6-package-catalog--shared-libraries)
7. [Package Catalog — Products](#7-package-catalog--products)
8. [Package Catalog — Tooling & Tools](#8-package-catalog--tooling--tools)
9. [Platform Services (Runtime)](#9-platform-services-runtime)
10. [pnpm Scripts Reference](#10-pnpm-scripts-reference)
11. [Build Pipeline & Configuration](#11-build-pipeline--configuration)

---

## 1. Layered Architecture

The platform separates concerns into four architectural layers. Each layer owns a distinct responsibility and uses a specific technology.

### 1.1 Layer Responsibility Matrix

| Capability | Physical Schema (Prisma) | Query Layer (Kysely) | Contract Layer (Zod DTO) | Behavior Layer (Meta) |
|------------|:------------------------:|:--------------------:|:------------------------:|:---------------------:|
| **DEFINES** | WHAT EXISTS physically — generates DB shape | HOW we query it efficiently — executes queries on that shape | WHAT IS VALID at runtime boundaries — runtime validation + contracts. Zod schemas come from Prisma | HOW THE SYSTEM BEHAVES over that data |
| Table exists | Yes | — | — | — |
| Column type | Yes | — | — | — |
| Enum values | Yes | — | — | — |
| Query performance | — | Yes | — | — |
| Input validation | — | — | Yes | Dynamic overlays |
| Conditional required | — | — | — | Yes |
| UI widget mapping | — | — | — | Yes |
| Workflow rules | — | — | — | Yes |
| Permissions | — | — | — | Yes |
| State transitions | — | — | — | Yes |
| Schema evolution | Via migration | — | Regenerate DTO | Governs |

### 1.2 Concern Ownership

| Concern | Owned By | Tool |
|---------|----------|------|
| Physical storage | Infra | Prisma |
| Query execution | Infra | Kysely |
| API boundary validation | Contracts layer | Zod |
| Dynamic behavior | Runtime | Meta Engine |
| Evolution control | Meta lifecycle | SchemaChange Engine |
| Cross-module safety | Meta policy engine | Runtime |

### 1.3 Data Flow

```
Meta Definition
    |
    v
Generate / Update Contracts
    |
    v
Generate / Update Prisma Schema
    |
    v
Apply Migration
    |
    v
Runtime Loads New Meta Overlay
    |
    v
Kysely executes optimized queries
```

---

## 2. Dependency Matrix & Rules

### 2.1 Inter-Package Dependency Matrix

| From \ To | framework/core | framework/runtime | framework/adapters/* | packages/contracts | packages/* (non-contracts) | products/* |
|-----------|:--------------:|:-----------------:|:--------------------:|:------------------:|:-------------------------:|:----------:|
| **framework/core** | YES | NO | NO | YES | NO | NO |
| **framework/runtime** | YES | YES | YES | YES | YES (optional) | NO |
| **framework/adapters/*** | YES | NO | YES (rare) | YES | NO | NO |
| **packages/contracts** | NO | NO | NO | YES | NO | NO |
| **packages/* (non-contracts)** | NO (usually) | NO | NO | NO | YES | NO |
| **products/*** | NO | NO | NO | YES | YES | YES |

### 2.2 Dependency Rules (Enforced by ESLint + dependency-cruiser)

- **core is pure** — Cannot import runtime, adapters, products, or infrastructure libraries (pg, ioredis, @aws-sdk, express, pino, jose). Can only import contracts.
- **runtime orchestrates** — Can import core + adapters (via DI tokens only, no deep imports). Cannot import product apps.
- **adapters touch infra** — Can import core and their respective infrastructure library. Cannot import runtime. Cannot import UI/packages. Cannot import each other (no cross-talk between adapters).
- **packages = reusable libs** — Cannot import framework/*. Can only import other packages.
- **products = deployables** — Can import packages. Must not import framework/* directly.

### 2.3 Enforcement Mechanisms

1. **ESLint boundaries plugin** — `eslint-plugin-boundaries` enforces element-type rules at lint time.
2. **ESLint no-restricted-imports** — 15+ forbidden import patterns per layer.
3. **dependency-cruiser** — `.dependency-cruiser.cjs` validates the full dependency graph. Run via `pnpm depcheck`.
4. **CI gate** — All three checks run in `pnpm check:ci`.

---

## 3. META Change Workflow

When a schema change is requested (new field, type change, behavior update), the META Engine orchestrates a controlled 5-step process.

### Step 1 — META Change Intent

Meta creates a `SchemaChangeRequest` which includes:
- New field definition
- Type specification
- Behavior rules
- Lifecycle impact analysis
- Permissions impact analysis

**No DB change yet.**

### Step 2 — Validate at Meta Level

The system validates:
- Lifecycle compatibility
- Workflow rule consistency
- `entity_class` constraints
- Multi-tenant safety

**Still no DB change.**

### Step 3 — Produce Migration Plan

The system generates:
- DB migration (Prisma)
- Contract diff (DTO regeneration)
- Runtime overlay change

### Step 4 — Controlled Apply

Execute the plan:
1. Apply migration to database
2. Regenerate Prisma client
3. Regenerate Contracts (Zod + Kysely types)
4. Rebuild runtime

### Step 5 — Runtime Hot Load

If safe:
- Reload metadata overlays
- No full redeploy required
- Kysely executes optimized queries against new schema

---

## 4. Package Catalog — Framework

### 4.1 @athyper/core

| | |
|---|---|
| **Path** | `framework/core` |
| **Purpose** | Pure domain logic — DDD building blocks, resilience, observability, security, multi-tenancy, Meta Engine types |
| **Dependencies** | None (zero infrastructure) |
| **Exports** | 9 main modules + 1 subpath (`@athyper/core/meta`) |
| **Status** | Production-ready |

#### Modules

| Module | Path | Key Exports | Purpose |
|--------|------|-------------|---------|
| **model** | `src/model/` | `Entity<ID>`, `ValueObject<T>`, `AggregateRoot`, `EntityId` | DDD building blocks — identity-based equality for entities, value-based equality for value objects |
| **access** | `src/access/` | `RbacPolicy`, `AccessContext`, `AccessPolicy` | RBAC with wildcard permissions. Default roles: admin (`*`), manager, user, guest. Permission format: `action:resource` |
| **events** | `src/events/` | `DomainEvent<T>`, `InMemoryEventBus`, `EventStore` | Domain events, pub/sub event bus, event sourcing contracts |
| **lifecycle** | `src/lifecycle/` | `LifecycleManager`, `ComponentLifecycle`, `LifecyclePhase` | Component startup/shutdown coordination. Forward order start, reverse order stop. Health check aggregation |
| **resilience** | `src/resilience/` | `CircuitBreaker`, `withRetry`, `@Retry`, `@WithCircuitBreaker` | Exponential/linear/fixed retry with jitter. Circuit breaker (CLOSED/OPEN/HALF_OPEN). Pre-configured `DB_RETRY_POLICY` and `API_RETRY_POLICY` |
| **observability** | `src/observability/` | `HealthCheckRegistry`, `MetricsRegistry`, `RequestContextStorage`, `GracefulShutdown`, `LogEnvelope` | Health checks (required vs optional deps), in-memory metrics (counter/gauge/histogram), W3C trace context, graceful shutdown with priority hooks, structured telemetry envelope (v1.1) |
| **security** | `src/security/` | `MemoryRateLimiter`, `validate()`, `sanitizeHtml()`, `sanitizeDeep()` | Token-bucket rate limiting (5 profiles), input validation (14+ types, pre-built rulesets), XSS/SQL/path-traversal sanitization |
| **registry** | `src/registry/` | `TenantRegistry`, `IdentityProviderRegistry`, `TenantIdpRegistry` | Multi-tenancy registries — tenant config with feature flags, per-realm IdP config, combined tenant-to-IdP resolution |
| **jobs** | `src/jobs/` | `JobQueue`, `JobHandler`, `JobData`, `QueueMetrics` | Background job abstractions — priority queues, retry, bulk operations, status tracking |
| **meta** | `src/meta/` (subpath: `@athyper/core/meta`) | `FieldDefinition`, `EntitySchema`, `CompiledModel`, `PolicyDefinition`, `CompiledPolicyRule`, `Lifecycle`, `ApprovalTemplate`, `Overlay`, `META_TOKENS` | **Phases 1–14** of the META Engine type system. Entity/version models, compiled IR with SQL fragments, policy engine types (RBAC+ABAC), workflow lifecycle (states, transitions, gates), approval runtime (instances, stages, tasks, escalation), overlay system, compilation diagnostics, DI token definitions |

### 4.2 @athyper/runtime

| | |
|---|---|
| **Path** | `framework/runtime` |
| **Purpose** | Kernel, DI container, config, HTTP server, module system, all platform services |
| **Dependencies** | `@athyper/core`, all adapters, `@athyper/contracts`, express, pino, zod, jose, kysely, pg, ioredis, bullmq |
| **Runtime Modes** | `api` (HTTP server), `worker` (job consumer), `scheduler` (cron) |
| **Status** | Production-ready |

#### Kernel Components

| Component | File | Purpose |
|-----------|------|---------|
| **Bootstrap** | `kernel/bootstrap.ts` | Two-phase startup: config validation, adapter registration, module loading, signal handlers. Stable exit codes (2–50) |
| **Container** | `kernel/container.ts` | Token-based DI with singleton/scoped/transient caching. Parent-child hierarchy for request/job isolation |
| **Tokens** | `kernel/tokens.ts` | Stable capability tokens: config, logger, lifecycle, db, auth, cache, objectStorage, telemetry, healthRegistry, metricsRegistry, routeRegistry, jobRegistry, auditWriter, featureFlags |
| **Config** | `kernel/config.schema.ts` | Zod schema: env, mode, port, logLevel, db (url/adminUrl/poolMax), iam (strategy/realms/tenants/featureFlags), redis, s3, telemetry. Loading precedence: file < env < overrides < SUPERSTAR. Locked paths for infra wiring |
| **Tenant Context** | `kernel/tenantContext.ts` | Resolution from headers (x-realm, x-tenant, x-org) or JWT claims or config defaults. Defaults cascade: realm → tenant → org |
| **Scope** | `kernel/scope.ts` | `createHttpScope()` and `createJobScope()` — per-request/job child containers with requestContext and tenantContext |
| **Lifecycle** | `kernel/lifecycle.ts` | LIFO shutdown handlers. Guards against double-shutdown |
| **Audit** | `kernel/audit.ts` | `AuditWriter` interface, `makeAuditEvent()`, console and noop writers |
| **Logger** | `kernel/logger.ts` | Pino-based structured logging. JSON in prod, pretty in dev |

#### Module System

Two-phase loading for all platform services:

1. **Register phase** — Modules register dependencies/services into the DI container
2. **Contribute phase** — Modules add routes/jobs/services to registries

Three registries accumulate definitions: `RouteRegistry`, `JobRegistry`, `ServiceRegistry`.

#### HTTP Server

Express-based with automatic route mounting. Request lifecycle:
1. Scope creation (child container)
2. Tenant context resolution
3. 4-layer JWT verification (signature → type → azp → tenant cross-check)
4. Policy gate (optional RBAC/ABAC)
5. Handler execution

---

## 5. Package Catalog — Adapters

All adapters follow the same pattern: factory function, circuit breaker protection, health check registration, DI token binding.

### 5.1 @athyper/adapter-auth

| | |
|---|---|
| **Path** | `framework/adapters/auth` |
| **Wraps** | Keycloak OIDC via `jose` library |
| **Key Features** | Multi-realm JWKS management, in-memory caching, optional Redis warm-start, per-realm JWT verifiers |
| **Circuit Breaker** | 10 failures / 60s window / 20s reset |
| **Health Check** | Required — JWKS availability per realm |
| **Key Exports** | `createAuthAdapter()`, `AuthAdapter`, `JwksManager`, `JwksHealthStatus` |

### 5.2 @athyper/adapter-db

| | |
|---|---|
| **Path** | `framework/adapters/db` |
| **Wraps** | PostgreSQL via Kysely + Prisma + pg.Pool |
| **Key Features** | PgBouncer-optimized pooling (no prepared statements), multi-schema (core/mdm/meta/public/ref/ui), transaction helpers with isolation levels, safe filtering/pagination with field whitelisting, migration runner, provisioning system with checksum tracking |
| **Circuit Breaker** | 5 failures / 60s window / 30s reset |
| **Health Check** | Required — `SELECT 1` |
| **Key Exports** | `createDbAdapter()`, `DbClient`, `withTx()`, `withTxIsolation()`, `buildKyselyListQuery()`, `MigrationRunner`, `DB` type |
| **Schemas** | 6 PostgreSQL schemas: core, mdm, meta, public, ref, ui |
| **Important** | Migrations require `DATABASE_ADMIN_URL` (direct Postgres, NOT PgBouncer) |

### 5.3 @athyper/adapter-memorycache

| | |
|---|---|
| **Path** | `framework/adapters/memorycache` |
| **Wraps** | Redis via `ioredis` |
| **Key Features** | Lazy connection, maxRetriesPerRequest: 2, readyCheck enabled |
| **Circuit Breaker** | 10 failures / 60s window / 15s reset |
| **Health Check** | Registered but NOT required (graceful degradation) |
| **Key Exports** | `createRedisClient()`, `RedisClient` |

### 5.4 @athyper/adapter-objectstorage

| | |
|---|---|
| **Path** | `framework/adapters/objectstorage` |
| **Wraps** | S3/MinIO via AWS SDK v3 |
| **Key Features** | CRUD (put/get/delete/exists), listing, presigned URLs (GET/PUT), batch delete, copy, forcePathStyle for MinIO |
| **Circuit Breaker** | 5 failures / 60s window / 30s reset |
| **Health Check** | Required — `ListObjectsV2` with MaxKeys=1 |
| **Key Exports** | `createS3ObjectStorageAdapter()`, `ObjectStorageAdapter`, `ObjectStorageConfig` |

### 5.5 @athyper/adapter-telemetry

| | |
|---|---|
| **Path** | `framework/adapters/telemetry` |
| **Wraps** | OpenTelemetry API + Pino |
| **Key Features** | Span creation (`withSpan()`), trace context extraction, structured log envelope emission |
| **Circuit Breaker** | None (best-effort) |
| **Health Check** | None |
| **Key Exports** | `createTelemetryAdapter()`, `getOtelTraceContext()`, `withSpan()` |

### Adapter Integration Summary

| Feature | Auth | DB | Cache | ObjectStorage | Telemetry |
|---------|:----:|:--:|:-----:|:-------------:|:---------:|
| Circuit Breaker | 10/60s/20s | 5/60s/30s | 10/60s/15s | 5/60s/30s | None |
| Health Check | Required | Required | Optional | Required | None |
| Graceful Degradation | No | No | Yes | No | Yes |
| Multi-Realm/Tenant | Yes | Yes | Yes | Yes | Yes |

---

## 6. Package Catalog — Shared Libraries

### 6.1 @athyper/contracts

| | |
|---|---|
| **Path** | `packages/contracts` |
| **Purpose** | Central source of truth for all data contracts. Auto-generated Prisma Zod schemas and Kysely database type definitions |
| **Status** | Production-ready |
| **Stats** | ~130 tables, 1,756+ Zod schemas, full Kysely DB type |

**Subpath Exports:**
- `@athyper/contracts` — Main barrel
- `@athyper/contracts/generated` — All generated types
- `@athyper/contracts/platform` — Platform contracts
- `@athyper/contracts/runtime` — Runtime config schemas

**Database Domains Covered:**
- **Core** — address, approval, attachment, audit_log, contact, document, entity, field, group, job, lifecycle, notification, overlay, permission, persona, principal, role, tenant, workflow, workspace (~90 tables)
- **Reference** — commodity_code, country, currency, industry_code, language, locale, state_region, timezone, uom (~10 tables)
- **UI** — dashboard_widget, notification, recent_activity, saved_view, search_history, user_preference (~10 tables)
- **Meta** — entity definitions, versioning, compilation, overlays (~20 tables)

**Codegen Pipeline:** `Prisma schema` → `prisma generate` → `Zod schemas + Kysely types` → `sync to packages/contracts/generated/`

### 6.2 @athyper/ui

| | |
|---|---|
| **Path** | `packages/ui` |
| **Purpose** | Accessible React component library built on Radix UI primitives, styled with Tailwind CSS |
| **Status** | Production-ready |
| **Stats** | 15 components |

**Components:** Badge, Button (primary/ghost, sm/md/lg), Card (Header/Content/Footer), Dialog, DropdownMenu, Input (with error/helper), Label, ScrollArea, Select, Separator, Sheet (side panel), Switch, Tabs, Textarea, Tooltip

**Stack:** Radix UI + class-variance-authority + clsx + tailwind-merge + Lucide React icons

### 6.3 @athyper/dashboard

| | |
|---|---|
| **Path** | `packages/dashboard` |
| **Purpose** | Meta-driven dashboard type system, widget registry, and resolution engine. Pure types and logic — no React components |
| **Status** | Production-ready |

**6 Standard Widgets:** heading, spacer, shortcut, kpi, list, chart

**Key Classes:** `WidgetRegistry` (register/validate/list), `resolveDashboard()` (user → tenant → system resolution)

**Features:** 12-column grid layout, role-based ACL, Zod-validated widget params, versioned dashboard layouts, multi-tier resolution

### 6.4 @athyper/auth

| | |
|---|---|
| **Path** | `packages/auth` |
| **Purpose** | Next.js-compatible authentication utilities — session management, Keycloak integration, workbench role definitions |
| **Status** | Implemented |

**Key Exports:** `Session`, `WorkbenchType` (ADMIN/USER/PARTNER/SERVICEMANAGER), `setSession()`, `getSession()`, `clearSession()`, `keycloakPasswordGrant()` (DEV only), `refreshAccessToken()`

### 6.5 @athyper/api-client

| | |
|---|---|
| **Path** | `packages/api-client` |
| **Purpose** | Typed HTTP client with SSR support — injectable fetch, optional token auth |
| **Status** | MVP/Scaffold |

**Key Exports:** `createApiClient({ baseUrl, token?, fetch? })`, `ApiClient` with `ping()` endpoint

### 6.6 @athyper/i18n

| | |
|---|---|
| **Path** | `packages/i18n` |
| **Purpose** | Internationalization configuration and locale management |
| **Status** | Scaffold |

**7 Locales:** en, ms (Malay), ta (Tamil), hi (Hindi), ar (Arabic — RTL), fr, de

**Language Bundles:** `lang/{locale}/auth.json`, `common.json`, `dashboard.json`, `widgets.json`, `errors.json`

**Key Exports:** `i18nConfig`, `Locale` type, `isValidLocale()`, `isRtlLocale()`

### 6.7 @athyper/theme

| | |
|---|---|
| **Path** | `packages/theme` |
| **Purpose** | Design system tokens and Tailwind CSS preset |
| **Status** | Scaffold |

**Token Categories:** colors (gray scale + semantic), spacing (0–32), typography (Inter/Fira Code, xs–4xl), shadows (sm–xl), borderRadius, breakpoints

**Subpath Export:** `@athyper/theme/tailwind` — Tailwind preset for `presets: [themePreset]`

### 6.8 @athyper/workbench-admin, workbench-partner, workbench-user

| | |
|---|---|
| **Paths** | `packages/workbench-admin`, `packages/workbench-partner`, `packages/workbench-user` |
| **Purpose** | Role-specific features — admin (tenant/user management, audit), partner (orders, invoices, collaboration), user (dashboard, profile, preferences) |
| **Status** | Scaffold |
| **Dependencies** | `@athyper/ui`, `@athyper/api-client`, `@athyper/auth` |

### Shared Library Maturity Summary

| Package | Status | Key Metric |
|---------|--------|------------|
| **contracts** | Production | 1,756 Zod schemas, 130 tables |
| **ui** | Production | 15 Radix components |
| **dashboard** | Production | 6 widgets, registry + resolution |
| **auth** | Implemented | Session management, PKCE ready |
| **api-client** | MVP | 1 endpoint, extensible |
| **i18n** | Scaffold | 7 locales, RTL support |
| **theme** | Scaffold | Token structure, Tailwind preset |
| **workbench-*** | Scaffold | Home stubs |

---

## 7. Package Catalog — Products

### 7.1 @neon/web

| | |
|---|---|
| **Path** | `products/neon/apps/web` |
| **Purpose** | Next.js 16 frontend application — the primary product deployable |
| **Port** | 3001 (dev) |
| **Status** | Production-ready |

**Technology:** Next.js 16, React 19, Tailwind CSS 4, Radix UI, Zustand 5, react-hook-form + zod, @tanstack/react-table, @dnd-kit, recharts, cmdk

**App Structure:**
- `(auth)/login/` — Workbench selector + Keycloak PKCE login
- `(public)/` — Landing page, health check
- `(shell)/app/[entity]/` — Dynamic entity workspace (list, kanban, dashboard, listreport views; detail with edit, clone, comments, approvals, actions)
- `api/auth/` — BFF authentication routes (login, callback, session, refresh, touch, logout, debug)

**Auth BFF Routes:**
- `GET /api/auth/login` — Initiates PKCE flow (generates codeVerifier + codeChallenge + state, stores in Redis, redirects to Keycloak)
- `GET /api/auth/callback` — Exchanges authorization code for tokens, creates Redis session, sets cookies (neon_sid + __csrf), emits audit
- `GET /api/auth/session` — Returns public session data (no tokens). Enforces soft IP/UA binding
- `POST /api/auth/refresh` — Proactive token refresh. Enforces idle timeout (900s). Rotates session ID + CSRF token
- `POST /api/auth/touch` — Updates lastSeenAt for idle tracking
- `POST /api/auth/logout` — 4-layer logout: Keycloak backchannel + Redis cleanup + cookie clear + SSO termination URL

**Middleware:** CSRF double-submit validation (POST/PUT/PATCH/DELETE on /api/*) + session gate (neon_sid required for protected routes) + locale detection

**SSR Bootstrap:** `window.__SESSION_BOOTSTRAP__` injected in layout.tsx — no extra /api/auth/session call needed on page load. Contains: displayName, roles, persona, workbench, accessExpiresAt, idleTimeoutSec, csrfToken, allowedWorkbenches, modules, personas, groups

**Preferences System:** Theme mode (light/dark/system), 4 presets (default/brutalist/soft-pop/tangerine), layout (centered/full-width), navbar (sticky/scroll), sidebar (sidebar/inset/floating, icon/offcanvas collapse). Persisted via cookies (layout-critical) and localStorage (non-critical)

### 7.2 @neon/auth

| | |
|---|---|
| **Path** | `products/neon/auth` |
| **Purpose** | BFF authentication library — PKCE flow, session management, audit logging |
| **Subpath Exports** | `@neon/auth`, `@neon/auth/session`, `@neon/auth/keycloak`, `@neon/auth/audit` |
| **Status** | Production-ready |

**Session Architecture:**
- `Session` (public) — userId, username, displayName, workbench, roles, persona, accessExpiresAt
- `ServerSession` (private, Redis-stored) — extends Session with accessToken, refreshToken, idToken, ipHash, uaHash, csrfToken, clientRoles, groups, tenantId, realmKey

**Keycloak Integration:** `generatePkceChallenge()`, `buildAuthorizationUrl()`, `exchangeCodeForTokens()`, `refreshTokens()`, `keycloakLogout()`, `buildFrontChannelLogoutUrl()`, `decodeJwtPayload()`

**Audit Logging:** Redis LIST-based (`audit:auth:{tenantId}`), 16 event types, 10K cap per tenant, 7-day TTL, best-effort. Session IDs hashed for logs (first 16 chars of SHA-256)

### 7.3 @neon/ui, @neon/theme

Thin re-export wrappers over `@athyper/ui` and `@athyper/theme`. Provide product-level abstraction for future customization without modifying framework packages.

---

## 8. Package Catalog — Tooling & Tools

### 8.1 @athyper/tsconfig

| | |
|---|---|
| **Path** | `tooling/tsconfig` |
| **Exports** | `@athyper/tsconfig/base` (strict TS, ES2022, bundler resolution, composite), `@athyper/tsconfig/next` (extends base + JSX preserve + DOM libs + noEmit) |

### 8.2 @athyper/eslint-config

| | |
|---|---|
| **Path** | `tooling/eslint-config` |
| **Plugins** | @typescript-eslint, import, unused-imports, turbo, boundaries |
| **Key Rules** | Import ordering, no-restricted-imports (15+ patterns per layer), boundary enforcement, no-explicit-any, consistent-type-imports |

### 8.3 @athyper/codegen

| | |
|---|---|
| **Path** | `tools/codegen` |
| **CLIs** | `athyper-codegen` (quick sync), `athyper-publish` (full lifecycle) |

**Quick Codegen:** `prisma generate` → sync Zod + Kysely to `packages/contracts/generated/` → write entry-points

**Full Publish (6 steps):**
1. Validate — Prisma schema syntax check
2. Diff/Plan — Preview SQL migration
3. Migrate — Apply to database (requires `DATABASE_ADMIN_URL`)
4. Generate — Run Prisma generators (Zod + Kysely)
5. Sync — Copy artifacts to contracts package
6. Report — Summary with timings

### 8.4 tooling/devtools

`clean-deep.mjs` — Safe monorepo cache cleaner (removes `node_modules/` and `.turbo/` recursively with guard checks)

### 8.5 tools/devtools

Keycloak realm bootstrap scripts (`groupsgen.ps1`, `athyper-groups-import.json`)

---

## 9. Platform Services (Runtime)

All services live in `framework/runtime/src/services/platform/` and follow the `RuntimeModule` pattern (register + contribute phases).

### 9.1 Foundation (`foundation/`)

| Sub-module | Purpose |
|------------|---------|
| **HTTP** | Express server, route mounting, health + JWKS health endpoints |
| **Registries** | RouteRegistry, JobRegistry, ServiceRegistry — definition buckets |
| **Resilience** | `AdapterCircuitBreakers` — per-adapter circuit breaker protection |
| **Security** | Redis rate limiter, field-level security (access checks, data masking, policy explain, field projection) |
| **Middleware** | Observability (request context, tracing), rate limiting, security headers, validation, field-level enforcement |
| **Generic API** | Cross-entity query DSL with JOIN support, query validation, security enforcement |
| **Overlay System** | Dynamic schema overlays per tenant, schema composition |
| **IAM** | Persona model (7 personas: User, Power User, Manager, Admin, Security Officer, Compliance Officer, System Admin), MFA (TOTP + backup codes + device trust), IAM REST API (principals, groups, roles, role bindings, OUs, capabilities, MFA — 50+ endpoints) |

### 9.2 Identity & Access (`identity-access/`)

6 core services: `IdentityMapperService` (IdP identity → principal), `TenantResolverService` (tenant status + subscription tiers), `RoleBindingService` (scope: realm/tenant/org), `GroupSyncService` (LDAP/SCIM/OAuth/internal), `OUMembershipService` (OU hierarchy), `EntitlementSnapshotService` (point-in-time permissions)

### 9.3 Policy Rules (`policy-rules/`)

RBAC+ABAC authorization engine. `PolicyGateService` evaluates `AuthorizationRequest` → `AuthorizationDecision` (Allow/Deny with obligations). Operation catalog organized by namespace (entity, workflow, utility, delegation, collaboration). Includes policy compiler, rule evaluator, subject resolver, decision logger, and policy simulator for testing.

### 9.4 Workflow Engine (`workflow-engine/`)

Comprehensive approval workflow system:
- **Design-time** — Templates with steps, approver resolution strategies (direct/role/dynamic/group/expression), conditions (threshold/attribute/time), SLA + escalation
- **Run-time** — Instance lifecycle, entity state locking, task management (inbox, delegation, reassignment, SLA tracking)
- **Actions** — Approve, reject, request changes, delegate, comment, attach files
- **Parallel modes** — Any, all, majority, quorum
- **Governance** — Audit trail, compliance metrics, admin overrides
- **Recovery** — Missing approver detection, deactivated user handling, workflow pause/resume/retry
- **Versioning** — Template versions (active/deprecated/retired), impact analysis, safe migration

### 9.5 Audit & Governance (`audit-governance/`)

Audit log persistence, retention jobs (auto-cleanup), compliance API.

### 9.6 Meta Engine (`meta/`)

Entity storage/retrieval, registry, policy/rule compiler, authorization enforcement, lifecycle state machine, route compilation, generic data API, DDL generation, schema publishing.

### 9.7 Metadata Studio (`metadata-studio/`)

Schema design, visual modeling, persistence & API layer. Module structure in place.

### 9.8 Automation Jobs (`automation-jobs/`)

BullMQ-backed job queuing, Redis-backed persistence, worker pools, scheduled execution, retry with exponential backoff.

---

## 10. pnpm Scripts Reference

All scripts run from monorepo root via `pnpm run <script>`.

### Development

| Script | Description |
|--------|-------------|
| `dev` | Start all packages in dev/watch mode (Turbo, parallel) |
| `runtime:start` | Start the runtime kernel (production) |
| `runtime:start:dev` | Start the runtime kernel in development mode (tsx) |
| `runtime:start:watch` | Start the runtime kernel with file watching (tsx watch) |

### Build & Quality

| Script | Description |
|--------|-------------|
| `build` | Build all packages via Turbo (respects dependency order) |
| `build:all` | Build all packages, continue on errors |
| `lint` | Lint all packages via Turbo |
| `lint:all` | Lint all packages, continue on errors |
| `lint:root` | Lint root config only — zero warnings enforced |
| `lint:fix` | Auto-fix lint issues across the repo |
| `typecheck` | Type-check all packages via Turbo (uses project references) |
| `typecheck:all` | Type-check all packages, continue on errors |
| `format` | Format all files with Prettier |
| `format:changed` | Format only changed files (ts, tsx, js, jsx, md, json, yaml, yml) |
| `format:check` | Check formatting without writing (CI mode) |
| `depcheck` | Run dependency-cruiser boundary validation across framework, packages, products, tooling, tools |
| `check` | Full quality gate: lint + typecheck + test + depcheck |
| `check:ci` | CI quality gate: format:check + check |

### Testing

| Script | Description |
|--------|-------------|
| `test` | Run all tests via Turbo (Vitest, node environment, 4 threads) |
| `test:all` | Run all tests, continue on errors |
| `test:policy` | Run policy engine tests only (`@athyper/runtime` policy-simulator.test.ts) |
| `test:policy:ci` | Run policy engine tests in CI mode |

### Database — Prisma

| Script | Description |
|--------|-------------|
| `db:migrate` | Create a new Prisma migration (requires `DATABASE_ADMIN_URL`) |
| `db:migrate:dev` | Alias for `db:migrate` |
| `db:migrate:deploy` | Alias for `db:deploy` |
| `db:deploy` | Apply pending migrations to the database |
| `db:reset` | Reset database and re-apply all migrations |
| `db:generate` | Regenerate Prisma client from schema |
| `db:pull` | Introspect database and update Prisma schema |
| `db:pull:force` | Force introspect (overwrite local schema changes) |
| `db:studio` | Open Prisma Studio (visual DB browser) |
| `kysely:codegen` | Generate Kysely types from current database state |

### Database — Provisioning

| Script | Description |
|--------|-------------|
| `db:provision` | Provision database (DDL + seed data). Uses checksum tracking to skip unchanged files |
| `db:provision:ddl` | Run DDL provisioning only (files 010–120) |
| `db:provision:seed` | Run seed data only (files 200+) |
| `db:provision:reset` | Drop and re-provision from scratch |
| `db:provision:status` | Show executed vs pending provisioning files |
| `db:provision:force` | Re-run all files even if checksums unchanged |

### Meta Engine Migrations

| Script | Description |
|--------|-------------|
| `meta:migrate:plan` | Plan meta engine schema migration (preview SQL) |
| `meta:migrate:dev` | Apply meta migration in development |
| `meta:migrate:deploy` | Deploy meta migration to target environment |
| `meta:migrate:sql` | Generate raw SQL for meta migration (for review) |

### Code Generation

| Script | Description |
|--------|-------------|
| `athyper:codegen` | Quick codegen: `prisma generate` → sync Zod + Kysely to `packages/contracts/generated/` → write entry-points |
| `athyper:codegen:watch` | Run codegen in watch mode (re-runs on schema.prisma changes) |
| `db:publish` | Full schema lifecycle: validate → diff → migrate → generate → sync → report |
| `db:publish:dry-run` | Preview only — validate + diff without applying changes |

### Infrastructure — MESH

| Script | Description |
|--------|-------------|
| `mesh:up` | Start all infrastructure services via Docker Compose (Keycloak, Redis, PostgreSQL, Traefik, MinIO, OpenTelemetry) |
| `mesh:down` | Stop all infrastructure services |
| `mesh:logs` | Tail infrastructure logs (last 200 lines, follow mode) |
| `mesh:ps` | Show running infrastructure containers |

### Maintenance

| Script | Description |
|--------|-------------|
| `clean` | Clean build artifacts (dist/, .next/, *.tsbuildinfo) across all packages + remove .turbo cache |
| `clean:deps` | Remove root node_modules and .turbo |
| `clean:all` | Full clean: artifacts + deps + pnpm-lock.yaml |
| `clean:reset` | Full clean then reinstall and rebuild from scratch |
| `clean:deep` | Full clean + deep clean generated files via `tooling/devtools/clean-deep.mjs` |
| `doctor` | Print Node.js version, pnpm version, and Turbo version (environment health check) |
| `deps:why` | Show why a dependency is installed (across all workspaces) |
| `deps:outdated` | Show outdated dependencies across all workspaces |
| `prune:neon-web` | Prune workspace for `@neon/web` Docker build (Turbo prune --docker) |

---

## 11. Build Pipeline & Configuration

### 11.1 Turbo Pipeline

| Task | Cached | Dependencies | Inputs | Outputs |
|------|:------:|:------------:|--------|---------|
| `dev` | No | — | — | — (persistent) |
| `build` | Yes | `^build` | tooling/**, src/**, prisma/**, .env* | dist/**, .next/**, *.tsbuildinfo |
| `lint` | Yes | `^lint` | tooling/**, src/**, eslint config | .eslint-cache |
| `typecheck` | Yes | `^typecheck` | src/**, generated/**, tsconfig.json | *.tsbuildinfo |
| `test` | Yes | `^test` | src/**, test/**, vitest.config.ts | coverage/** |
| `db:*` | No | — | schema.prisma | generated/** |
| `clean` | No | — | — | — |

### 11.2 Vitest Configuration

- **Environment:** Node (no browser APIs)
- **Globals:** true (describe/test/expect without imports)
- **Threads:** 4 max, 1 min
- **Coverage:** v8 provider, 70% threshold (lines/functions/branches/statements)
- **Mock reset:** true between tests

### 11.3 TypeScript Configuration

- **Base:** ES2022 target, ESNext module, bundler resolution, full strict mode, composite projects
- **Next.js:** Extends base + JSX preserve + DOM libs + noEmit + isolatedModules
- **Root:** 17 project references for incremental builds, dual path mapping (@athyper/* + @neon/*)

### 11.4 Boundary Enforcement (dependency-cruiser)

10 forbidden rules enforcing the dependency matrix:
1. `core-no-infra` — Core cannot import runtime/adapters/products/infra libs
2. `runtime-no-direct-infra` — Runtime cannot directly use pg/ioredis/@aws-sdk
3. `adapter-*-no-cross-talk` (5 rules) — Each adapter isolated from all others
4. `adapters-no-packages-except-contracts` — Adapters can only use contract types
5. `packages-no-framework` — Packages are framework-independent
6. `products-no-framework` — Products cannot import framework directly
