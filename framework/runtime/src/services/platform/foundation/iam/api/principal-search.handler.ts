/**
 * Principal Search Handler
 *
 * Search principals by username or display name for autocomplete features.
 */

import type { HttpHandlerContext } from "../../http/types.js";
import type { Kysely } from "kysely";
import { TOKENS } from "../../../../../kernel/tokens.js";

/**
 * GET /api/iam/principals?search=...
 *
 * Search active principals for autocomplete (e.g., @mentions)
 *
 * Query params:
 * - search: string (required, min 2 chars)
 * - limit: number (optional, default 10, max 50)
 */
export class SearchPrincipalsHandler {
  async handle(ctx: HttpHandlerContext) {
    const { search, limit = "10" } = ctx.request.query;
    const tenantId = ctx.tenant.tenantId;

    // Validate search query
    if (!search || typeof search !== "string") {
      return {
        ok: false,
        error: "Missing required parameter: search",
        status: 400,
      };
    }

    const searchTerm = search.trim();
    if (searchTerm.length < 2) {
      return {
        ok: false,
        error: "Search term must be at least 2 characters",
        status: 400,
      };
    }

    // Validate limit
    const parsedLimit = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 50);

    // Execute search
    const db = await ctx.container.resolve<Kysely<any>>(TOKENS.db);
    const searchPattern = `%${searchTerm}%`;

    const results = await db
      .selectFrom("core.principal")
      .select([
        "id",
        "username",
        "display_name as displayName",
        "email",
      ])
      .where("tenant_id", "=", tenantId)
      .where("is_active", "=", true)
      .where((eb: any) =>
        eb.or([
          eb("username", "ilike", searchPattern),
          eb("display_name", "ilike", searchPattern),
          eb("email", "ilike", searchPattern),
        ])
      )
      .orderBy("username", "asc")
      .limit(parsedLimit)
      .execute();

    return {
      ok: true,
      data: results.map((p: any) => ({
        id: p.id,
        username: p.username,
        displayName: p.displayName || p.username,
        email: p.email,
      })),
      meta: {
        total: results.length,
        limit: parsedLimit,
        query: searchTerm,
      },
    };
  }
}
