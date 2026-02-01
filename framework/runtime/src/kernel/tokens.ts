// framework/runtime/kernel/tokens.ts
import type { AuditWriter } from "./audit";
import type { RuntimeConfig } from "./config.schema";
import type { Lifecycle } from "./lifecycle";
import type { Logger } from "./logger";
import type { DbAdapter } from "../adapters/db/db.adapter";
import type { AuthAdapter } from "../adapters/auth/auth.adapter";
import type { TelemetryAdapter } from "../adapters/telemetry/telemetry.adapter";

/**
 * Global DI tokens for athyper runtime.
 * Keep tokens stable; swap implementations behind them.
 */
export const TOKENS = {
    // Kernel
    config: "kernel.config",
    logger: "kernel.logger",
    lifecycle: "kernel.lifecycle",
    env: "kernel.env",
    clock: "kernel.clock",
    bootId: "kernel.bootId",

    // Context (scoped)
    requestContext: "context.request",
    tenantContext: "context.tenant",
    authContext: "context.auth",

    // Adapters
    db: "adapter.db",
    auth: "adapter.auth",
    cache: "adapter.cache",
    objectStorage: "adapter.objectStorage",
    telemetry: "adapter.telemetry",

    // Runtime
    httpServer: "runtime.httpServer",
    jobQueue: "runtime.jobQueue",
    scheduler: "runtime.scheduler",
    workerPool: "runtime.workerPool",

    // Registries
    routeRegistry: "registry.routes",
    serviceRegistry: "registry.services",
    jobRegistry: "registry.jobs",

    // Governance
    auditWriter: "governance.audit",
    featureFlags: "governance.featureFlags",
} as const;

export type TokenName = (typeof TOKENS)[keyof typeof TOKENS]; // "kernel.config" | ...
export type TokenKey = keyof typeof TOKENS; // "config" | "logger" | ...

/**
 * Token -> resolved value type map.
 * Add more entries as you implement/register them.
 */
export interface TokenTypes {
    // Kernel
    [TOKENS.config]: RuntimeConfig;
    [TOKENS.logger]: Logger;
    [TOKENS.lifecycle]: Lifecycle;
    [TOKENS.env]: Readonly<Record<string, string | undefined>>;
    [TOKENS.clock]: { now: () => Date };
    [TOKENS.bootId]: string;

    // Context (scoped)
    [TOKENS.requestContext]: unknown;
    [TOKENS.tenantContext]: unknown;
    [TOKENS.authContext]: unknown;

    // Adapters (fully typed)
    [TOKENS.db]: DbAdapter;
    [TOKENS.auth]: AuthAdapter;
    [TOKENS.telemetry]: TelemetryAdapter;
    [TOKENS.cache]: unknown;
    [TOKENS.objectStorage]: unknown;

    // Governance
    [TOKENS.auditWriter]: AuditWriter;
    [TOKENS.featureFlags]: unknown;

    // Runtime/Registries can be added when concrete types exist
}

export type TokenValue<T extends TokenName> = T extends keyof TokenTypes
    ? TokenTypes[T]
    : unknown;
