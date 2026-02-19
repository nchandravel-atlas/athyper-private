"use client";

// components/mesh/list/EntityDataGrid.tsx
//
// Zone 4 — Data table with sortable columns, row selection, and row expansion.

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/mesh/shared/EmptyState";
import { cn } from "@/lib/utils";

import { DataGridRow } from "./DataGridRow";
import { useListPage, useListPageActions } from "./ListPageContext";

export function EntityDataGrid<T>() {
    const {
        state,
        config,
        paginatedItems,
        filteredItems,
        allItems,
        loading,
    } = useListPage<T>();
    const actions = useListPageActions();

    const visibleColumns = config.columns.filter((c) => !c.hidden);
    const hasExpand = !!config.expandRenderer;
    const hasRowActions = (config.rowActions?.length ?? 0) > 0;
    const totalCols =
        visibleColumns.length + 1 + (hasExpand ? 1 : 0) + (hasRowActions ? 1 : 0);

    // Select all logic
    const pageIds = paginatedItems.map((item) => config.getItemId(item));
    const allSelected =
        pageIds.length > 0 && pageIds.every((id) => state.selectedIds.has(id));
    const someSelected =
        !allSelected && pageIds.some((id) => state.selectedIds.has(id));

    const handleSelectAll = () => {
        if (allSelected) {
            actions.deselectAll();
        } else {
            actions.selectAll(pageIds);
        }
    };

    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
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
        <Table>
            <TableHeader>
                <TableRow>
                    {/* Select all checkbox */}
                    <TableHead className="w-[40px]">
                        <Checkbox
                            checked={allSelected}
                            // @ts-expect-error - indeterminate is valid
                            indeterminate={someSelected}
                            onCheckedChange={handleSelectAll}
                        />
                    </TableHead>

                    {/* Expand column */}
                    {hasExpand && <TableHead className="w-[40px]" />}

                    {/* Data column headers */}
                    {visibleColumns.map((col) => {
                        const isSorted = state.sortKey === col.sortKey;
                        const isSortable = !!col.sortKey;

                        return (
                            <TableHead
                                key={col.id}
                                className={cn(
                                    col.width,
                                    col.align === "center" && "text-center",
                                    col.align === "right" && "text-right",
                                    isSortable && "cursor-pointer select-none",
                                )}
                                onClick={
                                    isSortable
                                        ? () => actions.setSort(col.sortKey!)
                                        : undefined
                                }
                            >
                                <span className="inline-flex items-center gap-1">
                                    {col.header}
                                    {isSortable && (
                                        <>
                                            {isSorted && state.sortDir === "asc" && (
                                                <ArrowUp className="size-3" />
                                            )}
                                            {isSorted && state.sortDir === "desc" && (
                                                <ArrowDown className="size-3" />
                                            )}
                                            {!isSorted && (
                                                <ArrowUpDown className="size-3 text-muted-foreground/50" />
                                            )}
                                        </>
                                    )}
                                </span>
                            </TableHead>
                        );
                    })}

                    {/* Actions column */}
                    {hasRowActions && <TableHead className="w-[40px]" />}
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedItems.map((item) => {
                    const itemId = config.getItemId(item);
                    return (
                        <DataGridRow
                            key={itemId}
                            item={item}
                            itemId={itemId}
                            columns={visibleColumns}
                            rowActions={config.rowActions}
                            hasExpand={hasExpand}
                            isSelected={state.selectedIds.has(itemId)}
                            isExpanded={state.expandedIds.has(itemId)}
                            expandRenderer={config.expandRenderer}
                            href={config.getItemHref?.(item)}
                        />
                    );
                })}
            </TableBody>
        </Table>
    );
}
