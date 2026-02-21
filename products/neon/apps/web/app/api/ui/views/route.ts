/**
 * GET  /api/ui/views?entity_key=X  — List saved views for an entity
 * POST /api/ui/views               — Create a new saved view
 */

import type { DB } from "@athyper/adapter-db";
import { Kysely } from "kysely";

import { SavedViewRepository } from "@athyper/runtime/services/platform/ui/saved-view.repository";
import { SavedViewService } from "@athyper/runtime/services/platform/ui/saved-view.service";

import { getApiContext, unauthorizedResponse, successResponse, errorResponse } from "@/lib/api-context";

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

const stubLogger = { info() {}, warn: console.warn, debug() {}, error: console.error } as any;

function isStubMode(): boolean {
    return !process.env.DATABASE_URL && process.env.ENABLE_DEV_STUBS === "true";
}

async function getDbClient(): Promise<Kysely<DB>> {
    const { Pool } = await import("pg");
    const { Kysely: K, PostgresDialect } = await import("kysely");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return new K<DB>({ dialect: new PostgresDialect({ pool }) });
}

function createService(db: Kysely<DB>): SavedViewService {
    const repo = new SavedViewRepository(db);
    return new SavedViewService(repo, stubLogger);
}

// ─────────────────────────────────────────────
// GET /api/ui/views?entity_key=X
// ─────────────────────────────────────────────

export async function GET(req: Request) {
    if (isStubMode()) {
        return successResponse([]);
    }

    const { context, redis } = await getApiContext();

    try {
        if (!context) return unauthorizedResponse();

        const url = new URL(req.url);
        const entityKey = url.searchParams.get("entity_key");

        if (!entityKey) {
            return errorResponse("MISSING_ENTITY_KEY", "entity_key query parameter is required", 400);
        }

        const db = await getDbClient();
        try {
            const service = createService(db);
            const views = await service.listViews(
                { tenantId: context.tenantId, userId: context.userId, roles: context.roles },
                entityKey,
            );
            return successResponse(views);
        } finally {
            await db.destroy();
        }
    } catch (err) {
        console.error("[GET /api/ui/views] Error:", err);
        return errorResponse("INTERNAL_ERROR", "Failed to fetch views");
    } finally {
        await redis.quit();
    }
}

// ─────────────────────────────────────────────
// POST /api/ui/views
// ─────────────────────────────────────────────

export async function POST(req: Request) {
    if (isStubMode()) {
        return errorResponse("STUB_MODE", "Write operations not available in stub mode", 501);
    }

    const { context, redis } = await getApiContext();

    try {
        if (!context) return unauthorizedResponse();

        const body = (await req.json()) as Record<string, unknown>;

        if (!body.entityKey || !body.name || body.stateJson === undefined) {
            return errorResponse("MISSING_REQUIRED_FIELDS", "entityKey, name, and stateJson are required", 400);
        }

        const db = await getDbClient();
        try {
            const service = createService(db);
            const result = await service.createView(
                { tenantId: context.tenantId, userId: context.userId, roles: context.roles },
                {
                    entityKey: body.entityKey as string,
                    scope: (body.scope as string) ?? "USER",
                    name: body.name as string,
                    isPinned: body.isPinned as boolean | undefined,
                    isDefault: body.isDefault as boolean | undefined,
                    stateJson: body.stateJson,
                },
            );
            return successResponse(result, 201);
        } finally {
            await db.destroy();
        }
    } catch (err: any) {
        if (err?.status) {
            return errorResponse(err.code ?? "ERROR", err.message, err.status);
        }
        console.error("[POST /api/ui/views] Error:", err);
        return errorResponse("INTERNAL_ERROR", "Failed to create view");
    } finally {
        await redis.quit();
    }
}
