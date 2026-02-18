import "server-only";

import { requireAdminSession } from "../meta-studio/helpers";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/mesh/policy-studio
 * Lists all policies.
 */
export async function GET() {
    const auth = await requireAdminSession();
    if (!auth.ok) return auth.response;

    try {
        const res = await fetch(`${auth.runtimeApiUrl}/api/policies`, {
            headers: {
                "X-Correlation-Id": auth.correlationId,
                "X-Tenant-Id": auth.tenantId,
            },
            signal: AbortSignal.timeout(10_000),
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, error: { code: "UPSTREAM_ERROR", message: `Failed to fetch policies (${res.status})` } },
                { status: res.status >= 500 ? 502 : res.status },
            );
        }

        const data: unknown = await res.json();
        const etag = res.headers.get("etag");

        return NextResponse.json(
            { success: true, ...(typeof data === "object" && data !== null ? data : { data }) },
            { headers: { "X-Correlation-Id": auth.correlationId, ...(etag ? { ETag: etag } : {}) } },
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { code: "PROXY_ERROR", message: String(error) } },
            { status: 502 },
        );
    }
}
