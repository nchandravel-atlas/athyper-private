/**
 * React hooks for fetching widget data from the GenericDataAPI.
 *
 * Supports auto-polling via refreshInterval, global refresh via DashboardRefreshContext,
 * widget-level telemetry (11A), polling guardrails (11B), and request caching (11C).
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    parseQueryKey,
    fetchEntityList,
    fetchEntityCount,
    type PaginationMeta,
    type ListOptions,
} from "./widget-data-client";
import { useDashboardRefresh } from "./dashboard-refresh-context";
import { usePageVisibility } from "./use-visibility";
import { measureWidgetFetch, type RefreshType } from "./widget-telemetry";
import { cachedFetch, buildCacheKey, invalidateCache } from "./widget-data-cache";

// ─── useWidgetData — paginated list data ────────────────────────

export interface WidgetDataOptions extends ListOptions {
    refreshInterval?: number; // ms, minimum 10000
    dashboardId?: string;
    widgetId?: string;
}

export interface WidgetDataResult {
    data: Record<string, unknown>[] | null;
    meta: PaginationMeta | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    reload: () => void;
}

export function useWidgetData(
    queryKey: string | null,
    options?: WidgetDataOptions,
): WidgetDataResult {
    const [data, setData] = useState<Record<string, unknown>[] | null>(null);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasData = useRef(false);
    const refreshTypeRef = useRef<RefreshType>("initial");
    const { refreshKey, registerPoll, unregisterPoll } = useDashboardRefresh();
    const isVisible = usePageVisibility();
    const isPollingRef = useRef(false);

    const page = options?.page;
    const pageSize = options?.pageSize;
    const orderBy = options?.orderBy;
    const orderDir = options?.orderDir;
    const refreshInterval = options?.refreshInterval;
    const dashboardId = options?.dashboardId;
    const widgetId = options?.widgetId;

    const load = useCallback(async () => {
        if (!queryKey) {
            setData(null);
            setMeta(null);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (hasData.current) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        const refreshType = refreshTypeRef.current;

        try {
            const parsed = parseQueryKey(queryKey);
            const cacheKey = buildCacheKey(
                parsed.entity,
                `list:p${page ?? 1}:s${pageSize ?? 20}:${orderBy ?? ""}:${orderDir ?? ""}`,
            );

            const result = await measureWidgetFetch(
                () => cachedFetch(cacheKey, () =>
                    fetchEntityList(parsed.entity, {
                        page,
                        pageSize,
                        orderBy,
                        orderDir,
                    }),
                ),
                {
                    queryKey,
                    entity: parsed.entity,
                    dataType: "list",
                    refreshType,
                    dashboardId,
                    widgetId,
                },
            );

            setData(result.data);
            setMeta(result.meta);
            hasData.current = true;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [queryKey, page, pageSize, orderBy, orderDir, dashboardId, widgetId]);

    // Initial load + global refresh trigger
    useEffect(() => {
        refreshTypeRef.current = hasData.current ? "global" : "initial";
        if (hasData.current && queryKey) {
            const parsed = parseQueryKey(queryKey);
            invalidateCache(parsed.entity);
        }
        load();
    }, [load, refreshKey]);

    // Auto-polling with visibility pause and concurrency limit
    useEffect(() => {
        if (!refreshInterval || refreshInterval < 10000) return;
        if (!isVisible) return;

        if (!registerPoll()) return; // at concurrency limit
        isPollingRef.current = true;

        const timer = setInterval(() => {
            refreshTypeRef.current = "polling";
            load();
        }, refreshInterval);

        return () => {
            clearInterval(timer);
            if (isPollingRef.current) {
                unregisterPoll();
                isPollingRef.current = false;
            }
        };
    }, [load, refreshInterval, isVisible, registerPoll, unregisterPoll]);

    const reload = useCallback(() => {
        refreshTypeRef.current = "manual";
        if (queryKey) {
            const parsed = parseQueryKey(queryKey);
            invalidateCache(parsed.entity);
        }
        load();
    }, [load, queryKey]);

    return { data, meta, loading, refreshing, error, reload };
}

// ─── useWidgetCount — single count value ────────────────────────

export interface WidgetCountOptions {
    refreshInterval?: number; // ms, minimum 10000
    dashboardId?: string;
    widgetId?: string;
}

export interface WidgetCountResult {
    count: number | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    reload: () => void;
}

export function useWidgetCount(
    queryKey: string | null,
    options?: WidgetCountOptions,
): WidgetCountResult {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasData = useRef(false);
    const refreshTypeRef = useRef<RefreshType>("initial");
    const { refreshKey, registerPoll, unregisterPoll } = useDashboardRefresh();
    const isVisible = usePageVisibility();
    const isPollingRef = useRef(false);

    const refreshInterval = options?.refreshInterval;
    const dashboardId = options?.dashboardId;
    const widgetId = options?.widgetId;

    const load = useCallback(async () => {
        if (!queryKey) {
            setCount(null);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        if (hasData.current) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        const refreshType = refreshTypeRef.current;

        try {
            const parsed = parseQueryKey(queryKey);
            const cacheKey = buildCacheKey(parsed.entity, "count");

            const result = await measureWidgetFetch(
                () => cachedFetch(cacheKey, () => fetchEntityCount(parsed.entity)),
                {
                    queryKey,
                    entity: parsed.entity,
                    dataType: "count",
                    refreshType,
                    dashboardId,
                    widgetId,
                },
            );

            setCount(result);
            hasData.current = true;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load count");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [queryKey, dashboardId, widgetId]);

    // Initial load + global refresh trigger
    useEffect(() => {
        refreshTypeRef.current = hasData.current ? "global" : "initial";
        if (hasData.current && queryKey) {
            const parsed = parseQueryKey(queryKey);
            invalidateCache(parsed.entity);
        }
        load();
    }, [load, refreshKey]);

    // Auto-polling with visibility pause and concurrency limit
    useEffect(() => {
        if (!refreshInterval || refreshInterval < 10000) return;
        if (!isVisible) return;

        if (!registerPoll()) return;
        isPollingRef.current = true;

        const timer = setInterval(() => {
            refreshTypeRef.current = "polling";
            load();
        }, refreshInterval);

        return () => {
            clearInterval(timer);
            if (isPollingRef.current) {
                unregisterPoll();
                isPollingRef.current = false;
            }
        };
    }, [load, refreshInterval, isVisible, registerPoll, unregisterPoll]);

    const reload = useCallback(() => {
        refreshTypeRef.current = "manual";
        if (queryKey) {
            const parsed = parseQueryKey(queryKey);
            invalidateCache(parsed.entity);
        }
        load();
    }, [load, queryKey]);

    return { count, loading, refreshing, error, reload };
}
