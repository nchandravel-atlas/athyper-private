// framework/runtime/kernel/container.defaults.ts
import { TOKENS } from "./tokens";
import type { RuntimeConfig } from "./config.schema";
import { Lifecycle } from "./lifecycle";
import type { Container } from "./container";
import { NoopAuditWriter, makeAuditEvent, type AuditWriter } from "./audit";

import { ServiceRegistry } from "../registries/services.registry";
import { RouteRegistry } from "../registries/routes.registry";
import { JobRegistry } from "../registries/jobs.registry";

export interface KernelDefaultsOptions {
    /**
     * Env snapshot provided by kernel bootstrap/config loader.
     * Do NOT read process.env directly in container defaults.
     */
    envSnapshot?: Record<string, string | undefined>;

    /**
     * Boot ID provided by bootstrap() for correlation.
     */
    bootId?: string;
}

/**
 * Registers baseline runtime capabilities into the container.
 *
 * IMPORTANT:
 * - Do NOT resolve dependencies here (keep this sync + deterministic).
 * - Boot/side-effects happen in bootstrap() after registration.
 */
export function registerKernelDefaults(container: Container, config: RuntimeConfig, options?: KernelDefaultsOptions) {
    // Kernel primitives
    container.register(TOKENS.config, async () => config, "singleton");
    container.register(TOKENS.lifecycle, async () => new Lifecycle(), "singleton");

    // Env snapshot (sanitized/minimal). No direct process.env reads here.
    const snapshot = Object.freeze({ ...(options?.envSnapshot ?? {}) });
    container.register(TOKENS.env, async () => snapshot, "singleton");

    container.register(TOKENS.clock, async () => ({ now: () => new Date() }), "singleton");

    // Boot ID for correlation
    container.register(TOKENS.bootId, async () => options?.bootId ?? "boot-unknown", "singleton");

    // Logger: minimal fallback (replace later with pino)
    container.register(
        TOKENS.logger,
        async () => {
            const level = config.logLevel ?? "info";
            const write = (lvl: string, msg: string, meta?: any) => {
                // eslint-disable-next-line no-console
                console.log(JSON.stringify({ level: lvl ?? level, msg, ...meta }));
            };
            return {
                info: (meta: any, msg?: string) => write("info", msg ?? "info", meta),
                warn: (meta: any, msg?: string) => write("warn", msg ?? "warn", meta),
                error: (meta: any, msg?: string) => write("error", msg ?? "error", meta),
                debug: (meta: any, msg?: string) => write("debug", msg ?? "debug", meta),
                log: (msg: string) => write(level, msg),
            };
        },
        "singleton",
    );

    // Audit: default no-op (later replace with DB/stream writer)
    container.register(TOKENS.auditWriter, async () => NoopAuditWriter, "singleton");

    // Registries (definition buckets)
    container.register(TOKENS.serviceRegistry, async () => new ServiceRegistry(), "singleton");
    container.register(TOKENS.routeRegistry, async () => new RouteRegistry(), "singleton");
    container.register(TOKENS.jobRegistry, async () => new JobRegistry(), "singleton");
}

/**
 * Install signal handlers AFTER kernel defaults are registered.
 *
 * Called from bootstrap() so we can resolve lifecycle/logger/audit safely.
 */
export async function installSignalHandlers(container: Container) {
    const config = await container.resolve<RuntimeConfig>(TOKENS.config);
    const lifecycle = await container.resolve<Lifecycle>(TOKENS.lifecycle);
    const logger = await container.resolve<any>(TOKENS.logger);
    const audit = await container.resolve<AuditWriter>(TOKENS.auditWriter);
    const bootId = await container.resolve<string>(TOKENS.bootId);

    const shutdown = async (reason: string) => {
        logger.info?.({ reason, bootId }, "[kernel] shutdown requested");

        await audit.write(
            makeAuditEvent({
                type: "runtime.shutdown",
                level: "info",
                actor: { kind: "system" },
                meta: { reason, bootId },
            }),
        );

        const timeout = config.shutdownTimeoutMs ?? 15_000;

        await Promise.race([
            lifecycle.shutdown(reason),
            new Promise<void>((resolve) => setTimeout(resolve, timeout)),
        ]);
    };

    process.once("SIGINT", () => void shutdown("SIGINT"));
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
}