# Phase 3: Runtime Services - COMPLETE ✅

**Completed**: 2026-02-04
**Status**: All Phase 3 core deliverables complete

---

## Objectives

✅ Implement META Registry Service (PostgreSQL CRUD via Kysely)
✅ Implement META Compiler Service (schema compilation + Redis caching)
✅ Implement Policy Gate Service (basic allow/deny evaluation)
✅ Implement Audit Logger Service (PostgreSQL audit log)
✅ Implement Generic Data API Service (Kysely-based generic queries)
✅ Build and verify runtime package

---

## Deliverables

### 1. META Registry Service ✅

**File**: `framework/runtime/src/services/meta/registry.service.ts`

PostgreSQL-backed implementation of `MetaRegistry` interface using Kysely.

**Features**:
- Entity CRUD operations (create, get, list, update, delete)
- Version management (create, get, list, activate, deactivate, update, delete)
- Active version tracking
- Paginated list queries
- Tenant-aware operations

**Key Methods**:
```typescript
class MetaRegistryService implements MetaRegistry {
  // Entity operations (5 methods)
  createEntity(name, description, ctx): Promise<Entity>
  getEntity(name): Promise<Entity | undefined>
  listEntities(options?): Promise<PaginatedResponse<Entity>>
  updateEntity(name, updates, ctx): Promise<Entity>
  deleteEntity(name, ctx): Promise<void>

  // Version operations (8 methods)
  createVersion(entityName, version, schema, ctx): Promise<EntityVersion>
  getVersion(entityName, version): Promise<EntityVersion | undefined>
  getActiveVersion(entityName): Promise<EntityVersion | undefined>
  listVersions(entityName, options?): Promise<PaginatedResponse<EntityVersion>>
  activateVersion(entityName, version, ctx): Promise<EntityVersion>
  deactivateVersion(entityName, version, ctx): Promise<EntityVersion>
  updateVersion(entityName, version, schema, ctx): Promise<EntityVersion>
  deleteVersion(entityName, version, ctx): Promise<void>
}
```

**Database Tables Used**:
- `meta.meta_entities` - Entity definitions
- `meta.meta_versions` - Version schemas with JSONB schema column

**Total**: 13 methods, ~370 lines

---

### 2. META Compiler Service ✅

**File**: `framework/runtime/src/services/meta/compiler.service.ts`

Compiles entity schemas into optimized Compiled Model IR with Redis caching.

**Features**:
- Schema compilation (EntitySchema → CompiledModel)
- Comprehensive schema validation (fields, policies, types)
- Redis caching with configurable TTL (default 1 hour)
- Cache invalidation
- Precompilation support (warm cache on startup)
- Health checks

**Compilation Pipeline**:
```
EntitySchema (from registry)
  ↓
Schema Validation (fields, types, constraints)
  ↓
Field Compilation (camelCase → snake_case, SQL fragments)
  ↓
Policy Compilation (conditions → evaluator functions)
  ↓
Query Fragment Generation (SELECT, FROM, WHERE)
  ↓
Compiled Model IR + Schema Hash
  ↓
Redis Cache (key: meta:compiled:{entity}:{version}, TTL: 1h)
```

**Key Methods**:
```typescript
class MetaCompilerService implements MetaCompiler {
  compile(entityName, version): Promise<CompiledModel>
  recompile(entityName, version): Promise<CompiledModel>
  validate(schema): Promise<ValidationResult>
  invalidateCache(entityName, version): Promise<void>
  getCached(entityName, version): Promise<CompiledModel | undefined>
  precompileAll(): Promise<CompiledModel[]>
  healthCheck(): Promise<HealthCheckResult>
}
```

