"use client";

// components/mesh/list/ListPageHeader.tsx
//
// Zone 1 — Page header with title, breadcrumb, item count, and optional primary CTA.

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { useListPage } from "./ListPageContext";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface ListPageHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function ListPageHeader<T>({ breadcrumbs }: ListPageHeaderProps) {
    const { config, filteredItems, allItems } = useListPage<T>();

    return (
        <div className="space-y-1">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={crumb.label} className="inline-flex items-center gap-1">
                            {i > 0 && <ChevronRight className="size-3" />}
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span>{crumb.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}

            {/* Title row */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                        <config.icon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">{config.pageTitle}</h1>
                        <p className="text-xs text-muted-foreground">
                            {filteredItems.length === allItems.length
                                ? `${allItems.length} ${config.entityLabelPlural}`
                                : `${filteredItems.length} of ${allItems.length} ${config.entityLabelPlural}`}
                        </p>
                    </div>
                    {filteredItems.length !== allItems.length && (
                        <Badge variant="outline" className="text-xs">
                            filtered
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
