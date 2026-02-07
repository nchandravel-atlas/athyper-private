import { describe, it, expect } from "vitest";
import {
    pointerToGrid,
    itemsOverlap,
    findAvailableSlot,
    resolveCollisions,
    clampGrid,
    getGridHeight,
} from "./grid-utils";

// Inline LayoutItem type to avoid cross-workspace import issues
interface GridPosition { x: number; y: number; w: number; h: number }
interface LayoutItem { id: string; widget_type: string; params: Record<string, unknown>; grid: GridPosition }

function makeItem(id: string, grid: GridPosition): LayoutItem {
    return { id, widget_type: "kpi", params: {}, grid };
}

// ─── pointerToGrid ──────────────────────────────────────

describe("pointerToGrid", () => {
    // 12 columns, canvas 1200px, gap 16px, rowHeight 80px
    // colWidth = (1200 - 16*11) / 12 = (1200 - 176) / 12 = 85.33
    // cell step = 85.33 + 16 = 101.33

    it("returns (0, 0) for origin pointer", () => {
        expect(pointerToGrid(0, 0, 1200, 80, 16)).toEqual({ x: 0, y: 0 });
    });

    it("maps pointer to correct column", () => {
        // Pointer at x=500 → column index ~4
        const result = pointerToGrid(500, 0, 1200, 80, 16);
        expect(result.x).toBeGreaterThanOrEqual(4);
        expect(result.x).toBeLessThanOrEqual(5);
    });

    it("maps pointer to correct row", () => {
        // Pointer at y=200, rowHeight=80, gap=16 → row ~2
        const result = pointerToGrid(0, 200, 1200, 80, 16);
        expect(result.y).toBeGreaterThanOrEqual(2);
    });

    it("clamps x to max column 11", () => {
        const result = pointerToGrid(9999, 0, 1200, 80, 16);
        expect(result.x).toBe(11);
    });

    it("clamps negative pointer x to 0", () => {
        const result = pointerToGrid(-100, 0, 1200, 80, 16);
        expect(result.x).toBe(0);
    });

    it("clamps negative pointer y to 0", () => {
        const result = pointerToGrid(0, -50, 1200, 80, 16);
        expect(result.y).toBe(0);
    });
});

// ─── itemsOverlap ───────────────────────────────────────

describe("itemsOverlap", () => {
    it("returns false for non-overlapping items side by side", () => {
        expect(itemsOverlap(
            { x: 0, y: 0, w: 3, h: 2 },
            { x: 3, y: 0, w: 3, h: 2 },
        )).toBe(false);
    });

    it("returns false for non-overlapping items vertically", () => {
        expect(itemsOverlap(
            { x: 0, y: 0, w: 3, h: 2 },
            { x: 0, y: 2, w: 3, h: 2 },
        )).toBe(false);
    });

    it("returns true for overlapping items", () => {
        expect(itemsOverlap(
            { x: 0, y: 0, w: 4, h: 2 },
            { x: 2, y: 1, w: 4, h: 2 },
        )).toBe(true);
    });

    it("returns true for identical positions", () => {
        const pos = { x: 0, y: 0, w: 3, h: 2 };
        expect(itemsOverlap(pos, pos)).toBe(true);
    });

    it("returns true when one fully contains the other", () => {
        expect(itemsOverlap(
            { x: 0, y: 0, w: 6, h: 4 },
            { x: 1, y: 1, w: 2, h: 1 },
        )).toBe(true);
    });

    it("returns false for adjacent items (touching but not overlapping)", () => {
        // Right edge of A touches left edge of B
        expect(itemsOverlap(
            { x: 0, y: 0, w: 3, h: 2 },
            { x: 3, y: 0, w: 3, h: 2 },
        )).toBe(false);

        // Bottom edge of A touches top edge of B
        expect(itemsOverlap(
            { x: 0, y: 0, w: 3, h: 2 },
            { x: 0, y: 2, w: 3, h: 2 },
        )).toBe(false);
    });

    it("returns false for items far apart", () => {
        expect(itemsOverlap(
            { x: 0, y: 0, w: 1, h: 1 },
            { x: 10, y: 10, w: 1, h: 1 },
        )).toBe(false);
    });
});

// ─── findAvailableSlot ──────────────────────────────────

describe("findAvailableSlot", () => {
    it("returns (0, 0) for empty grid", () => {
        expect(findAvailableSlot([], 3, 2)).toEqual({ x: 0, y: 0, w: 3, h: 2 });
    });

    it("finds next slot after occupied origin", () => {
        const items = [makeItem("a", { x: 0, y: 0, w: 3, h: 2 })];
        const slot = findAvailableSlot(items, 3, 2);
        expect(slot.x).toBe(3); // Next to existing item
        expect(slot.y).toBe(0);
    });

    it("wraps to next row when first row is full", () => {
        const items = [makeItem("a", { x: 0, y: 0, w: 12, h: 1 })];
        const slot = findAvailableSlot(items, 3, 1);
        expect(slot.y).toBe(1);
        expect(slot.x).toBe(0);
    });

    it("finds gap between items", () => {
        const items = [
            makeItem("a", { x: 0, y: 0, w: 3, h: 1 }),
            makeItem("b", { x: 6, y: 0, w: 3, h: 1 }),
        ];
        const slot = findAvailableSlot(items, 3, 1);
        // Should find the gap at x=3
        expect(slot.x).toBe(3);
        expect(slot.y).toBe(0);
    });

    it("respects widget width when finding slot", () => {
        // Row is almost full — only 2 columns left, but widget needs 3
        const items = [makeItem("a", { x: 0, y: 0, w: 10, h: 1 })];
        const slot = findAvailableSlot(items, 3, 1);
        // Can't fit in remaining 2 cols, must go to next row
        expect(slot.y).toBe(1);
    });
});

