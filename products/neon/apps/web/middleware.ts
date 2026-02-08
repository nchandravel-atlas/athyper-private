// middleware.ts
//
// Next.js Edge Middleware — runs on every request before route handlers.
//
// Two security controls:
//   1. CSRF Protection (double-submit cookie pattern)
//   2. Session Gate (cookie presence check)

import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

const SID_COOKIE = "neon_sid";
const LOCALE_COOKIE = "neon_locale";
const SUPPORTED_LOCALES = new Set(["en", "ms", "ta", "hi", "ar", "fr", "de"]);
const DEFAULT_LOCALE = "en";

// Routes that don't require a session cookie.
const PUBLIC_PATHS = new Set([
    "/",
    "/login",
    "/callback",
    "/logout",
    "/health",
    "/wb/select",
    "/wb/unauthorized",
    "/wb/forbidden",
]);

// Prefix-based public paths
const PUBLIC_PREFIXES = ["/public/"];

// Routes exempt from CSRF validation.
const CSRF_EXEMPT_PATHS = new Set([
    "/api/auth/login",
    "/api/auth/callback",
]);

// HTTP methods that modify state — only these require CSRF protection.
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // ─── CSRF enforcement for mutating API requests ──────────────
    if (pathname.startsWith("/api/") && MUTATING_METHODS.has(method) && !CSRF_EXEMPT_PATHS.has(pathname)) {
        const csrfHeader = req.headers.get("x-csrf-token");
        const csrfCookie = req.cookies.get("__csrf")?.value;

        if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
            return NextResponse.json(
                { error: "CSRF_VALIDATION_FAILED", message: "Missing or invalid CSRF token" },
                { status: 403 },
            );
        }
    }

    // ─── API routes pass through ─────────────────────────────────
    if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/nav") || pathname.startsWith("/api/ui") || pathname.startsWith("/api/data")) {
        return NextResponse.next();
    }

    // ─── Public routes ───────────────────────────────────────────
    if (PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // ─── Session gate for protected routes ───────────────────────
    const sid = req.cookies.get(SID_COOKIE)?.value;

    if (!sid) {
        const url = req.nextUrl.clone();
        url.pathname = "/api/auth/login";
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
    }

    // ─── Locale detection ─────────────────────────────────────────
    const existingLocale = req.cookies.get(LOCALE_COOKIE)?.value;
    if (!existingLocale) {
        const acceptLang = req.headers.get("accept-language") ?? "";
        const preferred = acceptLang
            .split(",")
            .map((part) => part.split(";")[0].trim().split("-")[0].toLowerCase())
            .find((lang) => SUPPORTED_LOCALES.has(lang));

        const response = NextResponse.next();
        response.cookies.set(LOCALE_COOKIE, preferred ?? DEFAULT_LOCALE, {
            path: "/",
            httpOnly: false,
            sameSite: "lax",
            maxAge: 365 * 24 * 60 * 60,
        });
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
