import { parseJsonBody, proxyGet, proxyMutate, requireAdminSession, validateBody } from "./helpers";
import { createEntitySchema } from "./schemas";
import { emitMeshAudit } from "@/lib/schema-manager/audit-writer";
import { hashSidForAudit, MeshAuditEvent } from "@/lib/schema-manager/audit";

import type { NextRequest } from "next/server";

/**
 * GET /api/admin/mesh/meta-studio
 * Lists all entity definitions.
 */
export async function GET() {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    return proxyGet(auth, "/api/meta/entities");
}

/**
 * POST /api/admin/mesh/meta-studio
 * Creates a new entity definition.
 */
export async function POST(request: NextRequest) {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    const parsed = await parseJsonBody(request);
    if (!parsed.ok) return parsed.response;

    const validated = validateBody(parsed.body, createEntitySchema);
    if (!validated.ok) return validated.response;

    const response = await proxyMutate(auth, "/api/meta/entities", "POST", validated.data);

    if (response.status < 400) {
        const entityName = (validated.data as { name?: string }).name ?? "unknown";
        await emitMeshAudit(MeshAuditEvent.ENTITY_CREATED, {
            tenantId: auth.tenantId,
            sidHash: hashSidForAudit(auth.sid),
            entityName,
            correlationId: auth.correlationId,
            after: validated.data,
        });
    }

    return response;
}
