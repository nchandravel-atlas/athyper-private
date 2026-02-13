/**
 * GET /api/notifications
 *
 * Lists notifications for the authenticated user with pagination and filters.
 */

import { getApiContext, unauthorizedResponse, successResponse, errorResponse } from "@/lib/api-context";
import { InAppNotificationRepo } from "@athyper/runtime/services/platform-services/notification/persistence/InAppNotificationRepo";
import { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";

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

export async function GET(req: Request) {
    const { context, redis } = await getApiContext();

    try {
        if (!context) {
            return unauthorizedResponse();
        }

        // Parse query parameters
        const url = new URL(req.url);
        const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
        const offset = Number(url.searchParams.get("offset")) || 0;
        const unreadOnly = url.searchParams.get("unreadOnly") === "true";
        const category = url.searchParams.get("category") || undefined;

        // Initialize repo
        const db = await getDbClient();
        const repo = new InAppNotificationRepo(db);

        // Fetch notifications
        const items = await repo.listForRecipient(context.tenantId, context.userId, {
            unreadOnly,
            category,
            limit,
            offset,
        });

        // Clean up
        await db.destroy();

        return successResponse({
            items,
            pagination: {
                limit,
                offset,
                count: items.length,
            },
        });
    } catch (err) {
        console.error("[GET /api/notifications] Error:", err);
        return errorResponse("INTERNAL_ERROR", "Failed to fetch notifications");
    } finally {
        await redis.quit();
    }
}
