import { NextResponse } from "next/server";
import { getSessionId } from "@neon/auth/session";

async function getRedisClient() {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client;
}

/** Idle timeout — must match server-side IDLE_TIMEOUT_SEC. */
const IDLE_TIMEOUT_SEC = 900;

/**
 * POST /api/auth/touch
 * Lightweight endpoint to update lastSeenAt for idle tracking.
 * CSRF-protected via middleware.
 *
 * Server-side enforcement: if session is already idle_expired
 * (lastSeenAt + IDLE_TIMEOUT < now), reject the touch.
 * A stolen sid cannot call touch to keep sessions alive indefinitely.
 */
export async function POST() {
    const sid = getSessionId();
    if (!sid) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const redis = await getRedisClient();

    try {
        const key = `sess:${tenantId}:${sid}`;
        const raw = await redis.get(key);
        if (!raw) {
            return NextResponse.json({ ok: false }, { status: 401 });
        }

        const session = JSON.parse(raw);
        const now = Math.floor(Date.now() / 1000);

        // Enforce idle timeout: if session has been idle beyond limit, reject
        const lastSeenAt = typeof session.lastSeenAt === "number" ? session.lastSeenAt : 0;
        if (lastSeenAt > 0 && (now - lastSeenAt) >= IDLE_TIMEOUT_SEC) {
            return NextResponse.json({ ok: false, reason: "idle_expired" }, { status: 401 });
        }

        session.lastSeenAt = now;
        await redis.set(key, JSON.stringify(session), { EX: 28800 });

        return NextResponse.json({ ok: true });
    } finally {
        await redis.quit();
    }
}
