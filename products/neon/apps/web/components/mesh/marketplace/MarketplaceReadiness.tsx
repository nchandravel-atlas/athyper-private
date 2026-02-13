"use client";

import { useState, useEffect } from "react";
import { Card } from "@neon/ui/card";
import { Badge } from "@neon/ui/badge";
import { Button } from "@neon/ui/button";
import {
    Package,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download,
    Star,
    Shield,
    FileText,
    Upload,
    Clock
} from "lucide-react";
import { useCsrfToken } from "@/lib/use-csrf";

interface ReadinessCheck {
    id: string;
    category: "metadata" | "documentation" | "security" | "testing" | "licensing";
    name: string;
    status: "passed" | "failed" | "warning" | "pending";
    message: string | null;
    blocksPublish: boolean;
}

interface PublishableItem {
    id: string;
    type: "module" | "app" | "entity_template" | "workflow_template";
    code: string;
    name: string;
    description: string | null;
    version: string;
    publishingStatus: "draft" | "validating" | "ready" | "published" | "rejected";
    readinessScore: number;
    checks: ReadinessCheck[];
    marketplaceStats: {
        downloads: number;
        activeInstallations: number;
        rating: number | null;
        reviews: number;
    } | null;
    lastValidatedAt: string | null;
    publishedAt: string | null;
    updatedAt: string;
}

interface MarketplaceSummary {
    totalItems: number;
    readyToPublish: number;
    published: number;
    needsAttention: number;
    totalDownloads: number;
    averageRating: number | null;
}

interface MarketplaceData {
    summary: MarketplaceSummary;
    items: PublishableItem[];
}

function StatusIcon({ status }: { status: ReadinessCheck["status"] }) {
    switch (status) {
        case "passed":
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case "failed":
            return <XCircle className="h-4 w-4 text-red-600" />;
        case "warning":
            return <AlertCircle className="h-4 w-4 text-amber-600" />;
        case "pending":
            return <Clock className="h-4 w-4 text-gray-400" />;
    }
}

function ReadinessScore({ score }: { score: number }) {
    const color = score >= 90 ? "text-green-600" : score >= 70 ? "text-amber-600" : "text-red-600";
    const bgColor = score >= 90 ? "bg-green-50" : score >= 70 ? "bg-amber-50" : "bg-red-50";

    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${bgColor}`}>
            <span className={`text-sm font-semibold ${color}`}>{score}%</span>
        </div>
    );
}

function PublishingStatusBadge({ status }: { status: PublishableItem["publishingStatus"] }) {
    const variants: Record<PublishableItem["publishingStatus"], { label: string; className: string }> = {
        draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
        validating: { label: "Validating", className: "bg-blue-100 text-blue-700" },
        ready: { label: "Ready", className: "bg-green-100 text-green-700" },
        published: { label: "Published", className: "bg-purple-100 text-purple-700" },
        rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
}

function TypeBadge({ type }: { type: PublishableItem["type"] }) {
    const variants: Record<PublishableItem["type"], { label: string; className: string }> = {
        module: { label: "Module", className: "bg-blue-100 text-blue-700" },
        app: { label: "App", className: "bg-purple-100 text-purple-700" },
        entity_template: { label: "Entity Template", className: "bg-pink-100 text-pink-700" },
        workflow_template: { label: "Workflow Template", className: "bg-amber-100 text-amber-700" },
    };
    const variant = variants[type];
    return <Badge className={variant.className}>{variant.label}</Badge>;
}

function CategoryIcon({ category }: { category: ReadinessCheck["category"] }) {
    switch (category) {
        case "metadata":
            return <FileText className="h-4 w-4" />;
        case "documentation":
            return <FileText className="h-4 w-4" />;
        case "security":
            return <Shield className="h-4 w-4" />;
        case "testing":
            return <CheckCircle2 className="h-4 w-4" />;
        case "licensing":
            return <FileText className="h-4 w-4" />;
    }
}

function ItemCard({ item }: { item: PublishableItem }) {
    const [expanded, setExpanded] = useState(false);

    const criticalIssues = item.checks.filter(c => c.status === "failed" && c.blocksPublish).length;
    const warnings = item.checks.filter(c => c.status === "warning").length;

    return (
        <Card className="p-4">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                            <Package className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                                <TypeBadge type={item.type} />
                                <PublishingStatusBadge status={item.publishingStatus} />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {item.code} • v{item.version}
                            </p>
                            {item.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                            )}
                        </div>
                    </div>
                    <ReadinessScore score={item.readinessScore} />
                </div>

                {/* Stats */}
                {item.marketplaceStats && (
                    <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t">
                        <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{item.marketplaceStats.downloads.toLocaleString()} downloads</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>{item.marketplaceStats.activeInstallations.toLocaleString()} active</span>
                        </div>
                        {item.marketplaceStats.rating !== null && (
                            <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>{item.marketplaceStats.rating.toFixed(1)} ({item.marketplaceStats.reviews})</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Issues summary */}
                {(criticalIssues > 0 || warnings > 0) && (
                    <div className="flex items-center gap-3 text-xs">
                        {criticalIssues > 0 && (
                            <div className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-3 w-3" />
                                <span>{criticalIssues} blocking issue{criticalIssues !== 1 ? "s" : ""}</span>
                            </div>
                        )}
                        {warnings > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                                <AlertCircle className="h-3 w-3" />
                                <span>{warnings} warning{warnings !== 1 ? "s" : ""}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Checks */}
                <div className="space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="h-7 text-xs"
                    >
                        {expanded ? "Hide" : "Show"} validation checks ({item.checks.length})
                    </Button>

                    {expanded && (
                        <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                            {item.checks.map((check) => (
                                <div key={check.id} className="flex items-start gap-2 text-xs">
                                    <StatusIcon status={check.status} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <CategoryIcon category={check.category} />
                                            <span className="font-medium">{check.name}</span>
                                            {check.blocksPublish && (
                                                <Badge className="bg-red-100 text-red-700 text-[10px] px-1 py-0">
                                                    Blocks Publish
                                                </Badge>
                                            )}
                                        </div>
                                        {check.message && (
                                            <p className="text-gray-600 mt-0.5">{check.message}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
                    <div>
                        {item.lastValidatedAt && (
                            <span>Last validated {new Date(item.lastValidatedAt).toLocaleDateString()}</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {item.publishingStatus === "ready" && (
                            <Button size="sm" className="h-7 text-xs">
                                <Upload className="h-3 w-3 mr-1" />
                                Publish
                            </Button>
                        )}
                        {item.publishingStatus !== "ready" && (
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                                Re-validate
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function useMarketplaceData() {
    const [data, setData] = useState<MarketplaceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const buildHeaders = useCsrfToken();

    useEffect(() => {
        const controller = new AbortController();

        async function fetchData() {
            try {
                setLoading(true);
                const headers = await buildHeaders();
                const res = await fetch("/api/admin/mesh/marketplace", {
                    headers,
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch marketplace data: ${res.status}`);
                }

                const result = (await res.json()) as MarketplaceData;
                setData(result);
                setError(null);
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        return () => controller.abort();
    }, [buildHeaders]);

    return { data, loading, error };
}

