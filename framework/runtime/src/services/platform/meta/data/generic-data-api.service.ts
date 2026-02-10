/**
 * Generic Data API Service Implementation
 *
 * Provides generic CRUD operations for META-defined entities.
 * MVP: Read-only (list + get + count)
 * Uses Kysely for type-safe queries with automatic tenant isolation.
 */

import { sql, type Kysely } from "kysely";

import { QueryValidatorService, DEFAULT_QUERY_LIMITS } from "./query-validator.service.js";

import type { DB } from "@athyper/adapter-db";
import type {
  GenericDataAPI,
  MetaCompiler,
  PolicyGate,
  AuditLogger,
  LifecycleManager,
  RequestContext,
  ListOptions,
  PaginatedResponse,
  HealthCheckResult,
  CompiledField,
  CompiledModel,
  BulkOperationResult,
  LifecycleTransitionResult,
} from "@athyper/core/meta";

/**
 * Generic Data API Service
 * Provides generic read operations for all META-defined entities
 */
export class GenericDataAPIService implements GenericDataAPI {
  private readonly queryValidator: QueryValidatorService;

  constructor(
    private readonly db: Kysely<DB>,
    private readonly compiler: MetaCompiler,
    private readonly policyGate: PolicyGate,
    private readonly auditLogger: AuditLogger,
    private readonly lifecycleManager?: LifecycleManager
  ) {
    // Initialize query validator with default limits
    this.queryValidator = new QueryValidatorService(DEFAULT_QUERY_LIMITS);
  }

