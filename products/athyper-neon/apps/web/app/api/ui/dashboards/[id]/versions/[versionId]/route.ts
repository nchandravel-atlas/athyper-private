import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../../../lib/runtime-client";

/**
 * GET /api/ui/dashboards/:id/versions/:versionId
 *
 * Proxies to the runtime — returns full version with layout.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> },
) {
    const { id, versionId } = await params;
    const res = await runtimeFetch(
        `/api/ui/dashboards/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}`,
        { method: "GET" },
    );
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
