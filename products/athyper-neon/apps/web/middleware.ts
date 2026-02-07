// products/athyper-neon/apps/web/middleware.ts
//
// Next.js Edge Middleware — runs on every request before route handlers.
//
// This middleware enforces two security controls:
//
//   1. CSRF Protection (double-submit cookie pattern)
//      For mutating requests (POST/PUT/PATCH/DELETE) to /api/* routes,
//      the middleware verifies that the `x-csrf-token` header matches
//      the `__csrf` cookie. This prevents cross-origin request forgery
//      because an attacker cannot read same-origin cookies to set the header.
//
//      Exempt routes: /api/auth/login and /api/auth/callback — these
//      initiate the auth flow before any session/CSRF cookie exists.
//
//   2. Session Gate (cookie presence check)
//      For protected routes (anything not public), the middleware checks
//      for the `neon_sid` cookie. If missing, it redirects to
//      /api/auth/login with the original URL as `returnUrl`.
//
//      IMPORTANT: The middleware does NOT validate the session itself
//      (no Redis lookup, no JWT verification). Full validation happens
//      in the route handlers. The middleware is a fast-path gate that
//      prevents unauthenticated users from reaching protected pages.
//
// Request flow:
//   Browser → Edge Middleware → [CSRF check] → [session gate] → Route Handler
//
// Why this runs at the edge:
//   Edge middleware has sub-millisecond cold starts and runs before any
//   server component or API route. This makes it ideal for cheap checks
//   (cookie presence, header comparison) that can short-circuit requests
//   without warming up the full Node.js runtime.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SID_COOKIE = "neon_sid";
const LOCALE_COOKIE = "neon_locale";
const SUPPORTED_LOCALES = new Set(["en", "ms", "ta", "hi", "ar"]);
const DEFAULT_LOCALE = "en";

// Routes that don't require a session cookie.
// Public pages and the auth flow entry points.
const PUBLIC_PATHS = new Set(["/", "/login", "/callback"]);

// Routes exempt from CSRF validation.
// These are the auth flow entry points — no session exists yet,
// so there's no __csrf cookie to validate against.
//   - /api/auth/login: initiates PKCE flow (GET, but listed for completeness)
//   - /api/auth/callback: handles Keycloak redirect (GET, creates session)
const CSRF_EXEMPT_PATHS = new Set([
    "/api/auth/login",
    "/api/auth/callback",
]);

// HTTP methods that modify state — only these require CSRF protection.
// GET/HEAD/OPTIONS are safe methods and don't need CSRF tokens.
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // ─── CSRF enforcement for mutating API requests ──────────────
    //
    // Double-submit cookie pattern:
    //   The client sends the CSRF token in the `x-csrf-token` header
    //   (read from window.__SESSION_BOOTSTRAP__.csrfToken).
    //   The browser automatically sends the `__csrf` cookie.
    //   If both match → the request is same-origin (attacker can't read cookies).
    //   If they don't match → 403 (possible CSRF attack).
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
    // Auth, UI, and Data API route handlers manage their own validation.
    if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/ui") || pathname.startsWith("/api/data")) {
        return NextResponse.next();
    }

    // ─── Public routes ───────────────────────────────────────────
    // Landing page, login page, and callback page don't require sessions.
    if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/login") || pathname.startsWith("/callback")) {
        return NextResponse.next();
    }

    // ─── Session gate for protected routes ───────────────────────
    // Check for the `neon_sid` cookie. If absent, redirect to the
    // PKCE login flow with the current URL preserved as `returnUrl`
    // so the user returns to their intended page after authentication.
    const sid = req.cookies.get(SID_COOKIE)?.value;

    if (!sid) {
        const url = req.nextUrl.clone();
        url.pathname = "/api/auth/login";
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
    }

    // Cookie present — allow the request through.
    // Full session validation (Redis lookup, idle check, IP/UA binding)
    // happens in the route handlers, not here. This keeps the middleware
    // fast and avoids Redis I/O at the edge.

    // ─── Locale detection ─────────────────────────────────────────
    // Sets `neon_locale` cookie if not already present.
    // Priority: existing cookie → Accept-Language header → default (en).
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

// Match all routes except Next.js internals and static assets.
// This ensures the middleware runs on all page navigations and API calls.
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
