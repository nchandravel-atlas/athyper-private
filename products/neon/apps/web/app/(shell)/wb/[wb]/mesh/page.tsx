"use client";

import {
    Database, Globe, HardDrive, KeyRound,
    Server, Shapes,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import type { LucideIcon } from "lucide-react";

interface MeshSectionCard {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    status: "active" | "planned";
}

const SECTIONS: MeshSectionCard[] = [
    {
        title: "Schema Manager",
        description: "Manage entity definitions, fields, relations, versioning, policies, and compiled snapshots.",
        icon: Shapes,
        href: "/schemas",
        status: "active",
    },
    {
        title: "Infrastructure",
        description: "Monitor Docker services, containers, networks, and resource usage.",
        icon: Server,
        href: "/infrastructure",
        status: "planned",
    },
    {
        title: "Gateway",
        description: "Configure Traefik routes, middleware, TLS certificates, and load balancing.",
        icon: Globe,
        href: "/gateway",
        status: "planned",
    },
    {
        title: "Identity & Access",
        description: "Manage Keycloak realms, clients, identity providers, and federation.",
        icon: KeyRound,
        href: "/iam",
        status: "planned",
    },
    {
        title: "Cache",
        description: "Monitor Redis instances, manage cache policies, and inspect stored keys.",
        icon: Database,
        href: "/cache",
        status: "planned",
    },
    {
        title: "Object Storage",
        description: "Manage MinIO buckets, object lifecycle policies, and storage quotas.",
        icon: HardDrive,
        href: "/storage",
        status: "planned",
    },
];

export default function MeshDashboardPage() {
    const { wb } = useParams<{ wb: string }>();
    const basePath = `/wb/${wb}/mesh`;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {SECTIONS.map((section) => (
                    <Link key={section.href} href={`${basePath}${section.href}`}>
                        <Card className="group h-full transition-all hover:shadow-md hover:border-foreground/20">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="rounded-lg bg-muted p-2.5 transition-colors group-hover:bg-primary/10">
                                        <section.icon className="size-5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <Badge
                                        variant={section.status === "active" ? "default" : "outline"}
                                        className="text-xs"
                                    >
                                        {section.status === "active" ? "Active" : "Planned"}
                                    </Badge>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">{section.title}</h3>
                                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                        {section.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
