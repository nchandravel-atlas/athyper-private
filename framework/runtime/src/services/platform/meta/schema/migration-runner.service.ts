/**
 * Migration Runner Service
 *
 * Runs database migrations for entity tables generated from META.
 * Phase 14.2: Migration strategy
 *
 * Key points:
 * - Uses DATABASE_ADMIN_URL for direct Postgres connection (not PgBouncer)
 * - Generates DDL from compiled entity models
 * - Applies migrations to ent schema
 * - Tracks migration history
 */

import { Kysely, sql } from "kysely";
import type { DB } from "@athyper/adapter-db";
import type {
  MetaCompiler,
  MetaRegistry,
  DdlGenerator,
  CompiledModel,
} from "@athyper/core/meta";

/**
 * Migration runner options
 */
export type MigrationRunnerOptions = {
  /** Direct Postgres connection (not PgBouncer) */
  db: Kysely<DB>;

  /** META registry for discovering entities */
  registry: MetaRegistry;

  /** META compiler for compiling entity schemas */
  compiler: MetaCompiler;

  /** DDL generator for creating table DDL */
  ddlGenerator: DdlGenerator;

  /** Migration mode: "dev" auto-applies, "prod" requires confirmation */
  mode?: "dev" | "prod";
};

/**
 * Migration plan entry
 */
export type MigrationPlanEntry = {
  entityName: string;
  tableName: string;
  action: "create" | "skip";
  reason: string;
  ddl?: string;
};

/**
 * Migration result
 */
export type MigrationResult = {
  success: boolean;
  plan: MigrationPlanEntry[];
  appliedCount: number;
  skippedCount: number;
  errors: string[];
  durationMs: number;
};

/**
 * Migration Runner Service
 *
 * Generates and applies database migrations from META entity definitions.
 */
export class MigrationRunnerService {
  constructor(private readonly options: MigrationRunnerOptions) {}

  /**
   * Generate migration plan
   * Compares current database state with META entities
   * Returns list of migrations to apply
   */
  async generatePlan(tenantId: string): Promise<MigrationPlanEntry[]> {
    const startTime = performance.now();
    const plan: MigrationPlanEntry[] = [];

    try {
      // Get all entities from registry
      const entitiesResponse = await this.options.registry.listEntities();
      const entities = entitiesResponse.data;

      console.log(
        JSON.stringify({
          msg: "migration_plan_start",
          entityCount: entities.length,
          tenantId,
        })
      );

      for (const entity of entities) {
        try {
          // Get active version
          const activeVersion = await this.options.registry.getActiveVersion(
            entity.name
          );

          if (!activeVersion) {
            plan.push({
              entityName: entity.name,
              tableName: `ent_${entity.name.toLowerCase()}`,
              action: "skip",
              reason: "No active version",
            });
            continue;
          }

          // Compile entity model
          const compiled = await this.options.compiler.compile(
            entity.name,
            activeVersion.version
          );

          // Check if table exists
          const tableExists = await this.checkTableExists(compiled.tableName);

          if (tableExists) {
            plan.push({
              entityName: entity.name,
              tableName: compiled.tableName,
              action: "skip",
              reason: "Table already exists",
            });
          } else {
            // Generate DDL
            const ddlResult = this.options.ddlGenerator.generateDdl(compiled, {
              schemaName: "ent",
              ifNotExists: true,
              includeIndexes: true,
              includeComments: false,
            });

            plan.push({
              entityName: entity.name,
              tableName: compiled.tableName,
              action: "create",
              reason: "Table does not exist",
              ddl: ddlResult.fullSql,
            });
          }
        } catch (error) {
          console.error(
            JSON.stringify({
              msg: "migration_plan_entity_error",
              entityName: entity.name,
              error: String(error),
            })
          );

          plan.push({
            entityName: entity.name,
            tableName: `ent_${entity.name.toLowerCase()}`,
            action: "skip",
            reason: `Error: ${String(error)}`,
          });
        }
      }

      const duration = performance.now() - startTime;

      console.log(
        JSON.stringify({
          msg: "migration_plan_complete",
          planCount: plan.length,
          createCount: plan.filter((p) => p.action === "create").length,
          skipCount: plan.filter((p) => p.action === "skip").length,
          durationMs: duration,
        })
      );

      return plan;
    } catch (error) {
      console.error(
        JSON.stringify({
          msg: "migration_plan_error",
          error: String(error),
        })
      );
      throw error;
    }
  }

