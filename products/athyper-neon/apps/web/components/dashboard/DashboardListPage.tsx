"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Button,
    Input,
    Select,
    Card,
    Badge,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    Separator,
} from "@neon/ui";
import { useDashboardList } from "../../lib/dashboard/use-dashboard-list";
import type { FilterMode, FlatDashboardItem } from "../../lib/dashboard/use-dashboard-list";
import { deleteDashboard, duplicateDashboard, updateDashboard, exportDashboard } from "../../lib/dashboard/dashboard-client";
import { useMessages } from "../../lib/i18n/messages-context";
import { useBreakpoint } from "../../lib/hooks/use-breakpoint";
import { CreateDashboardDialog } from "./CreateDashboardDialog";
import { DashboardSettingsDialog } from "./DashboardSettingsDialog";
import { ImportDashboardDialog } from "./ImportDashboardDialog";
import type { DashboardListItem } from "../../lib/dashboard/dashboard-client";

interface DashboardListPageProps {
    workbench: string;
}

function VisibilityBadge({ visibility }: { visibility: string }) {
    if (visibility === "system") {
        return <Badge variant="secondary">system</Badge>;
    }
    return <Badge variant="outline">tenant</Badge>;
}

function PermissionBadge({ permission }: { permission: string }) {
    switch (permission) {
        case "owner":
            return <Badge className="bg-green-100 text-green-700 border-green-200">owner</Badge>;
        case "edit":
            return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">edit</Badge>;
        default:
            return <Badge variant="secondary">view</Badge>;
    }
}

