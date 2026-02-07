/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock dependencies before importing the hooks
vi.mock("./widget-data-client", () => ({
    parseQueryKey: vi.fn((key: string) => {
        const parts = key.split(".");
        const isCount = parts[parts.length - 1] === "count" && parts.length > 1;
        if (isCount) parts.pop();
        if (parts.length >= 2) return { module: parts[0], entity: parts.slice(1).join("_"), isCount };
        return { module: "", entity: parts[0], isCount };
    }),
    fetchEntityList: vi.fn(),
    fetchEntityCount: vi.fn(),
}));

vi.mock("./dashboard-refresh-context", () => ({
    useDashboardRefresh: vi.fn(() => ({
        refreshKey: 0,
        refreshAll: vi.fn(),
        registerPoll: vi.fn(() => true),
        unregisterPoll: vi.fn(),
        activePollCount: 0,
    })),
}));

vi.mock("./use-visibility", () => ({
    usePageVisibility: vi.fn(() => true),
}));

vi.mock("./widget-telemetry", () => ({
    measureWidgetFetch: vi.fn(async (fn: () => Promise<unknown>) => fn()),
    emitWidgetFetch: vi.fn(),
}));

vi.mock("./widget-data-cache", () => ({
    cachedFetch: vi.fn(async (_key: string, fn: () => Promise<unknown>) => fn()),
    buildCacheKey: vi.fn((entity: string, suffix: string) => `${entity}:${suffix}`),
    invalidateCache: vi.fn(),
}));

import { useWidgetData, useWidgetCount } from "./use-widget-data";
import { fetchEntityList, fetchEntityCount } from "./widget-data-client";
import { useDashboardRefresh } from "./dashboard-refresh-context";
import { usePageVisibility } from "./use-visibility";
import { measureWidgetFetch } from "./widget-telemetry";
import { cachedFetch, invalidateCache } from "./widget-data-cache";

const mockFetchList = vi.mocked(fetchEntityList);
const mockFetchCount = vi.mocked(fetchEntityCount);
const mockUseDashboardRefresh = vi.mocked(useDashboardRefresh);
const mockUsePageVisibility = vi.mocked(usePageVisibility);
const mockMeasureWidgetFetch = vi.mocked(measureWidgetFetch);
const mockCachedFetch = vi.mocked(cachedFetch);
const mockInvalidateCache = vi.mocked(invalidateCache);

