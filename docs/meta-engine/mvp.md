# META Engine MVP Contract

**Version**: 1.0
**Status**: Phase 0.1 - Definition
**Last Updated**: 2026-02-04

---

## Overview

The META Engine is athyper's metadata framework that enables dynamic entity modeling, policy-driven access control, and runtime schema management. This document defines the **Minimum Viable Product (MVP)** scope for the first demo.

The MVP focuses on **read-only data access** with **basic policy enforcement**, demonstrating the core metadata compilation pipeline from definition to runtime execution.

---

## MVP Capabilities (First Demo)

### 1. Meta Registry CRUD

**Purpose**: Define and manage entity metadata (entities, versions, fields, policies)

**Components**:
- **Meta Registry Service**: CRUD operations for entity definitions
- **Version Management**: Support multiple versions of entity schemas (v1, v2, etc.)
- **Field Definitions**: Type-safe field schemas with validation rules
- **Audit Trail**: Track all metadata changes (who, when, what)

**Operations**:
```typescript
// Entity Management
createEntity(name: string, description?: string): Promise<Entity>
getEntity(entityName: string): Promise<Entity | undefined>
listEntities(): Promise<Entity[]>
deleteEntity(entityName: string): Promise<void>

// Version Management
createVersion(entityName: string, version: string, schema: EntitySchema): Promise<EntityVersion>
getVersion(entityName: string, version: string): Promise<EntityVersion | undefined>
listVersions(entityName: string): Promise<EntityVersion[]>
activateVersion(entityName: string, version: string): Promise<void>

// Field Management (within a version)
addField(entityName: string, version: string, field: FieldDefinition): Promise<void>
updateField(entityName: string, version: string, fieldName: string, updates: Partial<FieldDefinition>): Promise<void>
removeField(entityName: string, version: string, fieldName: string): Promise<void>
```

**Data Model**:
```typescript
type Entity = {
  name: string;              // e.g., "Invoice"
  description?: string;
  activeVersion?: string;    // e.g., "v1"
  createdAt: Date;
  updatedAt: Date;
}

type EntityVersion = {
  entityName: string;
  version: string;           // e.g., "v1", "v2"
  schema: EntitySchema;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

type EntitySchema = {
  fields: FieldDefinition[];
  policies?: PolicyDefinition[];
}

type FieldDefinition = {
  name: string;              // e.g., "totalAmount"
  type: FieldType;           // "string" | "number" | "boolean" | "date" | "reference"
  required: boolean;
  label?: string;
  description?: string;

  // Type-specific options
  referenceTo?: string;      // For reference fields
  enumValues?: string[];     // For enum fields

  // Validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;          // Regex pattern
  min?: number;              // For number fields
  max?: number;

  // UI hints
  placeholder?: string;
  helpText?: string;
}

type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "reference"
  | "enum"
  | "json";
```

**Storage**:
- Store in PostgreSQL using dedicated `meta_*` tables:
  - `meta_entities` - Entity definitions
  - `meta_versions` - Entity version schemas
  - `meta_audit` - Audit log for metadata changes

---

### 2. Compile Entity Version → Compiled Model IR

**Purpose**: Transform entity schema into optimized Intermediate Representation (IR) for runtime execution

**Compilation Pipeline**:
```
EntityVersion (JSON schema)
  ↓
Meta Compiler
  ↓
Compiled Model IR (optimized for Kysely queries)
  ↓
Runtime Cache (Redis)
```

**Compiled Model IR Structure**:
```typescript
type CompiledModel = {
  entityName: string;
  version: string;
  tableName: string;           // Physical table name (e.g., "ent_invoice")

  // Field mappings (schema → database)
  fields: CompiledField[];

  // Query fragments (pre-built SQL)
  selectFragment: string;      // SELECT clause
  fromFragment: string;        // FROM clause with tenant filter

  // Indexes (for query optimization)
  indexes: string[];

  // Metadata
  compiledAt: Date;
  compiledBy: string;
  hash: string;                // Schema hash for cache invalidation
}

type CompiledField = {
  name: string;                // Field name in API
  columnName: string;          // Column name in database
  type: FieldType;
  required: boolean;

  // Query helpers
  selectAs: string;            // e.g., "total_amount as totalAmount"

  // Validation (compiled)
  validator?: ValidatorFunction;
}
```

