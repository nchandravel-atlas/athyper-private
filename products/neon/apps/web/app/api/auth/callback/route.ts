import { NextResponse } from "next/server";
import { exchangeCodeForTokens, decodeJwtPayload } from "@neon/auth/keycloak";
import { setSessionCookie, setCsrfCookie } from "@neon/auth/session";
import { emitBffAudit, AuthAuditEvent, hashSidForAudit } from "@neon/auth/audit";
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
 * Handles the OAuth2 Authorization Code + PKCE callback from Keycloak.
 *
 * Flow:
 *   1. Validate `state` against Redis (one-time use, prevents CSRF on the auth flow itself)
 *   2. Exchange authorization `code` + PKCE `codeVerifier` for tokens at Keycloak token endpoint
 *   3. Decode JWT claims (no verification needed — token came directly from Keycloak over HTTPS)
 *   4. Compute IP/UA hashes for soft session binding (drift detection, not hard enforcement)
 *   5. Create server-side Redis session — stores ALL tokens; browser never sees them
 *   6. Add session to `user_sessions:{tenantId}:{userId}` index (enables mass revocation)
 *   7. Set `neon_sid` (httpOnly) + `__csrf` (JS-readable) cookies
 *   8. Emit `auth.login_success` audit event
 *   9. Redirect to `returnUrl` (or `/` if not specified)
 *
 * Error handling:
 *   - Keycloak errors (user cancelled, bad credentials) → redirect to `/?error=...`
 *   - Token exchange failure → redirect to `/?error=...` + emit `auth.login_failed` audit
 *   - Missing/expired state → 400 (possible PKCE replay or timeout)
 *
 * Security notes:
 *   - PKCE state key is deleted immediately after load (one-time use)
 *   - Session ID is SHA-256(UUID + timestamp) — not guessable
 *   - CSRF token is a separate random UUID, not derived from session ID
 *   - Session TTL (28800s / 8h) is set at Redis key level via EX
 */
export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    // Handle Keycloak errors (user cancelled, IdP rejected, etc.)
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

    // Extract client context for audit trail (before Redis, in case Redis fails)
    const clientIp = req.headers.get("x-forwarded-for") ?? "unknown";
    const clientUa = req.headers.get("user-agent") ?? "unknown";

    const redis = await getRedisClient();

    try {
        // ─── Step 1: Validate PKCE state ────────────────────────────
        // The state parameter ties the callback to the login request.
        // It's stored in Redis with a 300s TTL during GET /api/auth/login.
        const stateKey = `pkce_state:${state}`;
        const stateRaw = await redis.get(stateKey);

        if (!stateRaw) {
            return new NextResponse("Invalid or expired state parameter", { status: 400 });
        }

        const { codeVerifier, workbench, returnUrl } = JSON.parse(stateRaw);
        await redis.del(stateKey); // One-time use: delete immediately to prevent replay

        // ─── Step 2: Exchange code for tokens ───────────────────────
        const tokens = await exchangeCodeForTokens({
            baseUrl,
            realm,
            clientId,
            code,
            codeVerifier,
            redirectUri,
        });

        // ─── Step 3: Decode JWT claims ──────────────────────────────
        // We decode (not verify) because the token came from Keycloak's
        // token endpoint over HTTPS — it's already trustworthy.
        // Framework-level JWT verification (via jose) happens at the
        // runtime API boundary, not here in the BFF.
        const claims = decodeJwtPayload(tokens.access_token);
        const sub = typeof claims.sub === "string" ? claims.sub : "unknown";
        const preferredUsername = typeof claims.preferred_username === "string" ? claims.preferred_username : sub;
        const email = typeof claims.email === "string" ? claims.email : undefined;
        const name = typeof claims.name === "string" ? claims.name : preferredUsername;

        // Extract realm roles from the Keycloak-standard claim path
        const roles: string[] = [];
        const realmAccess = claims.realm_access as { roles?: string[] } | undefined;
        if (Array.isArray(realmAccess?.roles)) {
            roles.push(...realmAccess.roles.filter((r): r is string => typeof r === "string"));
        }

        // Extract client roles from resource_access[clientId]
        // These contain wb:* (workbench access) and module:*:* (module permissions)
        const clientRoles: string[] = [];
        const resourceAccess = claims.resource_access as Record<string, { roles?: string[] }> | undefined;
        if (resourceAccess?.[clientId]?.roles && Array.isArray(resourceAccess[clientId].roles)) {
            clientRoles.push(...resourceAccess[clientId].roles.filter((r): r is string => typeof r === "string"));
        }

        // Extract groups from the `groups` claim (set up via Keycloak token mapper)
        const groupsClaim = claims.groups;
        const groups: string[] = Array.isArray(groupsClaim)
            ? groupsClaim.filter((g): g is string => typeof g === "string")
            : [];

        // Extract tenant_id from token claim (falls back to env var)
        const tokenTenantId = typeof claims.tenant_id === "string" ? claims.tenant_id : tenantId;

        // ─── Step 4: Compute session binding hashes ─────────────────
        // These enable soft binding: if BOTH IP and UA change, the session
        // is considered suspicious (possible cookie theft) and destroyed.
        // If only one changes, we allow it (users switch networks/browsers).
        const ipHash = hashValue(clientIp);
        const uaHash = hashValue(clientUa);
        const csrfToken = randomUUID();
        const sid = generateSid();
        const now = Math.floor(Date.now() / 1000);

        // ─── Step 5: Create Redis session ───────────────────────────
        // This is the single source of truth for the user's auth state.
        // The browser only holds the opaque `neon_sid` cookie — all
        // tokens, claims, and metadata stay server-side in Redis.
        const session = {
            version: 1,
            sid,
            tenantId: tokenTenantId,
            userId: sub,
            username: preferredUsername,
            displayName: name,
            email,
            principalId: sub,
            realmKey: realm,
            workbench,
            roles,
            clientRoles,
            groups,
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

        // EX: 28800 = 8 hours (absolute session lifetime at Redis level)
        await redis.set(`sess:${tenantId}:${sid}`, JSON.stringify(session), { EX: 28800 });

        // ─── Step 6: User session index ─────────────────────────────
        // This secondary index enables mass session revocation via
        // SessionInvalidationService.onIAMChange() or manual ops.
        await redis.sAdd(`user_sessions:${tenantId}:${sub}`, sid);

        // ─── Step 7: Set cookies ────────────────────────────────────
        await setSessionCookie(sid, env);
        await setCsrfCookie(csrfToken, env);

        // ─── Step 8: Audit — login success ──────────────────────────
        await emitBffAudit(redis, AuthAuditEvent.LOGIN_SUCCESS, {
            tenantId,
            userId: sub,
            sidHash: hashSidForAudit(sid),
            ip: clientIp,
            userAgent: clientUa,
            realm,
            workbench,
            meta: {
                username: preferredUsername,
                roles,
                tokenExpiresIn: tokens.expires_in,
                hasRefreshToken: !!tokens.refresh_token,
            },
        });

        // ─── Step 9: Redirect ───────────────────────────────────────
        const target = new URL(returnUrl || "/", url.origin);
        return NextResponse.redirect(target);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Callback error";

        // Audit — login failed
        await emitBffAudit(redis, AuthAuditEvent.LOGIN_FAILED, {
            tenantId,
            ip: clientIp,
            userAgent: clientUa,
            realm,
            reason: message,
        });

        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, url.origin));
    } finally {
        await redis.quit();
    }
}
