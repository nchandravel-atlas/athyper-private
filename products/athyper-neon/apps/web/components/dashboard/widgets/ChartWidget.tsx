"use client";

import { useMemo } from "react";
import {
    BarChart, Bar,
    LineChart, Line,
    AreaChart, Area,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card } from "@neon/ui";
import { useWidgetData } from "../../../lib/dashboard/use-widget-data";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../../ui/chart";

interface ChartWidgetProps {
    params: {
        title_key: string;
        query_key: string;
        chart_type: "bar" | "line" | "area" | "pie";
        config?: Record<string, unknown>;
        refresh_interval?: number;
    };
    resolvedTitle?: string;
}

const CHART_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

/**
 * Auto-detect axis fields from data if not specified in config.
 * X axis: first string/date field. Y axis: first number field.
 */
function detectAxes(
    data: Record<string, unknown>[],
    config?: Record<string, unknown>,
): { xKey: string; yKeys: string[] } {
    const explicitX = config?.xAxis as string | undefined;
    const explicitY = config?.yAxis as string | string[] | undefined;

    if (explicitX && explicitY) {
        return {
            xKey: explicitX,
            yKeys: Array.isArray(explicitY) ? explicitY : [explicitY],
        };
    }

    const sample = data[0] ?? {};
    let xKey = explicitX ?? "";
    const yKeys: string[] = [];

    for (const [key, value] of Object.entries(sample)) {
        if (key === "id" || key === "tenant_id") continue;

        if (!xKey && (typeof value === "string" || value instanceof Date)) {
            xKey = key;
        } else if (typeof value === "number") {
            yKeys.push(key);
        }
    }

    if (explicitY) {
        return { xKey, yKeys: Array.isArray(explicitY) ? explicitY : [explicitY] };
    }

    return { xKey: xKey || "name", yKeys: yKeys.length > 0 ? yKeys : ["value"] };
}

export function ChartWidget({ params, resolvedTitle }: ChartWidgetProps) {
    const title = resolvedTitle ?? params.title_key;
    const refreshInterval = params.refresh_interval ?? 60000;
    const { data, loading, refreshing, error, reload } = useWidgetData(params.query_key, {
        pageSize: 100,
        refreshInterval,
    });

    const { xKey, yKeys } = useMemo(() => {
        if (!data || data.length === 0) return { xKey: "name", yKeys: ["value"] };
        return detectAxes(data, params.config);
    }, [data, params.config]);

    const chartConfig = useMemo<ChartConfig>(() => {
        const cfg: ChartConfig = {};
        yKeys.forEach((key, i) => {
            cfg[key] = {
                label: key.replace(/_/g, " "),
                color: CHART_COLORS[i % CHART_COLORS.length],
            };
        });
        return cfg;
    }, [yKeys]);

    return (
        <Card>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                        {refreshing && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            {params.chart_type}
                        </span>
                        <button
                            type="button"
                            onClick={reload}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Refresh chart data"
                            title="Refresh"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M1 1v5h5M15 15v-5h-5" />
                                <path d="M13.5 6A6 6 0 0 0 3 3.5L1 6M2.5 10a6 6 0 0 0 10.5 2.5L15 10" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-4 min-h-[200px]" aria-label={title} role="img">
                    <div role="status" aria-live="polite">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="h-32 w-full bg-gray-100 rounded animate-pulse" />
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        ) : !data || data.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-xs text-gray-400">No data available</p>
                            </div>
                        ) : null}
                    </div>
                    {data && data.length > 0 && !loading && !error && (
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            {renderChart(params.chart_type, data, xKey, yKeys)}
                        </ChartContainer>
                    )}
                </div>
            </div>
        </Card>
    );
}

function renderChart(
    chartType: string,
    data: Record<string, unknown>[],
    xKey: string,
    yKeys: string[],
): React.ReactElement {
    const tooltipContent = <ChartTooltipContent />;

    switch (chartType) {
        case "bar":
            return (
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={xKey} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <ChartTooltip content={tooltipContent} />
                    {yKeys.map((key, i) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </BarChart>
            );

        case "line":
            return (
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={xKey} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <ChartTooltip content={tooltipContent} />
                    {yKeys.map((key, i) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            );

        case "area":
            return (
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={xKey} fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <ChartTooltip content={tooltipContent} />
                    {yKeys.map((key, i) => (
                        <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                            fillOpacity={0.2}
                        />
                    ))}
                </AreaChart>
            );

        case "pie":
            return (
                <PieChart>
                    <ChartTooltip content={tooltipContent} />
                    <Pie
                        data={data}
                        dataKey={yKeys[0]}
                        nameKey={xKey}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        label
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            );

        default:
            return (
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xKey} fontSize={11} />
                    <YAxis fontSize={11} />
                    <ChartTooltip content={tooltipContent} />
                    {yKeys.map((key, i) => (
                        <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                </BarChart>
            );
    }
}
