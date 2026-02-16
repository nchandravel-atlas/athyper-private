/**
 * META Registry Service Implementation
 *
 * PostgreSQL-backed implementation of MetaRegistry interface.
 * Manages entity definitions and versions using Kysely for type-safe queries.
 */

import type { DB } from "@athyper/adapter-db";
import type {
  Entity,
  EntitySchema,
  EntityVersion,
  ListOptions,
  MetaRegistry,
  PaginatedResponse,
  RequestContext,
} from "@athyper/core/meta";
import type { Kysely } from "kysely";

/**
 * META Registry Service
 * Implements CRUD operations for entities and versions
 */
export class MetaRegistryService implements MetaRegistry {
  constructor(private readonly db: Kysely<DB>) {}

  // =========================================================================
  // Entity Management
  // =========================================================================

  async createEntity(
    name: string,
    description: string | undefined,
    ctx: RequestContext
  ): Promise<Entity> {
    const entity = await this.db
      .insertInto("meta.entity")
      .values({
        id: crypto.randomUUID(),
        tenant_id: ctx.tenantId ?? "default",
        module_id: "default",
        name,
        table_name: name,
        created_by: ctx.userId,
      } as any)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapEntityFromDb(entity);
  }

  async getEntity(name: string): Promise<Entity | undefined> {
    const entity = await this.db
      .selectFrom("meta.entity")
      .selectAll()
      .where("name", "=", name)
      .executeTakeFirst();

    return entity ? this.mapEntityFromDb(entity) : undefined;
  }

