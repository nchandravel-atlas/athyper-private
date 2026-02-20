"use client";

// components/mesh/list/ListCommandBar.tsx
//
// Zone 3 — Command Bar + Quick Filters.
// Search | Quick filters | Presets | View toggle | Refresh | Advanced toggle | Primary CTA

import {
    AlignJustify,
    Filter,
    Maximize2,
    RefreshCw,
    Search,
    Shrink,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useListPage, useListPageActions } from "./ListPageContext";
import { ViewPresetSelector } from "./ViewPresetSelector";
import { ViewSwitcher } from "./ViewSwitcher";

import type { Density } from "./types";

const DENSITY_OPTIONS: { value: Density; label: string; icon: typeof AlignJustify }[] = [
    { value: "compact", label: "Compact", icon: Shrink },
    { value: "comfortable", label: "Comfortable", icon: AlignJustify },
    { value: "spacious", label: "Spacious", icon: Maximize2 },
];

export function ListCommandBar<T>() {
    const { state, config, loading, refresh } = useListPage<T>();
    const actions = useListPageActions();

    // Debounced search
    const [searchInput, setSearchInput] = useState(state.search);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchInput(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                actions.setSearch(value);
            }, 300);
        },
        [actions],
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // Sync external search state changes back to input
    useEffect(() => {
        if (!state.search && searchInput) {
            setSearchInput("");
        }
    }, [state.search]);

    // Count active advanced filters
    const advancedCount = config.advancedFilters
        ? Object.keys(state.advancedFilters).filter((k) => state.advancedFilters[k]).length
        : 0;

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={config.searchPlaceholder}
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-8 h-9"
                />
            </div>

            {/* Quick Filters */}
            {config.quickFilters.map((qf) => (
                <Select
                    key={qf.id}
                    value={state.filters[qf.id] ?? qf.defaultValue}
                    onValueChange={(v) => actions.setFilter(qf.id, v)}
                >
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder={qf.label} />
                    </SelectTrigger>
                    <SelectContent>
                        {qf.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}

            {/* Advanced Filter Toggle */}
            {config.advancedFilters && config.advancedFilters.length > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={actions.toggleAdvanced}
                >
                    <Filter className="size-3.5" />
                    Filters
                    {advancedCount > 0 && (
                        <Badge variant="secondary" className="ml-1 size-5 p-0 text-[10px]">
                            {advancedCount}
                        </Badge>
                    )}
                </Button>
            )}

            {/* View Presets */}
            <ViewPresetSelector<T> />

            {/* View Switcher */}
            <ViewSwitcher<T> />

            {/* Density */}
            <TooltipProvider delayDuration={300}>
                <ToggleGroup
                    type="single"
                    value={state.density}
                    onValueChange={(v) => {
                        if (v) actions.setDensity(v as Density);
                    }}
                    className="h-9 gap-0 rounded-md border"
                >
                    {DENSITY_OPTIONS.map((opt) => (
                        <Tooltip key={opt.value}>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value={opt.value}
                                    className="h-full rounded-none px-2 first:rounded-l-md last:rounded-r-md data-[state=on]:bg-muted"
                                >
                                    <opt.icon className="size-3.5" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {opt.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </ToggleGroup>
            </TooltipProvider>

            {/* Refresh */}
            <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={refresh}
                disabled={loading}
            >
                <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            </Button>

            {/* Primary CTA */}
            {config.primaryAction && (
                <Button size="sm" className="h-9" onClick={config.primaryAction.onClick}>
                    {config.primaryAction.icon && (
                        <config.primaryAction.icon className="mr-1.5 size-3.5" />
                    )}
                    {config.primaryAction.label}
                </Button>
            )}
        </div>
    );
}
