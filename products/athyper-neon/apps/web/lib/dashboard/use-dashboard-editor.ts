"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import type { DashboardLayout, GridPosition, LayoutItem } from "@athyper/dashboard";
import { saveDraftLayout } from "./dashboard-client";
import { findAvailableSlot, resolveCollisions, clampGrid } from "./grid-utils";

// ─── Action Types ────────────────────────────────────────────

export type EditorAction =
    | { type: "INIT"; layout: DashboardLayout }
    | { type: "ADD_WIDGET"; widgetType: string; grid: GridPosition; params: Record<string, unknown> }
    | { type: "MOVE_WIDGET"; widgetId: string; grid: GridPosition }
    | { type: "RESIZE_WIDGET"; widgetId: string; w: number; h: number }
    | { type: "UPDATE_PARAMS"; widgetId: string; params: Record<string, unknown> }
    | { type: "DELETE_WIDGET"; widgetId: string }
    | { type: "DUPLICATE_WIDGET"; widgetId: string }
    | { type: "SELECT"; widgetId: string | null }
    | { type: "SET_MODE"; mode: "edit" | "preview" }
    | { type: "MARK_SAVED"; savedAt: Date }
    | { type: "RESET"; layout: DashboardLayout }
    | { type: "UNDO" }
    | { type: "REDO" };

export interface EditorState {
    layout: DashboardLayout;
    past: DashboardLayout[];
    future: DashboardLayout[];
    selectedWidgetId: string | null;
    isDirty: boolean;
    mode: "edit" | "preview";
    lastSavedAt: Date | null;
    isSaving: boolean;
}

const HISTORY_LIMIT = 50;

// Actions that mutate the layout and should be tracked in undo history
const LAYOUT_MUTATING_ACTIONS = new Set([
    "ADD_WIDGET", "MOVE_WIDGET", "RESIZE_WIDGET",
    "UPDATE_PARAMS", "DELETE_WIDGET", "DUPLICATE_WIDGET",
]);

// ─── Core Reducer (no history tracking) ─────────────────────

function coreReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "INIT":
            return {
                ...state,
                layout: action.layout,
                isDirty: false,
                selectedWidgetId: null,
            };

        case "ADD_WIDGET": {
            const newItem: LayoutItem = {
                id: crypto.randomUUID().slice(0, 10),
                widget_type: action.widgetType,
                params: action.params,
                grid: clampGrid(action.grid),
            };
            const items = resolveCollisions([...state.layout.items, newItem], newItem);
            return {
                ...state,
                layout: { ...state.layout, items },
                selectedWidgetId: newItem.id,
                isDirty: true,
            };
        }

        case "MOVE_WIDGET": {
            const movedItem = state.layout.items.find((i) => i.id === action.widgetId);
            if (!movedItem) return state;

            const updated: LayoutItem = {
                ...movedItem,
                grid: clampGrid(action.grid),
            };
            const items = resolveCollisions(
                state.layout.items.map((i) => (i.id === action.widgetId ? updated : i)),
                updated,
            );
            return {
                ...state,
                layout: { ...state.layout, items },
                isDirty: true,
            };
        }

        case "RESIZE_WIDGET": {
            const items = state.layout.items.map((i) => {
                if (i.id !== action.widgetId) return i;
                return {
                    ...i,
                    grid: clampGrid({ ...i.grid, w: action.w, h: action.h }),
                };
            });
            return {
                ...state,
                layout: { ...state.layout, items },
                isDirty: true,
            };
        }

        case "UPDATE_PARAMS": {
            const items = state.layout.items.map((i) => {
                if (i.id !== action.widgetId) return i;
                return { ...i, params: action.params };
            });
            return {
                ...state,
                layout: { ...state.layout, items },
                isDirty: true,
            };
        }

        case "DELETE_WIDGET": {
            const items = state.layout.items.filter((i) => i.id !== action.widgetId);
            return {
                ...state,
                layout: { ...state.layout, items },
                selectedWidgetId:
                    state.selectedWidgetId === action.widgetId ? null : state.selectedWidgetId,
                isDirty: true,
            };
        }

        case "DUPLICATE_WIDGET": {
            const source = state.layout.items.find((i) => i.id === action.widgetId);
            if (!source) return state;

            const newGrid = findAvailableSlot(state.layout.items, source.grid.w, source.grid.h);
            const clone: LayoutItem = {
                id: crypto.randomUUID().slice(0, 10),
                widget_type: source.widget_type,
                params: { ...source.params },
                grid: newGrid,
            };
            return {
                ...state,
                layout: { ...state.layout, items: [...state.layout.items, clone] },
                selectedWidgetId: clone.id,
                isDirty: true,
            };
        }

        case "SELECT":
            return { ...state, selectedWidgetId: action.widgetId };

        case "SET_MODE":
            return { ...state, mode: action.mode, selectedWidgetId: null };

        case "MARK_SAVED":
            return { ...state, isDirty: false, lastSavedAt: action.savedAt, isSaving: false };

        case "RESET":
            return {
                ...state,
                layout: action.layout,
                isDirty: false,
                selectedWidgetId: null,
                lastSavedAt: null,
            };

        default:
            return state;
    }
}

