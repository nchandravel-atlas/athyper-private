"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { duplicateDashboard, updateDashboard } from "../../lib/dashboard/dashboard-client";

interface SidebarContextMenuProps {
    dashboardId: string;
    visibility: string;
    permission: string;
    workbench: string;
    onClose: () => void;
    onShare?: () => void;
}

export function SidebarContextMenu({ dashboardId, visibility, permission, workbench, onClose, onShare }: SidebarContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const canEdit = permission === "owner" || permission === "edit";
    const isSystem = visibility === "system";

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    function handleEdit() {
        onClose();
        window.location.href = `/wb/${workbench}/dashboard/${dashboardId}/edit`;
    }

    async function handleDuplicate() {
        try {
            await duplicateDashboard(dashboardId);
            toast.success("Dashboard duplicated");
            onClose();
            window.location.reload();
        } catch {
            toast.error("Failed to duplicate dashboard");
        }
    }

    async function handleHide() {
        try {
            await updateDashboard(dashboardId, { isHidden: true });
            toast.success("Dashboard hidden");
            onClose();
            window.location.reload();
        } catch {
            toast.error("Failed to hide dashboard");
        }
    }

    function handleShare() {
        onClose();
        onShare?.();
    }

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-8 z-50 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
            {canEdit && !isSystem && (
                <button
                    type="button"
                    onClick={handleEdit}
                    className="flex w-full items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    Edit
                </button>
            )}

            <button
                type="button"
                onClick={handleDuplicate}
                className="flex w-full items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
                Duplicate
            </button>

            {canEdit && !isSystem && (
                <button
                    type="button"
                    onClick={handleHide}
                    className="flex w-full items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    Hide
                </button>
            )}

            {canEdit && !isSystem && onShare && (
                <button
                    type="button"
                    onClick={handleShare}
                    className="flex w-full items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                    Share
                </button>
            )}
        </div>
    );
}
