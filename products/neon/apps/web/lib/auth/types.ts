// lib/auth/types.ts
//
// Frozen enumerations for the authorization system.
// These define the vocabulary shared between Keycloak client roles,
// the session bootstrap, the AuthProvider, and the nav registry.
//
// Role naming conventions (Neon v2):
//   neon:WORKBENCH:<workbench>   → workbench access   (e.g., "neon:WORKBENCH:admin")
//   neon:MODULES:<module>        → module access       (e.g., "neon:MODULES:supplier")
//   neon:PERSONAS:<persona>      → persona assignment   (e.g., "neon:PERSONAS:admin")

// ─── Workbenches ──────────────────────────────────────────────────
export const WORKBENCHES = ["user", "partner", "admin", "ops"] as const;
export type Workbench = (typeof WORKBENCHES)[number];

/** Type guard for validating workbench strings at runtime. */
export function isWorkbench(value: string): value is Workbench {
    return (WORKBENCHES as readonly string[]).includes(value);
}

// ─── Role Domains ───────────────────────────────────────────────
export const ROLE_DOMAINS = ["WORKBENCH", "MODULES", "PERSONAS"] as const;
export type RoleDomain = (typeof ROLE_DOMAINS)[number];

// ─── Role types ─────────────────────────────────────────────────
export type WorkbenchRole = `neon:WORKBENCH:${Workbench}`;
export type ModuleRole = `neon:MODULES:${string}`;
export type PersonaRole = `neon:PERSONAS:${string}`;
export type NeonRole = WorkbenchRole | ModuleRole | PersonaRole;

/** Build a workbench role string. */
export function workbenchRole(wb: Workbench): WorkbenchRole {
    return `neon:WORKBENCH:${wb}`;
}

/** Build a module role string. */
export function moduleRole(mod: string): ModuleRole {
    return `neon:MODULES:${mod}`;
}

/** Build a persona role string. */
export function personaRole(persona: string): PersonaRole {
    return `neon:PERSONAS:${persona}`;
}

/** Parsed result of a neon:* role string. */
export type ParsedNeonRole =
    | { domain: "WORKBENCH"; value: Workbench }
    | { domain: "MODULES"; value: string }
    | { domain: "PERSONAS"; value: string };

/**
 * Parse a role string into its domain and value, or null if not a neon:* role.
 *
 * Examples:
 *   "neon:WORKBENCH:admin"   → { domain: "WORKBENCH", value: "admin" }
 *   "neon:MODULES:supplier"  → { domain: "MODULES",   value: "supplier" }
 *   "neon:PERSONAS:admin"    → { domain: "PERSONAS",  value: "admin" }
 *   "some-other-role"        → null
 */
export function parseNeonRole(role: string): ParsedNeonRole | null {
    if (!role.startsWith("neon:")) return null;
    const parts = role.split(":");
    if (parts.length !== 3) return null;

    const domain = parts[1];
    const value = parts[2];

    if (domain === "WORKBENCH") {
        if (isWorkbench(value)) return { domain: "WORKBENCH", value };
        return null;
    }
    if (domain === "MODULES") {
        return { domain: "MODULES", value };
    }
    if (domain === "PERSONAS") {
        return { domain: "PERSONAS", value };
    }

    return null;
}

// ─── Workbench priority for default resolution ──────────────────
/** Priority order for resolving default workbench (lower index = higher priority). */
export const WORKBENCH_PRIORITY: readonly Workbench[] = ["user", "partner", "ops", "admin"];