// ─── History-Aware Reducer ──────────────────────────────────

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
    // Undo: pop from past, push current to future
    if (action.type === "UNDO") {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        return {
            ...state,
            layout: previous,
            past: state.past.slice(0, -1),
            future: [state.layout, ...state.future],
            isDirty: true,
            selectedWidgetId: null,
        };
    }

    // Redo: pop from future, push current to past
    if (action.type === "REDO") {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        return {
            ...state,
            layout: next,
            past: [...state.past, state.layout],
            future: state.future.slice(1),
            isDirty: true,
            selectedWidgetId: null,
        };
    }

    // INIT/RESET: clear history
    if (action.type === "INIT" || action.type === "RESET") {
        const newState = coreReducer(state, action);
        return { ...newState, past: [], future: [] };
    }

    // Layout-mutating actions: push to history before applying
    if (LAYOUT_MUTATING_ACTIONS.has(action.type)) {
        const newPast = [...state.past, state.layout].slice(-HISTORY_LIMIT);
        const newState = coreReducer(state, action);
        return { ...newState, past: newPast, future: [] };
    }

    // Non-mutating actions: pass through without history
    return coreReducer(state, action);
}

// ─── Hook ────────────────────────────────────────────────────

export function useDashboardEditor(dashboardId: string, initialLayout: DashboardLayout) {
    const [state, dispatch] = useReducer(editorReducer, {
        layout: initialLayout,
        past: [],
        future: [],
        selectedWidgetId: null,
        isDirty: false,
        mode: "edit" as const,
        lastSavedAt: null,
        isSaving: false,
    });

    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Auto-save debounced
    useEffect(() => {
        if (!state.isDirty) return;

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        saveTimerRef.current = setTimeout(async () => {
            // Cancel any in-flight save
            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            try {
                await saveDraftLayout(dashboardId, state.layout);
                dispatch({ type: "MARK_SAVED", savedAt: new Date() });
            } catch {
                // Save failed — keep dirty state, will retry on next change
            }
        }, 1000);

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [state.layout, state.isDirty, dashboardId]);

    const selectedWidget = state.layout.items.find((i) => i.id === state.selectedWidgetId) ?? null;

    const saveDraft = useCallback(async () => {
        try {
            await saveDraftLayout(dashboardId, state.layout);
            dispatch({ type: "MARK_SAVED", savedAt: new Date() });
        } catch {
            // Silent fail for now
        }
    }, [dashboardId, state.layout]);

    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    return {
        state,
        dispatch,
        selectedWidget,
        saveDraft,
        canUndo,
        canRedo,
    };
}
