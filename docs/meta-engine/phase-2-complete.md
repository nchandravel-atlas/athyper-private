# Phase 2: Core META Contracts - COMPLETE ✅

**Completed**: 2026-02-04
**Status**: All Phase 2 deliverables complete

---

## Objectives

✅ Pure TypeScript types and interfaces (zero implementation)
✅ Entity schema types (EntitySchema, FieldDefinition, PolicyDefinition)
✅ Compiled model types (CompiledModel, CompiledField)
✅ Service interfaces (MetaRegistry, MetaCompiler, PolicyGate, AuditLogger, GenericDataAPI)
✅ DI tokens for all services
✅ Build verification

---

## Deliverables

### 1. Type Definitions ✅

**File**: `framework/core/src/meta/types.ts`

Comprehensive type system for META Engine including:

#### Field & Schema Types
- `FieldType` - Supported data types (string, number, boolean, date, datetime, reference, enum, json)
- `FieldDefinition` - Complete field specification with validation rules
- `EntitySchema` - Full entity schema (fields + policies + metadata)

#### Policy Types
- `PolicyEffect` - "allow" | "deny"
- `PolicyAction` - "create" | "read" | "update" | "delete" | "*"
- `PolicyOperator` - Comparison operators (eq, ne, in, gt, contains, etc.)
- `PolicyCondition` - Policy evaluation conditions
- `PolicyDefinition` - Complete policy specification

#### Compiled Types
- `CompiledField` - Optimized field for runtime (with SQL fragments)
- `CompiledPolicy` - Optimized policy with evaluator function
- `CompiledModel` - Complete compiled IR with pre-built query fragments

#### Context & Audit Types
- `RequestContext` - Tenant isolation and user context
- `AuditEventType` - 24 event types for audit trail
- `AuditEvent` - Complete audit event structure

#### Query Types
- `ListOptions` - Pagination, sorting, filtering
- `PaginatedResponse<T>` - Standardized paginated response

#### Entity Types
- `Entity` - Entity record (matches Prisma `MetaEntity`)
- `EntityVersion` - Version record (matches Prisma `MetaVersion`)

#### Validation & Health
- `ValidationResult` - Schema validation result
- `ValidationError` - Validation error details
- `HealthCheckResult` - Service health check result

**Total**: 20+ core types exported

---

### 2. Service Contracts ✅

**File**: `framework/core/src/meta/contracts.ts`

Pure interface definitions for all META Engine services:

#### MetaRegistry
Entity and version CRUD operations:
```typescript
interface MetaRegistry {
  // Entity operations
  createEntity(name, description, ctx): Promise<Entity>;
  getEntity(name): Promise<Entity | undefined>;
  listEntities(options?): Promise<PaginatedResponse<Entity>>;
  updateEntity(name, updates, ctx): Promise<Entity>;
  deleteEntity(name, ctx): Promise<void>;

  // Version operations
  createVersion(entityName, version, schema, ctx): Promise<EntityVersion>;
  getVersion(entityName, version): Promise<EntityVersion | undefined>;
  getActiveVersion(entityName): Promise<EntityVersion | undefined>;
  listVersions(entityName, options?): Promise<PaginatedResponse<EntityVersion>>;
  activateVersion(entityName, version, ctx): Promise<EntityVersion>;
  deactivateVersion(entityName, version, ctx): Promise<EntityVersion>;
  updateVersion(entityName, version, schema, ctx): Promise<EntityVersion>;
  deleteVersion(entityName, version, ctx): Promise<void>;
}
```

**Methods**: 13 methods covering all entity/version operations

#### MetaCompiler
Schema compilation and caching:
```typescript
interface MetaCompiler {
  compile(entityName, version): Promise<CompiledModel>;
  recompile(entityName, version): Promise<CompiledModel>;
  validate(schema): Promise<ValidationResult>;
  invalidateCache(entityName, version): Promise<void>;
  getCached(entityName, version): Promise<CompiledModel | undefined>;
  precompileAll(): Promise<CompiledModel[]>;
  healthCheck(): Promise<HealthCheckResult>;
}
```

**Methods**: 7 methods for compilation pipeline

