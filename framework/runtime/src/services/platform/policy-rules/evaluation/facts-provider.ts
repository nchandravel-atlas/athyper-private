/**
 * Facts Provider
 *
 * C: Facts + Context Resolver
 * Resolves facts needed for policy evaluation:
 * - Subject roles/groups (Keycloak mapping)
 * - Entity metadata (MetaEntity/MetaVersion)
 * - Resource attributes (record fields, ownership, OU, cost center)
 * - Environment attributes (ip, device, channel)
 */

import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";
import type { PolicySubject, PolicyResource, PolicyContext } from "./types.js";

// ============================================================================
// Facts Provider Interface
// ============================================================================

/**
 * Resolved facts for evaluation
 */
export type ResolvedFacts = {
  /** Subject facts */
  subject: PolicySubject;

  /** Resource facts */
  resource: PolicyResource;

  /** Context facts */
  context: PolicyContext;

  /** Additional computed facts */
  computed: {
    /** Is subject the resource owner */
    isOwner: boolean;

    /** Is subject in same OU as resource */
    isSameOU: boolean;

    /** Subject's effective permissions (if pre-computed) */
    effectivePermissions?: string[];

    /** Resource state (draft, published, archived) */
    resourceState?: string;

    /** Time-based facts */
    time: {
      /** Current hour (0-23) */
      hour: number;
      /** Current day of week (0-6, 0=Sunday) */
      dayOfWeek: number;
      /** Is business hours (configurable) */
      isBusinessHours: boolean;
      /** Is weekend */
      isWeekend: boolean;
    };
  };

  /** Resolution metadata */
  metadata: {
    /** Resolution duration in ms */
    durationMs: number;
    /** Cache hits */
    cacheHits: {
      subject: boolean;
      resource: boolean;
      entity: boolean;
    };
    /** Resolution timestamp */
    resolvedAt: Date;
  };
};

/**
 * Facts provider interface
 */
export interface IFactsProvider {
  /**
   * Resolve all facts for evaluation
   */
  resolveFacts(
    principalId: string,
    tenantId: string,
    resourceType: string,
    resourceId?: string,
    actionCode?: string,
    context?: Partial<PolicyContext>
  ): Promise<ResolvedFacts>;

  /**
   * Resolve subject facts
   */
  resolveSubject(principalId: string, tenantId: string): Promise<PolicySubject>;

  /**
   * Resolve resource facts
   */
  resolveResource(
    tenantId: string,
    resourceType: string,
    resourceId?: string
  ): Promise<PolicyResource>;

  /**
   * Invalidate cache for a principal
   */
  invalidateSubjectCache(principalId: string, tenantId: string): void;

  /**
   * Invalidate cache for a resource
   */
  invalidateResourceCache(tenantId: string, resourceType: string, resourceId?: string): void;

  /**
   * Clear all caches
   */
  clearCache(): void;
}

// ============================================================================
// Facts Provider Implementation
// ============================================================================

/**
 * Cache entry with TTL
 */
type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

/**
 * Facts Provider configuration
 */
export type FactsProviderConfig = {
  /** Subject cache TTL in ms (default: 5 min) */
  subjectCacheTtlMs: number;

  /** Resource cache TTL in ms (default: 1 min) */
  resourceCacheTtlMs: number;

  /** Entity metadata cache TTL in ms (default: 10 min) */
  entityCacheTtlMs: number;

  /** Business hours config */
  businessHours: {
    start: number; // Hour (0-23)
    end: number;   // Hour (0-23)
    timezone: string;
  };
};

const DEFAULT_CONFIG: FactsProviderConfig = {
  subjectCacheTtlMs: 5 * 60 * 1000,
  resourceCacheTtlMs: 60 * 1000,
  entityCacheTtlMs: 10 * 60 * 1000,
  businessHours: {
    start: 9,
    end: 17,
    timezone: "UTC",
  },
};

/**
 * Facts Provider Service
 */
export class FactsProviderService implements IFactsProvider {
  private readonly config: FactsProviderConfig;