// ─── resolveCollisions ──────────────────────────────────

describe("resolveCollisions", () => {
    it("returns items unchanged when no collisions", () => {
        const items = [
            makeItem("a", { x: 0, y: 0, w: 3, h: 2 }),
            makeItem("b", { x: 6, y: 0, w: 3, h: 2 }),
        ];
        const moved = { ...items[0], grid: { x: 0, y: 0, w: 3, h: 2 } };
        const result = resolveCollisions(items, moved);
        expect(result[1].grid.y).toBe(0); // B stays in place
    });

    it("pushes overlapping items down", () => {
        const items = [
            makeItem("a", { x: 0, y: 0, w: 6, h: 2 }),
            makeItem("b", { x: 0, y: 0, w: 3, h: 2 }),
        ];
        const moved = items[0]; // A is the moved item
        const result = resolveCollisions(items, moved);
        // B should be pushed below A
        expect(result[1].grid.y).toBe(2); // movedItem.y + movedItem.h
    });

    it("does not duplicate the moved item", () => {
        const items = [
            makeItem("a", { x: 0, y: 0, w: 6, h: 2 }),
            makeItem("b", { x: 0, y: 0, w: 3, h: 2 }),
        ];
        const moved = items[0];
        const result = resolveCollisions(items, moved);
        expect(result).toHaveLength(2);
        expect(result.filter((i) => i.id === "a")).toHaveLength(1);
    });

    it("resolves multiple collisions", () => {
        const items = [
            makeItem("moved", { x: 0, y: 0, w: 12, h: 2 }),
            makeItem("b", { x: 0, y: 1, w: 3, h: 1 }),
            makeItem("c", { x: 4, y: 1, w: 3, h: 1 }),
        ];
        const moved = items[0];
        const result = resolveCollisions(items, moved);
        expect(result[1].grid.y).toBe(2); // pushed below
        expect(result[2].grid.y).toBe(2); // pushed below
    });
});

// ─── clampGrid ──────────────────────────────────────────

describe("clampGrid", () => {
    it("returns unchanged position when within bounds", () => {
        const grid = { x: 3, y: 2, w: 4, h: 3 };
        expect(clampGrid(grid)).toEqual(grid);
    });

    it("clamps x to max (12 - w)", () => {
        expect(clampGrid({ x: 11, y: 0, w: 3, h: 1 })).toEqual({ x: 9, y: 0, w: 3, h: 1 });
    });

    it("clamps negative x to 0", () => {
        expect(clampGrid({ x: -5, y: 0, w: 3, h: 1 })).toEqual({ x: 0, y: 0, w: 3, h: 1 });
    });

    it("clamps negative y to 0", () => {
        expect(clampGrid({ x: 0, y: -3, w: 3, h: 1 })).toEqual({ x: 0, y: 0, w: 3, h: 1 });
    });

    it("clamps w to min 1", () => {
        const result = clampGrid({ x: 0, y: 0, w: 0, h: 2 });
        expect(result.w).toBe(1);
    });

    it("clamps h to min 1", () => {
        const result = clampGrid({ x: 0, y: 0, w: 3, h: 0 });
        expect(result.h).toBe(1);
    });

    it("clamps w to remaining space after x is adjusted", () => {
        // clampGrid first adjusts x = min(12 - w, x), then clamps w = min(12 - x, w)
        // Input: x=10, w=5 → x becomes min(12-5, 10) = 7, then w = min(12-7, 5) = 5
        const result = clampGrid({ x: 10, y: 0, w: 5, h: 1 });
        expect(result.x).toBe(7);
        expect(result.w).toBe(5);
        expect(result.x + result.w).toBeLessThanOrEqual(12);
    });
});

// ─── getGridHeight ──────────────────────────────────────

describe("getGridHeight", () => {
    it("returns 0 for empty items", () => {
        expect(getGridHeight([])).toBe(0);
    });

    it("returns y + h for a single item", () => {
        const items = [makeItem("a", { x: 0, y: 3, w: 3, h: 2 })];
        expect(getGridHeight(items)).toBe(5);
    });

    it("returns max (y + h) for multiple items", () => {
        const items = [
            makeItem("a", { x: 0, y: 0, w: 3, h: 2 }),
            makeItem("b", { x: 3, y: 5, w: 3, h: 3 }),
            makeItem("c", { x: 6, y: 2, w: 3, h: 1 }),
        ];
        expect(getGridHeight(items)).toBe(8); // item b: 5 + 3
    });
});
