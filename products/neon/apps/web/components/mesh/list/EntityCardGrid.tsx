"use client";

// components/mesh/list/EntityCardGrid.tsx
//
// Zone 4 — Card grid view. Delegates card rendering to config.cardRenderer.

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mesh/shared/EmptyState";

import { useListPage } from "./ListPageContext";

export function EntityCardGrid<T>() {
    const { config, paginatedItems, filteredItems, allItems, loading } =
        useListPage<T>();

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

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((item) => (
                <div key={config.getItemId(item)}>{config.cardRenderer(item)}</div>
            ))}
        </div>
    );
}
