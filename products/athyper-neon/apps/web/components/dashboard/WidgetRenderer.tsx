"use client";

import type { LayoutItem } from "@athyper/dashboard";
import { HeadingWidget } from "./widgets/HeadingWidget";
import { SpacerWidget } from "./widgets/SpacerWidget";
import { ShortcutWidget } from "./widgets/ShortcutWidget";
import { KpiWidget } from "./widgets/KpiWidget";
import { ListWidget } from "./widgets/ListWidget";
import { ChartWidget } from "./widgets/ChartWidget";
import { UnknownWidget } from "./widgets/UnknownWidget";

interface WidgetRendererProps {
    item: LayoutItem;
    messages?: Record<string, string>;
}

function resolveMessage(key: string | undefined, messages?: Record<string, string>): string | undefined {
    if (!key || !messages) return undefined;
    return messages[key];
}

export function WidgetRenderer({ item, messages }: WidgetRendererProps) {
    const { widget_type, params, id } = item;

    switch (widget_type) {
        case "heading":
            return (
                <HeadingWidget
                    params={params as { text_key: string; level: "h1" | "h2" | "h3" | "h4" }}
                    resolvedText={resolveMessage((params as { text_key?: string }).text_key, messages)}
                />
            );

        case "spacer":
            return <SpacerWidget params={params as { height: "sm" | "md" | "lg" }} />;

        case "shortcut":
            return (
                <ShortcutWidget
                    params={params as { label_key: string; href: string; icon?: string; description_key?: string }}
                    resolvedLabel={resolveMessage((params as { label_key?: string }).label_key, messages)}
                    resolvedDescription={resolveMessage((params as { description_key?: string }).description_key, messages)}
                />
            );

        case "kpi":
            return (
                <KpiWidget
                    params={params as { label_key: string; query_key: string; format: "number" | "currency" | "percent"; trend_query_key?: string; currency_code?: string; refresh_interval?: number }}
                    resolvedLabel={resolveMessage((params as { label_key?: string }).label_key, messages)}
                />
            );

        case "list":
            return (
                <ListWidget
                    params={params as { title_key: string; query_key: string; columns: string[]; page_size: number; link_template?: string; refresh_interval?: number }}
                    resolvedTitle={resolveMessage((params as { title_key?: string }).title_key, messages)}
                />
            );

        case "chart":
            return (
                <ChartWidget
                    params={params as { title_key: string; query_key: string; chart_type: "bar" | "line" | "area" | "pie"; config?: Record<string, unknown>; refresh_interval?: number }}
                    resolvedTitle={resolveMessage((params as { title_key?: string }).title_key, messages)}
                />
            );

        default:
            return <UnknownWidget widgetType={widget_type} widgetId={id} />;
    }
}
