/**
 * DDL Generator Service
 *
 * Generates PostgreSQL DDL statements from compiled entity models.
 * Phase 14.1: Meta-to-DB DDL generator (safe subset)
 *
 * Capabilities:
 * - CREATE TABLE IF NOT EXISTS with system columns
 * - Field type mapping (string→text, number→numeric, etc.)
 * - Required system columns (id, tenant_id, realm_id, timestamps, soft delete, version)
 * - Indexes for tenant_id, searchable, filterable, unique fields
 */

import type {
  CompiledModel,
  DdlGenerator,
  DdlGenerationOptions as CoreDdlGenerationOptions,
  DdlGenerationResult as CoreDdlGenerationResult,
} from "@athyper/core/meta";

/**
 * DDL Generator Service
 */
export class DdlGeneratorService implements DdlGenerator {
  /**
   * Generate DDL for a compiled entity model
   */
  generateDdl(
    model: CompiledModel,
    options?: CoreDdlGenerationOptions
  ): CoreDdlGenerationResult {
    const opts: Required<CoreDdlGenerationOptions> = {
      schemaName: options?.schemaName ?? "ent",
      ifNotExists: options?.ifNotExists ?? true,
      includeIndexes: options?.includeIndexes ?? true,
      includeComments: options?.includeComments ?? true,
    };

    const tableName = model.tableName;
    const qualifiedTableName = `${opts.schemaName}.${tableName}`;

    // Generate CREATE TABLE statement
    const createTableSql = this.generateCreateTable(
      qualifiedTableName,
      model,
      opts
    );

    // Generate CREATE INDEX statements
    const createIndexSql = opts.includeIndexes
      ? this.generateIndexes(qualifiedTableName, model, opts)
      : [];

    // Combine into full SQL script
    const fullSql = [createTableSql, ...createIndexSql].join("\n\n");

    return {
      createTableSql,
      createIndexSql,
      fullSql,
      entityName: model.entityName,
      tableName,
    };
  }

  /**
   * Generate CREATE TABLE statement
   */
  private generateCreateTable(
    qualifiedTableName: string,
    model: CompiledModel,
    opts: Required<CoreDdlGenerationOptions>
  ): string {
    const ifNotExists = opts.ifNotExists ? "IF NOT EXISTS " : "";
    const lines: string[] = [];

    // Table header
    lines.push(`CREATE TABLE ${ifNotExists}${qualifiedTableName} (`);

    // System columns (always first)
    const systemColumns = this.getSystemColumns();
    lines.push(...systemColumns.map((col) => `  ${col},`));

    // Entity-specific columns
    for (const field of model.fields) {
      const columnDef = this.getColumnDefinition(field);
      lines.push(`  ${columnDef},`);
    }

    // Primary key constraint
    lines.push(`  CONSTRAINT ${model.tableName}_pkey PRIMARY KEY (id)`);

    // Close table definition
    lines.push(");");

    // Note: Table comments could be added here if we had entity description
    // CompiledModel doesn't include description, so we skip it

    return lines.join("\n");
  }

  /**
   * Get system column definitions
   */
  private getSystemColumns(): string[] {
    return [
      "id UUID NOT NULL",
      "tenant_id UUID NOT NULL",
      "realm_id TEXT NOT NULL",
      "created_at TIMESTAMPTZ NOT NULL DEFAULT now()",
      "created_by TEXT",
      "updated_at TIMESTAMPTZ NOT NULL DEFAULT now()",
      "updated_by TEXT",
      "deleted_at TIMESTAMPTZ",
      "deleted_by TEXT",
      "version INT NOT NULL DEFAULT 1",
    ];
  }

  /**
   * Get column definition for a field
   */
  private getColumnDefinition(field: CompiledModel["fields"][number]): string {
    const columnName = field.columnName; // Use pre-computed column name
    const dataType = this.getPostgresType(field);
    const nullable = field.required ? " NOT NULL" : "";

    // Note: Default values are not stored in CompiledField
    // They would need to be in EntitySchema if needed for DDL generation

    return `${columnName} ${dataType}${nullable}`;
  }

