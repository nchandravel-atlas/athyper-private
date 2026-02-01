import type { Kysely, KyselyConfig } from "kysely";
import type { DB } from "@athyper/adapter-db";
import type { TenantContext } from "../../kernel/tenantContext";

/**
 * DB adapter contract: single shared pool + scoped transaction factories.
 */
export interface DbAdapter {
  /**
   * Get a Kysely instance with tenant isolation applied via PgBouncer session state.
   * - Must be called within a scoped DI (per-request).
   * - Manages search_path to isolate tenant schema.
   */
  getScopedDb(tenantCtx: TenantContext): Promise<Kysely<DB>>;

  /**
   * Explicit connection pool reference (for diagnostics, advanced use).
   */
  getPool(): any;

  /**
   * Graceful shutdown: drain connections, close pool.
   */
  shutdown(): Promise<void>;
}

export class DbAdapterError extends Error {
  readonly code: string;
  readonly meta?: Record<string, unknown>;

  constructor(code: string, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}
