"use client";

import { useRef, useState, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEditor } from "./EditorContext";
import { WidgetRenderer } from "../WidgetRenderer";
import type { LayoutItem } from "@athyper/dashboard";
import type { Breakpoint } from "../../../lib/hooks/use-breakpoint";

interface DraggableWidgetProps {
    item: LayoutItem;
    breakpoint: Breakpoint;
}

export function DraggableWidget({ item, breakpoint }: DraggableWidgetProps) {
    const { state, dispatch, openConfig } = useEditor();
    const isSelected = state.selectedWidgetId === item.id;
    const [isResizing, setIsResizing] = useState(false);
    const [resizePreview, setResizePreview] = useState<{ w: number; h: number } | null>(null);
    const resizeStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
    const isMobile = breakpoint === "mobile";

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: {
            source: "canvas",
            item,
        },
        disabled: isResizing,
    });

    // Use preview dimensions during resize, otherwise actual grid dimensions
    const displayW = resizePreview?.w ?? item.grid.w;
    const displayH = resizePreview?.h ?? item.grid.h;

    // On mobile, use simplified grid (4 cols, full-width clamp)
    const maxCols = isMobile ? 4 : 12;
    const effectiveW = isMobile ? Math.min(displayW, maxCols) : displayW;
    const effectiveX = isMobile ? Math.min(item.grid.x, maxCols - effectiveW) : item.grid.x;

    const style = {
        gridColumn: `${effectiveX + 1} / span ${effectiveW}`,
        gridRow: `${item.grid.y + 1} / span ${displayH}`,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : isSelected ? 10 : 1,
    };

    const handleResizeStart = useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation();
            e.preventDefault();
            setIsResizing(true);

            const target = e.currentTarget as HTMLElement;
            const canvasEl = target.closest("[data-editor-canvas]") as HTMLElement | null;
            if (!canvasEl) return;

            const canvasRect = canvasEl.getBoundingClientRect();
            const colWidth = canvasRect.width / maxCols;
            const rowHeight = parseInt(getComputedStyle(canvasEl).gridAutoRows) || 80;

            resizeStartRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                startW: item.grid.w,
                startH: item.grid.h,
            };

            const handleMove = (moveE: PointerEvent) => {
                if (!resizeStartRef.current) return;
                const dx = moveE.clientX - resizeStartRef.current.startX;
                const dy = moveE.clientY - resizeStartRef.current.startY;

                const newW = Math.max(1, Math.min(maxCols - item.grid.x, resizeStartRef.current.startW + Math.round(dx / colWidth)));
                const newH = Math.max(1, resizeStartRef.current.startH + Math.round(dy / rowHeight));

                setResizePreview({ w: newW, h: newH });
            };

            const handleUpWithDispatch = (upE: PointerEvent) => {
                if (resizeStartRef.current) {
                    const dx = upE.clientX - resizeStartRef.current.startX;
                    const dy = upE.clientY - resizeStartRef.current.startY;

                    const finalW = Math.max(1, Math.min(maxCols - item.grid.x, resizeStartRef.current.startW + Math.round(dx / colWidth)));
                    const finalH = Math.max(1, resizeStartRef.current.startH + Math.round(dy / rowHeight));

                    if (finalW !== item.grid.w || finalH !== item.grid.h) {
                        dispatch({ type: "RESIZE_WIDGET", widgetId: item.id, w: finalW, h: finalH });
                    }
                }
                setIsResizing(false);
                resizeStartRef.current = null;
                setResizePreview(null);
                window.removeEventListener("pointermove", handleMove);
                window.removeEventListener("pointerup", handleUpWithDispatch);
            };

            window.addEventListener("pointermove", handleMove);
            window.addEventListener("pointerup", handleUpWithDispatch);
        },
        [item.grid.x, item.grid.w, item.grid.h, item.id, dispatch, maxCols],
    );

    // On mobile, always show action buttons (no hover-only); on desktop, hover/focus reveal
    const actionVisibility = isMobile
        ? "opacity-100"
        : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100";

    // Touch-friendly button size on mobile
    const btnClass = isMobile
        ? "rounded bg-white/80 p-2.5 shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
        : "rounded bg-white/80 p-1 shadow-sm";

    return (
        <div
            ref={setNodeRef}
            style={style}
            tabIndex={0}
            className={`relative group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""} ${resizePreview ? "ring-2 ring-blue-300" : ""}`}
            onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "SELECT", widgetId: item.id });
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    dispatch({ type: "SELECT", widgetId: item.id });
                    openConfig(item.id);
                }
            }}
            aria-label={`Widget: ${item.widget_type}`}
        >
            {/* Drag handle */}
            <div
                {...listeners}
                {...attributes}
                className={`absolute top-1 left-1 z-20 ${actionVisibility} transition-opacity cursor-grab active:cursor-grabbing ${isMobile ? "rounded bg-white/80 p-2 shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center" : "rounded bg-white/80 p-0.5 shadow-sm"}`}
                aria-label="Drag to reposition widget"
                aria-roledescription="draggable"
                title="Drag to move"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="8" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="8" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="8" cy="18" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="18" r="1.5" fill="currentColor" />
                </svg>
            </div>

            {/* Action buttons */}
            <div className={`absolute top-1 right-1 z-20 ${actionVisibility} transition-opacity flex gap-1`}>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        openConfig(item.id);
                    }}
                    className={`${btnClass} text-gray-500 hover:text-blue-600`}
                    aria-label="Configure widget"
                    title="Configure"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "DUPLICATE_WIDGET", widgetId: item.id });
                    }}
                    className={`${btnClass} text-gray-500 hover:text-blue-600`}
                    aria-label="Duplicate widget"
                    title="Duplicate"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "DELETE_WIDGET", widgetId: item.id });
                    }}
                    className={`${btnClass} text-gray-500 hover:text-red-600`}
                    aria-label="Delete widget"
                    title="Delete"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                </button>
            </div>

            {/* Widget content */}
            <div className="h-full overflow-hidden pointer-events-none">
                <WidgetRenderer item={item} />
            </div>

            {/* Resize handle (bottom-right corner) — larger touch area on mobile */}
            <div
                onPointerDown={handleResizeStart}
                className={`absolute bottom-0 right-0 cursor-se-resize ${actionVisibility} transition-opacity z-20 ${
                    isMobile ? "w-11 h-11 flex items-center justify-end pb-0.5 pr-0.5" : "w-4 h-4"
                }`}
                aria-label="Resize widget"
                title="Drag to resize"
            >
                <svg width="14" height="14" viewBox="0 0 14 14" className="text-gray-400" aria-hidden="true">
                    <path d="M12 2L2 12M12 6L6 12M12 10L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>
        </div>
    );
}
