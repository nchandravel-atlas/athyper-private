import { NextResponse } from "next/server";
import { getSessionId, clearSessionCookie, clearCsrfCookie } from "@neon/auth/session";
import { createHash } from "node:crypto";

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

/**
 * GET /api/auth/session
 * Returns public session fields only (no tokens).
 * Enforces soft IP/UA binding.
 */
export async function GET(req: Request) {
    const sid = getSessionId();
    if (!sid) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
    const redis = await getRedisClient();

    try {
        const raw = await redis.get(`sess:${tenantId}:${sid}`);
        if (!raw) {
            clearSessionCookie();
            clearCsrfCookie();
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const session = JSON.parse(raw);

        // Soft IP/UA binding check
        const currentIpHash = hashValue(req.headers.get("x-forwarded-for") ?? "unknown");
        const currentUaHash = hashValue(req.headers.get("user-agent") ?? "unknown");

        if (session.ipHash && session.ipHash !== currentIpHash) {
            // IP changed significantly — log but don't immediately reject
            // (users may switch networks). Only reject if BOTH differ.
            if (session.uaHash && session.uaHash !== currentUaHash) {
                clearSessionCookie();
                clearCsrfCookie();
                await redis.del(`sess:${tenantId}:${sid}`);
                return NextResponse.json(
                    { authenticated: false, reason: "session_binding_mismatch" },
                    { status: 401 },
                );
            }
        }

        return NextResponse.json({
            authenticated: true,
            userId: session.userId,
            username: session.username,
            displayName: session.displayName,
            workbench: session.workbench,
            roles: session.roles ?? [],
            persona: session.persona,
            accessExpiresAt: session.accessExpiresAt,
        });
    } finally {
        await redis.quit();
    }
}

/**
 * DELETE /api/auth/session — destroy session
 */
export async function DELETE() {
    const sid = getSessionId();
    if (sid) {
        const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";
        const redis = await getRedisClient();
        try {
            await redis.del(`sess:${tenantId}:${sid}`);
        } finally {
            await redis.quit();
        }
    }

    clearSessionCookie();
    clearCsrfCookie();
    return NextResponse.json({ ok: true });
}
