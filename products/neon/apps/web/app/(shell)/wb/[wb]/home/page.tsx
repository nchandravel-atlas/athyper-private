import { Badge } from "@/components/ui/badge";

interface HomePageProps {
    params: Promise<{ wb: string }>;
}

export default async function WorkbenchHomePage({ params }: HomePageProps) {
    const { wb } = await params;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight capitalize">
                    {wb} Workbench
                </h1>
                <p className="text-sm text-muted-foreground">
                    Welcome to the {wb} workbench home page.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border bg-card p-6">
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">Quick Actions</Badge>
                        <p className="text-sm text-muted-foreground">
                            Dashboard widgets and quick actions will appear here.
                        </p>
                    </div>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">Recent Activity</Badge>
                        <p className="text-sm text-muted-foreground">
                            Recent activity and notifications will appear here.
                        </p>
                    </div>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">Favorites</Badge>
                        <p className="text-sm text-muted-foreground">
                            Pinned items and favorites will appear here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
