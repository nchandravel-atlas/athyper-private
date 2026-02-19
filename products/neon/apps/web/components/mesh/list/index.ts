// components/mesh/list/index.ts
//
// Barrel export for the Enhanced Robust List Page component system.

// Types
export type {
    AdvancedFilterFieldDef,
    BulkAction,
    ColumnDef,
    KpiDef,
    KpiVariant,
    ListPageConfig,
    ListPageState,
    QuickFilterDef,
    RowAction,
} from "./types";

// Context + Hooks
export { ListPageProvider, useListPage, useListPageActions } from "./ListPageContext";
export { useUrlFilters } from "./use-url-filters";

// Zone 1 — Page Header
export { ListPageHeader } from "./ListPageHeader";

// Zone 2 — KPI Summary
export { KpiSummaryBar } from "./KpiSummaryBar";

// Zone 3 — Command Bar
export { ListCommandBar } from "./ListCommandBar";

// Filter Chips
export { FilterChips } from "./FilterChips";

// Zone 3B — Advanced Filters
export { AdvancedFilterPanel } from "./AdvancedFilterPanel";

// Zone 4 — Results
export { EntityDataGrid } from "./EntityDataGrid";
export { EntityCardGrid } from "./EntityCardGrid";

// Zone 5 — Row expansion (built into DataGridRow, no separate export needed)

// Selection
export { SelectionToolbar } from "./SelectionToolbar";

// Footer
export { ListPageFooter } from "./ListPageFooter";
