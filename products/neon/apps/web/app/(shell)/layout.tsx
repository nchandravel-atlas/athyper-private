import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { computeSessionState } from "@/lib/session-verdict";

interface ShellLayoutProps {
    children: React.ReactNode;
}

/**
 * Resolve verdict for the current session without exposing tokens.
 * Returns "reauth_required" if the session is expired or revoked,
 * "pass" if the session is healthy/degraded (still usable), or
 * "no_session" if the cookie or Redis entry is missing.
 */
async function resolveVerdict(): Promise<"pass" | "reauth_required" | "no_session"> {
    const cookieStore = await cookies();
    const sid = cookieStore.get("neon_sid")?.value;
    if (!sid) return "no_session";

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379/0";

    let redis;
    try {
        const { createClient } = await import("redis");
        redis = createClient({ url: redisUrl });
        if (!redis.isOpen) await redis.connect();

        const raw = await redis.get(`sess:${tenantId}:${sid}`);
        if (!raw) return "no_session";

        const session = JSON.parse(raw) as Record<string, unknown>;
        const now = Math.floor(Date.now() / 1000);
        const { verdict } = computeSessionState(session, now);

        return verdict === "reauth_required" ? "reauth_required" : "pass";
    } catch (err) {
        // Fail-open on Redis errors: maintain availability during transient outages.
        // BFF route handlers provide defense-in-depth for individual API calls.
        console.error("[session-gate] Redis error — failing open:", err);
        return "pass";
    } finally {
        await redis?.quit();
    }
}

/**
 * Unified shell layout for both /wb/* and /app/* routes.
 * Reads sidebar preferences from cookies.
 *
 * Session Gate: Checks Redis session verdict on every SSR render.
 * If the session is expired or revoked, redirects to login with a returnUrl.
 * This protects all pages under the shell from direct-navigation bypass
 * (complements the edge middleware cookie-presence check).
 *
 * Note: AuthProvider is NOT set here because the workbench is not yet known.
 * It is set in the workbench sub-layout (/wb/[wb]/layout.tsx) and
 * entity sub-layout (/app/[entity]/layout.tsx).
 */
export default async function ShellLayout({ children }: ShellLayoutProps) {
    const verdict = await resolveVerdict();

    if (verdict === "reauth_required" || verdict === "no_session") {
        const headersList = await headers();
        const pathname = headersList.get("x-pathname") ?? "/";
        redirect(`/api/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
    }

    return <>{children}</>;
}
