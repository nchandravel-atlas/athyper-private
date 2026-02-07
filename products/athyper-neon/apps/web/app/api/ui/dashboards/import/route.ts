import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../lib/runtime-client";

/**
 * POST /api/ui/dashboards/import
 *
 * Proxies to the runtime — accepts a DashboardExport body and creates a new dashboard from it.
 */
export async function POST(req: NextRequest) {
    const body = await req.text();
    const res = await runtimeFetch("/api/ui/dashboards/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
