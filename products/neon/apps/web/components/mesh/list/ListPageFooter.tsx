"use client";

// components/mesh/list/ListPageFooter.tsx
//
// Pagination controls + item count summary.

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useListPage, useListPageActions } from "./ListPageContext";

const PAGE_SIZES = [10, 25, 50, 100];

export function ListPageFooter<T>() {
    const { state, config, filteredItems, totalPages } = useListPage<T>();
    const actions = useListPageActions();

    const total = filteredItems.length;
    if (total === 0) return null;

    // In kanban mode, hide pagination unless config opts in
    if (state.viewMode === "kanban" && !config.kanban?.paginate) return null;

    const start = (state.page - 1) * state.pageSize + 1;
    const end = Math.min(state.page * state.pageSize, total);

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {/* Item range */}
            <p className="text-xs text-muted-foreground">
                Showing {start}–{end} of {total} {config.entityLabelPlural}
            </p>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="size-8 p-0"
                    disabled={state.page <= 1}
                    onClick={() => actions.setPage(1)}
                >
                    <ChevronsLeft className="size-3.5" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="size-8 p-0"
                    disabled={state.page <= 1}
                    onClick={() => actions.setPage(state.page - 1)}
                >
                    <ChevronLeft className="size-3.5" />
                </Button>

                <span className="px-2 text-xs text-muted-foreground">
                    Page {state.page} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    className="size-8 p-0"
                    disabled={state.page >= totalPages}
                    onClick={() => actions.setPage(state.page + 1)}
                >
                    <ChevronRight className="size-3.5" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="size-8 p-0"
                    disabled={state.page >= totalPages}
                    onClick={() => actions.setPage(totalPages)}
                >
                    <ChevronsRight className="size-3.5" />
                </Button>
            </div>

            {/* Page size selector */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Per page:</span>
                <Select
                    value={String(state.pageSize)}
                    onValueChange={(v) => actions.setPageSize(Number(v))}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PAGE_SIZES.map((size) => (
                            <SelectItem key={size} value={String(size)}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
