import { describe, it, expect, vi, beforeEach } from "vitest";
import { cachedFetch, buildCacheKey, invalidateCache, getCacheStats } from "./widget-data-cache";

beforeEach(() => {
    // Clear cache between tests
    invalidateCache();
});

describe("buildCacheKey", () => {
    it("combines entity and suffix", () => {
        expect(buildCacheKey("orders", "list:p1:s20")).toBe("orders:list:p1:s20");
    });

    it("handles count suffix", () => {
        expect(buildCacheKey("orders", "count")).toBe("orders:count");
    });
});

describe("cachedFetch", () => {
    it("calls fetcher on first request", async () => {
        const fetcher = vi.fn().mockResolvedValue({ data: [1] });

        const result = await cachedFetch("orders:list", fetcher);

        expect(result).toEqual({ data: [1] });
        expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it("returns cached result on second request within TTL", async () => {
        const fetcher = vi.fn().mockResolvedValue({ data: [1] });

        const r1 = await cachedFetch("orders:list", fetcher);
        const r2 = await cachedFetch("orders:list", fetcher);

        expect(r1).toEqual(r2);
        expect(fetcher).toHaveBeenCalledTimes(1); // only called once
    });

    it("coalesces concurrent in-flight requests", async () => {
        let resolveFirst!: (v: unknown) => void;
        const fetcher = vi.fn().mockImplementation(
            () => new Promise((resolve) => { resolveFirst = resolve; }),
        );

        const p1 = cachedFetch("orders:count", fetcher);
        const p2 = cachedFetch("orders:count", fetcher);

        // Only one fetch should be in-flight
        expect(fetcher).toHaveBeenCalledTimes(1);

        resolveFirst(42);

        const [r1, r2] = await Promise.all([p1, p2]);
        expect(r1).toBe(42);
        expect(r2).toBe(42);
    });

    it("re-fetches after TTL expires", async () => {
        vi.useFakeTimers();

        const fetcher = vi.fn()
            .mockResolvedValueOnce({ data: "old" })
            .mockResolvedValueOnce({ data: "new" });

        await cachedFetch("orders:list", fetcher, 100); // 100ms TTL
        expect(fetcher).toHaveBeenCalledTimes(1);

        // Advance past TTL
        vi.advanceTimersByTime(150);

        const result = await cachedFetch("orders:list", fetcher, 100);
        expect(result).toEqual({ data: "new" });
        expect(fetcher).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });

    it("does not cache errors", async () => {
        const fetcher = vi.fn()
            .mockRejectedValueOnce(new Error("fail"))
            .mockResolvedValueOnce(42);

        await expect(cachedFetch("orders:count", fetcher)).rejects.toThrow("fail");

        // Second call should try again (not return cached error)
        const result = await cachedFetch("orders:count", fetcher);
        expect(result).toBe(42);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it("propagates errors to all coalesced requests", async () => {
        const fetcher = vi.fn().mockRejectedValue(new Error("boom"));

        const p1 = cachedFetch("orders:count", fetcher);
        const p2 = cachedFetch("orders:count", fetcher);

        await expect(p1).rejects.toThrow("boom");
        await expect(p2).rejects.toThrow("boom");
        expect(fetcher).toHaveBeenCalledTimes(1);
    });
});

describe("invalidateCache", () => {
    it("clears all entries when called without prefix", async () => {
        const fetcher = vi.fn().mockResolvedValue(42);

        await cachedFetch("orders:count", fetcher);
        await cachedFetch("users:count", fetcher);

        expect(getCacheStats().cacheSize).toBe(2);

        invalidateCache();

        expect(getCacheStats().cacheSize).toBe(0);
    });

    it("clears only matching entries when called with prefix", async () => {
        const fetcher = vi.fn().mockResolvedValue(42);

        await cachedFetch("orders:count", fetcher);
        await cachedFetch("orders:list", fetcher);
        await cachedFetch("users:count", fetcher);

        expect(getCacheStats().cacheSize).toBe(3);

        invalidateCache("orders");

        expect(getCacheStats().cacheSize).toBe(1); // only users:count remains
    });
});

describe("getCacheStats", () => {
    it("reports cache size and in-flight count", async () => {
        expect(getCacheStats()).toEqual({ cacheSize: 0, inFlightCount: 0 });

        const fetcher = vi.fn().mockResolvedValue(42);
        await cachedFetch("orders:count", fetcher);

        expect(getCacheStats()).toEqual({ cacheSize: 1, inFlightCount: 0 });
    });
});
