"use client";

import { useEffect } from "react";

interface UnsavedChangesGuardProps {
    isDirty: boolean;
}

export function UnsavedChangesGuard({ isDirty }: UnsavedChangesGuardProps) {
    useEffect(() => {
        if (!isDirty) return;

        function handler(e: BeforeUnloadEvent) {
            e.preventDefault();
        }

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    return null;
}
