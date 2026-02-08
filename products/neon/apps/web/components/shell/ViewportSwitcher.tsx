"use client";

// components/shell/ViewportSwitcher.tsx
//
// Toggle between Desktop / Tablet / Mobile viewport preview.
// Only rendered when NODE_ENV === "development".
// Applies inline styles directly to the sidebar-inset element for reliable width constraining.

import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useCallback, useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTHS: Record<Viewport, number | null> = {
    desktop: null,
    tablet: 768,
    mobile: 375,
};

const VIEWPORTS: { value: Viewport; icon: typeof Monitor; label: string }[] = [
    { value: "desktop", icon: Monitor, label: "Desktop" },
    { value: "tablet", icon: Tablet, label: "Tablet (768px)" },
    { value: "mobile", icon: Smartphone, label: "Mobile (375px)" },
];

function applyViewport(viewport: Viewport) {
    const inset = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]');
    if (!inset) return;

    const width = VIEWPORT_WIDTHS[viewport];

    if (width === null) {
        // Desktop — remove all viewport constraints
        inset.style.removeProperty("max-width");
        inset.style.removeProperty("margin-left");
        inset.style.removeProperty("margin-right");
        inset.style.removeProperty("border-left");
        inset.style.removeProperty("border-right");
        inset.style.removeProperty("transition");
        inset.style.removeProperty("container-type");
    } else {
        // Tablet or Mobile — constrain and center
        inset.style.setProperty("max-width", `${width}px`, "important");
        inset.style.setProperty("margin-left", "auto", "important");
        inset.style.setProperty("margin-right", "auto", "important");
        inset.style.setProperty("border-left", "1px dashed oklch(0.7 0 0 / 30%)");
        inset.style.setProperty("border-right", "1px dashed oklch(0.7 0 0 / 30%)");
        inset.style.setProperty("transition", "max-width 0.3s ease");
        // Enable container queries so child grids respond to container width
        inset.style.setProperty("container-type", "inline-size");
    }
}

export function ViewportSwitcher() {
    const [viewport, setViewport] = useState<Viewport>("desktop");

    if (process.env.NODE_ENV !== "development") {
        return null;
    }

    const handleChange = useCallback((value: string) => {
        if (!value) return; // prevent deselection
        const v = value as Viewport;
        setViewport(v);
        applyViewport(v);
    }, []);

    return (
        <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={viewport}
            onValueChange={handleChange}
            className="h-7"
        >
            {VIEWPORTS.map(({ value, icon: Icon, label }) => (
                <Tooltip key={value}>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem
                            value={value}
                            className="size-7 p-0"
                        >
                            <Icon className="size-3.5" />
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                </Tooltip>
            ))}
        </ToggleGroup>
    );
}
