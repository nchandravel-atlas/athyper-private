/**
 * GET    /api/ui/views/:id  — Get full view with state_json
 * PATCH  /api/ui/views/:id  — Update view (optimistic concurrency)
 * DELETE /api/ui/views/:id  — Soft-delete view
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

type RouteContext = { params: Promise<{ id: string }> };

// ─────────────────────────────────────────────
// GET /api/ui/views/:id
// ─────────────────────────────────────────────

export async function GET(_req: Request, ctx: RouteContext) {
    const { id } = await ctx.params;

    if (isStubMode()) {
        return errorResponse("NOT_FOUND", "View not found", 404);
    }

    const { context, redis } = await getApiContext();

    try {
        if (!context) return unauthorizedResponse();

        const db = await getDbClient();
        try {
            const service = createService(db);
            const view = await service.getView(
                { tenantId: context.tenantId, userId: context.userId, roles: context.roles },
                id,
            );
            return successResponse(view);
        } finally {
            await db.destroy();
        }
    } catch (err: any) {
        if (err?.status === 404) {
            return errorResponse(err.code, err.message, 404);
        }
        if (err?.status === 403) {
            return errorResponse(err.code, err.message, 403);
        }
        console.error("[GET /api/ui/views/:id] Error:", err);
        return errorResponse("INTERNAL_ERROR", "Failed to fetch view");
    } finally {
        await redis.quit();
    }
}

// ─────────────────────────────────────────────
// PATCH /api/ui/views/:id
// ─────────────────────────────────────────────

export async function PATCH(req: Request, ctx: RouteContext) {
    const { id } = await ctx.params;

    if (isStubMode()) {
        return errorResponse("STUB_MODE", "Write operations not available in stub mode", 501);
    }

    const { context, redis } = await getApiContext();

    try {
        if (!context) return unauthorizedResponse();

        const body = (await req.json()) as Record<string, unknown>;

        if (body.version === undefined) {
            return errorResponse("MISSING_VERSION", "version is required for optimistic concurrency", 400);
        }

        const db = await getDbClient();
        try {
            const service = createService(db);
            const result = await service.updateView(
                { tenantId: context.tenantId, userId: context.userId, roles: context.roles },
                id,
                {
                    name: body.name as string | undefined,
                    isPinned: body.isPinned as boolean | undefined,
                    isDefault: body.isDefault as boolean | undefined,
                    stateJson: body.stateJson,
                    version: body.version as number,
                },
            );
            return successResponse(result);
        } finally {
            await db.destroy();
        }
    } catch (err: any) {
        if (err?.status) {
            return errorResponse(err.code ?? "ERROR", err.message, err.status);
        }
        console.error("[PATCH /api/ui/views/:id] Error:", err);
        return errorResponse("INTERNAL_ERROR", "Failed to update view");
    } finally {
        await redis.quit();
    }
}

// ─────────────────────────────────────────────
// DELETE /api/ui/views/:id
// ─────────────────────────────────────────────

export async function DELETE(_req: Request, ctx: RouteContext) {
    const { id } = await ctx.params;

    if (isStubMode()) {
        return errorResponse("STUB_MODE", "Write operations not available in stub mode", 501);
    }

    const { context, redis } = await getApiContext();

    try {
        if (!context) return unauthorizedResponse();

        const db = await getDbClient();
        try {
            const service = createService(db);
            await service.deleteView(
                { tenantId: context.tenantId, userId: context.userId, roles: context.roles },
                id,
            );
            return successResponse({ deleted: true });
        } finally {
            await db.destroy();
        }
    } catch (err: any) {
        if (err?.status) {
            return errorResponse(err.code ?? "ERROR", err.message, err.status);
        }
        console.error("[DELETE /api/ui/views/:id] Error:", err);
        return errorResponse("INTERNAL_ERROR", "Failed to delete view");
    } finally {
        await redis.quit();
    }
}
