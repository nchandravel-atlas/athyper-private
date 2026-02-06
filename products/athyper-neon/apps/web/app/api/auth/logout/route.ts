import { NextResponse } from "next/server";
import { getSessionId, clearSessionCookie, clearCsrfCookie } from "@neon/auth/session";
import { keycloakLogout, buildFrontChannelLogoutUrl } from "@neon/auth/keycloak";

async function getRedisClient() {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client;
}

/**
 * POST /api/auth/logout
 *
 * 1. Load session from Redis
 * 2. Call Keycloak backchannel logout (revoke refresh token)
 * 3. Destroy Redis session
 * 4. Clear cookies
 * 5. Return Keycloak front-channel logout URL so the browser
 *    can end the Keycloak SSO session too.
 */
export async function POST() {
    const sid = getSessionId();
    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const baseUrl = process.env.KEYCLOAK_BASE_URL ?? "http://keycloak.local";
    const realm = process.env.KEYCLOAK_REALM ?? "neon-dev";
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "neon-web";
    const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";

    let idToken: string | undefined;

    if (sid) {
        const redis = await getRedisClient();
        try {
            const raw = await redis.get(`sess:${tenantId}:${sid}`);
            if (raw) {
                const session = JSON.parse(raw);
                idToken = session.idToken;

                // Keycloak backchannel logout (revoke refresh token)
                await keycloakLogout({
                    baseUrl,
                    realm,
                    clientId,
                    idToken: session.idToken,
                    refreshToken: session.refreshToken,
                });

                // Remove from user session index
                if (session.userId) {
                    await redis.sRem(`user_sessions:${tenantId}:${session.userId}`, sid);
                }
            }

            // Destroy the session
            await redis.del(`sess:${tenantId}:${sid}`);
        } finally {
            await redis.quit();
        }
    }

    clearSessionCookie();
    clearCsrfCookie();

    // Build front-channel logout URL so the browser ends the Keycloak SSO session
    const logoutUrl = buildFrontChannelLogoutUrl({
        baseUrl,
        realm,
        idToken,
        postLogoutRedirectUri: `${publicBaseUrl}/login`,
    });

    return NextResponse.json({ ok: true, logoutUrl });
}
