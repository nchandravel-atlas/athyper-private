/**
 * NotificationOrchestrator — Core pipeline: Event → Plan → Deliver → Track.
 *
 * Subscribes to domain events via the EventBus, matches them against
 * notification rules, resolves recipients, checks preferences/dedup,
 * creates message + delivery records, and enqueues BullMQ delivery jobs.
 *
 * Flow:
 * 1. Domain event received → RuleEngine matches rules
 * 2. RecipientResolver expands recipient specs → concrete users
 * 3. PreferenceEvaluator filters by user prefs + suppression
 * 4. DeduplicationService checks for recent duplicates
 * 5. Create NotificationMessage + NotificationDelivery rows
 * 6. Enqueue delivery jobs (one per delivery row)
 */

import type { DomainEvent, EventBus, JobQueue, JobData, JobOptions } from "@athyper/core";
import type { Logger } from "../../../../../kernel/logger.js";

import type { RuleEngine, EventContext, DeliveryPlanItem } from "./RuleEngine.js";
import type { RecipientResolver, ResolvedRecipient } from "./RecipientResolver.js";
import type { PreferenceEvaluator } from "./PreferenceEvaluator.js";
import type { TemplateRenderer } from "./TemplateRenderer.js";
import type { DeduplicationService } from "./DeduplicationService.js";
import type { IChannelRegistry, ChannelCode, MessageId, DeliveryId, NotificationPriority } from "../types.js";

import type { NotificationMessageRepo } from "../../persistence/NotificationMessageRepo.js";
import type { NotificationDeliveryRepo } from "../../persistence/NotificationDeliveryRepo.js";
import type { CreateDeliveryInput } from "../models/NotificationDelivery.js";

// ─── Job Payload Types ──────────────────────────────────────────────

export interface PlanNotificationPayload {
    tenantId: string;
    eventId: string;
    eventType: string;
    entityType?: string;
    entityId?: string;
    lifecycleState?: string;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

export interface DeliverNotificationPayload {
    deliveryId: string;
    messageId: string;
    tenantId: string;
    channel: string;
    providerCode: string;
    recipientAddr: string;
    recipientId?: string;
    templateKey: string;
    templateVersion: number;
    subject?: string;
    payload: Record<string, unknown>;
    priority: string;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}

export interface ProcessCallbackPayload {
    provider: string;
    externalId: string;
    eventType: string;
    timestamp: string;
    rawPayload: Record<string, unknown>;
}

export interface CleanupExpiredPayload {
    tenantId?: string;
    messageDays: number;
    deliveryDays: number;
}

// ─── Priority Mapping ───────────────────────────────────────────────

const PRIORITY_MAP: Record<string, number> = {
    critical: 1,
    high: 5,
    normal: 10,
    low: 20,
};

// ─── Orchestrator ───────────────────────────────────────────────────

export class NotificationOrchestrator {
    private unsubscribers: Array<() => void> = [];

    constructor(
        private readonly ruleEngine: RuleEngine,
        private readonly recipientResolver: RecipientResolver,
        private readonly preferenceEvaluator: PreferenceEvaluator,
        private readonly templateRenderer: TemplateRenderer,
        private readonly dedupService: DeduplicationService,
        private readonly channelRegistry: IChannelRegistry,
        private readonly messageRepo: NotificationMessageRepo,
        private readonly deliveryRepo: NotificationDeliveryRepo,
        private readonly jobQueue: JobQueue,
        private readonly logger: Logger,
        private readonly config: {
            maxRetries: number;
            retryBackoffMs: number;
            defaultPriority: string;
            defaultLocale: string;
        },
    ) {}

    // ─── Event Subscription ─────────────────────────────────────────