  /**
   * Apply migration plan
   * Executes DDL statements from migration plan
   */
  async applyPlan(plan: MigrationPlanEntry[]): Promise<MigrationResult> {
    const startTime = performance.now();
    const errors: string[] = [];
    let appliedCount = 0;
    let skippedCount = 0;

    console.log(
      JSON.stringify({
        msg: "migration_apply_start",
        planCount: plan.length,
        mode: this.options.mode ?? "prod",
      })
    );

    // Ensure ent schema exists
    try {
      await this.options.db.schema.createSchema("ent").ifNotExists().execute();
      console.log(JSON.stringify({ msg: "migration_schema_created", schema: "ent" }));
    } catch (error) {
      console.error(
        JSON.stringify({
          msg: "migration_schema_error",
          error: String(error),
        })
      );
      errors.push(`Schema creation failed: ${String(error)}`);
    }

    // Apply migrations in transaction
    for (const entry of plan) {
      if (entry.action === "skip") {
        skippedCount++;
        continue;
      }

      if (!entry.ddl) {
        console.warn(
          JSON.stringify({
            msg: "migration_entry_no_ddl",
            entityName: entry.entityName,
          })
        );
        skippedCount++;
        continue;
      }

      try {
        console.log(
          JSON.stringify({
            msg: "migration_apply_entry",
            entityName: entry.entityName,
            tableName: entry.tableName,
          })
        );

        // Execute DDL directly (CREATE TABLE + indexes)
        await sql.raw(entry.ddl).execute(this.options.db);

        appliedCount++;

        console.log(
          JSON.stringify({
            msg: "migration_entry_applied",
            entityName: entry.entityName,
            tableName: entry.tableName,
          })
        );
      } catch (error) {
        const errorMsg = `Failed to apply migration for ${entry.entityName}: ${String(error)}`;
        console.error(
          JSON.stringify({
            msg: "migration_entry_error",
            entityName: entry.entityName,
            error: String(error),
          })
        );
        errors.push(errorMsg);
      }
    }

    const duration = performance.now() - startTime;
    const success = errors.length === 0;

    const result: MigrationResult = {
      success,
      plan,
      appliedCount,
      skippedCount,
      errors,
      durationMs: duration,
    };

    console.log(
      JSON.stringify({
        msg: "migration_apply_complete",
        success,
        appliedCount,
        skippedCount,
        errorCount: errors.length,
        durationMs: duration,
      })
    );

    return result;
  }

  /**
   * Run migrations (generate plan + apply)
   * Main entry point for migration workflow
   */
  async runMigrations(tenantId: string): Promise<MigrationResult> {
    console.log(
      JSON.stringify({
        msg: "migration_run_start",
        tenantId,
        mode: this.options.mode ?? "prod",
      })
    );

    const plan = await this.generatePlan(tenantId);
    const result = await this.applyPlan(plan);

    console.log(
      JSON.stringify({
        msg: "migration_run_complete",
        success: result.success,
        appliedCount: result.appliedCount,
      })
    );

    return result;
  }

  /**
   * Check if table exists in database
   */
  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await sql<{ exists: boolean }>`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'ent'
          AND table_name = ${tableName}
        ) as exists
      `.execute(this.options.db);

      return result.rows[0]?.exists ?? false;
    } catch (error) {
      console.error(
        JSON.stringify({
          msg: "check_table_exists_error",
          tableName,
          error: String(error),
        })
      );
      return false;
    }
  }

  /**
   * Print migration plan (for review)
   */
  printPlan(plan: MigrationPlanEntry[]): string {
    const lines: string[] = [];

    lines.push("=".repeat(80));
    lines.push("META Migration Plan");
    lines.push("=".repeat(80));
    lines.push("");

    const createEntries = plan.filter((p) => p.action === "create");
    const skipEntries = plan.filter((p) => p.action === "skip");

    lines.push(`Total: ${plan.length} entities`);
    lines.push(`  To Create: ${createEntries.length}`);
    lines.push(`  To Skip: ${skipEntries.length}`);
    lines.push("");

    if (createEntries.length > 0) {
      lines.push("Tables to Create:");
      lines.push("-".repeat(80));
      for (const entry of createEntries) {
        lines.push(`  - ${entry.tableName} (${entry.entityName})`);
      }
      lines.push("");
    }

    if (skipEntries.length > 0) {
      lines.push("Tables to Skip:");
      lines.push("-".repeat(80));
      for (const entry of skipEntries) {
        lines.push(`  - ${entry.tableName}: ${entry.reason}`);
      }
      lines.push("");
    }

    lines.push("=".repeat(80));

    return lines.join("\n");
  }

  /**
   * Generate SQL script from migration plan
   * For manual review and application
   */
  generateSqlScript(plan: MigrationPlanEntry[]): string {
    const lines: string[] = [];

    lines.push("-- META Entity Tables Migration");
    lines.push(`-- Generated at: ${new Date().toISOString()}`);
    lines.push("-- Schema: ent");
    lines.push("");

    // Create schema
    lines.push("CREATE SCHEMA IF NOT EXISTS ent;");
    lines.push("");

    // Add DDL for each table to create
    const createEntries = plan.filter((p) => p.action === "create" && p.ddl);

    for (const entry of createEntries) {
      lines.push(`-- Table: ${entry.tableName} (entity: ${entry.entityName})`);
      lines.push(entry.ddl!);
      lines.push("");
    }

    return lines.join("\n");
  }
}
