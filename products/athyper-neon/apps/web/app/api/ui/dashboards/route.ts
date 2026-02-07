import { NextRequest, NextResponse } from "next/server";
import { runtimeFetch } from "../../../../lib/runtime-client";

/**
 * Dev-mode mock dashboard data returned when the runtime is unreachable.
 * Reads real contribution JSON files from the framework and returns them
 * in the same shape the runtime would.
 */
async function getDevMockResponse(workbench: string) {
    // Only serve mock data in development
    if (process.env.NODE_ENV !== "development") return null;

    const fs = await import("fs/promises");
    const path = await import("path");

    const root = path.resolve(process.cwd(), "../../../framework/runtime/src/services/business");

    // Recursively find all dashboard.contribution.json files
    async function findContributions(dir: string): Promise<string[]> {
        const results: string[] = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    results.push(...await findContributions(full));
                } else if (entry.name === "dashboard.contribution.json") {
                    results.push(full);
                }
            }
        } catch { /* skip inaccessible dirs */ }
        return results;
    }

    const files = await findContributions(root);

    interface MockDashboard {
        id: string;
        code: string;
        titleKey: string;
        descriptionKey?: string;
        moduleCode: string;
        workbench: string;
        visibility: string;
        icon?: string;
        sortOrder: number;
        isHidden: boolean;
        permission: string;
    }

    const groupMap = new Map<string, MockDashboard[]>();

    for (const file of files) {
        try {
            const raw = await fs.readFile(file, "utf-8");
            const contrib = JSON.parse(raw) as {
                module_code: string;
                dashboards: Array<{
                    code: string;
                    title_key: string;
                    description_key?: string;
                    icon?: string;
                    workbenches: string[];
                    sort_order: number;
                }>;
            };

            for (const dash of contrib.dashboards) {
                if (!dash.workbenches.includes(workbench)) continue;

                const item: MockDashboard = {
                    id: `mock-${contrib.module_code}-${dash.code}`,
                    code: dash.code,
                    titleKey: dash.title_key,
                    descriptionKey: dash.description_key,
                    moduleCode: contrib.module_code,
                    workbench,
                    visibility: "system",
                    icon: dash.icon,
                    sortOrder: dash.sort_order,
                    isHidden: false,
                    permission: "view",
                };

                const list = groupMap.get(contrib.module_code) ?? [];
                list.push(item);
                groupMap.set(contrib.module_code, list);
            }
        } catch {
            // Skip files that fail to parse
        }
    }

    const groups = Array.from(groupMap.entries()).map(([moduleCode, dashboards]) => ({
        moduleCode,
        dashboards: dashboards.sort((a, b) => a.sortOrder - b.sortOrder),
    }));

    const total = groups.reduce((sum, g) => sum + g.dashboards.length, 0);
    return { total, groups };
}

/**
 * GET /api/ui/dashboards?workbench=admin
 *
 * Proxies to the runtime ListDashboardsHandler.
 * In development, falls back to mock data from contribution JSON files
 * when the runtime is unreachable.
 */
export async function GET(req: NextRequest) {
    const search = new URL(req.url).search;
    const res = await runtimeFetch(`/api/ui/dashboards${search}`);

    // If runtime is unavailable in dev mode, serve mock data from contributions
    if (res.status === 401 || res.status === 502) {
        const url = new URL(req.url);
        const workbench = url.searchParams.get("workbench") ?? "admin";
        const mock = await getDevMockResponse(workbench);
        if (mock) {
            return NextResponse.json(mock);
        }
    }

    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * POST /api/ui/dashboards
 *
 * Proxies to the runtime CreateDashboardHandler.
 */
export async function POST(req: NextRequest) {
    const body = await req.text();
    const res = await runtimeFetch("/api/ui/dashboards", {
        method: "POST",
        body,
    });
    return new NextResponse(res.body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}
