"use client";

import { useState } from "react";
import {
    Button,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@neon/ui";
import { toast } from "sonner";
import { useEditor } from "./EditorContext";
import { publishDashboard, discardDraft } from "../../../lib/dashboard/dashboard-client";
import { VersionHistoryDialog } from "../VersionHistoryDialog";
import type { Breakpoint } from "../../../lib/hooks/use-breakpoint";

interface EditorToolbarProps {
    workbench: string;
    breakpoint: Breakpoint;
}

export function EditorToolbar({ workbench, breakpoint }: EditorToolbarProps) {
    const { state, dispatch, dashboardId, saveDraft, canUndo, canRedo } = useEditor() as ReturnType<typeof useEditor> & { saveDraft: () => Promise<void> };
    const [isPublishing, setIsPublishing] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const isMobile = breakpoint === "mobile";

    async function handleSave() {
        try {
            await saveDraft();
            toast.success("Draft saved");
        } catch {
            toast.error("Failed to save draft");
        }
    }

    async function handlePublish() {
        if (!confirm("Publish this dashboard? It will replace the current published version.")) return;

        setIsPublishing(true);
        try {
            if (state.isDirty) await saveDraft();
            await publishDashboard(dashboardId);
            dispatch({ type: "MARK_SAVED", savedAt: new Date() });
            toast.success("Dashboard published");
        } catch {
            toast.error("Failed to publish dashboard");
        } finally {
            setIsPublishing(false);
        }
    }

    async function handleDiscard() {
        if (!confirm("Discard all unsaved changes? This will revert to the last published version.")) return;

        try {
            await discardDraft(dashboardId);
            window.location.reload();
        } catch {
            toast.error("Failed to discard draft");
        }
    }

    return (
        <div className={`flex items-center justify-between h-14 ${isMobile ? "px-2" : "px-4"} border-b border-gray-200 bg-white`} role="toolbar" aria-label="Editor toolbar">
            {/* Left: Back + (desktop: Mode Toggle + Undo/Redo) */}
            <div className="flex items-center gap-2 sm:gap-4">
                <a
                    href={`/wb/${workbench}/dashboard/${dashboardId}`}
                    className="text-sm text-gray-500 hover:text-gray-700"
                    aria-label="Back to dashboard view"
                >
                    &larr;{!isMobile && " Back"}
                </a>

                {/* Mode toggle — hidden on mobile, moved to overflow menu */}
                {!isMobile && (
                    <div className="flex rounded-md border border-gray-200 overflow-hidden" role="group" aria-label="Editor mode">
                        <button
                            type="button"
                            className={`px-3 py-1.5 text-xs font-medium ${
                                state.mode === "edit"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-white text-gray-500 hover:bg-gray-50"
                            }`}
                            onClick={() => dispatch({ type: "SET_MODE", mode: "edit" })}
                            aria-label="Switch to Edit mode"
                            aria-pressed={state.mode === "edit"}
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            className={`px-3 py-1.5 text-xs font-medium border-l border-gray-200 ${
                                state.mode === "preview"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-white text-gray-500 hover:bg-gray-50"
                            }`}
                            onClick={() => dispatch({ type: "SET_MODE", mode: "preview" })}
                            aria-label="Switch to Preview mode"
                            aria-pressed={state.mode === "preview"}
                        >
                            Preview
                        </button>
                    </div>
                )}

                {/* Undo / Redo / History */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => dispatch({ type: "UNDO" })}
                        disabled={!canUndo}
                        className="p-1.5 rounded text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Undo (Ctrl+Z)"
                        title="Undo (Ctrl+Z)"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 7v6h6" />
                            <path d="M3 13a9 9 0 0 1 3-7.7A9 9 0 0 1 21 12" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => dispatch({ type: "REDO" })}
                        disabled={!canRedo}
                        className="p-1.5 rounded text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Redo (Ctrl+Shift+Z)"
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 7v6h-6" />
                            <path d="M21 13a9 9 0 0 0-3-7.7A9 9 0 0 0 3 12" />
                        </svg>
                    </button>
                    {!isMobile && (
                        <button
                            type="button"
                            onClick={() => setShowHistory(true)}
                            className="p-1.5 rounded text-gray-500 hover:text-gray-700"
                            aria-label="Version history"
                            title="Version history"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Center: Status — hidden on mobile */}
            {!isMobile && (
                <span role="status" aria-live="polite" className="text-xs text-gray-400">
                    {state.isSaving && "Saving..."}
                    {!state.isSaving && state.isDirty && "Unsaved changes"}
                    {!state.isSaving && !state.isDirty && state.lastSavedAt && (
                        <>Saved at {state.lastSavedAt.toLocaleTimeString()}</>
                    )}
                </span>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
                {isMobile ? (
                    <>
                        {/* Mobile: Save + Publish always visible, overflow for the rest */}
                        <Button
                            variant="ghost"
                            onClick={handleSave}
                            disabled={!state.isDirty || state.isSaving}
                        >
                            Save
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing}
                        >
                            {isPublishing ? "..." : "Publish"}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="p-2 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                    aria-label="More actions"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <circle cx="12" cy="5" r="1" />
                                        <circle cx="12" cy="12" r="1" />
                                        <circle cx="12" cy="19" r="1" />
                                    </svg>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => dispatch({ type: "SET_MODE", mode: state.mode === "edit" ? "preview" : "edit" })}
                                >
                                    {state.mode === "edit" ? "Preview" : "Edit"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowHistory(true)}>
                                    Version History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleDiscard}>
                                    Discard Changes
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        {/* Desktop: all actions visible */}
                        <button
                            type="button"
                            onClick={handleDiscard}
                            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                            aria-label="Discard unsaved changes"
                        >
                            Discard
                        </button>
                        <Button
                            variant="ghost"
                            onClick={handleSave}
                            disabled={!state.isDirty || state.isSaving}
                        >
                            Save Draft
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing}
                        >
                            {isPublishing ? "Publishing..." : "Publish"}
                        </Button>
                    </>
                )}
            </div>

            <VersionHistoryDialog
                dashboardId={dashboardId}
                open={showHistory}
                onClose={() => setShowHistory(false)}
                onRollback={() => window.location.reload()}
            />
        </div>
    );
}
