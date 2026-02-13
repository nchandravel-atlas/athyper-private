"use client";

import { Plus, RefreshCw, Shapes } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/mesh/shared/EmptyState";
import { useSchemaList } from "@/lib/schema-manager/use-schema-list";

import { SchemaCard } from "./SchemaCard";
import { SchemaFilters } from "./SchemaFilters";
import { SchemaTable } from "./SchemaTable";

import type { SchemaFilterValues } from "./SchemaFilters";
import type { EntitySummary } from "@/lib/schema-manager/types";

interface SchemaExplorerProps {
    basePath: string;
}

function filterEntities(entities: EntitySummary[], filters: SchemaFilterValues): EntitySummary[] {
    return entities.filter((e) => {
        if (filters.search) {
            const q = filters.search.toLowerCase();
            if (!e.name.toLowerCase().includes(q) && !e.tableName.toLowerCase().includes(q)) {
                return false;
            }
        }
        if (filters.kind !== "all" && e.kind !== filters.kind) return false;
        if (filters.status !== "all") {
            const status = e.currentVersion?.status ?? "draft";
            if (status !== filters.status) return false;
        }
        return true;
    });
}

export function SchemaExplorer({ basePath }: SchemaExplorerProps) {
    const { entities, loading, error, refresh } = useSchemaList();
    const [filters, setFilters] = useState<SchemaFilterValues>({
        search: "",
        kind: "all",
        status: "all",
    });
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    const filtered = useMemo(() => filterEntities(entities, filters), [entities, filters]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-[200px]" />
                    <Skeleton className="h-9 w-[140px]" />
                    <Skeleton className="h-9 w-[140px]" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-[120px] rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
                    <RefreshCw className="mr-1.5 size-3.5" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <SchemaFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={refresh}>
                        <RefreshCw className="size-3.5" />
                    </Button>
                    <Button size="sm">
                        <Plus className="mr-1.5 size-3.5" />
                        New Entity
                    </Button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Shapes}
                    title="No entities found"
                    description={
                        entities.length === 0
                            ? "Get started by creating your first entity definition."
                            : "No entities match your current filters. Try adjusting your search."
                    }
                    actionLabel={entities.length === 0 ? "Create Entity" : undefined}
                />
            ) : viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((entity) => (
                        <SchemaCard key={entity.id} entity={entity} basePath={basePath} />
                    ))}
                </div>
            ) : (
                <SchemaTable entities={filtered} basePath={basePath} />
            )}

            {filtered.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    Showing {filtered.length} of {entities.length} entities
                </p>
            )}
        </div>
    );
}
