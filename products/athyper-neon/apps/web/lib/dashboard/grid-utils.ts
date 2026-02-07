/**
 * Grid calculation utilities for the dashboard editor.
 * Works with a 12-column CSS Grid layout.
 */

import type { GridPosition, LayoutItem } from "@athyper/dashboard";

const GRID_COLUMNS = 12;

/**
 * Convert a pointer position (relative to canvas) to grid coordinates.
 */
export function pointerToGrid(
    pointerX: number,
    pointerY: number,
    canvasWidth: number,
    rowHeight: number,
    gap: number,
): { x: number; y: number } {
    const colWidth = (canvasWidth - gap * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
    const x = Math.max(0, Math.min(GRID_COLUMNS - 1, Math.floor(pointerX / (colWidth + gap))));
    const y = Math.max(0, Math.floor(pointerY / (rowHeight + gap)));
    return { x, y };
}

/**
 * Check if two grid rectangles overlap.
 */
export function itemsOverlap(a: GridPosition, b: GridPosition): boolean {
    const aRight = a.x + a.w;
    const aBottom = a.y + a.h;
    const bRight = b.x + b.w;
    const bBottom = b.y + b.h;

    return a.x < bRight && aRight > b.x && a.y < bBottom && aBottom > b.y;
}

/**
 * Find the next available slot on the grid for a widget of given size.
 * Scans top-to-bottom, left-to-right.
 */
export function findAvailableSlot(
    existingItems: LayoutItem[],
    width: number,
    height: number,
): GridPosition {
    const occupied = existingItems.map((item) => item.grid);

    for (let y = 0; y < 100; y++) {
        for (let x = 0; x <= GRID_COLUMNS - width; x++) {
            const candidate: GridPosition = { x, y, w: width, h: height };
            const hasCollision = occupied.some((occ) => itemsOverlap(candidate, occ));
            if (!hasCollision) {
                return candidate;
            }
        }
    }

    // Fallback: place at bottom
    const maxY = existingItems.reduce((max, item) => Math.max(max, item.grid.y + item.grid.h), 0);
    return { x: 0, y: maxY, w: width, h: height };
}

/**
 * Resolve collisions by pushing overlapping items down.
 * Returns a new array of items with adjusted positions.
 */
export function resolveCollisions(
    items: LayoutItem[],
    movedItem: LayoutItem,
): LayoutItem[] {
    const result = items.map((item) => {
        if (item.id === movedItem.id) return movedItem;

        // Check if this item overlaps with the moved item
        if (itemsOverlap(item.grid, movedItem.grid)) {
            // Push it down below the moved item
            return {
                ...item,
                grid: {
                    ...item.grid,
                    y: movedItem.grid.y + movedItem.grid.h,
                },
            };
        }

        return item;
    });

    return result;
}

/**
 * Clamp a grid position to valid bounds.
 */
export function clampGrid(grid: GridPosition): GridPosition {
    const x = Math.max(0, Math.min(GRID_COLUMNS - grid.w, grid.x));
    const y = Math.max(0, grid.y);
    const w = Math.max(1, Math.min(GRID_COLUMNS - x, grid.w));
    const h = Math.max(1, grid.h);
    return { x, y, w, h };
}

/**
 * Get the bounding row (max y + h) of all items.
 */
export function getGridHeight(items: LayoutItem[]): number {
    if (items.length === 0) return 0;
    return items.reduce((max, item) => Math.max(max, item.grid.y + item.grid.h), 0);
}
