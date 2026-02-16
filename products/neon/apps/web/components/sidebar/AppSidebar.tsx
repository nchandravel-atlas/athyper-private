"use client";

// components/sidebar/AppSidebar.tsx
//
// Main sidebar component. Renders the dynamic navigation tree,
// dashboards section, and user profile footer.

import { Command } from "lucide-react";
import Link from "next/link";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavDynamic } from "./NavDynamic";
import { NavUser } from "./NavUser";

import type { Workbench } from "@/lib/auth/types";


interface AppSidebarProps {
    workbench: Workbench;
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
}

export function AppSidebar({
    workbench,
    variant = "inset",
    collapsible = "icon",
}: AppSidebarProps) {
    const csrfToken = typeof window !== "undefined"
        ? ((window as any).__SESSION_BOOTSTRAP__?.csrfToken as string | undefined)
        : undefined;

    return (
        <Sidebar variant={variant} collapsible={collapsible}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/wb/${workbench}/home`}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Neon</span>
                                    <span className="truncate text-xs capitalize">{workbench}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavDynamic workbench={workbench} csrfToken={csrfToken} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
