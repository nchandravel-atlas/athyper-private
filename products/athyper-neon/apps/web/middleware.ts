import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SID_COOKIE = "neon_sid";

// Routes that don't require a session
const PUBLIC_PATHS = new Set(["/", "/login", "/callback"]);

// Routes exempt from CSRF check (no session yet during auth initiation)
const CSRF_EXEMPT_PATHS = new Set([
    "/api/auth/login",
    "/api/auth/callback",
]);

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // ─── CSRF enforcement for mutating API requests ───
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

    // ─── Auth API routes pass through (handled by route handlers) ───
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // ─── Public routes ───
    if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/login") || pathname.startsWith("/callback")) {
        return NextResponse.next();
    }

    // ─── Session check for protected routes ───
    const sid = req.cookies.get(SID_COOKIE)?.value;

    if (!sid) {
        const url = req.nextUrl.clone();
        url.pathname = "/api/auth/login";
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
    }

    // Note: Full session validation happens server-side in route handlers.
    // Middleware only checks cookie presence for fast redirect.

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