**Compiler Service**:
```typescript
interface MetaCompiler {
  compile(entityName: string, version: string): Promise<CompiledModel>
  recompile(entityName: string, version: string): Promise<CompiledModel>
  validate(schema: EntitySchema): Promise<ValidationResult>
}
```

**Compilation Steps**:
1. **Parse**: Parse entity schema from meta registry
2. **Validate**: Check for schema errors (invalid types, missing required fields, circular references)
3. **Transform**: Map schema fields to database columns
4. **Optimize**: Pre-build SQL fragments for common queries
5. **Cache**: Store compiled IR in Redis with TTL
6. **Audit**: Log compilation event

**Cache Strategy**:
- Key: `meta:compiled:{entityName}:{version}`
- TTL: 1 hour (refresh on access)
- Invalidation: On schema changes

---

### 3. Generic Read API (List + Get)

**Purpose**: Provide generic data access API using compiled models

**Endpoints**:
```
GET  /api/data/:entity       - List records
GET  /api/data/:entity/:id   - Get single record
```

**Query Builder (Kysely Integration)**:
```typescript
interface GenericDataAPI {
  list<T>(
    entityName: string,
    ctx: RequestContext,
    options?: ListOptions
  ): Promise<PaginatedResponse<T>>

  get<T>(
    entityName: string,
    id: string,
    ctx: RequestContext
  ): Promise<T | undefined>
}

type ListOptions = {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }
}
```

**Implementation Flow**:
1. **Load Compiled Model**: Fetch from cache or compile on-demand
2. **Build Query**: Use Kysely to build type-safe SQL
3. **Apply Tenant Filter**: Always filter by `tenant_id` and `realm_id`
4. **Execute Query**: Run against PostgreSQL
5. **Transform Response**: Map database columns to API fields
6. **Return Data**: JSON response

**Example Query Execution**:
```typescript
// User requests: GET /api/data/Invoice?page=1&pageSize=10

// 1. Load compiled model
const model = await compiler.compile("Invoice", "v1");

// 2. Build query
const query = db
  .selectFrom(model.tableName)
  .select(model.fields.map(f => f.selectAs))
  .where("tenant_id", "=", ctx.tenantId)
  .where("realm_id", "=", ctx.realmId)
  .orderBy("created_at", "desc")
  .limit(10)
  .offset(0);

// 3. Execute
const results = await query.execute();

// 4. Transform
const data = results.map(row => transformRow(row, model));

// 5. Return
return { data, meta: { page: 1, pageSize: 10, total: 100, totalPages: 10 } };
```

**Tenant Isolation**:
- All queries automatically filtered by `tenant_id` and `realm_id`
- No cross-tenant data leakage
- Enforced at query builder level

---

### 4. Policy Gate (Allow/Deny)

**Purpose**: Basic policy enforcement for read operations

**Policy Definition**:
```typescript
type PolicyDefinition = {
  name: string;              // e.g., "invoice_read_policy"
  effect: "allow" | "deny";
  action: string;            // "read" | "create" | "update" | "delete"
  resource: string;          // Entity name (e.g., "Invoice")

  // Conditions (basic)
  conditions?: PolicyCondition[];
}

type PolicyCondition = {
  field: string;             // Field to check
  operator: "eq" | "ne" | "in" | "not_in" | "gt" | "lt";
  value: unknown;
}
```

**Compiled Policy IR**:
```typescript
type CompiledPolicy = {
  name: string;
  effect: "allow" | "deny";
  action: string;
  resource: string;

  // Compiled evaluator function
  evaluate: (ctx: RequestContext, record?: unknown) => boolean;

  // Metadata
  compiledAt: Date;
  hash: string;
}
```

**Policy Evaluation Flow**:
```
Request → Load Policies → Evaluate → Allow/Deny → Execute Query
```