  async listEntities(
    options: ListOptions = {}
  ): Promise<PaginatedResponse<Entity>> {
    const page = options.page ?? 1;
    const pageSize = Math.min(options.pageSize ?? 20, 100);
    const offset = (page - 1) * pageSize;

    // Build query
    let query = this.db
      .selectFrom("meta.entity")
      .selectAll();

    // Apply filters
    if (options.filters) {
      // Add filtering logic here if needed
    }

    // Apply ordering
    const orderBy = options.orderBy ?? "created_at";
    const orderDir = options.orderDir ?? "desc";
    query = query.orderBy(orderBy as any, orderDir);

    // Execute count and data queries
    const [countResult, data] = await Promise.all([
      this.db
        .selectFrom("meta.entity")
        .select((eb) => eb.fn.countAll().as("count"))
        .executeTakeFirstOrThrow(),
      query.limit(pageSize).offset(offset).execute(),
    ]);

    const total = Number(countResult.count);
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data.map((e) => this.mapEntityFromDb(e)),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async updateEntity(
    name: string,
    updates: Partial<Pick<Entity, "description" | "activeVersion">>,
    _ctx: RequestContext
  ): Promise<Entity> {
    const dbUpdates: any = {};

    if (updates.description !== undefined) {
      dbUpdates.description = updates.description;
    }

    const entity = await this.db
      .updateTable("meta.entity")
      .set(dbUpdates as any)
      .where("name", "=", name)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapEntityFromDb(entity);
  }

  async deleteEntity(name: string, _ctx: RequestContext): Promise<void> {
    await this.db
      .deleteFrom("meta.entity")
      .where("name", "=", name)
      .execute();
  }

  // =========================================================================
  // Version Management
  // =========================================================================

  async createVersion(
    entityName: string,
    version: string,
    schema: EntitySchema,
    ctx: RequestContext
  ): Promise<EntityVersion> {
    // Look up entity ID from entity name
    const entityRecord = await this.getEntity(entityName);
    const entityId = entityRecord?.id ?? entityName;

    const entityVersion = await this.db
      .insertInto("meta.entity_version")
      .values({
        id: crypto.randomUUID(),
        tenant_id: ctx.tenantId ?? "default",
        entity_id: entityId,
        version_no: parseInt(version, 10) || 1,
        status: "draft",
        label: version,
        behaviors: JSON.stringify(schema),
        created_by: ctx.userId,
      } as any)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapVersionFromDb(entityVersion);
  }

  async getVersion(
    entityName: string,
    version: string
  ): Promise<EntityVersion | undefined> {
    const entity = await this.getEntity(entityName);
    if (!entity) return undefined;

    const entityVersion = await this.db
      .selectFrom("meta.entity_version")
      .selectAll()
      .where("entity_id", "=", entity.id)
      .where("label", "=", version)
      .executeTakeFirst();

    return entityVersion ? this.mapVersionFromDb(entityVersion) : undefined;
  }

  async getActiveVersion(
    entityName: string
  ): Promise<EntityVersion | undefined> {
    const entity = await this.getEntity(entityName);
    if (!entity) return undefined;

    const entityVersion = await this.db
      .selectFrom("meta.entity_version")
      .selectAll()
      .where("entity_id", "=", entity.id)
      .where("status", "=", "active")
      .executeTakeFirst();

    return entityVersion ? this.mapVersionFromDb(entityVersion) : undefined;
  }

  async listVersions(
    entityName: string,
    options: ListOptions = {}
  ): Promise<PaginatedResponse<EntityVersion>> {
    const entity = await this.getEntity(entityName);
    const entityId = entity?.id ?? entityName;

    const page = options.page ?? 1;
    const pageSize = Math.min(options.pageSize ?? 20, 100);
    const offset = (page - 1) * pageSize;

    // Build query
    let query = this.db
      .selectFrom("meta.entity_version")
      .selectAll()
      .where("entity_id", "=", entityId);

    // Apply ordering
    const orderBy = options.orderBy ?? "created_at";
    const orderDir = options.orderDir ?? "desc";
    query = query.orderBy(orderBy as any, orderDir);

    // Execute count and data queries
    const [countResult, data] = await Promise.all([
      this.db
        .selectFrom("meta.entity_version")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("entity_id", "=", entityId)
        .executeTakeFirstOrThrow(),
      query.limit(pageSize).offset(offset).execute(),
    ]);

    const total = Number(countResult.count);
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: data.map((v) => this.mapVersionFromDb(v)),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async activateVersion(
    entityName: string,
    version: string,
    _ctx: RequestContext
  ): Promise<EntityVersion> {
    const entity = await this.getEntity(entityName);
    const entityId = entity?.id ?? entityName;

    // Deactivate all versions for this entity
    await this.db
      .updateTable("meta.entity_version")
      .set({ status: "inactive" } as any)
      .where("entity_id", "=", entityId)
      .execute();

    // Activate the specified version
    const entityVersion = await this.db
      .updateTable("meta.entity_version")
      .set({ status: "active" } as any)
      .where("entity_id", "=", entityId)
      .where("label", "=", version)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapVersionFromDb(entityVersion);
  }

  async deactivateVersion(
    entityName: string,
    version: string,
    _ctx: RequestContext
  ): Promise<EntityVersion> {
    const entity = await this.getEntity(entityName);
    const entityId = entity?.id ?? entityName;

    const entityVersion = await this.db
      .updateTable("meta.entity_version")
      .set({ status: "inactive" } as any)
      .where("entity_id", "=", entityId)
      .where("label", "=", version)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapVersionFromDb(entityVersion);
  }

  async updateVersion(
    entityName: string,
    version: string,
    schema: EntitySchema,
    _ctx: RequestContext
  ): Promise<EntityVersion> {
    const entity = await this.getEntity(entityName);
    const entityId = entity?.id ?? entityName;

    const entityVersion = await this.db
      .updateTable("meta.entity_version")
      .set({ behaviors: JSON.stringify(schema) } as any)
      .where("entity_id", "=", entityId)
      .where("label", "=", version)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapVersionFromDb(entityVersion);
  }

  async deleteVersion(
    entityName: string,
    version: string,
    _ctx: RequestContext
  ): Promise<void> {
    const entity = await this.getEntity(entityName);
    const entityId = entity?.id ?? entityName;

    await this.db
      .deleteFrom("meta.entity_version")
      .where("entity_id", "=", entityId)
      .where("label", "=", version)
      .execute();
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private mapEntityFromDb(dbEntity: any): Entity {
    return {
      id: dbEntity.id,
      name: dbEntity.name,
      description: dbEntity.description ?? undefined,
      activeVersion: dbEntity.active_version ?? undefined,
      createdAt: new Date(dbEntity.created_at),
      updatedAt: new Date(dbEntity.updated_at),
      createdBy: dbEntity.created_by,
    };
  }

  private mapVersionFromDb(dbVersion: any): EntityVersion {
    return {
      id: dbVersion.id,
      entityName: dbVersion.entity_name,
      version: dbVersion.version,
      schema:
        typeof dbVersion.schema === "string"
          ? JSON.parse(dbVersion.schema)
          : dbVersion.schema,
      isActive: dbVersion.is_active,
      createdAt: new Date(dbVersion.created_at),
      createdBy: dbVersion.created_by,
    };
  }
}
