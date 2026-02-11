/**
 * ScopedNotificationPreferenceRepo — Kysely repo for core.notification_preference
 *
 * Supports the scoped preference hierarchy: user > org_unit > tenant.
 */

import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";
import type { ChannelCode, PreferenceScope, PreferenceFrequency, QuietHours } from "../domain/types.js";

const TABLE = "core.notification_preference" as keyof DB & string;

export interface ScopedPreferenceRow {
    id: string;
    tenantId: string;
    scope: PreferenceScope;
    scopeId: string;
    eventCode: string;
    channel: ChannelCode;
    isEnabled: boolean;
    frequency: PreferenceFrequency;
    quietHours: QuietHours | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date | null;
    updatedBy: string | null;
}

export interface UpsertScopedPreferenceInput {
    tenantId: string;
    scope: PreferenceScope;
    scopeId: string;
    eventCode: string;
    channel: ChannelCode;
    isEnabled: boolean;
    frequency?: PreferenceFrequency;
    quietHours?: QuietHours;
    metadata?: Record<string, unknown>;
    createdBy: string;
}

export class ScopedNotificationPreferenceRepo {
    constructor(private readonly db: Kysely<DB>) {}

    async getByScope(
        tenantId: string,
        scope: PreferenceScope,
        scopeId: string,
        eventCode: string,
        channel: ChannelCode,
    ): Promise<ScopedPreferenceRow | undefined> {
        const row = await this.db
            .selectFrom(TABLE as any)
            .selectAll()
            .where("tenant_id", "=", tenantId)
            .where("scope", "=", scope)
            .where("scope_id", "=", scopeId)
            .where("event_code", "=", eventCode)
            .where("channel", "=", channel)
            .executeTakeFirst();

        return row ? this.mapRow(row) : undefined;
    }

    async getAllForScope(
        tenantId: string,
        scope: PreferenceScope,
        scopeId: string,
    ): Promise<ScopedPreferenceRow[]> {
        const rows = await this.db
            .selectFrom(TABLE as any)
            .selectAll()
            .where("tenant_id", "=", tenantId)
            .where("scope", "=", scope)
            .where("scope_id", "=", scopeId)
            .execute();

        return rows.map((r: any) => this.mapRow(r));
    }

    async upsert(input: UpsertScopedPreferenceInput): Promise<void> {
        const now = new Date();

        await this.db
            .insertInto(TABLE as any)
            .values({
                id: crypto.randomUUID(),
                tenant_id: input.tenantId,
                scope: input.scope,
                scope_id: input.scopeId,
                event_code: input.eventCode,
                channel: input.channel,
                is_enabled: input.isEnabled,
                frequency: input.frequency ?? "immediate",
                quiet_hours: input.quietHours ? JSON.stringify(input.quietHours) : null,
                metadata: input.metadata ? JSON.stringify(input.metadata) : null,
                created_at: now,
                created_by: input.createdBy,
            })
            .onConflict((oc: any) =>
                oc.columns(["tenant_id", "scope", "scope_id", "event_code", "channel"]).doUpdateSet({
                    is_enabled: input.isEnabled,
                    frequency: input.frequency ?? "immediate",
                    quiet_hours: input.quietHours ? JSON.stringify(input.quietHours) : null,
                    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
                    updated_at: now,
                    updated_by: input.createdBy,
                }),
            )
            .execute();
    }

    async deleteByScope(
        tenantId: string,
        scope: PreferenceScope,
        scopeId: string,
        eventCode?: string,
        channel?: ChannelCode,
    ): Promise<void> {
        let query = this.db
            .deleteFrom(TABLE as any)
            .where("tenant_id", "=", tenantId)
            .where("scope", "=", scope)
            .where("scope_id", "=", scopeId);

        if (eventCode) {
            query = query.where("event_code", "=", eventCode);
        }
        if (channel) {
            query = query.where("channel", "=", channel);
        }

        await query.execute();
    }

    private mapRow(row: any): ScopedPreferenceRow {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            scope: row.scope,
            scopeId: row.scope_id,
            eventCode: row.event_code,
            channel: row.channel,
            isEnabled: row.is_enabled,
            frequency: row.frequency,
            quietHours: this.parseJson(row.quiet_hours),
            metadata: this.parseJson(row.metadata),
            createdAt: new Date(row.created_at),
            createdBy: row.created_by,
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
            updatedBy: row.updated_by,
        };
    }

    private parseJson(value: unknown): any {
        if (!value) return null;
        if (typeof value === "string") {
            try { return JSON.parse(value); } catch { return null; }
        }
        return value;
    }
}
