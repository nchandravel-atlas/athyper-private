/**
 * GET /api/notifications/unread-count
 *
 * Returns the count of unread notifications for the authenticated user.
 */

import type { DB } from "@athyper/adapter-db";
import { Kysely } from "kysely";

import { InAppNotificationRepo } from "@athyper/runtime/services/platform-services/notification/persistence/InAppNotificationRepo";

import { getApiContext, unauthorizedResponse, successResponse, errorResponse } from "@/lib/api-context";

function isStubMode(): boolean {
    return !process.env.DATABASE_URL && process.env.ENABLE_DEV_STUBS === "true";
}

async function getDbClient(): Promise<Kysely<DB>> {
    const { Pool } = await import("pg");
    const { Kysely, PostgresDialect } = await import("kysely");

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    return new Kysely<DB>({
        dialect: new PostgresDialect({ pool }),
    });
}

export async function GET() {
    if (isStubMode()) {
        return successResponse({ count: 0 });
    }

    const { context, redis } = await getApiContext();

    try {
        if (!context) {
            return unauthorizedResponse();
        }

        // Initialize repo
        const db = await getDbClient();
        const repo = new InAppNotificationRepo(db);

        // Get unread count
        const count = await repo.unreadCount(context.tenantId, context.userId);

        // Clean up
        await db.destroy();

        return successResponse({ count });
    } catch (err) {
        console.error("[GET /api/notifications/unread-count] Error:", err);
        return errorResponse("INTERNAL_ERROR", "Failed to fetch unread count");
    } finally {
        await redis.quit();
    }
}