    /**
     * Subscribe to all domain events via wildcard.
     * We use a catch-all approach — the RuleEngine filters which events have rules.
     */
    subscribeToEvents(eventBus: EventBus, eventTypes: string[]): void {
        for (const eventType of eventTypes) {
            const unsub = eventBus.subscribe(eventType, this.handleDomainEvent.bind(this));
            this.unsubscribers.push(unsub);
        }

        this.logger.info(
            { eventTypes: eventTypes.length },
            "[notify:orchestrator] Subscribed to domain events",
        );
    }

    /**
     * Handle an incoming domain event — enqueue a planning job.
     * We offload to a BullMQ job to ensure at-least-once processing
     * even if this handler crashes mid-flight.
     */
    private async handleDomainEvent(event: DomainEvent): Promise<void> {
        try {
            const jobData: JobData<PlanNotificationPayload> = {
                type: "plan-notification",
                payload: {
                    tenantId: (event.metadata?.tenantId as string) ?? "",
                    eventId: event.eventId,
                    eventType: event.eventType,
                    entityType: event.aggregateType,
                    entityId: event.aggregateId,
                    payload: event.payload as Record<string, unknown>,
                    metadata: event.metadata,
                },
            };

            const options: JobOptions = {
                priority: "normal",
                attempts: 3,
                backoff: { type: "exponential", delay: 2000 },
                removeOnComplete: true,
            };

            await this.jobQueue.add(jobData, options);

            this.logger.debug(
                { eventType: event.eventType, eventId: event.eventId },
                "[notify:orchestrator] Planning job enqueued",
            );
        } catch (err) {
            this.logger.error(
                { error: String(err), eventType: event.eventType, eventId: event.eventId },
                "[notify:orchestrator] Failed to enqueue planning job",
            );
        }
    }

    // ─── Planning Phase ─────────────────────────────────────────────

    /**
     * Plan notification delivery for a domain event.
     * Called by the planNotification worker.
     */
    async planNotification(input: PlanNotificationPayload): Promise<void> {
        const eventContext: EventContext = {
            tenantId: input.tenantId,
            eventId: input.eventId,
            eventType: input.eventType,
            entityType: input.entityType,
            entityId: input.entityId,
            lifecycleState: input.lifecycleState,
            payload: input.payload,
            metadata: input.metadata,
        };

        // 1. Match event against notification rules
        const plans = await this.ruleEngine.evaluate(eventContext);
        if (plans.length === 0) return;

        // 2. Process each matched rule
        for (const plan of plans) {
            await this.processPlanItem(input, eventContext, plan);
        }
    }

