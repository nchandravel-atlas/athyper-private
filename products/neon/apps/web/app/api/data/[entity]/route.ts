/**
 * GET /api/data/:entity
 *
 * Entity data list endpoint.
 * Returns an array of records for the given entity type.
 * Data is served from the centralized mock data module (lib/mock-data/entities.ts).
 *
 * In production this will query the entity persistence layer with tenant isolation.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ENTITY_DATA_REGISTRY } from "@/lib/mock-data/entities";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ entity: string }> },
) {
    const { entity } = await params;

    try {
        const entityData = ENTITY_DATA_REGISTRY[entity];

        if (!entityData) {
            console.warn(`[GET /api/data/${entity}] Unknown entity requested`);
            return NextResponse.json(
                { error: { message: `No data available for entity: ${entity}` } },
                { status: 404 },
            );
        }

        return NextResponse.json({ data: entityData.list, total: entityData.list.length });
    } catch (error) {
        console.error(`[GET /api/data/${entity}] Error:`, error);
        return NextResponse.json(
            { error: { message: "Failed to load entity records" } },
            { status: 500 },
        );
    }
}
