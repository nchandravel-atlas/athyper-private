/**
 * Widget-level telemetry — structured logging for widget data fetches.
 *
 * Captures fetch duration, tags (dashboardId, widgetId, queryKey, refreshType),
 * and emits structured console logs in development.
 * Designed for future extension to external telemetry sinks.
 */

export type RefreshType = "initial" | "polling" | "manual" | "global";

export interface WidgetFetchEvent {
    queryKey: string;
    entity: string;
    dataType: "list" | "count";
    refreshType: RefreshType;
    durationMs: number;
    success: boolean;
    error?: string;
    dashboardId?: string;
    widgetId?: string;
}

const isDev = process.env.NODE_ENV !== "production";

/**
 * Emit a structured widget fetch event.
 * In dev: logs to console. Future: forward to telemetry sink.
 */
export function emitWidgetFetch(event: WidgetFetchEvent): void {
    if (isDev) {
        const icon = event.success ? "\u2713" : "\u2717";
        console.log(
            `[widget-data] ${icon} ${event.dataType}:${event.entity} (${event.refreshType}) ${event.durationMs.toFixed(0)}ms`,
            {
                queryKey: event.queryKey,
                dashboardId: event.dashboardId,
                widgetId: event.widgetId,
                success: event.success,
                ...(event.error ? { error: event.error } : {}),
            },
        );
    }
}

/**
 * Measure the duration of an async operation and emit telemetry.
 */
export async function measureWidgetFetch<T>(
    fn: () => Promise<T>,
    tags: Omit<WidgetFetchEvent, "durationMs" | "success" | "error">,
): Promise<T> {
    const start = performance.now();
    try {
        const result = await fn();
        emitWidgetFetch({
            ...tags,
            durationMs: performance.now() - start,
            success: true,
        });
        return result;
    } catch (err) {
        emitWidgetFetch({
            ...tags,
            durationMs: performance.now() - start,
            success: false,
            error: err instanceof Error ? err.message : String(err),
        });
        throw err;
    }
}
