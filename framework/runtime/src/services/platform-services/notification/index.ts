/**
 * Notification Framework — Module Composition Root
 *
 * Registers all notification services, repos, adapters, handlers, and routes.
 * Follows the RuntimeModule pattern (register + contribute).
 */

import { TOKENS } from "../../../kernel/tokens.js";

// Persistence
import { NotificationMessageRepo } from "./persistence/NotificationMessageRepo.js";
import { NotificationDeliveryRepo } from "./persistence/NotificationDeliveryRepo.js";
import { NotificationRuleRepo } from "./persistence/NotificationRuleRepo.js";
import { NotificationTemplateRepo } from "./persistence/NotificationTemplateRepo.js";
import { NotificationPreferenceRepo } from "./persistence/NotificationPreferenceRepo.js";
import { NotificationSuppressionRepo } from "./persistence/NotificationSuppressionRepo.js";
import { InAppNotificationRepo } from "./persistence/InAppNotificationRepo.js";

// Domain services
import { NotificationOrchestrator } from "./domain/services/NotificationOrchestrator.js";
import { RuleEngine } from "./domain/services/RuleEngine.js";
import { TemplateRenderer } from "./domain/services/TemplateRenderer.js";
import { PreferenceEvaluator } from "./domain/services/PreferenceEvaluator.js";
import { DeduplicationService } from "./domain/services/DeduplicationService.js";
import { RecipientResolver } from "./domain/services/RecipientResolver.js";

// Adapters
import { ChannelRegistry } from "./adapters/ChannelRegistry.js";
import { SendGridAdapter } from "./adapters/email/SendGridAdapter.js";
import { TeamsAdapter } from "./adapters/teams/TeamsAdapter.js";
import { InAppAdapter } from "./adapters/inapp/InAppAdapter.js";

// Observability
import { NotificationMetrics } from "./observability/metrics.js";
import { createNotifyLogger } from "./observability/logger.js";

// Handlers
import {
    ListNotificationsHandler,
    UnreadCountHandler,
    MarkReadHandler,
    MarkAllReadHandler,
    DismissHandler,
} from "./api/handlers/notification.handler.js";
import {
    GetPreferencesHandler,
    UpdatePreferencesHandler,
} from "./api/handlers/preference.handler.js";
import {
    ListTemplatesHandler,
    CreateTemplateHandler,
    PreviewTemplateHandler,
} from "./api/handlers/template-admin.handler.js";
import {
    ListRulesHandler,
    CreateRuleHandler,
    UpdateRuleHandler,
} from "./api/handlers/rule-admin.handler.js";
import {
    ListMessagesHandler,
    GetMessageDeliveriesHandler,
    ListDeliveriesHandler,
    MessageStatsHandler,
} from "./api/handlers/delivery-admin.handler.js";
import { SendGridCallbackHandler } from "./api/handlers/callback.handler.js";

// Workers
import { createPlanNotificationHandler } from "./jobs/workers/planNotification.worker.js";
import { createDeliverNotificationHandler } from "./jobs/workers/deliverNotification.worker.js";
import { createProcessCallbackHandler } from "./jobs/workers/processCallback.worker.js";
import { createCleanupExpiredHandler } from "./jobs/workers/cleanupExpired.worker.js";

import type { Container } from "../../../kernel/container.js";
import type { Logger } from "../../../kernel/logger.js";
import type { RuntimeModule } from "../../registry.js";
import type { RouteRegistry } from "../../platform/foundation/registries/routes.registry.js";
import type { RuntimeConfig } from "../../../kernel/config.schema.js";
import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";
import type Redis from "ioredis";
import type { JobQueue, MetricsRegistry } from "@athyper/core";

// ============================================================================
// Repo Tokens (internal to this module)
// ============================================================================

const REPO_TOKENS = {
    message: "notify.repo.message",
    delivery: "notify.repo.delivery",
    rule: "notify.repo.rule",
    template: "notify.repo.template",
    preference: "notify.repo.preference",
    suppression: "notify.repo.suppression",
    inapp: "notify.repo.inapp",
} as const;

// ============================================================================
// Handler Tokens (internal to this module)
// ============================================================================

const HANDLER_TOKENS = {
    listNotifications: "notify.handler.listNotifications",
    unreadCount: "notify.handler.unreadCount",
    markRead: "notify.handler.markRead",
    markAllRead: "notify.handler.markAllRead",
    dismiss: "notify.handler.dismiss",
    getPreferences: "notify.handler.getPreferences",
    updatePreferences: "notify.handler.updatePreferences",
    listTemplates: "notify.handler.listTemplates",
    createTemplate: "notify.handler.createTemplate",
    previewTemplate: "notify.handler.previewTemplate",
    listRules: "notify.handler.listRules",
    createRule: "notify.handler.createRule",
    updateRule: "notify.handler.updateRule",
    listMessages: "notify.handler.listMessages",
    getMessageDeliveries: "notify.handler.getMessageDeliveries",
    listDeliveries: "notify.handler.listDeliveries",
    messageStats: "notify.handler.messageStats",
    sendgridCallback: "notify.handler.sendgridCallback",
} as const;

