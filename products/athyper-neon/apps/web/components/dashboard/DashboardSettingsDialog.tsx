"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Input,
    Textarea,
    Label,
    Switch,
} from "@neon/ui";
import { updateDashboard } from "../../lib/dashboard/dashboard-client";
import type { DashboardListItem } from "../../lib/dashboard/dashboard-client";

interface DashboardSettingsDialogProps {
    dashboard: DashboardListItem;
    open: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export function DashboardSettingsDialog({
    dashboard,
    open,
    onClose,
    onUpdated,
}: DashboardSettingsDialogProps) {
    const [titleKey, setTitleKey] = useState(dashboard.titleKey);
    const [descriptionKey, setDescriptionKey] = useState(dashboard.descriptionKey ?? "");
    const [isHidden, setIsHidden] = useState(dashboard.isHidden);
    const [sortOrder, setSortOrder] = useState(dashboard.sortOrder);
    const [isSaving, setIsSaving] = useState(false);

    const isSystem = dashboard.visibility === "system";
    const canEdit = dashboard.permission === "owner" || dashboard.permission === "edit";

    useEffect(() => {
        setTitleKey(dashboard.titleKey);
        setDescriptionKey(dashboard.descriptionKey ?? "");
        setIsHidden(dashboard.isHidden);
        setSortOrder(dashboard.sortOrder);
    }, [dashboard]);

    async function handleSave() {
        setIsSaving(true);
        try {
            await updateDashboard(dashboard.id, {
                titleKey: titleKey.trim(),
                descriptionKey: descriptionKey.trim() || undefined,
                isHidden,
                sortOrder,
            });
            toast.success("Dashboard settings updated");
            onClose();
            onUpdated();
        } catch {
            toast.error("Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Dashboard Settings</DialogTitle>
                    <p className="text-xs text-gray-400">
                        {dashboard.code} &middot; {dashboard.visibility}
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="ds-title">Title</Label>
                        <Input
                            id="ds-title"
                            value={titleKey}
                            onChange={(e) => setTitleKey(e.target.value)}
                            disabled={isSystem || !canEdit}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ds-desc">Description</Label>
                        <Textarea
                            id="ds-desc"
                            value={descriptionKey}
                            onChange={(e) => setDescriptionKey(e.target.value)}
                            rows={2}
                            disabled={isSystem || !canEdit}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Hidden</Label>
                            <p className="text-xs text-gray-400">
                                Hidden dashboards won&apos;t appear in the sidebar
                            </p>
                        </div>
                        <Switch
                            checked={isHidden}
                            onCheckedChange={setIsHidden}
                            disabled={isSystem || !canEdit}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ds-sort">Sort Order</Label>
                        <Input
                            id="ds-sort"
                            type="number"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                            disabled={isSystem || !canEdit}
                            className="w-24"
                        />
                    </div>

                    {isSystem && (
                        <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2">
                            System dashboards are read-only. Duplicate to create an editable copy.
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        {canEdit && !isSystem ? "Cancel" : "Close"}
                    </Button>
                    {canEdit && !isSystem && (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
