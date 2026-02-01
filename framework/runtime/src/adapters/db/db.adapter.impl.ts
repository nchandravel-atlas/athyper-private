import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB } from "@athyper/adapter-db";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { TenantContext } from "../../kernel/tenantContext";
import type { DbAdapter } from "./db.adapter";
import { DbAdapterError } from "./db.adapter";

export class DbAdapterImpl implements DbAdapter {
  private pool: Pool;
  private dialect: PostgresDialect;
  private readonly logger: any;

  private constructor(pool: Pool, dialect: PostgresDialect, logger: any) {
    this.pool = pool;
    this.dialect = dialect;
    this.logger = logger;
  }

  static async create(config: RuntimeConfig, logger: any): Promise<DbAdapter> {
    const dbUrl = config.db.url;
    if (!dbUrl) {
      throw new DbAdapterError("DB_CONFIG_INVALID", "db.url not configured");
    }

    let pool: Pool;
    try {
      pool = new Pool({ connectionString: dbUrl, max: config.db.poolMax ?? 10 });

      // Test connection
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();

      logger.info?.({ dbUrl: "[redacted]" }, "db adapter pool initialized");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new DbAdapterError("DB_POOL_INIT_FAILED", `Failed to initialize DB pool: ${msg}`, {
        originalError: msg,
      });
    }

    const dialect = new PostgresDialect({ pool });
    return new DbAdapterImpl(pool, dialect, logger);
  }

  async getScopedDb(tenantCtx: TenantContext): Promise<Kysely<DB>> {
    // In transaction mode (PgBouncer session pooling):
    // - Each request gets a scoped connection from the pool
    // - Set search_path to isolate tenant schema
    // - Connection is "sticky" for the lifetime of the transaction

    const db = new Kysely<DB>({ dialect: this.dialect });

    // Apply tenant context (search_path) to ensure isolation
    try {
      await db.raw(`SET search_path = 'public,${tenantCtx.realmKey}'`).execute();
    } catch (err) {
      throw new DbAdapterError(
        "DB_TENANT_ISOLATION_FAILED",
        `Failed to set search_path for tenant ${tenantCtx.tenantKey}`,
        {
          realmKey: tenantCtx.realmKey,
          tenantKey: tenantCtx.tenantKey,
          error: err instanceof Error ? err.message : String(err),
        }
      );
    }

    return db;
  }

  getPool(): any {
    return this.pool;
  }

  async shutdown(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.info?.({}, "db adapter pool closed");
    } catch (err) {
      this.logger.error?.(
        { error: err instanceof Error ? err.message : String(err) },
        "error closing db pool"
      );
    }
  }
}