    private async processPlanItem(
        input: PlanNotificationPayload,
        _eventContext: EventContext,
        plan: DeliveryPlanItem,
    ): Promise<void> {
        // 1. Resolve recipients
        const recipients = await this.recipientResolver.resolve(
            input.tenantId,
            plan.recipientSpecs,
            input.payload,
        );

        if (recipients.length === 0) {
            this.logger.debug(
                { ruleCode: plan.rule.code, eventId: input.eventId },
                "[notify:orchestrator] No recipients resolved for rule",
            );
            return;
        }

        // 2. Resolve template to get version info
        const locale = (input.metadata?.locale as string) ?? this.config.defaultLocale;
        const firstChannel = plan.channels[0] as ChannelCode;
        const templateResult = await this.templateRenderer.render(
            plan.templateKey,
            firstChannel,
            locale,
            input.payload,
            input.tenantId,
        );

        const templateVersion = templateResult?.template.version ?? 1;
        const subject = templateResult?.rendered.subject;

        // 3. Create message record
        const message = await this.messageRepo.create({
            tenantId: input.tenantId,
            eventId: input.eventId,
            eventType: input.eventType,
            ruleId: plan.rule.id,
            templateKey: plan.templateKey,
            templateVersion,
            subject: subject ?? null,
            payload: input.payload,
            priority: plan.priority as NotificationPriority,
            recipientCount: 0, // Will be updated below
            entityType: input.entityType,
            entityId: input.entityId,
            correlationId: (input.metadata?.correlationId as string) ?? undefined,
            metadata: input.metadata,
        });

        // 4. For each recipient × channel, check preferences + dedup, create deliveries
        const deliveryInputs: CreateDeliveryInput[] = [];

        for (const recipient of recipients) {
            for (const channel of plan.channels) {
                // Check preference
                const prefResult = await this.preferenceEvaluator.check({
                    tenantId: input.tenantId,
                    principalId: recipient.principalId,
                    eventCode: input.eventType,
                    channel: channel as ChannelCode,
                    recipientAddr: this.getRecipientAddr(recipient, channel as ChannelCode),
                });

                if (!prefResult.allowed) {
                    this.logger.debug(
                        {
                            recipientId: recipient.principalId,
                            channel,
                            reason: prefResult.reason,
                        },
                        "[notify:orchestrator] Delivery blocked by preference",
                    );
                    continue;
                }

                // Check dedup
                const isDup = await this.dedupService.isDuplicate(
                    input.tenantId,
                    input.eventType,
                    recipient.principalId,
                    channel,
                    plan.dedupWindowMs,
                );

                if (isDup) continue;

                // Find adapter to get provider code
                const adapter = this.channelRegistry.getAdapter(channel as ChannelCode);
                if (!adapter) {
                    this.logger.warn(
                        { channel },
                        "[notify:orchestrator] No adapter registered for channel",
                    );
                    continue;
                }

                deliveryInputs.push({
                    messageId: message.id,
                    tenantId: input.tenantId,
                    channel: channel as ChannelCode,
                    providerCode: adapter.providerCode,
                    recipientId: recipient.principalId,
                    recipientAddr: this.getRecipientAddr(recipient, channel as ChannelCode),
                    maxAttempts: this.config.maxRetries,
                    metadata: {
                        displayName: recipient.displayName,
                    },
                });
            }
        }

        if (deliveryInputs.length === 0) {
            // All deliveries were filtered out
            await this.messageRepo.update(input.tenantId, message.id, {
                status: "completed",
                completedAt: new Date(),
            });
            return;
        }

        // 5. Batch-insert delivery rows
        const deliveryIds = await this.deliveryRepo.createBatch(deliveryInputs);

        // Update message recipient count
        await this.messageRepo.update(input.tenantId, message.id, {
            status: "delivering",
        });

        // 6. Enqueue delivery jobs
        const jobOptions: JobOptions = {
            priority: plan.priority as any,
            attempts: this.config.maxRetries,
            backoff: { type: "exponential", delay: this.config.retryBackoffMs },
            removeOnComplete: true,
        };

        const jobs = deliveryIds.map((deliveryId, idx) => ({
            data: {
                type: "deliver-notification",
                payload: {
                    deliveryId,
                    messageId: message.id,
                    tenantId: input.tenantId,
                    channel: deliveryInputs[idx].channel,
                    providerCode: deliveryInputs[idx].providerCode,
                    recipientAddr: deliveryInputs[idx].recipientAddr,
                    recipientId: deliveryInputs[idx].recipientId,
                    templateKey: plan.templateKey,
                    templateVersion,
                    subject,
                    payload: input.payload,
                    priority: plan.priority,
                    correlationId: (input.metadata?.correlationId as string) ?? undefined,
                    metadata: deliveryInputs[idx].metadata,
                } satisfies DeliverNotificationPayload,
            } satisfies JobData<DeliverNotificationPayload>,
            options: jobOptions,
        }));

        await this.jobQueue.addBulk(jobs);

        this.logger.info(
            {
                messageId: message.id,
                ruleCode: plan.rule.code,
                deliveryCount: deliveryIds.length,
                channels: plan.channels,
            },
            "[notify:orchestrator] Delivery jobs enqueued",
        );
    }

    // ─── Delivery Phase ─────────────────────────────────────────────

