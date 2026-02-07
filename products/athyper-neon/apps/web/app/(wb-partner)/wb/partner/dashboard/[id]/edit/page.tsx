"use client";

import { use, useEffect, useState } from "react";
import type { DashboardLayout } from "@athyper/dashboard";
import { fetchDashboard, fetchDraft } from "../../../../../../../lib/dashboard/dashboard-client";
import { DashboardEditor } from "../../../../../../../components/dashboard/editor/DashboardEditor";

const EMPTY_LAYOUT: DashboardLayout = {
    schema_version: 1,
    columns: 12,
    row_height: 80,
    items: [],
};

export default function PartnerDashboardEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [layout, setLayout] = useState<DashboardLayout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const dashboard = await fetchDashboard(id);
                if (dashboard.permission !== "owner" && dashboard.permission !== "edit") {
                    window.location.href = `/wb/partner/dashboard/${id}`;
                    return;
                }

                const draft = await fetchDraft(id);
                setLayout((draft?.layout as DashboardLayout) ?? EMPTY_LAYOUT);
            } catch (err) {
                setError(String(err));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-sm text-gray-400">Loading editor...</p>
            </div>
        );
    }

    if (error || !layout) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-sm text-red-600">{error ?? "Failed to load dashboard"}</p>
            </div>
        );
    }

    return <DashboardEditor dashboardId={id} initialLayout={layout} workbench="partner" />;
}
