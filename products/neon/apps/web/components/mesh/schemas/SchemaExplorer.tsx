"use client";

// components/mesh/schemas/SchemaExplorer.tsx
//
// Meta-Studio schema explorer — enhanced version using the generic list page system.

import { useMemo } from "react";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSchemaList } from "@/lib/schema-manager/use-schema-list";

import {
    AdvancedFilterPanel,
    EntityCardGrid,
    EntityDataGrid,
    FilterChips,
    KpiSummaryBar,
    ListCommandBar,
    ListPageFooter,
    ListPageHeader,
    ListPageProvider,
    SelectionToolbar,
    useListPage,
} from "@/components/mesh/list";

import { createSchemaListConfig } from "./schema-list-config";

import type { EntitySummary } from "@/lib/schema-manager/types";

// ─── Inner content (consumes context) ────────────────────────

function SchemaExplorerContent() {
    const { state, error, refresh } = useListPage<EntitySummary>();

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
            {/* Zone 1 — Page Header */}
            <ListPageHeader<EntitySummary>
                breadcrumbs={[
                    { label: "Admin", href: "#" },
                    { label: "Mesh" },
                    { label: "Schema Explorer" },
                ]}
            />

            {/* Zone 2 — KPI Summary */}
            <KpiSummaryBar<EntitySummary> />

            {/* Zone 3 — Command Bar */}
            <ListCommandBar<EntitySummary> />

            {/* Filter Chips */}
            <FilterChips<EntitySummary> />

            {/* Zone 3B — Advanced Filters */}
            <AdvancedFilterPanel<EntitySummary> />

            {/* Selection Toolbar */}
            <SelectionToolbar<EntitySummary> />

            {/* Zone 4 — Results */}
            {state.viewMode === "table" ? (
                <EntityDataGrid<EntitySummary> />
            ) : (
                <EntityCardGrid<EntitySummary> />
            )}

            {/* Footer */}
            <ListPageFooter<EntitySummary> />
        </div>
    );
}

// ─── Wrapper (provides context) ──────────────────────────────

interface SchemaExplorerProps {
    basePath: string;
}

export function SchemaExplorer({ basePath }: SchemaExplorerProps) {
    const { entities, loading, error, refresh } = useSchemaList();
    const config = useMemo(() => createSchemaListConfig(basePath), [basePath]);

    return (
        <ListPageProvider<EntitySummary>
            config={config}
            items={entities}
            loading={loading}
            error={error}
            refresh={refresh}
        >
            <SchemaExplorerContent />
        </ListPageProvider>
    );
}
