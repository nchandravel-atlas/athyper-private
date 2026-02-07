"use client";

import { useState } from "react";
import { Card, Button } from "@neon/ui";
import { useWidgetData } from "../../../lib/dashboard/use-widget-data";
import { useBreakpoint } from "../../../lib/hooks/use-breakpoint";

interface ListWidgetProps {
    params: {
        title_key: string;
        query_key: string;
        columns: string[];
        page_size: number;
        link_template?: string;
        refresh_interval?: number;
    };
    resolvedTitle?: string;
}

function resolveLinkTemplate(template: string, record: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (_, field) => String(record[field] ?? ""));
}

export function ListWidget({ params, resolvedTitle }: ListWidgetProps) {
    const title = resolvedTitle ?? params.title_key;
    const [page, setPage] = useState(1);
    const refreshInterval = params.refresh_interval ?? 60000;
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    const { data, meta, loading, refreshing, error, reload } = useWidgetData(params.query_key, {
        page,
        pageSize: params.page_size,
        refreshInterval,
    });

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
                        {meta && (
                            <span className="text-xs text-gray-400">
                                {meta.total} total
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={reload}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Refresh list data"
                            title="Refresh"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M1 1v5h5M15 15v-5h-5" />
                                <path d="M13.5 6A6 6 0 0 0 3 3.5L1 6M2.5 10a6 6 0 0 0 10.5 2.5L15 10" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {isMobile ? (
                        /* Mobile: card/stack layout */
                        <div className="p-3 space-y-3">
                            {loading ? (
                                Array.from({ length: Math.min(params.page_size, 3) }).map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                                ))
                            ) : error ? (
                                <p className="py-6 text-center text-sm text-red-500">{error}</p>
                            ) : !data || data.length === 0 ? (
                                <p className="py-6 text-center text-xs text-gray-400">No data available</p>
                            ) : (
                                data.map((record, rowIdx) => (
                                    <dl key={rowIdx} className="rounded-md border border-gray-100 p-3 space-y-1.5">
                                        {params.columns.map((col, colIdx) => {
                                            const cellValue = String(record[col] ?? "");
                                            const isFirstCol = colIdx === 0;
                                            const hasLink = isFirstCol && params.link_template;

                                            return (
                                                <div key={col} className="flex justify-between gap-2">
                                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">
                                                        {col}
                                                    </dt>
                                                    <dd className="text-xs text-gray-700 text-right truncate">
                                                        {hasLink ? (
                                                            <a
                                                                href={resolveLinkTemplate(params.link_template!, record)}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {cellValue}
                                                            </a>
                                                        ) : (
                                                            cellValue
                                                        )}
                                                    </dd>
                                                </div>
                                            );
                                        })}
                                    </dl>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Desktop/Tablet: table layout */
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {params.columns.map((col) => (
                                        <th
                                            key={col}
                                            className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wide"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: Math.min(params.page_size, 5) }).map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50">
                                            {params.columns.map((col) => (
                                                <td key={col} className="px-3 py-2">
                                                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : error ? (
                                    <tr>
                                        <td
                                            colSpan={params.columns.length}
                                            className="px-3 py-6 text-center text-red-500"
                                        >
                                            {error}
                                        </td>
                                    </tr>
                                ) : !data || data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={params.columns.length}
                                            className="px-3 py-6 text-center text-gray-400"
                                        >
                                            No data available
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((record, rowIdx) => (
                                        <tr key={rowIdx} className="border-b border-gray-50 hover:bg-gray-50">
                                            {params.columns.map((col, colIdx) => {
                                                const cellValue = String(record[col] ?? "");
                                                const isFirstCol = colIdx === 0;
                                                const hasLink = isFirstCol && params.link_template;

                                                return (
                                                    <td key={col} className="px-3 py-2 text-gray-700">
                                                        {hasLink ? (
                                                            <a
                                                                href={resolveLinkTemplate(params.link_template!, record)}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {cellValue}
                                                            </a>
                                                        ) : (
                                                            cellValue
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
                        <span role="status" className="text-xs text-gray-400">
                            Page {meta.page} of {meta.totalPages}
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={!meta.hasPrev}
                                aria-label="Previous page"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!meta.hasNext}
                                aria-label="Next page"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
