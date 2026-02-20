"use client";

// components/mesh/list/EntityCardGrid.tsx
//
// Zone 4 — Card grid view. Delegates card rendering to config.cardRenderer.
// Supports density modes and group-by headers.

import {
    ChevronDown,
    ChevronRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mesh/shared/EmptyState";
import { cn } from "@/lib/utils";

import { useListPage, useListPageActions } from "./ListPageContext";

import type { Density } from "./types";

const DENSITY_GAP: Record<Density, string> = {
    compact: "gap-2",
    comfortable: "gap-4",
    spacious: "gap-6",
};

export function EntityCardGrid<T>() {
    const { state, config, paginatedItems, filteredItems, groupedItems, allItems, loading } =
        useListPage<T>();
    const actions = useListPageActions();
    const hasPreview = !!config.previewRenderer;
    const hasGroups = groupedItems.length > 0;

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-[120px] rounded-lg" />
                ))}
            </div>
        );
    }

    if (filteredItems.length === 0) {
        return (
            <EmptyState
                icon={config.icon}
                title={`No ${config.entityLabelPlural} found`}
                description={
                    allItems.length === 0
                        ? `Get started by creating your first ${config.entityLabel}.`
                        : `No ${config.entityLabelPlural} match your current filters. Try adjusting your search.`
                }
                actionLabel={
                    allItems.length === 0 && config.primaryAction
                        ? config.primaryAction.label
                        : undefined
                }
                onAction={
                    allItems.length === 0 ? config.primaryAction?.onClick : undefined
                }
            />
        );
    }

    const renderCard = (item: T) => {
        const itemId = config.getId(item);
        return (
            <div
                key={itemId}
                className={cn(
                    hasPreview && "cursor-pointer",
                    state.previewItemId === itemId && "ring-2 ring-primary rounded-lg",
                )}
                onClick={hasPreview ? () => actions.setPreviewItem(itemId) : undefined}
            >
                {config.cardRenderer(item)}
            </div>
        );
    };

    const gridClass = cn(
        "grid md:grid-cols-2 lg:grid-cols-3",
        DENSITY_GAP[state.density],
    );

    if (hasGroups) {
        return (
            <div className="space-y-4">
                {groupedItems.map((group) => (
                    <div key={group.key} className="space-y-2">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm"
                            onClick={() => actions.toggleGroupCollapse(group.key)}
                        >
                            {group.collapsed ? (
                                <ChevronRight className="size-4" />
                            ) : (
                                <ChevronDown className="size-4" />
                            )}
                            <span className="font-medium">{group.label}</span>
                            <Badge variant="secondary" className="text-[10px]">
                                {group.items.length}
                            </Badge>
                        </button>
                        {!group.collapsed && (
                            <div className={gridClass}>
                                {group.items.map((item) => renderCard(item))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={gridClass}>
            {paginatedItems.map((item) => renderCard(item))}
        </div>
    );
}
