"use client";

import type { DashboardLayout } from "@athyper/dashboard";
import { WidgetRenderer } from "./WidgetRenderer";
import { WidgetErrorBoundary } from "./WidgetErrorBoundary";
import { useBreakpoint, type Breakpoint } from "../../lib/hooks/use-breakpoint";

interface DashboardRendererProps {
    layout: DashboardLayout;
    messages?: Record<string, string>;
}

const GRID_CLASSES: Record<Breakpoint, string> = {
    mobile: "grid grid-cols-1 gap-3",
    tablet: "grid grid-cols-6 gap-3",
    desktop: "grid grid-cols-12 gap-4",
};

function getResponsiveStyle(
    breakpoint: Breakpoint,
    grid: { x: number; y: number; w: number; h: number },
    rowHeight: number,
) {
    if (breakpoint === "mobile") {
        // Full-width stacked layout, auto rows
        return { gridColumn: "1 / -1" };
    }
    if (breakpoint === "tablet") {
        // Clamp to 6-column grid
        const w = Math.min(grid.w, 6);
        const x = Math.min(grid.x, 6 - w);
        return {
            gridColumn: `${x + 1} / span ${w}`,
            gridRow: `${grid.y + 1} / span ${grid.h}`,
        };
    }
    // Desktop: full 12-column
    return {
        gridColumn: `${grid.x + 1} / span ${grid.w}`,
        gridRow: `${grid.y + 1} / span ${grid.h}`,
    };
}

export function DashboardRenderer({ layout, messages }: DashboardRendererProps) {
    const breakpoint = useBreakpoint();

    if (!layout.items || layout.items.length === 0) {
        return (
            <div role="status" className="flex items-center justify-center h-64 text-gray-400 text-sm">
                This dashboard has no widgets configured.
            </div>
        );
    }

    const rowHeight = layout.row_height ?? 80;

    return (
        <section role="region" aria-label="Dashboard widgets">
            <div
                className={GRID_CLASSES[breakpoint]}
                style={breakpoint !== "mobile" ? { gridAutoRows: `${rowHeight}px` } : undefined}
            >
                {layout.items.map((item) => (
                    <div
                        key={item.id}
                        style={getResponsiveStyle(breakpoint, item.grid, rowHeight)}
                    >
                        <WidgetErrorBoundary widgetId={item.id}>
                            <WidgetRenderer item={item} messages={messages} />
                        </WidgetErrorBoundary>
                    </div>
                ))}
            </div>
        </section>
    );
}
