// products/athyper-neon/apps/web/lib/csrf.ts
//
// CSRF double-submit cookie pattern utilities.
//
// How the double-submit pattern works in this app:
//
//   1. On login (callback/route.ts), the server generates a random CSRF
//      token and stores it in the Redis session AND sets it as the `__csrf`
//      cookie (NOT httpOnly — JS-readable on purpose).
//
//   2. The SSR bootstrap (session-bootstrap.ts → layout.tsx) injects the
//      same token into `window.__SESSION_BOOTSTRAP__.csrfToken`.
//
//   3. On every mutating request (POST/PUT/PATCH/DELETE), the client reads
//      the token from the bootstrap and sends it as the `x-csrf-token` header.
//
//   4. The Next.js middleware (middleware.ts) compares the header value against
//      the `__csrf` cookie. If they don't match → 403 CSRF_VALIDATION_FAILED.
//
// Why this works:
//   - A cross-origin attacker can trigger a POST (e.g., via a hidden form),
//     and the browser will send the `__csrf` cookie automatically. But the
//     attacker cannot read the cookie value (same-origin policy) and therefore
//     cannot set the matching `x-csrf-token` header.
//   - The cookie is SameSite=Strict, so it's not sent on cross-site navigations,
//     providing an additional defense layer.
//
// Token lifecycle:
//   - Generated at login (callback/route.ts)
//   - Rotated on refresh (refresh/route.ts) when session ID rotates
//   - Cleared on logout (logout/route.ts)
//
// These utilities are used by the server-side route handlers. The middleware
// does its own inline comparison for performance (avoids importing this module
// at the edge runtime).

import { randomUUID } from "node:crypto";

/**
 * Generate a new CSRF token (UUID v4).
 * Called during login callback and session refresh.
 */
export function generateCsrfToken(): string {
    return randomUUID();
}

/**
 * Validate the CSRF double-submit pattern.
 *
 * @param headerToken - Value from the `x-csrf-token` request header (set by client JS)
 * @param cookieToken - Value from the `__csrf` cookie (set by server at login)
 * @returns true if both are present, non-empty, and equal
 *
 * Both must be present and match. Timing-safe comparison is not required
 * here because the token is not a secret (it's readable by any JS on the
 * same origin) — it only proves that the requester can read same-origin cookies.
 */
export function validateCsrf(headerToken: string | null | undefined, cookieToken: string | null | undefined): boolean {
    if (!headerToken || !cookieToken) return false;
    if (headerToken.length === 0 || cookieToken.length === 0) return false;
    return headerToken === cookieToken;
}
