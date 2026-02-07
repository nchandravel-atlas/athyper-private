import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    fetchDashboards,
    fetchDashboard,
    duplicateDashboard,
    createDashboard,
    deleteDashboard,
    updateDashboard,
    saveDraftLayout,
    publishDashboard,
    fetchDraft,
    discardDraft,
    fetchAcl,
    addAcl,
    removeAcl,
} from "./dashboard-client";

const mockFetch = vi.fn();

beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
});

// ─── fetchDashboards ────────────────────────────────────

describe("fetchDashboards", () => {
    it("calls correct URL with workbench query param", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ total: 0, groups: [] }), { status: 200 }),
        );
        await fetchDashboards("admin");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards?workbench=admin",
            { credentials: "include" },
        );
    });

    it("returns parsed response", async () => {
        const data = { total: 2, groups: [{ moduleCode: "crm", dashboards: [{}, {}] }] };
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200 }));
        const result = await fetchDashboards("admin");
        expect(result.total).toBe(2);
        expect(result.groups).toHaveLength(1);
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(fetchDashboards("admin")).rejects.toThrow("Failed to load dashboards: 500");
    });
});

// ─── fetchDashboard ─────────────────────────────────────

describe("fetchDashboard", () => {
    it("calls correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ id: "abc", code: "dash1" }), { status: 200 }),
        );
        await fetchDashboard("abc");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc",
            { credentials: "include" },
        );
    });

    it("returns parsed dashboard detail", async () => {
        const detail = { id: "abc", code: "dash1", titleKey: "dashboard.main", layout: { schema_version: 1, columns: 12, row_height: 80, items: [] } };
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(detail), { status: 200 }));
        const result = await fetchDashboard("abc");
        expect(result.id).toBe("abc");
        expect(result.code).toBe("dash1");
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 404 }));
        await expect(fetchDashboard("abc")).rejects.toThrow("Failed to load dashboard: 404");
    });
});

// ─── duplicateDashboard ─────────────────────────────────

describe("duplicateDashboard", () => {
    it("calls correct URL with POST", async () => {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ id: "new-id" }), { status: 200 }));
        await duplicateDashboard("abc");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc/duplicate",
            { method: "POST", credentials: "include" },
        );
    });

    it("returns new dashboard id", async () => {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ id: "new-id" }), { status: 200 }));
        const result = await duplicateDashboard("abc");
        expect(result.id).toBe("new-id");
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(duplicateDashboard("abc")).rejects.toThrow("Failed to duplicate dashboard: 500");
    });
});

// ─── createDashboard ────────────────────────────────────

describe("createDashboard", () => {
    const params = { code: "sales-dash", titleKey: "Sales", moduleCode: "crm", workbench: "admin" };

    it("calls with POST and JSON body", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: { id: "new-id" } }), { status: 200 }),
        );
        await createDashboard(params);
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards",
            expect.objectContaining({
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(params),
            }),
        );
    });

    it("returns id from nested data", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: { id: "new-id" } }), { status: 200 }),
        );
        const result = await createDashboard(params);
        expect(result.id).toBe("new-id");
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
        await expect(createDashboard(params)).rejects.toThrow("Failed to create dashboard: 400");
    });
});

// ─── deleteDashboard ────────────────────────────────────

describe("deleteDashboard", () => {
    it("calls with DELETE method", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));
        await deleteDashboard("abc");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc",
            { method: "DELETE", credentials: "include" },
        );
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 403 }));
        await expect(deleteDashboard("abc")).rejects.toThrow("Failed to delete dashboard: 403");
    });
});

// ─── updateDashboard ────────────────────────────────────

describe("updateDashboard", () => {
    it("calls with PATCH and JSON body", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));
        const updates = { titleKey: "New Title", isHidden: true };
        await updateDashboard("abc", updates);
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc",
            expect.objectContaining({
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            }),
        );
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(updateDashboard("abc", {})).rejects.toThrow("Failed to update dashboard: 500");
    });
});

// ─── saveDraftLayout ────────────────────────────────────

