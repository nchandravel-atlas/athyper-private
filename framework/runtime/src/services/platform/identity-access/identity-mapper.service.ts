/**
 * Identity Mapper Service
 *
 * B1: Canonical Identity Model
 * Maps external IdP identities (Keycloak) to athyper principals
 *
 * Mapping Rules:
 * - Keycloak user.sub → core.idp_identity.subject
 * - athyper actor → core.principal.id
 * - principal_type='user' for humans
 * - principal_type='service' for workers/integrations
 * - principal_type='external' for external actors
 *
 * Tables:
 * - core.principal
 * - core.idp_identity
 * - core.principal_profile (optional)
 */

import type { DB } from "@athyper/adapter-db";
import type { Kysely } from "kysely";

/**
 * Principal type (matches DB constraint)
 */
export type PrincipalType = "user" | "service" | "external";

/**
 * Principal status (matches DB constraint)
 */
export type PrincipalStatus = "active" | "disabled" | "archived";

/**
 * IdP identity information from token
 */
export type IdpIdentityInfo = {
  /** Realm (e.g., "main") - maps to Keycloak realm */
  realm: string;

  /** IdP provider (e.g., "keycloak") */
  provider: string;

  /** Subject from IdP (sub claim) - immutable identifier */
  subject: string;

  /** Username from IdP */
  username?: string;

  /** Display name from IdP */
  displayName?: string;

  /** Email from IdP (for profile) */
  email?: string;
};

/**
 * Principal creation result
 */
export type PrincipalResult = {
  /** Principal ID */
  principalId: string;

  /** Whether this was a new principal */
  isNew: boolean;

  /** IdP identity ID */
  idpIdentityId: string;
};

/**
 * Identity Mapper Service
 *
 * Handles mapping between external IdP identities and internal principals
 */
export class IdentityMapperService {
  constructor(private readonly db: Kysely<DB>) {}

  /**
   * Map IdP identity to principal (upsert)
   *
   * This is the primary entry point for authentication.
   * Called after token validation to ensure principal exists.
   *
   * @param tenantId - Tenant ID from token
   * @param idpInfo - Identity information from IdP token
   * @param principalType - Type of principal (default: user)
   * @param createdBy - Actor creating the record
   */
  async mapIdentityToPrincipal(
    tenantId: string,
    idpInfo: IdpIdentityInfo,
    principalType: PrincipalType = "user",
    createdBy: string = "system"
  ): Promise<PrincipalResult> {
    console.log(
      JSON.stringify({
        msg: "identity_mapping_start",
        tenantId,
        realm: idpInfo.realm,
        provider: idpInfo.provider,
        subject: idpInfo.subject,
        principalType,
      })
    );

    // Check if idp_identity already exists
    const existingIdentity = await this.getIdpIdentity(
      tenantId,
      idpInfo.realm,
      idpInfo.provider,
      idpInfo.subject
    );

    if (existingIdentity) {
      // Identity exists, return existing principal
      console.log(
        JSON.stringify({
          msg: "identity_mapping_existing",
          principalId: existingIdentity.principal_id,
          idpIdentityId: existingIdentity.id,
        })
      );

      return {
        principalId: existingIdentity.principal_id,
        isNew: false,
        idpIdentityId: existingIdentity.id,
      };
    }

    // New identity - create principal and link
    return this.createPrincipalWithIdentity(
      tenantId,
      idpInfo,
      principalType,
      createdBy
    );
  }

  /**
   * Get IdP identity by unique key
   */
  private async getIdpIdentity(
    tenantId: string,
    realm: string,
    provider: string,
    subject: string
  ): Promise<{ id: string; principal_id: string } | undefined> {
    const result = await this.db
      .selectFrom("core.idp_identity")
      .select(["id", "principal_id"])
      .where("tenant_id", "=", tenantId)
      .where("realm", "=", realm)
      .where("provider", "=", provider)
      .where("subject", "=", subject)
      .executeTakeFirst();

    return result
      ? { id: result.id, principal_id: result.principal_id }
      : undefined;
  }

  /**
   * Create new principal with linked IdP identity
   */
  private async createPrincipalWithIdentity(
    tenantId: string,
    idpInfo: IdpIdentityInfo,
    principalType: PrincipalType,
    createdBy: string
  ): Promise<PrincipalResult> {
    return this.db.transaction().execute(async (trx) => {
      // 1. Create principal
      const principalId = crypto.randomUUID();

      await trx
        .insertInto("core.principal")
        .values({
          id: principalId,
          tenant_id: tenantId,
          principal_type: principalType,
          status: "active",
          display_name: idpInfo.displayName ?? idpInfo.username ?? idpInfo.subject,
          email: idpInfo.email,
          created_by: createdBy,
        })
        .execute();

      console.log(
        JSON.stringify({
          msg: "principal_created",
          principalId,
          tenantId,
          principalType,
        })
      );

      // 2. Create IdP identity link
      const idpIdentityId = crypto.randomUUID();

      await trx
        .insertInto("core.idp_identity")
        .values({
          id: idpIdentityId,
          tenant_id: tenantId,
          principal_id: principalId,
          realm: idpInfo.realm,
          provider: idpInfo.provider,
          subject: idpInfo.subject,
          username: idpInfo.username,
          created_by: createdBy,
        })
        .execute();

      console.log(
        JSON.stringify({
          msg: "idp_identity_created",
          idpIdentityId,
          principalId,
          provider: idpInfo.provider,
          subject: idpInfo.subject,
        })
      );

      // 3. Create principal profile (optional metadata)
      if (idpInfo.email || idpInfo.displayName) {
        await trx
          .insertInto("core.principal_profile")
          .values({
            id: crypto.randomUUID(),
            tenant_id: tenantId,
            principal_id: principalId,
            locale: "en-US",
            created_by: createdBy,
          })
          .execute();

        console.log(
          JSON.stringify({
            msg: "principal_profile_created",
            principalId,
          })
        );
      }

      return {
        principalId,
        isNew: true,
        idpIdentityId,
      };
    });
  }

