"use client";

import {
    LayoutGrid, List, Plus, RefreshCw, Search, Shield,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/mesh/shared/EmptyState";
import { StatusDot } from "@/components/mesh/shared/StatusDot";
import { cn } from "@/lib/utils";
import { buildHeaders } from "@/lib/schema-manager/use-csrf";

// ─── Types ───────────────────────────────────────────────────

export interface PolicySummary {
    id: string;
    name: string;
    description: string | null;
    scopeType: "global" | "module" | "entity" | "entity_version";
    scopeKey: string | null;
    isActive: boolean;
    currentVersion: {
        id: string;
        versionNo: number;
        status: "draft" | "published" | "archived";
        ruleCount: number;
        publishedAt: string | null;
    } | null;
    createdAt: string;
    updatedAt: string | null;
}

interface FilterValues {
    search: string;
    scopeType: string;
    status: string;
}

// ─── Scope Badge ─────────────────────────────────────────────

const SCOPE_COLORS: Record<string, string> = {
    global: "border-purple-400",
    module: "border-blue-400",
    entity: "border-green-400",
    entity_version: "border-amber-400",
};

const SCOPE_LABELS: Record<string, string> = {
    global: "Global",
    module: "Module",
    entity: "Entity",
    entity_version: "Version",
};

function ScopeBadge({ scopeType }: { scopeType: string }) {
    const label = SCOPE_LABELS[scopeType] ?? scopeType;
    return (
        <Badge variant="outline" className="text-xs font-normal capitalize">
            {label}
        </Badge>
    );
}

// ─── Policy Card ─────────────────────────────────────────────

function PolicyCard({ policy, basePath }: { policy: PolicySummary; basePath: string }) {
    const version = policy.currentVersion;
    const status = version?.status ?? "draft";
    const borderColor = SCOPE_COLORS[policy.scopeType] ?? "";

    return (
        <Link href={`${basePath}/${policy.id}`}>
            <Card
                className={cn(
                    "group h-full border-l-4 transition-all hover:shadow-md hover:border-foreground/20",
                    borderColor,
                )}
            >
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                {policy.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-2">
                                <ScopeBadge scopeType={policy.scopeType} />
                                {policy.scopeKey && (
                                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                                        {policy.scopeKey}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <StatusDot status={status} />
                            <span className="text-xs text-muted-foreground capitalize">{status}</span>
                        </div>
                    </div>

                    {policy.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {policy.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {version && (
                            <>
                                <span className="inline-flex items-center gap-1">
                                    v{version.versionNo}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Shield className="size-3" />
                                    {version.ruleCount} rules
                                </span>
                            </>
                        )}
                        {!version && (
                            <span className="italic">No versions</span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

// ─── Policy Table ────────────────────────────────────────────

function PolicyTable({ policies, basePath, onNavigate }: {
    policies: PolicySummary[];
    basePath: string;
    onNavigate: (id: string) => void;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Scope Key</TableHead>
                    <TableHead className="text-center">Version</TableHead>
                    <TableHead className="text-center">Rules</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {policies.map((policy) => {
                    const version = policy.currentVersion;
                    const status = version?.status ?? "draft";
                    return (
                        <TableRow
                            key={policy.id}
                            className="cursor-pointer"
                            onClick={() => onNavigate(policy.id)}
                        >
                            <TableCell>
                                <div>
                                    <span className="font-medium">{policy.name}</span>
                                    {policy.description && (
                                        <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                                            {policy.description}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <ScopeBadge scopeType={policy.scopeType} />
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-xs">
                                {policy.scopeKey ?? "—"}
                            </TableCell>
                            <TableCell className="text-center">
                                {version ? `v${version.versionNo}` : "—"}
                            </TableCell>
                            <TableCell className="text-center">
                                {version?.ruleCount ?? 0}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5">
                                    <StatusDot status={status} />
                                    <span className="text-xs capitalize">{status}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

// ─── Filters ─────────────────────────────────────────────────

function PolicyFilters({
    filters,
    onFiltersChange,
    viewMode,
    onViewModeChange,
}: {
    filters: FilterValues;
    onFiltersChange: (f: FilterValues) => void;
    viewMode: "grid" | "table";
    onViewModeChange: (m: "grid" | "table") => void;
}) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchInput(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onFiltersChange({ ...filters, search: value });
            }, 300);
        },
        [filters, onFiltersChange],
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search policies..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-8 h-9"
                />
            </div>

            <Select
                value={filters.scopeType}
                onValueChange={(v) => onFiltersChange({ ...filters, scopeType: v })}
            >
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="module">Module</SelectItem>
                    <SelectItem value="entity">Entity</SelectItem>
                    <SelectItem value="entity_version">Version</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filters.status}
                onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
            >
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
            </Select>

            <div className="flex items-center rounded-md border">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-8 rounded-r-none px-2", viewMode === "grid" && "bg-muted")}
                    onClick={() => onViewModeChange("grid")}
                >
                    <LayoutGrid className="size-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-8 rounded-l-none px-2", viewMode === "table" && "bg-muted")}
                    onClick={() => onViewModeChange("table")}
                >
                    <List className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

// ─── Data Hook ───────────────────────────────────────────────

interface UsePolicyListResult {
    policies: PolicySummary[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

function usePolicyList(): UsePolicyListResult {
    const [policies, setPolicies] = useState<PolicySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const fetchPolicies = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/mesh/policy-studio", {
                headers: buildHeaders(),
                credentials: "same-origin",
                signal: controller.signal,
            });

            if (!res.ok) {
                const body = (await res.json()) as { error?: { message?: string } };
                throw new Error(body.error?.message ?? `Failed to load policies (${res.status})`);
            }

            const body = (await res.json()) as { data: PolicySummary[] };
            setPolicies(body.data);
        } catch (err) {
            if ((err as Error).name === "AbortError") return;
            setError(err instanceof Error ? err.message : "Failed to load policies");
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchPolicies();
        return () => abortRef.current?.abort();
    }, [fetchPolicies]);

    return { policies, loading, error, refresh: fetchPolicies };
}

// ─── Filter Logic ────────────────────────────────────────────

function filterPolicies(policies: PolicySummary[], filters: FilterValues): PolicySummary[] {
    return policies.filter((p) => {
        if (filters.search) {
            const q = filters.search.toLowerCase();
            if (
                !p.name.toLowerCase().includes(q) &&
                !(p.description ?? "").toLowerCase().includes(q) &&
                !(p.scopeKey ?? "").toLowerCase().includes(q)
            ) {
                return false;
            }
        }
        if (filters.scopeType !== "all" && p.scopeType !== filters.scopeType) return false;
        if (filters.status !== "all") {
            const status = p.currentVersion?.status ?? "draft";
            if (status !== filters.status) return false;
        }
        return true;
    });
}

// ─── Explorer ────────────────────────────────────────────────

interface PolicyExplorerProps {
    basePath: string;
}

export function PolicyExplorer({ basePath }: PolicyExplorerProps) {
    const { policies, loading, error, refresh } = usePolicyList();
    const [filters, setFilters] = useState<FilterValues>({
        search: "",
        scopeType: "all",
        status: "all",
    });
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

    const filtered = useMemo(() => filterPolicies(policies, filters), [policies, filters]);

    const handleNavigate = useCallback(
        (id: string) => {
            window.location.href = `${basePath}/${id}`;
        },
        [basePath],
    );

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-[200px]" />
                    <Skeleton className="h-9 w-[140px]" />
                    <Skeleton className="h-9 w-[140px]" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-[120px] rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={refresh}>
                    <RefreshCw className="mr-1.5 size-3.5" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <PolicyFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={refresh}>
                        <RefreshCw className="size-3.5" />
                    </Button>
                    <Button size="sm">
                        <Plus className="mr-1.5 size-3.5" />
                        New Policy
                    </Button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Shield}
                    title="No policies found"
                    description={
                        policies.length === 0
                            ? "Get started by creating your first permission policy."
                            : "No policies match your current filters. Try adjusting your search."
                    }
                    actionLabel={policies.length === 0 ? "Create Policy" : undefined}
                />
            ) : viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((policy) => (
                        <PolicyCard key={policy.id} policy={policy} basePath={basePath} />
                    ))}
                </div>
            ) : (
                <PolicyTable policies={filtered} basePath={basePath} onNavigate={handleNavigate} />
            )}

            {filtered.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    Showing {filtered.length} of {policies.length} policies
                </p>
            )}
        </div>
    );
}
