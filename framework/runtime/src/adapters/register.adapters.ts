import type { Container } from "../kernel/container";
import { registerTelemetryAdapter } from "./telemetry/register.telemetry";
import { registerAuthAdapter } from "./auth/register.auth";
import { registerDbAdapter } from "./db/register.db";

/**
 * Register ALL adapters into the container.
 * Called from bootstrap() after kernel defaults are in place.
 *
 * Registration order:
 * 1. Telemetry (logging for subsequent adapters)
 * 2. Auth (no dependencies)
 * 3. DB (may log auth errors if auth is misconfigured)
 */
export async function registerAdapters(container: Container): Promise<void> {
  await registerTelemetryAdapter(container);
  await registerAuthAdapter(container);
  await registerDbAdapter(container);
}
