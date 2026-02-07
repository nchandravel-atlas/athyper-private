import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../../../../lib/runtime-client";

/**
 * POST /api/ui/dashboards/:id/versions/:versionId/rollback
 *
 * Proxies to the runtime — creates a new draft from this version's layout.
 */
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> },
) {
    const { id, versionId } = await params;
    const res = await runtimeFetch(
        `/api/ui/dashboards/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}/rollback`,
        { method: "POST" },
    );
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
