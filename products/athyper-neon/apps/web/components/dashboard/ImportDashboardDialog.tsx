"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
} from "@neon/ui";
import { dashboardExportSchema } from "@athyper/dashboard";
import { importDashboard } from "../../lib/dashboard/dashboard-client";
import type { DashboardExportData } from "../../lib/dashboard/dashboard-client";

interface ImportDashboardDialogProps {
    open: boolean;
    onClose: () => void;
    workbench: string;
    onImported?: () => void;
}

export function ImportDashboardDialog({ open, onClose, workbench, onImported }: ImportDashboardDialogProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [parsed, setParsed] = useState<DashboardExportData | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    function reset() {
        setFile(null);
        setParsed(null);
        setParseError(null);
    }

    const handleFile = useCallback((f: File) => {
        setFile(f);
        setParseError(null);
        setParsed(null);

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result as string);
                const result = dashboardExportSchema.safeParse(json);
                if (!result.success) {
                    setParseError(`Invalid dashboard file: ${result.error.issues[0]?.message ?? "validation failed"}`);
                    return;
                }
                setParsed(result.data as DashboardExportData);
            } catch {
                setParseError("Failed to parse JSON file");
            }
        };
        reader.onerror = () => setParseError("Failed to read file");
        reader.readAsText(f);
    }, []);

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFile(droppedFile);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0];
        if (selected) handleFile(selected);
    }

    async function handleImport() {
        if (!parsed) return;

        setIsImporting(true);
        try {
            const result = await importDashboard(workbench, parsed);
            toast.success("Dashboard imported");
            reset();
            onClose();
            if (onImported) onImported();
            else router.push(`/wb/${workbench}/dashboard/${result.id}/edit`);
        } catch {
            toast.error("Failed to import dashboard");
        } finally {
            setIsImporting(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
                    reset();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Import Dashboard</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors"
                    >
                        <p className="text-sm text-gray-500 mb-2">
                            Drop a .json dashboard file here, or
                        </p>
                        <label className="inline-block">
                            <input
                                type="file"
                                accept=".json,application/json"
                                onChange={handleInputChange}
                                className="sr-only"
                            />
                            <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer underline">
                                browse to select
                            </span>
                        </label>
                    </div>

                    {/* File info */}
                    {file && (
                        <p className="mt-3 text-xs text-gray-400">
                            File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </p>
                    )}

                    {/* Parse error */}
                    {parseError && (
                        <p className="mt-3 text-sm text-red-500">{parseError}</p>
                    )}

                    {/* Preview */}
                    {parsed && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                                {parsed.dashboard.titleKey}
                            </p>
                            {parsed.dashboard.descriptionKey && (
                                <p className="text-xs text-gray-500">{parsed.dashboard.descriptionKey}</p>
                            )}
                            <p className="text-xs text-gray-400">
                                Module: {parsed.dashboard.moduleCode} &middot; {parsed.layout.items.length} widget{parsed.layout.items.length !== 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-gray-400">
                                Exported: {new Date(parsed.exportedAt).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => { reset(); onClose(); }}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!parsed || isImporting}>
                        {isImporting ? "Importing..." : "Import Dashboard"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
