/**
 * META Engine HTTP Module
 *
 * Registers all META Engine HTTP handlers and routes
 */

import { TOKENS } from "../../../kernel/tokens.js";

import {
  ListRecordsHandler,
  GetRecordHandler,
  CountRecordsHandler,
  CreateRecordHandler,
  UpdateRecordHandler,
  DeleteRecordHandler,
  RestoreRecordHandler,
  PermanentDeleteRecordHandler,
  BulkCreateRecordsHandler,
  BulkUpdateRecordsHandler,
  BulkDeleteRecordsHandler,
} from "./handlers/data.handler.js";
import {
  CreateEntityHandler,
  ListEntitiesHandler,
  GetEntityHandler,
  UpdateEntityHandler,
  DeleteEntityHandler,
} from "./handlers/entities.handler.js";
import {
  CreateVersionHandler,
  ListVersionsHandler,
  GetVersionHandler,
  ActivateVersionHandler,
  DeleteVersionHandler,
} from "./handlers/versions.handler.js";
import {
  StaticDescriptorHandler,
  DynamicDescriptorHandler,
  ActionExecutionHandler,
} from "./handlers/descriptor.handler.js";

import type { Container } from "../../../kernel/container.js";
import type { RuntimeModule } from "../../registry.js";
import type { RouteRegistry } from "../foundation/registries/routes.registry.js";

// Entity handlers

// Version handlers

// Data API handlers

// ============================================================================
// Handler Tokens
// ============================================================================

const META_HANDLER_TOKENS = {
  // Entity handlers
  createEntity: "meta.handler.entities.create",
  listEntities: "meta.handler.entities.list",
  getEntity: "meta.handler.entities.get",
  updateEntity: "meta.handler.entities.update",
  deleteEntity: "meta.handler.entities.delete",

  // Version handlers
  createVersion: "meta.handler.versions.create",
  listVersions: "meta.handler.versions.list",
  getVersion: "meta.handler.versions.get",
  activateVersion: "meta.handler.versions.activate",
  deleteVersion: "meta.handler.versions.delete",

  // Data API handlers
  listRecords: "meta.handler.data.list",
  getRecord: "meta.handler.data.get",
  countRecords: "meta.handler.data.count",
  createRecord: "meta.handler.data.create",
  updateRecord: "meta.handler.data.update",
  deleteRecord: "meta.handler.data.delete",
  restoreRecord: "meta.handler.data.restore",
  permanentDeleteRecord: "meta.handler.data.permanentDelete",

  // Bulk operation handlers
  bulkCreateRecords: "meta.handler.data.bulkCreate",
  bulkUpdateRecords: "meta.handler.data.bulkUpdate",
  bulkDeleteRecords: "meta.handler.data.bulkDelete",

  // Entity Page Descriptor handlers
  staticDescriptor: "meta.handler.descriptor.static",
  dynamicDescriptor: "meta.handler.descriptor.dynamic",
  actionExecution: "meta.handler.descriptor.action",
} as const;

// ============================================================================
// Module Definition
// ============================================================================

