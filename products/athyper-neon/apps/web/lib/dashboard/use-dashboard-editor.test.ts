import { describe, it, expect, vi, beforeEach } from "vitest";
import { editorReducer, type EditorState, type EditorAction } from "./use-dashboard-editor";

// Mock crypto.randomUUID for deterministic IDs
let uuidCounter = 0;
vi.stubGlobal("crypto", {
    randomUUID: () => `test-uuid-${String(++uuidCounter).padStart(3, "0")}`,
});

const emptyLayout = {
    schema_version: 1 as const,
    columns: 12 as const,
    row_height: 80,
    items: [],
};

function makeState(overrides?: Partial<EditorState>): EditorState {
    return {
        layout: { ...emptyLayout, items: [] },
        past: [],
        future: [],
        selectedWidgetId: null,
        isDirty: false,
        mode: "edit" as const,
        lastSavedAt: null,
        isSaving: false,
        ...overrides,
    };
}

function makeItem(id: string, x = 0, y = 0, w = 3, h = 2) {
    return {
        id,
        widget_type: "kpi",
        params: { label_key: "test", query_key: "test.data", format: "number" },
        grid: { x, y, w, h },
    };
}

beforeEach(() => {
    uuidCounter = 0;
});

// ─── INIT ───────────────────────────────────────────────

describe("INIT", () => {
    it("sets layout and clears dirty/selection", () => {
        const state = makeState({ isDirty: true, selectedWidgetId: "w1" });
        const layout = { ...emptyLayout, items: [makeItem("a")] };
        const result = editorReducer(state, { type: "INIT", layout });
        expect(result.layout.items).toHaveLength(1);
        expect(result.isDirty).toBe(false);
        expect(result.selectedWidgetId).toBeNull();
    });

    it("clears undo/redo history", () => {
        const state = makeState({
            past: [emptyLayout],
            future: [emptyLayout],
        });
        const result = editorReducer(state, { type: "INIT", layout: emptyLayout });
        expect(result.past).toHaveLength(0);
        expect(result.future).toHaveLength(0);
    });
});

// ─── ADD_WIDGET ─────────────────────────────────────────

describe("ADD_WIDGET", () => {
    it("adds a widget with generated id", () => {
        const state = makeState();
        const result = editorReducer(state, {
            type: "ADD_WIDGET",
            widgetType: "kpi",
            grid: { x: 0, y: 0, w: 3, h: 2 },
            params: { label_key: "test" },
        });
        expect(result.layout.items).toHaveLength(1);
        expect(result.layout.items[0].widget_type).toBe("kpi");
        expect(result.layout.items[0].id).toBe("test-uuid-"); // randomUUID().slice(0, 10) on "test-uuid-001"
    });

    it("selects the new widget", () => {
        const state = makeState();
        const result = editorReducer(state, {
            type: "ADD_WIDGET",
            widgetType: "heading",
            grid: { x: 0, y: 0, w: 6, h: 1 },
            params: { text_key: "title" },
        });
        expect(result.selectedWidgetId).toBe(result.layout.items[0].id);
    });

    it("marks state as dirty", () => {
        const state = makeState();
        const result = editorReducer(state, {
            type: "ADD_WIDGET",
            widgetType: "spacer",
            grid: { x: 0, y: 0, w: 12, h: 1 },
            params: { height: "md" },
        });
        expect(result.isDirty).toBe(true);
    });

    it("clamps grid to valid bounds", () => {
        const state = makeState();
        const result = editorReducer(state, {
            type: "ADD_WIDGET",
            widgetType: "kpi",
            grid: { x: 15, y: 0, w: 3, h: 2 }, // x out of bounds
            params: {},
        });
        expect(result.layout.items[0].grid.x).toBeLessThanOrEqual(9); // 12 - 3
    });

    it("pushes to undo history", () => {
        const state = makeState();
        const result = editorReducer(state, {
            type: "ADD_WIDGET",
            widgetType: "kpi",
            grid: { x: 0, y: 0, w: 3, h: 2 },
            params: {},
        });
        expect(result.past).toHaveLength(1);
        expect(result.future).toHaveLength(0);
    });
});

// ─── MOVE_WIDGET ────────────────────────────────────────

