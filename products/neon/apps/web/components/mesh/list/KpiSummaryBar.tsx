"use client";

// components/mesh/list/KpiSummaryBar.tsx
//
// Zone 2 — Responsive row of clickable KPI metric cards.

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useListPage, useListPageActions } from "./ListPageContext";
import type { KpiVariant } from "./types";

const VARIANT_STYLES: Record<KpiVariant, string> = {
    default: "border-border hover:border-primary/30",
    warning: "border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20",
    critical: "border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-950/20",
};

const VARIANT_VALUE_STYLES: Record<KpiVariant, string> = {
    default: "text-foreground",
    warning: "text-amber-700 dark:text-amber-300",
    critical: "text-red-700 dark:text-red-300",
};

function formatKpiValue(value: number | string, format?: "number" | "currency" | "percent"): string {
    if (typeof value === "string") return value;
    switch (format) {
        case "currency":
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
            }).format(value);
        case "percent":
            return `${value}%`;
        default:
            return new Intl.NumberFormat("en-US").format(value);
    }
}

export function KpiSummaryBar<T>() {
    const { config, allItems } = useListPage<T>();
    const actions = useListPageActions();

    if (!config.kpis || config.kpis.length === 0) return null;

    return (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {config.kpis.map((kpi) => {
                const rawValue = kpi.compute(allItems);
                const numericValue = typeof rawValue === "number" ? rawValue : 0;
                const variant =
                    kpi.variantFn?.(numericValue) ?? kpi.variant ?? "default";
                const displayValue = formatKpiValue(rawValue, kpi.format);
                const isClickable = !!kpi.filterOnClick;

                return (
                    <Card
                        key={kpi.id}
                        className={cn(
                            "transition-all",
                            VARIANT_STYLES[variant],
                            isClickable && "cursor-pointer hover:shadow-md",
                        )}
                        onClick={
                            isClickable
                                ? () => actions.setFilters(kpi.filterOnClick!)
                                : undefined
                        }
                    >
                        <CardContent className="flex items-center gap-3 p-3">
                            <div className="rounded-md bg-muted p-2">
                                <kpi.icon className="size-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className={cn("text-xl font-bold tabular-nums", VARIANT_VALUE_STYLES[variant])}>
                                    {displayValue}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {kpi.label}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
