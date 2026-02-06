// products/athyper-neon/apps/web/lib/session-bootstrap.ts
//
// SSR session bootstrap — inline safe session data into initial HTML
// so the client can hydrate without an extra /session call.

import { cookies } from "next/headers";

/** Idle timeout matches server-side IDLE_TIMEOUT_SEC in debug route. */
const IDLE_TIMEOUT_SEC = 900;

export interface SessionBootstrap {
    displayName: string;
    roles: string[];
    persona: string;
    workbench: string;
    featureFlags: Record<string, boolean>;
    accessExpiresAt: number;
    idleTimeoutSec: number;
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
 * Reads the Redis session and returns a safe subset for client hydration.
 * Returns null if no session or session invalid.
 * Contains NO tokens or secrets.
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

        return {
            displayName: session.displayName ?? session.username ?? "",
            roles: session.roles ?? [],
            persona: session.persona ?? "viewer",
            workbench: session.workbench ?? "user",
            featureFlags: {}, // TODO: populate from tenant config
            accessExpiresAt: session.accessExpiresAt ?? 0,
            idleTimeoutSec: IDLE_TIMEOUT_SEC,
            csrfToken: session.csrfToken ?? "",
        };
    } catch {
        return null;
    } finally {
        await redis?.quit();
    }
}
