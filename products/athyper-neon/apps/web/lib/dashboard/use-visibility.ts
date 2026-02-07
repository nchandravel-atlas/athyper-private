/**
 * Hook to track page visibility via document.visibilityState.
 * Used to pause polling when the browser tab is hidden.
 */

"use client";

import { useState, useEffect } from "react";

export function usePageVisibility(): boolean {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (typeof document === "undefined") return;

        setIsVisible(document.visibilityState === "visible");

        const handler = () => setIsVisible(document.visibilityState === "visible");
        document.addEventListener("visibilitychange", handler);
        return () => document.removeEventListener("visibilitychange", handler);
    }, []);

    return isVisible;
}