// ============================================================================
// Module Definition
// ============================================================================

export const module: RuntimeModule = {
    name: "platform-services.notification",

    async register(c: Container) {
        const db = await c.resolve<Kysely<DB>>(TOKENS.db);
        const baseLogger = await c.resolve<Logger>(TOKENS.logger);
        const logger = createNotifyLogger(baseLogger, "lifecycle");

        logger.info("Registering notification module");

        // ── Persistence ─────────────────────────────────────────────────
        c.register(REPO_TOKENS.message, async () => new NotificationMessageRepo(db), "singleton");
        c.register(REPO_TOKENS.delivery, async () => new NotificationDeliveryRepo(db), "singleton");
        c.register(REPO_TOKENS.rule, async () => new NotificationRuleRepo(db), "singleton");
        c.register(REPO_TOKENS.template, async () => new NotificationTemplateRepo(db), "singleton");
        c.register(REPO_TOKENS.preference, async () => new NotificationPreferenceRepo(db), "singleton");
        c.register(REPO_TOKENS.suppression, async () => new NotificationSuppressionRepo(db), "singleton");
        c.register(REPO_TOKENS.inapp, async () => new InAppNotificationRepo(db), "singleton");

        // ── Channel Adapters + Registry ─────────────────────────────────
        c.register(TOKENS.notificationChannelRegistry, async () => {
            const adapterLogger = createNotifyLogger(baseLogger, "adapter");
            const config = await c.resolve<RuntimeConfig>(TOKENS.config);
            const registry = new ChannelRegistry(adapterLogger);

            // InApp adapter (always enabled)
            const inAppRepo = await c.resolve<InAppNotificationRepo>(REPO_TOKENS.inapp);
            registry.register(new InAppAdapter(inAppRepo, adapterLogger));

            // SendGrid adapter (if configured)
            const sgConfig = config.notification?.providers?.email?.sendgrid;
            if (sgConfig?.enabled && sgConfig.apiKeyRef && sgConfig.fromAddress) {
                registry.register(new SendGridAdapter({
                    apiKeyRef: sgConfig.apiKeyRef,
                    fromAddress: sgConfig.fromAddress,
                    fromName: sgConfig.fromName,
                }, adapterLogger));
            }

            // Teams Power Automate adapter (if configured)
            const teamsConfig = config.notification?.providers?.teams?.powerAutomate;
            if (teamsConfig?.enabled && teamsConfig.webhookUrl) {
                registry.register(new TeamsAdapter({
                    webhookUrl: teamsConfig.webhookUrl,
                }, adapterLogger));
            }

            return registry;
        }, "singleton");

        // ── Domain Services ─────────────────────────────────────────────
        c.register(TOKENS.notificationRuleEngine, async () => {
            const ruleRepo = await c.resolve<NotificationRuleRepo>(REPO_TOKENS.rule);
            return new RuleEngine(ruleRepo, createNotifyLogger(baseLogger, "planning"));
        }, "singleton");

        c.register(TOKENS.notificationTemplateRenderer, async () => {
            const templateRepo = await c.resolve<NotificationTemplateRepo>(REPO_TOKENS.template);
            return new TemplateRenderer(templateRepo, createNotifyLogger(baseLogger, "template"));
        }, "singleton");

        c.register(TOKENS.notificationPreferenceEvaluator, async () => {
            const prefRepo = await c.resolve<NotificationPreferenceRepo>(REPO_TOKENS.preference);
            const suppRepo = await c.resolve<NotificationSuppressionRepo>(REPO_TOKENS.suppression);
            return new PreferenceEvaluator(prefRepo, suppRepo, createNotifyLogger(baseLogger, "preference"));
        }, "singleton");

        c.register(TOKENS.notificationOrchestrator, async () => {
            const config = await c.resolve<RuntimeConfig>(TOKENS.config);
            const redis = await c.resolve<Redis>(TOKENS.cache);
            const jobQueue = await c.resolve<JobQueue>(TOKENS.jobQueue);

            const ruleEngine = await c.resolve<RuleEngine>(TOKENS.notificationRuleEngine);
            const templateRenderer = await c.resolve<TemplateRenderer>(TOKENS.notificationTemplateRenderer);
            const preferenceEval = await c.resolve<PreferenceEvaluator>(TOKENS.notificationPreferenceEvaluator);
            const channelRegistry = await c.resolve<ChannelRegistry>(TOKENS.notificationChannelRegistry);
            const messageRepo = await c.resolve<NotificationMessageRepo>(REPO_TOKENS.message);
            const deliveryRepo = await c.resolve<NotificationDeliveryRepo>(REPO_TOKENS.delivery);

            const recipientResolver = new RecipientResolver(db, createNotifyLogger(baseLogger, "planning"));
            const dedupService = new DeduplicationService(redis, createNotifyLogger(baseLogger, "dedup"));

            const deliveryConfig = config.notification?.delivery ?? {};

            return new NotificationOrchestrator(
                ruleEngine,
                recipientResolver,
                preferenceEval,
                templateRenderer,
                dedupService,
                channelRegistry,
                messageRepo,
                deliveryRepo,
                jobQueue,
                createNotifyLogger(baseLogger, "delivery"),
                {
                    maxRetries: deliveryConfig.maxRetries ?? 3,
                    retryBackoffMs: deliveryConfig.retryBackoffMs ?? 2000,
                    defaultPriority: deliveryConfig.defaultPriority ?? "normal",
                    defaultLocale: deliveryConfig.defaultLocale ?? "en",
                },
            );
        }, "singleton");

        // ── Observability ───────────────────────────────────────────────
        c.register(TOKENS.notificationMetrics, async () => {
            const metricsRegistry = await c.resolve<MetricsRegistry>(TOKENS.metricsRegistry);
            return new NotificationMetrics(metricsRegistry);
        }, "singleton");

        // ── HTTP Handlers ───────────────────────────────────────────────
        c.register(HANDLER_TOKENS.listNotifications, async () => new ListNotificationsHandler(), "singleton");
        c.register(HANDLER_TOKENS.unreadCount, async () => new UnreadCountHandler(), "singleton");
        c.register(HANDLER_TOKENS.markRead, async () => new MarkReadHandler(), "singleton");
        c.register(HANDLER_TOKENS.markAllRead, async () => new MarkAllReadHandler(), "singleton");
        c.register(HANDLER_TOKENS.dismiss, async () => new DismissHandler(), "singleton");
        c.register(HANDLER_TOKENS.getPreferences, async () => new GetPreferencesHandler(), "singleton");
        c.register(HANDLER_TOKENS.updatePreferences, async () => new UpdatePreferencesHandler(), "singleton");
        c.register(HANDLER_TOKENS.listTemplates, async () => new ListTemplatesHandler(), "singleton");
        c.register(HANDLER_TOKENS.createTemplate, async () => new CreateTemplateHandler(), "singleton");
        c.register(HANDLER_TOKENS.previewTemplate, async () => new PreviewTemplateHandler(), "singleton");
        c.register(HANDLER_TOKENS.listRules, async () => new ListRulesHandler(), "singleton");
        c.register(HANDLER_TOKENS.createRule, async () => new CreateRuleHandler(), "singleton");
        c.register(HANDLER_TOKENS.updateRule, async () => new UpdateRuleHandler(), "singleton");
        c.register(HANDLER_TOKENS.listMessages, async () => new ListMessagesHandler(), "singleton");
        c.register(HANDLER_TOKENS.getMessageDeliveries, async () => new GetMessageDeliveriesHandler(), "singleton");
        c.register(HANDLER_TOKENS.listDeliveries, async () => new ListDeliveriesHandler(), "singleton");
        c.register(HANDLER_TOKENS.messageStats, async () => new MessageStatsHandler(), "singleton");
        c.register(HANDLER_TOKENS.sendgridCallback, async () => new SendGridCallbackHandler(), "singleton");
    },

    async contribute(c: Container) {
        const baseLogger = await c.resolve<Logger>(TOKENS.logger);
        const logger = createNotifyLogger(baseLogger, "lifecycle");
        const routes = await c.resolve<RouteRegistry>(TOKENS.routeRegistry);

        // ================================================================
        // User-facing: Notification Inbox
        // ================================================================

        routes.add({
            method: "GET",
            path: "/api/notifications",
            handlerToken: HANDLER_TOKENS.listNotifications,
            authRequired: true,
            tags: ["notify"],
        });
        routes.add({
            method: "GET",
            path: "/api/notifications/unread-count",
            handlerToken: HANDLER_TOKENS.unreadCount,
            authRequired: true,
            tags: ["notify"],
        });
        routes.add({
            method: "POST",
            path: "/api/notifications/:id/read",
            handlerToken: HANDLER_TOKENS.markRead,
            authRequired: true,
            tags: ["notify"],
        });
        routes.add({
            method: "POST",
            path: "/api/notifications/mark-all-read",
            handlerToken: HANDLER_TOKENS.markAllRead,
            authRequired: true,
            tags: ["notify"],
        });
        routes.add({
            method: "POST",
            path: "/api/notifications/:id/dismiss",
            handlerToken: HANDLER_TOKENS.dismiss,
            authRequired: true,
            tags: ["notify"],
        });

        // ================================================================
        // User-facing: Preferences
        // ================================================================

        routes.add({
            method: "GET",
            path: "/api/notifications/preferences",
            handlerToken: HANDLER_TOKENS.getPreferences,
            authRequired: true,
            tags: ["notify"],
        });
        routes.add({
            method: "PUT",
            path: "/api/notifications/preferences",
            handlerToken: HANDLER_TOKENS.updatePreferences,
            authRequired: true,
            tags: ["notify"],
        });

        // ================================================================
        // Admin: Templates
        // ================================================================

        routes.add({
            method: "GET",
            path: "/api/admin/notifications/templates",
            handlerToken: HANDLER_TOKENS.listTemplates,
            authRequired: true,
            tags: ["notify", "admin"],
        });
        routes.add({
            method: "POST",
            path: "/api/admin/notifications/templates",
            handlerToken: HANDLER_TOKENS.createTemplate,
            authRequired: true,
            tags: ["notify", "admin"],
        });
        routes.add({
            method: "POST",
            path: "/api/admin/notifications/templates/:id/preview",
            handlerToken: HANDLER_TOKENS.previewTemplate,
            authRequired: true,
            tags: ["notify", "admin"],
        });

        // ================================================================
        // Admin: Rules
        // ================================================================

        routes.add({
            method: "GET",
            path: "/api/admin/notifications/rules",
            handlerToken: HANDLER_TOKENS.listRules,
            authRequired: true,
            tags: ["notify", "admin"],
        });
        routes.add({
            method: "POST",
            path: "/api/admin/notifications/rules",
            handlerToken: HANDLER_TOKENS.createRule,
            authRequired: true,
            tags: ["notify", "admin"],
        });
        routes.add({
            method: "PUT",
            path: "/api/admin/notifications/rules/:id",
            handlerToken: HANDLER_TOKENS.updateRule,
            authRequired: true,
            tags: ["notify", "admin"],
        });

        // ================================================================
        // Admin: Deliveries
        // ================================================================

        routes.add({
            method: "GET",
            path: "/api/admin/notifications/messages",
            handlerToken: HANDLER_TOKENS.listMessages,
            authRequired: true,
            tags: ["notify", "admin"],
        });
        routes.add({
            method: "GET",
            path: "/api/admin/notifications/messages/:messageId/deliveries",
            handlerToken: HANDLER_TOKENS.getMessageDeliveries,
            authRequired: true,
            tags: ["notify", "admin"],
        });
        routes.add({
            method: "GET",
            path: "/api/admin/notifications/deliveries",
            handlerToken: HANDLER_TOKENS.listDeliveries,
            authRequired: true,
            tags: ["notify", "admin"],
        });
        routes.add({
            method: "GET",
            path: "/api/admin/notifications/stats",
            handlerToken: HANDLER_TOKENS.messageStats,
            authRequired: true,
            tags: ["notify", "admin"],
        });

        // ================================================================
        // Provider Webhooks
        // ================================================================

        routes.add({
            method: "POST",
            path: "/api/webhooks/notification/sendgrid",
            handlerToken: HANDLER_TOKENS.sendgridCallback,
            authRequired: false,
            tags: ["notify", "webhook"],
        });

        // ================================================================
        // Register Job Workers
        // ================================================================

        const config = await c.resolve<RuntimeConfig>(TOKENS.config);
        const jobQueue = await c.resolve<JobQueue>(TOKENS.jobQueue);
        const orchestrator = await c.resolve<NotificationOrchestrator>(TOKENS.notificationOrchestrator);
        const workerLogger = createNotifyLogger(baseLogger, "delivery");
        const concurrency = config.notification?.delivery?.workerConcurrency ?? 5;

        const db = await c.resolve<Kysely<DB>>(TOKENS.db);
        const suppressionRepo = await c.resolve<NotificationSuppressionRepo>(REPO_TOKENS.suppression);

        await jobQueue.process("plan-notification", concurrency, createPlanNotificationHandler(orchestrator, workerLogger));
        await jobQueue.process("deliver-notification", concurrency, createDeliverNotificationHandler(orchestrator, workerLogger));
        await jobQueue.process("process-callback", 2, createProcessCallbackHandler(orchestrator, workerLogger));
        await jobQueue.process("cleanup-expired", 1, createCleanupExpiredHandler(db, suppressionRepo, workerLogger));

        logger.info("Notification module contributed — routes and workers registered");
    },
};

export const moduleCode = "NOTIFY";
export const moduleName = "Notification Framework";
