"use client";

import { useMemo } from "react";
import type { DashboardLayout, LayoutItem } from "@athyper/dashboard";
import { computeLayoutDiff } from "../../lib/dashboard/version-diff";

interface VersionCompareViewProps {
    oldLayout: DashboardLayout;
    newLayout: DashboardLayout;
    oldLabel?: string;
    newLabel?: string;
}

function DiffWidget({ item, type }: { item: LayoutItem; type: "added" | "removed" | "modified" | "unchanged" }) {
    const borderColor = {
        added: "border-green-500 bg-green-50",
        removed: "border-red-500 bg-red-50",
        modified: "border-yellow-500 bg-yellow-50",
        unchanged: "border-gray-200 bg-white",
    }[type];

    const label = {
        added: "Added",
        removed: "Removed",
        modified: "Modified",
        unchanged: "",
    }[type];

    return (
        <div
            className={`border-2 rounded-md p-2 ${borderColor}`}
            style={{
                gridColumn: `${item.grid.x + 1} / span ${item.grid.w}`,
                gridRow: `${item.grid.y + 1} / span ${item.grid.h}`,
            }}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 truncate">
                    {item.widget_type}
                </span>
                {label && (
                    <span className={`text-[10px] font-semibold uppercase ${
                        type === "added" ? "text-green-700" :
                        type === "removed" ? "text-red-700" :
                        "text-yellow-700"
                    }`}>
                        {label}
                    </span>
                )}
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{item.id}</p>
        </div>
    );
}

export function VersionCompareView({
    oldLayout,
    newLayout,
    oldLabel = "Before",
    newLabel = "After",
}: VersionCompareViewProps) {
    const diff = useMemo(
        () => computeLayoutDiff(oldLayout.items, newLayout.items),
        [oldLayout.items, newLayout.items],
    );

    const summary = [
        diff.added.length > 0 && `${diff.added.length} added`,
        diff.removed.length > 0 && `${diff.removed.length} removed`,
        diff.modified.length > 0 && `${diff.modified.length} modified`,
        diff.unchanged.length > 0 && `${diff.unchanged.length} unchanged`,
    ].filter(Boolean).join(", ");

    return (
        <div>
            {/* Summary */}
            <p className="text-xs text-gray-500 mb-3">Changes: {summary || "No changes"}</p>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-2 gap-4">
                {/* Old layout */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{oldLabel}</p>
                    <div
                        className="grid grid-cols-12 gap-1 min-h-[200px] bg-gray-50 rounded-md p-2 border border-gray-200"
                        style={{ gridAutoRows: "40px" }}
                    >
                        {oldLayout.items.map((item) => {
                            const isRemoved = diff.removed.some((r) => r.id === item.id);
                            const isModified = diff.modified.some((m) => m.before.id === item.id);
                            return (
                                <DiffWidget
                                    key={item.id}
                                    item={item}
                                    type={isRemoved ? "removed" : isModified ? "modified" : "unchanged"}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* New layout */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{newLabel}</p>
                    <div
                        className="grid grid-cols-12 gap-1 min-h-[200px] bg-gray-50 rounded-md p-2 border border-gray-200"
                        style={{ gridAutoRows: "40px" }}
                    >
                        {newLayout.items.map((item) => {
                            const isAdded = diff.added.some((a) => a.id === item.id);
                            const isModified = diff.modified.some((m) => m.after.id === item.id);
                            return (
                                <DiffWidget
                                    key={item.id}
                                    item={item}
                                    type={isAdded ? "added" : isModified ? "modified" : "unchanged"}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
