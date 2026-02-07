import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../../lib/runtime-client";

/**
 * GET /api/ui/dashboards/templates?workbench=...
 *
 * Proxies to the runtime — returns available dashboard templates.
 */
export async function GET(req: NextRequest) {
    const workbench = req.nextUrl.searchParams.get("workbench") ?? "";
    const res = await runtimeFetch(
        `/api/ui/dashboards/templates?workbench=${encodeURIComponent(workbench)}`,
        { method: "GET" },
    );
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
