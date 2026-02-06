"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ─── Configuration ──────────────────────────────────────────────
//
// The idle timeout is a hard security control, not just a UX feature.
// Server-side enforcement (touch + refresh routes) rejects requests
// for idle-expired sessions. The client-side timer here is the UX
// counterpart: it shows a warning banner and auto-logouts the user.
//
// Both sides must agree on the timeout value. The server reads from
// IDLE_TIMEOUT_SEC constants in touch/route.ts and refresh/route.ts.
// The client reads from the SSR bootstrap (window.__SESSION_BOOTSTRAP__).

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
 * Architecture:
 *   This hook runs three independent timers:
 *
 *   1. **Activity listeners** (mousemove, keydown, touchstart, scroll, click)
 *      Update `lastActivityRef` on any user interaction. These are passive
 *      event listeners and have zero performance impact.
 *
 *   2. **Touch timer** (every `touchIntervalMs`, default 60s)
 *      Calls POST /api/auth/touch to update `lastSeenAt` in Redis.
 *      Only fires when the user was active recently (within 2x interval)
 *      to avoid wasting server resources when the user is AFK.
 *      CSRF-protected via the x-csrf-token header from bootstrap.
 *
 *   3. **Countdown timer** (every 1s)
 *      Computes `idleRemaining` = max(0, timeout - secondsSinceLastActivity).
 *      Transitions between states:
 *        - remaining > warningBefore → normal (showWarning = false)
 *        - remaining <= warningBefore → warning (showWarning = true)
 *        - remaining <= 0 → logout (calls POST /api/auth/logout)
 *
 * Logout flow:
 *   When idle remaining hits 0, the hook calls POST /api/auth/logout
 *   (which destroys the Redis session and returns a Keycloak logout URL),
 *   then navigates the browser to that URL to end the Keycloak SSO session.
 *   The logoutFiredRef guard prevents double-firing.
 *
 * Returns:
 *   - showWarning: true when idle and approaching timeout
 *   - idleRemaining: seconds until idle timeout (null if not tracking)
 *   - staySignedIn: call to dismiss warning and reset both local + server timers
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

    // Track user activity — resets the local idle timer.
    // This is cheap (just updates a ref) and runs on every interaction event.
    const onActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
    }, []);

    // Touch server to update lastSeenAt.
    // CSRF-protected via x-csrf-token header read from bootstrap.
    // credentials: "include" ensures neon_sid cookie is sent.
    const touchServer = useCallback(async () => {
        const bs = getBootstrap();
        try {
            await fetch("/api/auth/touch", {
                method: "POST",
                credentials: "include",
                headers: { "x-csrf-token": bs?.csrfToken ?? "" },
            });
        } catch {
            // Touch is best-effort — failing silently is acceptable.
            // If the server can't be reached, the countdown continues locally
            // and the user will be logged out when it hits 0.
        }
    }, []);

    // Logout and redirect to Keycloak front-channel logout.
    // The logoutFiredRef guard prevents duplicate calls when the countdown
    // timer fires multiple times at remaining=0 before navigation completes.
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
                // Navigate to Keycloak logout to end the SSO session.
                // Keycloak then redirects to postLogoutRedirectUri (/login).
                window.location.href = data.logoutUrl;
            } else {
                window.location.href = "/login";
            }
        } catch {
            window.location.href = "/login";
        }
    }, []);

    // Stay signed in: reset local activity timer + tell the server.
    // Called when the user clicks the "Stay signed in" button in the
    // idle warning banner.
    const staySignedIn = useCallback(async () => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);
        await touchServer();
    }, [touchServer]);

    useEffect(() => {
        // Register activity listeners (passive = no impact on scroll perf)
        const events = ["mousemove", "keydown", "touchstart", "scroll", "click"] as const;
        for (const event of events) {
            window.addEventListener(event, onActivity, { passive: true });
        }

        // Periodic server touch — sync local activity with server lastSeenAt.
        // Only fires when user was active within the last 2x interval.
        // This avoids calling touch when the user is already AFK.
        const touchTimer = setInterval(() => {
            const idleMs = Date.now() - lastActivityRef.current;
            if (idleMs < touchInterval * 2) {
                touchServer();
            }
        }, touchInterval);

        // Idle countdown timer — runs every 1s for live countdown accuracy.
        // This drives the warning banner and triggers auto-logout.
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