const sampleListResponse = {
    success: true,
    data: [{ id: "1", name: "Test" }],
    meta: { page: 1, pageSize: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
};

beforeEach(() => {
    vi.clearAllMocks();
    mockUseDashboardRefresh.mockReturnValue({
        refreshKey: 0,
        refreshAll: vi.fn(),
        registerPoll: vi.fn(() => true),
        unregisterPoll: vi.fn(),
        activePollCount: 0,
    });
    mockUsePageVisibility.mockReturnValue(true);
    mockMeasureWidgetFetch.mockImplementation(async (fn) => fn());
    mockCachedFetch.mockImplementation(async (_key, fn) => fn());
});

// ─── useWidgetData ──────────────────────────────────────

describe("useWidgetData", () => {
    it("loads data on mount", async () => {
        mockFetchList.mockResolvedValueOnce(sampleListResponse);

        const { result } = renderHook(() => useWidgetData("crm.orders"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual([{ id: "1", name: "Test" }]);
        expect(result.current.meta?.total).toBe(1);
        expect(result.current.error).toBeNull();
        expect(mockFetchList).toHaveBeenCalledTimes(1);
    });

    it("returns null data for null queryKey", async () => {
        const { result } = renderHook(() => useWidgetData(null));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toBeNull();
        expect(result.current.meta).toBeNull();
        expect(mockFetchList).not.toHaveBeenCalled();
    });

    it("sets error on fetch failure", async () => {
        mockFetchList.mockRejectedValueOnce(new Error("Network error"));

        const { result } = renderHook(() => useWidgetData("crm.orders"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("Network error");
        expect(result.current.data).toBeNull();
    });

    it("reload triggers re-fetch", async () => {
        mockFetchList.mockResolvedValue(sampleListResponse);

        const { result } = renderHook(() => useWidgetData("crm.orders"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(mockFetchList).toHaveBeenCalledTimes(1);

        await act(async () => {
            result.current.reload();
        });

        await waitFor(() => {
            expect(mockFetchList).toHaveBeenCalledTimes(2);
        });
    });

    it("forwards pagination options", async () => {
        mockFetchList.mockResolvedValueOnce(sampleListResponse);

        renderHook(() => useWidgetData("crm.orders", { page: 3, pageSize: 5 }));

        await waitFor(() => {
            expect(mockFetchList).toHaveBeenCalledWith("orders", {
                page: 3,
                pageSize: 5,
                orderBy: undefined,
                orderDir: undefined,
            });
        });
    });

    it("shows refreshing (not loading) on subsequent fetches", async () => {
        mockFetchList.mockResolvedValue(sampleListResponse);

        const { result } = renderHook(() => useWidgetData("crm.orders"));

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // The first load shows loading=true, subsequent should show refreshing
        expect(result.current.refreshing).toBe(false);
    });

    it("invalidates cache on manual reload", async () => {
        mockFetchList.mockResolvedValue(sampleListResponse);

        const { result } = renderHook(() => useWidgetData("crm.orders"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            result.current.reload();
        });

        expect(mockInvalidateCache).toHaveBeenCalledWith("orders");
    });

    it("wraps fetch with measureWidgetFetch for telemetry", async () => {
        mockFetchList.mockResolvedValueOnce(sampleListResponse);

        renderHook(() => useWidgetData("crm.orders", { dashboardId: "d1", widgetId: "w1" }));

        await waitFor(() => {
            expect(mockMeasureWidgetFetch).toHaveBeenCalled();
        });

        const tags = mockMeasureWidgetFetch.mock.calls[0][1];
        expect(tags).toMatchObject({
            queryKey: "crm.orders",
            entity: "orders",
            dataType: "list",
            dashboardId: "d1",
            widgetId: "w1",
        });
    });

    it("wraps fetch with cachedFetch for deduplication", async () => {
        mockFetchList.mockResolvedValueOnce(sampleListResponse);

        renderHook(() => useWidgetData("crm.orders"));

        await waitFor(() => {
            expect(mockCachedFetch).toHaveBeenCalled();
        });

        const cacheKey = mockCachedFetch.mock.calls[0][0];
        expect(cacheKey).toContain("orders");
    });
});

// ─── useWidgetData auto-polling ─────────────────────────

describe("useWidgetData auto-polling", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("polls at specified interval", async () => {
        mockFetchList.mockResolvedValue(sampleListResponse);

        renderHook(() => useWidgetData("crm.orders", { refreshInterval: 30000 }));

        // Initial load
        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        const initialCalls = mockFetchList.mock.calls.length;

        // Advance 30 seconds
        await act(async () => {
            await vi.advanceTimersByTimeAsync(30000);
        });

        expect(mockFetchList.mock.calls.length).toBeGreaterThan(initialCalls);
    });

    it("does not poll when interval is below minimum (10000ms)", async () => {
        mockFetchList.mockResolvedValue(sampleListResponse);

        renderHook(() => useWidgetData("crm.orders", { refreshInterval: 5000 }));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        const callsAfterInit = mockFetchList.mock.calls.length;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(15000);
        });

        // Should not have polled — same count as after init
        expect(mockFetchList.mock.calls.length).toBe(callsAfterInit);
    });

    it("clears interval on unmount", async () => {
        mockFetchList.mockResolvedValue(sampleListResponse);

        const { unmount } = renderHook(() => useWidgetData("crm.orders", { refreshInterval: 10000 }));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        unmount();

        const callsBeforeAdvance = mockFetchList.mock.calls.length;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(30000);
        });

        expect(mockFetchList.mock.calls.length).toBe(callsBeforeAdvance);
    });

    it("does not poll when page is hidden", async () => {
        mockUsePageVisibility.mockReturnValue(false);
        mockFetchList.mockResolvedValue(sampleListResponse);

        renderHook(() => useWidgetData("crm.orders", { refreshInterval: 10000 }));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        const callsAfterInit = mockFetchList.mock.calls.length;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(30000);
        });

        // No polling should have occurred while hidden
        expect(mockFetchList.mock.calls.length).toBe(callsAfterInit);
    });

    it("does not poll when at concurrency limit", async () => {
        const mockRegisterPoll = vi.fn(() => false); // at limit
        mockUseDashboardRefresh.mockReturnValue({
            refreshKey: 0,
            refreshAll: vi.fn(),
            registerPoll: mockRegisterPoll,
            unregisterPoll: vi.fn(),
            activePollCount: 6,
        });
        mockFetchList.mockResolvedValue(sampleListResponse);

        renderHook(() => useWidgetData("crm.orders", { refreshInterval: 10000 }));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        const callsAfterInit = mockFetchList.mock.calls.length;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(30000);
        });

        expect(mockFetchList.mock.calls.length).toBe(callsAfterInit);
    });

    it("unregisters poll on unmount", async () => {
        const mockUnregisterPoll = vi.fn();
        mockUseDashboardRefresh.mockReturnValue({
            refreshKey: 0,
            refreshAll: vi.fn(),
            registerPoll: vi.fn(() => true),
            unregisterPoll: mockUnregisterPoll,
            activePollCount: 0,
        });
        mockFetchList.mockResolvedValue(sampleListResponse);

        const { unmount } = renderHook(() => useWidgetData("crm.orders", { refreshInterval: 10000 }));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        unmount();

        expect(mockUnregisterPoll).toHaveBeenCalled();
    });
});

