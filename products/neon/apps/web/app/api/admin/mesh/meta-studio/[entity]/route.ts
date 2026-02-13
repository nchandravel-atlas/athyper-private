import { assertDraftVersion, parseJsonBody, proxyGet, proxyMutate, requireAdminSession, validateBody } from "../helpers";
import { updateEntitySchema } from "../schemas";
import { emitMeshAudit } from "@/lib/schema-manager/audit-writer";
import { hashSidForAudit, MeshAuditEvent } from "@/lib/schema-manager/audit";

import type { NextRequest } from "next/server";

interface RouteContext {
    params: Promise<{ entity: string }>;
}

/**
 * GET /api/admin/mesh/meta-studio/:entity
 * Returns entity metadata including current version summary.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const { entity } = await context.params;
    return proxyGet(auth, `/api/meta/entities/${encodeURIComponent(entity)}`);
}

/**
 * PUT /api/admin/mesh/meta-studio/:entity
 * Updates entity metadata.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const { entity } = await context.params;

    const versionGuard = await assertDraftVersion(auth, entity);
    if (versionGuard) return versionGuard;

    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return parsed.response;

    const validated = validateBody(parsed.body, updateEntitySchema);
    if (!validated.ok) return validated.response;

    const ifMatch = request.headers.get("If-Match");
    const response = await proxyMutate(
        auth,
        `/api/meta/entities/${encodeURIComponent(entity)}`,
        "PUT",
        validated.data,
        { ifMatch },
    );

    if (response.status < 400) {
        await emitMeshAudit(MeshAuditEvent.ENTITY_UPDATED, {
            tenantId: auth.tenantId,
            sidHash: hashSidForAudit(auth.sid),
            entityName: entity,
            correlationId: auth.correlationId,
            after: validated.data,
        });
    }

    return response;
}

/**
 * DELETE /api/admin/mesh/meta-studio/:entity
 * Deletes an entity definition.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const { entity } = await context.params;
    const ifMatch = request.headers.get("If-Match");
    const response = await proxyMutate(
        auth,
        `/api/meta/entities/${encodeURIComponent(entity)}`,
        "DELETE",
        undefined,
        { ifMatch },
    );

    if (response.status < 400) {
        await emitMeshAudit(MeshAuditEvent.ENTITY_DELETED, {
            tenantId: auth.tenantId,
            sidHash: hashSidForAudit(auth.sid),
            entityName: entity,
            correlationId: auth.correlationId,
        });
    }

    return response;
}
