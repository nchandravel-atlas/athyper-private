import { NextResponse } from "next/server";
import { generatePkceChallenge, buildAuthorizationUrl } from "@neon/auth/keycloak";

// Lazy Redis client for PKCE state storage
async function getRedisClient() {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client;
}

/**
 * GET /api/auth/login?workbench=admin&returnUrl=/dashboard
 *
 * Initiates PKCE Authorization Code flow:
 * 1. Generate PKCE challenge + state
 * 2. Store { codeVerifier, state, workbench, returnUrl } in Redis (TTL 300s)
 * 3. Redirect to Keycloak authorization endpoint
 */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const workbench = url.searchParams.get("workbench") ?? "user";
    const returnUrl = url.searchParams.get("returnUrl") ?? "/";

    const baseUrl = process.env.KEYCLOAK_BASE_URL ?? "http://keycloak.local";
    const realm = process.env.KEYCLOAK_REALM ?? "neon-dev";
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "neon-web";
    const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
    const redirectUri = `${publicBaseUrl}/api/auth/callback`;

    const { codeVerifier, codeChallenge, state } = generatePkceChallenge();

    // Store PKCE state in Redis (short TTL)
    const redis = await getRedisClient();
    try {
        await redis.set(
            `pkce_state:${state}`,
            JSON.stringify({ codeVerifier, workbench, returnUrl }),
            { EX: 300 },
        );
    } finally {
        await redis.quit();
    }

    const authUrl = buildAuthorizationUrl({
        baseUrl,
        realm,
        clientId,
        redirectUri,
        codeChallenge,
        state,
        prompt: "login", // Force Keycloak to show login form (prevents SSO session reuse after logout)
    });

    return NextResponse.redirect(authUrl);
}
