import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../lib/runtime-client";

/**
 * GET /api/ui/dashboards/:id
 *
 * Proxies to the runtime GetDashboardHandler.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}`);
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * PATCH /api/ui/dashboards/:id
 *
 * Proxies to the runtime UpdateDashboardHandler.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const body = await req.text();
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body,
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * DELETE /api/ui/dashboards/:id
 *
 * Proxies to the runtime DeleteDashboardHandler.
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const res = await runtimeFetch(`/api/ui/dashboards/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
