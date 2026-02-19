"use client";

// components/mesh/list/ListPageContext.tsx
//
// Shared state management for the Enhanced Robust List Page.
// Provides a context + reducer that all zone components consume.

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
} from "react";

import type { ListPageAction, ListPageConfig, ListPageState } from "./types";

// ─── Default State ───────────────────────────────────────────

function createInitialState(
    quickFilters: { id: string; defaultValue: string }[],
): ListPageState {
    const filters: Record<string, string> = {};
    for (const qf of quickFilters) {
        filters[qf.id] = qf.defaultValue;
    }
    return {
        search: "",
        filters,
        advancedFilters: {},
        advancedOpen: false,
        sortKey: null,
        sortDir: "asc",
        viewMode: "grid",
        selectedIds: new Set(),
        expandedIds: new Set(),
        page: 1,
        pageSize: 25,
    };
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
            const cleared: Record<string, string> = {};
            // Keep keys but reset to empty (the command bar will use defaults)
            return { ...state, filters: cleared, search: "", advancedFilters: {}, page: 1 };
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
            return {
                ...state,
                sortKey: action.payload.key,
                sortDir: sameKey && state.sortDir === "asc" ? "desc" : "asc",
            };
        }

        case "SET_VIEW_MODE":
            return { ...state, viewMode: action.payload, expandedIds: new Set() };

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

        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────────

interface ListPageContextValue<T> {
    state: ListPageState;
    dispatch: React.Dispatch<ListPageAction>;
    config: ListPageConfig<T>;
    // Data
    allItems: T[];
    filteredItems: T[];
    sortedItems: T[];
    paginatedItems: T[];
    totalPages: number;
    loading: boolean;
    error: string | null;
    refresh: () => void;
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
        config.quickFilters,
        createInitialState,
    );

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
        // Remove default/"all" values so filterFn only sees real filters
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

    // Sort pipeline
    const sortedItems = useMemo(() => {
        if (!state.sortKey) return filteredItems;

        const col = config.columns.find((c) => c.sortKey === state.sortKey);
        if (!col) return filteredItems;

        const sorted = [...filteredItems];
        const dir = state.sortDir === "asc" ? 1 : -1;

        if (col.sortFn) {
            sorted.sort((a, b) => col.sortFn!(a, b) * dir);
        } else {
            sorted.sort((a, b) => {
                const va = String(col.accessor(a) ?? "");
                const vb = String(col.accessor(b) ?? "");
                return va.localeCompare(vb) * dir;
            });
        }

        return sorted;
    }, [filteredItems, state.sortKey, state.sortDir, config.columns]);

    // Paginate
    const totalPages = Math.max(1, Math.ceil(sortedItems.length / state.pageSize));
    const paginatedItems = useMemo(() => {
        const start = (state.page - 1) * state.pageSize;
        return sortedItems.slice(start, start + state.pageSize);
    }, [sortedItems, state.page, state.pageSize]);

    const value = useMemo<ListPageContextValue<T>>(
        () => ({
            state,
            dispatch,
            config,
            allItems: items,
            filteredItems,
            sortedItems,
            paginatedItems,
            totalPages,
            loading,
            error,
            refresh,
        }),
        [state, dispatch, config, items, filteredItems, sortedItems, paginatedItems, totalPages, loading, error, refresh],
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
            setViewMode: (mode: "grid" | "table") =>
                dispatch({ type: "SET_VIEW_MODE", payload: mode }),
            toggleSelect: (id: string) => dispatch({ type: "TOGGLE_SELECT", payload: id }),
            selectAll: (ids: string[]) => dispatch({ type: "SELECT_ALL", payload: ids }),
            deselectAll: () => dispatch({ type: "DESELECT_ALL" }),
            toggleExpand: (id: string) => dispatch({ type: "TOGGLE_EXPAND", payload: id }),
            setPage: (page: number) => dispatch({ type: "SET_PAGE", payload: page }),
            setPageSize: (size: number) => dispatch({ type: "SET_PAGE_SIZE", payload: size }),
        }),
        [dispatch],
    );
}
