/**
 * Operation Catalog Service
 *
 * A0: Authorization Contract - Operation Catalog
 * Manages the catalog of all operations (ENTITY.READ, WF.APPROVE, etc.)
 *
 * Source of truth: meta.operation table
 */

import type {
  OperationCode,
  OperationInfo,
  OperationNamespace,
} from "./types.js";
import type { DB } from "@athyper/adapter-db";
import type { Kysely } from "kysely";

/**
 * Standard operations to seed
 */
const STANDARD_OPERATIONS: Array<{
  namespace: OperationNamespace;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
}> = [
  // Entity operations
  { namespace: "ENTITY", code: "READ", name: "Read", description: "Read entity records", sortOrder: 10 },
  { namespace: "ENTITY", code: "CREATE", name: "Create", description: "Create new records", sortOrder: 20 },
  { namespace: "ENTITY", code: "UPDATE", name: "Update", description: "Update existing records", sortOrder: 30 },
  { namespace: "ENTITY", code: "DELETE", name: "Delete", description: "Delete records (soft or hard)", sortOrder: 40 },
  { namespace: "ENTITY", code: "LIST", name: "List", description: "List/search records", sortOrder: 50 },
  { namespace: "ENTITY", code: "EXPORT", name: "Export", description: "Export records to file", sortOrder: 60 },
  { namespace: "ENTITY", code: "IMPORT", name: "Import", description: "Import records from file", sortOrder: 70 },

  // Workflow operations
  { namespace: "WORKFLOW", code: "SUBMIT", name: "Submit", description: "Submit for approval", sortOrder: 10 },
  { namespace: "WORKFLOW", code: "APPROVE", name: "Approve", description: "Approve submission", sortOrder: 20 },
  { namespace: "WORKFLOW", code: "REJECT", name: "Reject", description: "Reject submission", sortOrder: 30 },
  { namespace: "WORKFLOW", code: "CANCEL", name: "Cancel", description: "Cancel workflow", sortOrder: 40 },
  { namespace: "WORKFLOW", code: "REASSIGN", name: "Reassign", description: "Reassign task", sortOrder: 50 },
  { namespace: "WORKFLOW", code: "ESCALATE", name: "Escalate", description: "Escalate to higher authority", sortOrder: 60 },

  // Utility operations
  { namespace: "UTIL", code: "ADMIN", name: "Admin", description: "Administrative operations", sortOrder: 10 },
  { namespace: "UTIL", code: "CONFIG", name: "Configure", description: "Configuration changes", sortOrder: 20 },
  { namespace: "UTIL", code: "AUDIT_VIEW", name: "View Audit", description: "View audit logs", sortOrder: 30 },

  // Delegation operations
  { namespace: "DELEGATION", code: "DELEGATE", name: "Delegate", description: "Delegate authority", sortOrder: 10 },
  { namespace: "DELEGATION", code: "REVOKE_DELEGATION", name: "Revoke Delegation", description: "Revoke delegated authority", sortOrder: 20 },

  // Collaboration operations
  { namespace: "COLLAB", code: "SHARE", name: "Share", description: "Share with others", sortOrder: 10 },
  { namespace: "COLLAB", code: "COMMENT", name: "Comment", description: "Add comments", sortOrder: 20 },
  { namespace: "COLLAB", code: "MENTION", name: "Mention", description: "Mention users", sortOrder: 30 },
];

/**
 * Operation Catalog Service
 */
export class OperationCatalogService {
  private operationCache: Map<string, OperationInfo> = new Map();
  private operationByIdCache: Map<string, OperationInfo> = new Map();
  private cacheLoaded = false;

  constructor(private readonly db: Kysely<DB>) {}

  /**
   * Seed standard operations (idempotent)
   */
  async seedStandardOperations(createdBy: string = "system"): Promise<number> {
    let seeded = 0;

    for (const op of STANDARD_OPERATIONS) {
      const existing = await this.db
        .selectFrom("meta.operation")
        .select("id")
        .where("namespace", "=", op.namespace)
        .where("code", "=", op.code)
        .executeTakeFirst();

      if (!existing) {
        await this.db
          .insertInto("meta.operation")
          .values({
            id: crypto.randomUUID(),
            namespace: op.namespace,
            code: op.code,
            name: op.name,
            description: op.description,
            sort_order: op.sortOrder,
            source_type: "system",
            is_active: true,
            created_by: createdBy,
          })
          .execute();
        seeded++;
      }
    }

    // Clear cache so it gets reloaded
    this.cacheLoaded = false;

    console.log(
      JSON.stringify({
        msg: "operations_seeded",
        count: seeded,
      })
    );

    return seeded;
  }

