"use client";

// components/mesh/list/ViewSettingsSheet.tsx
//
// Right-side Sheet with tabbed Columns/Sort/Group settings.
// Uses a buffered state pattern: changes accumulate in a local draft,
// OK commits them, Cancel discards them.

import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useListPage, useListPageActions } from "./ListPageContext";
import { ColumnsTab } from "./settings/ColumnsTab";
import { GroupTab } from "./settings/GroupTab";
import { SortTab } from "./settings/SortTab";

import type { GroupRule, ListPageState, SortRule } from "./types";

/** Subset of ListPageState managed by the settings sheet. */
export interface SettingsDraft {
    columnVisibility: Record<string, boolean>;
    columnOrder: string[];
    sortRules: SortRule[];
    groupBy: GroupRule[];
}

function stateToDraft(state: ListPageState): SettingsDraft {
    return {
        columnVisibility: { ...state.columnVisibility },
        columnOrder: [...state.columnOrder],
        sortRules: state.sortRules.map((r) => ({ ...r })),
        groupBy: state.groupBy.map((r) => ({ ...r })),
    };
}

export function ViewSettingsSheet<T>() {
    const { state, config, capabilities } = useListPage<T>();
    const actions = useListPageActions();

    const [draft, setDraft] = useState<SettingsDraft>(() => stateToDraft(state));

    // Re-snapshot draft whenever the sheet opens
    useEffect(() => {
        if (state.settingsOpen) {
            setDraft(stateToDraft(state));
        }
    }, [state.settingsOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleOk = useCallback(() => {
        actions.applySettings({
            columnVisibility: draft.columnVisibility,
            columnOrder: draft.columnOrder,
            sortRules: draft.sortRules,
            sortKey: draft.sortRules[0]?.fieldId ?? null,
            sortDir: draft.sortRules[0]?.dir ?? "asc",
            groupBy: draft.groupBy,
        });
    }, [draft, actions]);

    const handleCancel = useCallback(() => {
        actions.closeSettings();
    }, [actions]);

    const handleReset = useCallback(() => {
        // Reset to initial config defaults
        const columnVisibility: Record<string, boolean> = {};
        for (const col of config.columns) {
            columnVisibility[col.id] = !col.hidden;
        }
        setDraft({
            columnVisibility,
            columnOrder: config.columns.map((c) => c.id),
            sortRules: [],
            groupBy: [],
        });
    }, [config.columns]);

    // Draft updaters
    const updateColumnVisibility = useCallback(
        (vis: Record<string, boolean>) =>
            setDraft((prev) => ({ ...prev, columnVisibility: vis })),
        [],
    );

    const updateColumnOrder = useCallback(
        (order: string[]) =>
            setDraft((prev) => ({ ...prev, columnOrder: order })),
        [],
    );

    const updateSortRules = useCallback(
        (rules: SortRule[]) =>
            setDraft((prev) => ({ ...prev, sortRules: rules })),
        [],
    );

    const updateGroupBy = useCallback(
        (rules: GroupRule[]) =>
            setDraft((prev) => ({ ...prev, groupBy: rules })),
        [],
    );

    // Determine which tabs to show
    const hasSortableColumns = config.columns.some((c) => c.sortKey);
    const hasGroupableColumns = capabilities.groupableColumns.length > 0;

    return (
        <Sheet open={state.settingsOpen} onOpenChange={(open) => {
            if (!open) handleCancel();
        }}>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md" showCloseButton={false}>
                <SheetHeader className="flex-row items-center justify-between space-y-0">
                    <div>
                        <SheetTitle className="text-base">View Settings</SheetTitle>
                        <SheetDescription className="sr-only">
                            Configure columns, sorting, and grouping.
                        </SheetDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={handleReset}
                    >
                        <RotateCcw className="size-3" />
                        Reset
                    </Button>
                </SheetHeader>

                <Tabs defaultValue="columns" className="flex min-h-0 flex-1 flex-col">
                    <TabsList className="w-full shrink-0">
                        <TabsTrigger value="columns" className="flex-1 text-xs">
                            Columns
                        </TabsTrigger>
                        {hasSortableColumns && (
                            <TabsTrigger value="sort" className="flex-1 text-xs">
                                Sort
                                {draft.sortRules.length > 0 && (
                                    <span className="ml-1 text-[10px] text-muted-foreground">
                                        ({draft.sortRules.length})
                                    </span>
                                )}
                            </TabsTrigger>
                        )}
                        {hasGroupableColumns && (
                            <TabsTrigger value="group" className="flex-1 text-xs">
                                Group
                                {draft.groupBy.length > 0 && (
                                    <span className="ml-1 text-[10px] text-muted-foreground">
                                        ({draft.groupBy.length})
                                    </span>
                                )}
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="columns" className="min-h-0 flex-1 overflow-y-auto">
                        <ColumnsTab
                            columns={config.columns}
                            columnVisibility={draft.columnVisibility}
                            columnOrder={draft.columnOrder}
                            onVisibilityChange={updateColumnVisibility}
                            onOrderChange={updateColumnOrder}
                        />
                    </TabsContent>

                    {hasSortableColumns && (
                        <TabsContent value="sort" className="min-h-0 flex-1 overflow-y-auto">
                            <SortTab
                                columns={config.columns}
                                sortRules={draft.sortRules}
                                onSortRulesChange={updateSortRules}
                            />
                        </TabsContent>
                    )}

                    {hasGroupableColumns && (
                        <TabsContent value="group" className="min-h-0 flex-1 overflow-y-auto">
                            <GroupTab
                                columns={config.columns}
                                columnVisibility={draft.columnVisibility}
                                groupBy={draft.groupBy}
                                groupableColumns={capabilities.groupableColumns}
                                onGroupByChange={updateGroupBy}
                            />
                        </TabsContent>
                    )}
                </Tabs>

                <SheetFooter className="flex-row justify-end gap-2 border-t pt-4">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleOk}>
                        OK
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
