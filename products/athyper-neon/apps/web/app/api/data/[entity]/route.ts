import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../lib/runtime-client";

/**
 * GET /api/data/:entity
 *
 * Proxies to the runtime ListRecordsHandler.
 * Forwards query params: page, pageSize, orderBy, orderDir.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ entity: string }> },
) {
    const { entity } = await params;
    const search = new URL(req.url).search;
    const res = await runtimeFetch(`/api/data/${encodeURIComponent(entity)}${search}`);
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
