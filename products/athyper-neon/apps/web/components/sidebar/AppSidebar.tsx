"use client";

import { useState } from "react";
import type { Workbench, DashboardGroup } from "@athyper/dashboard";
import { useDashboards } from "../../lib/dashboard/use-dashboards";
import { SidebarDashboardList } from "./SidebarDashboardList";

interface AppSidebarProps {
    workbench: Workbench;
    locale: string;
    messages: Record<string, string>;
}

export function AppSidebar({ workbench, locale, messages }: AppSidebarProps) {
    const { data, loading: isLoading, error } = useDashboards(workbench);
    const groups = data?.groups ?? [];
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-200 ${
                collapsed ? "w-16" : "w-64"
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                {!collapsed && (
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Dashboards
                    </h2>
                )}
                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? "\u25B6" : "\u25C0"}
                </button>
            </div>

            {/* Content */}
            <nav className="flex-1 overflow-y-auto py-2">
                {isLoading && (
                    <div className="px-4 py-8 text-center">
                        <div className="text-xs text-gray-400">Loading...</div>
                    </div>
                )}

                {error && (
                    <div className="px-4 py-8 text-center">
                        <div className="text-xs text-red-400">Failed to load dashboards</div>
                    </div>
                )}

                {!isLoading && !error && groups.length === 0 && (
                    <div className="px-4 py-8 text-center">
                        <div className="text-xs text-gray-400">No dashboards available</div>
                    </div>
                )}

                {!collapsed && groups.map((group) => (
                    <SidebarDashboardList
                        key={group.module_code}
                        group={group}
                        workbench={workbench}
                        locale={locale}
                        messages={messages}
                    />
                ))}
            </nav>
        </aside>
    );
}
