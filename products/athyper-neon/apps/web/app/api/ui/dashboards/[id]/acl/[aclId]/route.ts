import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../../../lib/runtime-client";

/**
 * DELETE /api/ui/dashboards/:id/acl/:aclId
 *
 * Proxies to the runtime RemoveAclHandler.
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; aclId: string }> },
) {
    const { id, aclId } = await params;
    const res = await runtimeFetch(
        `/api/ui/dashboards/${encodeURIComponent(id)}/acl/${encodeURIComponent(aclId)}`,
        { method: "DELETE" },
    );
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
