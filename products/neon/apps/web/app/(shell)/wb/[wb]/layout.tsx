import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_COLLAPSIBLE_VALUES, SIDEBAR_VARIANT_VALUES } from "@/lib/preferences/layout";
import { cn } from "@/lib/utils";
import { getPreference } from "@/app/actions/preferences";
import { AuthProvider } from "@/lib/auth/auth-context";
import { isWorkbench, type Workbench } from "@/lib/auth/types";
import { ShellHeader } from "@/components/shell/ShellHeader";

interface WorkbenchLayoutProps {
    children: ReactNode;
    params: Promise<{ wb: string }>;
}

export default async function WorkbenchLayout({ children, params }: WorkbenchLayoutProps) {
    const { wb } = await params;

    // Validate the workbench param against the frozen enumeration
    if (!isWorkbench(wb)) {
        notFound();
    }

    const validWorkbench: Workbench = wb;

    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
    const [variant, collapsible] = await Promise.all([
        getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
        getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
    ]);

    return (
        <AuthProvider activeWorkbench={validWorkbench}>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar
                    workbench={validWorkbench}
                    variant={variant}
                    collapsible={collapsible}
                />
                <SidebarInset
                    className={cn(
                        "[html[data-content-layout=centered]_&]:mx-auto! [html[data-content-layout=centered]_&]:max-w-screen-2xl!",
                        "max-[113rem]:peer-data-[variant=inset]:mr-2! min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:mr-auto!",
                    )}
                >
                    <ShellHeader workbench={validWorkbench} />
                    <div className="h-full p-4 md:p-6">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </AuthProvider>
    );
}