  /**
   * Map field type to PostgreSQL type
   */
  private getPostgresType(field: CompiledModel["fields"][number]): string {
    switch (field.type) {
      case "string":
        // Check for max length to use VARCHAR vs TEXT
        if (field.maxLength && field.maxLength <= 255) {
          return `VARCHAR(${field.maxLength})`;
        }
        return "TEXT";

      case "number":
        // For now, use NUMERIC for all numbers
        // Could be enhanced to use INTEGER, BIGINT based on constraints
        return "NUMERIC";

      case "boolean":
        return "BOOLEAN";

      case "date":
      case "datetime":
        // Always use TIMESTAMPTZ for timezone-aware dates
        return "TIMESTAMPTZ";

      case "reference":
        // References are stored as UUIDs
        return "UUID";

      case "enum":
        // Enum stored as TEXT with CHECK constraint
        // (In production, might use CREATE TYPE for proper enums)
        return "TEXT";

      case "json":
        return "JSONB";

      default:
        console.warn(
          JSON.stringify({
            msg: "unknown_field_type",
            fieldName: field.name,
            fieldType: field.type,
          })
        );
        return "JSONB"; // Safe fallback
    }
  }

  /**
   * Generate CREATE INDEX statements
   */
  private generateIndexes(
    qualifiedTableName: string,
    model: CompiledModel,
    _opts: Required<CoreDdlGenerationOptions>
  ): string[] {
    const indexes: string[] = [];
    const tableName = model.tableName;

    // Always create tenant_id index for multi-tenant isolation
    indexes.push(
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_tenant_id ON ${qualifiedTableName} (tenant_id);`
    );

    // Create indexes for indexed fields (from schema indexed: true)
    const indexedFields = model.fields.filter((f) => f.indexed);
    for (const field of indexedFields) {
      const columnName = field.columnName;
      indexes.push(
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_${columnName} ON ${qualifiedTableName} (${columnName});`
      );
    }

    // Create unique indexes for unique fields
    const uniqueFields = model.fields.filter((f) => f.unique);
    for (const field of uniqueFields) {
      const columnName = field.columnName;
      indexes.push(
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_${tableName}_${columnName}_unique ON ${qualifiedTableName} (tenant_id, ${columnName});`
      );
    }

    // Create composite index for soft delete queries (tenant_id, deleted_at)
    indexes.push(
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_tenant_deleted ON ${qualifiedTableName} (tenant_id, deleted_at);`
    );

    // Create index for version (optimistic locking)
    indexes.push(
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_version ON ${qualifiedTableName} (version);`
    );

    return indexes;
  }

  /**
   * Escape SQL string literal
   */
  private escapeSqlString(value: string): string {
    // Replace single quotes with doubled single quotes
    const escaped = value.replace(/'/g, "''");
    return `'${escaped}'`;
  }

  /**
   * Generate DDL for multiple models
   */
  generateBatch(
    models: CompiledModel[],
    options?: CoreDdlGenerationOptions
  ): CoreDdlGenerationResult[] {
    return models.map((model) => this.generateDdl(model, options));
  }

  /**
   * Generate full migration script for multiple models
   */
  generateMigrationScript(
    models: CompiledModel[],
    options?: CoreDdlGenerationOptions
  ): string {
    const opts: Required<CoreDdlGenerationOptions> = {
      schemaName: options?.schemaName ?? "ent",
      ifNotExists: options?.ifNotExists ?? true,
      includeIndexes: options?.includeIndexes ?? true,
      includeComments: options?.includeComments ?? true,
    };

    const lines: string[] = [];

    // Migration header
    lines.push("-- Entity tables migration (generated from META)");
    lines.push(`-- Generated at: ${new Date().toISOString()}`);
    lines.push(`-- Schema: ${opts.schemaName}`);
    lines.push("");

    // Create schema if not exists
    lines.push(`CREATE SCHEMA IF NOT EXISTS ${opts.schemaName};`);
    lines.push("");

    // Generate DDL for each model
    for (const model of models) {
      const result = this.generateDdl(model, options);
      lines.push(`-- Table: ${result.tableName} (entity: ${result.entityName})`);
      lines.push(result.fullSql);
      lines.push("");
    }

    return lines.join("\n");
  }
}
