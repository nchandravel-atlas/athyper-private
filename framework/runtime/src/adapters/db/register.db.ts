import type { Container } from "../../kernel/container";
import { TOKENS } from "../../kernel/tokens";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { DbAdapter } from "./db.adapter";
import { DbAdapterImpl } from "./db.adapter.impl";

/**
 * Register the DB adapter as a scoped singleton.
 *
 * - Pool itself is a singleton (reused across all requests).
 * - Scoped Kysely instances get fresh connections with tenant isolation applied.
 */
export async function registerDbAdapter(container: Container): Promise<void> {
  // Singleton pool factory
  container.register(
    TOKENS.db,
    async (c: Container): Promise<DbAdapter> => {
      const config = await c.resolve<RuntimeConfig>(TOKENS.config);
      const logger = await c.resolve<any>(TOKENS.logger);

      const adapter = await DbAdapterImpl.create(config, logger);

      // Register cleanup on shutdown
      const lifecycle = await c.resolve<any>(TOKENS.lifecycle);
      lifecycle.onShutdown("db-adapter", () => adapter.shutdown());

      return adapter;
    },
    "singleton"
  );
}