**Policy Gate Service**:
```typescript
interface PolicyGate {
  can(
    action: string,
    resource: string,
    ctx: RequestContext,
    record?: unknown
  ): Promise<boolean>

  enforce(
    action: string,
    resource: string,
    ctx: RequestContext,
    record?: unknown
  ): Promise<void>  // Throws if denied
}
```

**Example Policies**:
```typescript
// Policy 1: All authenticated users can read invoices
{
  name: "invoice_read_policy",
  effect: "allow",
  action: "read",
  resource: "Invoice",
  conditions: [] // No conditions = always allow
}

// Policy 2: Only users with role "admin" can read all invoices
{
  name: "invoice_read_admin",
  effect: "allow",
  action: "read",
  resource: "Invoice",
  conditions: [
    { field: "user.role", operator: "eq", value: "admin" }
  ]
}

// Policy 3: Users can only read their own invoices
{
  name: "invoice_read_own",
  effect: "allow",
  action: "read",
  resource: "Invoice",
  conditions: [
    { field: "record.userId", operator: "eq", value: "context.userId" }
  ]
}
```

**MVP Limitations**:
- Only `read` action supported (no create/update/delete)
- Basic condition operators (eq, ne, in, not_in, gt, lt)
- No policy inheritance or composition
- No dynamic role/permission resolution
- Policies evaluated in-memory (not pushed to database query)

---

### 5. Audit Logging

**Purpose**: Track all metadata changes and policy decisions for compliance and debugging

**Audit Events**:
```typescript
type AuditEvent = {
  eventId: string;
  eventType: AuditEventType;
  timestamp: Date;

  // Actor
  userId: string;
  tenantId: string;
  realmId: string;

  // Context
  action: string;           // e.g., "meta.entity.create", "policy.evaluate"
  resource: string;         // Entity name or policy name

  // Details
  details: Record<string, unknown>;

  // Result
  result: "success" | "failure";
  errorMessage?: string;
}

type AuditEventType =
  | "meta.entity.create"
  | "meta.entity.update"
  | "meta.entity.delete"
  | "meta.version.create"
  | "meta.version.activate"
  | "meta.field.add"
  | "meta.field.update"
  | "meta.field.remove"
  | "meta.compile"
  | "policy.evaluate"
  | "policy.deny"
  | "data.read";
```

**Audit Logger Service**:
```typescript
interface AuditLogger {
  log(event: AuditEvent): Promise<void>
  query(filters: AuditQueryFilters): Promise<AuditEvent[]>
}

type AuditQueryFilters = {
  eventType?: AuditEventType | AuditEventType[];
  userId?: string;
  tenantId?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}
```

**What Gets Audited**:

1. **Meta Changes**:
   - Entity created/updated/deleted
   - Version created/activated
   - Field added/updated/removed
   - Schema compiled

2. **Policy Decisions**:
   - Policy evaluated (allow/deny)
   - Policy compilation

3. **Data Access**:
   - Read operations (list/get)
   - Failed access attempts

**Storage**:
- Store in `meta_audit` table
- Partition by month for performance
- Retention: 90 days (configurable)

**Example Audit Log**:
```json
{
  "eventId": "evt_abc123",
  "eventType": "meta.entity.create",
  "timestamp": "2026-02-04T10:30:00Z",
  "userId": "user_xyz",
  "tenantId": "customer-a",
  "realmId": "main",
  "action": "meta.entity.create",
  "resource": "Invoice",
  "details": {
    "entityName": "Invoice",
    "description": "Customer invoice entity"
  },
  "result": "success"
}
```

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (HTTP)                        │
│  GET /api/meta/entities                                      │
│  GET /api/data/:entity                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Meta Registry│  │ Meta Compiler│  │ Generic Data │      │
│  │   Service    │  │   Service    │  │  API Service │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ Policy Gate  │  │ Audit Logger │                         │
│  │   Service    │  │   Service    │                         │
│  └──────────────┘  └──────────────┘                         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │ Redis Cache  │  │ Kysely Query │      │
│  │ (meta_*)     │  │ (compiled IR)│  │   Builder    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Meta Definition Flow**:
```
Admin UI → POST /api/meta/entities → Meta Registry Service
  → Store in PostgreSQL (meta_entities)
  → Audit Log
  → Return entity ID
```

