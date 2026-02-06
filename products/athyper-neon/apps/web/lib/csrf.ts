// products/athyper-neon/apps/web/lib/csrf.ts
//
// CSRF double-submit token utilities.

import { randomUUID } from "node:crypto";

/**
 * Generate a new CSRF token.
 */
export function generateCsrfToken(): string {
    return randomUUID();
}

/**
 * Validate CSRF double-submit pattern:
 * - headerToken: value from x-csrf-token request header
 * - cookieToken: value from __csrf cookie
 * Both must be present and match.
 */
export function validateCsrf(headerToken: string | null | undefined, cookieToken: string | null | undefined): boolean {
    if (!headerToken || !cookieToken) return false;
    if (headerToken.length === 0 || cookieToken.length === 0) return false;
    return headerToken === cookieToken;
}
