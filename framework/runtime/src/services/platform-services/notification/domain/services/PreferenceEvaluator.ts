/**
 * PreferenceEvaluator — Filter delivery plan by user preferences and suppression lists.
 *
 * For each recipient × channel, checks:
 * 1. Is the channel enabled for this user + event code?
 * 2. Is the recipient's address on the suppression list?
 * 3. (Phase 2) Is it quiet hours for this user?
 *
 * If no preference record exists, the channel is enabled by default.
 */

import type { NotificationPreferenceRepo } from "../../persistence/NotificationPreferenceRepo.js";
import type { NotificationSuppressionRepo } from "../../persistence/NotificationSuppressionRepo.js";
import type { ChannelCode } from "../types.js";
import type { Logger } from "../../../../../kernel/logger.js";

export interface PreferenceCheckInput {
    tenantId: string;
    principalId: string;
    eventCode: string;
    channel: ChannelCode;
    recipientAddr: string;
}

export interface PreferenceCheckResult {
    allowed: boolean;
    reason?: "preference_disabled" | "suppressed" | "quiet_hours";
    suppressionReason?: string;
}

export class PreferenceEvaluator {
    constructor(
        private readonly preferenceRepo: NotificationPreferenceRepo,
        private readonly suppressionRepo: NotificationSuppressionRepo,
        private readonly logger: Logger,
    ) {}

    /**
     * Check if a notification should be delivered to a recipient on a channel.
     */
    async check(input: PreferenceCheckInput): Promise<PreferenceCheckResult> {
        // 1. Check user preference
        const isEnabled = await this.preferenceRepo.isEnabled(
            input.tenantId,
            input.principalId,
            input.eventCode,
            input.channel,
        );

        if (!isEnabled) {
            this.logger.debug(
                {
                    principalId: input.principalId,
                    eventCode: input.eventCode,
                    channel: input.channel,
                },
                "[notify:preference] Channel disabled by user preference",
            );
            return { allowed: false, reason: "preference_disabled" };
        }

        // 2. Check suppression list
        const suppression = await this.suppressionRepo.isSuppressed(
            input.tenantId,
            input.channel,
            input.recipientAddr,
        );

        if (suppression) {
            this.logger.debug(
                {
                    channel: input.channel,
                    reason: suppression.reason,
                },
                "[notify:preference] Address is suppressed",
            );
            return {
                allowed: false,
                reason: "suppressed",
                suppressionReason: suppression.reason,
            };
        }

        // 3. (Phase 2) Check quiet hours
        // TODO: Implement quiet hours check — defer delivery job to after quiet hours end

        return { allowed: true };
    }

    /**
     * Batch check: filter a list of recipients × channels, returning only allowed deliveries.
     */
    async filterAllowed(
        inputs: PreferenceCheckInput[],
    ): Promise<{ input: PreferenceCheckInput; result: PreferenceCheckResult }[]> {
        const results: { input: PreferenceCheckInput; result: PreferenceCheckResult }[] = [];

        // Process in parallel for performance
        const checks = await Promise.all(
            inputs.map(async (input) => ({
                input,
                result: await this.check(input),
            })),
        );

        for (const check of checks) {
            results.push(check);
        }

        return results;
    }
}
