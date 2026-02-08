import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SIDEBAR_COLLAPSIBLE_VALUES, SIDEBAR_VARIANT_VALUES } from "@/lib/preferences/layout";
import { cn } from "@/lib/utils";
import { getPreference } from "@/app/actions/preferences";
import { AuthProvider } from "@/lib/auth/auth-context";
import { isReservedSlug } from "@/lib/nav/reserved-keywords";

interface EntityLayoutProps {
    children: ReactNode;
    params: Promise<{ entity: string }>;
}

/**
 * Entity runtime layout for /app/[entity]/* routes.
 * Validates entity slug against reserved keywords and renders the shell.
 * Resolves the active workbench from the session bootstrap.
 */
export default async function EntityLayout({ children, params }: EntityLayoutProps) {
    const { entity } = await params;

    // Validate that the entity slug is not a reserved keyword
    if (isReservedSlug(entity)) {
        notFound();
    }

    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
    const [variant, collapsible] = await Promise.all([
        getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
        getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
    ]);

    // Default to "user" workbench for entity runtime routes
    // The actual workbench context is determined from the session
    const workbench = "user" as const;

    return (
        <AuthProvider activeWorkbench={workbench}>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar
                    workbench={workbench}
                    variant={variant}
                    collapsible={collapsible}
                />
                <SidebarInset
                    className={cn(
                        "[html[data-content-layout=centered]_&]:mx-auto! [html[data-content-layout=centered]_&]:max-w-screen-2xl!",
                        "max-[113rem]:peer-data-[variant=inset]:mr-2! min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:mr-auto!",
                    )}
                >
                    <header
                        className={cn(
                            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
                            "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
                        )}
                    >
                        <div className="flex w-full items-center justify-between px-4 lg:px-6">
                            <div className="flex items-center gap-1 lg:gap-2">
                                <SidebarTrigger className="-ml-1" />
                                <Separator
                                    orientation="vertical"
                                    className="mx-2 data-[orientation=vertical]:h-4"
                                />
                                <span className="text-sm font-medium capitalize">{entity.replace(/-/g, " ")}</span>
                            </div>
                        </div>
                    </header>
                    <div className="h-full p-4 md:p-6">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </AuthProvider>
    );
}
