// lib/session-bootstrap.ts
//
// SSR Session Bootstrap — inline safe session data into the initial HTML
// response so the client can hydrate without an extra /api/auth/session call.
//
// Security invariant:
//   The bootstrap NEVER includes tokens (accessToken, refreshToken, idToken).
//   It only contains display metadata and timing values needed for client-side UX logic.

import { cookies } from "next/headers";

import { normalizeClaims, serializeModules, serializePersonas } from "./auth/claims-normalizer";
import { WORKBENCHES } from "./auth/types";

import type { Workbench } from "./auth/types";

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
    /** CSRF token for double-submit pattern. */
    csrfToken: string;
    /** User locale (e.g. "en", "ms", "ta"). */
    locale: string;
    /** Workbenches the user is authorized to access. */
    allowedWorkbenches: Workbench[];
    /** Client roles from Keycloak resource_access. */
    clientRoles: string[];
    /** Module codes the user has access to (derived from neon:MODULE:* roles). */
    modules: string[];
    /** Persona codes assigned to the user (derived from neon:PERSONA:* roles). */
    personas: string[];
    /** Group membership paths for data scoping. */
    groups: string[];
    /** Tenant ID from the session. */
    tenantId: string;
    /** User ID (Keycloak sub). */
    userId: string;
    /** Deployment environment (local, staging, production). */
    environment: string;
    /** Subscription tier for the tenant (e.g. "Standard", "Professional", "Enterprise"). */
    subscriptionTier: string;
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
 * Called from layout.tsx (server component) during SSR.
 */
export async function getSessionBootstrap(): Promise<SessionBootstrap | null> {
    const cookieStore = await cookies();
    const sid = cookieStore.get("neon_sid")?.value;
    if (!sid) return null;

    const tenantId = process.env.DEFAULT_TENANT_ID ?? "default";

    let redis;
    try {
        redis = await getRedisClient();
        const raw = await redis.get(`sess:${tenantId}:${sid}`);
        if (!raw) return null;

        const session = JSON.parse(raw);

        // Normalize claims to derive allowedWorkbenches, modules, and personas
        const normalized = normalizeClaims({
            sub: session.userId ?? session.username ?? "",
            preferredUsername: session.username ?? "",
            email: session.email,
            name: session.displayName ?? session.username ?? "",
            realmRoles: session.roles ?? [],
            clientRoles: session.clientRoles ?? [],
            groups: session.groups ?? [],
            tenantId: session.tenantId ?? tenantId,
        });

        return {
            displayName: session.displayName ?? session.username ?? "",
            roles: session.roles ?? [],
            persona: session.persona ?? "viewer",
            workbench: session.workbench ?? "user",
            featureFlags: {},
            accessExpiresAt: session.accessExpiresAt ?? 0,
            idleTimeoutSec: IDLE_TIMEOUT_SEC,
            csrfToken: session.csrfToken ?? "",
            locale: cookieStore.get("neon_locale")?.value ?? "en",
            // In local dev, grant all workbenches so developers can switch freely
            allowedWorkbenches:
                (process.env.ENVIRONMENT ?? "local") === "local"
                    ? ([...WORKBENCHES] as Workbench[])
                    : normalized.allowedWorkbenches,
            clientRoles: normalized.clientRoles,
            modules: serializeModules(normalized.modules),
            personas: serializePersonas(normalized.personas),
            groups: normalized.groups,
            tenantId: normalized.tenantId,
            userId: normalized.userId,
            environment: process.env.ENVIRONMENT ?? "local",
            subscriptionTier: "Standard",
        };
    } catch {
        return null;
    } finally {
        await redis?.quit();
    }
}
