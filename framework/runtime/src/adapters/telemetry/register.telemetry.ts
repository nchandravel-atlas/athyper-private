import type { Container } from "../../kernel/container";
import { TOKENS } from "../../kernel/tokens";
import type { RuntimeConfig } from "../../kernel/config.schema";
import type { TelemetryAdapter } from "./telemetry.adapter";
import { TelemetryAdapterImpl } from "./telemetry.adapter.impl";

export async function registerTelemetryAdapter(container: Container): Promise<void> {
  container.register(
    TOKENS.telemetry,
    async (c: Container): Promise<TelemetryAdapter> => {
      const config = await c.resolve<RuntimeConfig>(TOKENS.config);

      const adapter = await TelemetryAdapterImpl.create(config);

      // Register cleanup on shutdown
      const lifecycle = await c.resolve<any>(TOKENS.lifecycle);
      lifecycle.onShutdown("telemetry-adapter", () => adapter.shutdown());

      return adapter;
    },
    "singleton"
  );
}