#### PolicyGate
Policy evaluation and enforcement:
```typescript
interface PolicyGate {
  can(action, resource, ctx, record?): Promise<boolean>;
  enforce(action, resource, ctx, record?): Promise<void>;
  getPolicies(action, resource): Promise<Array<{name, effect}>>;
  evaluatePolicy(policyName, ctx, record?): Promise<boolean>;
  invalidatePolicyCache(resource): Promise<void>;
  healthCheck(): Promise<HealthCheckResult>;
}
```

**Methods**: 6 methods for policy enforcement

#### AuditLogger
Audit trail management:
```typescript
interface AuditLogger {
  log(event): Promise<void>;
  query(filters): Promise<PaginatedResponse<AuditEvent>>;
  getEvent(eventId): Promise<AuditEvent | undefined>;
  getRecent(limit?): Promise<AuditEvent[]>;
  getResourceAudit(resource, options?): Promise<PaginatedResponse<AuditEvent>>;
  getUserAudit(userId, options?): Promise<PaginatedResponse<AuditEvent>>;
  getTenantAudit(tenantId, options?): Promise<PaginatedResponse<AuditEvent>>;
  healthCheck(): Promise<HealthCheckResult>;
}
```

**Methods**: 8 methods for audit operations

#### GenericDataAPI
Generic CRUD for META-defined entities (MVP: read-only):
```typescript
interface GenericDataAPI {
  list<T>(entityName, ctx, options?): Promise<PaginatedResponse<T>>;
  get<T>(entityName, id, ctx): Promise<T | undefined>;
  count(entityName, ctx, filters?): Promise<number>;
  healthCheck(): Promise<HealthCheckResult>;

  // Future (post-MVP):
  // create, update, delete
}
```

**Methods**: 4 methods (read-only MVP)

#### MetaStore
High-level convenience service:
```typescript
interface MetaStore {
  getCompiledModel(entityName, version?): Promise<CompiledModel>;
  getEntityWithCompiledModel(entityName): Promise<{entity, compiledModel}>;
  createEntityWithVersion(name, description, schema, ctx): Promise<{entity, version}>;
  publishVersion(entityName, version, schema, ctx): Promise<{version, compiledModel}>;
  getSchema(entityName): Promise<EntitySchema | undefined>;
  healthCheck(): Promise<HealthCheckResult>;
}
```

**Methods**: 6 methods for common workflows

**Total**: 6 service interfaces, 44 methods

---

### 3. DI Tokens ✅

**File**: `framework/core/src/meta/tokens.ts`

Dependency injection tokens for all services:

```typescript
export const META_TOKENS = {
  // Core services
  registry: "meta.registry",
  compiler: "meta.compiler",
  policyGate: "meta.policyGate",
  auditLogger: "meta.auditLogger",
  dataAPI: "meta.dataAPI",
  store: "meta.store",

  // Cache
  compiledModelCache: "meta.cache.compiledModel",
  policyCache: "meta.cache.policy",

  // Configuration
  config: "meta.config",

  // Health
  healthRegistry: "meta.health",
} as const;
```

**Type Safety**:
```typescript
export interface MetaTokenTypes {
  [META_TOKENS.registry]: MetaRegistry;
  [META_TOKENS.compiler]: MetaCompiler;
  [META_TOKENS.policyGate]: PolicyGate;
  [META_TOKENS.auditLogger]: AuditLogger;
  [META_TOKENS.dataAPI]: GenericDataAPI;
  [META_TOKENS.store]: MetaStore;
  // ... more
}

export type MetaTokenValue<T extends MetaTokenName> =
  T extends keyof MetaTokenTypes ? MetaTokenTypes[T] : unknown;
```

**Configuration Type**:
```typescript
export type MetaEngineConfig = {
  enableCache: boolean;               // default: true
  cacheTTL: number;                   // default: 3600 (1 hour)
  enablePolicyCache: boolean;         // default: true
  policyCacheTTL: number;             // default: 300 (5 minutes)
  enableAudit: boolean;               // default: true
  auditRetentionDays: number;         // default: 90
  maxPageSize: number;                // default: 100
  defaultPageSize: number;            // default: 20
  enableSchemaValidation: boolean;    // default: true
  precompileOnStartup: boolean;       // default: false
};
```

