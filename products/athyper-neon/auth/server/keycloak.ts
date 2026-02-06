import "server-only";

import { createHash, randomBytes } from "node:crypto";

// ─── PKCE Utilities ──────────────────────────────────────────────

/**
 * Generate PKCE code verifier, code challenge (S256), and state parameter.
 */
export function generatePkceChallenge(): {
    codeVerifier: string;
    codeChallenge: string;
    state: string;
} {
    const codeVerifier = randomBytes(32).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
    const state = randomBytes(16).toString("hex");
    return { codeVerifier, codeChallenge, state };
}

// ─── Authorization URL Builder ───────────────────────────────────

export interface BuildAuthUrlParams {
    baseUrl: string;
    realm: string;
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
    state: string;
    scope?: string;
    /** OIDC prompt parameter: "login" forces re-authentication even if SSO session exists */
    prompt?: "none" | "login" | "consent" | "select_account";
}

/**
 * Build the Keycloak authorization endpoint URL for PKCE flow.
 */
export function buildAuthorizationUrl(params: BuildAuthUrlParams): string {
    const { baseUrl, realm, clientId, redirectUri, codeChallenge, state, scope, prompt } = params;
    const authUrl = new URL(`${baseUrl}/realms/${realm}/protocol/openid-connect/auth`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", scope ?? "openid profile email");
    if (prompt) authUrl.searchParams.set("prompt", prompt);
    return authUrl.toString();
}

// ─── Token Exchange ──────────────────────────────────────────────

export interface KeycloakTokenResponse {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in: number;
    refresh_expires_in?: number;
    token_type: string;
    scope: string;
    session_state?: string;
}

export interface ExchangeCodeParams {
    baseUrl: string;
    realm: string;
    clientId: string;
    code: string;
    codeVerifier: string;
    redirectUri: string;
}

/**
 * Exchange authorization code for tokens using PKCE.
 */
export async function exchangeCodeForTokens(params: ExchangeCodeParams): Promise<KeycloakTokenResponse> {
    const { baseUrl, realm, clientId, code, codeVerifier, redirectUri } = params;
    const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
    });

    const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Keycloak token exchange failed (${res.status}): ${text}`);
    }

    return (await res.json()) as KeycloakTokenResponse;
}

// ─── Token Refresh ───────────────────────────────────────────────

export interface RefreshTokensParams {
    baseUrl: string;
    realm: string;
    clientId: string;
    refreshToken: string;
}

/**
 * Refresh tokens using a refresh token. Rotates the refresh token.
 */
export async function refreshTokens(params: RefreshTokensParams): Promise<KeycloakTokenResponse> {
    const { baseUrl, realm, clientId, refreshToken } = params;
    const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: refreshToken,
    });

    const res = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Keycloak token refresh failed (${res.status}): ${text}`);
    }

    return (await res.json()) as KeycloakTokenResponse;
}

// ─── Keycloak Logout ─────────────────────────────────────────────

export interface LogoutParams {
    baseUrl: string;
    realm: string;
    clientId: string;
    idToken?: string;
    refreshToken?: string;
}

/**
 * End Keycloak session (server-side backchannel logout).
 * This revokes the refresh token but does NOT end the browser SSO session.
 */
export async function keycloakLogout(params: LogoutParams): Promise<void> {
    const { baseUrl, realm, clientId, idToken, refreshToken } = params;
    const logoutUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/logout`;

    const body = new URLSearchParams({ client_id: clientId });
    if (idToken) body.set("id_token_hint", idToken);
    if (refreshToken) body.set("refresh_token", refreshToken);

    try {
        await fetch(logoutUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });
    } catch {
        // Keycloak logout is best-effort
    }
}

/**
 * Build Keycloak front-channel logout URL (RP-Initiated Logout).
 * The browser must visit this URL to end the Keycloak SSO session.
 */
export function buildFrontChannelLogoutUrl(params: {
    baseUrl: string;
    realm: string;
    idToken?: string;
    postLogoutRedirectUri?: string;
}): string {
    const { baseUrl, realm, idToken, postLogoutRedirectUri } = params;
    const logoutUrl = new URL(`${baseUrl}/realms/${realm}/protocol/openid-connect/logout`);
    if (idToken) logoutUrl.searchParams.set("id_token_hint", idToken);
    if (postLogoutRedirectUri) logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
    return logoutUrl.toString();
}

// ─── JWT Decode (no verification — for extracting claims post-exchange) ───

export function decodeJwtPayload(token: string): Record<string, unknown> {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");
    const payload = Buffer.from(parts[1]!, "base64url").toString("utf-8");
    return JSON.parse(payload);
}
