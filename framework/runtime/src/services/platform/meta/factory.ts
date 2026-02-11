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
import { EntityClassificationServiceImpl } from "./classification/entity-classification.service.js";
import { NumberingEngineService } from "./numbering/numbering-engine.service.js";
import { ApprovalServiceImpl } from "./approval/approval.service.js";
import { DdlGeneratorService } from "./schema/ddl-generator.service.js";
import { MigrationRunnerService } from "./schema/migration-runner.service.js";
import { PublishService } from "./schema/publish.service.js";
import { SchemaChangeNotifier } from "./schema/schema-change-notifier.js";
import { EntityPageDescriptorServiceImpl, ActionDispatcherServiceImpl } from "./descriptor/index.js";
import { MetaEventBusService } from "./core/event-bus.service.js";

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
  EntityClassificationService,
  NumberingEngine,
  ApprovalService,
  DdlGenerator,
  EntityPageDescriptorService,
  ActionDispatcher,
  MetaEventBus,
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
  classificationService: EntityClassificationService;
  numberingEngine: NumberingEngine;
  approvalService: ApprovalService;
  ddlGenerator: DdlGenerator;
  migrationRunner: MigrationRunnerService;
  publishService: PublishService;
  schemaChangeNotifier: SchemaChangeNotifier;
  descriptorService: EntityPageDescriptorService;
  actionDispatcher: ActionDispatcher;
  eventBus: MetaEventBus;
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

  // 0. Event Bus (no dependencies — created first so other services can subscribe)
  const eventBus = new MetaEventBusService();

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

  // 5. Entity Classification Service (depends on db)
  const classificationService = new EntityClassificationServiceImpl(
    config.db as unknown as LifecycleDB_Type
  );

  // 6. Numbering Engine (depends on db)
  const numberingEngine = new NumberingEngineService(
    config.db as unknown as LifecycleDB_Type
  );

  // 7. Lifecycle Route Compiler (depends on db)
  const lifecycleRouteCompiler = new LifecycleRouteCompilerService(config.db as unknown as LifecycleDB_Type);

  // 8. Lifecycle Manager (depends on db, lifecycleRouteCompiler, policyGate)
  const lifecycleManager = new LifecycleManagerService(
    config.db as unknown as LifecycleDB_Type,
    lifecycleRouteCompiler,
    policyGate
  );

  // 9. Approval Service (depends on db)
  const approvalService = new ApprovalServiceImpl(
    config.db as unknown as LifecycleDB_Type
  );

  // 10. Wire circular dependencies
  lifecycleManager.setApprovalService(approvalService);
  approvalService.setLifecycleManager(lifecycleManager);

  // 11. Generic Data API (depends on compiler, policyGate, auditLogger, lifecycleManager, classificationService, numberingEngine)
  const dataAPI = new GenericDataAPIService(
    config.db,
    compiler,
    policyGate,
    auditLogger,
    lifecycleManager,
    classificationService,
    numberingEngine,
  );

  // 8. MetaStore (depends on registry, compiler, auditLogger)
  const metaStore = new MetaStoreService(registry, compiler, auditLogger);

  // 9. DDL Generator (no dependencies - pure transformation service)
  const ddlGenerator = new DdlGeneratorService();

  // 10. Migration Runner (depends on db, registry, compiler, ddlGenerator)
  const migrationRunner = new MigrationRunnerService({
    db: config.db,
    registry,
    compiler,
    ddlGenerator,
    mode: "dev",
  });

  // 11. Schema Change Notifier (depends on Redis)
  const schemaChangeNotifier = new SchemaChangeNotifier(config.cache);

  // 12. Publish Service (depends on db, registry, compiler, ddlGenerator, migrationRunner, notifier)
  const publishService = new PublishService(
    config.db,
    registry,
    compiler,
    ddlGenerator,
    migrationRunner,
    schemaChangeNotifier,
  );

  // 13. Entity Page Descriptor Service (depends on compiler, classificationService, lifecycleManager, approvalService, policyGate)
  const descriptorService = new EntityPageDescriptorServiceImpl(
    compiler,
    classificationService,
    lifecycleManager,
    approvalService,
    policyGate,
  );

  // 14. Action Dispatcher (depends on lifecycleManager, approvalService, dataAPI)
  const actionDispatcher = new ActionDispatcherServiceImpl(
    lifecycleManager,
    approvalService,
    dataAPI,
  );

  return {
    registry,
    compiler,
    policyGate,
    auditLogger,
    dataAPI,
    metaStore,
    lifecycleRouteCompiler,
    lifecycleManager,
    classificationService,
    numberingEngine,
    approvalService,
    ddlGenerator,
    migrationRunner,
    publishService,
    schemaChangeNotifier,
    descriptorService,
    actionDispatcher,
    eventBus,
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