**Validation Rules**:
- At least one field required
- Valid field names (alphanumeric, camelCase)
- Valid field types (string, number, boolean, date, datetime, reference, enum, json)
- Reference fields must specify `referenceTo`
- Enum fields must specify `enumValues`
- No duplicate field names
- Valid policy effects (allow/deny)
- Valid policy actions (create/read/update/delete/*)

**Total**: 7 methods, ~550 lines

---

### 3. Policy Gate Service ✅

**File**: `framework/runtime/src/services/meta/policy-gate.service.ts`

Basic policy evaluation for access control.

**Features**:
- Allow/deny policy evaluation
- Policy priority ordering (higher priority evaluated first)
- Fail-secure (deny on error)
- Explicit deny takes precedence over allow
- Policy cache invalidation

**Evaluation Logic**:
```
1. Load compiled policies from compiled model
2. Filter policies by action (exact match or wildcard "*")
3. Sort by priority (higher first)
4. For each policy:
   - If deny + condition matches → DENY (return false)
   - If allow + condition matches → ALLOW (return true)
5. No matching allow policy → DENY (return false)
```

**Key Methods**:
```typescript
class PolicyGateService implements PolicyGate {
  can(action, resource, ctx, record?): Promise<boolean>
  enforce(action, resource, ctx, record?): Promise<void>  // Throws if denied
  getPolicies(action, resource): Promise<Array<{name, effect}>>
  evaluatePolicy(policyName, ctx, record?): Promise<boolean>
  invalidatePolicyCache(resource): Promise<void>
  healthCheck(): Promise<HealthCheckResult>
}
```

**MVP Limitations**:
- Policy conditions not fully implemented (always evaluates to effect)
- No runtime condition evaluation (planned for later)
- No policy caching (uses compiled model cache)

**Total**: 6 methods, ~120 lines

---

### 4. Audit Logger Service ✅

**File**: `framework/runtime/src/services/meta/audit-logger.service.ts`

PostgreSQL-backed audit logging for complete audit trail.

**Features**:
- Append-only audit log
- Event ID generation (`evt_{timestamp}_{random}`)
- Queryable audit log with filters
- Pagination support
- Resource/user/tenant-specific queries

**Event Types Logged**:
- Meta operations: `meta.entity.create`, `meta.version.activate`, etc.
- Policy operations: `policy.evaluate`, `policy.allow`, `policy.deny`
- Data operations: `data.read`, `data.create`, etc.

**Key Methods**:
```typescript
class AuditLoggerService implements AuditLogger {
  log(event): Promise<void>
  query(filters): Promise<PaginatedResponse<AuditEvent>>
  getEvent(eventId): Promise<AuditEvent | undefined>
  getRecent(limit?): Promise<AuditEvent[]>
  getResourceAudit(resource, options?): Promise<PaginatedResponse<AuditEvent>>
  getUserAudit(userId, options?): Promise<PaginatedResponse<AuditEvent>>
  getTenantAudit(tenantId, options?): Promise<PaginatedResponse<AuditEvent>>
  healthCheck(): Promise<HealthCheckResult>
}
```

**Database Table**:
- `meta.meta_audit` - Audit events with indexed timestamp, user, tenant, resource

**Query Filters**:
- Event type (single or multiple)
- User ID
- Tenant ID
- Resource
- Date range (start/end)
- Result (success/failure)

**Total**: 8 methods, ~250 lines

---

### 5. Generic Data API Service ✅

**File**: `framework/runtime/src/services/meta/generic-data-api.service.ts`

Generic CRUD operations for all META-defined entities using Kysely.

**Features** (MVP: Read-only):
- List records with pagination, sorting, filtering
- Get single record by ID
- Count records
- Automatic tenant isolation (tenant_id + realm_id filtering)
- Policy enforcement (via PolicyGate)
- Audit logging (all operations logged)
- Health checks

**Tenant Isolation**:
All queries automatically filtered:
```sql
WHERE tenant_id = ${ctx.tenantId}
  AND realm_id = ${ctx.realmId}
```

**Key Methods**:
```typescript
class GenericDataAPIService implements GenericDataAPI {
  list<T>(entityName, ctx, options?): Promise<PaginatedResponse<T>>
  get<T>(entityName, id, ctx): Promise<T | undefined>
  count(entityName, ctx, filters?): Promise<number>
  healthCheck(): Promise<HealthCheckResult>

  // Future (post-MVP):
  // create, update, delete
}
```

**Query Execution Flow**:
```
1. Enforce policy (read permission)
2. Get compiled model from compiler
3. Build Kysely SQL query with tenant filter
4. Execute query
5. Transform results (DB → API format)
6. Log audit event
7. Return data
```

**SQL Execution**:
Uses Kysely's `sql` tagged template for dynamic table access:
```typescript
sql`
  SELECT *
  FROM ${sql.table(model.tableName)}
  WHERE tenant_id = ${ctx.tenantId} AND realm_id = ${ctx.realmId}
  ORDER BY ${sql.ref(orderBy)} ${sql.raw(orderDir)}
  LIMIT ${pageSize} OFFSET ${offset}
`.execute(db)
```

**Total**: 4 methods, ~250 lines

---

### 6. MetaStore Service ✅

**File**: `framework/runtime/src/services/meta/meta-store.service.ts`

High-level convenience service for simplified META Engine workflows.

**Features**:
- Atomic operations (create entity + version in one transaction)
- Auto-compilation and caching
- Version publishing (create + activate + compile)
- Version switching with cache invalidation
- Active schema retrieval
- Comprehensive audit logging

**Purpose**:
MetaStore wraps registry + compiler operations into simplified high-level workflows, reducing boilerplate for common operations.

**Key Methods**:
```typescript
class MetaStoreService implements MetaStore {
  getCompiledModel(entityName, version?): Promise<CompiledModel>
  createEntityWithVersion(name, description, initialVersion, schema, ctx): Promise<{entity, version, compiledModel}>
  publishVersion(entityName, version, schema, ctx): Promise<{version, compiledModel}>
  getActiveSchema(entityName): Promise<EntitySchema | undefined>
  switchVersion(entityName, newVersion, ctx): Promise<{version, compiledModel}>
  healthCheck(): Promise<HealthCheckResult>
}
```

**Workflows**:

1. **Create Entity with Version** (atomic):
   - Validate schema
   - Create entity
   - Create version
   - Activate version
   - Compile model
   - Log audit event

2. **Publish Version** (create + activate):
   - Validate schema
   - Verify entity exists
   - Create new version
   - Activate new version
   - Compile model
   - Log audit event with previous version

3. **Switch Version** (change active):
   - Verify entity and version exist
   - Activate new version
   - Invalidate old compiled cache
   - Compile new version
   - Log audit event with from/to versions

4. **Get Compiled Model** (auto-compile):
   - Resolve active version if not specified
   - Get from cache or compile
   - Return compiled model

**Benefits**:
- Reduces code duplication
- Ensures proper audit logging
- Handles cache invalidation automatically
- Provides atomic operations for complex workflows
- Simplifies client code

**Total**: 6 methods, ~360 lines

---

### 7. Service Factory ✅

**File**: `framework/runtime/src/services/meta/factory.ts`

Factory function to create and wire all META services.

**Purpose**:
- Creates services in correct dependency order
- Wires dependencies between services
- Provides single entry point for service creation

**Dependency Graph**:

```
MetaRegistryService
  ↓
MetaCompilerService (depends on registry)
  ↓
AuditLoggerService (independent)
  ↓
PolicyGateService (depends on compiler)
  ↓
GenericDataAPIService (depends on compiler, policyGate, auditLogger)
  ↓
MetaStoreService (depends on registry, compiler, auditLogger)
```

**Usage**:

```typescript
import { createMetaServices } from "./services/meta/factory";

const metaServices = createMetaServices({
  db: kyselyInstance,
  cache: redisInstance,
  cacheTTL: 3600,
  enableCache: true,
});

// Returns:
// {
//   registry: MetaRegistryService,
//   compiler: MetaCompilerService,
//   policyGate: PolicyGateService,
//   auditLogger: AuditLoggerService,
//   dataAPI: GenericDataAPIService,
//   metaStore: MetaStoreService,
// }
```

---

## Build Verification

```bash
$ cd framework/runtime
$ pnpm build

> @athyper/runtime@0.1.0 build
> tsup src/index.ts --format esm --sourcemap --outDir dist && tsc --declaration --emitDeclarationOnly --outDir dist

✓ ESM Build success in 89ms

Output:
  dist/index.js      54.55 KB
  dist/index.js.map  132.41 KB
```

✅ **All builds passing**

---

## Code Statistics

- **Total Services**: 6 services (5 core + 1 high-level)
- **Total Methods**: 44 methods across all services
- **Total Lines**: ~1,900 lines of implementation code
- **Dependencies**:
  - `kysely` - Type-safe SQL query builder
  - `ioredis` - Redis client for caching
  - `@athyper/core/meta` - TYPE contracts
  - `@athyper/adapter-db` - Database types

---

## Service Integration

### Service Dependencies

```
Database (Kysely<DB>) ──┬──> MetaRegistryService
                        ├──> AuditLoggerService
                        └──> GenericDataAPIService

Redis Cache ────────────────> MetaCompilerService

MetaRegistryService ────┬───> MetaCompilerService
                        └───> MetaStoreService

MetaCompilerService ────┬───> PolicyGateService
                        ├───> GenericDataAPIService
                        └───> MetaStoreService

PolicyGateService ──────────> GenericDataAPIService

AuditLoggerService ─────┬───> GenericDataAPIService
                        └───> MetaStoreService
```

### Service Lifecycle

1. **Startup**: Create services via factory in dependency order
2. **Registration**: Register services in DI container with META_TOKENS
3. **Compilation**: Optionally precompile all active entity versions
4. **Runtime**: Services resolve dependencies from DI container
5. **Health Checks**: All services provide health check endpoints

---

## Usage Examples

### 1. Create Entity with Version

```typescript
import { META_TOKENS } from "@athyper/core/meta";

// Resolve services from DI container
const registry = container.get(META_TOKENS.registry);
const compiler = container.get(META_TOKENS.compiler);

// Create entity
const entity = await registry.createEntity(
  "Invoice",
  "Customer invoices",
  { userId: "admin", tenantId: "t1", realmId: "main", roles: ["admin"] }
);

// Create version
const version = await registry.createVersion(
  "Invoice",
  "v1",
  {
    fields: [
      { name: "invoiceNumber", type: "string", required: true },
      { name: "totalAmount", type: "number", required: true },
    ],
    policies: [
      {
        name: "invoice_read",
        effect: "allow",
        action: "read",
        resource: "Invoice",
      },
    ],
  },
  ctx
);

// Activate version
await registry.activateVersion("Invoice", "v1", ctx);

// Compile (happens automatically, but can be explicit)
const compiledModel = await compiler.compile("Invoice", "v1");
```

### 2. Query Data with Generic API

```typescript
import { META_TOKENS } from "@athyper/core/meta";

const dataAPI = container.get(META_TOKENS.dataAPI);

// List invoices
const invoices = await dataAPI.list("Invoice", ctx, {
  page: 1,
  pageSize: 20,
  orderBy: "createdAt",
  orderDir: "desc",
});

console.log(invoices.data);        // Array of invoice records
console.log(invoices.meta.total);  // Total count

// Get single invoice
const invoice = await dataAPI.get("Invoice", "inv_123", ctx);

// Count invoices
const count = await dataAPI.count("Invoice", ctx);
```

### 3. Policy Enforcement

```typescript
import { META_TOKENS } from "@athyper/core/meta";

const policyGate = container.get(META_TOKENS.policyGate);

// Check permission
const canRead = await policyGate.can("read", "Invoice", ctx);

if (canRead) {
  // Proceed with operation
}

// Or enforce (throws if denied)
await policyGate.enforce("read", "Invoice", ctx);
// Continues if allowed, throws if denied
```

### 4. Audit Trail Query

```typescript
import { META_TOKENS } from "@athyper/core/meta";

const auditLogger = container.get(META_TOKENS.auditLogger);

// Query audit events
const events = await auditLogger.query({
  resource: "Invoice",
  userId: "user123",
  eventType: ["data.read", "data.create"],
  startDate: new Date("2026-02-01"),
  page: 1,
  pageSize: 50,
});

// Get recent events
const recent = await auditLogger.getRecent(10);

// Get tenant audit trail
const tenantEvents = await auditLogger.getTenantAudit("customer-a");
```

### 5. MetaStore High-Level Workflows

```typescript
import { META_TOKENS } from "@athyper/core/meta";

const metaStore = container.get(META_TOKENS.metaStore);

// Create entity with initial version (atomic operation)
const result = await metaStore.createEntityWithVersion(
  "Product",
  "Product catalog",
  "v1",
  {
    fields: [
      { name: "sku", type: "string", required: true, unique: true },
      { name: "name", type: "string", required: true },
      { name: "price", type: "number", required: true },
      { name: "inStock", type: "boolean", required: false },
    ],
    policies: [
      {
        name: "product_read",
        effect: "allow",
        action: "read",
        resource: "Product",
      },
    ],
  },
  ctx
);

console.log(result.entity);        // Entity created
console.log(result.version);       // Version v1 created and activated
console.log(result.compiledModel); // Compiled and cached

// Publish new version (create + activate + compile)
const v2 = await metaStore.publishVersion(
  "Product",
  "v2",
  {
    fields: [
      // ... updated schema with new fields
    ],
    policies: [
      // ... updated policies
    ],
  },
  ctx
);

// Get compiled model (auto-resolves active version)
const compiled = await metaStore.getCompiledModel("Product");

// Get active schema
const schema = await metaStore.getActiveSchema("Product");

// Switch to different version
const switched = await metaStore.switchVersion("Product", "v1", ctx);
```

---

## Next Steps

Phase 3 implementation is **complete**, including all 6 services:

- ✅ MetaRegistryService
- ✅ MetaCompilerService
- ✅ PolicyGateService
- ✅ AuditLoggerService
- ✅ GenericDataAPIService
- ✅ MetaStoreService (high-level workflows)

Potential next steps:

### Phase 3.1: DI Container Registration
Register META services in runtime kernel:
```typescript
// In kernel bootstrap
const metaServices = createMetaServices({
  db: container.get(TOKENS.db),
  cache: container.get(TOKENS.cache),
});

container.register(META_TOKENS.registry, metaServices.registry);
container.register(META_TOKENS.compiler, metaServices.compiler);
container.register(META_TOKENS.policyGate, metaServices.policyGate);
container.register(META_TOKENS.auditLogger, metaServices.auditLogger);
container.register(META_TOKENS.dataAPI, metaServices.dataAPI);
container.register(META_TOKENS.metaStore, metaServices.metaStore);
```

### Phase 4: Integration Testing
- Test full workflow: create entity → compile → query data
- Test policy enforcement
- Test tenant isolation
- Test audit logging
- Test cache invalidation

### Phase 5: REST API Endpoints
Create HTTP endpoints for META Engine:
- `POST /api/meta/entities` - Create entity
- `POST /api/meta/entities/:name/versions` - Create version
- `POST /api/meta/entities/:name/versions/:version/activate` - Activate version
- `GET /api/data/:entity` - List records
- `GET /api/data/:entity/:id` - Get record

### Phase 6: Advanced Features
- Write operations (create, update, delete)
- Advanced policy conditions (runtime evaluation)
- Field-level policies
- Row-level security
- GraphQL API
- Real-time subscriptions

---

## References

- [Phase 0.1: MVP Contract](./mvp.md)
- [Phase 1: Database Foundation](./phase-1-complete.md)
- [Phase 2: Core META Contracts](./phase-2-complete.md)
- [Registry Service](../../framework/runtime/src/services/meta/registry.service.ts)
- [Compiler Service](../../framework/runtime/src/services/meta/compiler.service.ts)
- [Policy Gate Service](../../framework/runtime/src/services/meta/policy-gate.service.ts)
- [Audit Logger Service](../../framework/runtime/src/services/meta/audit-logger.service.ts)
- [Generic Data API Service](../../framework/runtime/src/services/meta/generic-data-api.service.ts)
- [Service Factory](../../framework/runtime/src/services/meta/factory.ts)

---

**Phase 3 Status**: ✅ **COMPLETE**

All core runtime services implemented and verified!
