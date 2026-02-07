"use client";

import { useState } from "react";
import type { DashboardGroup, Workbench } from "@athyper/dashboard";
import { SidebarContextMenu } from "./SidebarContextMenu";

interface SidebarDashboardListProps {
    group: DashboardGroup;
    workbench: Workbench;
    locale: string;
    messages: Record<string, string>;
}

export function SidebarDashboardList({ group, workbench, locale, messages }: SidebarDashboardListProps) {
    const [expanded, setExpanded] = useState(true);
    const [contextMenuId, setContextMenuId] = useState<string | null>(null);

    return (
        <div className="mb-1">
            {/* Module group header */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center w-full px-4 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50"
            >
                <span className={`mr-2 text-[10px] transition-transform ${expanded ? "rotate-90" : ""}`}>
                    {"\u25B6"}
                </span>
                {group.module_name}
            </button>

            {/* Dashboard items */}
            {expanded && (
                <ul className="ml-4">
                    {group.dashboards.map((dashboard) => (
                        <li key={dashboard.id} className="relative">
                            <a
                                href={`/${locale}/wb/${workbench}/dashboard/${dashboard.id}`}
                                className="flex items-center justify-between px-4 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-l"
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenuId(contextMenuId === dashboard.id ? null : dashboard.id);
                                }}
                            >
                                <span className="truncate">{messages[dashboard.title] ?? dashboard.title}</span>
                                {dashboard.visibility !== "system" && (
                                    <span className="ml-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400" title="Custom" />
                                )}
                            </a>

                            {contextMenuId === dashboard.id && (
                                <SidebarContextMenu
                                    dashboardId={dashboard.id}
                                    visibility={dashboard.visibility}
                                    permission={dashboard.permission}
                                    workbench={workbench}
                                    onClose={() => setContextMenuId(null)}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
