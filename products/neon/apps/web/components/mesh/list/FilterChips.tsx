"use client";

// components/mesh/list/FilterChips.tsx
//
// Renders active filters as removable badge chips below the command bar.

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useListPage, useListPageActions } from "./ListPageContext";

export function FilterChips<T>() {
    const { state, config } = useListPage<T>();
    const actions = useListPageActions();

    // Collect active (non-default) filters
    const chips: { key: string; label: string; value: string }[] = [];

    if (state.search) {
        chips.push({ key: "__search", label: "Search", value: state.search });
    }

    for (const qf of config.quickFilters) {
        const current = state.filters[qf.id];
        if (current && current !== qf.defaultValue) {
            const optLabel = qf.options.find((o) => o.value === current)?.label ?? current;
            chips.push({ key: qf.id, label: qf.label, value: optLabel });
        }
    }

    if (chips.length === 0) return null;

    const handleRemove = (key: string) => {
        if (key === "__search") {
            actions.setSearch("");
        } else {
            const qf = config.quickFilters.find((f) => f.id === key);
            if (qf) {
                actions.setFilter(key, qf.defaultValue);
            } else {
                actions.removeFilter(key);
            }
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {chips.map((chip) => (
                <Badge
                    key={chip.key}
                    variant="secondary"
                    className="gap-1 pr-1 text-xs font-normal"
                >
                    <span className="text-muted-foreground">{chip.label}:</span>
                    {chip.value}
                    <button
                        type="button"
                        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                        onClick={() => handleRemove(chip.key)}
                    >
                        <X className="size-3" />
                    </button>
                </Badge>
            ))}
            {chips.length > 1 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground"
                    onClick={actions.clearFilters}
                >
                    Clear all
                </Button>
            )}
        </div>
    );
}
