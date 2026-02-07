"use client";

import { useDroppable } from "@dnd-kit/core";
import { useEditor } from "./EditorContext";
import { DraggableWidget } from "./DraggableWidget";
import { DashboardRenderer } from "../DashboardRenderer";
import { useMessages } from "../../../lib/i18n/messages-context";
import type { Breakpoint } from "../../../lib/hooks/use-breakpoint";

interface EditorCanvasProps {
    breakpoint: Breakpoint;
}

export function EditorCanvas({ breakpoint }: EditorCanvasProps) {
    const { state, dispatch } = useEditor();
    const { messages } = useMessages();
    const { setNodeRef, isOver } = useDroppable({ id: "editor-canvas" });
    const isMobile = breakpoint === "mobile";

    const rowHeight = state.layout.row_height ?? 80;
    const gridCols = isMobile ? "grid-cols-4" : "grid-cols-12";
    const gridColCount = isMobile ? 4 : 12;

    return (
        <div
            className={`flex-1 overflow-auto bg-gray-50 ${isMobile ? "p-3" : "p-6"}`}
            onClick={state.mode === "edit" ? () => dispatch({ type: "SELECT", widgetId: null }) : undefined}
        >
            <div className="transition-opacity duration-200">
                {state.mode === "preview" ? (
                    <DashboardRenderer layout={state.layout} messages={messages} />
                ) : (
                    <div
                        ref={setNodeRef}
                        data-editor-canvas
                        role="application"
                        aria-label="Dashboard editor canvas"
                        className={`grid ${gridCols} gap-4 ${isMobile ? "min-h-[300px]" : "min-h-[600px]"} relative ${
                            isOver ? "ring-2 ring-blue-300 ring-inset" : ""
                        }`}
                        style={{ gridAutoRows: `${rowHeight}px` }}
                    >
                        {/* Grid guide lines (subtle) */}
                        <div className={`absolute inset-0 grid ${gridCols} gap-4 pointer-events-none`} aria-hidden>
                            {Array.from({ length: gridColCount }, (_, i) => (
                                <div key={i} className="border-x border-dashed border-gray-200/50 h-full" />
                            ))}
                        </div>

                        {/* Widgets */}
                        {state.layout.items.map((item) => (
                            <DraggableWidget key={item.id} item={item} breakpoint={breakpoint} />
                        ))}

                        {/* Empty state */}
                        {state.layout.items.length === 0 && (
                            <div className={`${isMobile ? "col-span-4" : "col-span-12"} row-span-4 flex items-center justify-center text-gray-400 text-sm`}>
                                {isMobile ? "Tap + to add widgets" : "Drag widgets from the palette to get started"}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
