"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<string, string> = {
    ref: "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300",
    ent: "border-green-300 text-green-700 dark:border-green-700 dark:text-green-300",
    doc: "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300",
};

const KIND_LABELS: Record<string, string> = {
    ref: "Reference",
    ent: "Enterprise",
    doc: "Document",
};

interface KindBadgeProps {
    kind: string;
    className?: string;
}

export function KindBadge({ kind, className }: KindBadgeProps) {
    const style = KIND_STYLES[kind.toLowerCase()] ?? "";
    const label = KIND_LABELS[kind.toLowerCase()] ?? kind;
    return (
        <Badge variant="outline" className={cn("text-xs font-normal", style, className)}>
            {label}
        </Badge>
    );
}
