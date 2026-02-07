"use client";

import { useEffect } from "react";
import type { Dispatch } from "react";
import type { EditorAction } from "./use-dashboard-editor";
import type { DashboardLayout } from "@athyper/dashboard";

/**
 * Registers global keyboard shortcuts for the dashboard editor.
 *
 * Ctrl+S       — Save draft
 * Ctrl+Z       — Undo
 * Ctrl+Shift+Z — Redo
 * Ctrl+Y       — Redo (alternative)
 * Delete       — Delete selected widget
 * Backspace    — Delete selected widget
 * Ctrl+D       — Duplicate selected widget
 * Escape       — Deselect
 * ArrowUp/Down/Left/Right — Move selected widget by 1 grid unit
 * Enter        — Open config panel for selected widget
 */
export function useEditorShortcuts(
    dispatch: Dispatch<EditorAction>,
    selectedWidgetId: string | null,
    saveDraft: () => Promise<void>,
    layout?: DashboardLayout,
    openConfig?: (widgetId: string) => void,
) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Skip if focus is inside a form element
            const tag = (e.target as HTMLElement).tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

            const ctrl = e.ctrlKey || e.metaKey;

            // Ctrl+S — Save
            if (ctrl && e.key === "s") {
                e.preventDefault();
                saveDraft();
                return;
            }

            // Ctrl+Shift+Z or Ctrl+Y — Redo
            if (ctrl && ((e.shiftKey && e.key === "z") || (e.shiftKey && e.key === "Z") || e.key === "y")) {
                e.preventDefault();
                dispatch({ type: "REDO" });
                return;
            }

            // Ctrl+Z — Undo (check after Ctrl+Shift+Z so shift variant is handled first)
            if (ctrl && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
                e.preventDefault();
                dispatch({ type: "UNDO" });
                return;
            }

            // Ctrl+D — Duplicate selected widget
            if (ctrl && (e.key === "d" || e.key === "D") && selectedWidgetId) {
                e.preventDefault();
                dispatch({ type: "DUPLICATE_WIDGET", widgetId: selectedWidgetId });
                return;
            }

            // Delete / Backspace — Delete selected widget
            if ((e.key === "Delete" || e.key === "Backspace") && selectedWidgetId && !ctrl) {
                e.preventDefault();
                dispatch({ type: "DELETE_WIDGET", widgetId: selectedWidgetId });
                return;
            }

            // Escape — Deselect
            if (e.key === "Escape") {
                e.preventDefault();
                dispatch({ type: "SELECT", widgetId: null });
                return;
            }

            // Enter — Open config panel for selected widget
            if (e.key === "Enter" && selectedWidgetId && openConfig && !ctrl) {
                e.preventDefault();
                openConfig(selectedWidgetId);
                return;
            }

            // Arrow keys — Move selected widget by 1 grid unit
            if (selectedWidgetId && layout && !ctrl) {
                const item = layout.items.find((i) => i.id === selectedWidgetId);
                if (!item) return;

                let dx = 0;
                let dy = 0;

                switch (e.key) {
                    case "ArrowLeft":  dx = -1; break;
                    case "ArrowRight": dx = 1;  break;
                    case "ArrowUp":    dy = -1; break;
                    case "ArrowDown":  dy = 1;  break;
                    default: return;
                }

                e.preventDefault();
                dispatch({
                    type: "MOVE_WIDGET",
                    widgetId: selectedWidgetId,
                    grid: {
                        x: item.grid.x + dx,
                        y: item.grid.y + dy,
                        w: item.grid.w,
                        h: item.grid.h,
                    },
                });
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dispatch, selectedWidgetId, saveDraft, layout, openConfig]);
}