describe("saveDraftLayout", () => {
    const layout = { schema_version: 1 as const, columns: 12 as const, row_height: 80, items: [] };

    it("calls with PUT and layout body", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));
        await saveDraftLayout("abc", layout);
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc/layout",
            expect.objectContaining({
                method: "PUT",
                credentials: "include",
                body: JSON.stringify({ layout }),
            }),
        );
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(saveDraftLayout("abc", layout)).rejects.toThrow("Failed to save layout: 500");
    });
});

// ─── publishDashboard ───────────────────────────────────

describe("publishDashboard", () => {
    it("calls with POST", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));
        await publishDashboard("abc");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc/publish",
            { method: "POST", credentials: "include" },
        );
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(publishDashboard("abc")).rejects.toThrow("Failed to publish dashboard: 500");
    });
});

// ─── fetchDraft ─────────────────────────────────────────

describe("fetchDraft", () => {
    it("calls correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: { layout: {}, versionNo: 1, status: "draft" } }), { status: 200 }),
        );
        await fetchDraft("abc");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc/draft",
            { credentials: "include" },
        );
    });

    it("returns draft data on success", async () => {
        const draftData = { layout: { schema_version: 1, columns: 12, row_height: 80, items: [] }, versionNo: 2, status: "draft" };
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: draftData }), { status: 200 }),
        );
        const result = await fetchDraft("abc");
        expect(result).not.toBeNull();
        expect(result!.versionNo).toBe(2);
    });

    it("returns null on 404", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 404 }));
        const result = await fetchDraft("abc");
        expect(result).toBeNull();
    });

    it("throws on other errors", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(fetchDraft("abc")).rejects.toThrow("Failed to load draft: 500");
    });
});

// ─── discardDraft ───────────────────────────────────────

describe("discardDraft", () => {
    it("calls with DELETE", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));
        await discardDraft("abc");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc/draft",
            { method: "DELETE", credentials: "include" },
        );
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(discardDraft("abc")).rejects.toThrow("Failed to discard draft: 500");
    });
});

// ─── fetchAcl ───────────────────────────────────────────

describe("fetchAcl", () => {
    it("calls correct URL", async () => {
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: [] }), { status: 200 }),
        );
        await fetchAcl("abc");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc/acl",
            { credentials: "include" },
        );
    });

    it("returns ACL entries array", async () => {
        const entries = [{ id: "1", principalType: "user", principalKey: "john", permission: "edit", createdBy: "admin", createdAt: "2024-01-01" }];
        mockFetch.mockResolvedValueOnce(
            new Response(JSON.stringify({ success: true, data: entries }), { status: 200 }),
        );
        const result = await fetchAcl("abc");
        expect(result).toHaveLength(1);
        expect(result[0].principalKey).toBe("john");
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
        await expect(fetchAcl("abc")).rejects.toThrow("Failed to load ACL: 500");
    });
});

// ─── addAcl ─────────────────────────────────────────────

describe("addAcl", () => {
    const entry = { principalType: "user", principalKey: "john", permission: "edit" };

    it("calls with POST and JSON body", async () => {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ id: "acl-1" }), { status: 200 }));
        await addAcl("abc", entry);
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc/acl",
            expect.objectContaining({
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            }),
        );
    });

    it("returns new ACL entry id", async () => {
        mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ id: "acl-1" }), { status: 200 }));
        const result = await addAcl("abc", entry);
        expect(result.id).toBe("acl-1");
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 400 }));
        await expect(addAcl("abc", entry)).rejects.toThrow("Failed to add ACL entry: 400");
    });
});

// ─── removeAcl ──────────────────────────────────────────

describe("removeAcl", () => {
    it("calls correct URL with DELETE", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 200 }));
        await removeAcl("abc", "acl-1");
        expect(mockFetch).toHaveBeenCalledWith(
            "/api/ui/dashboards/abc/acl/acl-1",
            { method: "DELETE", credentials: "include" },
        );
    });

    it("throws on error", async () => {
        mockFetch.mockResolvedValueOnce(new Response(null, { status: 404 }));
        await expect(removeAcl("abc", "acl-1")).rejects.toThrow("Failed to remove ACL entry: 404");
    });
});
