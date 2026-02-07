"use client";

import { useState, useCallback } from "react";
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { DashboardLayout, GridPosition, LayoutItem } from "@athyper/dashboard";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@neon/ui";
import { useDashboardEditor } from "../../../lib/dashboard/use-dashboard-editor";
import { findAvailableSlot } from "../../../lib/dashboard/grid-utils";
import { useEditorShortcuts } from "../../../lib/dashboard/use-editor-shortcuts";
import { useBreakpoint } from "../../../lib/hooks/use-breakpoint";
import { EditorContext } from "./EditorContext";
import { EditorToolbar } from "./EditorToolbar";
import { WidgetPalette } from "./WidgetPalette";
import { EditorCanvas } from "./EditorCanvas";
import { WidgetConfigPanel } from "./WidgetConfigPanel";
import { UnsavedChangesGuard } from "./UnsavedChangesGuard";

// Default params for each widget type when adding from palette
const DEFAULT_PARAMS: Record<string, Record<string, unknown>> = {
    heading: { text_key: "New Heading", level: "h2" },
    spacer: { height: "md" },
    shortcut: { label_key: "Shortcut", href: "/", icon: "", description_key: "" },
    kpi: { label_key: "KPI Label", query_key: "module.metric", format: "number" },
    list: { title_key: "List Title", query_key: "module.query", columns: ["col1", "col2"], page_size: 5 },
    chart: { title_key: "Chart Title", query_key: "module.query", chart_type: "bar" },
};

interface DashboardEditorProps {
    dashboardId: string;
    initialLayout: DashboardLayout;
    workbench: string;
}

export function DashboardEditor({ dashboardId, initialLayout, workbench }: DashboardEditorProps) {
    const { state, dispatch, selectedWidget, saveDraft, canUndo, canRedo } = useDashboardEditor(dashboardId, initialLayout);
    const [configWidgetId, setConfigWidgetId] = useState<string | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor),
    );

    const openConfig = useCallback((widgetId: string) => {
        setConfigWidgetId(widgetId);
    }, []);

    // Keyboard shortcuts (active in edit mode)
    useEditorShortcuts(dispatch, state.selectedWidgetId, saveDraft, state.layout, openConfig);

    function handleDragStart(event: DragStartEvent) {
        setActiveDragId(event.active.id as string);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveDragId(null);
        const { active, over } = event;

        if (!over) return;

        const sourceData = active.data.current;
        if (!sourceData) return;

        if (sourceData.source === "palette") {
            // Adding new widget from palette
            const widgetType = sourceData.widgetType as string;
            const defaultW = (sourceData.defaultW as number) ?? 3;
            const defaultH = (sourceData.defaultH as number) ?? 2;

            const grid = findAvailableSlot(state.layout.items, defaultW, defaultH);
            const params = DEFAULT_PARAMS[widgetType] ?? {};

            dispatch({ type: "ADD_WIDGET", widgetType, grid, params });
            // Close palette sheet on mobile after adding
            if (isMobile) setPaletteOpen(false);
        } else if (sourceData.source === "canvas") {
            // Moving existing widget — convert pixel delta to grid units
            const item = sourceData.item as LayoutItem;
            const { delta } = event;
            if (!delta) return;

            const canvasEl = document.querySelector("[data-editor-canvas]") as HTMLElement | null;
            if (!canvasEl) return;

            const canvasRect = canvasEl.getBoundingClientRect();
            const colWidth = canvasRect.width / 12;
            const rowHeight = parseInt(getComputedStyle(canvasEl).gridAutoRows) || 80;

            const dx = Math.round(delta.x / colWidth);
            const dy = Math.round(delta.y / rowHeight);

            if (dx === 0 && dy === 0) return;

            const newGrid: GridPosition = {
                x: item.grid.x + dx,
                y: item.grid.y + dy,
                w: item.grid.w,
                h: item.grid.h,
            };

            dispatch({ type: "MOVE_WIDGET", widgetId: item.id, grid: newGrid });
        }
    }

    return (
        <EditorContext.Provider
            value={{
                state,
                dispatch,
                selectedWidget,
                openConfig,
                dashboardId,
                canUndo,
                canRedo,
            }}
        >
            <UnsavedChangesGuard isDirty={state.isDirty} />

            <div className="flex flex-col h-screen bg-white">
                <EditorToolbar workbench={workbench} breakpoint={breakpoint} />

                <div className="flex flex-1 overflow-hidden">
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Desktop/Tablet: sidebar palette */}
                        {state.mode === "edit" && !isMobile && <WidgetPalette />}

                        <EditorCanvas breakpoint={breakpoint} />

                        <DragOverlay>
                            {activeDragId?.startsWith("palette-") && (
                                <div className="rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 px-4 py-3 text-sm text-blue-600 opacity-80">
                                    {activeDragId.replace("palette-", "")}
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>

                {/* Mobile: FAB to open palette sheet */}
                {state.mode === "edit" && isMobile && (
                    <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
                                aria-label="Add widget"
                            >
                                +
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="max-h-[60vh]">
                            <SheetHeader>
                                <SheetTitle>Add Widget</SheetTitle>
                                <SheetDescription>Drag a widget onto the canvas</SheetDescription>
                            </SheetHeader>
                            <WidgetPalette variant="sheet" />
                        </SheetContent>
                    </Sheet>
                )}
            </div>

            {/* Config panel */}
            {configWidgetId && (
                <WidgetConfigPanel
                    widgetId={configWidgetId}
                    onClose={() => setConfigWidgetId(null)}
                />
            )}
        </EditorContext.Provider>
    );
}
