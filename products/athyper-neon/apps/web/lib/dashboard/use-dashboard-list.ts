"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchDashboards } from "./dashboard-client";
import type { DashboardListResponse, DashboardListItem } from "./dashboard-client";

export type FilterMode = "all" | "system" | "mine" | "shared";

export interface FlatDashboardItem extends DashboardListItem {
    moduleName: string;
}

export function useDashboardList(workbench: string) {
    const [data, setData] = useState<DashboardListResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchDashboards(workbench);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboards");
        } finally {
            setIsLoading(false);
        }
    }, [workbench]);

    useEffect(() => {
        load();
    }, [load]);

    const allDashboards = useMemo<FlatDashboardItem[]>(() => {
        if (!data) return [];
        return data.groups.flatMap((g) =>
            g.dashboards.map((d) => ({ ...d, moduleName: g.moduleCode })),
        );
    }, [data]);

    return { data, allDashboards, isLoading, error, reload: load };
}
