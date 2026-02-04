// framework/runtime/src/index.ts

// Kernel / runtime bootstrap surface
export * from "./kernel/bootstrap";
export * from "./kernel/config";
export * from "./kernel/container";
export * from "./kernel/container.defaults";
export * from "./kernel/tokens";

// Service/module loader
export * from "./services/registry";

// Registries (optional export if other packages contribute definitions)
export * from "./registries/routes.registry";
export * from "./registries/jobs.registry";
export * from "./registries/services.registry";

// Telemetry adapters
export * from "./adapters/telemetry/index";