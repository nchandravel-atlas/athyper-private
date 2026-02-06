export type WorkbenchType = "admin" | "user" | "partner";

/**
 * Public session data — safe to send to the browser.
 * Contains NO tokens or secrets.
 */
export interface Session {
    userId: string;
    username: string;
    displayName?: string;
    workbench: WorkbenchType;
    roles: string[];
    persona?: string;
    accessExpiresAt?: number;
}

/**
 * Server-side session stored in Redis — NEVER sent to browser.
 * Cookie holds only an opaque session ID (neon_sid).
 */
export interface ServerSession extends Session {
    accessToken: string;
    refreshToken?: string;
    refreshExpiresAt?: number;
    idToken?: string;
    realmKey: string;
    tenantId: string;
    principalId?: string;
    ipHash: string;
    uaHash: string;
    csrfToken: string;
    createdAt: number;
    lastSeenAt: number;
}
