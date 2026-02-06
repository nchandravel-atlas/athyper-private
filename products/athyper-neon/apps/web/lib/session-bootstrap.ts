// products/athyper-neon/apps/web/lib/session-bootstrap.ts
//
// SSR Session Bootstrap — inline safe session data into the initial HTML
// response so the client can hydrate without an extra /api/auth/session call.
//
// How it works:
//   1. layout.tsx (server component) calls getSessionBootstrap()
//   2. This function reads the `neon_sid` cookie → loads the Redis session
//   3. Returns a safe public subset (no tokens, no secrets)
//   4. layout.tsx injects it as `window.__SESSION_BOOTSTRAP__` via <script>
//   5. Client hooks (useIdleTracker, useSessionRefresh) read from this object
//
// Why this exists:
//   Without the bootstrap, every page load would need to call GET /api/auth/session
//   before the client knows the user's display name, roles, idle timeout, etc.
//   The bootstrap eliminates that round-trip and enables instant hydration.
//
// Security invariant:
//   The bootstrap NEVER includes tokens (accessToken, refreshToken, idToken).
//   It only contains display metadata (name, roles, persona) and timing values
//   (accessExpiresAt, idleTimeoutSec) needed for client-side UX logic.
//   The csrfToken IS included — it's not a secret (same-origin JS can read the
//   __csrf cookie anyway), and it's needed for the double-submit CSRF pattern.
//
// Consumers:
//   - useIdleTracker: reads idleTimeoutSec and csrfToken
//   - useSessionRefresh: reads accessExpiresAt and csrfToken
//   - UI components: read displayName, roles, persona, workbench for rendering

import { cookies } from "next/headers";

/**
 * Idle timeout in seconds. Must match IDLE_TIMEOUT_SEC in:
 *   - touch/route.ts (server-side enforcement)
 *   - refresh/route.ts (server-side enforcement)
 *   - debug/route.ts (state machine computation)
 *
 * When changing this value, update all four locations.
 */
const IDLE_TIMEOUT_SEC = 900;

export interface SessionBootstrap {
    displayName: string;
    roles: string[];
    persona: string;
    workbench: string;
    featureFlags: Record<string, boolean>;
    /** Epoch seconds when the access token expires. Used by useSessionRefresh. */
    accessExpiresAt: number;
    /** Idle timeout in seconds. Used by useIdleTracker. */
    idleTimeoutSec: number;
    /** CSRF token for double-submit pattern. Used by all client-side fetches. */
    csrfToken: string;
}

async function getRedisClient() {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client;
}

/**
 * Reads the Redis session and returns a safe public subset for client hydration.
 *
 * Called from layout.tsx (server component) during SSR. The returned object
 * is serialized to JSON and injected into the HTML as a <script> tag.
 *
 * Returns null if:
 *   - No `neon_sid` cookie present (not logged in)
 *   - Session not found in Redis (expired or destroyed)
 *   - Redis unreachable (fail-open for SSR — client hooks will handle auth)
 *
 * IMPORTANT: This function runs on every page load. Keep it lightweight.
 * It does a single Redis GET — no token validation, no Keycloak calls.
 */
export async function getSessionBootstrap(): Promise<SessionBootstrap | null> {
    const sid = cookies().get("neon_sid")?.value;
    if (!sid) return null;

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";

    let redis;
    try {
        redis = await getRedisClient();
        const raw = await redis.get(`sess:${tenantId}:${sid}`);
        if (!raw) return null;

        const session = JSON.parse(raw);

        // Return ONLY the public subset — no accessToken, refreshToken, or idToken.
        // The csrfToken is included because client hooks need it for CSRF headers.
        return {
            displayName: session.displayName ?? session.username ?? "",
            roles: session.roles ?? [],
            persona: session.persona ?? "viewer",
            workbench: session.workbench ?? "user",
            featureFlags: {}, // TODO: populate from tenant config when feature flag system is wired
            accessExpiresAt: session.accessExpiresAt ?? 0,
            idleTimeoutSec: IDLE_TIMEOUT_SEC,
            csrfToken: session.csrfToken ?? "",
        };
    } catch {
        // Redis failure during SSR — return null (no bootstrap).
        // The client will behave as if not logged in until hooks kick in.
        return null;
    } finally {
        await redis?.quit();
    }
}