**Total**: 10 tokens + configuration type

---

### 4. Public Exports ✅

**File**: `framework/core/src/meta/index.ts`

Complete re-export of all types, interfaces, and tokens:

```typescript
// Type exports
export type {
  // Field types
  FieldType, FieldDefinition,
  // Policy types
  PolicyEffect, PolicyAction, PolicyOperator, PolicyCondition, PolicyDefinition,
  // Schema types
  EntitySchema,
  // Compiled types
  CompiledField, CompiledPolicy, CompiledModel,
  // Context types
  RequestContext,
  // Audit types
  AuditEventType, AuditEvent,
  // Query types
  ListOptions, PaginatedResponse,
  // Entity types
  Entity, EntityVersion,
  // Validation types
  ValidationResult, ValidationError,
  // Health check
  HealthCheckResult,
} from "./types.js";

// Service contracts
export type {
  MetaRegistry, MetaCompiler, PolicyGate,
  AuditLogger, GenericDataAPI, MetaStore,
  AuditQueryFilters,
} from "./contracts.js";

// Tokens
export { META_TOKENS } from "./tokens.js";
export type {
  MetaTokenName, MetaTokenKey,
  MetaTokenTypes, MetaTokenValue,
  MetaEngineConfig,
} from "./tokens.js";
```

**Legacy Compatibility**:
- Kept deprecated `FieldMetadata`, `EntityMetadata`, `MetadataRegistry` for backward compatibility
- Marked with `@deprecated` JSDoc tags

---

### 5. Package Configuration ✅

**File**: `framework/core/package.json`

Added subpath export for META Engine:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./meta": {
      "types": "./dist/meta/index.d.ts",
      "import": "./dist/meta/index.js",
      "default": "./dist/meta/index.js"
    },
    "./package.json": "./package.json"
  }
}
```

**Why Subpath Export?**
- Avoids type name conflicts with DDD `Entity` (model/index.ts)
- Keeps META Engine as a distinct subsystem
- Cleaner imports: `import { META_TOKENS } from "@athyper/core/meta"`

---

## Usage Examples

### Registering Implementations

```typescript
import { META_TOKENS, type MetaRegistry } from "@athyper/core/meta";
import { MyMetaRegistryImpl } from "./implementations/meta-registry.js";

// Register implementation in DI container
container.register(META_TOKENS.registry, MyMetaRegistryImpl);

// Resolve service
const registry = container.get<MetaRegistry>(META_TOKENS.registry);
```

### Defining Entity Schema

```typescript
import type { EntitySchema } from "@athyper/core/meta";

const invoiceSchema: EntitySchema = {
  fields: [
    {
      name: "invoiceNumber",
      type: "string",
      required: true,
      unique: true,
      label: "Invoice Number",
    },
    {
      name: "totalAmount",
      type: "number",
      required: true,
      min: 0,
      label: "Total Amount",
    },
    {
      name: "dueDate",
      type: "date",
      required: false,
      label: "Due Date",
    },
  ],
  policies: [
    {
      name: "invoice_read_policy",
      effect: "allow",
      action: "read",
      resource: "Invoice",
      conditions: [
        {
          field: "user.role",
          operator: "in",
          value: ["admin", "manager", "user"],
        },
      ],
    },
  ],
  metadata: {
    label: "Invoice",
    description: "Customer invoice entity",
    icon: "receipt",
    color: "blue",
  },
};
```

### Using Services

```typescript
import { META_TOKENS, type MetaRegistry, type RequestContext } from "@athyper/core/meta";

// Create entity
const ctx: RequestContext = {
  userId: "user123",
  tenantId: "customer-a",
  realmId: "main",
  roles: ["admin"],
};

const entity = await metaRegistry.createEntity(
  "Invoice",
  "Customer invoice entity",
  ctx
);

// Create version
const version = await metaRegistry.createVersion(
  "Invoice",
  "v1",
  invoiceSchema,
  ctx
);

// Activate version
await metaRegistry.activateVersion("Invoice", "v1", ctx);

// Compile model
const compiledModel = await metaCompiler.compile("Invoice", "v1");

