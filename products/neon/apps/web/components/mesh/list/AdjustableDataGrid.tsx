"use client";

// components/mesh/list/AdjustableDataGrid.tsx
//
// Zone 4 — Adjustable data table powered by @tanstack/react-table.
// Supports column resizing, visibility toggle, and reordering.

import { useMemo } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type {
    ColumnDef as TanStackColumnDef,
    ColumnOrderState,
    ColumnSizingState,
    VisibilityState,
} from "@tanstack/react-table";
import { GripVertical } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/mesh/shared/EmptyState";
import { cn } from "@/lib/utils";

import { useListPage, useListPageActions } from "./ListPageContext";
import { toTanStackColumns } from "./column-helpers";

import type { Density } from "./types";

const DENSITY_CLASSES: Record<Density, string> = {
    compact: "[&_th]:py-1 [&_td]:py-1 text-xs",
    comfortable: "",
    spacious: "[&_th]:py-3 [&_td]:py-3",
};

export function AdjustableDataGrid<T>() {
    const {
        state,
        config,
        paginatedItems,
        filteredItems,
        allItems,
        loading,
    } = useListPage<T>();
    const actions = useListPageActions();

    // Convert our ColumnDef<T> to TanStack format
    const tanstackColumns = useMemo(
        () => toTanStackColumns(config.columns),
        [config.columns],
    );

    const table = useReactTable({
        data: paginatedItems,
        columns: tanstackColumns,
        state: {
            columnVisibility: state.columnVisibility as VisibilityState,
            columnOrder: state.columnOrder as ColumnOrderState,
            columnSizing: state.columnSizing as ColumnSizingState,
        },
        onColumnVisibilityChange: (updater) => {
            const next =
                typeof updater === "function"
                    ? updater(state.columnVisibility as VisibilityState)
                    : updater;
            actions.setColumnVisibility(next);
        },
        onColumnOrderChange: (updater) => {
            const next =
                typeof updater === "function"
                    ? updater(state.columnOrder as ColumnOrderState)
                    : updater;
            actions.setColumnOrder(next);
        },
        onColumnSizingChange: (updater) => {
            const next =
                typeof updater === "function"
                    ? updater(state.columnSizing as ColumnSizingState)
                    : updater;
            actions.setColumnSizing(next);
        },
        getCoreRowModel: getCoreRowModel(),
        enableColumnResizing: true,
        columnResizeMode: "onChange",
    });

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
        <div>
            <div className="rounded-md border overflow-auto">
                <Table style={{ width: table.getCenterTotalSize() }} className={DENSITY_CLASSES[state.density]}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const meta = header.column.columnDef.meta as
                                        | { align?: string; sortKey?: string }
                                        | undefined;

                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: header.getSize() }}
                                            className={cn(
                                                "relative group select-none",
                                                meta?.align === "center" && "text-center",
                                                meta?.align === "right" && "text-right",
                                                meta?.sortKey && "cursor-pointer",
                                            )}
                                            onClick={() => {
                                                if (meta?.sortKey) {
                                                    actions.setSort(meta.sortKey);
                                                }
                                            }}
                                        >
                                            <span className="inline-flex items-center gap-1 text-xs">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </span>

                                            {/* Resize handle */}
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                onDoubleClick={() => header.column.resetSize()}
                                                className={cn(
                                                    "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                                                    "opacity-0 group-hover:opacity-100 bg-border",
                                                    header.column.getIsResizing() &&
                                                        "opacity-100 bg-primary",
                                                )}
                                            />
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => {
                            const item = row.original;
                            const itemId = config.getId(item);
                            const hasPreview = !!config.previewRenderer;
                            const href = config.getItemHref?.(item);

                            return (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        (hasPreview || href) && "cursor-pointer",
                                        state.previewItemId === itemId && "bg-primary/5",
                                    )}
                                    onClick={(e) => {
                                        if (hasPreview) {
                                            actions.setPreviewItem(itemId);
                                        }
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const meta = cell.column.columnDef.meta as
                                            | { align?: string }
                                            | undefined;

                                        return (
                                            <TableCell
                                                key={cell.id}
                                                style={{ width: cell.column.getSize() }}
                                                className={cn(
                                                    meta?.align === "center" && "text-center",
                                                    meta?.align === "right" && "text-right",
                                                )}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
