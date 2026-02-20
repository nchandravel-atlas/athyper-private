"use client";

// components/mesh/list/ListPageContext.tsx
//
// Shared state management for the CollectionExplorerPage.
// Provides a context + reducer that all zone components consume.

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";

import {
    getLocalStorageValue,
    setLocalStorageValue,
} from "@/lib/local-storage.client";

import { computeCapabilities } from "./explorer-capabilities";

import type {
    Density,
    ExplorerCapabilities,
    GroupRule,
    ItemGroup,
    ListPageAction,
    ListPageConfig,
    ListPageState,
    SortRule,
    ViewMode,
    ViewPreset,
} from "./types";

const VALID_VIEW_MODES: ViewMode[] = ["table", "table-columns", "card-grid", "kanban"];

// ─── Default State ───────────────────────────────────────────

function createInitialState(
    config: ListPageConfig<unknown>,
): ListPageState {
    const filters: Record<string, string> = {};
    for (const qf of config.quickFilters) {
        filters[qf.id] = qf.defaultValue;
    }

    const columnVisibility: Record<string, boolean> = {};
    for (const col of config.columns) {
        columnVisibility[col.id] = !col.hidden;
    }

    const columnOrder = config.columns.map((c) => c.id);

    // Use a stable default for SSR — client will sync in useEffect
    const viewMode: ViewMode =
        config.defaultViewMode ?? config.availableViews?.[0] ?? "card-grid";

    // Derive initial filter bar fields from quick filters
    const filterBarFields = config.quickFilters.map((f) => f.id);

    return {
        search: "",
        filters,
        advancedFilters: {},
        advancedOpen: false,
        sortKey: null,
        sortDir: "asc",
        sortRules: [],
        groupBy: [],
        density: "comfortable" as Density,
        viewMode,
        selectedIds: new Set(),
        expandedIds: new Set(),
        page: 1,
        pageSize: 25,
        columnVisibility,
        columnOrder,
        columnSizing: {},
        filterBarFields,
        previewItemId: null,
        activePresetId: null,
        settingsOpen: false,
        settingsDraft: null,
        adaptFiltersOpen: false,
        presetDirty: false,
        collapsedGroups: new Set(),
    };
}

/** Resolve the client-side view mode (localStorage > responsive default > config default) */
function resolveClientViewMode(config: ListPageConfig<unknown>): ViewMode | null {
    if (typeof window === "undefined") return null;

    // Check localStorage first
    const saved = getLocalStorageValue(`neon:viewMode:${config.basePath}`);
    if (saved && VALID_VIEW_MODES.includes(saved as ViewMode)) {
        return saved as ViewMode;
    }

    // Responsive default: desktop may differ from mobile
    const isDesktop = window.innerWidth >= 1024;
    const mobileDefault: ViewMode =
        config.defaultViewMode ?? config.availableViews?.[0] ?? "card-grid";
    const desktopDefault: ViewMode =
        config.defaultViewModeDesktop ?? mobileDefault;
    const resolved = isDesktop ? desktopDefault : mobileDefault;

    // Only return if different from the SSR default
    const ssrDefault: ViewMode =
        config.defaultViewMode ?? config.availableViews?.[0] ?? "card-grid";
    return resolved !== ssrDefault ? resolved : null;
}

// ─── Reducer ─────────────────────────────────────────────────

