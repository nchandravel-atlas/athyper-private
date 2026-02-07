"use client";

import { useState, useEffect } from "react";
import { Button, Badge } from "@neon/ui";
import { fetchVersion } from "../../lib/dashboard/dashboard-client";
import type { VersionDetail } from "../../lib/dashboard/dashboard-client";
import { DashboardRenderer } from "./DashboardRenderer";
import { useMessages } from "../../lib/i18n/messages-context";

interface VersionPreviewPanelProps {
    dashboardId: string;
    versionId: string;
    onRollback: () => void;
    rollingBack: boolean;
}

export function VersionPreviewPanel({
    dashboardId,
    versionId,
    onRollback,
    rollingBack,
}: VersionPreviewPanelProps) {
    const [version, setVersion] = useState<VersionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { messages } = useMessages();

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchVersion(dashboardId, versionId)
            .then(setVersion)
            .catch(() => setError("Failed to load version"))
            .finally(() => setLoading(false));
    }, [dashboardId, versionId]);

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <div className="h-8 bg-gray-100 rounded animate-pulse w-1/3" />
                <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </div>
        );
    }

    if (error || !version) {
        return (
            <div className="p-4 text-center">
                <p className="text-sm text-red-500">{error ?? "Version not found"}</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Version header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">
                        Version {version.versionNo}
                    </span>
                    <Badge
                        className={
                            version.status === "published"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : version.status === "draft"
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    : ""
                        }
                        variant={version.status === "archived" ? "secondary" : "outline"}
                    >
                        {version.status}
                    </Badge>
                </div>
                <Button onClick={onRollback} disabled={rollingBack}>
                    {rollingBack ? "Rolling back..." : "Restore this version"}
                </Button>
            </div>

            {/* Version meta */}
            <div className="text-xs text-gray-500 mb-4 space-y-0.5">
                <p>
                    Created: {new Date(version.createdAt).toLocaleString()}
                    {version.createdBy && ` by ${version.createdBy}`}
                </p>
                {version.publishedAt && (
                    <p>
                        Published: {new Date(version.publishedAt).toLocaleString()}
                        {version.publishedBy && ` by ${version.publishedBy}`}
                    </p>
                )}
                <p>{version.layout.items.length} widget{version.layout.items.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Layout preview */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DashboardRenderer layout={version.layout} messages={messages} />
            </div>
        </div>
    );
}