// Query data
const invoices = await dataAPI.list("Invoice", ctx, {
  page: 1,
  pageSize: 20,
  orderBy: "createdAt",
  orderDir: "desc",
});
```

---

## Build Verification

```bash
$ cd framework/core
$ pnpm build

> @athyper/core@0.1.0 build
> tsup src/index.ts --format esm --sourcemap --outDir dist && tsc --declaration --emitDeclarationOnly --outDir dist

✓ ESM Build success in 68ms

Output:
  dist/index.js      42.70 KB
  dist/index.js.map  95.44 KB
  dist/meta/index.d.ts      2.56 KB
  dist/meta/types.d.ts     10.49 KB
  dist/meta/contracts.d.ts  9.38 KB
  dist/meta/tokens.d.ts     3.97 KB
```

✅ **All builds passing**

---

## File Summary

### Files Created
1. `framework/core/src/meta/types.ts` - 670 lines
2. `framework/core/src/meta/contracts.ts` - 500 lines
3. `framework/core/src/meta/tokens.ts` - 210 lines

### Files Modified
1. `framework/core/src/meta/index.ts` - Updated with new exports
2. `framework/core/src/index.ts` - Removed `export * from "./meta"` to avoid conflicts
3. `framework/core/package.json` - Added `./meta` subpath export

### Files Generated (by build)
1. `framework/core/dist/meta/index.d.ts`
2. `framework/core/dist/meta/index.d.ts.map`
3. `framework/core/dist/meta/types.d.ts`
4. `framework/core/dist/meta/types.d.ts.map`
5. `framework/core/dist/meta/contracts.d.ts`
6. `framework/core/dist/meta/contracts.d.ts.map`
7. `framework/core/dist/meta/tokens.d.ts`
8. `framework/core/dist/meta/tokens.d.ts.map`

---

## Code Statistics

- **Total Lines**: ~1,380 lines
- **Type Definitions**: 20+ core types
- **Service Interfaces**: 6 interfaces, 44 methods
- **DI Tokens**: 10 tokens
- **Event Types**: 24 audit event types
- **Zero Implementation**: Pure contracts only

---

## Design Principles

### 1. Type Safety
- All types are strictly typed
- No `any` types used
- Generic types for flexibility (`PaginatedResponse<T>`, `Entity<ID>`)

### 2. Separation of Concerns
- Types in `types.ts`
- Interfaces in `contracts.ts`
- Tokens in `tokens.ts`
- Clear module boundaries

### 3. Extensibility
- Interfaces can be extended
- Types use `Record<string, unknown>` for extensible metadata
- Token types mapped for type-safe DI

### 4. Documentation
- JSDoc comments on all public APIs
- Examples in type comments
- Clear deprecation notices

### 5. Backward Compatibility
- Legacy types marked `@deprecated`
- Old `MetadataRegistry` class kept for compatibility
- Gradual migration path

---

## Next Steps

Phase 2 is complete. Ready to proceed to **Phase 3: Runtime Services**.

### Phase 3 Preview

Phase 3 will implement the service interfaces defined in Phase 2:

**Services to Implement**:
1. **MetaRegistryService** - PostgreSQL-backed entity/version CRUD
2. **MetaCompilerService** - Schema compilation with Redis caching
3. **PolicyGateService** - Policy evaluation engine
4. **AuditLoggerService** - PostgreSQL audit logging
5. **GenericDataAPIService** - Kysely-based generic queries

**Infrastructure**:
- Redis cache adapters for compiled models and policies
- Database repositories using Kysely
- Service registration in DI container
- Health checks for all services

**Deliverables**:
- `framework/runtime/src/services/meta/` - Service implementations
- Service registration in runtime kernel
- Integration tests for all services

---

## References

- [Phase 0.1: MVP Contract](./mvp.md)
- [Phase 1: Database Foundation](./phase-1-complete.md)
- [Types Source](../../framework/core/src/meta/types.ts)
- [Contracts Source](../../framework/core/src/meta/contracts.ts)
- [Tokens Source](../../framework/core/src/meta/tokens.ts)
- [Public Exports](../../framework/core/src/meta/index.ts)

---

**Phase 2 Status**: ✅ **COMPLETE**

Ready for Phase 3!
