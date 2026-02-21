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
    savedViewService: "ui.savedView",
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

    // Content Management
    contentService: "content.service",
    versionService: "content.versionService",
    linkService: "content.linkService",
    aclService: "content.aclService",
    contentAuditEmitter: "content.auditEmitter",
    accessLogService: "content.accessLogService",
    commentService: "content.commentService",
    multipartUploadService: "content.multipartUploadService",
    previewService: "content.previewService",
    expiryService: "content.expiryService",

    // Collaboration Services
    collabCommentService: "collab.commentService",
    collabCommentRepo: "collab.commentRepo",
    collabMentionService: "collab.mentionService",
    collabMentionRepo: "collab.mentionRepo",
    collabTimelineService: "collab.timelineService",
    collabApprovalCommentService: "collab.approvalCommentService",
    collabApprovalCommentRepo: "collab.approvalCommentRepo",
    collabAttachmentService: "collab.attachmentService",
    collabRateLimiter: "collab.rateLimiter",
    collabSearchService: "collab.searchService",
    collabReactionService: "collab.reactionService",
    collabReactionRepo: "collab.reactionRepo",
    collabReadTrackingService: "collab.readTrackingService",
    collabReadTrackingRepo: "collab.readTrackingRepo",
    collabModerationService: "collab.moderationService",
    collabModerationRepo: "collab.moderationRepo",
    collabSLAService: "collab.slaService",
    collabSLARepo: "collab.slaRepo",
    collabAnalyticsService: "collab.analyticsService",
    collabRetentionService: "collab.retentionService",
    collabRetentionRepo: "collab.retentionRepo",
    collabEventsService: "collab.eventsService",
    collabDraftService: "collab.draftService",
    collabDraftRepo: "collab.draftRepo",

    // Sharing & Delegation
    shareTaskDelegationService: "share.taskDelegation",
    shareAdminReassignmentService: "share.adminReassignment",
    shareEnforcementService: "share.enforcement",
    sharePolicyResolver: "share.policyResolver",
    shareRecordShareService: "share.recordShare",
    shareTemporaryAccessService: "share.temporaryAccess",
    shareAuditService: "share.audit",
    shareCrossTenantService: "share.crossTenant",
    shareDelegationGrantRepo: "share.delegationGrantRepo",
    shareRecordShareRepo: "share.recordShareRepo",

    // Integration Hub
    integrationHttpClient: "int.httpClient",
    integrationRateLimiter: "int.rateLimiter",
    integrationMetrics: "int.metrics",
    integrationDeliveryScheduler: "int.deliveryScheduler",
    integrationOrchestrator: "int.orchestrator",
    integrationWebhookService: "int.webhookService",
    integrationEventGateway: "int.eventGateway",
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