  async list<T = unknown>(
    entityName: string,
    ctx: RequestContext,
    options: ListOptions = {}
  ): Promise<PaginatedResponse<T>> {
    // Check policy
    await this.policyGate.enforce("read", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1"); // TODO: get active version

    // Validate query safety (pagination, sort fields)
    const validated = this.queryValidator.validateQuery(model, {
      page: options.page,
      pageSize: options.pageSize,
      sorts: options.orderBy
        ? [{ field: options.orderBy, direction: (options.orderDir ?? "desc") as "asc" | "desc" }]
        : [],
    });

    const page = validated.page;
    const pageSize = validated.pageSize;
    const offset = (page - 1) * pageSize;

    // Use validated and safe column name
    const orderBy = options.orderBy
      ? this.queryValidator.getSafeColumnName(model, options.orderBy)
      : "created_at";
    const orderDir = options.orderDir ?? "desc";

    try {
      // CRITICAL: Validate table name is from compiled model only
      // Never allow client-controlled table names (SQL injection prevention)
      const safeTableName = this.queryValidator.validateTableName(model);

      // Filter out soft-deleted records unless explicitly requested
      const includeDeleted = options.includeDeleted ?? false;

      // Execute count and data queries using sql tagged template
      // IMPORTANT: Use safeTableName from compiled model, never from client input
      const [countResult, dataResult] = await Promise.all([
        sql`
          SELECT COUNT(*) as count
          FROM ${sql.table(safeTableName)}
          WHERE tenant_id = ${ctx.tenantId}
            AND realm_id = ${ctx.realmId}
            ${includeDeleted ? sql.raw("") : sql.raw("AND deleted_at IS NULL")}
        `.execute(this.db),
        sql`
          SELECT *
          FROM ${sql.table(safeTableName)}
          WHERE tenant_id = ${ctx.tenantId}
            AND realm_id = ${ctx.realmId}
            ${includeDeleted ? sql.raw("") : sql.raw("AND deleted_at IS NULL")}
          ORDER BY ${sql.ref(orderBy)} ${sql.raw(orderDir)}
          LIMIT ${pageSize}
          OFFSET ${offset}
        `.execute(this.db),
      ]);

      const total = Number((countResult.rows[0] as any)?.count ?? 0);
      const totalPages = Math.ceil(total / pageSize);

      // Filter fields based on field-level policies
      const filteredData = await this.filterFields(
        dataResult.rows as T[],
        "read",
        entityName,
        ctx
      );

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.read",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "list",
        resource: entityName,
        details: {
          page,
          pageSize,
          total,
        },
        result: "success",
      });

      return {
        data: filteredData as T[],
        meta: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.read",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "list",
        resource: entityName,
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async get<T = unknown>(
    entityName: string,
    id: string,
    ctx: RequestContext
  ): Promise<T | undefined> {
    // Check policy
    await this.policyGate.enforce("read", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    try {
      // Filter out soft-deleted records
      const result = await sql`
        SELECT *
        FROM ${sql.table(model.tableName)}
        WHERE id = ${id}
          AND tenant_id = ${ctx.tenantId}
          AND realm_id = ${ctx.realmId}
          AND deleted_at IS NULL
        LIMIT 1
      `.execute(this.db);

      const record = result.rows[0] as T | undefined;

      // Filter fields based on field-level policies
      const filteredRecord = record
        ? await this.filterFields(record, "read", entityName, ctx)
        : undefined;

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.read",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "get",
        resource: entityName,
        details: { id, found: !!record },
        result: "success",
      });

      return filteredRecord as T | undefined;
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.read",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "get",
        resource: entityName,
        details: { id },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async count(
    entityName: string,
    ctx: RequestContext,
    filters?: Record<string, unknown>
  ): Promise<number> {
    // Check policy
    await this.policyGate.enforce("read", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    try {
      // Filter out soft-deleted records
      const result = await sql`
        SELECT COUNT(*) as count
        FROM ${sql.table(model.tableName)}
        WHERE tenant_id = ${ctx.tenantId}
          AND realm_id = ${ctx.realmId}
          AND deleted_at IS NULL
      `.execute(this.db);

      const count = Number((result.rows[0] as any)?.count ?? 0);

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.read",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "count",
        resource: entityName,
        details: { count },
        result: "success",
      });

      return count;
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.read",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "count",
        resource: entityName,
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async create<T = unknown>(
    entityName: string,
    data: unknown,
    ctx: RequestContext
  ): Promise<T> {
    // Check policy
    await this.policyGate.enforce("create", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    // Validate data against schema (create mode - all required fields)
    const validation = await this.validateData(model, data, "create");
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    try {
      // Generate ID and add tenant/realm/timestamps
      const id = crypto.randomUUID();
      const now = new Date();

      const record = {
        id,
        ...(data as Record<string, unknown>),
        tenant_id: ctx.tenantId,
        realm_id: ctx.realmId,
        version: 1, // Optimistic locking: initialize version
        created_at: now,
        updated_at: now,
        created_by: ctx.userId,
        updated_by: ctx.userId,
      };

      // Build INSERT query
      const columns = Object.keys(record);
      const values = Object.values(record);

      const result = await sql`
        INSERT INTO ${sql.table(model.tableName)}
        (${sql.join(columns.map((c) => sql.ref(c)))})
        VALUES (${sql.join(values.map((v) => sql.val(v)))})
        RETURNING *
      `.execute(this.db);

      const createdRecord = result.rows[0] as T;

      // Create lifecycle instance (if lifecycle manager is available)
      if (this.lifecycleManager) {
        try {
          await this.lifecycleManager.createInstance(entityName, id, ctx);
        } catch (lifecycleError) {
          console.error(JSON.stringify({
            msg: "lifecycle_instance_creation_failed",
            entityName,
            entityId: id,
            error: String(lifecycleError),
          }));
          // Don't fail the create operation if lifecycle creation fails
          // This allows entities without lifecycles to be created normally
        }
      }

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.create",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "create",
        resource: entityName,
        details: { id },
        result: "success",
      });

      return createdRecord;
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.create",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "create",
        resource: entityName,
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async update<T = unknown>(
    entityName: string,
    id: string,
    data: Partial<unknown>,
    ctx: RequestContext
  ): Promise<T> {
    // Check policy
    await this.policyGate.enforce("update", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    // Extract expected version for optimistic locking (if provided)
    const dataObj = data as Record<string, unknown>;
    const expectedVersion = typeof dataObj._version === "number"
      ? dataObj._version
      : undefined;

    // Remove _version from update data (it's metadata, not a field)
    const { _version, ...dataWithoutVersion } = dataObj;

    // Check if record exists and belongs to tenant
    const existing = await this.get<T>(entityName, id, ctx);
    if (!existing) {
      throw new Error(`Record not found: ${id}`);
    }

    // Check if record is in terminal state (prevent updates to finalized records)
    if (this.lifecycleManager) {
      await this.lifecycleManager.enforceTerminalState(entityName, id, ctx.tenantId);
    }

    // Validate version for optimistic locking
    if (expectedVersion !== undefined) {
      const currentVersion = (existing as any).version;
      if (currentVersion !== expectedVersion) {
        throw new Error(
          `Version conflict: Expected version ${expectedVersion} but current version is ${currentVersion}. ` +
          `The record was modified by another user.`
        );
      }
    }

    // Validate data against schema (update mode - partial validation)
    const validation = await this.validateData(model, dataWithoutVersion, "update");
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    try {
      // Add update metadata
      const updateData = {
        ...dataWithoutVersion,
        updated_at: new Date(),
        updated_by: ctx.userId,
      };

      // Build UPDATE query with version increment
      const columns = Object.keys(updateData);
      const setClauses = columns.map((col, idx) =>
        sql`${sql.ref(col)} = ${sql.val(Object.values(updateData)[idx])}`
      );

      // Add version increment to SET clause
      setClauses.push(sql`version = version + 1`);

      const result = await sql`
        UPDATE ${sql.table(model.tableName)}
        SET ${sql.join(setClauses, sql`, `)}
        WHERE id = ${id}
          AND tenant_id = ${ctx.tenantId}
          AND realm_id = ${ctx.realmId}
          AND deleted_at IS NULL
        RETURNING *
      `.execute(this.db);

      const updatedRecord = result.rows[0] as T;

      // Check if update actually happened
      if (!updatedRecord) {
        throw new Error(`Record not found or was soft-deleted: ${id}`);
      }

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.update",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "update",
        resource: entityName,
        details: { id, fields: columns },
        result: "success",
      });

      return updatedRecord;
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.update",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "update",
        resource: entityName,
        details: { id },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async delete(
    entityName: string,
    id: string,
    ctx: RequestContext
  ): Promise<void> {
    // Check policy
    await this.policyGate.enforce("delete", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    // Check if record exists and belongs to tenant
    const existing = await this.get(entityName, id, ctx);
    if (!existing) {
      throw new Error(`Record not found: ${id}`);
    }

    try {
      // Handle cascading deletes/updates based on reference field rules
      await this.handleCascadeDeletes(entityName, id, ctx);

      // Soft delete: Set deleted_at timestamp instead of removing the record
      const now = new Date();
      await sql`
        UPDATE ${sql.table(model.tableName)}
        SET deleted_at = ${now},
            deleted_by = ${ctx.userId},
            updated_at = ${now},
            updated_by = ${ctx.userId}
        WHERE id = ${id}
          AND tenant_id = ${ctx.tenantId}
          AND realm_id = ${ctx.realmId}
          AND deleted_at IS NULL
      `.execute(this.db);

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.delete",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "delete",
        resource: entityName,
        details: { id, softDelete: true },
        result: "success",
      });
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.delete",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "delete",
        resource: entityName,
        details: { id },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  /**
   * Handle cascading deletes based on reference field rules
   *
   * TODO: Full implementation requires:
   * - Registry of all entity schemas
   * - Discovery of all entities with reference fields pointing to this entity
   * - Support for CASCADE, SET_NULL, and RESTRICT rules
   *
   * Current implementation: Basic CASCADE support for explicitly configured relationships
   */
  private async handleCascadeDeletes(
    entityName: string,
    id: string,
    ctx: RequestContext
  ): Promise<void> {
    // Get the model being deleted
    const model = await this.compiler.compile(entityName, "v1");

    // Find all reference fields in the schema
    // In a full implementation, we would:
    // 1. Query a meta registry for all entities
    // 2. Check each entity's schema for reference fields pointing to this entity
    // 3. Apply the appropriate cascade rule

    // For now, we implement basic CASCADE logic:
    // If a field has referenceTo=entityName and onDelete="CASCADE",
    // we would delete those records

    // Example CASCADE logic (simplified):
    // This would need to be enhanced with a proper entity registry

    /* Full implementation would look like:

    const allEntities = await this.metaRegistry.listEntities();

    for (const entity of allEntities) {
      const entityModel = await this.compiler.compile(entity.name, 'v1');

      for (const field of entityModel.fields) {
        if (field.referenceTo === entityName) {
          const onDelete = field.onDelete; // From FieldDefinition

          if (onDelete === 'CASCADE') {
            // Delete all records that reference this record
            const referencingRecords = await this.list(
              entity.name,
              ctx,
              { filters: { [field.name]: id } }
            );
            for (const record of referencingRecords.data) {
              await this.delete(entity.name, (record as any).id, ctx);
            }
          } else if (onDelete === 'SET_NULL') {
            // Set reference field to null
            await sql`
              UPDATE ${sql.table(entityModel.tableName)}
              SET ${sql.ref(field.columnName)} = NULL,
                  updated_at = ${new Date()},
                  updated_by = ${ctx.userId}
              WHERE ${sql.ref(field.columnName)} = ${id}
                AND tenant_id = ${ctx.tenantId}
                AND realm_id = ${ctx.realmId}
            `.execute(this.db);
          } else if (onDelete === 'RESTRICT') {
            // Check if any records reference this one
            const count = await sql`
              SELECT COUNT(*) as count
              FROM ${sql.table(entityModel.tableName)}
              WHERE ${sql.ref(field.columnName)} = ${id}
                AND tenant_id = ${ctx.tenantId}
                AND realm_id = ${ctx.realmId}
                AND deleted_at IS NULL
            `.execute(this.db);

            if (Number((count.rows[0] as any).count) > 0) {
              throw new Error(
                `Cannot delete ${entityName} ${id}: Referenced by ${entity.name} records`
              );
            }
          }
        }
      }
    }
    */

    // Placeholder: Log that cascade handling is invoked
    console.log(
      JSON.stringify({
        msg: "cascade_delete_check",
        entity: entityName,
        id,
        note: "Full cascade implementation requires entity registry",
      })
    );
  }

  async restore(
    entityName: string,
    id: string,
    ctx: RequestContext
  ): Promise<void> {
    // Check policy (restore requires update permission)
    await this.policyGate.enforce("update", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    try {
      // Check if record exists and is deleted
      const checkResult = await sql`
        SELECT id FROM ${sql.table(model.tableName)}
        WHERE id = ${id}
          AND tenant_id = ${ctx.tenantId}
          AND realm_id = ${ctx.realmId}
          AND deleted_at IS NOT NULL
      `.execute(this.db);

      if (checkResult.rows.length === 0) {
        throw new Error(`Deleted record not found: ${id}`);
      }

      // Restore: Clear deleted_at timestamp
      const now = new Date();
      await sql`
        UPDATE ${sql.table(model.tableName)}
        SET deleted_at = NULL,
            deleted_by = NULL,
            updated_at = ${now},
            updated_by = ${ctx.userId}
        WHERE id = ${id}
          AND tenant_id = ${ctx.tenantId}
          AND realm_id = ${ctx.realmId}
      `.execute(this.db);

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.update",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "restore",
        resource: entityName,
        details: { id, restored: true },
        result: "success",
      });
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.update",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "restore",
        resource: entityName,
        details: { id },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async permanentDelete(
    entityName: string,
    id: string,
    ctx: RequestContext
  ): Promise<void> {
    // Check policy
    await this.policyGate.enforce("delete", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    try {
      // Check if record exists (including soft-deleted)
      const checkResult = await sql`
        SELECT id FROM ${sql.table(model.tableName)}
        WHERE id = ${id}
          AND tenant_id = ${ctx.tenantId}
          AND realm_id = ${ctx.realmId}
      `.execute(this.db);

      if (checkResult.rows.length === 0) {
        throw new Error(`Record not found: ${id}`);
      }

      // Permanently delete: Remove record from database
      await sql`
        DELETE FROM ${sql.table(model.tableName)}
        WHERE id = ${id}
          AND tenant_id = ${ctx.tenantId}
          AND realm_id = ${ctx.realmId}
      `.execute(this.db);

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.delete",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "permanentDelete",
        resource: entityName,
        details: { id, permanent: true },
        result: "success",
      });
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.delete",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "permanentDelete",
        resource: entityName,
        details: { id },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async bulkCreate<T = unknown>(
    entityName: string,
    data: unknown[],
    ctx: RequestContext
  ): Promise<BulkOperationResult<T>> {
    // Check policy (single check for all operations)
    await this.policyGate.enforce("create", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    // Initialize result
    const result: BulkOperationResult<T> = {
      total: data.length,
      succeeded: 0,
      failed: 0,
      success: [],
      errors: [],
    };

    // Validate all records first
    const validatedData: Array<{ index: number; data: unknown }> = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // Validate data against schema
      const validation = await this.validateData(model, item, "create");
      if (!validation.valid) {
        result.failed++;
        result.errors.push({
          index: i,
          error: `Validation failed: ${validation.errors.join(", ")}`,
        });
      } else {
        validatedData.push({ index: i, data: item });
      }
    }

    // If all validations failed, return early
    if (validatedData.length === 0) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.create",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "bulkCreate",
        resource: entityName,
        details: {
          total: data.length,
          succeeded: 0,
          failed: data.length,
          allValidationsFailed: true,
        },
        result: "failure",
        errorMessage: "All validations failed",
      });

      return result;
    }

    // Use transaction for atomic bulk create
    try {
      const createdRecords = await this.db.transaction().execute(async (trx) => {
        const records: T[] = [];
        const now = new Date();

        for (const { data: itemData } of validatedData) {
          // Generate UUID for new record
          const id = crypto.randomUUID();

          // Build record with system fields
          const record = {
            id,
            ...(itemData as Record<string, unknown>),
            tenant_id: ctx.tenantId,
            realm_id: ctx.realmId,
            version: 1, // Optimistic locking: initialize version
            created_at: now,
            updated_at: now,
            created_by: ctx.userId,
            updated_by: ctx.userId,
          };

          // Insert record
          const insertResult = await sql`
            INSERT INTO ${sql.table(model.tableName)}
            ${sql.raw("(")}${sql.join(
              Object.keys(record).map((k) => sql.ref(k)),
              sql`, `
            )}${sql.raw(")")}
            VALUES
            ${sql.raw("(")}${sql.join(
              Object.values(record).map((v) => sql.val(v)),
              sql`, `
            )}${sql.raw(")")}
            RETURNING *
          `.execute(trx);

          records.push(insertResult.rows[0] as T);
        }

        return records;
      });

      // Update result with successes
      result.succeeded = createdRecords.length;
      result.success = createdRecords;

      // Log successful bulk create
      await this.auditLogger.log({
        eventType: "data.create",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "bulkCreate",
        resource: entityName,
        details: {
          total: data.length,
          succeeded: result.succeeded,
          failed: result.failed,
          ids: createdRecords.map((r: any) => r.id),
        },
        result: "success",
      });

      return result;
    } catch (error) {
      // Transaction failed - mark all validated items as failed
      for (const { index } of validatedData) {
        result.failed++;
        result.errors.push({
          index,
          error: `Transaction failed: ${String(error)}`,
        });
      }

      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.create",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "bulkCreate",
        resource: entityName,
        details: {
          total: data.length,
          succeeded: 0,
          failed: data.length,
        },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async bulkUpdate<T = unknown>(
    entityName: string,
    updates: Array<{ id: string; data: Partial<unknown> }>,
    ctx: RequestContext
  ): Promise<BulkOperationResult<T>> {
    // Check policy (single check for all operations)
    await this.policyGate.enforce("update", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    // Initialize result
    const result: BulkOperationResult<T> = {
      total: updates.length,
      succeeded: 0,
      failed: 0,
      success: [],
      errors: [],
    };

    // Validate all updates first and extract version info
    const validatedUpdates: Array<{
      index: number;
      id: string;
      data: Record<string, unknown>;
      expectedVersion?: number;
    }> = [];

    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const { id, data } = update;

      // Extract expected version for optimistic locking (if provided)
      const dataObj = data as Record<string, unknown>;
      const expectedVersion =
        typeof dataObj._version === "number" ? dataObj._version : undefined;

      // Remove _version from update data (it's metadata, not a field)
      const { _version, ...dataWithoutVersion } = dataObj;

      // Validate data against schema (update mode - partial validation)
      const validation = await this.validateData(
        model,
        dataWithoutVersion,
        "update"
      );
      if (!validation.valid) {
        result.failed++;
        result.errors.push({
          index: i,
          id,
          error: `Validation failed: ${validation.errors.join(", ")}`,
        });
      } else {
        validatedUpdates.push({
          index: i,
          id,
          data: dataWithoutVersion,
          expectedVersion,
        });
      }
    }

    // If all validations failed, return early
    if (validatedUpdates.length === 0) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.update",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "bulkUpdate",
        resource: entityName,
        details: {
          total: updates.length,
          succeeded: 0,
          failed: updates.length,
          allValidationsFailed: true,
        },
        result: "failure",
        errorMessage: "All validations failed",
      });

      return result;
    }

    // Use transaction for atomic bulk update
    try {
      const updatedRecords = await this.db.transaction().execute(async (trx) => {
        const records: T[] = [];
        const now = new Date();

        for (const { index, id, data, expectedVersion } of validatedUpdates) {
          try {
            // Check if record exists and belongs to tenant
            const existingResult = await sql`
              SELECT * FROM ${sql.table(model.tableName)}
              WHERE id = ${id}
                AND tenant_id = ${ctx.tenantId}
                AND realm_id = ${ctx.realmId}
                AND deleted_at IS NULL
            `.execute(trx);

            if (existingResult.rows.length === 0) {
              result.failed++;
              result.errors.push({
                index,
                id,
                error: `Record not found or was soft-deleted`,
              });
              continue;
            }

            const existing = existingResult.rows[0] as any;

            // Validate version for optimistic locking
            if (expectedVersion !== undefined) {
              const currentVersion = existing.version;
              if (currentVersion !== expectedVersion) {
                result.failed++;
                result.errors.push({
                  index,
                  id,
                  error: `Version conflict: Expected version ${expectedVersion} but current version is ${currentVersion}`,
                });
                continue;
              }
            }

            // Add update metadata
            const updateData = {
              ...data,
              updated_at: now,
              updated_by: ctx.userId,
            };

            // Build UPDATE query with version increment
            const columns = Object.keys(updateData);
            const setClauses = columns.map(
              (col, idx) =>
                sql`${sql.ref(col)} = ${sql.val(Object.values(updateData)[idx])}`
            );

            // Add version increment to SET clause
            setClauses.push(sql`version = version + 1`);

            const updateResult = await sql`
              UPDATE ${sql.table(model.tableName)}
              SET ${sql.join(setClauses, sql`, `)}
              WHERE id = ${id}
                AND tenant_id = ${ctx.tenantId}
                AND realm_id = ${ctx.realmId}
                AND deleted_at IS NULL
              RETURNING *
            `.execute(trx);

            const updatedRecord = updateResult.rows[0] as T;

            // Check if update actually happened
            if (!updatedRecord) {
              result.failed++;
              result.errors.push({
                index,
                id,
                error: `Record not found or was soft-deleted`,
              });
              continue;
            }

            records.push(updatedRecord);
          } catch (error) {
            // Individual update failed within transaction
            result.failed++;
            result.errors.push({
              index,
              id,
              error: String(error),
            });
            // Don't throw - continue with other updates in transaction
          }
        }

        return records;
      });

      // Update result with successes
      result.succeeded = updatedRecords.length;
      result.success = updatedRecords;

      // Log successful bulk update
      await this.auditLogger.log({
        eventType: "data.update",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "bulkUpdate",
        resource: entityName,
        details: {
          total: updates.length,
          succeeded: result.succeeded,
          failed: result.failed,
          ids: updatedRecords.map((r: any) => r.id),
        },
        result: result.succeeded > 0 ? "success" : "failure",
      });

      return result;
    } catch (error) {
      // Transaction failed - mark all validated items as failed
      for (const { index, id } of validatedUpdates) {
        if (!result.errors.some((e) => e.index === index)) {
          result.failed++;
          result.errors.push({
            index,
            id,
            error: `Transaction failed: ${String(error)}`,
          });
        }
      }

      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.update",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "bulkUpdate",
        resource: entityName,
        details: {
          total: updates.length,
          succeeded: 0,
          failed: updates.length,
        },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async bulkDelete(
    entityName: string,
    ids: string[],
    ctx: RequestContext
  ): Promise<BulkOperationResult<void>> {
    // Check policy (single check for all operations)
    await this.policyGate.enforce("delete", entityName, ctx);

    // Get compiled model
    const model = await this.compiler.compile(entityName, "v1");

    // Initialize result
    const result: BulkOperationResult<void> = {
      total: ids.length,
      succeeded: 0,
      failed: 0,
      success: [],
      errors: [],
    };

    // Use transaction for atomic bulk delete
    try {
      await this.db.transaction().execute(async (trx) => {
        const now = new Date();

        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];

          try {
            // Check if record exists and belongs to tenant
            const checkResult = await sql`
              SELECT id FROM ${sql.table(model.tableName)}
              WHERE id = ${id}
                AND tenant_id = ${ctx.tenantId}
                AND realm_id = ${ctx.realmId}
                AND deleted_at IS NULL
            `.execute(trx);

            if (checkResult.rows.length === 0) {
              result.failed++;
              result.errors.push({
                index: i,
                id,
                error: `Record not found or already deleted`,
              });
              continue;
            }

            // Soft delete: Set deleted_at timestamp
            const deleteResult = await sql`
              UPDATE ${sql.table(model.tableName)}
              SET deleted_at = ${now},
                  deleted_by = ${ctx.userId},
                  updated_at = ${now},
                  updated_by = ${ctx.userId}
              WHERE id = ${id}
                AND tenant_id = ${ctx.tenantId}
                AND realm_id = ${ctx.realmId}
                AND deleted_at IS NULL
            `.execute(trx);

            // Check if delete actually happened
            if (deleteResult.numAffectedRows === 0n) {
              result.failed++;
              result.errors.push({
                index: i,
                id,
                error: `Record not found or already deleted`,
              });
              continue;
            }

            result.succeeded++;
            result.success.push(undefined as void);
          } catch (error) {
            // Individual delete failed within transaction
            result.failed++;
            result.errors.push({
              index: i,
              id,
              error: String(error),
            });
            // Don't throw - continue with other deletes in transaction
          }
        }
      });

      // Log successful bulk delete
      await this.auditLogger.log({
        eventType: "data.delete",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "bulkDelete",
        resource: entityName,
        details: {
          total: ids.length,
          succeeded: result.succeeded,
          failed: result.failed,
          ids: ids,
          softDelete: true,
        },
        result: result.succeeded > 0 ? "success" : "failure",
      });

      return result;
    } catch (error) {
      // Transaction failed - mark all items as failed
      for (let i = 0; i < ids.length; i++) {
        if (!result.errors.some((e) => e.index === i)) {
          result.failed++;
          result.errors.push({
            index: i,
            id: ids[i],
            error: `Transaction failed: ${String(error)}`,
          });
        }
      }

      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.delete",
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "bulkDelete",
        resource: entityName,
        details: {
          total: ids.length,
          succeeded: 0,
          failed: ids.length,
        },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  /**
   * Full schema validation
   * Validates data against compiled model field definitions
   *
   * @param model Compiled model with field definitions
   * @param data Data to validate
   * @param mode Validation mode: "create" (all required fields) or "update" (partial)
   */
  private async validateData(
    model: CompiledModel,
    data: unknown,
    mode: "create" | "update" = "create"
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check that data is an object
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return {
        valid: false,
        errors: ["Data must be an object"],
      };
    }

    const dataObj = data as Record<string, unknown>;
    const fieldMap = new Map<string, CompiledField>(
      model.fields.map((f) => [f.name, f])
    );

    // Validate each provided field
    for (const [fieldName, value] of Object.entries(dataObj)) {
      const field = fieldMap.get(fieldName);

      // Skip system fields (they're auto-generated)
      if (
        [
          "id",
          "tenant_id",
          "realm_id",
          "created_at",
          "updated_at",
          "created_by",
          "updated_by",
        ].includes(fieldName)
      ) {
        continue;
      }

      // Check for unknown fields
      if (!field) {
        errors.push(`Unknown field: ${fieldName}`);
        continue;
      }

      // Check null/undefined for required fields
      if (value === null || value === undefined) {
        if (field.required && mode === "create") {
          errors.push(`Field '${fieldName}' is required`);
        }
        continue;
      }

      // Type validation
      const typeError = this.validateFieldType(field, fieldName, value);
      if (typeError) {
        errors.push(typeError);
        continue;
      }

      // Constraint validation
      const constraintErrors = this.validateFieldConstraints(
        field,
        fieldName,
        value
      );
      errors.push(...constraintErrors);
    }

    // Check for missing required fields (create mode only)
    if (mode === "create") {
      for (const field of model.fields) {
        // Skip system fields
        if (
          [
            "id",
            "tenant_id",
            "realm_id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
          ].includes(field.name)
        ) {
          continue;
        }

        if (field.required && !(field.name in dataObj)) {
          errors.push(`Required field '${field.name}' is missing`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate field type
   */
  private validateFieldType(
    field: CompiledField,
    fieldName: string,
    value: unknown
  ): string | null {
    switch (field.type) {
      case "string":
        if (typeof value !== "string") {
          return `Field '${fieldName}' must be a string`;
        }
        break;

      case "number":
        if (typeof value !== "number" || isNaN(value)) {
          return `Field '${fieldName}' must be a number`;
        }
        break;

      case "boolean":
        if (typeof value !== "boolean") {
          return `Field '${fieldName}' must be a boolean`;
        }
        break;

      case "date":
        // Accept Date objects or ISO date strings
        if (!(value instanceof Date)) {
          const dateStr = typeof value === "string" ? value : String(value);
          const parsed = new Date(dateStr);
          if (isNaN(parsed.getTime())) {
            return `Field '${fieldName}' must be a valid date`;
          }
        }
        break;

      case "enum":
        if (typeof value !== "string") {
          return `Field '${fieldName}' must be a string (enum value)`;
        }
        break;

      case "reference":
        // References are typically UUIDs (strings)
        if (typeof value !== "string") {
          return `Field '${fieldName}' must be a string (reference ID)`;
        }
        break;

      default:
        return `Unknown field type '${field.type}' for field '${fieldName}'`;
    }

    return null;
  }

  /**
   * Validate field constraints
   */
  private validateFieldConstraints(
    field: CompiledField,
    fieldName: string,
    value: unknown
  ): string[] {
    const errors: string[] = [];

    // String constraints
    if (field.type === "string" && typeof value === "string") {
      if (field.minLength !== undefined && value.length < field.minLength) {
        errors.push(
          `Field '${fieldName}' must be at least ${field.minLength} characters`
        );
      }

      if (field.maxLength !== undefined && value.length > field.maxLength) {
        errors.push(
          `Field '${fieldName}' must be at most ${field.maxLength} characters`
        );
      }

      if (field.pattern !== undefined) {
        try {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) {
            errors.push(
              `Field '${fieldName}' does not match required pattern`
            );
          }
        } catch (error) {
          // Invalid regex pattern - skip validation
          console.error(
            `Invalid regex pattern for field ${fieldName}: ${field.pattern}`
          );
        }
      }
    }

    // Number constraints
    if (field.type === "number" && typeof value === "number") {
      if (field.min !== undefined && value < field.min) {
        errors.push(
          `Field '${fieldName}' must be at least ${field.min}`
        );
      }

      if (field.max !== undefined && value > field.max) {
        errors.push(
          `Field '${fieldName}' must be at most ${field.max}`
        );
      }
    }

    // Enum constraints
    if (field.type === "enum" && typeof value === "string") {
      if (field.enumValues && !field.enumValues.includes(value)) {
        errors.push(
          `Field '${fieldName}' must be one of: ${field.enumValues.join(", ")}`
        );
      }
    }

    return errors;
  }

  /**
   * Filter record fields based on field-level policies
   * @param records - Single record or array of records
   * @param action - The action being performed (read, create, update)
   * @param entityName - The entity name
   * @param ctx - Request context
   * @returns Filtered record(s) with only allowed fields
   */
  private async filterFields<T>(
    records: T | T[],
    action: string,
    entityName: string,
    ctx: RequestContext
  ): Promise<T | T[]> {
    // Get allowed fields from policy
    const allowedFields = await this.policyGate.getAllowedFields(
      action,
      entityName,
      ctx
    );

    // null means all fields allowed (no field-level restrictions)
    if (allowedFields === null) {
      return records;
    }

    // Empty array means no fields allowed (should have been caught by policy check)
    if (allowedFields.length === 0) {
      throw new Error(
        `Access denied: No fields accessible for ${action} on ${entityName}`
      );
    }

    // Filter function
    const filterRecord = (record: T): T => {
      if (!record || typeof record !== "object") {
        return record;
      }

      const filtered: any = {};
      const recordObj = record as Record<string, unknown>;

      // Always include system fields
      const systemFields = [
        "id",
        "tenant_id",
        "realm_id",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
        "deleted_at",
        "version",
      ];

      for (const field of systemFields) {
        if (field in recordObj) {
          filtered[field] = recordObj[field];
        }
      }

      // Include allowed fields
      for (const field of allowedFields) {
        if (field in recordObj) {
          filtered[field] = recordObj[field];
        }
      }

      return filtered as T;
    };

    // Apply filter
    if (Array.isArray(records)) {
      return records.map(filterRecord);
    }

    return filterRecord(records);
  }

  /**
   * Execute lifecycle state transition
   * POST /api/data/:entity/:id/transition/:operationCode
   */
  async transition(
    entityName: string,
    id: string,
    operationCode: string,
    ctx: RequestContext,
    payload?: Record<string, unknown>
  ): Promise<LifecycleTransitionResult> {
    if (!this.lifecycleManager) {
      throw new Error("Lifecycle manager not configured");
    }

    // Check if record exists
    const existing = await this.get(entityName, id, ctx);
    if (!existing) {
      throw new Error(`Record not found: ${id}`);
    }

    try {
      // Execute transition
      const result = await this.lifecycleManager.transition({
        entityName,
        entityId: id,
        operationCode,
        ctx,
        payload,
      });

      // Log audit event
      await this.auditLogger.log({
        eventType: "data.update", // Using data.update for lifecycle transitions
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "transition",
        resource: entityName,
        details: {
          id,
          operationCode,
          success: result.success,
          newState: result.newStateCode,
        },
        result: result.success ? "success" : "failure",
      });

      return result;
    } catch (error) {
      // Log failed attempt
      await this.auditLogger.log({
        eventType: "data.update", // Using data.update for lifecycle transitions
        userId: ctx.userId,
        tenantId: ctx.tenantId,
        realmId: ctx.realmId,
        action: "transition",
        resource: entityName,
        details: { id, operationCode },
        result: "failure",
        errorMessage: String(error),
      });

      throw error;
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      // Check if we can query the database
      await sql`SELECT 1`.execute(this.db);

      // Check compiler health
      const compilerHealth = await this.compiler.healthCheck();

      return {
        healthy: compilerHealth.healthy,
        message: compilerHealth.healthy
          ? "Generic Data API healthy"
          : "Generic Data API unhealthy (compiler issue)",
        details: {
          database: "connected",
          compiler: compilerHealth,
        },
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Generic Data API unhealthy: ${String(error)}`,
        details: {
          database: "disconnected",
          error: String(error),
        },
      };
    }
  }
}
