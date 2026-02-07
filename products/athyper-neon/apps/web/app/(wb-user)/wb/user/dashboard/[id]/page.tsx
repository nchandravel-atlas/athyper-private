"use client";

import { use, useState } from "react";
import { Card, Button } from "@neon/ui";
import { useDashboard } from "../../../../../../lib/dashboard/use-dashboard";
import { DashboardRenderer } from "../../../../../../components/dashboard/DashboardRenderer";
import { duplicateDashboard, exportDashboard } from "../../../../../../lib/dashboard/dashboard-client";
import { ShareDialog } from "../../../../../../components/dashboard/ShareDialog";
import { VersionHistoryDialog } from "../../../../../../components/dashboard/VersionHistoryDialog";
import { useMessages } from "../../../../../../lib/i18n/messages-context";
import {
    DashboardRefreshProvider,
    useDashboardRefresh,
} from "../../../../../../lib/dashboard/dashboard-refresh-context";
import { toast } from "sonner";

export default function UserDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { dashboard, layout, isLoading, error } = useDashboard(id);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-gray-100 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !dashboard) {
        return (
            <div className="p-6">
                <Card>
                    <div className="p-4 text-center">
                        <p className="text-sm text-red-600">
                            {error ?? "Dashboard not found"}
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <DashboardRefreshProvider>
            <DashboardContent dashboard={dashboard} layout={layout} id={id} />
        </DashboardRefreshProvider>
    );
}

function DashboardContent({
    dashboard,
    layout,
    id,
}: {
    dashboard: NonNullable<ReturnType<typeof useDashboard>["dashboard"]>;
    layout: ReturnType<typeof useDashboard>["layout"];
    id: string;
}) {
    const { messages, t } = useMessages();
    const { refreshAll } = useDashboardRefresh();
    const [showShare, setShowShare] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const canEdit = dashboard.permission === "owner" || dashboard.permission === "edit";
    const isSystem = dashboard.visibility === "system";

    async function handleDuplicateAndEdit() {
        try {
            const result = await duplicateDashboard(id);
            window.location.href = `/wb/user/dashboard/${result.id}/edit`;
        } catch {
            toast.error("Failed to duplicate dashboard");
        }
    }

    async function handleExport() {
        try {
            const data = await exportDashboard(id);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `dashboard-${dashboard.code ?? id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Dashboard exported");
        } catch {
            toast.error("Failed to export dashboard");
        }
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {t(dashboard.title)}
                    </h1>
                    {dashboard.description && (
                        <p className="mt-1 text-sm text-gray-500">{t(dashboard.description)}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={refreshAll}>
                        Refresh
                    </Button>
                    <Button variant="ghost" onClick={handleExport}>
                        Export
                    </Button>
                    <Button variant="ghost" onClick={() => setShowHistory(true)}>
                        History
                    </Button>
                    {canEdit && !isSystem && (
                        <a href={`/wb/user/dashboard/${id}/edit`}>
                            <Button variant="ghost">Edit Dashboard</Button>
                        </a>
                    )}
                    {(isSystem || !canEdit) && (
                        <Button variant="ghost" onClick={handleDuplicateAndEdit}>
                            Duplicate to Edit
                        </Button>
                    )}
                    {canEdit && !isSystem && (
                        <Button variant="ghost" onClick={() => setShowShare(true)}>
                            Share
                        </Button>
                    )}
                </div>
            </div>

            {layout ? (
                <DashboardRenderer layout={layout} messages={messages} />
            ) : (
                <Card>
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No published layout available for this dashboard.
                    </div>
                </Card>
            )}

            <ShareDialog dashboardId={id} open={showShare} onClose={() => setShowShare(false)} />
            <VersionHistoryDialog
                dashboardId={id}
                open={showHistory}
                onClose={() => setShowHistory(false)}
                onRollback={() => window.location.reload()}
            />
        </div>
    );
}
