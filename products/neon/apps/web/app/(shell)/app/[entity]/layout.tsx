import { notFound } from "next/navigation";

import { GlobalDrawer, GlobalDrawerProvider, GlobalDrawerTrigger } from "@/components/shell/GlobalDrawer";
import { Separator } from "@/components/ui/separator";
import { AuthProvider } from "@/lib/auth/auth-context";
import { isReservedSlug } from "@/lib/nav/reserved-keywords";

interface EntityLayoutProps {
    children: React.ReactNode;
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

    // Default to "user" workbench for entity runtime routes
    // The actual workbench context is determined from the session
    const workbench = "user" as const;

    return (
        <AuthProvider activeWorkbench={workbench}>
            <GlobalDrawerProvider>
                <GlobalDrawer workbench={workbench} />
                <div className="flex min-h-svh flex-col">
                    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
                        <GlobalDrawerTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mx-2 data-[orientation=vertical]:h-4"
                        />
                        <span className="text-sm font-medium capitalize">
                            {entity.replace(/-/g, " ")}
                        </span>
                    </header>
                    <main data-slot="shell-main" className="flex-1 overflow-auto p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </GlobalDrawerProvider>
        </AuthProvider>
    );
}
