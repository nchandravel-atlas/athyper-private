import { NextResponse } from "next/server";
import { getSessionId, setSessionCookie, setCsrfCookie } from "@neon/auth/session";
import { refreshTokens, decodeJwtPayload } from "@neon/auth/keycloak";
import { randomUUID, createHash } from "node:crypto";

async function getRedisClient() {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client;
}

/**
 * POST /api/auth/refresh (CSRF-protected via middleware)
 *
 * 1. Load Redis session
 * 2. If access token still has > 120s remaining, no-op
 * 3. Call Keycloak token refresh
 * 4. Rotate refresh token + session ID
 * 5. Update Redis session
 * 6. Set new cookies
 * 7. On failure: destroy session, clear cookies, return redirect
 */
export async function POST() {
    const sid = getSessionId();
    if (!sid) {
        return NextResponse.json({ redirect: "/api/auth/login" }, { status: 401 });
    }

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const baseUrl = process.env.KEYCLOAK_BASE_URL ?? "http://keycloak.local";
    const realm = process.env.KEYCLOAK_REALM ?? "neon-dev";
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "neon-web";
    const env = process.env.ENVIRONMENT ?? "local";

    const redis = await getRedisClient();

    try {
        const raw = await redis.get(`sess:${tenantId}:${sid}`);
        if (!raw) {
            return NextResponse.json({ redirect: "/api/auth/login" }, { status: 401 });
        }

        const session = JSON.parse(raw);
        const now = Math.floor(Date.now() / 1000);

        // Enforce idle timeout: if session has been idle beyond limit, destroy and reject
        const IDLE_TIMEOUT_SEC = 900;
        const lastSeenAt = typeof session.lastSeenAt === "number" ? session.lastSeenAt : 0;
        if (lastSeenAt > 0 && (now - lastSeenAt) >= IDLE_TIMEOUT_SEC) {
            await redis.del(`sess:${tenantId}:${sid}`);
            return NextResponse.json({ redirect: "/api/auth/login", reason: "idle_expired" }, { status: 401 });
        }

        // Check if refresh is actually needed
        const remaining = (session.accessExpiresAt ?? 0) - now;
        if (remaining > 120) {
            return NextResponse.json({
                ok: true,
                message: "Token still valid",
                accessExpiresAt: session.accessExpiresAt,
            });
        }

        // Check if we have a refresh token
        if (!session.refreshToken) {
            // No refresh token available — session must re-auth
            await redis.del(`sess:${tenantId}:${sid}`);
            return NextResponse.json({ redirect: "/api/auth/login" }, { status: 401 });
        }

        // Call Keycloak refresh
        const tokens = await refreshTokens({ baseUrl, realm, clientId, refreshToken: session.refreshToken });

        // Rotate session ID
        const newSid = createHash("sha256").update(randomUUID() + Date.now().toString()).digest("hex");
        const newCsrfToken = randomUUID();

        // Decode new claims
        const claims = decodeJwtPayload(tokens.access_token);
        const roles: string[] = [];
        const realmAccess = claims.realm_access as { roles?: string[] } | undefined;
        if (Array.isArray(realmAccess?.roles)) {
            roles.push(...realmAccess.roles.filter((r): r is string => typeof r === "string"));
        }

        // Build updated session
        const updatedSession = {
            ...session,
            sid: newSid,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? session.refreshToken,
            accessExpiresAt: now + tokens.expires_in,
            refreshExpiresAt: tokens.refresh_expires_in ? now + tokens.refresh_expires_in : session.refreshExpiresAt,
            idToken: tokens.id_token ?? session.idToken,
            roles,
            csrfToken: newCsrfToken,
            lastSeenAt: now,
        };

        // Write new session, delete old
        await redis.set(`sess:${tenantId}:${newSid}`, JSON.stringify(updatedSession), { EX: 28800 });
        await redis.del(`sess:${tenantId}:${sid}`);

        // Update user session index
        if (session.userId) {
            await redis.sRem(`user_sessions:${tenantId}:${session.userId}`, sid);
            await redis.sAdd(`user_sessions:${tenantId}:${session.userId}`, newSid);
        }

        // Set new cookies
        setSessionCookie(newSid, env);
        setCsrfCookie(newCsrfToken, env);

        return NextResponse.json({
            ok: true,
            accessExpiresAt: updatedSession.accessExpiresAt,
            csrfToken: newCsrfToken,
        });
    } catch (e: unknown) {
        // Refresh failed — destroy session and force re-auth
        try {
            await redis.del(`sess:${tenantId}:${sid}`);
        } catch { /* best effort */ }

        return NextResponse.json(
            { redirect: "/api/auth/login", reason: e instanceof Error ? e.message : "Refresh failed" },
            { status: 401 },
        );
    } finally {
        await redis.quit();
    }
}
