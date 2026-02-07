import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../../lib/runtime-client";

/**
 * GET /api/ui/dashboards/:id/acl
 *
 * Proxies to the runtime ListAclHandler.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}/acl`);
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * POST /api/ui/dashboards/:id/acl
 *
 * Proxies to the runtime AddAclHandler.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const body = await req.text();
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}/acl`, {
        method: "POST",
        body,
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
