/**
 * Widget Data API client — fetches entity data for dashboard widgets.
 *
 * Calls the GenericDataAPI via /api/data/:entity endpoints.
 * Query keys follow the convention: {module}.{entity} or {module}.{entity}.count
 */

const BASE_URL = "/api/data";

// ─── Response Types (match backend data.handler.ts) ─────────────

export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface EntityListResponse {
    success: boolean;
    data: Record<string, unknown>[];
    meta: PaginationMeta;
}

export interface EntityCountResponse {
    success: boolean;
    data: { count: number };
}

// ─── Query Key Parsing ──────────────────────────────────────────

export interface ParsedQueryKey {
    entity: string;
    module: string;
    isCount: boolean;
}

/**
 * Parse a query_key string into entity name and mode.
 *
 * Examples:
 *   "crm.opportunities"       → { module: "crm", entity: "opportunities", isCount: false }
 *   "crm.opportunities.count" → { module: "crm", entity: "opportunities", isCount: true }
 *   "opportunities"           → { module: "", entity: "opportunities", isCount: false }
 */
export function parseQueryKey(queryKey: string): ParsedQueryKey {
    const parts = queryKey.split(".");
    const isCount = parts[parts.length - 1] === "count" && parts.length > 1;

    if (isCount) {
        parts.pop(); // remove "count"
    }

    if (parts.length >= 2) {
        return { module: parts[0], entity: parts.slice(1).join("_"), isCount };
    }

    return { module: "", entity: parts[0], isCount };
}

// ─── API Functions ──────────────────────────────────────────────

export interface ListOptions {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    orderDir?: "asc" | "desc";
}

export async function fetchEntityList(
    entity: string,
    options?: ListOptions,
): Promise<EntityListResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.pageSize) params.set("pageSize", String(options.pageSize));
    if (options?.orderBy) params.set("orderBy", options.orderBy);
    if (options?.orderDir) params.set("orderDir", options.orderDir);

    const qs = params.toString();
    const url = `${BASE_URL}/${encodeURIComponent(entity)}${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to load ${entity}: ${res.status}`);
    return (await res.json()) as EntityListResponse;
}

export async function fetchEntityCount(entity: string): Promise<number> {
    const url = `${BASE_URL}/${encodeURIComponent(entity)}/count`;

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`Failed to count ${entity}: ${res.status}`);
    const json = (await res.json()) as EntityCountResponse;
    return json.data.count;
}
