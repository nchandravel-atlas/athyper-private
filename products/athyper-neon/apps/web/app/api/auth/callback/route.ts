import { NextResponse } from "next/server";
import { exchangeCodeForTokens, decodeJwtPayload } from "@neon/auth/keycloak";
import { setSessionCookie, setCsrfCookie } from "@neon/auth/session";
import { createHash, randomUUID } from "node:crypto";

async function getRedisClient() {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client;
}

function hashValue(value: string): string {
    return createHash("sha256").update(value).digest("hex");
}

function generateSid(): string {
    return createHash("sha256").update(randomUUID() + Date.now().toString()).digest("hex");
}

/**
 * GET /api/auth/callback?code=...&state=...
 *
 * Handles the OAuth2 Authorization Code callback:
 * 1. Validate state from Redis
 * 2. Exchange code for tokens via PKCE
 * 3. Decode JWT claims
 * 4. Create server-side Redis session
 * 5. Set neon_sid + __csrf cookies
 * 6. Redirect to returnUrl
 */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle Keycloak errors (user cancelled, etc.)
    if (error) {
        const errorDescription = url.searchParams.get("error_description") ?? "Authentication failed";
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(errorDescription)}`, url.origin));
    }

    if (!code || !state) {
        return new NextResponse("Missing code or state parameter", { status: 400 });
    }

    const baseUrl = process.env.KEYCLOAK_BASE_URL ?? "http://keycloak.local";
    const realm = process.env.KEYCLOAK_REALM ?? "neon-dev";
    const clientId = process.env.KEYCLOAK_CLIENT_ID ?? "neon-web";
    const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
    const redirectUri = `${publicBaseUrl}/api/auth/callback`;
    const env = process.env.ENVIRONMENT ?? "local";
    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";

    const redis = await getRedisClient();

    try {
        // 1. Load and validate PKCE state
        const stateKey = `pkce_state:${state}`;
        const stateRaw = await redis.get(stateKey);

        if (!stateRaw) {
            return new NextResponse("Invalid or expired state parameter", { status: 400 });
        }

        const { codeVerifier, workbench, returnUrl } = JSON.parse(stateRaw);
        await redis.del(stateKey); // one-time use

        // 2. Exchange code for tokens
        const tokens = await exchangeCodeForTokens({
            baseUrl,
            realm,
            clientId,
            code,
            codeVerifier,
            redirectUri,
        });

        // 3. Decode JWT claims (token already verified by Keycloak)
        const claims = decodeJwtPayload(tokens.access_token);
        const sub = typeof claims.sub === "string" ? claims.sub : "unknown";
        const preferredUsername = typeof claims.preferred_username === "string" ? claims.preferred_username : sub;
        const email = typeof claims.email === "string" ? claims.email : undefined;
        const name = typeof claims.name === "string" ? claims.name : preferredUsername;

        // Extract roles
        const roles: string[] = [];
        const realmAccess = claims.realm_access as { roles?: string[] } | undefined;
        if (Array.isArray(realmAccess?.roles)) {
            roles.push(...realmAccess.roles.filter((r): r is string => typeof r === "string"));
        }

        // 4. Compute binding hashes
        const ipHash = hashValue(req.headers.get("x-forwarded-for") ?? "unknown");
        const uaHash = hashValue(req.headers.get("user-agent") ?? "unknown");
        const csrfToken = randomUUID();
        const sid = generateSid();
        const now = Math.floor(Date.now() / 1000);

        // 5. Create Redis session (server-side, no tokens in browser)
        const session = {
            version: 1,
            sid,
            tenantId,
            userId: sub,
            username: preferredUsername,
            displayName: name,
            email,
            principalId: sub,
            realmKey: realm,
            workbench,
            roles,
            groups: [] as string[],
            persona: roles.includes("admin") ? "tenant_admin" : "requester",
            scope: tokens.scope ?? "openid profile email",
            tokenType: tokens.token_type ?? "Bearer",
            keycloakSessionId: tokens.session_state,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessExpiresAt: now + tokens.expires_in,
            refreshExpiresAt: tokens.refresh_expires_in ? now + tokens.refresh_expires_in : undefined,
            idToken: tokens.id_token,
            ipHash,
            uaHash,
            csrfToken,
            createdAt: now,
            lastSeenAt: now,
        };

        await redis.set(`sess:${tenantId}:${sid}`, JSON.stringify(session), { EX: 28800 });

        // Add to user session index
        await redis.sAdd(`user_sessions:${tenantId}:${sub}`, sid);

        // 6. Set cookies
        setSessionCookie(sid, env);
        setCsrfCookie(csrfToken, env);

        // 7. Redirect to returnUrl
        const target = new URL(returnUrl || "/", url.origin);
        return NextResponse.redirect(target);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Callback error";
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, url.origin));
    } finally {
        await redis.quit();
    }
}
