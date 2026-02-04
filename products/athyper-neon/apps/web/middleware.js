"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.middleware = middleware;
var server_1 = require("next/server");
var COOKIE_NAME = "neon_session";
function middleware(req) {
    var _a;
    var pathname = req.nextUrl.pathname;
    // Public routes
    if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/callback") || pathname.startsWith("/api/auth")) {
        return server_1.NextResponse.next();
    }
    var session = (_a = req.cookies.get(COOKIE_NAME)) === null || _a === void 0 ? void 0 : _a.value;
    // Protect everything else
    if (!session) {
        var url = req.nextUrl.clone();
        url.pathname = "/login";
        return server_1.NextResponse.redirect(url);
    }
    // Basic role-based gate for workbench paths (optional)
    // NOTE: This is minimal; you can extend with full policy matrix later.
    try {
        var parsed = JSON.parse(session);
        var wb = parsed === null || parsed === void 0 ? void 0 : parsed.workbench;
        if (pathname.startsWith("/wb/admin") && wb !== "admin")
            return server_1.NextResponse.redirect(new URL("/dashboard", req.url));
        if (pathname.startsWith("/wb/user") && wb !== "user")
            return server_1.NextResponse.redirect(new URL("/dashboard", req.url));
        if (pathname.startsWith("/wb/partner") && wb !== "partner")
            return server_1.NextResponse.redirect(new URL("/dashboard", req.url));
    }
    catch (_b) { }
    return server_1.NextResponse.next();
}
exports.config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
