import { describe, it, expect, vi, beforeEach } from "vitest";
import { emitWidgetFetch, measureWidgetFetch, type WidgetFetchEvent } from "./widget-telemetry";

describe("widget-telemetry", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe("emitWidgetFetch", () => {
        it("logs to console in development", () => {
            const spy = vi.spyOn(console, "log").mockImplementation(() => {});

            const event: WidgetFetchEvent = {
                queryKey: "crm.orders",
                entity: "orders",
                dataType: "list",
                refreshType: "initial",
                durationMs: 42.5,
                success: true,
                dashboardId: "d1",
                widgetId: "w1",
            };

            emitWidgetFetch(event);

            // In test env (development-like), should log
            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining("list:orders"),
                expect.objectContaining({
                    queryKey: "crm.orders",
                    dashboardId: "d1",
                    widgetId: "w1",
                    success: true,
                }),
            );
        });

        it("includes error in log when present", () => {
            const spy = vi.spyOn(console, "log").mockImplementation(() => {});

            emitWidgetFetch({
                queryKey: "crm.orders",
                entity: "orders",
                dataType: "count",
                refreshType: "polling",
                durationMs: 100,
                success: false,
                error: "timeout",
            });

            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining("count:orders"),
                expect.objectContaining({ error: "timeout", success: false }),
            );
        });
    });

    describe("measureWidgetFetch", () => {
        it("measures successful fetch duration", async () => {
            const spy = vi.spyOn(console, "log").mockImplementation(() => {});
            const fetcher = vi.fn().mockResolvedValue({ data: [1, 2, 3] });

            const result = await measureWidgetFetch(fetcher, {
                queryKey: "crm.orders",
                entity: "orders",
                dataType: "list",
                refreshType: "initial",
            });

            expect(result).toEqual({ data: [1, 2, 3] });
            expect(fetcher).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining("list:orders"),
                expect.objectContaining({ success: true }),
            );
        });

        it("measures and re-throws failed fetch", async () => {
            vi.spyOn(console, "log").mockImplementation(() => {});
            const fetcher = vi.fn().mockRejectedValue(new Error("Network failure"));

            await expect(
                measureWidgetFetch(fetcher, {
                    queryKey: "crm.orders",
                    entity: "orders",
                    dataType: "count",
                    refreshType: "manual",
                }),
            ).rejects.toThrow("Network failure");
        });

        it("passes duration in emitted event", async () => {
            const spy = vi.spyOn(console, "log").mockImplementation(() => {});
            const fetcher = vi.fn().mockResolvedValue(42);

            await measureWidgetFetch(fetcher, {
                queryKey: "crm.orders",
                entity: "orders",
                dataType: "count",
                refreshType: "global",
            });

            // Verify durationMs is a number in the log string
            const logStr = spy.mock.calls[0][0] as string;
            expect(logStr).toMatch(/\d+ms/);
        });
    });
});
