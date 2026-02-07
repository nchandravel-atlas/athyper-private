"use client";

import { Card } from "@neon/ui";
import { useWidgetCount } from "../../../lib/dashboard/use-widget-data";

interface KpiWidgetProps {
    params: {
        label_key: string;
        query_key: string;
        format: "number" | "currency" | "percent";
        trend_query_key?: string;
        currency_code?: string;
        refresh_interval?: number;
    };
    resolvedLabel?: string;
}

function formatValue(value: number | null, format: string, currencyCode?: string): string {
    if (value === null || value === undefined) return "--";

    switch (format) {
        case "currency":
            return new Intl.NumberFormat("en", {
                style: "currency",
                currency: currencyCode ?? "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        case "percent":
            return `${value.toFixed(1)}%`;
        default:
            return new Intl.NumberFormat("en").format(value);
    }
}

export function KpiWidget({ params, resolvedLabel }: KpiWidgetProps) {
    const label = resolvedLabel ?? params.label_key;
    const refreshInterval = params.refresh_interval ?? 30000;
    const { count, loading, refreshing, error, reload } = useWidgetCount(params.query_key, {
        refreshInterval,
    });
    const trend = useWidgetCount(params.trend_query_key ?? null, { refreshInterval });

    // Compute trend delta when both values are available
    let trendDelta: number | null = null;
    if (count !== null && trend.count !== null && trend.count !== 0) {
        trendDelta = ((count - trend.count) / trend.count) * 100;
    }

    return (
        <Card>
            <div className="group flex flex-col h-full p-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {label}
                        {refreshing && (
                            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
                        )}
                    </p>
                    <button
                        type="button"
                        onClick={reload}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                        aria-label="Refresh KPI data"
                        title="Refresh"
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M1 1v5h5M15 15v-5h-5" />
                            <path d="M13.5 6A6 6 0 0 0 3 3.5L1 6M2.5 10a6 6 0 0 0 10.5 2.5L15 10" />
                        </svg>
                    </button>
                </div>

                <div aria-live="polite" aria-atomic="true">
                    {loading ? (
                        <div className="mt-2 h-8 w-24 bg-gray-200 rounded animate-pulse" />
                    ) : error ? (
                        <p className="mt-2 text-sm text-red-500">Failed to load</p>
                    ) : (
                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {formatValue(count, params.format, params.currency_code)}
                        </p>
                    )}
                </div>

                {trendDelta !== null && (
                    <p className={`mt-1 text-xs ${trendDelta >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {trendDelta >= 0 ? "\u2191" : "\u2193"} {Math.abs(trendDelta).toFixed(1)}%
                    </p>
                )}
            </div>
        </Card>
    );
}