**Compilation Flow**:
```
Activate Version → Meta Compiler Service
  → Load schema from PostgreSQL
  → Validate schema
  → Generate Compiled Model IR
  → Store in Redis cache
  → Audit Log
  → Return compiled model
```

**Read Request Flow**:
```
Client → GET /api/data/Invoice → Generic Data API Service
  → Load compiled model (from cache or compile)
  → Policy Gate (evaluate policies)
  → Build Kysely query (with tenant filter)
  → Execute query on PostgreSQL
  → Transform results
  → Audit Log
  → Return data
```

---

## Database Schema (MVP)

### Meta Tables

```sql
-- Entity definitions
CREATE TABLE meta_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  active_version VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL
);

-- Entity versions
CREATE TABLE meta_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name VARCHAR(255) NOT NULL REFERENCES meta_entities(name) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  schema JSONB NOT NULL,           -- EntitySchema as JSON
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  UNIQUE(entity_name, version)
);

-- Audit log
CREATE TABLE meta_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  realm_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  details JSONB,
  result VARCHAR(50) NOT NULL,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_meta_versions_entity ON meta_versions(entity_name);
CREATE INDEX idx_meta_versions_active ON meta_versions(entity_name, is_active);
CREATE INDEX idx_meta_audit_tenant ON meta_audit(tenant_id, timestamp DESC);
CREATE INDEX idx_meta_audit_user ON meta_audit(user_id, timestamp DESC);
CREATE INDEX idx_meta_audit_resource ON meta_audit(resource, timestamp DESC);
```

---

## Implementation Checklist

### Phase 0.1 Deliverable
- [x] Define MVP capabilities (this document)
- [x] Define non-goals (see below)
- [ ] Review with team
- [ ] Finalize scope

### Phase 1: Database Foundation
- [ ] Create migration for meta tables (`meta_entities`, `meta_versions`, `meta_audit`)
- [ ] Set up Kysely schema types for meta tables
- [ ] Verify Prisma doesn't conflict with meta tables

### Phase 2: Core META Contracts
- [ ] Define TypeScript types (`Entity`, `EntityVersion`, `CompiledModel`, `PolicyDefinition`)
- [ ] Create DI tokens for meta services
- [ ] Set up core interfaces (`MetaRegistry`, `MetaCompiler`, `PolicyGate`, `AuditLogger`)

### Phase 3: Runtime Services
- [ ] Implement Meta Registry Service (CRUD operations)
- [ ] Implement Meta Compiler Service (schema → IR)
- [ ] Implement Redis cache for compiled models
- [ ] Implement Audit Logger Service

### Phase 4: Generic Data API
- [ ] Implement Generic Data API Service (list + get)
- [ ] Build Kysely query builder integration
- [ ] Add tenant isolation enforcement
- [ ] Add response transformation

### Phase 5: Policy Engine MVP
- [ ] Implement basic Policy Gate (read-only)
- [ ] Build policy evaluator for simple conditions
- [ ] Add policy caching
- [ ] Add policy audit logging

### Phase 6: META Studio APIs
- [ ] Create REST endpoints for meta management
- [ ] Add entity CRUD endpoints
- [ ] Add version management endpoints
- [ ] Add field management endpoints

### Phase 7: Testing
- [ ] Unit tests for Meta Compiler
- [ ] Unit tests for Policy Gate
- [ ] Integration tests for Generic Data API
- [ ] E2E test: Create entity → Read data

### Phase 8: Documentation
- [ ] API documentation (OpenAPI spec)
- [ ] Architecture diagrams
- [ ] Usage examples
- [ ] Migration guide

---

## Explicit Non-Goals (Postponed)

These features are **explicitly postponed** to later phases:

### 1. Schema Auto-Migrations

**Not in MVP**:
- Automatic creation of `ent_*` or `doc_*` tables from entity schemas
- ALTER TABLE operations when schema changes
- Data migration scripts for schema evolution

