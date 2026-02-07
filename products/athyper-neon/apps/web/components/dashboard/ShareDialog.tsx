"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
} from "@neon/ui";
import { toast } from "sonner";
import { fetchAcl, addAcl, removeAcl, type AclEntry } from "../../lib/dashboard/dashboard-client";

interface ShareDialogProps {
    dashboardId: string;
    open: boolean;
    onClose: () => void;
}

const PRINCIPAL_TYPES = [
    { value: "role", label: "Role" },
    { value: "group", label: "Group" },
    { value: "user", label: "User" },
    { value: "persona", label: "Persona" },
];

const PERMISSIONS = [
    { value: "view", label: "View" },
    { value: "edit", label: "Edit" },
];

export function ShareDialog({ dashboardId, open, onClose }: ShareDialogProps) {
    const [entries, setEntries] = useState<AclEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // Add form state
    const [principalType, setPrincipalType] = useState("role");
    const [principalKey, setPrincipalKey] = useState("");
    const [permission, setPermission] = useState("view");
    const [adding, setAdding] = useState(false);

    const loadEntries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAcl(dashboardId);
            setEntries(data);
        } catch {
            toast.error("Failed to load sharing settings");
        } finally {
            setLoading(false);
        }
    }, [dashboardId]);

    useEffect(() => {
        if (open) loadEntries();
    }, [open, loadEntries]);

    async function handleAdd() {
        if (!principalKey.trim()) return;

        setAdding(true);
        try {
            await addAcl(dashboardId, { principalType, principalKey: principalKey.trim(), permission });
            setPrincipalKey("");
            toast.success("Access granted");
            await loadEntries();
        } catch {
            toast.error("Failed to add access");
        } finally {
            setAdding(false);
        }
    }

    async function handleRemove(aclId: string) {
        try {
            await removeAcl(dashboardId, aclId);
            setEntries((prev) => prev.filter((e) => e.id !== aclId));
            toast.success("Access removed");
        } catch {
            toast.error("Failed to remove access");
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Dashboard</DialogTitle>
                    <DialogDescription>
                        Manage who can view or edit this dashboard.
                    </DialogDescription>
                </DialogHeader>

                {/* Add new entry */}
                <div className="space-y-3 border-b border-gray-200 pb-4">
                    <div className="flex gap-2">
                        <select
                            value={principalType}
                            onChange={(e) => setPrincipalType(e.target.value)}
                            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                        >
                            {PRINCIPAL_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={principalKey}
                            onChange={(e) => setPrincipalKey(e.target.value)}
                            placeholder="e.g. admin, user@example.com"
                            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value)}
                            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                        >
                            {PERMISSIONS.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                        <Button onClick={handleAdd} disabled={adding || !principalKey.trim()}>
                            {adding ? "Adding..." : "Add"}
                        </Button>
                    </div>
                </div>

                {/* Existing entries */}
                <div className="mt-2 max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="py-4 text-center text-sm text-gray-400">Loading...</div>
                    ) : entries.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-400">No sharing rules configured.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {entries.map((entry) => (
                                <li key={entry.id} className="flex items-center justify-between py-2">
                                    <div className="text-sm">
                                        <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 mr-2">
                                            {entry.principalType}
                                        </span>
                                        <span className="text-gray-900">{entry.principalKey}</span>
                                        <span className="ml-2 text-xs text-gray-400">({entry.permission})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(entry.id)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
