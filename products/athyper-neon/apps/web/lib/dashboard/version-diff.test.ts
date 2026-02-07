import { describe, it, expect } from "vitest";
import { computeLayoutDiff } from "./version-diff";
import type { LayoutItem } from "@athyper/dashboard";

function makeItem(overrides: Partial<LayoutItem> & { id: string }): LayoutItem {
    return {
        widget_type: "kpi",
        params: {},
        grid: { x: 0, y: 0, w: 3, h: 2 },
        ...overrides,
    };
}

describe("computeLayoutDiff", () => {
    it("detects added items", () => {
        const oldItems = [makeItem({ id: "a" })];
        const newItems = [makeItem({ id: "a" }), makeItem({ id: "b" })];
        const diff = computeLayoutDiff(oldItems, newItems);

        expect(diff.added).toHaveLength(1);
        expect(diff.added[0].id).toBe("b");
        expect(diff.removed).toHaveLength(0);
        expect(diff.modified).toHaveLength(0);
        expect(diff.unchanged).toHaveLength(1);
    });

    it("detects removed items", () => {
        const oldItems = [makeItem({ id: "a" }), makeItem({ id: "b" })];
        const newItems = [makeItem({ id: "a" })];
        const diff = computeLayoutDiff(oldItems, newItems);

        expect(diff.added).toHaveLength(0);
        expect(diff.removed).toHaveLength(1);
        expect(diff.removed[0].id).toBe("b");
        expect(diff.unchanged).toHaveLength(1);
    });

    it("detects modified items — grid change", () => {
        const oldItems = [makeItem({ id: "a", grid: { x: 0, y: 0, w: 3, h: 2 } })];
        const newItems = [makeItem({ id: "a", grid: { x: 3, y: 0, w: 3, h: 2 } })];
        const diff = computeLayoutDiff(oldItems, newItems);

        expect(diff.modified).toHaveLength(1);
        expect(diff.modified[0].before.grid.x).toBe(0);
        expect(diff.modified[0].after.grid.x).toBe(3);
        expect(diff.unchanged).toHaveLength(0);
    });

    it("detects modified items — params change", () => {
        const oldItems = [makeItem({ id: "a", params: { label_key: "old" } })];
        const newItems = [makeItem({ id: "a", params: { label_key: "new" } })];
        const diff = computeLayoutDiff(oldItems, newItems);

        expect(diff.modified).toHaveLength(1);
        expect(diff.unchanged).toHaveLength(0);
    });

    it("detects modified items — widget_type change", () => {
        const oldItems = [makeItem({ id: "a", widget_type: "kpi" })];
        const newItems = [makeItem({ id: "a", widget_type: "chart" })];
        const diff = computeLayoutDiff(oldItems, newItems);

        expect(diff.modified).toHaveLength(1);
    });

    it("handles empty arrays", () => {
        const diff = computeLayoutDiff([], []);
        expect(diff.added).toHaveLength(0);
        expect(diff.removed).toHaveLength(0);
        expect(diff.modified).toHaveLength(0);
        expect(diff.unchanged).toHaveLength(0);
    });

    it("handles old empty → new items (all added)", () => {
        const newItems = [makeItem({ id: "a" }), makeItem({ id: "b" })];
        const diff = computeLayoutDiff([], newItems);

        expect(diff.added).toHaveLength(2);
        expect(diff.removed).toHaveLength(0);
    });

    it("handles new empty → all removed", () => {
        const oldItems = [makeItem({ id: "a" }), makeItem({ id: "b" })];
        const diff = computeLayoutDiff(oldItems, []);

        expect(diff.removed).toHaveLength(2);
        expect(diff.added).toHaveLength(0);
    });

    it("handles mixed changes", () => {
        const oldItems = [
            makeItem({ id: "keep", grid: { x: 0, y: 0, w: 3, h: 2 } }),
            makeItem({ id: "modify", grid: { x: 3, y: 0, w: 3, h: 2 } }),
            makeItem({ id: "remove" }),
        ];
        const newItems = [
            makeItem({ id: "keep", grid: { x: 0, y: 0, w: 3, h: 2 } }),
            makeItem({ id: "modify", grid: { x: 6, y: 0, w: 6, h: 4 } }),
            makeItem({ id: "add" }),
        ];
        const diff = computeLayoutDiff(oldItems, newItems);

        expect(diff.unchanged).toHaveLength(1);
        expect(diff.unchanged[0].id).toBe("keep");
        expect(diff.modified).toHaveLength(1);
        expect(diff.modified[0].before.id).toBe("modify");
        expect(diff.removed).toHaveLength(1);
        expect(diff.removed[0].id).toBe("remove");
        expect(diff.added).toHaveLength(1);
        expect(diff.added[0].id).toBe("add");
    });
});