**Workaround for MVP**:
- Manually create tables to match entity schemas
- Use existing tables (`ent_invoice`, `doc_invoice`) for demo

**Future Phase**: Phase 2+ (after MVP validation)

---

### 2. Full Workflow Execution

**Not in MVP**:
- Approval workflows (multi-step approvals)
- Timer-based triggers (scheduled tasks)
- Workflow state machine execution
- Human task assignment
- Workflow versioning

**Workaround for MVP**:
- No workflows in first demo
- Focus on read-only data access

**Future Phase**: Phase 7+ (Workflow Engine)

---

### 3. Overlays Resolution

**Not in MVP**:
- Org-level field overlays (hiding/showing fields per org)
- Tenant-level schema customization
- Dynamic field visibility based on context
- Overlay inheritance and merging

**Workaround for MVP**:
- All tenants see same fields for an entity
- No per-tenant customization

**Future Phase**: Phase 3+ (after core engine stable)

**Rationale**: Overlays add significant complexity to compilation and caching. Better to get base engine right first.

---

### 4. Write Operations (Create/Update/Delete)

**Not in MVP**:
- POST /api/data/:entity (create)
- PUT /api/data/:entity/:id (update)
- DELETE /api/data/:entity/:id (delete)

**Workaround for MVP**:
- Read-only API (list + get only)
- Seed demo data manually

**Future Phase**: Phase 4+ (after read API proven)

**Rationale**: Write operations require more complex policy enforcement, validation, and transaction handling.

---

### 5. Advanced Policy Features

**Not in MVP**:
- Role-based policies (dynamic role resolution)
- Policy composition (AND/OR of multiple policies)
- Policy inheritance (realm → tenant → org)
- Field-level policies (hide specific fields)
- Row-level security (filter records by policy)

**Workaround for MVP**:
- Simple allow/deny policies only
- Evaluate policies in-memory (not at database level)

**Future Phase**: Phase 5+ (Policy Engine V2)

---

### 6. Advanced Query Features

**Not in MVP**:
- Complex filters (AND/OR combinations)
- Joins across entities
- Aggregations (COUNT, SUM, AVG)
- Full-text search
- GraphQL API

**Workaround for MVP**:
- Simple equality filters only
- Single-entity queries only
- REST API only

**Future Phase**: Phase 4+ (Query Builder V2)

---

### 7. Real-time Updates

**Not in MVP**:
- WebSocket subscriptions for data changes
- Server-sent events (SSE)
- Real-time notifications

**Workaround for MVP**:
- Polling for updates

**Future Phase**: Phase 6+

---

### 8. Multi-version Support in Queries

**Not in MVP**:
- Reading from multiple entity versions in single query
- Version migration UI
- Side-by-side version comparison

**Workaround for MVP**:
- Only active version queryable
- Manual version switching

**Future Phase**: Phase 3+

---

## Success Criteria

The MVP is considered successful if:

1. **Entity Definition**:
   - ✅ Admin can create entity "Invoice" with 5+ fields
   - ✅ Admin can activate version v1
   - ✅ All changes are audit logged

2. **Compilation**:
   - ✅ Schema compiles to Compiled Model IR
   - ✅ Compiled model cached in Redis
   - ✅ Cache hit on subsequent requests

3. **Data Access**:
   - ✅ GET /api/data/Invoice returns paginated list
   - ✅ GET /api/data/Invoice/{id} returns single record
   - ✅ Tenant isolation enforced (no cross-tenant data)

4. **Policy Enforcement**:
   - ✅ Policy "allow read" permits query
   - ✅ Policy "deny read" blocks query
   - ✅ Policy decisions audit logged

5. **Performance**:
   - ✅ List query < 100ms (cached model)
   - ✅ Get query < 50ms
   - ✅ Compilation < 500ms

6. **Observability**:
   - ✅ Audit log shows all meta changes
   - ✅ Audit log shows all policy decisions
   - ✅ Health check includes meta services

---

## Risk Mitigation

### Risk 1: Schema Complexity Explosion

**Risk**: Entity schemas become too complex to compile efficiently

