import type { Container } from "../../kernel/container";
import { TOKENS } from "../../kernel/tokens";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { AuthAdapter } from "./auth.adapter";
import { AuthAdapterImpl } from "./auth.adapter.impl";

export async function registerAuthAdapter(container: Container): Promise<void> {
  container.register(
    TOKENS.auth,
    async (c: Container): Promise<AuthAdapter> => {
      const config = await c.resolve<RuntimeConfig>(TOKENS.config);
      const logger = await c.resolve<any>(TOKENS.logger);

      const adapter = new AuthAdapterImpl(config, logger);

      // Warm up all realms on init
      const realmKeys = Object.keys(config.iam.realms ?? {});
      await adapter.warmupRealms(realmKeys);

      return adapter;
    },
    "singleton"
  );
}