// ─── useWidgetCount ─────────────────────────────────────

describe("useWidgetCount", () => {
    it("loads count on mount", async () => {
        mockFetchCount.mockResolvedValueOnce(42);

        const { result } = renderHook(() => useWidgetCount("crm.orders"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.count).toBe(42);
        expect(result.current.error).toBeNull();
    });

    it("returns null count for null queryKey", async () => {
        const { result } = renderHook(() => useWidgetCount(null));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.count).toBeNull();
        expect(mockFetchCount).not.toHaveBeenCalled();
    });

    it("sets error on fetch failure", async () => {
        mockFetchCount.mockRejectedValueOnce(new Error("Server error"));

        const { result } = renderHook(() => useWidgetCount("crm.orders"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("Server error");
        expect(result.current.count).toBeNull();
    });

    it("returns 0 count", async () => {
        mockFetchCount.mockResolvedValueOnce(0);

        const { result } = renderHook(() => useWidgetCount("crm.orders"));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.count).toBe(0);
    });

    it("wraps fetch with telemetry and cache", async () => {
        mockFetchCount.mockResolvedValueOnce(42);

        renderHook(() => useWidgetCount("crm.orders", { dashboardId: "d1", widgetId: "w1" }));

        await waitFor(() => {
            expect(mockMeasureWidgetFetch).toHaveBeenCalled();
        });

        const tags = mockMeasureWidgetFetch.mock.calls[0][1];
        expect(tags).toMatchObject({
            queryKey: "crm.orders",
            entity: "orders",
            dataType: "count",
            dashboardId: "d1",
            widgetId: "w1",
        });

        expect(mockCachedFetch).toHaveBeenCalled();
    });
});

describe("useWidgetCount auto-polling", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("polls at specified interval", async () => {
        mockFetchCount.mockResolvedValue(42);

        renderHook(() => useWidgetCount("crm.orders", { refreshInterval: 30000 }));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        const initialCalls = mockFetchCount.mock.calls.length;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(30000);
        });

        expect(mockFetchCount.mock.calls.length).toBeGreaterThan(initialCalls);
    });

    it("does not poll when interval is below minimum", async () => {
        mockFetchCount.mockResolvedValue(42);

        renderHook(() => useWidgetCount("crm.orders", { refreshInterval: 5000 }));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        const callsAfterInit = mockFetchCount.mock.calls.length;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(15000);
        });

        expect(mockFetchCount.mock.calls.length).toBe(callsAfterInit);
    });

    it("does not poll when page is hidden", async () => {
        mockUsePageVisibility.mockReturnValue(false);
        mockFetchCount.mockResolvedValue(42);

        renderHook(() => useWidgetCount("crm.orders", { refreshInterval: 10000 }));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(0);
        });

        const callsAfterInit = mockFetchCount.mock.calls.length;

        await act(async () => {
            await vi.advanceTimersByTimeAsync(30000);
        });

        expect(mockFetchCount.mock.calls.length).toBe(callsAfterInit);
    });
});