export function MarketplaceReadiness() {
    const { data, loading, error } = useMarketplaceData();
    const [filter, setFilter] = useState<PublishableItem["publishingStatus"] | "all">("all");

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 text-purple-600" />
                    <h1 className="text-2xl font-bold">Marketplace Readiness</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-4 h-24 animate-pulse bg-gray-100" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <Card className="p-8 text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">{error || "Failed to load marketplace data"}</p>
                </Card>
            </div>
        );
    }

    const filteredItems = filter === "all"
        ? data.items
        : data.items.filter(item => item.publishingStatus === filter);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 text-purple-600" />
                    <h1 className="text-2xl font-bold">Marketplace Readiness</h1>
                </div>
                <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Publish Selected
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Items</p>
                            <p className="text-2xl font-bold mt-1">{data.summary.totalItems}</p>
                        </div>
                        <Package className="h-8 w-8 text-gray-400" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Ready to Publish</p>
                            <p className="text-2xl font-bold mt-1 text-green-600">{data.summary.readyToPublish}</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Published</p>
                            <p className="text-2xl font-bold mt-1 text-purple-600">{data.summary.published}</p>
                        </div>
                        <Upload className="h-8 w-8 text-purple-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Needs Attention</p>
                            <p className="text-2xl font-bold mt-1 text-amber-600">{data.summary.needsAttention}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-amber-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Downloads</p>
                            <p className="text-2xl font-bold mt-1">{data.summary.totalDownloads.toLocaleString()}</p>
                            {data.summary.averageRating !== null && (
                                <div className="flex items-center gap-1 mt-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs text-gray-600">{data.summary.averageRating.toFixed(1)} avg</span>
                                </div>
                            )}
                        </div>
                        <Download className="h-8 w-8 text-gray-400" />
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filter:</span>
                {(["all", "draft", "validating", "ready", "published", "rejected"] as const).map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(status)}
                        className="h-8 text-xs capitalize"
                    >
                        {status}
                    </Button>
                ))}
            </div>

            {/* Items */}
            {filteredItems.length === 0 ? (
                <Card className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">No items found with status: {filter}</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
