"use client";

import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
    draft: "bg-yellow-500",
    published: "bg-green-500",
    archived: "bg-muted-foreground/40",
};

interface StatusDotProps {
    status: string;
    className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
    const color = STATUS_COLORS[status.toLowerCase()] ?? "bg-muted-foreground/40";
    return (
        <span
            className={cn("inline-block size-2 rounded-full", color, className)}
            aria-label={status}
        />
    );
}
