/**
 * META Registry Service Implementation
 *
 * PostgreSQL-backed implementation of MetaRegistry interface.
 * Manages entity definitions and versions using Kysely for type-safe queries.
 */

import type { DB } from "@athyper/adapter-db";
import type {
  MetaRegistry,
  Entity,
  EntityVersion,
  EntitySchema,
  RequestContext,
  ListOptions,
  PaginatedResponse,
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
      .insertInto("meta.meta_entities")
      .values({
        id: crypto.randomUUID(),
        name,
        description: description ?? null,
        active_version: null,
        created_by: ctx.userId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapEntityFromDb(entity);
  }

  async getEntity(name: string): Promise<Entity | undefined> {
    const entity = await this.db
      .selectFrom("meta.meta_entities")
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
      .selectFrom("meta.meta_entities")
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
        .selectFrom("meta.meta_entities")
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
    ctx: RequestContext
  ): Promise<Entity> {
    const dbUpdates: any = {};

    if (updates.description !== undefined) {
      dbUpdates.description = updates.description;
    }

    if (updates.activeVersion !== undefined) {
      dbUpdates.active_version = updates.activeVersion;
    }

    const entity = await this.db
      .updateTable("meta.meta_entities")
      .set(dbUpdates)
      .where("name", "=", name)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapEntityFromDb(entity);
  }

  async deleteEntity(name: string, ctx: RequestContext): Promise<void> {
    await this.db
      .deleteFrom("meta.meta_entities")
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
    const entityVersion = await this.db
      .insertInto("meta.meta_versions")
      .values({
        id: crypto.randomUUID(),
        entity_name: entityName,
        version,
        schema: JSON.stringify(schema),
        is_active: false,
        created_by: ctx.userId,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapVersionFromDb(entityVersion);
  }

  async getVersion(
    entityName: string,
    version: string
  ): Promise<EntityVersion | undefined> {
    const entityVersion = await this.db
      .selectFrom("meta.meta_versions")
      .selectAll()
      .where("entity_name", "=", entityName)
      .where("version", "=", version)
      .executeTakeFirst();

    return entityVersion ? this.mapVersionFromDb(entityVersion) : undefined;
  }

  async getActiveVersion(
    entityName: string
  ): Promise<EntityVersion | undefined> {
    const entityVersion = await this.db
      .selectFrom("meta.meta_versions")
      .selectAll()
      .where("entity_name", "=", entityName)
      .where("is_active", "=", true)
      .executeTakeFirst();

    return entityVersion ? this.mapVersionFromDb(entityVersion) : undefined;
  }

  async listVersions(
    entityName: string,
    options: ListOptions = {}
  ): Promise<PaginatedResponse<EntityVersion>> {
    const page = options.page ?? 1;
    const pageSize = Math.min(options.pageSize ?? 20, 100);
    const offset = (page - 1) * pageSize;

    // Build query
    let query = this.db
      .selectFrom("meta.meta_versions")
      .selectAll()
      .where("entity_name", "=", entityName);

    // Apply ordering
    const orderBy = options.orderBy ?? "created_at";
    const orderDir = options.orderDir ?? "desc";
    query = query.orderBy(orderBy as any, orderDir);

    // Execute count and data queries
    const [countResult, data] = await Promise.all([
      this.db
        .selectFrom("meta.meta_versions")
        .select((eb) => eb.fn.countAll().as("count"))
        .where("entity_name", "=", entityName)
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
    ctx: RequestContext
  ): Promise<EntityVersion> {
    // Deactivate all versions for this entity
    await this.db
      .updateTable("meta.meta_versions")
      .set({ is_active: false })
      .where("entity_name", "=", entityName)
      .execute();

    // Activate the specified version
    const entityVersion = await this.db
      .updateTable("meta.meta_versions")
      .set({ is_active: true })
      .where("entity_name", "=", entityName)
      .where("version", "=", version)
      .returningAll()
      .executeTakeFirstOrThrow();

    // Update entity's active_version
    await this.db
      .updateTable("meta.meta_entities")
      .set({ active_version: version })
      .where("name", "=", entityName)
      .execute();

    return this.mapVersionFromDb(entityVersion);
  }

  async deactivateVersion(
    entityName: string,
    version: string,
    ctx: RequestContext
  ): Promise<EntityVersion> {
    const entityVersion = await this.db
      .updateTable("meta.meta_versions")
      .set({ is_active: false })
      .where("entity_name", "=", entityName)
      .where("version", "=", version)
      .returningAll()
      .executeTakeFirstOrThrow();

    // Clear entity's active_version if this was the active one
    const entity = await this.getEntity(entityName);
    if (entity?.activeVersion === version) {
      await this.db
        .updateTable("meta.meta_entities")
        .set({ active_version: null })
        .where("name", "=", entityName)
        .execute();
    }

    return this.mapVersionFromDb(entityVersion);
  }

  async updateVersion(
    entityName: string,
    version: string,
    schema: EntitySchema,
    ctx: RequestContext
  ): Promise<EntityVersion> {
    const entityVersion = await this.db
      .updateTable("meta.meta_versions")
      .set({ schema: JSON.stringify(schema) })
      .where("entity_name", "=", entityName)
      .where("version", "=", version)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapVersionFromDb(entityVersion);
  }

  async deleteVersion(
    entityName: string,
    version: string,
    ctx: RequestContext
  ): Promise<void> {
    await this.db
      .deleteFrom("meta.meta_versions")
      .where("entity_name", "=", entityName)
      .where("version", "=", version)
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