  /**
   * Load operation cache
   */
  private async loadCache(): Promise<void> {
    if (this.cacheLoaded) return;

    const operations = await this.db
      .selectFrom("meta.operation")
      .select([
        "id",
        "namespace",
        "code",
        "name",
        "description",
        "is_active",
      ])
      .where("is_active", "=", true)
      .execute();

    this.operationCache.clear();
    this.operationByIdCache.clear();

    for (const op of operations) {
      const fullCode = `${op.namespace}.${op.code}` as OperationCode;
      const info: OperationInfo = {
        id: op.id,
        namespace: op.namespace as OperationNamespace,
        code: op.code,
        fullCode,
        name: op.name,
        description: op.description ?? undefined,
        isActive: op.is_active,
      };
      this.operationCache.set(fullCode, info);
      this.operationByIdCache.set(op.id, info);
    }

    this.cacheLoaded = true;
  }

  /**
   * Get operation by full code (e.g., "ENTITY.READ")
   */
  async getOperation(operationCode: OperationCode): Promise<OperationInfo | undefined> {
    await this.loadCache();
    return this.operationCache.get(operationCode);
  }

  /**
   * Get operation by ID
   */
  async getOperationById(operationId: string): Promise<OperationInfo | undefined> {
    await this.loadCache();
    return this.operationByIdCache.get(operationId);
  }

  /**
   * Get operation ID by code
   */
  async getOperationId(operationCode: OperationCode): Promise<string | undefined> {
    const op = await this.getOperation(operationCode);
    return op?.id;
  }

  /**
   * List all operations
   */
  async listOperations(filters?: {
    namespace?: OperationNamespace;
    isActive?: boolean;
  }): Promise<OperationInfo[]> {
    await this.loadCache();

    let results = [...this.operationCache.values()];

    if (filters?.namespace) {
      results = results.filter((op) => op.namespace === filters.namespace);
    }

    if (filters?.isActive !== undefined) {
      results = results.filter((op) => op.isActive === filters.isActive);
    }

    return results;
  }

  /**
   * List operations by namespace
   */
  async listByNamespace(namespace: OperationNamespace): Promise<OperationInfo[]> {
    return this.listOperations({ namespace });
  }

  /**
   * Create custom operation
   */
  async createOperation(request: {
    namespace: OperationNamespace;
    code: string;
    name: string;
    description?: string;
    sortOrder?: number;
    createdBy: string;
  }): Promise<OperationInfo> {
    const id = crypto.randomUUID();
    const fullCode = `${request.namespace}.${request.code}` as OperationCode;

    await this.db
      .insertInto("meta.operation")
      .values({
        id,
        namespace: request.namespace,
        code: request.code,
        name: request.name,
        description: request.description,
        sort_order: request.sortOrder,
        source_type: "custom",
        is_active: true,
        created_by: request.createdBy,
      })
      .execute();

    // Clear cache
    this.cacheLoaded = false;

    return {
      id,
      namespace: request.namespace,
      code: request.code,
      fullCode,
      name: request.name,
      description: request.description,
      isActive: true,
    };
  }

  /**
   * Parse operation code string
   */
  parseOperationCode(code: string): { namespace: OperationNamespace; code: string } | null {
    const parts = code.split(".");
    if (parts.length !== 2) return null;

    const [namespace, opCode] = parts;
    const validNamespaces: OperationNamespace[] = [
      "ENTITY",
      "WORKFLOW",
      "UTIL",
      "DELEGATION",
      "COLLAB",
    ];

    if (!validNamespaces.includes(namespace as OperationNamespace)) {
      return null;
    }

    return {
      namespace: namespace as OperationNamespace,
      code: opCode,
    };
  }

  /**
   * Validate operation code exists
   */
  async validateOperation(operationCode: OperationCode): Promise<boolean> {
    const op = await this.getOperation(operationCode);
    return !!op;
  }

  /**
   * Clear cache (force reload on next access)
   */
  clearCache(): void {
    this.cacheLoaded = false;
    this.operationCache.clear();
    this.operationByIdCache.clear();
  }
}
