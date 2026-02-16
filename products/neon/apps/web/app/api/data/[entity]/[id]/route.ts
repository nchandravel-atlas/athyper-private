/**
 * GET /api/data/:entity/:id
 *
 * Single entity record endpoint.
 * Returns one record by entity type and ID.
 * Data is served from the centralized mock data module (lib/mock-data/entities.ts).
 *
 * In production this will query the entity persistence layer with tenant isolation.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ENTITY_DATA_REGISTRY } from "@/lib/mock-data/entities";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ entity: string; id: string }> },
) {
    const { entity, id } = await params;

    try {
        const entityData = ENTITY_DATA_REGISTRY[entity];

        if (!entityData) {
            console.warn(`[GET /api/data/${entity}/${id}] Unknown entity requested`);
            return NextResponse.json(
                { error: { message: `Unknown entity: ${entity}` } },
                { status: 404 },
            );
        }

        const record = entityData.byId[id];

        if (!record) {
            console.warn(`[GET /api/data/${entity}/${id}] Record not found`);
            return NextResponse.json(
                { error: { message: `Record not found: ${entity}/${id}` } },
                { status: 404 },
            );
        }

        return NextResponse.json({ data: record });
    } catch (error) {
        console.error(`[GET /api/data/${entity}/${id}] Error:`, error);
        return NextResponse.json(
            { error: { message: "Failed to load entity record" } },
            { status: 500 },
        );
    }
}
