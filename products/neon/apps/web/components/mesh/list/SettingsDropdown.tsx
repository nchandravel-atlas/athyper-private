"use client";

// components/mesh/list/SettingsDropdown.tsx
//
// Settings button that opens the ViewSettingsSheet drawer.
// Shows active preset name + dirty indicator.

import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { useListPage, useListPageActions } from "./ListPageContext";
import { fetchPresets } from "./preset-api";

import type { ViewPreset } from "./types";

export function SettingsDropdown<T>() {
    const { state, config } = useListPage<T>();
    const actions = useListPageActions();

    // Load user presets to resolve active preset label
    const [userPresets, setUserPresets] = useState<ViewPreset[]>([]);
    useEffect(() => {
        fetchPresets(config.basePath).then(setUserPresets).catch(() => setUserPresets([]));
    }, [config.basePath]);

    const allPresets = useMemo(() => {
        const configPresets = config.presets ?? [];
        return [...configPresets, ...userPresets];
    }, [config.presets, userPresets]);

    const activePreset = allPresets.find((p) => p.id === state.activePresetId);
    const presetLabel = activePreset?.label ?? "Default";

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 px-2.5"
                        onClick={() => actions.openSettings()}
                    >
                        <Settings2 className="size-3.5" />
                        <span className="max-w-[100px] truncate text-xs">
                            {presetLabel}
                        </span>
                        {state.presetDirty && (
                            <span className="size-1.5 rounded-full bg-amber-500" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    View Settings
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
