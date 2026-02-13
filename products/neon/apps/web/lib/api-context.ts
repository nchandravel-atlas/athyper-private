/**
 * API context helpers for BFF routes
 *
 * Provides consistent tenant/user extraction from session for API routes.
 */

import { getSessionId } from "@neon/auth/session";
import { NextResponse } from "next/server";

async function getRedisClient(): Promise<{ get: (key: string) => Promise<string | null>; del: (key: string | string[]) => Promise<number>; quit: () => Promise<void>; isOpen: boolean }> {
    const { createClient } = await import("redis");
    const url = process.env.REDIS_URL ?? "redis://localhost:6379/0";
    const client = createClient({ url });
    if (!client.isOpen) await client.connect();
    return client as any;
}

export interface ApiContext {
    tenantId: string;
    userId: string;
    username: string;
    displayName: string;
    workbench: string;
    roles: string[];
    persona: string | null;
}

export interface SessionData {
    userId: string;
    username: string;
    displayName: string;
    workbench: string;
    roles?: string[];
    persona?: string | null;
    ipHash?: string;
    uaHash?: string;
}

/**
 * Extracts authenticated user context from session.
 *
 * @returns ApiContext if authenticated, null otherwise
 */
export async function getApiContext(): Promise<{ context: ApiContext; redis: Awaited<ReturnType<typeof getRedisClient>> } | { context: null; redis: Awaited<ReturnType<typeof getRedisClient>> }> {
    const sid = await getSessionId();
    const redis = await getRedisClient();

    if (!sid) {
        return { context: null, redis };
    }

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";

    try {
        const raw = await redis.get(`sess:${tenantId}:${sid}`);
        if (!raw) {
            return { context: null, redis };
        }

        const session: SessionData = JSON.parse(raw);

        return {
            context: {
                tenantId,
                userId: session.userId,
                username: session.username,
                displayName: session.displayName,
                workbench: session.workbench,
                roles: session.roles ?? [],
                persona: session.persona ?? null,
            },
            redis,
        };
    } catch (err) {
        console.error("[getApiContext] Error parsing session:", err);
        return { context: null, redis };
    }
}

/**
 * Standard unauthorized response for API routes
 */
export function unauthorizedResponse(message = "Unauthorized") {
    return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message } },
        { status: 401 }
    );
}

/**
 * Standard error response for API routes
 */
export function errorResponse(code: string, message: string, status = 500) {
    return NextResponse.json(
        { success: false, error: { code, message } },
        { status }
    );
}

/**
 * Standard success response for API routes
 */
export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json(
        { success: true, data },
        { status }
    );
}
