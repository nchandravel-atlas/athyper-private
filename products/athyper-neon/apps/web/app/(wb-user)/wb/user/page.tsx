import { redirect } from "next/navigation";
import { runtimeFetch } from "../../../../lib/runtime-client";
import { Card } from "@neon/ui";

export default async function UserHome() {
    try {
        const res = await runtimeFetch("/api/ui/dashboards?workbench=user");
        if (res.ok) {
            const data = (await res.json()) as { groups?: Array<{ dashboards?: Array<{ id: string }> }> };
            const first = data?.groups?.[0]?.dashboards?.[0];
            if (first) {
                redirect(`/wb/user/dashboard/${first.id}`);
            }
        }
    } catch {
        // Runtime unreachable — show welcome card
    }

    return (
        <main className="mx-auto max-w-3xl p-8 space-y-4">
            <Card>
                <h1 className="text-2xl font-semibold">User Workbench</h1>
                <p className="mt-2 text-sm text-black/60">
                    No dashboards available. Tasks, approvals, and operational pages will appear here.
                </p>
            </Card>
        </main>
    );
}
