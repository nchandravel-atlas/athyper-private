/**
 * Role Binding Service
 *
 * B4: Roles + Role Bindings
 * Manages role definitions and role-to-principal/group bindings
 *
 * Scoping rules:
 * - scope_kind='tenant' (default) - role applies to entire tenant
 * - scope_kind='ou' - role applies to specific OU (scope_key = ou_node.id)
 * - scope_kind='entity' - role applies to specific entity (scope_key = entity_name or entity_name:entity_id)
 *
 * Tables:
 * - core.role
 * - core.role_binding
 */

import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";
import {
  PERSONA_CODES,
  type PersonaCode,
  type ScopeMode as PersonaScopeMode,
} from "../foundation/iam/persona-model/types.js";

/**
 * Scope kind for role binding (matches DB constraint)
 */
export type ScopeKind = "tenant" | "ou" | "entity" | "module";

/**
 * Scope mode for role (matches DB constraint)
 * Extended to include "module" for module_admin persona
 */
export type ScopeMode = "tenant" | "ou" | "entity" | "module";

/**
 * Role information
 */
export type RoleInfo = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  scopeMode: ScopeMode;
  isActive: boolean;
  priority?: number;
  description?: string;
};

/**
 * Mapping from legacy role codes to persona codes
 * Used for backward compatibility when IdP sends old role names
 */
const LEGACY_ROLE_MAPPING: Record<string, PersonaCode> = {
  admin: "module_admin", // legacy "admin" maps to module_admin
  user: "requester", // legacy "user" maps to requester
  readonly: "viewer", // legacy "readonly" maps to viewer
};

/**
 * Check if a code is a valid persona code
 */
export function isPersonaCode(code: string): code is PersonaCode {
  return PERSONA_CODES.includes(code as PersonaCode);
}

/**
 * Normalize role code to persona code
 * Handles legacy role codes and returns the canonical persona
 */
export function normalizeToPersonaCode(roleCode: string): PersonaCode | null {
  // Direct match
  if (isPersonaCode(roleCode)) {
    return roleCode;
  }
  // Legacy mapping
  if (roleCode in LEGACY_ROLE_MAPPING) {
    return LEGACY_ROLE_MAPPING[roleCode];
  }
  return null;
}

/**
 * Get standard role definition by code
 */
export function getStandardRoleDef(code: PersonaCode) {
  return STANDARD_ROLES.find((r) => r.code === code);
}

/**
 * Role binding information
 */
export type RoleBindingInfo = {
  id: string;
  tenantId: string;
  roleId: string;
  principalId: string | null;
  groupId: string | null;
  scopeKind: ScopeKind;
  scopeKey: string | null;
  priority: number;
  validFrom: Date | null;
  validUntil: Date | null;
};

/**
 * Standard role definitions (7 Personas from Permission Action Model)
 *
 * Priority determines precedence when a subject has multiple roles:
 * - Lower number = higher priority
 * - tenant_admin has highest priority (10)
 * - viewer has lowest priority (70)
 */
const STANDARD_ROLES: Array<{
  code: PersonaCode;
  name: string;
  scopeMode: ScopeMode;
  priority: number;
  description: string;
}> = [
  {
    code: "viewer",
    name: "Viewer",
    scopeMode: "tenant",
    priority: 70,
    description: "Read-only access to records within tenant",
  },
  {
    code: "reporter",
    name: "Reporter",
    scopeMode: "tenant",
    priority: 60,
    description: "Viewer + reporting and export capabilities",
  },
  {
    code: "requester",
    name: "Requester",
    scopeMode: "tenant",
    priority: 50,
    description: "Can create and manage own records",
  },
  {
    code: "agent",
    name: "Agent",
    scopeMode: "ou",
    priority: 40,
    description: "Process and act on records within OU scope",
  },
  {
    code: "manager",
    name: "Manager",
    scopeMode: "ou",
    priority: 30,
    description: "Supervise and manage workflow within OU scope",
  },
  {
    code: "module_admin",
    name: "Module Admin",
    scopeMode: "module",
    priority: 20,
    description: "Administrative access within specific modules",
  },
  {
    code: "tenant_admin",
    name: "Tenant Admin",
    scopeMode: "tenant",
    priority: 10,
    description: "Full administrative access across the entire tenant",
  },
];

/**
 * Role Binding Service
 */
