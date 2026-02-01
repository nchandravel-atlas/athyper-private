import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "neon_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/callback") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const session = req.cookies.get(COOKIE_NAME)?.value;

  // Protect everything else
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Basic role-based gate for workbench paths (optional)
  // NOTE: This is minimal; you can extend with full policy matrix later.
  try {
    const parsed = JSON.parse(session);
    const wb = parsed?.workbench;
    if (pathname.startsWith("/wb/admin") && wb !== "admin") return NextResponse.redirect(new URL("/dashboard", req.url));
    if (pathname.startsWith("/wb/user") && wb !== "user") return NextResponse.redirect(new URL("/dashboard", req.url));
    if (pathname.startsWith("/wb/partner") && wb !== "partner") return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch {}

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
