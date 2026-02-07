"use client";

import { createContext, useContext } from "react";
import type { Dispatch } from "react";
import type { EditorState, EditorAction } from "../../../lib/dashboard/use-dashboard-editor";
import type { LayoutItem } from "@athyper/dashboard";

export interface EditorContextValue {
    state: EditorState;
    dispatch: Dispatch<EditorAction>;
    selectedWidget: LayoutItem | null;
    openConfig: (widgetId: string) => void;
    dashboardId: string;
    canUndo: boolean;
    canRedo: boolean;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
    const ctx = useContext(EditorContext);
    if (!ctx) throw new Error("useEditor must be used within EditorContext.Provider");
    return ctx;
}