function reducer(state: ListPageState, action: ListPageAction): ListPageState {
    switch (action.type) {
        case "SET_SEARCH":
            return { ...state, search: action.payload, page: 1 };

        case "SET_FILTER":
            return {
                ...state,
                filters: { ...state.filters, [action.payload.key]: action.payload.value },
                page: 1,
            };

        case "SET_FILTERS":
            return { ...state, filters: { ...state.filters, ...action.payload }, page: 1 };

        case "REMOVE_FILTER": {
            const next = { ...state.filters };
            delete next[action.payload];
            return { ...state, filters: next, page: 1 };
        }

        case "CLEAR_FILTERS": {
            return { ...state, filters: {}, search: "", advancedFilters: {}, page: 1 };
        }

        case "SET_ADVANCED_FILTER":
            return {
                ...state,
                advancedFilters: {
                    ...state.advancedFilters,
                    [action.payload.key]: action.payload.value,
                },
            };

        case "APPLY_ADVANCED_FILTERS":
            return {
                ...state,
                filters: { ...state.filters, ...state.advancedFilters },
                advancedOpen: false,
                page: 1,
            };

        case "CLEAR_ADVANCED_FILTERS":
            return { ...state, advancedFilters: {}, page: 1 };

        case "TOGGLE_ADVANCED":
            return { ...state, advancedOpen: !state.advancedOpen };

        case "SET_SORT": {
            const sameKey = state.sortKey === action.payload.key;
            const newDir = sameKey && state.sortDir === "asc" ? "desc" : "asc";
            return {
                ...state,
                sortKey: action.payload.key,
                sortDir: newDir,
                // Sync legacy sort into sortRules[0]
                sortRules: [{ fieldId: action.payload.key, dir: newDir }],
            };
        }

        case "SET_SORT_RULES":
            return {
                ...state,
                sortRules: action.payload,
                // Sync first rule back to legacy fields
                sortKey: action.payload[0]?.fieldId ?? null,
                sortDir: action.payload[0]?.dir ?? "asc",
            };

        case "SET_GROUP_BY":
            return { ...state, groupBy: action.payload, page: 1 };

        case "TOGGLE_GROUP_COLLAPSE": {
            const next = new Set(state.collapsedGroups);
            if (next.has(action.payload)) {
                next.delete(action.payload);
            } else {
                next.add(action.payload);
            }
            return { ...state, collapsedGroups: next };
        }

        case "SET_DENSITY":
            return { ...state, density: action.payload };

        case "SET_FILTER_BAR":
            return { ...state, filterBarFields: action.payload };

        case "SET_VIEW_MODE":
            return { ...state, viewMode: action.payload, expandedIds: new Set(), page: 1 };

        case "TOGGLE_SELECT": {
            const next = new Set(state.selectedIds);
            if (next.has(action.payload)) {
                next.delete(action.payload);
            } else {
                next.add(action.payload);
            }
            return { ...state, selectedIds: next };
        }

        case "SELECT_ALL":
            return { ...state, selectedIds: new Set(action.payload) };

        case "DESELECT_ALL":
            return { ...state, selectedIds: new Set() };

        case "TOGGLE_EXPAND": {
            const next = new Set(state.expandedIds);
            if (next.has(action.payload)) {
                next.delete(action.payload);
            } else {
                next.add(action.payload);
            }
            return { ...state, expandedIds: next };
        }

        case "SET_PAGE":
            return { ...state, page: action.payload };

        case "SET_PAGE_SIZE":
            return { ...state, pageSize: action.payload, page: 1 };

        case "SET_COLUMN_VISIBILITY":
            return { ...state, columnVisibility: action.payload };

        case "SET_COLUMN_ORDER":
            return { ...state, columnOrder: action.payload };

        case "SET_COLUMN_SIZING":
            return { ...state, columnSizing: action.payload };

        case "SET_PREVIEW_ITEM":
            return { ...state, previewItemId: action.payload };

        case "APPLY_PRESET": {
            const preset = action.payload;
            return {
                ...state,
                search: preset.search ?? state.search,
                sortKey: preset.sortKey !== undefined ? preset.sortKey : state.sortKey,
                sortDir: preset.sortDir ?? state.sortDir,
                sortRules: preset.sortRules ?? (preset.sortKey
                    ? [{ fieldId: preset.sortKey, dir: preset.sortDir ?? "asc" }]
                    : state.sortRules),
                groupBy: preset.groupBy ?? state.groupBy,
                density: preset.density ?? state.density,
                viewMode: preset.viewMode ?? state.viewMode,
                filters: preset.filters ? { ...state.filters, ...preset.filters } : state.filters,
                columnVisibility: preset.columnVisibility ?? state.columnVisibility,
                columnOrder: preset.columnOrder ?? state.columnOrder,
                columnSizing: preset.columnSizing ?? state.columnSizing,
                filterBarFields: preset.filterBarFields ?? state.filterBarFields,
                pageSize: preset.pageSize ?? state.pageSize,
                activePresetId: preset.id,
                presetDirty: false,
                page: 1,
            };
        }

        case "OPEN_SETTINGS":
            return { ...state, settingsOpen: true, settingsDraft: { ...state } };

        case "CLOSE_SETTINGS":
            return { ...state, settingsOpen: false, settingsDraft: null };

        case "APPLY_SETTINGS": {
            const draft = action.payload;
            return {
                ...state,
                ...draft,
                settingsOpen: false,
                settingsDraft: null,
                page: 1,
            };
        }

        case "OPEN_ADAPT_FILTERS":
            return { ...state, adaptFiltersOpen: true };

        case "CLOSE_ADAPT_FILTERS":
            return { ...state, adaptFiltersOpen: false };

        case "SET_PRESET_DIRTY":
            return { ...state, presetDirty: action.payload };

        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────────

interface ListPageContextValue<T> {
    state: ListPageState;
    dispatch: React.Dispatch<ListPageAction>;
    config: ListPageConfig<T>;
    capabilities: ExplorerCapabilities;
    // Data
    allItems: T[];
    filteredItems: T[];
    sortedItems: T[];
    groupedItems: ItemGroup<T>[];
    paginatedItems: T[];
    totalPages: number;
    loading: boolean;
    error: string | null;
    refresh: () => void;
    // Computed
    previewItem: T | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ListPageCtx = createContext<ListPageContextValue<any> | null>(null);

// ─── Provider ────────────────────────────────────────────────

interface ListPageProviderProps<T> {
    config: ListPageConfig<T>;
    items: T[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
    children: React.ReactNode;
}

export function ListPageProvider<T>({
    config,
    items,
    loading,
    error,
    refresh,
    children,
}: ListPageProviderProps<T>) {
    const [state, dispatch] = useReducer(
        reducer,
        config as ListPageConfig<unknown>,
        createInitialState,
    );

    // On mount, sync view mode from localStorage / responsive default
    useEffect(() => {
        const clientMode = resolveClientViewMode(config as ListPageConfig<unknown>);
        if (clientMode) {
            dispatch({ type: "SET_VIEW_MODE", payload: clientMode });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist view mode preference to localStorage
    useEffect(() => {
        setLocalStorageValue(`neon:viewMode:${config.basePath}`, state.viewMode);
    }, [state.viewMode, config.basePath]);

    // Filter pipeline
    const filteredItems = useMemo(() => {
        let result = items;

        // Text search
        if (state.search) {
            const q = state.search.toLowerCase();
            result = result.filter((item) => config.searchFn(item, q));
        }

        // Quick + advanced filters
        const activeFilters = { ...state.filters };
        const realFilters: Record<string, string> = {};
        for (const [k, v] of Object.entries(activeFilters)) {
            const qf = config.quickFilters.find((f) => f.id === k);
            if (v && v !== (qf?.defaultValue ?? "all")) {
                realFilters[k] = v;
            }
        }

        if (Object.keys(realFilters).length > 0) {
            result = result.filter((item) => config.filterFn(item, realFilters));
        }

        return result;
    }, [items, state.search, state.filters, config]);

    // Capabilities (stable across renders unless config changes)
    const capabilities = useMemo(
        () => computeCapabilities(config),
        [config],
    );

    // Sort pipeline — supports multi-sort via sortRules
    const sortedItems = useMemo(() => {
        const rules = state.sortRules;

        // Fallback to legacy sortKey/sortDir if no sortRules
        const effectiveRules: SortRule[] = rules.length > 0
            ? rules
            : state.sortKey
                ? [{ fieldId: state.sortKey, dir: state.sortDir }]
                : [];

        if (effectiveRules.length === 0) return filteredItems;

        const sorted = [...filteredItems];

        sorted.sort((a, b) => {
            for (const rule of effectiveRules) {
                const col = config.columns.find((c) => c.sortKey === rule.fieldId);
                if (!col) continue;

                const dir = rule.dir === "asc" ? 1 : -1;
                let cmp: number;

                if (col.sortFn) {
                    cmp = col.sortFn(a, b);
                } else {
                    const va = String(col.accessor(a) ?? "");
                    const vb = String(col.accessor(b) ?? "");
                    cmp = va.localeCompare(vb);
                }

                if (cmp !== 0) return cmp * dir;
            }
            return 0;
        });

        return sorted;
    }, [filteredItems, state.sortRules, state.sortKey, state.sortDir, config.columns]);

    // Group-by pipeline
    const groupedItems = useMemo((): ItemGroup<T>[] => {
        if (state.groupBy.length === 0) return [];

        const rule = state.groupBy[0]; // Primary group (multi-level in future phases)
        const col = config.columns.find((c) => c.id === rule.fieldId);
        if (!col) return [];

        const groups = new Map<string, T[]>();

        for (const item of sortedItems) {
            const raw = col.accessor(item);
            const key = String(raw ?? "—");
            const existing = groups.get(key);
            if (existing) {
                existing.push(item);
            } else {
                groups.set(key, [item]);
            }
        }

        return Array.from(groups.entries()).map(([key, items]) => ({
            key,
            label: key,
            items,
            collapsed: state.collapsedGroups.has(key),
        }));
    }, [sortedItems, state.groupBy, state.collapsedGroups, config.columns]);

    // Paginate
    const totalPages = Math.max(1, Math.ceil(sortedItems.length / state.pageSize));
    const paginatedItems = useMemo(() => {
        const start = (state.page - 1) * state.pageSize;
        return sortedItems.slice(start, start + state.pageSize);
    }, [sortedItems, state.page, state.pageSize]);

    // Preview item lookup
    const previewItem = useMemo(() => {
        if (!state.previewItemId) return null;
        return filteredItems.find(
            (item) => config.getId(item) === state.previewItemId,
        ) ?? null;
    }, [state.previewItemId, filteredItems, config]);

    const value = useMemo<ListPageContextValue<T>>(
        () => ({
            state,
            dispatch,
            config,
            capabilities,
            allItems: items,
            filteredItems,
            sortedItems,
            groupedItems,
            paginatedItems,
            totalPages,
            loading,
            error,
            refresh,
            previewItem,
        }),
        [state, dispatch, config, capabilities, items, filteredItems, sortedItems, groupedItems, paginatedItems, totalPages, loading, error, refresh, previewItem],
    );

    return <ListPageCtx.Provider value={value}>{children}</ListPageCtx.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────

export function useListPage<T>(): ListPageContextValue<T> {
    const ctx = useContext(ListPageCtx);
    if (!ctx) {
        throw new Error("useListPage must be used within a ListPageProvider");
    }
    return ctx as ListPageContextValue<T>;
}

// ─── Convenience Dispatchers ─────────────────────────────────

export function useListPageActions() {
    const { dispatch } = useListPage();

    return useMemo(
        () => ({
            setSearch: (value: string) => dispatch({ type: "SET_SEARCH", payload: value }),
            setFilter: (key: string, value: string) =>
                dispatch({ type: "SET_FILTER", payload: { key, value } }),
            setFilters: (filters: Record<string, string>) =>
                dispatch({ type: "SET_FILTERS", payload: filters }),
            removeFilter: (key: string) => dispatch({ type: "REMOVE_FILTER", payload: key }),
            clearFilters: () => dispatch({ type: "CLEAR_FILTERS" }),
            toggleAdvanced: () => dispatch({ type: "TOGGLE_ADVANCED" }),
            setSort: (key: string) => dispatch({ type: "SET_SORT", payload: { key } }),
            setViewMode: (mode: ViewMode) =>
                dispatch({ type: "SET_VIEW_MODE", payload: mode }),
            toggleSelect: (id: string) => dispatch({ type: "TOGGLE_SELECT", payload: id }),
            selectAll: (ids: string[]) => dispatch({ type: "SELECT_ALL", payload: ids }),
            deselectAll: () => dispatch({ type: "DESELECT_ALL" }),
            toggleExpand: (id: string) => dispatch({ type: "TOGGLE_EXPAND", payload: id }),
            setPage: (page: number) => dispatch({ type: "SET_PAGE", payload: page }),
            setPageSize: (size: number) => dispatch({ type: "SET_PAGE_SIZE", payload: size }),
            setColumnVisibility: (vis: Record<string, boolean>) =>
                dispatch({ type: "SET_COLUMN_VISIBILITY", payload: vis }),
            setColumnOrder: (order: string[]) =>
                dispatch({ type: "SET_COLUMN_ORDER", payload: order }),
            setColumnSizing: (sizing: Record<string, number>) =>
                dispatch({ type: "SET_COLUMN_SIZING", payload: sizing }),
            setPreviewItem: (id: string | null) =>
                dispatch({ type: "SET_PREVIEW_ITEM", payload: id }),
            applyPreset: (preset: ViewPreset) =>
                dispatch({ type: "APPLY_PRESET", payload: preset }),
            setSortRules: (rules: SortRule[]) =>
                dispatch({ type: "SET_SORT_RULES", payload: rules }),
            setGroupBy: (rules: GroupRule[]) =>
                dispatch({ type: "SET_GROUP_BY", payload: rules }),
            toggleGroupCollapse: (key: string) =>
                dispatch({ type: "TOGGLE_GROUP_COLLAPSE", payload: key }),
            setDensity: (density: Density) =>
                dispatch({ type: "SET_DENSITY", payload: density }),
            setFilterBar: (fields: string[]) =>
                dispatch({ type: "SET_FILTER_BAR", payload: fields }),
            openSettings: () => dispatch({ type: "OPEN_SETTINGS" }),
            closeSettings: () => dispatch({ type: "CLOSE_SETTINGS" }),
            applySettings: (draft: Partial<ListPageState>) =>
                dispatch({ type: "APPLY_SETTINGS", payload: draft }),
            openAdaptFilters: () => dispatch({ type: "OPEN_ADAPT_FILTERS" }),
            closeAdaptFilters: () => dispatch({ type: "CLOSE_ADAPT_FILTERS" }),
            setPresetDirty: (dirty: boolean) =>
                dispatch({ type: "SET_PRESET_DIRTY", payload: dirty }),
        }),
        [dispatch],
    );
}