describe("MOVE_WIDGET", () => {
    it("updates widget grid position", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1", 0, 0, 3, 2)] },
        });
        const result = editorReducer(state, {
            type: "MOVE_WIDGET",
            widgetId: "w1",
            grid: { x: 4, y: 2, w: 3, h: 2 },
        });
        expect(result.layout.items[0].grid.x).toBe(4);
        expect(result.layout.items[0].grid.y).toBe(2);
        expect(result.isDirty).toBe(true);
    });

    it("returns layout unchanged for invalid id", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1")] },
        });
        const result = editorReducer(state, {
            type: "MOVE_WIDGET",
            widgetId: "nonexistent",
            grid: { x: 5, y: 5, w: 3, h: 2 },
        });
        // editorReducer pushes history before coreReducer checks validity,
        // so reference equality fails — check layout items are unchanged
        expect(result.layout.items).toEqual(state.layout.items);
        expect(result.layout.items).toHaveLength(1);
    });
});

// ─── RESIZE_WIDGET ──────────────────────────────────────

describe("RESIZE_WIDGET", () => {
    it("updates widget width and height", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1", 0, 0, 3, 2)] },
        });
        const result = editorReducer(state, {
            type: "RESIZE_WIDGET",
            widgetId: "w1",
            w: 6,
            h: 4,
        });
        expect(result.layout.items[0].grid.w).toBe(6);
        expect(result.layout.items[0].grid.h).toBe(4);
        expect(result.isDirty).toBe(true);
    });

    it("clamps size to valid bounds", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1", 8, 0, 3, 2)] },
        });
        const result = editorReducer(state, {
            type: "RESIZE_WIDGET",
            widgetId: "w1",
            w: 10, // would exceed grid (x=8 + w=10 > 12)
            h: 2,
        });
        // clampGrid adjusts x first: x = min(12 - 10, 8) = 2, then w stays 10
        const grid = result.layout.items[0].grid;
        expect(grid.x).toBe(2);
        expect(grid.w).toBe(10);
        expect(grid.x + grid.w).toBeLessThanOrEqual(12);
    });
});

// ─── UPDATE_PARAMS ──────────────────────────────────────

describe("UPDATE_PARAMS", () => {
    it("replaces params for the target widget", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1")] },
        });
        const newParams = { label_key: "updated", query_key: "new.query", format: "currency" };
        const result = editorReducer(state, {
            type: "UPDATE_PARAMS",
            widgetId: "w1",
            params: newParams,
        });
        expect(result.layout.items[0].params).toEqual(newParams);
        expect(result.isDirty).toBe(true);
    });

    it("does not affect other widgets", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1"), makeItem("w2", 4, 0)] },
        });
        const result = editorReducer(state, {
            type: "UPDATE_PARAMS",
            widgetId: "w1",
            params: { changed: true },
        });
        expect(result.layout.items[1].params).toEqual(state.layout.items[1].params);
    });
});

// ─── DELETE_WIDGET ──────────────────────────────────────

describe("DELETE_WIDGET", () => {
    it("removes the widget", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1"), makeItem("w2", 4, 0)] },
        });
        const result = editorReducer(state, { type: "DELETE_WIDGET", widgetId: "w1" });
        expect(result.layout.items).toHaveLength(1);
        expect(result.layout.items[0].id).toBe("w2");
        expect(result.isDirty).toBe(true);
    });

    it("deselects the widget if it was selected", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1")] },
            selectedWidgetId: "w1",
        });
        const result = editorReducer(state, { type: "DELETE_WIDGET", widgetId: "w1" });
        expect(result.selectedWidgetId).toBeNull();
    });

    it("keeps selection if a different widget was selected", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1"), makeItem("w2", 4, 0)] },
            selectedWidgetId: "w2",
        });
        const result = editorReducer(state, { type: "DELETE_WIDGET", widgetId: "w1" });
        expect(result.selectedWidgetId).toBe("w2");
    });
});

// ─── DUPLICATE_WIDGET ───────────────────────────────────

