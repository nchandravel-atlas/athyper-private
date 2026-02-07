import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../../lib/runtime-client";

/**
 * GET /api/ui/dashboards/:id/draft
 *
 * Proxies to the runtime GetDraftHandler.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}/draft`);
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * DELETE /api/ui/dashboards/:id/draft
 *
 * Proxies to the runtime DiscardDraftHandler.
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}/draft`, {
        method: "DELETE",
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
