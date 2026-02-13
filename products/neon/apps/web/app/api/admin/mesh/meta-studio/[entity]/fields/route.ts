import { assertDraftVersion, parseJsonBody, proxyGet, proxyMutate, requireAdminSession, validateBody } from "../../helpers";
import { createFieldSchema, reorderFieldsSchema } from "../../schemas";
import { emitMeshAudit } from "@/lib/schema-manager/audit-writer";
import { hashSidForAudit, MeshAuditEvent } from "@/lib/schema-manager/audit";

import type { NextRequest } from "next/server";

interface RouteContext {
    params: Promise<{ entity: string }>;
}

/**
 * GET /api/admin/mesh/meta-studio/:entity/fields
 * Lists fields for the entity's current version.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const { entity } = await context.params;
    return proxyGet(auth, `/api/meta/entities/${encodeURIComponent(entity)}/fields`);
}

/**
 * POST /api/admin/mesh/meta-studio/:entity/fields
 * Adds a new field or reorders fields (based on body shape).
 */
export async function POST(request: NextRequest, context: RouteContext) {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const { entity } = await context.params;

    // Enforce draft version guard
    const versionGuard = await assertDraftVersion(auth, entity);
    if (versionGuard) return versionGuard;

    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return parsed.response;

    // Determine if this is a reorder (has fieldIds) or a create operation
    const body = parsed.body as Record<string, unknown>;
    const isReorder = body && Array.isArray(body.fieldIds);

    const validated = isReorder
        ? validateBody(parsed.body, reorderFieldsSchema)
        : validateBody(parsed.body, createFieldSchema);
    if (!validated.ok) return validated.response;

    const ifMatch = request.headers.get("If-Match");
    const response = await proxyMutate(
        auth,
        `/api/meta/entities/${encodeURIComponent(entity)}/fields`,
        "POST",
        validated.data,
        { ifMatch },
    );

    // Emit audit on success
    if (response.status < 400) {
        await emitMeshAudit(
            isReorder ? MeshAuditEvent.FIELD_REORDERED : MeshAuditEvent.FIELD_ADDED,
            {
                tenantId: auth.tenantId,
                sidHash: hashSidForAudit(auth.sid),
                entityName: entity,
                correlationId: auth.correlationId,
                after: validated.data,
            },
        );
    }

    return response;
}
