import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseQueryKey, fetchEntityList, fetchEntityCount } from "./widget-data-client";

// ─── parseQueryKey ──────────────────────────────────────

describe("parseQueryKey", () => {
    it("parses module.entity format", () => {
        expect(parseQueryKey("crm.opportunities")).toEqual({
            module: "crm",
            entity: "opportunities",
            isCount: false,
        });
    });

    it("parses module.entity.count format", () => {
        expect(parseQueryKey("crm.opportunities.count")).toEqual({
            module: "crm",
            entity: "opportunities",
            isCount: true,
        });
    });

    it("parses single entity (no module)", () => {
        expect(parseQueryKey("opportunities")).toEqual({
            module: "",
            entity: "opportunities",
            isCount: false,
        });
    });

    it("joins multi-segment entity with underscore", () => {
        expect(parseQueryKey("sales.order.items")).toEqual({
            module: "sales",
            entity: "order_items",
            isCount: false,
        });
    });

    it("handles multi-segment entity with count", () => {
        expect(parseQueryKey("sales.order.items.count")).toEqual({
            module: "sales",
            entity: "order_items",
            isCount: true,
        });
    });

    it("treats single 'count' as entity name not suffix", () => {
        // "count" alone has only 1 part, so parts.length > 1 is false
        expect(parseQueryKey("count")).toEqual({
            module: "",
            entity: "count",
            isCount: false,
        });
    });
});

// ─── fetchEntityList ────────────────────────────────────

describe("fetchEntityList", () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        mockFetch.mockReset();
        global.fetch = mockFetch;
    });

    it("calls correct URL with no options", async () => {
        const responseData = { success: true, data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(responseData), { status: 200 }));

        await fetchEntityList("invoices");

        expect(mockFetch).toHaveBeenCalledWith(
            "/api/data/invoices",
            { credentials: "include" },
        );
    });

    it("builds query string from options", async () => {
        const responseData = { success: true, data: [], meta: { page: 2, pageSize: 10, total: 50, totalPages: 5, hasNext: true, hasPrev: true } };
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(responseData), { status: 200 }));

        await fetchEntityList("invoices", {
            page: 2,
            pageSize: 10,
            orderBy: "created_at",
            orderDir: "desc",
        });

        const calledUrl = mockFetch.mock.calls[0][0] as string;
        expect(calledUrl).toContain("/api/data/invoices?");
        expect(calledUrl).toContain("page=2");
        expect(calledUrl).toContain("pageSize=10");
        expect(calledUrl).toContain("orderBy=created_at");
        expect(calledUrl).toContain("orderDir=desc");
    });

    it("includes credentials", async () => {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: [], meta: {} }), { status: 200 }));
        await fetchEntityList("invoices");
        expect(mockFetch.mock.calls[0][1]).toEqual({ credentials: "include" });
    });

    it("returns parsed response", async () => {
        const responseData = {
            success: true,
            data: [{ id: "1", name: "Invoice #1" }],
            meta: { page: 1, pageSize: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
        };
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(responseData), { status: 200 }));

        const result = await fetchEntityList("invoices");
        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toBe("Invoice #1");
        expect(result.meta.total).toBe(1);
    });

    it("throws on non-ok response", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(fetchEntityList("invoices")).rejects.toThrow("Failed to load invoices: 500");
    });

    it("encodes entity name in URL", async () => {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: [], meta: {} }), { status: 200 }));
        await fetchEntityList("order items");
        const calledUrl = mockFetch.mock.calls[0][0] as string;
        expect(calledUrl).toContain("order%20items");
    });
});

// ─── fetchEntityCount ───────────────────────────────────

describe("fetchEntityCount", () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
        mockFetch.mockReset();
        global.fetch = mockFetch;
    });

    it("calls correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: { count: 42 } }), { status: 200 }),
        );

        await fetchEntityCount("invoices");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/data/invoices/count",
            { credentials: "include" },
        );
    });

    it("returns the count value", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: { count: 42 } }), { status: 200 }),
        );

        const result = await fetchEntityCount("invoices");
        expect(result).toBe(42);
    });

    it("returns 0 count", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: { count: 0 } }), { status: 200 }),
        );

        const result = await fetchEntityCount("invoices");
        expect(result).toBe(0);
    });

    it("throws on non-ok response", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 403 }));
        await expect(fetchEntityCount("invoices")).rejects.toThrow("Failed to count invoices: 403");
    });
});
