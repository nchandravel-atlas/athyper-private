/**
 * React hook for fetching dashboard list (sidebar).
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchDashboards, type DashboardListResponse } from "./dashboard-client";

export function useDashboards(workbench: string) {
    const [data, setData] = useState<DashboardListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchDashboards(workbench);
            setData(result);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load dashboards");
        } finally {
            setLoading(false);
        }
    }, [workbench]);

    useEffect(() => {
        load();
    }, [load]);

    return { data, loading, error, reload: load };
}
