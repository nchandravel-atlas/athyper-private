import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../lib/runtime-client";

/**
 * GET /api/data/:entity/count
 *
 * Proxies to the runtime CountRecordsHandler.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ entity: string }> },
) {
    const { entity } = await params;
    const res = await runtimeFetch(`/api/data/${encodeURIComponent(entity)}/count`);
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