export function DashboardListPage({ workbench }: DashboardListPageProps) {
    const router = useRouter();
    const { data, allDashboards, isLoading, error, reload } = useDashboardList(workbench);
    const { t } = useMessages();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterMode>("all");
    const [showCreate, setShowCreate] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [settingsDashboard, setSettingsDashboard] = useState<DashboardListItem | null>(null);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    const moduleOptions = useMemo(() => {
        if (!data) return [];
        return data.groups.map((g) => g.moduleCode);
    }, [data]);

    const filtered = useMemo(() => {
        let list = allDashboards;

        // Text search on resolved translations
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (d) =>
                    t(d.titleKey).toLowerCase().includes(q) ||
                    d.code.toLowerCase().includes(q) ||
                    (d.descriptionKey ? t(d.descriptionKey).toLowerCase().includes(q) : false),
            );
        }

        // Filter mode
        switch (filter) {
            case "system":
                list = list.filter((d) => d.visibility === "system");
                break;
            case "mine":
                list = list.filter((d) => d.permission === "owner");
                break;
            case "shared":
                list = list.filter((d) => d.visibility !== "system" && d.permission !== "owner");
                break;
        }

        return list;
    }, [allDashboards, search, filter]);

    // Group filtered items by module
    const grouped = useMemo(() => {
        const map = new Map<string, FlatDashboardItem[]>();
        for (const d of filtered) {
            const list = map.get(d.moduleName) ?? [];
            list.push(d);
            map.set(d.moduleName, list);
        }
        return Array.from(map.entries());
    }, [filtered]);

    async function handleDelete(dashboard: DashboardListItem) {
        if (!confirm(`Delete dashboard "${t(dashboard.titleKey)}"? This cannot be undone.`)) return;
        try {
            await deleteDashboard(dashboard.id);
            toast.success("Dashboard deleted");
            reload();
        } catch {
            toast.error("Failed to delete dashboard");
        }
    }

    async function handleDuplicate(dashboard: DashboardListItem) {
        try {
            const result = await duplicateDashboard(dashboard.id);
            toast.success("Dashboard duplicated");
            router.push(`/wb/${workbench}/dashboard/${result.id}/edit`);
        } catch {
            toast.error("Failed to duplicate dashboard");
        }
    }

    async function handleToggleHidden(dashboard: DashboardListItem) {
        try {
            await updateDashboard(dashboard.id, { isHidden: !dashboard.isHidden });
            toast.success(dashboard.isHidden ? "Dashboard unhidden" : "Dashboard hidden");
            reload();
        } catch {
            toast.error("Failed to update dashboard");
        }
    }

    async function handleExport(dashboard: DashboardListItem) {
        try {
            const data = await exportDashboard(dashboard.id);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `dashboard-${dashboard.code}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Dashboard exported");
        } catch {
            toast.error("Failed to export dashboard");
        }
    }

    if (isLoading) {
        return (
            <div className={isMobile ? "p-4" : "p-6"}>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                    <div className="h-10 bg-gray-100 rounded w-full" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-14 bg-gray-50 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={isMobile ? "p-4" : "p-6"}>
                <Card>
                    <div className="p-4 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                        <Button variant="ghost" onClick={reload} className="mt-2">
                            Retry
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={`${isMobile ? "p-4" : "p-6"} max-w-5xl`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-semibold text-gray-900`}>Dashboards</h1>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setShowImport(true)}>Import</Button>
                    <Button onClick={() => setShowCreate(true)}>+ New Dashboard</Button>
                </div>
            </div>

            {/* Search + Filter — stack vertically on mobile */}
            <div className={`flex ${isMobile ? "flex-col" : "items-center"} gap-3 mb-6`}>
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search dashboards..."
                    className={isMobile ? "w-full" : "max-w-sm"}
                    aria-label="Search dashboards"
                />
                <div className={`flex items-center gap-3 ${isMobile ? "w-full" : ""}`}>
                    <Select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterMode)}
                        className={isMobile ? "flex-1" : "w-44"}
                        aria-label="Filter dashboards"
                    >
                        <option value="all">All Dashboards</option>
                        <option value="system">System</option>
                        <option value="mine">My Dashboards</option>
                        <option value="shared">Shared with me</option>
                    </Select>
                    <span className={`text-xs text-gray-400 ${isMobile ? "" : "ml-auto"}`}>
                        {filtered.length} dashboard{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* Dashboard List */}
            {grouped.length === 0 ? (
                <Card>
                    <div className="p-8 text-center text-gray-400 text-sm">
                        {search || filter !== "all"
                            ? "No dashboards match your search"
                            : "No dashboards yet. Create one to get started."}
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {grouped.map(([moduleCode, dashboards]) => (
                        <div key={moduleCode}>
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {moduleCode}
                                </h2>
                                <Separator className="flex-1" />
                            </div>
                            <div className="space-y-1">
                                {dashboards.map((d) => (
                                    <DashboardRow
                                        key={d.id}
                                        dashboard={d}
                                        workbench={workbench}
                                        isMobile={isMobile}
                                        onView={() => router.push(`/wb/${workbench}/dashboard/${d.id}`)}
                                        onEdit={() => router.push(`/wb/${workbench}/dashboard/${d.id}/edit`)}
                                        onDuplicate={() => handleDuplicate(d)}
                                        onExport={() => handleExport(d)}
                                        onSettings={() => setSettingsDashboard(d)}
                                        onToggleHidden={() => handleToggleHidden(d)}
                                        onDelete={() => handleDelete(d)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dialogs */}
            <CreateDashboardDialog
                open={showCreate}
                onClose={() => setShowCreate(false)}
                workbench={workbench}
                moduleOptions={moduleOptions}
                onCreated={() => reload()}
            />

            <ImportDashboardDialog
                open={showImport}
                onClose={() => setShowImport(false)}
                workbench={workbench}
                onImported={() => reload()}
            />

            {settingsDashboard && (
                <DashboardSettingsDialog
                    dashboard={settingsDashboard}
                    open={true}
                    onClose={() => setSettingsDashboard(null)}
                    onUpdated={reload}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Dashboard Row
// ─────────────────────────────────────────────

interface DashboardRowProps {
    dashboard: FlatDashboardItem;
    workbench: string;
    isMobile: boolean;
    onView: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onExport: () => void;
    onSettings: () => void;
    onToggleHidden: () => void;
    onDelete: () => void;
}

function DashboardRow({
    dashboard,
    isMobile,
    onView,
    onEdit,
    onDuplicate,
    onExport,
    onSettings,
    onToggleHidden,
    onDelete,
}: DashboardRowProps) {
    const { t } = useMessages();
    const canEdit = dashboard.permission === "owner" || dashboard.permission === "edit";
    const isOwner = dashboard.permission === "owner";
    const isSystem = dashboard.visibility === "system";

    return (
        <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 cursor-pointer group focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 outline-none"
            role="button"
            tabIndex={0}
            onClick={onView}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onView();
                }
            }}
        >
            {/* Icon */}
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-sm shrink-0">
                {dashboard.icon ? (
                    <span className="text-xs">{dashboard.icon.charAt(0).toUpperCase()}</span>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                    </svg>
                )}
            </div>

            {/* Title + description */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                        {t(dashboard.titleKey)}
                    </span>
                    {dashboard.isHidden && (
                        <span className="text-xs text-gray-400">(hidden)</span>
                    )}
                </div>
                {dashboard.descriptionKey && (
                    <p className="text-xs text-gray-400 truncate">{t(dashboard.descriptionKey)}</p>
                )}
            </div>

            {/* Badges — hidden on mobile */}
            {!isMobile && (
                <div className="flex items-center gap-1.5 shrink-0">
                    <VisibilityBadge visibility={dashboard.visibility} />
                    <PermissionBadge permission={dashboard.permission} />
                </div>
            )}

            {/* Action menu */}
            <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={`p-1.5 rounded ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100"} hover:bg-gray-100 transition-opacity`}
                            aria-label="Dashboard actions"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onView}>View</DropdownMenuItem>
                        {canEdit && !isSystem && (
                            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem onClick={onExport}>Export</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {canEdit && !isSystem && (
                            <DropdownMenuItem onClick={onSettings}>Settings</DropdownMenuItem>
                        )}
                        {canEdit && !isSystem && (
                            <DropdownMenuItem onClick={onToggleHidden}>
                                {dashboard.isHidden ? "Unhide" : "Hide"}
                            </DropdownMenuItem>
                        )}
                        {isOwner && !isSystem && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