export class RoleBindingService {
  constructor(private readonly db: Kysely<DB>) {}

  /**
   * Seed standard roles for tenant
   */
  async seedStandardRoles(tenantId: string, createdBy: string): Promise<RoleInfo[]> {
    const roles: RoleInfo[] = [];

    for (const roleDef of STANDARD_ROLES) {
      // Check if already exists
      const existing = await this.getRoleByCode(tenantId, roleDef.code);
      if (existing) {
        roles.push(existing);
        continue;
      }

      // Create role
      const id = crypto.randomUUID();
      await this.db
        .insertInto("core.role")
        .values({
          id,
          tenant_id: tenantId,
          code: roleDef.code,
          name: roleDef.name,
          scope_mode: roleDef.scopeMode,
          is_active: true,
          created_by: createdBy,
        })
        .execute();

      roles.push({
        id,
        tenantId,
        code: roleDef.code,
        name: roleDef.name,
        scopeMode: roleDef.scopeMode,
        isActive: true,
      });

      console.log(
        JSON.stringify({
          msg: "standard_role_created",
          id,
          tenantId,
          code: roleDef.code,
        })
      );
    }

    return roles;
  }

  /**
   * Create custom role
   */
  async createRole(
    tenantId: string,
    code: string,
    name: string,
    scopeMode: ScopeMode,
    createdBy: string
  ): Promise<RoleInfo> {
    const id = crypto.randomUUID();
    await this.db
      .insertInto("core.role")
      .values({
        id,
        tenant_id: tenantId,
        code,
        name,
        scope_mode: scopeMode,
        is_active: true,
        created_by: createdBy,
      })
      .execute();

    return {
      id,
      tenantId,
      code,
      name,
      scopeMode,
      isActive: true,
    };
  }

  /**
   * Get role by ID
   */
  async getRole(roleId: string): Promise<RoleInfo | undefined> {
    const result = await this.db
      .selectFrom("core.role")
      .select(["id", "tenant_id", "code", "name", "scope_mode", "is_active"])
      .where("id", "=", roleId)
      .executeTakeFirst();

    if (!result) return undefined;

    return {
      id: result.id,
      tenantId: result.tenant_id,
      code: result.code,
      name: result.name,
      scopeMode: result.scope_mode as ScopeMode,
      isActive: result.is_active,
    };
  }

  /**
   * Get role by code
   */
  async getRoleByCode(tenantId: string, code: string): Promise<RoleInfo | undefined> {
    const result = await this.db
      .selectFrom("core.role")
      .select(["id", "tenant_id", "code", "name", "scope_mode", "is_active"])
      .where("tenant_id", "=", tenantId)
      .where("code", "=", code)
      .executeTakeFirst();

    if (!result) return undefined;

    return {
      id: result.id,
      tenantId: result.tenant_id,
      code: result.code,
      name: result.name,
      scopeMode: result.scope_mode as ScopeMode,
      isActive: result.is_active,
    };
  }

  /**
   * Create role binding
   */
  async createBinding(request: {
    tenantId: string;
    roleId: string;
    principalId?: string;
    groupId?: string;
    scopeKind?: ScopeKind;
    scopeKey?: string;
    priority?: number;
    validFrom?: Date;
    validUntil?: Date;
    createdBy: string;
  }): Promise<RoleBindingInfo> {
    // Validate: either principalId or groupId (not both)
    if (request.principalId && request.groupId) {
      throw new Error("Cannot bind to both principal and group");
    }
    if (!request.principalId && !request.groupId) {
      throw new Error("Must specify either principalId or groupId");
    }

    const id = crypto.randomUUID();
    await this.db
      .insertInto("core.role_binding")
      .values({
        id,
        tenant_id: request.tenantId,
        role_id: request.roleId,
        principal_id: request.principalId ?? null,
        group_id: request.groupId ?? null,
        scope_kind: request.scopeKind ?? "tenant",
        scope_key: request.scopeKey ?? null,
        priority: request.priority ?? 100,
        valid_from: request.validFrom ?? null,
        valid_until: request.validUntil ?? null,
        created_by: request.createdBy,
      })
      .execute();

    console.log(
      JSON.stringify({
        msg: "role_binding_created",
        id,
        roleId: request.roleId,
        principalId: request.principalId,
        groupId: request.groupId,
        scopeKind: request.scopeKind ?? "tenant",
      })
    );

    return {
      id,
      tenantId: request.tenantId,
      roleId: request.roleId,
      principalId: request.principalId ?? null,
      groupId: request.groupId ?? null,
      scopeKind: (request.scopeKind ?? "tenant") as ScopeKind,
      scopeKey: request.scopeKey ?? null,
      priority: request.priority ?? 100,
      validFrom: request.validFrom ?? null,
      validUntil: request.validUntil ?? null,
    };
  }

