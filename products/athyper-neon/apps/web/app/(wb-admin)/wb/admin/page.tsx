import { redirect } from "next/navigation";
import { runtimeFetch } from "../../../../lib/runtime-client";
import { Card } from "@neon/ui";

export default async function AdminHome() {
    // Dev mode: show the auth debug console
    if (process.env.SHOW_DEBUG_CONSOLE === "true") {
        const { DebugConsole } = await import("./_components/DebugConsole");
        return <DebugConsole />;
    }

    // Redirect to the first available dashboard
    try {
        const res = await runtimeFetch("/api/ui/dashboards?workbench=admin");
        if (res.ok) {
            const data = (await res.json()) as { groups?: Array<{ dashboards?: Array<{ id: string }> }> };
            const first = data?.groups?.[0]?.dashboards?.[0];
            if (first) {
                redirect(`/wb/admin/dashboard/${first.id}`);
            }
        }
    } catch {
        // Runtime unreachable — show welcome card
    }

    return (
        <main className="mx-auto max-w-3xl p-8 space-y-4">
            <Card>
                <h1 className="text-2xl font-semibold">Admin Workbench</h1>
                <p className="mt-2 text-sm text-black/60">
                    No dashboards available. Create one from the dashboard list or contact your administrator.
                </p>
            </Card>
        </main>
    );
}