  /**
   * Get principal by ID
   */
  async getPrincipal(
    principalId: string
  ): Promise<
    | {
        id: string;
        tenant_id: string;
        principal_type: string;
        status: string;
        display_name: string | null;
        email: string | null;
      }
    | undefined
  > {
    const result = await this.db
      .selectFrom("core.principal")
      .select([
        "id",
        "tenant_id",
        "principal_type",
        "status",
        "display_name",
        "email",
      ])
      .where("id", "=", principalId)
      .executeTakeFirst();

    return result;
  }

  /**
   * Get principal with profile
   */
  async getPrincipalWithProfile(principalId: string): Promise<
    | {
        principal: {
          id: string;
          tenant_id: string;
          principal_type: string;
          status: string;
          display_name: string | null;
          email: string | null;
        };
        profile?: {
          id: string;
          locale: string | null;
          language: string | null;
          avatar_url: string | null;
        };
        identities: Array<{
          id: string;
          realm: string;
          provider: string;
          subject: string;
          username: string | null;
        }>;
      }
    | undefined
  > {
    // Get principal
    const principal = await this.getPrincipal(principalId);
    if (!principal) return undefined;

    // Get profile
    const profile = await this.db
      .selectFrom("core.principal_profile")
      .select(["id", "locale", "language", "avatar_url"])
      .where("principal_id", "=", principalId)
      .executeTakeFirst();

    // Get linked identities
    const identities = await this.db
      .selectFrom("core.idp_identity")
      .select(["id", "realm", "provider", "subject", "username"])
      .where("principal_id", "=", principalId)
      .execute();

    return {
      principal,
      profile,
      identities,
    };
  }

  /**
   * Link additional IdP identity to existing principal
   */
  async linkIdentityToPrincipal(
    principalId: string,
    tenantId: string,
    idpInfo: IdpIdentityInfo,
    createdBy: string = "system"
  ): Promise<string> {
    // Check if already linked
    const existing = await this.getIdpIdentity(
      tenantId,
      idpInfo.realm,
      idpInfo.provider,
      idpInfo.subject
    );

    if (existing) {
      if (existing.principal_id !== principalId) {
        throw new Error(
          `Identity already linked to different principal: ${existing.principal_id}`
        );
      }
      return existing.id;
    }

    // Create new link
    const idpIdentityId = crypto.randomUUID();

    await this.db
      .insertInto("core.idp_identity")
      .values({
        id: idpIdentityId,
        tenant_id: tenantId,
        principal_id: principalId,
        realm: idpInfo.realm,
        provider: idpInfo.provider,
        subject: idpInfo.subject,
        username: idpInfo.username,
        created_by: createdBy,
      })
      .execute();

    console.log(
      JSON.stringify({
        msg: "identity_linked",
        principalId,
        idpIdentityId,
        provider: idpInfo.provider,
      })
    );

    return idpIdentityId;
  }

  /**
   * Update principal status
   */
  async updatePrincipalStatus(
    principalId: string,
    status: PrincipalStatus
  ): Promise<void> {
    await this.db
      .updateTable("core.principal")
      .set({ status })
      .where("id", "=", principalId)
      .execute();

    console.log(
      JSON.stringify({
        msg: "principal_status_updated",
        principalId,
        status,
      })
    );
  }

  /**
   * Deactivate principal (set status to 'disabled')
   */
  async deactivatePrincipal(principalId: string): Promise<void> {
    await this.updatePrincipalStatus(principalId, "disabled");
  }

  /**
   * Search principals by tenant
   */
  async searchPrincipals(
    tenantId: string,
    filters?: {
      principalType?: PrincipalType;
      status?: PrincipalStatus;
      searchTerm?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<
    Array<{
      id: string;
      principal_type: string;
      status: string;
      display_name: string | null;
      email: string | null;
    }>
  > {
    let query = this.db
      .selectFrom("core.principal")
      .select(["id", "principal_type", "status", "display_name", "email"])
      .where("tenant_id", "=", tenantId);

    if (filters?.principalType) {
      query = query.where("principal_type", "=", filters.principalType);
    }

    if (filters?.status) {
      query = query.where("status", "=", filters.status);
    }

    if (filters?.searchTerm) {
      query = query.where((eb) =>
        eb.or([
          eb("display_name", "ilike", `%${filters.searchTerm}%`),
          eb("email", "ilike", `%${filters.searchTerm}%`),
        ])
      );
    }

    const results = await query
      .limit(filters?.limit ?? 50)
      .offset(filters?.offset ?? 0)
      .orderBy("display_name", "asc")
      .execute();

    return results;
  }
}
