import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../../lib/runtime-client";

/**
 * GET /api/ui/dashboards/:id/versions
 *
 * Proxies to the runtime — returns version history list.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}/versions`, {
        method: "GET",
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
