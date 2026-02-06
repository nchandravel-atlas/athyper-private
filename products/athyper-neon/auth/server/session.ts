import "server-only";

import { cookies } from "next/headers";

// Cookie now holds ONLY the session ID — no tokens in browser.

const SID_COOKIE = "neon_sid";
const CSRF_COOKIE = "__csrf";

/**
 * Set the session ID cookie (httpOnly, not readable by JS).
 */
export function setSessionCookie(sid: string, env: string = "local"): void {
    const isProduction = env === "production" || env === "staging";
    cookies().set(SID_COOKIE, sid, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 28800, // 8 hours
    });
}

/**
 * Clear the session ID cookie.
 */
export function clearSessionCookie(): void {
    cookies().delete(SID_COOKIE);
}

/**
 * Read the session ID from cookie. Returns null if not present.
 */
export function getSessionId(): string | null {
    return cookies().get(SID_COOKIE)?.value ?? null;
}

/**
 * Set the CSRF double-submit cookie.
 * This cookie is NOT httpOnly — client JS reads it to send as header.
 */
export function setCsrfCookie(token: string, env: string = "local"): void {
    const isProduction = env === "production" || env === "staging";
    cookies().set(CSRF_COOKIE, token, {
        httpOnly: false,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: 28800,
    });
}

/**
 * Clear the CSRF cookie.
 */
export function clearCsrfCookie(): void {
    cookies().delete(CSRF_COOKIE);
}

/**
 * Read the CSRF token from cookie.
 */
export function getCsrfCookie(): string | null {
    return cookies().get(CSRF_COOKIE)?.value ?? null;
}
