/**
 * Computes the diff between two dashboard layouts.
 * Matches layout items by widget `id`.
 */

import type { LayoutItem } from "@athyper/dashboard";

export interface LayoutDiff {
    added: LayoutItem[];
    removed: LayoutItem[];
    modified: Array<{ before: LayoutItem; after: LayoutItem }>;
    unchanged: LayoutItem[];
}

export function computeLayoutDiff(
    oldItems: LayoutItem[],
    newItems: LayoutItem[],
): LayoutDiff {
    const oldMap = new Map(oldItems.map((item) => [item.id, item]));
    const newMap = new Map(newItems.map((item) => [item.id, item]));

    const added: LayoutItem[] = [];
    const removed: LayoutItem[] = [];
    const modified: Array<{ before: LayoutItem; after: LayoutItem }> = [];
    const unchanged: LayoutItem[] = [];

    // Check new items against old
    for (const [id, newItem] of newMap) {
        const oldItem = oldMap.get(id);
        if (!oldItem) {
            added.push(newItem);
        } else if (hasChanged(oldItem, newItem)) {
            modified.push({ before: oldItem, after: newItem });
        } else {
            unchanged.push(newItem);
        }
    }

    // Find removed items
    for (const [id, oldItem] of oldMap) {
        if (!newMap.has(id)) {
            removed.push(oldItem);
        }
    }

    return { added, removed, modified, unchanged };
}

function hasChanged(a: LayoutItem, b: LayoutItem): boolean {
    // Check widget type
    if (a.widget_type !== b.widget_type) return true;

    // Check grid position
    if (
        a.grid.x !== b.grid.x ||
        a.grid.y !== b.grid.y ||
        a.grid.w !== b.grid.w ||
        a.grid.h !== b.grid.h
    ) {
        return true;
    }

    // Check params (shallow JSON comparison)
    if (JSON.stringify(a.params) !== JSON.stringify(b.params)) return true;

    return false;
}