  /**
   * Remove role binding
   */
  async removeBinding(bindingId: string): Promise<void> {
    await this.db
      .deleteFrom("core.role_binding")
      .where("id", "=", bindingId)
      .execute();

    console.log(
      JSON.stringify({
        msg: "role_binding_removed",
        id: bindingId,
      })
    );
  }

  /**
   * Get roles for principal (direct + inherited from groups)
   */
  async getPrincipalRoles(
    principalId: string,
    tenantId: string
  ): Promise<Array<RoleInfo & { binding: RoleBindingInfo }>> {
    const now = new Date();

    // Get direct bindings
    const directBindings = await this.db
      .selectFrom("core.role_binding as rb")
      .innerJoin("core.role as r", "r.id", "rb.role_id")
      .select([
        "r.id as role_id",
        "r.tenant_id",
        "r.code",
        "r.name",
        "r.scope_mode",
        "r.is_active",
        "rb.id as binding_id",
        "rb.principal_id",
        "rb.group_id",
        "rb.scope_kind",
        "rb.scope_key",
        "rb.priority",
        "rb.valid_from",
        "rb.valid_until",
      ])
      .where("rb.tenant_id", "=", tenantId)
      .where("rb.principal_id", "=", principalId)
      .where("r.is_active", "=", true)
      .where((eb) =>
        eb.or([eb("rb.valid_from", "is", null), eb("rb.valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("rb.valid_until", "is", null), eb("rb.valid_until", ">", now)])
      )
      .execute();

    // Get group memberships
    const groupMemberships = await this.db
      .selectFrom("core.group_member")
      .select("group_id")
      .where("principal_id", "=", principalId)
      .where((eb) =>
        eb.or([eb("valid_from", "is", null), eb("valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("valid_until", "is", null), eb("valid_until", ">", now)])
      )
      .execute();

    const groupIds = groupMemberships.map((m) => m.group_id);

    // Get group-based bindings
    let groupBindings: typeof directBindings = [];
    if (groupIds.length > 0) {
      groupBindings = await this.db
        .selectFrom("core.role_binding as rb")
        .innerJoin("core.role as r", "r.id", "rb.role_id")
        .select([
          "r.id as role_id",
          "r.tenant_id",
          "r.code",
          "r.name",
          "r.scope_mode",
          "r.is_active",
          "rb.id as binding_id",
          "rb.principal_id",
          "rb.group_id",
          "rb.scope_kind",
          "rb.scope_key",
          "rb.priority",
          "rb.valid_from",
          "rb.valid_until",
        ])
        .where("rb.tenant_id", "=", tenantId)
        .where("rb.group_id", "in", groupIds)
        .where("r.is_active", "=", true)
        .where((eb) =>
          eb.or([eb("rb.valid_from", "is", null), eb("rb.valid_from", "<=", now)])
        )
        .where((eb) =>
          eb.or([eb("rb.valid_until", "is", null), eb("rb.valid_until", ">", now)])
        )
        .execute();
    }

    // Combine and deduplicate by role code (prioritize direct bindings)
    const allBindings = [...directBindings, ...groupBindings];
    const seen = new Set<string>();
    const results: Array<RoleInfo & { binding: RoleBindingInfo }> = [];

    // Sort by priority (lower = higher priority)
    allBindings.sort((a, b) => a.priority - b.priority);

    for (const row of allBindings) {
      if (seen.has(row.code)) continue;
      seen.add(row.code);

      results.push({
        id: row.role_id,
        tenantId: row.tenant_id,
        code: row.code,
        name: row.name,
        scopeMode: row.scope_mode as ScopeMode,
        isActive: row.is_active,
        binding: {
          id: row.binding_id,
          tenantId: row.tenant_id,
          roleId: row.role_id,
          principalId: row.principal_id,
          groupId: row.group_id,
          scopeKind: row.scope_kind as ScopeKind,
          scopeKey: row.scope_key,
          priority: row.priority,
          validFrom: row.valid_from,
          validUntil: row.valid_until,
        },
      });
    }

    return results;
  }

  /**
   * List roles by tenant
   */
  async listRoles(
    tenantId: string,
    filters?: {
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<RoleInfo[]> {
    let query = this.db
      .selectFrom("core.role")
      .select(["id", "tenant_id", "code", "name", "scope_mode", "is_active"])
      .where("tenant_id", "=", tenantId);

    if (filters?.isActive !== undefined) {
      query = query.where("is_active", "=", filters.isActive);
    }

    const results = await query
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0)
      .orderBy("name", "asc")
      .execute();

    return results.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      code: r.code,
      name: r.name,
      scopeMode: r.scope_mode as ScopeMode,
      isActive: r.is_active,
    }));
  }

  /**
   * Resolve the effective persona for a principal
   *
   * Takes all role bindings and returns the highest-priority persona.
   * Lower priority number = higher precedence.
   *
   * @param principalId - The principal to resolve
   * @param tenantId - The tenant context
   * @returns The effective persona code, or 'viewer' as default
   */
  async resolveEffectivePersona(
    principalId: string,
    tenantId: string
  ): Promise<PersonaCode> {
    const roles = await this.getPrincipalRoles(principalId, tenantId);

    if (roles.length === 0) {
      return "viewer"; // Default to viewer if no roles
    }

    // Find the role with the lowest priority number (highest precedence)
    let bestPersona: PersonaCode = "viewer";
    let bestPriority = Infinity;

    for (const role of roles) {
      const personaCode = normalizeToPersonaCode(role.code);
      if (!personaCode) continue;

      const roleDef = getStandardRoleDef(personaCode);
      const priority = roleDef?.priority ?? role.priority ?? 100;

      if (priority < bestPriority) {
        bestPriority = priority;
        bestPersona = personaCode;
      }
    }

    return bestPersona;
  }

  /**
   * Get all qualified personas for a principal
   *
   * Returns all personas the principal qualifies for, sorted by priority.
   * This is useful for UI to show all available access levels.
   *
   * @param principalId - The principal to check
   * @param tenantId - The tenant context
   * @returns Array of persona codes the principal qualifies for
   */
  async getQualifiedPersonas(
    principalId: string,
    tenantId: string
  ): Promise<PersonaCode[]> {
    const roles = await this.getPrincipalRoles(principalId, tenantId);

    const personas = new Set<PersonaCode>();

    for (const role of roles) {
      const personaCode = normalizeToPersonaCode(role.code);
      if (personaCode) {
        personas.add(personaCode);
      }
    }

    // Sort by priority (lowest number first = highest precedence)
    return Array.from(personas).sort((a, b) => {
      const aDef = getStandardRoleDef(a);
      const bDef = getStandardRoleDef(b);
      return (aDef?.priority ?? 100) - (bDef?.priority ?? 100);
    });
  }

  /**
   * Get persona-scoped bindings for a principal
   *
   * Returns bindings with their effective persona and scope information.
   * Used for authorization decisions that need scope context.
   */
  async getPersonaScopedBindings(
    principalId: string,
    tenantId: string
  ): Promise<
    Array<{
      personaCode: PersonaCode;
      scopeKind: ScopeKind;
      scopeKey: string | null;
      priority: number;
    }>
  > {
    const roles = await this.getPrincipalRoles(principalId, tenantId);

    return roles
      .map((role) => {
        const personaCode = normalizeToPersonaCode(role.code);
        if (!personaCode) return null;

        return {
          personaCode,
          scopeKind: role.binding.scopeKind,
          scopeKey: role.binding.scopeKey,
          priority: role.binding.priority,
        };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);
  }

  /**
   * Check if principal has a specific persona (directly or inherited)
   */
  async hasPersona(
    principalId: string,
    tenantId: string,
    personaCode: PersonaCode
  ): Promise<boolean> {
    const qualified = await this.getQualifiedPersonas(principalId, tenantId);
    return qualified.includes(personaCode);
  }

  /**
   * Get the standard role definitions
   */
  getStandardRoles(): typeof STANDARD_ROLES {
    return STANDARD_ROLES;
  }
}
