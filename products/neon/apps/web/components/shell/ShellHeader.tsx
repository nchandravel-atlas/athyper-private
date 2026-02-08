"use client";

// components/shell/ShellHeader.tsx
//
// Header bar for the workbench shell.
// Left: SidebarTrigger + Separator + SearchDialog
// Right: Notification/Help/AI icons + WorkbenchSwitcher + TenantSwitcher

import { Bell, CircleHelp, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMessages } from "@/lib/i18n/messages-context";
import { SearchDialog } from "@/components/sidebar/search-dialog";
import { ViewportSwitcher } from "@/components/shell/ViewportSwitcher";
import { LocaleSwitcher } from "@/components/shell/LocaleSwitcher";
import { WorkbenchSwitcher } from "@/components/shell/WorkbenchSwitcher";
import { TenantSwitcher } from "@/components/shell/TenantSwitcher";

interface ShellHeaderProps {
    workbench: string;
}

export function ShellHeader({ workbench }: ShellHeaderProps) {
    const { t } = useMessages();

    return (
        <header
            className={cn(
                "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
                "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
            )}
        >
            <div className="flex w-full items-center justify-between px-4 lg:px-6">
                {/* Left section: Sidebar trigger + Search */}
                <div className="flex items-center gap-1 lg:gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                    <SearchDialog />
                    <ViewportSwitcher />
                </div>

                {/* Right section: Icons + Switchers */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <Bell className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("common.header.notifications")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <CircleHelp className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("common.header.help")}</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                                <Sparkles className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("common.header.ai_assistant")}</TooltipContent>
                    </Tooltip>

                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />

                    <LocaleSwitcher />

                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />

                    <WorkbenchSwitcher />

                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />

                    <TenantSwitcher workbench={workbench} />
                </div>
            </div>
        </header>
    );
}