  // Caches
  private subjectCache: Map<string, CacheEntry<PolicySubject>> = new Map();
  private resourceCache: Map<string, CacheEntry<PolicyResource>> = new Map();
  private entityMetaCache: Map<string, CacheEntry<EntityMetadata>> = new Map();

  constructor(
    private readonly db: Kysely<DB>,
    config?: Partial<FactsProviderConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Resolve all facts for evaluation
   */
  async resolveFacts(
    principalId: string,
    tenantId: string,
    resourceType: string,
    resourceId?: string,
    _actionCode?: string,
    context?: Partial<PolicyContext>
  ): Promise<ResolvedFacts> {
    const startTime = Date.now();
    const cacheHits = { subject: false, resource: false, entity: false };

    // Resolve subject
    const subjectCacheKey = `${tenantId}:${principalId}`;
    let subject = this.getCached(this.subjectCache, subjectCacheKey);
    if (subject) {
      cacheHits.subject = true;
    } else {
      subject = await this.resolveSubject(principalId, tenantId);
      this.setCache(this.subjectCache, subjectCacheKey, subject, this.config.subjectCacheTtlMs);
    }

    // Resolve resource
    const resourceCacheKey = `${tenantId}:${resourceType}:${resourceId ?? "*"}`;
    let resource = this.getCached(this.resourceCache, resourceCacheKey);
    if (resource) {
      cacheHits.resource = true;
    } else {
      resource = await this.resolveResource(tenantId, resourceType, resourceId);
      this.setCache(this.resourceCache, resourceCacheKey, resource, this.config.resourceCacheTtlMs);
    }

    // Build context
    const now = context?.timestamp ?? new Date();
    const fullContext: PolicyContext = {
      tenantId,
      timestamp: now,
      correlationId: context?.correlationId ?? crypto.randomUUID(),
      attributes: context?.attributes ?? {},
      ...context,
    };

    // Compute derived facts
    const computed = this.computeDerivedFacts(subject, resource, now);

    return {
      subject,
      resource,
      context: fullContext,
      computed,
      metadata: {
        durationMs: Date.now() - startTime,
        cacheHits,
        resolvedAt: new Date(),
      },
    };
  }

  /**
   * Resolve subject facts
   */
  async resolveSubject(principalId: string, tenantId: string): Promise<PolicySubject> {
    // Get principal info
    const principal = await this.db
      .selectFrom("core.principal")
      .select(["id", "principal_type", "display_name", "email"])
      .where("id", "=", principalId)
      .where("tenant_id", "=", tenantId)
      .executeTakeFirst();

    if (!principal) {
      // Return empty subject for non-existent principal
      return {
        principalId,
        principalType: "user",
        roles: [],
        groups: [],
        attributes: {},
      };
    }

    // Get roles
    const roles = await this.getPrincipalRoles(principalId, tenantId);

    // Get groups
    const groups = await this.getPrincipalGroups(principalId, tenantId);

    // Get OU membership
    const ouMembership = await this.getPrincipalOU(principalId, tenantId);

    // Get attributes
    const attributes = await this.getPrincipalAttributes(principalId);

    return {
      principalId,
      principalType: principal.principal_type as "user" | "service" | "external",
      roles,
      groups,
      ouMembership,
      attributes: {
        ...attributes,
        displayName: principal.display_name,
        email: principal.email,
      },
    };
  }

  /**
   * Resolve resource facts
   */
  async resolveResource(
    tenantId: string,
    resourceType: string,
    resourceId?: string
  ): Promise<PolicyResource> {
    // Get entity metadata
    const entityMeta = await this.getEntityMetadata(resourceType);

    const resource: PolicyResource = {
      type: resourceType,
      id: resourceId,
      module: entityMeta?.module,
      attributes: {},
    };

    // If we have a record ID, try to get record-specific attributes
    if (resourceId && entityMeta) {
      const recordAttrs = await this.getRecordAttributes(
        tenantId,
        resourceType,
        resourceId,
        entityMeta
      );
      resource.attributes = recordAttrs.attributes;
      resource.ownerId = recordAttrs.ownerId;
      resource.costCenter = recordAttrs.costCenter;
    }

    return resource;
  }

  /**
   * Get principal roles
   */
  private async getPrincipalRoles(principalId: string, tenantId: string): Promise<string[]> {
    const now = new Date();

    // Direct role bindings
    const directRoles = await this.db
      .selectFrom("core.role_binding as rb")
      .innerJoin("core.role as r", "r.id", "rb.role_id")
      .select("r.code")
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

    // Group-inherited roles
    const groupRoles = await this.db
      .selectFrom("core.group_member as gm")
      .innerJoin("core.role_binding as rb", "rb.group_id", "gm.group_id")
      .innerJoin("core.role as r", "r.id", "rb.role_id")
      .select("r.code")
      .where("gm.tenant_id", "=", tenantId)
      .where("gm.principal_id", "=", principalId)
      .where("r.is_active", "=", true)
      .where((eb) =>
        eb.or([eb("gm.valid_from", "is", null), eb("gm.valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("gm.valid_until", "is", null), eb("gm.valid_until", ">", now)])
      )
      .where((eb) =>
        eb.or([eb("rb.valid_from", "is", null), eb("rb.valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("rb.valid_until", "is", null), eb("rb.valid_until", ">", now)])
      )
      .execute();

    // Combine and dedupe
    const allRoles = new Set([
      ...directRoles.map((r) => r.code),
      ...groupRoles.map((r) => r.code),
    ]);

    return [...allRoles];
  }

  /**
   * Get principal groups
   */
  private async getPrincipalGroups(principalId: string, tenantId: string): Promise<string[]> {
    const now = new Date();

    const groups = await this.db
      .selectFrom("core.group_member as gm")
      .innerJoin("core.group as g", "g.id", "gm.group_id")
      .select("g.code")
      .where("gm.tenant_id", "=", tenantId)
      .where("gm.principal_id", "=", principalId)
      .where("g.is_active", "=", true)
      .where((eb) =>
        eb.or([eb("gm.valid_from", "is", null), eb("gm.valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("gm.valid_until", "is", null), eb("gm.valid_until", ">", now)])
      )
      .execute();

    return groups.map((g) => g.code);
  }

  /**
   * Get principal OU membership
   */
  private async getPrincipalOU(
    principalId: string,
    tenantId: string
  ): Promise<PolicySubject["ouMembership"]> {
    // Get OU node ID from attributes
    const ouAttr = await this.db
      .selectFrom("core.principal_attribute")
      .select(["attr_value"])
      .where("principal_id", "=", principalId)
      .where("attr_key", "=", "ou_node_id")
      .executeTakeFirst();

    if (!ouAttr) return undefined;

    // Get OU node details
    const ouNode = await this.db
      .selectFrom("core.ou_node")
      .select(["id", "code", "path", "depth"])
      .where("id", "=", ouAttr.attr_value)
      .where("tenant_id", "=", tenantId)
      .where("is_active", "=", true)
      .executeTakeFirst();

    if (!ouNode) return undefined;

    return {
      nodeId: ouNode.id,
      code: ouNode.code,
      path: ouNode.path,
      depth: ouNode.depth,
    };
  }

  /**
   * Get principal attributes
   */
  private async getPrincipalAttributes(principalId: string): Promise<Record<string, unknown>> {
    const now = new Date();

    const attrs = await this.db
      .selectFrom("core.principal_attribute")
      .select(["attr_key", "attr_value"])
      .where("principal_id", "=", principalId)
      .where((eb) =>
        eb.or([eb("valid_from", "is", null), eb("valid_from", "<=", now)])
      )
      .where((eb) =>
        eb.or([eb("valid_until", "is", null), eb("valid_until", ">", now)])
      )
      .execute();

    const result: Record<string, unknown> = {};
    for (const attr of attrs) {
      result[attr.attr_key] = attr.attr_value;
    }

    return result;
  }

  /**
   * Get entity metadata
   */
  private async getEntityMetadata(entityType: string): Promise<EntityMetadata | undefined> {
    // Check cache
    const cached = this.getCached(this.entityMetaCache, entityType);
    if (cached) return cached;

    // Query from meta schema
    const entity = await this.db
      .selectFrom("meta.meta_entities")
      .select(["id", "name", "description", "active_version"])
      .where("name", "=", entityType)
      .executeTakeFirst();

    if (!entity) return undefined;

    // Get active version schema
    let schema: unknown = null;
    if (entity.active_version) {
      const version = await this.db
        .selectFrom("meta.meta_versions")
        .select(["schema"])
        .where("entity_name", "=", entityType)
        .where("version", "=", entity.active_version)
        .executeTakeFirst();

      schema = version?.schema;
    }

    const metadata: EntityMetadata = {
      name: entity.name,
      description: entity.description ?? undefined,
      activeVersion: entity.active_version ?? undefined,
      schema,
      module: this.extractModule(schema),
    };

    this.setCache(this.entityMetaCache, entityType, metadata, this.config.entityCacheTtlMs);

    return metadata;
  }

  /**
   * Extract module from schema
   */
  private extractModule(schema: unknown): string | undefined {
    if (typeof schema === "object" && schema !== null) {
      const s = schema as Record<string, unknown>;
      if (typeof s.module === "string") return s.module;
    }
    return undefined;
  }

  /**
   * Get record attributes (from dynamic entity data)
   */
  private async getRecordAttributes(
    _tenantId: string,
    _entityType: string,
    _recordId: string,
    _entityMeta: EntityMetadata
  ): Promise<{
    attributes: Record<string, unknown>;
    ownerId?: string;
    costCenter?: string;
  }> {
    // This would query the actual record data from the dynamic entity table
    // For now, return empty - this needs entity data access implementation
    // In production, this would:
    // 1. Get the table name from entity metadata
    // 2. Query the record by ID
    // 3. Extract owner_id, cost_center, and other relevant fields

    return {
      attributes: {},
      ownerId: undefined,
      costCenter: undefined,
    };
  }

  /**
   * Compute derived facts
   */
  private computeDerivedFacts(
    subject: PolicySubject,
    resource: PolicyResource,
    timestamp: Date
  ): ResolvedFacts["computed"] {
    const hour = timestamp.getUTCHours();
    const dayOfWeek = timestamp.getUTCDay();

    return {
      isOwner: resource.ownerId === subject.principalId,
      isSameOU: this.checkSameOU(subject.ouMembership, resource),
      time: {
        hour,
        dayOfWeek,
        isBusinessHours:
          hour >= this.config.businessHours.start && hour < this.config.businessHours.end,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      },
    };
  }

  /**
   * Check if subject and resource are in same OU
   */
  private checkSameOU(
    ouMembership: PolicySubject["ouMembership"],
    resource: PolicyResource
  ): boolean {
    if (!ouMembership || !resource.attributes?.ou_node_id) {
      return false;
    }

    // Check if resource OU is same or child of subject OU
    const resourceOUPath = resource.attributes.ou_path as string | undefined;
    if (resourceOUPath && ouMembership.path) {
      return resourceOUPath.startsWith(ouMembership.path);
    }

    return ouMembership.nodeId === resource.attributes.ou_node_id;
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  private getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  private setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttlMs: number): void {
    cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidateSubjectCache(principalId: string, tenantId: string): void {
    const key = `${tenantId}:${principalId}`;
    this.subjectCache.delete(key);
  }

  invalidateResourceCache(tenantId: string, resourceType: string, resourceId?: string): void {
    const key = `${tenantId}:${resourceType}:${resourceId ?? "*"}`;
    this.resourceCache.delete(key);
  }

  clearCache(): void {
    this.subjectCache.clear();
    this.resourceCache.clear();
    this.entityMetaCache.clear();
  }
}

// ============================================================================
// Types
// ============================================================================

type EntityMetadata = {
  name: string;
  description?: string;
  activeVersion?: string;
  schema: unknown;
  module?: string;
};
