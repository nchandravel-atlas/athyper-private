"use client";

import {
    User,
    Handshake,
    Shield,
    Settings,
    ChevronsUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";


import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthOptional } from "@/lib/auth/auth-context";
import { setLastWorkbench } from "@/lib/auth/context-resolver";
import { WORKBENCH_CONFIGS } from "@/lib/auth/workbench-config";

import type { Workbench } from "@/lib/auth/types";


const ICON_MAP: Record<string, typeof Shield> = {
    User,
    Handshake,
    Shield,
    Settings,
};

export function WorkbenchSwitcher() {
    const auth = useAuthOptional();
    const router = useRouter();

    if (!auth) return null;

    const current = WORKBENCH_CONFIGS[auth.activeWorkbench];
    const CurrentIcon = ICON_MAP[current.icon] ?? Shield;

    function handleSwitch(wb: Workbench) {
        if (wb === auth!.activeWorkbench) return;
        setLastWorkbench(wb);
        const target = WORKBENCH_CONFIGS[wb].defaultRoute;
        router.push(target);
    }

    // If only one workbench available, show it as a static label
    if (auth.allowedWorkbenches.length <= 1) {
        return (
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <CurrentIcon className="size-4" />
                <span className="hidden sm:inline">{current.label}</span>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                    <CurrentIcon className="size-4" />
                    <span className="hidden sm:inline">{current.label}</span>
                    <ChevronsUpDown className="size-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {auth.allowedWorkbenches.map((wb) => {
                    const config = WORKBENCH_CONFIGS[wb];
                    const Icon = ICON_MAP[config.icon] ?? Shield;
                    const isActive = wb === auth.activeWorkbench;

                    return (
                        <DropdownMenuItem
                            key={wb}
                            onClick={() => handleSwitch(wb)}
                            className={isActive ? "bg-accent" : ""}
                        >
                            <Icon className="mr-2 size-4" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{config.label}</span>
                                <span className="text-xs text-muted-foreground">
                                    {config.description}
                                </span>
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
