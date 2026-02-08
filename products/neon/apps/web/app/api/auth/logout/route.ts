import { NextResponse } from "next/server";
import { getSessionId, clearSessionCookie, clearCsrfCookie } from "@neon/auth/session";
import { keycloakLogout, buildFrontChannelLogoutUrl } from "@neon/auth/keycloak";
import { emitBffAudit, AuthAuditEvent, hashSidForAudit } from "@neon/auth/audit";

async function getRedisClient() {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client;
}

/**
 * POST /api/auth/logout (CSRF-protected via middleware)
 *
 * Performs a complete multi-layer logout:
 *
 *   Layer 1 — Keycloak backchannel: Revokes the refresh token at Keycloak's
 *             token revocation endpoint. This prevents the token from being
 *             used even if leaked. Best-effort (Keycloak may be down).
 *
 *   Layer 2 — Redis session: Deletes the session key and removes the sid
 *             from the user_sessions index. Immediate effect.
 *
 *   Layer 3 — Browser cookies: Clears `neon_sid` and `__csrf` cookies.
 *
 *   Layer 4 — Front-channel: Returns a Keycloak front-channel logout URL.
 *             The client must navigate to this URL to end the Keycloak SSO
 *             session (shared across all apps in the realm). Without this,
 *             the user would be silently re-authenticated on next login
 *             (SSO cookie still valid).
 *
 * The response includes `{ ok: true, logoutUrl: "..." }`. The client should
 * navigate to `logoutUrl` to complete the SSO logout. Keycloak then redirects
 * back to the post-logout URI (typically `/login`).
 *
 * Audit: Emits `auth.logout` with userId, tenantId, and session hash.
 *
 * Callers:
 *   - useIdleTracker hook (auto-logout on idle timeout)
 *   - Admin console logout button
 *   - Any explicit logout action
 */
export async function POST() {
    const sid = await getSessionId();
    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const baseUrl = process.env.KEYCLOAK_BASE_URL ?? "http://keycloak.local";
    const realm = process.env.KEYCLOAK_REALM ?? "neon-dev";
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "neon-web";
    const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";

    let idToken: string | undefined;
    let userId: string | undefined;

    if (sid) {
        const redis = await getRedisClient();
        try {
            const raw = await redis.get(`sess:${tenantId}:${sid}`);
            if (raw) {
                const session = JSON.parse(raw);
                idToken = session.idToken;
                userId = session.userId;

                // Layer 1: Keycloak backchannel logout (revoke refresh token)
                // Best-effort — Keycloak may be unreachable, but we still
                // destroy the local session regardless.
                await keycloakLogout({
                    baseUrl,
                    realm,
                    clientId,
                    idToken: session.idToken,
                    refreshToken: session.refreshToken,
                });

                // Layer 2a: Remove from user session index
                if (session.userId) {
                    await redis.sRem(`user_sessions:${tenantId}:${session.userId}`, sid);
                }
            }

            // Layer 2b: Destroy the session key
            await redis.del(`sess:${tenantId}:${sid}`);

            // Audit — logout
            await emitBffAudit(redis, AuthAuditEvent.LOGOUT, {
                tenantId,
                userId,
                sidHash: hashSidForAudit(sid),
                realm,
                meta: { source: "explicit" },
            });
        } finally {
            await redis.quit();
        }
    }

    // Layer 3: Clear browser cookies
    await clearSessionCookie();
    await clearCsrfCookie();

    // Layer 4: Build front-channel logout URL for the browser to visit
    // This ends the Keycloak SSO session, preventing silent re-authentication.
    const logoutUrl = buildFrontChannelLogoutUrl({
        baseUrl,
        realm,
        idToken,
        postLogoutRedirectUri: `${publicBaseUrl}/login`,
    });

    return NextResponse.json({ ok: true, logoutUrl });
}
