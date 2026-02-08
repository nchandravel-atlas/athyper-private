/**
 * META Services Factory
 *
 * Creates and wires all META Engine services for DI container registration.
 */


import { AuditLoggerService } from "./core/audit-logger.service.js";
import { MetaCompilerService } from "./core/compiler.service.js";
import { MetaStoreService } from "./core/meta-store.service.js";
import { PolicyGateService } from "./core/policy-gate.service.js";
import { MetaRegistryService } from "./core/registry.service.js";
import { GenericDataAPIService } from "./data/generic-data-api.service.js";
import { LifecycleManagerService } from "./lifecycle/lifecycle-manager.service.js";
import { LifecycleRouteCompilerService } from "./lifecycle/lifecycle-route-compiler.service.js";
import { DdlGeneratorService } from "./schema/ddl-generator.service.js";

import type { MetaStore } from "./core/meta-store.service.js";
import type { LifecycleDB_Type } from "./data/db-helpers.js";
import type { DB } from "@athyper/adapter-db";
import type {
  MetaRegistry,
  MetaCompiler,
  PolicyGate,
  AuditLogger,
  GenericDataAPI,
  LifecycleRouteCompiler,
  LifecycleManager,
  DdlGenerator,
} from "@athyper/core/meta";
import type { Redis } from "ioredis";
import type { Kysely } from "kysely";

/**
 * META Services configuration
 */
export type MetaServicesConfig = {
  /** Kysely database instance */
  db: Kysely<DB>;

  /** Redis cache instance */
  cache: Redis;

  /** Compiler cache TTL in seconds (default: 3600) */
  cacheTTL?: number;

  /** Enable caching (default: true) */
  enableCache?: boolean;
};

/**
 * META Services container
 * Holds all created service instances
 */
export type MetaServices = {
  registry: MetaRegistry;
  compiler: MetaCompiler;
  policyGate: PolicyGate;
  auditLogger: AuditLogger;
  dataAPI: GenericDataAPI;
  metaStore: MetaStore;
  lifecycleRouteCompiler: LifecycleRouteCompiler;
  lifecycleManager: LifecycleManager;
  ddlGenerator: DdlGenerator;
};

/**
 * Create all META Engine services
 *
 * This factory function creates and wires all META services
 * in the correct dependency order.
 *
 * Usage:
 * ```typescript
 * const metaServices = createMetaServices({
 *   db: dbInstance,
 *   cache: redisInstance,
 * });
 *
 * // Register in DI container
 * container.register(META_TOKENS.registry, metaServices.registry);
 * container.register(META_TOKENS.compiler, metaServices.compiler);
 * // ... etc
 * ```
 */
export function createMetaServices(
  config: MetaServicesConfig
): MetaServices {
  // Create services in dependency order

  // 1. Registry (no dependencies on other META services)
  const registry = new MetaRegistryService(config.db);

  // 2. Compiler (depends on registry)
  const compiler = new MetaCompilerService(registry, {
    cache: config.cache,
    cacheTTL: config.cacheTTL,
    enableCache: config.enableCache,
  });

  // 3. Audit Logger (no dependencies on other META services)
  const auditLogger = new AuditLoggerService(config.db);

  // 4. Policy Gate (depends on compiler, optionally db for decision logging)
  const policyGate = new PolicyGateService(compiler, config.db as unknown as LifecycleDB_Type);

  // 5. Lifecycle Route Compiler (depends on db)
  const lifecycleRouteCompiler = new LifecycleRouteCompilerService(config.db as unknown as LifecycleDB_Type);

  // 6. Lifecycle Manager (depends on db, lifecycleRouteCompiler, policyGate)
  const lifecycleManager = new LifecycleManagerService(
    config.db as unknown as LifecycleDB_Type,
    lifecycleRouteCompiler,
    policyGate
  );

  // 7. Generic Data API (depends on compiler, policyGate, auditLogger, lifecycleManager)
  const dataAPI = new GenericDataAPIService(
    config.db,
    compiler,
    policyGate,
    auditLogger,
    lifecycleManager
  );

  // 8. MetaStore (depends on registry, compiler, auditLogger)
  const metaStore = new MetaStoreService(registry, compiler, auditLogger);

  // 9. DDL Generator (no dependencies - pure transformation service)
  const ddlGenerator = new DdlGeneratorService();

  return {
    registry,
    compiler,
    policyGate,
    auditLogger,
    dataAPI,
    metaStore,
    lifecycleRouteCompiler,
    lifecycleManager,
    ddlGenerator,
  };
}

/**
 * Register META services in DI container
 *
 * Helper function to register all META services using META_TOKENS.
 *
 * Usage:
 * ```typescript
 * import { META_TOKENS } from "@athyper/core/meta";
 * import { registerMetaServices } from "./services/meta/factory";
 *
 * registerMetaServices(container, {
 *   db: dbInstance,
 *   cache: redisInstance,
 * });
 * ```
 */
export function registerMetaServices(
  // Generic container interface (works with any DI container)
  container: {
    register<T>(token: string, instance: T): void;
  },
  config: MetaServicesConfig
): MetaServices {
  const services = createMetaServices(config);

  // Register services with META_TOKENS
  // Note: We can't import META_TOKENS here as it would create circular dependency
  // Services should be registered by the kernel using META_TOKENS directly

  return services;
}