    /**
     * Execute a single delivery. Called by the deliverNotification worker.
     */
    async executeDelivery(input: DeliverNotificationPayload): Promise<void> {
        const delivery = await this.deliveryRepo.getById(
            input.tenantId,
            input.deliveryId as DeliveryId,
        );

        if (!delivery) {
            this.logger.warn(
                { deliveryId: input.deliveryId },
                "[notify:orchestrator] Delivery row not found",
            );
            return;
        }

        // Mark as queued
        await this.deliveryRepo.update(input.tenantId, input.deliveryId as DeliveryId, {
            status: "queued",
            attemptCount: delivery.attemptCount + 1,
        });

        // Resolve and render template
        const locale = (input.metadata?.locale as string) ?? this.config.defaultLocale;
        const templateResult = await this.templateRenderer.render(
            input.templateKey,
            input.channel as ChannelCode,
            locale,
            input.payload,
            input.tenantId,
        );

        // Build delivery request
        const deliveryRequest = {
            deliveryId: input.deliveryId,
            messageId: input.messageId,
            tenantId: input.tenantId,
            channel: input.channel as ChannelCode,
            recipientAddr: input.recipientAddr,
            recipientId: input.recipientId,
            subject: templateResult?.rendered.subject ?? input.subject,
            bodyText: templateResult?.rendered.bodyText,
            bodyHtml: templateResult?.rendered.bodyHtml,
            bodyJson: templateResult?.rendered.bodyJson,
            correlationId: input.correlationId,
            metadata: input.metadata,
        };

        // Get adapter and deliver
        const adapter = this.channelRegistry.getAdapter(
            input.channel as ChannelCode,
            input.providerCode,
        );

        if (!adapter) {
            await this.deliveryRepo.update(input.tenantId, input.deliveryId as DeliveryId, {
                status: "failed",
                lastError: `No adapter for ${input.channel}/${input.providerCode}`,
                errorCategory: "permanent",
            });
            await this.messageRepo.incrementFailedCount(input.tenantId, input.messageId as MessageId);
            await this.checkMessageCompletion(input.tenantId, input.messageId as MessageId);
            return;
        }

        const result = await adapter.deliver(deliveryRequest);

        if (result.success) {
            await this.deliveryRepo.update(input.tenantId, input.deliveryId as DeliveryId, {
                status: "sent",
                externalId: result.externalId ?? undefined,
                sentAt: new Date(),
            });
            await this.messageRepo.incrementDeliveredCount(input.tenantId, input.messageId as MessageId);
        } else {
            const isFinalAttempt = delivery.attemptCount + 1 >= delivery.maxAttempts;
            const isPermanent = result.errorCategory === "permanent" || result.errorCategory === "auth";

            if (isPermanent || isFinalAttempt) {
                await this.deliveryRepo.update(input.tenantId, input.deliveryId as DeliveryId, {
                    status: "failed",
                    lastError: result.error ?? "Unknown error",
                    errorCategory: result.errorCategory ?? "permanent",
                });
                await this.messageRepo.incrementFailedCount(input.tenantId, input.messageId as MessageId);
            } else {
                // Transient failure — the job will be retried by BullMQ
                await this.deliveryRepo.update(input.tenantId, input.deliveryId as DeliveryId, {
                    status: "pending",
                    lastError: result.error ?? "Transient error",
                    errorCategory: result.errorCategory ?? "transient",
                });
                throw new Error(`Transient delivery failure: ${result.error}`);
            }
        }

        await this.checkMessageCompletion(input.tenantId, input.messageId as MessageId);
    }

    // ─── Message Completion Check ───────────────────────────────────

