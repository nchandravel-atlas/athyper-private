"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Button,
    Badge,
} from "@neon/ui";
import { fetchVersionHistory, rollbackToVersion } from "../../lib/dashboard/dashboard-client";
import type { VersionSummary } from "../../lib/dashboard/dashboard-client";
import { VersionPreviewPanel } from "./VersionPreviewPanel";
import { toast } from "sonner";

interface VersionHistoryDialogProps {
    dashboardId: string;
    open: boolean;
    onClose: () => void;
    onRollback?: () => void;
}

function statusBadge(status: string) {
    switch (status) {
        case "published":
            return <Badge className="bg-green-100 text-green-700 border-green-200">published</Badge>;
        case "draft":
            return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">draft</Badge>;
        case "archived":
            return <Badge variant="secondary">archived</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export function VersionHistoryDialog({
    dashboardId,
    open,
    onClose,
    onRollback,
}: VersionHistoryDialogProps) {
    const [versions, setVersions] = useState<VersionSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
    const [rollingBack, setRollingBack] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setError(null);
        fetchVersionHistory(dashboardId)
            .then(setVersions)
            .catch(() => setError("Failed to load version history"))
            .finally(() => setLoading(false));
    }, [open, dashboardId]);

    async function handleRollback(versionId: string) {
        if (!confirm("Rollback to this version? This will create a new draft from this version's layout.")) return;

        setRollingBack(true);
        try {
            await rollbackToVersion(dashboardId, versionId);
            toast.success("Rolled back to selected version");
            onClose();
            if (onRollback) onRollback();
        } catch {
            toast.error("Failed to rollback");
        } finally {
            setRollingBack(false);
        }
    }

    // If previewing a specific version, show the preview panel instead
    if (previewVersionId) {
        return (
            <Dialog open={open} onOpenChange={(v) => { if (!v) { setPreviewVersionId(null); onClose(); } }}>
                <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPreviewVersionId(null)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                &larr; Back to history
                            </button>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                        <VersionPreviewPanel
                            dashboardId={dashboardId}
                            versionId={previewVersionId}
                            onRollback={() => handleRollback(previewVersionId)}
                            rollingBack={rollingBack}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Version History</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="space-y-3 p-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <p className="py-6 text-center text-sm text-red-500">{error}</p>
                    ) : versions.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">No versions found.</p>
                    ) : (
                        <div className="relative pl-6">
                            {/* Timeline line */}
                            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200" aria-hidden="true" />

                            {versions.map((v, idx) => (
                                <div key={v.id} className="relative pb-4">
                                    {/* Timeline dot */}
                                    <div
                                        className={`absolute -left-3.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${
                                            v.status === "published" ? "bg-green-500" :
                                            v.status === "draft" ? "bg-yellow-500" :
                                            "bg-gray-400"
                                        }`}
                                        aria-hidden="true"
                                    />

                                    <div className="ml-3 p-3 rounded-md border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    v{v.versionNo}
                                                </span>
                                                {statusBadge(v.status)}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {v.widgetCount} widget{v.widgetCount !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {v.publishedAt
                                                ? `Published ${new Date(v.publishedAt).toLocaleString()}`
                                                : `Created ${new Date(v.createdAt).toLocaleString()}`
                                            }
                                            {v.publishedBy && ` by ${v.publishedBy}`}
                                            {!v.publishedBy && v.createdBy && ` by ${v.createdBy}`}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setPreviewVersionId(v.id)}
                                                className="text-xs h-7 px-2"
                                            >
                                                Preview
                                            </Button>
                                            {idx > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleRollback(v.id)}
                                                    disabled={rollingBack}
                                                    className="text-xs h-7 px-2"
                                                >
                                                    Rollback
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
