import "server-only";

import { cookies } from "next/headers";

// ─── Configuration ─────────────────────────────────────────────

function getRuntimeUrl(): string {
    return process.env.RUNTIME_API_URL ?? "http://localhost:3001";
}

// ─── Redis Session Lookup ──────────────────────────────────────
// Reuses the same pattern as app/api/auth/session/route.ts

async function getRedisClient() {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client;
}

/**
 * Read the access token from the current session.
 *
 * 1. Read `neon_sid` cookie
 * 2. Look up session in Redis: `sess:{tenantId}:{sid}`
 * 3. Return the Keycloak access token (or null if session invalid)
 */
async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const sid = cookieStore.get("neon_sid")?.value;
    if (!sid) return null;

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const redis = await getRedisClient();

    try {
        const raw = await redis.get(`sess:${tenantId}:${sid}`);
        if (!raw) return null;
        const session = JSON.parse(raw);
        return session.accessToken ?? null;
    } finally {
        await redis.quit();
    }
}

// ─── Public API ────────────────────────────────────────────────

/**
 * Server-side fetch to the runtime API with automatic Bearer token injection.
 *
 * Used by all Next.js BFF route handlers to proxy requests to the runtime.
 * Reads the session cookie, extracts the access token from Redis, and forwards
 * the request with an Authorization header.
 *
 * @param path - Runtime API path (e.g. "/api/data/invoices?page=1")
 * @param init - Optional RequestInit (method, body, headers)
 * @returns Response from the runtime (status + body passed through)
 */
export async function runtimeFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await getAccessToken();
    if (!token) {
        return Response.json({ error: "UNAUTHORIZED", message: "No valid session" }, { status: 401 });
    }

    const url = `${getRuntimeUrl()}${path}`;
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);

    if (!headers.has("Content-Type") && init?.body) {
        headers.set("Content-Type", "application/json");
    }

    try {
        return await fetch(url, { ...init, headers });
    } catch {
        return Response.json(
            { error: "RUNTIME_UNAVAILABLE", message: "Runtime API is not reachable" },
            { status: 502 },
        );
    }
}