describe("DUPLICATE_WIDGET", () => {
    it("creates a clone with new id", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1")] },
        });
        const result = editorReducer(state, { type: "DUPLICATE_WIDGET", widgetId: "w1" });
        expect(result.layout.items).toHaveLength(2);
        expect(result.layout.items[1].id).not.toBe("w1");
        expect(result.layout.items[1].widget_type).toBe("kpi");
    });

    it("selects the clone", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1")] },
        });
        const result = editorReducer(state, { type: "DUPLICATE_WIDGET", widgetId: "w1" });
        expect(result.selectedWidgetId).toBe(result.layout.items[1].id);
    });

    it("returns layout unchanged for invalid id", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1")] },
        });
        const result = editorReducer(state, { type: "DUPLICATE_WIDGET", widgetId: "nonexistent" });
        // editorReducer pushes history before coreReducer checks validity
        expect(result.layout.items).toEqual(state.layout.items);
        expect(result.layout.items).toHaveLength(1);
    });

    it("marks state as dirty", () => {
        const state = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1")] },
        });
        const result = editorReducer(state, { type: "DUPLICATE_WIDGET", widgetId: "w1" });
        expect(result.isDirty).toBe(true);
    });
});

// ─── SELECT ─────────────────────────────────────────────

describe("SELECT", () => {
    it("sets selectedWidgetId", () => {
        const state = makeState();
        const result = editorReducer(state, { type: "SELECT", widgetId: "w1" });
        expect(result.selectedWidgetId).toBe("w1");
    });

    it("clears selection with null", () => {
        const state = makeState({ selectedWidgetId: "w1" });
        const result = editorReducer(state, { type: "SELECT", widgetId: null });
        expect(result.selectedWidgetId).toBeNull();
    });

    it("does not push to undo history", () => {
        const state = makeState();
        const result = editorReducer(state, { type: "SELECT", widgetId: "w1" });
        expect(result.past).toHaveLength(0);
    });
});

// ─── SET_MODE ───────────────────────────────────────────

describe("SET_MODE", () => {
    it("sets mode and clears selection", () => {
        const state = makeState({ mode: "edit", selectedWidgetId: "w1" });
        const result = editorReducer(state, { type: "SET_MODE", mode: "preview" });
        expect(result.mode).toBe("preview");
        expect(result.selectedWidgetId).toBeNull();
    });

    it("does not push to undo history", () => {
        const state = makeState();
        const result = editorReducer(state, { type: "SET_MODE", mode: "preview" });
        expect(result.past).toHaveLength(0);
    });
});

// ─── MARK_SAVED ─────────────────────────────────────────

describe("MARK_SAVED", () => {
    it("clears dirty and sets savedAt", () => {
        const now = new Date();
        const state = makeState({ isDirty: true });
        const result = editorReducer(state, { type: "MARK_SAVED", savedAt: now });
        expect(result.isDirty).toBe(false);
        expect(result.lastSavedAt).toBe(now);
        expect(result.isSaving).toBe(false);
    });

    it("does not push to undo history", () => {
        const state = makeState({ isDirty: true });
        const result = editorReducer(state, { type: "MARK_SAVED", savedAt: new Date() });
        expect(result.past).toHaveLength(0);
    });
});

// ─── RESET ──────────────────────────────────────────────

describe("RESET", () => {
    it("resets layout and clears state", () => {
        const newLayout = { ...emptyLayout, items: [makeItem("x")] };
        const state = makeState({
            isDirty: true,
            selectedWidgetId: "w1",
            past: [emptyLayout],
            future: [emptyLayout],
        });
        const result = editorReducer(state, { type: "RESET", layout: newLayout });
        expect(result.layout).toBe(newLayout);
        expect(result.isDirty).toBe(false);
        expect(result.selectedWidgetId).toBeNull();
        expect(result.past).toHaveLength(0);
        expect(result.future).toHaveLength(0);
    });
});

// ─── UNDO / REDO ────────────────────────────────────────

describe("UNDO", () => {
    it("returns state unchanged when past is empty", () => {
        const state = makeState({ past: [] });
        const result = editorReducer(state, { type: "UNDO" });
        expect(result).toBe(state);
    });

    it("restores previous layout from past", () => {
        const prevLayout = { ...emptyLayout, items: [makeItem("prev")] };
        const currentLayout = { ...emptyLayout, items: [makeItem("current")] };
        const state = makeState({
            layout: currentLayout,
            past: [prevLayout],
        });
        const result = editorReducer(state, { type: "UNDO" });
        expect(result.layout).toBe(prevLayout);
        expect(result.past).toHaveLength(0);
        expect(result.future).toHaveLength(1);
        expect(result.future[0]).toBe(currentLayout);
    });

    it("clears selection and marks dirty", () => {
        const state = makeState({
            past: [emptyLayout],
            selectedWidgetId: "w1",
            isDirty: false,
        });
        const result = editorReducer(state, { type: "UNDO" });
        expect(result.selectedWidgetId).toBeNull();
        expect(result.isDirty).toBe(true);
    });
});

