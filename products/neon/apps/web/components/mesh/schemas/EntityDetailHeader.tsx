"use client";

import { Archive, Clock, Cog, MoreVertical, Play, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { BackLink } from "@/components/mesh/shared/BackLink";
import { KindBadge } from "@/components/mesh/shared/KindBadge";
import { VersionBadge } from "@/components/mesh/shared/VersionBadge";
import { ActivityDrawer } from "./ActivityDrawer";

import type { EntitySummary } from "@/lib/schema-manager/types";

// ─── Version Status Banner ────────────────────────────────────

function VersionStatusBanner({ status }: { status: string }) {
    if (status === "draft") {
        return (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                Draft — changes are not live until published
            </div>
        );
    }
    if (status === "published") {
        return (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Published — this version is read-only. Create a new version to make changes.
            </div>
        );
    }
    if (status === "archived") {
        return (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                Archived — this version is deprecated and read-only
            </div>
        );
    }
    return null;
}

// ─── Header ───────────────────────────────────────────────────

interface EntityDetailHeaderProps {
    entity: EntitySummary | null;
    loading: boolean;
    backHref: string;
}

export function EntityDetailHeader({ entity, loading, backHref }: EntityDetailHeaderProps) {
    const [activityOpen, setActivityOpen] = useState(false);

    if (loading || !entity) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-64" />
            </div>
        );
    }

    const version = entity.currentVersion;

    return (
        <div className="space-y-2">
            <BackLink href={backHref} label="Back to Schemas" />

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <h2 className="text-xl font-semibold tracking-tight truncate">
                        {entity.name}
                    </h2>
                    <KindBadge kind={entity.kind} />
                    {version && (
                        <VersionBadge version={version.versionNo} status={version.status} />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActivityOpen(true)}>
                        <Clock className="mr-1.5 size-3.5" />
                        Activity
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Plus className="mr-2 size-4" />
                                New Version
                            </DropdownMenuItem>
                            {version?.status === "draft" && (
                                <DropdownMenuItem>
                                    <Play className="mr-2 size-4" />
                                    Publish Version
                                </DropdownMenuItem>
                            )}
                            {version?.status === "published" && (
                                <DropdownMenuItem>
                                    <Archive className="mr-2 size-4" />
                                    Deprecate
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                                <Cog className="mr-2 size-4" />
                                Recompile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 size-4" />
                                Delete Entity
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {version && <VersionStatusBanner status={version.status} />}

            <ActivityDrawer
                open={activityOpen}
                onOpenChange={setActivityOpen}
                entityName={entity.name}
            />
        </div>
    );
}
