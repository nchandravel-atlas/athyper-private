import Link from "next/link";
import { BarChart3, BookOpen, FileText, MessageSquare } from "lucide-react";

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
                {/* Quick Actions — with real links */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="space-y-4">
                        <Badge variant="outline" className="text-xs">Quick Actions</Badge>
                        <nav className="space-y-2">
                            <QuickLink
                                href={`/wb/${wb}/dashboards`}
                                icon={<BarChart3 className="size-4 text-blue-600" />}
                                label="Dashboards"
                                description="Analytics and reports"
                            />
                            <QuickLink
                                href={`/wb/${wb}/dashboards/messaging`}
                                icon={<MessageSquare className="size-4 text-indigo-600" />}
                                label="Messaging Analytics"
                                description="Conversation metrics and trends"
                            />
                            <QuickLink
                                href="/app/account/view/list"
                                icon={<BookOpen className="size-4 text-emerald-600" />}
                                label="Accounts"
                                description="Chart of Accounts (Master)"
                            />
                            <QuickLink
                                href="/app/purchase-invoice/view/list"
                                icon={<FileText className="size-4 text-amber-600" />}
                                label="Purchase Invoices"
                                description="Supplier invoices (Document)"
                            />
                        </nav>
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

function QuickLink({
    href,
    icon,
    label,
    description,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
        >
            {icon}
            <div>
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
            </div>
        </Link>
    );
}
