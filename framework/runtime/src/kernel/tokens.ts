// framework/runtime/kernel/tokens.ts
import type { JobQueue } from "@athyper/core";
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

    // IAM (Identity & Access)
    iamCapabilityService: "iam.capabilityService",
    iamMfaService: "iam.mfaService",
    iamSessionInvalidation: "iam.sessionInvalidation",
    iamTenantProfile: "iam.tenantProfile",

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

    // Audit & Governance
    auditWorkflowRepo: "audit.workflowRepo",
    auditOutboxRepo: "audit.outboxRepo",
    auditHashChain: "audit.hashChain",
    auditRedaction: "audit.redaction",
    auditRateLimiter: "audit.rateLimiter",
    auditQueryGate: "audit.queryGate",
    auditResilientWriter: "audit.resilientWriter",
    auditTimeline: "audit.timeline",
    auditMetrics: "audit.metrics",
    auditFeatureFlags: "audit.featureFlags",
    auditDlqRepo: "audit.dlqRepo",
    auditDlqManager: "audit.dlqManager",
    auditEncryption: "audit.encryption",
    auditLoadShedding: "audit.loadShedding",
    auditIntegrity: "audit.integrity",
    auditReplay: "audit.replay",
    auditArchiveMarkerRepo: "audit.archiveMarkerRepo",
    auditStorageTiering: "audit.storageTiering",
    auditExplainability: "audit.explainability",
    auditAccessReport: "audit.accessReport",
    auditDsar: "audit.dsar",

    // Security & Policy
    policyGate: "security.policyGate",
    fieldAccessService: "security.fieldAccess",
    fieldSecurityRepo: "security.fieldSecurityRepo",
    fieldProjectionBuilder: "security.fieldProjection",

    // Document Framework
    documentRenderService: "doc.renderService",
    documentTemplateService: "doc.templateService",
    documentOutputService: "doc.outputService",
    documentLetterheadService: "doc.letterheadService",
    documentBrandService: "doc.brandService",
    documentHtmlComposer: "doc.htmlComposer",
    documentPdfRenderer: "doc.pdfRenderer",
    documentMetrics: "doc.metrics",
    documentDlqManager: "doc.dlqManager",
    documentAuditEmitter: "doc.auditEmitter",
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

    // Runtime
    [TOKENS.jobQueue]: JobQueue;

    // Governance
    [TOKENS.auditWriter]: AuditWriter;
    [TOKENS.featureFlags]: unknown;
}

export type TokenValue<T extends TokenName> = T extends keyof TokenTypes
    ? TokenTypes[T]
    : unknown;