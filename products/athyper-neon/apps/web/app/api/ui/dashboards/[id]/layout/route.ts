import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../../lib/runtime-client";

/**
 * PUT /api/ui/dashboards/:id/layout
 *
 * Proxies to the runtime SaveLayoutHandler.
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const body = await req.text();
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}/layout`, {
        method: "PUT",
        body,
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
