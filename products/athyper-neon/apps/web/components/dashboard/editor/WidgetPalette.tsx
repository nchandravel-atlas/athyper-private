"use client";

import { useDraggable } from "@dnd-kit/core";
import { WIDGET_TYPES } from "@athyper/dashboard";

const WIDGET_DEFINITIONS = [
    { type: WIDGET_TYPES.HEADING, label: "Heading", description: "Section header", icon: "H", defaultW: 12, defaultH: 1 },
    { type: WIDGET_TYPES.SPACER, label: "Spacer", description: "Vertical space", icon: "\u2195", defaultW: 12, defaultH: 1 },
    { type: WIDGET_TYPES.SHORTCUT, label: "Shortcut", description: "Quick-link card", icon: "\u2197", defaultW: 3, defaultH: 2 },
    { type: WIDGET_TYPES.KPI, label: "KPI", description: "Number card", icon: "#", defaultW: 3, defaultH: 2 },
    { type: WIDGET_TYPES.LIST, label: "List", description: "Table view", icon: "\u2630", defaultW: 6, defaultH: 4 },
    { type: WIDGET_TYPES.CHART, label: "Chart", description: "Data visualization", icon: "\u2581\u2583\u2585\u2587", defaultW: 6, defaultH: 4 },
];

function PaletteItem({ type, label, description, icon, defaultW, defaultH }: typeof WIDGET_DEFINITIONS[number]) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${type}`,
        data: {
            source: "palette",
            widgetType: type,
            defaultW,
            defaultH,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-grab active:cursor-grabbing border border-transparent hover:border-gray-200 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${
                isDragging ? "opacity-50" : ""
            }`}
            aria-label={`Add ${label} widget`}
        >
            <span className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-600 text-sm font-mono" aria-hidden="true">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
        </div>
    );
}

interface WidgetPaletteProps {
    variant?: "sidebar" | "sheet";
}

export function WidgetPalette({ variant = "sidebar" }: WidgetPaletteProps) {
    if (variant === "sheet") {
        return (
            <div className="p-4" aria-label="Widget palette">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Widgets
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {WIDGET_DEFINITIONS.map((def) => (
                        <PaletteItem key={def.type} {...def} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <aside className="w-52 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto" aria-label="Widget palette">
            <div className="p-3 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Widgets
                </h3>
            </div>
            <div className="p-2 space-y-0.5">
                {WIDGET_DEFINITIONS.map((def) => (
                    <PaletteItem key={def.type} {...def} />
                ))}
            </div>
        </aside>
    );
}
