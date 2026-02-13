"use client";

import {
    GitBranch, LayoutDashboard, Network, Package, Plug,
    ScrollText, Server, Shapes, Shield,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface MeshNavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface MeshNavGroup {
    label: string;
    items: MeshNavItem[];
}

const MESH_NAV: MeshNavGroup[] = [
    {
        label: "Overview",
        items: [
            { label: "Dashboard", href: "", icon: LayoutDashboard },
        ],
    },
    {
        label: "Studios",
        items: [
            { label: "Meta Studio", href: "/meta-studio", icon: Shapes },
            { label: "Workflow Studio", href: "/workflow-studio", icon: GitBranch },
            { label: "Policy Studio", href: "/policy-studio", icon: Shield },
            { label: "Integration Studio", href: "/integration-studio", icon: Plug },
        ],
    },
    {
        label: "Compliance",
        items: [
            { label: "Governance", href: "/governance", icon: ScrollText },
            { label: "Marketplace", href: "/marketplace", icon: Package },
        ],
    },
    {
        label: "Infrastructure",
        items: [
            { label: "Ops", href: "/ops", icon: Server },
        ],
    },
];

export default function MeshLayout({ children }: { children: ReactNode }) {
    const { wb } = useParams<{ wb: string }>();
    const pathname = usePathname();
    const basePath = `/wb/${wb}/mesh`;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Mesh Administration</h1>
                <p className="text-sm text-muted-foreground">
                    Design-time studios and infrastructure operations.
                </p>
            </div>

            <nav className="flex items-center gap-1 overflow-x-auto pb-1">
                {MESH_NAV.map((group, gi) => (
                    <div key={group.label} className="contents">
                        {gi > 0 && (
                            <span className="mx-1 text-border">|</span>
                        )}
                        {group.items.map((item) => {
                            const href = `${basePath}${item.href}`;
                            const isActive =
                                item.href === ""
                                    ? pathname === basePath || pathname === `${basePath}/`
                                    : pathname.startsWith(href);

                            return (
                                <Link
                                    key={item.href}
                                    href={href}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                >
                                    <item.icon className="size-3.5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <Separator />

            {children}
        </div>
    );
}
