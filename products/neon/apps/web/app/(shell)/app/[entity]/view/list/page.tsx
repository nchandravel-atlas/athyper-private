"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Badge, Input } from "@neon/ui";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Entity class metadata (for header badge)
// ---------------------------------------------------------------------------

const ENTITY_META: Record<string, { label: string; entityClass: string }> = {
    account: { label: "Accounts", entityClass: "Master" },
    "purchase-invoice": { label: "Purchase Invoices", entityClass: "Document" },
};

// Fields to display in the table per entity (ordered)
const DISPLAY_COLUMNS: Record<string, string[]> = {
    account: ["account_code", "account_name", "account_type", "currency", "status"],
    "purchase-invoice": ["invoice_number", "supplier", "invoice_date", "total_amount", "currency", "status"],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ListViewPage() {
    const params = useParams<{ entity: string }>();
    const router = useRouter();
    const entity = params.entity;

    const [records, setRecords] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchRecords() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/data/${encodeURIComponent(entity)}`, {
                    credentials: "same-origin",
                });
                if (!res.ok) {
                    const body = (await res.json()) as { error?: { message?: string } };
                    throw new Error(body.error?.message ?? `Failed to load records (${res.status})`);
                }
                const body = (await res.json()) as { data: Record<string, unknown>[] };
                if (!cancelled) {
                    setRecords(body.data ?? []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load records");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchRecords();
        return () => { cancelled = true; };
    }, [entity]);

    const meta = ENTITY_META[entity];
    const columns = DISPLAY_COLUMNS[entity];

    // If no column config, auto-detect from first record (excluding id)
    const effectiveColumns = columns ?? (
        records.length > 0
            ? Object.keys(records[0]).filter((k) => k !== "id")
            : []
    );

    // Filter records by search term
    const filtered = search
        ? records.filter((r) =>
              effectiveColumns.some((col) => {
                  const val = r[col];
                  return val != null && String(val).toLowerCase().includes(search.toLowerCase());
              }),
          )
        : records;

    // Format column header from snake_case
    function formatHeader(key: string): string {
        return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Format cell value
    function formatValue(key: string, value: unknown): string {
        if (value == null) return "\u2014";
        if (typeof value === "number" && (key.includes("amount") || key.includes("price"))) {
            return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return String(value);
    }

    // Badge variant for status fields
    function statusVariant(value: string): "success" | "secondary" | "destructive" | "default" | "outline" {
        const lower = value.toLowerCase();
        if (lower === "active" || lower === "paid" || lower === "approved") return "success";
        if (lower === "inactive" || lower === "cancelled") return "destructive";
        if (lower === "draft") return "secondary";
        if (lower === "submitted") return "default";
        return "outline";
    }

    // ---- Loading ----
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
                <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
            </div>
        );
    }

    // ---- Error ----
    if (error) {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold">
                        {meta?.label ?? entity.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </h1>
                    {meta?.entityClass && (
                        <Badge variant="outline" className="text-xs">
                            {meta.entityClass}
                        </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                    </Badge>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Search records..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="rounded-md border p-8 text-center text-sm text-gray-500">
                    {search ? "No records match your search." : "No records found."}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            {effectiveColumns.map((col) => (
                                <TableHead key={col}>{formatHeader(col)}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((record) => {
                            const id = String(record.id ?? "");
                            return (
                                <TableRow
                                    key={id}
                                    className="cursor-pointer"
                                    onClick={() => router.push(`/app/${entity}/${id}`)}
                                >
                                    {effectiveColumns.map((col) => {
                                        const value = record[col];
                                        const isStatus = col === "status";
                                        return (
                                            <TableCell key={col}>
                                                {isStatus && value != null ? (
                                                    <Badge variant={statusVariant(String(value))}>
                                                        {String(value)}
                                                    </Badge>
                                                ) : (
                                                    formatValue(col, value)
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