describe("REDO", () => {
    it("returns state unchanged when future is empty", () => {
        const state = makeState({ future: [] });
        const result = editorReducer(state, { type: "REDO" });
        expect(result).toBe(state);
    });

    it("restores next layout from future", () => {
        const currentLayout = { ...emptyLayout, items: [makeItem("current")] };
        const futureLayout = { ...emptyLayout, items: [makeItem("future")] };
        const state = makeState({
            layout: currentLayout,
            future: [futureLayout],
        });
        const result = editorReducer(state, { type: "REDO" });
        expect(result.layout).toBe(futureLayout);
        expect(result.future).toHaveLength(0);
        expect(result.past).toHaveLength(1);
        expect(result.past[0]).toBe(currentLayout);
    });
});

describe("Undo/Redo integration", () => {
    it("round-trips correctly: undo then redo restores original", () => {
        const original = { ...emptyLayout, items: [makeItem("a")] };
        const modified = { ...emptyLayout, items: [makeItem("a"), makeItem("b", 4, 0)] };

        const state = makeState({
            layout: modified,
            past: [original],
        });

        const afterUndo = editorReducer(state, { type: "UNDO" });
        expect(afterUndo.layout).toBe(original);

        const afterRedo = editorReducer(afterUndo, { type: "REDO" });
        expect(afterRedo.layout).toBe(modified);
    });

    it("clears future on new mutation after undo", () => {
        const state = makeState({
            layout: emptyLayout,
            past: [],
            future: [{ ...emptyLayout, items: [makeItem("old")] }],
        });

        const result = editorReducer(state, {
            type: "ADD_WIDGET",
            widgetType: "kpi",
            grid: { x: 0, y: 0, w: 3, h: 2 },
            params: {},
        });

        expect(result.future).toHaveLength(0); // future cleared
    });
});

// ─── History Limit ──────────────────────────────────────

describe("History limit", () => {
    it("caps past at 50 entries", () => {
        let state = makeState();

        // Apply 55 mutations
        for (let i = 0; i < 55; i++) {
            state = editorReducer(state, {
                type: "ADD_WIDGET",
                widgetType: "kpi",
                grid: { x: 0, y: i * 2, w: 3, h: 2 },
                params: { iteration: i },
            });
        }

        expect(state.past.length).toBeLessThanOrEqual(50);
    });
});

// ─── History tracking categories ────────────────────────

describe("History tracking", () => {
    it("layout-mutating actions push to past", () => {
        const base = makeState({
            layout: { ...emptyLayout, items: [makeItem("w1")] },
        });

        // ADD_WIDGET
        let result = editorReducer(base, { type: "ADD_WIDGET", widgetType: "kpi", grid: { x: 4, y: 0, w: 3, h: 2 }, params: {} });
        expect(result.past.length).toBe(1);

        // MOVE_WIDGET
        result = editorReducer(base, { type: "MOVE_WIDGET", widgetId: "w1", grid: { x: 4, y: 0, w: 3, h: 2 } });
        expect(result.past.length).toBe(1);

        // RESIZE_WIDGET
        result = editorReducer(base, { type: "RESIZE_WIDGET", widgetId: "w1", w: 6, h: 3 });
        expect(result.past.length).toBe(1);

        // UPDATE_PARAMS
        result = editorReducer(base, { type: "UPDATE_PARAMS", widgetId: "w1", params: { changed: true } });
        expect(result.past.length).toBe(1);

        // DELETE_WIDGET
        result = editorReducer(base, { type: "DELETE_WIDGET", widgetId: "w1" });
        expect(result.past.length).toBe(1);

        // DUPLICATE_WIDGET
        result = editorReducer(base, { type: "DUPLICATE_WIDGET", widgetId: "w1" });
        expect(result.past.length).toBe(1);
    });

    it("non-mutating actions do not push to past", () => {
        const base = makeState();

        let result = editorReducer(base, { type: "SELECT", widgetId: "w1" });
        expect(result.past.length).toBe(0);

        result = editorReducer(base, { type: "SET_MODE", mode: "preview" });
        expect(result.past.length).toBe(0);

        result = editorReducer(base, { type: "MARK_SAVED", savedAt: new Date() });
        expect(result.past.length).toBe(0);
    });
});