export const module: RuntimeModule = {
  name: "platform.meta",

  async register(c: Container) {
    // Register entity handlers
    c.register(META_HANDLER_TOKENS.createEntity, async () => new CreateEntityHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.listEntities, async () => new ListEntitiesHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.getEntity, async () => new GetEntityHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.updateEntity, async () => new UpdateEntityHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.deleteEntity, async () => new DeleteEntityHandler(), "singleton");

    // Register version handlers
    c.register(META_HANDLER_TOKENS.createVersion, async () => new CreateVersionHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.listVersions, async () => new ListVersionsHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.getVersion, async () => new GetVersionHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.activateVersion, async () => new ActivateVersionHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.deleteVersion, async () => new DeleteVersionHandler(), "singleton");

    // Register data API handlers
    c.register(META_HANDLER_TOKENS.listRecords, async () => new ListRecordsHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.getRecord, async () => new GetRecordHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.countRecords, async () => new CountRecordsHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.createRecord, async () => new CreateRecordHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.updateRecord, async () => new UpdateRecordHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.deleteRecord, async () => new DeleteRecordHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.restoreRecord, async () => new RestoreRecordHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.permanentDeleteRecord, async () => new PermanentDeleteRecordHandler(), "singleton");

    // Register bulk operation handlers
    c.register(META_HANDLER_TOKENS.bulkCreateRecords, async () => new BulkCreateRecordsHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.bulkUpdateRecords, async () => new BulkUpdateRecordsHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.bulkDeleteRecords, async () => new BulkDeleteRecordsHandler(), "singleton");

    // Register entity page descriptor handlers
    c.register(META_HANDLER_TOKENS.staticDescriptor, async () => new StaticDescriptorHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.dynamicDescriptor, async () => new DynamicDescriptorHandler(), "singleton");
    c.register(META_HANDLER_TOKENS.actionExecution, async () => new ActionExecutionHandler(), "singleton");
  },

  async contribute(c: Container) {
    const routes = await c.resolve<RouteRegistry>(TOKENS.routeRegistry);

    // ========================================================================
    // Entity Routes
    // ========================================================================

    routes.add({
      method: "POST",
      path: "/api/meta/entities",
      handlerToken: META_HANDLER_TOKENS.createEntity,
      authRequired: true,
      tags: ["meta", "entities"],
    });

    routes.add({
      method: "GET",
      path: "/api/meta/entities",
      handlerToken: META_HANDLER_TOKENS.listEntities,
      authRequired: true,
      tags: ["meta", "entities"],
    });

    routes.add({
      method: "GET",
      path: "/api/meta/entities/:name",
      handlerToken: META_HANDLER_TOKENS.getEntity,
      authRequired: true,
      tags: ["meta", "entities"],
    });

    routes.add({
      method: "PUT",
      path: "/api/meta/entities/:name",
      handlerToken: META_HANDLER_TOKENS.updateEntity,
      authRequired: true,
      tags: ["meta", "entities"],
    });

    routes.add({
      method: "DELETE",
      path: "/api/meta/entities/:name",
      handlerToken: META_HANDLER_TOKENS.deleteEntity,
      authRequired: true,
      tags: ["meta", "entities"],
    });

    // ========================================================================
    // Version Routes
    // ========================================================================

    routes.add({
      method: "POST",
      path: "/api/meta/entities/:name/versions",
      handlerToken: META_HANDLER_TOKENS.createVersion,
      authRequired: true,
      tags: ["meta", "versions"],
    });

    routes.add({
      method: "GET",
      path: "/api/meta/entities/:name/versions",
      handlerToken: META_HANDLER_TOKENS.listVersions,
      authRequired: true,
      tags: ["meta", "versions"],
    });

    routes.add({
      method: "GET",
      path: "/api/meta/entities/:name/versions/:version",
      handlerToken: META_HANDLER_TOKENS.getVersion,
      authRequired: true,
      tags: ["meta", "versions"],
    });

    routes.add({
      method: "POST",
      path: "/api/meta/entities/:name/versions/:version/activate",
      handlerToken: META_HANDLER_TOKENS.activateVersion,
      authRequired: true,
      tags: ["meta", "versions"],
    });

    routes.add({
      method: "DELETE",
      path: "/api/meta/entities/:name/versions/:version",
      handlerToken: META_HANDLER_TOKENS.deleteVersion,
      authRequired: true,
      tags: ["meta", "versions"],
    });

    // ========================================================================
    // Generic Data API Routes
    // ========================================================================

    routes.add({
      method: "GET",
      path: "/api/data/:entity",
      handlerToken: META_HANDLER_TOKENS.listRecords,
      authRequired: true,
      tags: ["meta", "data"],
    });

    routes.add({
      method: "GET",
      path: "/api/data/:entity/:id",
      handlerToken: META_HANDLER_TOKENS.getRecord,
      authRequired: true,
      tags: ["meta", "data"],
    });

    routes.add({
      method: "GET",
      path: "/api/data/:entity/count",
      handlerToken: META_HANDLER_TOKENS.countRecords,
      authRequired: true,
      tags: ["meta", "data"],
    });

    // Write operations
    routes.add({
      method: "POST",
      path: "/api/data/:entity",
      handlerToken: META_HANDLER_TOKENS.createRecord,
      authRequired: true,
      tags: ["meta", "data"],
    });

    routes.add({
      method: "PUT",
      path: "/api/data/:entity/:id",
      handlerToken: META_HANDLER_TOKENS.updateRecord,
      authRequired: true,
      tags: ["meta", "data"],
    });

    routes.add({
      method: "DELETE",
      path: "/api/data/:entity/:id",
      handlerToken: META_HANDLER_TOKENS.deleteRecord,
      authRequired: true,
      tags: ["meta", "data"],
    });

    // Soft delete operations
    routes.add({
      method: "POST",
      path: "/api/data/:entity/:id/restore",
      handlerToken: META_HANDLER_TOKENS.restoreRecord,
      authRequired: true,
      tags: ["meta", "data", "soft-delete"],
    });

    routes.add({
      method: "DELETE",
      path: "/api/data/:entity/:id/permanent",
      handlerToken: META_HANDLER_TOKENS.permanentDeleteRecord,
      authRequired: true,
      tags: ["meta", "data", "soft-delete"],
    });

    // Bulk operations
    routes.add({
      method: "POST",
      path: "/api/data/:entity/bulk",
      handlerToken: META_HANDLER_TOKENS.bulkCreateRecords,
      authRequired: true,
      tags: ["meta", "data", "bulk"],
    });

    routes.add({
      method: "PATCH",
      path: "/api/data/:entity/bulk",
      handlerToken: META_HANDLER_TOKENS.bulkUpdateRecords,
      authRequired: true,
      tags: ["meta", "data", "bulk"],
    });

    routes.add({
      method: "DELETE",
      path: "/api/data/:entity/bulk",
      handlerToken: META_HANDLER_TOKENS.bulkDeleteRecords,
      authRequired: true,
      tags: ["meta", "data", "bulk"],
    });

    // ========================================================================
    // Entity Page Descriptor Routes
    // ========================================================================

    routes.add({
      method: "GET",
      path: "/api/entity-page/:entityName",
      handlerToken: META_HANDLER_TOKENS.staticDescriptor,
      authRequired: true,
      tags: ["entity-page"],
    });

    routes.add({
      method: "GET",
      path: "/api/entity-page/:entityName/:id",
      handlerToken: META_HANDLER_TOKENS.dynamicDescriptor,
      authRequired: true,
      tags: ["entity-page"],
    });

    routes.add({
      method: "POST",
      path: "/api/entity-page/:entityName/:id/actions/:actionCode",
      handlerToken: META_HANDLER_TOKENS.actionExecution,
      authRequired: true,
      tags: ["entity-page", "actions"],
    });
  },
};
