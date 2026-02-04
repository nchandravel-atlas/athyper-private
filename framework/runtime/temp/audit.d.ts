export type AuditLevel = "info" | "warn" | "error";
export type AuditActorKind = "system" | "user" | "service";
export interface AuditActor {
    kind: AuditActorKind;
    id?: string;
    realmKey?: string;
    tenantKey?: string;
    orgKey?: string;
}
export interface AuditEvent {
    ts: string;
    type: string;
    level: AuditLevel;
    actor: AuditActor;
    requestId?: string;
    message?: string;
    meta?: Record<string, unknown>;
}
export interface AuditWriter {
    write(event: AuditEvent): void | Promise<void>;
    flush?(): Promise<void>;
}
/**
 * Default audit writer for development / bootstrap.
 * Keeps kernel decoupled from any structured logging library.
 */
export declare function createConsoleAuditWriter(): AuditWriter;
export declare function createNoopAuditWriter(): AuditWriter;
/**
 * Helper to create an AuditEvent with the current timestamp.
 * Simplifies audit event creation by auto-adding the timestamp.
 */
export declare function makeAuditEvent(data: {
    type: string;
    level: AuditLevel;
    actor: AuditActor;
    requestId?: string;
    message?: string;
    meta?: Record<string, unknown>;
}): AuditEvent;
