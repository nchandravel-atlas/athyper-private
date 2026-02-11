// framework/runtime/kernel/tokens.ts
import type { AuditWriter } from "./audit";
import type { RuntimeConfig } from "./config.schema";
import type { Lifecycle } from "./lifecycle";
import type { Logger } from "./logger";

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
    circuitBreakers: "runtime.circuitBreakers",

    // Observability
    healthRegistry: "observability.health",
    metricsRegistry: "observability.metrics",
    requestContextStorage: "observability.requestContext",
    gracefulShutdown: "observability.shutdown",

    // Registries
    routeRegistry: "registry.routes",
    serviceRegistry: "registry.services",
    jobRegistry: "registry.jobs",

    // Governance
    auditWriter: "governance.audit",
    featureFlags: "governance.featureFlags",

    // UI Services
    dashboardService: "ui.dashboard",
    widgetRegistry: "ui.widgetRegistry",
    contributionLoader: "ui.contributionLoader",

    // Notification Framework
    notificationOrchestrator: "notify.orchestrator",
    notificationRuleEngine: "notify.ruleEngine",
    notificationTemplateRenderer: "notify.templateRenderer",
    notificationPreferenceEvaluator: "notify.preferenceEvaluator",
    notificationChannelRegistry: "notify.channelRegistry",
    notificationMetrics: "notify.metrics",
    notificationWhatsAppSync: "notify.whatsappSync",
    notificationDigestAggregator: "notify.digestAggregator",
    notificationDlqManager: "notify.dlqManager",
    notificationExplainability: "notify.explainability",
    notificationScopedPreferences: "notify.scopedPreferences",
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

    // Governance
    [TOKENS.auditWriter]: AuditWriter;
    [TOKENS.featureFlags]: unknown;

    // NOTE: adapters/runtime/registries can be added when concrete types exist.
}

export type TokenValue<T extends TokenName> = T extends keyof TokenTypes
    ? TokenTypes[T]
    : unknown;