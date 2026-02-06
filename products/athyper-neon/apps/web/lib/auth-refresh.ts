"use client";

import { useEffect, useRef, useCallback } from "react";

interface SessionBootstrap {
    accessExpiresAt: number;
    csrfToken: string;
}

function getBootstrap(): SessionBootstrap | null {
    if (typeof window === "undefined") return null;
    return (window as any).__SESSION_BOOTSTRAP__ ?? null;
}

interface UseSessionRefreshOptions {
    /** Called after a successful token refresh. Use to reload UI data. */
    onRefreshSuccess?: () => void;
}

/**
 * useSessionRefresh — proactively refreshes the session before expiry.
 *
 * - Schedules refresh at accessExpiresAt - 90s
 * - On 401 from any fetch: triggers immediate refresh
 * - On refresh failure: redirects to login
 * - Calls onRefreshSuccess after each successful refresh
 */
export function useSessionRefresh(options?: UseSessionRefreshOptions) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const refreshingRef = useRef(false);
    const onRefreshSuccessRef = useRef(options?.onRefreshSuccess);
    onRefreshSuccessRef.current = options?.onRefreshSuccess;

    const doRefresh = useCallback(async () => {
        if (refreshingRef.current) return;
        refreshingRef.current = true;

        try {
            const bootstrap = getBootstrap();
            const csrfToken = bootstrap?.csrfToken ?? "";

            const res = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
                headers: {
                    "x-csrf-token": csrfToken,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                if (body.redirect) {
                    window.location.href = body.redirect;
                    return;
                }
                window.location.href = "/api/auth/login";
                return;
            }

            const data = await res.json();

            // Update bootstrap with new expiry and CSRF token
            if (typeof window !== "undefined" && (window as any).__SESSION_BOOTSTRAP__) {
                (window as any).__SESSION_BOOTSTRAP__.accessExpiresAt = data.accessExpiresAt;
                if (data.csrfToken) {
                    (window as any).__SESSION_BOOTSTRAP__.csrfToken = data.csrfToken;
                }
            }

            // Notify caller (e.g., reload debug data)
            onRefreshSuccessRef.current?.();

            // Schedule next refresh
            scheduleRefresh(data.accessExpiresAt);
        } catch {
            window.location.href = "/api/auth/login";
        } finally {
            refreshingRef.current = false;
        }
    }, []);

    const scheduleRefresh = useCallback((expiresAt: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        const now = Math.floor(Date.now() / 1000);
        const delay = Math.max((expiresAt - now - 90) * 1000, 5000); // at least 5s

        timerRef.current = setTimeout(doRefresh, delay);
    }, [doRefresh]);

    useEffect(() => {
        const bootstrap = getBootstrap();
        if (!bootstrap?.accessExpiresAt) return;

        scheduleRefresh(bootstrap.accessExpiresAt);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [scheduleRefresh]);

    // Expose refresh for manual trigger (e.g., on 401)
    return { refresh: doRefresh };
}