**Mitigation**:
- Limit MVP to 20 fields per entity
- No nested objects in MVP (flat schema only)
- Monitor compilation time in tests

---

### Risk 2: Cache Invalidation Issues

**Risk**: Stale compiled models in cache after schema changes

**Mitigation**:
- Include schema hash in cache key
- Invalidate on version activation
- Add manual cache clear endpoint for debugging

---

### Risk 3: Policy Evaluation Performance

**Risk**: Policy evaluation becomes bottleneck for high-volume reads

**Mitigation**:
- Cache policy evaluation results (per user/resource combo)
- Limit to 5 policies per entity in MVP
- Monitor policy eval time in metrics

---

### Risk 4: Tenant Isolation Bypass

**Risk**: Bug in query builder allows cross-tenant data access

**Risk Level**: **CRITICAL**

**Mitigation**:
- All queries go through centralized query builder
- Tenant filter added at builder level (not in service code)
- Integration tests for tenant isolation
- Security review before production

---

## Next Steps

1. **Review this document** with team (architecture, product, security)
2. **Finalize scope** - confirm MVP capabilities and non-goals
3. **Proceed to Phase 1** - Database foundation + codegen alignment
4. **Create task breakdown** for implementation phases

---

## Appendix: Example Scenarios

### Scenario 1: Create Invoice Entity

```typescript
// 1. Admin creates entity
POST /api/meta/entities
{
  "name": "Invoice",
  "description": "Customer invoices"
}
// Returns: { id: "ent_abc123", name: "Invoice" }

// 2. Admin creates version v1 with schema
POST /api/meta/entities/Invoice/versions
{
  "version": "v1",
  "schema": {
    "fields": [
      { name: "invoiceNumber", type: "string", required: true },
      { name: "customerId", type: "reference", referenceTo: "Customer", required: true },
      { name: "totalAmount", type: "number", required: true },
      { name: "status", type: "enum", enumValues: ["draft", "sent", "paid"], required: true },
      { name: "dueDate", type: "date", required: false }
    ]
  }
}
// Returns: { id: "ver_xyz789", version: "v1", compiledAt: "2026-02-04T..." }

// 3. Admin activates version
POST /api/meta/entities/Invoice/versions/v1/activate
// Triggers compilation and caching

// 4. Check audit log
GET /api/meta/audit?resource=Invoice
// Returns audit events for all Invoice changes
```

### Scenario 2: Read Invoice Data

```typescript
// User requests invoice list
GET /api/data/Invoice?page=1&pageSize=10

// Backend flow:
// 1. Load compiled model from cache
const model = await compiler.compile("Invoice", "v1");

// 2. Evaluate policy
const allowed = await policyGate.can("read", "Invoice", ctx);
if (!allowed) throw new ForbiddenError();

// 3. Build query
const query = db
  .selectFrom("ent_invoice")
  .select(["invoice_number as invoiceNumber", "total_amount as totalAmount", ...])
  .where("tenant_id", "=", ctx.tenantId)
  .limit(10);

// 4. Execute
const results = await query.execute();

// 5. Audit log
await auditLogger.log({
  eventType: "data.read",
  resource: "Invoice",
  result: "success"
});

// 6. Return
return { data: results, meta: { page: 1, pageSize: 10, total: 42 } };
```

### Scenario 3: Policy Deny

```typescript
// User with role "guest" tries to read invoices
GET /api/data/Invoice

// Backend flow:
// 1. Load policy
const policy = {
  name: "invoice_read_policy",
  effect: "allow",
  action: "read",
  resource: "Invoice",
  conditions: [
    { field: "user.role", operator: "eq", value: "admin" }
  ]
};

// 2. Evaluate
const ctx = { userId: "user123", roles: ["guest"] };
const allowed = policy.conditions.every(c => evaluate(c, ctx));
// Result: false (guest !== admin)

// 3. Audit log
await auditLogger.log({
  eventType: "policy.deny",
  resource: "Invoice",
  result: "failure",
  errorMessage: "Policy denied: invoice_read_policy"
});

// 4. Return 403
throw new ForbiddenError("Access denied by policy");
```

---

**End of MVP Contract**
