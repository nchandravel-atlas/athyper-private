"use client";

// components/mesh/list/ViewRouter.tsx
//
// Central component that renders the active view mode + preview drawer.

import { AdaptFiltersSheet } from "./AdaptFiltersSheet";
import { AdjustableDataGrid } from "./AdjustableDataGrid";
import { EntityCardGrid } from "./EntityCardGrid";
import { EntityDataGrid } from "./EntityDataGrid";
import { KanbanBoard } from "./KanbanBoard";
import { useListPage } from "./ListPageContext";
import { PreviewDrawer } from "./PreviewDrawer";
import { ViewSettingsSheet } from "./ViewSettingsSheet";

export function ViewRouter<T>() {
    const { state } = useListPage<T>();

    let view: React.ReactNode;
    switch (state.viewMode) {
        case "table":
            view = <EntityDataGrid<T> />;
            break;
        case "table-columns":
            view = <AdjustableDataGrid<T> />;
            break;
        case "card-grid":
            view = <EntityCardGrid<T> />;
            break;
        case "kanban":
            view = <KanbanBoard<T> />;
            break;
    }

    return (
        <>
            {view}
            <PreviewDrawer<T> />
            <ViewSettingsSheet<T> />
            <AdaptFiltersSheet<T> />
        </>
    );
}
