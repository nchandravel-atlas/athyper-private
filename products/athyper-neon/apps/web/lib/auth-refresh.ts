"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── SSR Bootstrap Read ─────────────────────────────────────────
//
// The session bootstrap is injected into the page by layout.tsx as
// `window.__SESSION_BOOTSTRAP__`. It contains the safe public subset
// of the Redis session (no tokens). The refresh hook reads two fields:
//
//   - accessExpiresAt: epoch seconds when the current access token expires
//   - csrfToken: CSRF token for the double-submit cookie pattern
//
// After a successful refresh, the bootstrap is updated in-place so that
// subsequent reads (by this hook and by useIdleTracker) see the new values.

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
 * useSessionRefresh — proactively refreshes the session before token expiry.
 *
 * Architecture:
 *   This hook ensures the user's access token stays valid without any
 *   visible interruption. It works by scheduling a refresh call to
 *   POST /api/auth/refresh shortly before the access token expires.
 *
 *   Timeline for a 300s access token:
 *     t=0     Token issued (callback or previous refresh)
 *     t=210   Refresh scheduled (expiresAt - 90s = 210s after issue)
 *     t=210   POST /api/auth/refresh → new tokens in Redis + new sid
 *     t=210   Bootstrap updated → next refresh scheduled for new expiry
 *
 *   The 90-second lead time allows for network latency and retry before
 *   the token actually expires. The floor of 5 seconds prevents tight
 *   loops if the server returns a very short expiry.
 *
 * Failure handling:
 *   - If the refresh returns a non-200 response with a `redirect` field
 *     (e.g., idle-expired → `/api/auth/login`), the browser navigates there.
 *   - If the refresh returns non-200 without redirect, or if the fetch
 *     throws (network error), the browser navigates to `/api/auth/login`.
 *   - The `refreshingRef` guard prevents concurrent refresh calls (e.g.,
 *     if a manual 401-triggered refresh races with the scheduled one).
 *
 * Integration with idle timeout:
 *   The server's refresh route checks idle timeout BEFORE refreshing.
 *   If the session is idle-expired, the refresh returns 401 + redirect,
 *   and this hook navigates to login. This is the correct behavior:
 *   an idle user's tokens should expire naturally, and the refresh
 *   hook should NOT silently extend them.
 *
 * Bootstrap mutation:
 *   After a successful refresh, the hook mutates `window.__SESSION_BOOTSTRAP__`
 *   in-place with the new `accessExpiresAt` and `csrfToken`. This is
 *   intentional — both useSessionRefresh and useIdleTracker read from
 *   the same bootstrap object, and React re-renders are not needed for
 *   these values (they're read by timers, not by rendering logic).
 *
 * Returns:
 *   - refresh: manual trigger for 401 recovery (call from fetch interceptors)
 */
export function useSessionRefresh(options?: UseSessionRefreshOptions) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Guard against concurrent refreshes (timer + manual 401 trigger racing)
    const refreshingRef = useRef(false);
    // Stable ref to avoid re-creating doRefresh when the callback changes
    const onRefreshSuccessRef = useRef(options?.onRefreshSuccess);
    onRefreshSuccessRef.current = options?.onRefreshSuccess;

    const doRefresh = useCallback(async () => {
        // Prevent concurrent refresh — only one in-flight at a time.
        // Without this, a 401-triggered refresh could race with the
        // scheduled timer refresh, causing double token rotation.
        if (refreshingRef.current) return;
        refreshingRef.current = true;

        try {
            const bootstrap = getBootstrap();
            const csrfToken = bootstrap?.csrfToken ?? "";

            // POST /api/auth/refresh is CSRF-protected via middleware.
            // The x-csrf-token header must match the __csrf cookie
            // (double-submit pattern). credentials: "include" sends
            // the neon_sid cookie for session identification.
            const res = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
                headers: {
                    "x-csrf-token": csrfToken,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                // The server returns { redirect: "/api/auth/login" } when:
                //   - Session not found (destroyed by admin or expired)
                //   - Idle-expired (IDLE_TIMEOUT_SEC exceeded)
                //   - Keycloak token refresh failed (revoked, expired)
                const body = await res.json().catch(() => ({}));
                if (body.redirect) {
                    window.location.href = body.redirect;
                    return;
                }
                // Fallback: any non-200 without explicit redirect → login
                window.location.href = "/api/auth/login";
                return;
            }

            const data = await res.json();

            // Mutate bootstrap in-place with new values from the server.
            // The refresh route returns:
            //   { ok: true, accessExpiresAt: number, csrfToken?: string }
            //
            // csrfToken may change because the refresh route rotates the
            // session ID (sid rotation for security) and the CSRF token
            // is tied to the session. The new __csrf cookie is set by
            // the refresh route's Set-Cookie header; we update the
            // bootstrap so client-side reads stay in sync.
            if (typeof window !== "undefined" && (window as any).__SESSION_BOOTSTRAP__) {
                (window as any).__SESSION_BOOTSTRAP__.accessExpiresAt = data.accessExpiresAt;
                if (data.csrfToken) {
                    (window as any).__SESSION_BOOTSTRAP__.csrfToken = data.csrfToken;
                }
            }

            // Notify caller — useful for debug panels or data reloads
            // that depend on fresh session state.
            onRefreshSuccessRef.current?.();

            // Chain: schedule the next refresh based on the new expiry.
            // This creates a self-perpetuating refresh cycle that keeps
            // the session alive as long as the browser tab is open.
            scheduleRefresh(data.accessExpiresAt);
        } catch {
            // Network error (offline, DNS failure, etc.) — redirect to login.
            // The user will need to re-authenticate when connectivity returns.
            window.location.href = "/api/auth/login";
        } finally {
            refreshingRef.current = false;
        }
    }, []);

    const scheduleRefresh = useCallback((expiresAt: number) => {
        // Clear any previously scheduled refresh to prevent duplicates
        if (timerRef.current) clearTimeout(timerRef.current);

        const now = Math.floor(Date.now() / 1000);
        // Schedule 90 seconds before expiry, with a minimum of 5 seconds
        // to prevent tight loops if the server returns a near-past expiry.
        const delay = Math.max((expiresAt - now - 90) * 1000, 5000);

        timerRef.current = setTimeout(doRefresh, delay);
    }, [doRefresh]);

    useEffect(() => {
        // On mount, read the initial accessExpiresAt from the SSR bootstrap
        // and schedule the first refresh. If there's no bootstrap (no session),
        // the hook is a no-op — no timers are started.
        const bootstrap = getBootstrap();
        if (!bootstrap?.accessExpiresAt) return;

        scheduleRefresh(bootstrap.accessExpiresAt);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [scheduleRefresh]);

    // Expose doRefresh for manual invocation — call this from fetch
    // interceptors that detect a 401 response to trigger immediate
    // refresh rather than waiting for the scheduled timer.
    return { refresh: doRefresh };
}
