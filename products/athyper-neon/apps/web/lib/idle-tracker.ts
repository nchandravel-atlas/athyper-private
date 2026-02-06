"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface IdleTrackerOptions {
    /** Idle timeout in seconds (default: from bootstrap or 900). */
    idleTimeoutSec?: number;
    /** Seconds before idle timeout to show warning (default 180). */
    warningBeforeSec?: number;
    /** Interval to POST /api/auth/touch in ms (default 60000). */
    touchIntervalMs?: number;
}

interface SessionBootstrap {
    accessExpiresAt: number;
    idleTimeoutSec: number;
    csrfToken: string;
}

function getBootstrap(): SessionBootstrap | null {
    if (typeof window === "undefined") return null;
    return (window as any).__SESSION_BOOTSTRAP__ ?? null;
}

/**
 * useIdleTracker — tracks user inactivity against the server idle timeout.
 *
 * Behavior:
 * - Listens for mouse/keyboard/touch/scroll activity
 * - Periodically calls POST /api/auth/touch to sync lastSeenAt with server
 * - When idle remaining <= warningBeforeSec → showWarning=true with countdown
 * - When idle remaining <= 0 → calls /api/auth/logout and redirects to login
 * - "Stay signed in" resets local activity + calls touch to reset server timer
 *
 * Returns:
 * - showWarning: true when idle and approaching timeout
 * - idleRemaining: seconds until idle timeout (null if not tracking)
 * - staySignedIn: call to dismiss warning and reset idle timer
 */
export function useIdleTracker(options?: IdleTrackerOptions) {
    const bootstrap = getBootstrap();
    const idleTimeout = options?.idleTimeoutSec ?? bootstrap?.idleTimeoutSec ?? 900;
    const warningBefore = options?.warningBeforeSec ?? 180;
    const touchInterval = options?.touchIntervalMs ?? 60_000;

    const [showWarning, setShowWarning] = useState(false);
    const [idleRemaining, setIdleRemaining] = useState<number | null>(idleTimeout);
    const lastActivityRef = useRef(Date.now());
    const logoutFiredRef = useRef(false);

    // Track user activity — resets the local idle timer
    const onActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
    }, []);

    // Touch server to update lastSeenAt (CSRF-protected by middleware)
    const touchServer = useCallback(async () => {
        const bs = getBootstrap();
        try {
            await fetch("/api/auth/touch", {
                method: "POST",
                credentials: "include",
                headers: { "x-csrf-token": bs?.csrfToken ?? "" },
            });
        } catch {
            // Touch is best-effort
        }
    }, []);

    // Logout and redirect
    const doLogout = useCallback(async () => {
        if (logoutFiredRef.current) return;
        logoutFiredRef.current = true;

        const bs = getBootstrap();
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
                headers: { "x-csrf-token": bs?.csrfToken ?? "" },
            });
            const data = await res.json();
            if (data.logoutUrl) {
                window.location.href = data.logoutUrl;
            } else {
                window.location.href = "/login";
            }
        } catch {
            window.location.href = "/login";
        }
    }, []);

    // Stay signed in: reset activity + sync with server
    const staySignedIn = useCallback(async () => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
        await touchServer();
    }, [touchServer]);

    useEffect(() => {
        // Listen for user activity
        const events = ["mousemove", "keydown", "touchstart", "scroll", "click"] as const;
        for (const event of events) {
            window.addEventListener(event, onActivity, { passive: true });
        }

        // Periodic server touch (only when user was active recently)
        const touchTimer = setInterval(() => {
            const idleMs = Date.now() - lastActivityRef.current;
            if (idleMs < touchInterval * 2) {
                touchServer();
            }
        }, touchInterval);

        // Idle countdown timer (every 1s for accurate countdown)
        const idleTimer = setInterval(() => {
            const idleMs = Date.now() - lastActivityRef.current;
            const remaining = Math.max(0, idleTimeout - Math.floor(idleMs / 1000));
            setIdleRemaining(remaining);

            if (remaining <= 0) {
                doLogout();
            } else if (remaining <= warningBefore) {
                setShowWarning(true);
            } else {
                setShowWarning(false);
            }
        }, 1000);

        return () => {
            for (const event of events) {
                window.removeEventListener(event, onActivity);
            }
            clearInterval(touchTimer);
            clearInterval(idleTimer);
        };
    }, [onActivity, touchServer, doLogout, touchInterval, idleTimeout, warningBefore]);

    return { showWarning, idleRemaining, staySignedIn };
}
