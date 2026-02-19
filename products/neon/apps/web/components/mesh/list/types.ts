// components/mesh/list/types.ts
//
// Core generic types for the Enhanced Robust List Page system.
// All zone components reference these types via ListPageConfig<T>.

import type { LucideIcon } from "lucide-react";
import type React from "react";

// ─── Column Definitions ──────────────────────────────────────

export interface ColumnDef<T> {
    id: string;
    header: string;
    accessor: (item: T) => React.ReactNode;
    /** Key used for sorting. undefined = column not sortable. */
    sortKey?: string;
    /** Custom sort comparator. Falls back to string comparison on sortKey. */
    sortFn?: (a: T, b: T) => number;
    align?: "left" | "center" | "right";
    /** Tailwind width class, e.g. "w-[200px]" */
    width?: string;
    hidden?: boolean;
}

// ─── Filter Definitions ──────────────────────────────────────

export interface QuickFilterDef {
    id: string;
    label: string;
    options: { value: string; label: string }[];
    /** Default value, typically "all" */
    defaultValue: string;
}

export interface AdvancedFilterFieldDef {
    id: string;
    label: string;
    type: "text" | "select" | "date" | "dateRange" | "multiSelect";
    options?: { value: string; label: string }[];
    placeholder?: string;
    /** Grid column placement (1–3) */
    column?: 1 | 2 | 3;
}

// ─── KPI Definitions ─────────────────────────────────────────

export type KpiVariant = "default" | "warning" | "critical";

export interface KpiDef<T> {
    id: string;
    label: string;
    icon: LucideIcon;
    /** Compute the KPI value from the full (unfiltered) item list */
    compute: (items: T[]) => number | string;
    format?: "number" | "currency" | "percent";
    /** Filters to apply when the KPI card is clicked */
    filterOnClick?: Record<string, string>;
    variant?: KpiVariant;
    /** Dynamic variant based on computed numeric value */
    variantFn?: (value: number) => KpiVariant;
}

// ─── Action Definitions ──────────────────────────────────────

export interface RowAction<T> {
    id: string;
    label: string;
    icon?: LucideIcon;
    onClick: (item: T) => void;
    variant?: "default" | "destructive";
    disabled?: (item: T) => boolean;
    disabledReason?: (item: T) => string;
    hidden?: (item: T) => boolean;
}

export interface BulkAction<T> {
    id: string;
    label: string;
    icon?: LucideIcon;
    onClick: (items: T[]) => void;
    variant?: "default" | "destructive";
}

// ─── List Page Configuration ─────────────────────────────────

export interface ListPageConfig<T> {
    // Identity
    pageTitle: string;
    entityLabel: string;
    entityLabelPlural: string;
    icon: LucideIcon;
    basePath: string;
    getItemId: (item: T) => string;
    getItemHref?: (item: T) => string;

    // Zone 2 — KPI summary
    kpis?: KpiDef<T>[];

    // Zone 3 — Command bar
    searchPlaceholder: string;
    searchFn: (item: T, query: string) => boolean;
    quickFilters: QuickFilterDef[];
    filterFn: (item: T, filters: Record<string, string>) => boolean;

    // Zone 3B — Advanced filters
    advancedFilters?: AdvancedFilterFieldDef[];

    // Zone 4 — Results
    columns: ColumnDef<T>[];
    cardRenderer: (item: T) => React.ReactNode;

    // Zone 5 — Row expansion
    expandRenderer?: (item: T) => React.ReactNode;

    // Actions
    primaryAction?: { label: string; icon?: LucideIcon; onClick: () => void };
    rowActions?: RowAction<T>[];
    bulkActions?: BulkAction<T>[];
}

// ─── Shared State ────────────────────────────────────────────

export interface ListPageState {
    search: string;
    filters: Record<string, string>;
    advancedFilters: Record<string, string>;
    advancedOpen: boolean;
    sortKey: string | null;
    sortDir: "asc" | "desc";
    viewMode: "grid" | "table";
    selectedIds: Set<string>;
    expandedIds: Set<string>;
    page: number;
    pageSize: number;
}

// ─── Reducer Actions ─────────────────────────────────────────

export type ListPageAction =
    | { type: "SET_SEARCH"; payload: string }
    | { type: "SET_FILTER"; payload: { key: string; value: string } }
    | { type: "SET_FILTERS"; payload: Record<string, string> }
    | { type: "REMOVE_FILTER"; payload: string }
    | { type: "CLEAR_FILTERS" }
    | { type: "SET_ADVANCED_FILTER"; payload: { key: string; value: string } }
    | { type: "APPLY_ADVANCED_FILTERS" }
    | { type: "CLEAR_ADVANCED_FILTERS" }
    | { type: "TOGGLE_ADVANCED" }
    | { type: "SET_SORT"; payload: { key: string } }
    | { type: "SET_VIEW_MODE"; payload: "grid" | "table" }
    | { type: "TOGGLE_SELECT"; payload: string }
    | { type: "SELECT_ALL"; payload: string[] }
    | { type: "DESELECT_ALL" }
    | { type: "TOGGLE_EXPAND"; payload: string }
    | { type: "SET_PAGE"; payload: number }
    | { type: "SET_PAGE_SIZE"; payload: number };