    /**
     * Check if all deliveries for a message are complete and update message status.
     */
    private async checkMessageCompletion(tenantId: string, messageId: MessageId): Promise<void> {
        const counts = await this.deliveryRepo.countByStatus(tenantId, messageId);

        const pending = (counts.pending ?? 0) + (counts.queued ?? 0);
        if (pending > 0) return; // Still in progress

        const sent = (counts.sent ?? 0) + (counts.delivered ?? 0);
        const failed = (counts.failed ?? 0) + (counts.bounced ?? 0);

        let status: string;
        if (failed === 0) {
            status = "completed";
        } else if (sent === 0) {
            status = "failed";
        } else {
            status = "partial";
        }

        await this.messageRepo.update(tenantId, messageId, {
            status: status as any,
            completedAt: new Date(),
        });
    }

    // ─── Callback Processing ────────────────────────────────────────

    /**
     * Process a provider callback (e.g., SendGrid event webhook).
     * Called by processCallback worker.
     */
    async processCallback(input: ProcessCallbackPayload): Promise<void> {
        const delivery = await this.deliveryRepo.getByExternalId(input.externalId);
        if (!delivery) {
            this.logger.debug(
                { externalId: input.externalId, provider: input.provider },
                "[notify:orchestrator] Callback for unknown delivery — ignoring",
            );
            return;
        }

        const now = new Date(input.timestamp);

        switch (input.eventType) {
            case "delivered":
                await this.deliveryRepo.update(delivery.tenantId, delivery.id, {
                    status: "delivered",
                    deliveredAt: now,
                });
                break;

            case "opened":
            case "open":
                await this.deliveryRepo.update(delivery.tenantId, delivery.id, {
                    openedAt: now,
                });
                break;

            case "clicked":
            case "click":
                await this.deliveryRepo.update(delivery.tenantId, delivery.id, {
                    clickedAt: now,
                });
                break;

            case "bounced":
            case "bounce":
                await this.deliveryRepo.update(delivery.tenantId, delivery.id, {
                    status: "bounced",
                    bouncedAt: now,
                    lastError: (input.rawPayload.reason as string) ?? "Bounced",
                });
                await this.messageRepo.incrementFailedCount(
                    delivery.tenantId,
                    delivery.messageId,
                );
                await this.checkMessageCompletion(delivery.tenantId, delivery.messageId);
                break;

            case "dropped":
            case "failed":
                await this.deliveryRepo.update(delivery.tenantId, delivery.id, {
                    status: "failed",
                    lastError: (input.rawPayload.reason as string) ?? "Dropped by provider",
                    errorCategory: "permanent",
                });
                await this.messageRepo.incrementFailedCount(
                    delivery.tenantId,
                    delivery.messageId,
                );
                await this.checkMessageCompletion(delivery.tenantId, delivery.messageId);
                break;

            default:
                this.logger.debug(
                    { eventType: input.eventType, provider: input.provider },
                    "[notify:orchestrator] Unhandled callback event type",
                );
        }
    }

    // ─── Health & Lifecycle ─────────────────────────────────────────

    async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
        const statuses = await this.channelRegistry.getAllHealthStatuses();
        const unhealthy = Object.entries(statuses)
            .filter(([, s]) => !s.healthy)
            .map(([key]) => key);

        if (unhealthy.length > 0) {
            return {
                healthy: false,
                message: `Unhealthy adapters: ${unhealthy.join(", ")}`,
            };
        }

        return { healthy: true };
    }

    async drain(): Promise<void> {
        for (const unsub of this.unsubscribers) {
            unsub();
        }
        this.unsubscribers = [];
        this.logger.info("[notify:orchestrator] Drained — unsubscribed from all events");
    }

    // ─── Helpers ────────────────────────────────────────────────────

    /**
     * Get the appropriate recipient address for a channel.
     * For email, use email. For in-app, use principalId.
     * For teams/whatsapp, fall back to email for now (Phase 2: separate addresses).
     */
    private getRecipientAddr(recipient: ResolvedRecipient, channel: ChannelCode): string {
        switch (channel) {
            case "IN_APP":
                return recipient.principalId;
            case "EMAIL":
            case "TEAMS":
            case "WHATSAPP":
            default:
                return recipient.email ?? recipient.principalId;
        }
    }
}
