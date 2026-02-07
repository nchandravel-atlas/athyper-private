/**
 * React hook for fetching a single dashboard (rendering).
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchDashboard, type DashboardDetail, type DashboardLayout } from "./dashboard-client";

export interface DashboardView {
    id: string;
    code: string;
    title: string;
    description?: string;
    moduleCode: string;
    workbench: string;
    visibility: string;
    icon?: string;
    versionNo: number;
    publishedAt?: string;
    permission?: "owner" | "edit" | "view";
    ownerId?: string;
    createdBy?: string;
}

export function useDashboard(dashboardId: string | null) {
    const [data, setData] = useState<DashboardDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!dashboardId) {
            setData(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchDashboard(dashboardId);
            setData(result);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard");
        } finally {
            setIsLoading(false);
        }
    }, [dashboardId]);

    useEffect(() => {
        load();
    }, [load]);

    const dashboard: DashboardView | null = useMemo(() => {
        if (!data) return null;
        return {
            id: data.id,
            code: data.code,
            title: data.titleKey,
            description: data.descriptionKey ?? undefined,
            moduleCode: data.moduleCode,
            workbench: data.workbench,
            visibility: data.visibility,
            icon: data.icon,
            versionNo: data.versionNo,
            publishedAt: data.publishedAt,
            permission: data.permission,
            ownerId: data.ownerId,
            createdBy: data.createdBy,
        };
    }, [data]);

    const layout: DashboardLayout | null = data?.layout ?? null;

    return { dashboard, layout, isLoading, error, reload: load };
}
