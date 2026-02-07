// framework/runtime/src/services/registry.ts

import { TOKENS } from "../kernel/tokens";

import { module as httpFoundation } from "./platform/foundation/http/module";
import { module as metaModule } from "./platform/meta/module";
import { module as dashboardModule } from "./platform/ui/module";

import type { AuditWriter, AuditEvent } from "../kernel/audit";
import type { Container } from "../kernel/container";
import type { Logger } from "../kernel/logger";


export type RuntimeModule = {
    name: string;
    register?: (c: Container) => void | Promise<void>;
    contribute?: (c: Container) => void | Promise<void>;
};

const modules: RuntimeModule[] = [
    // (await import("./tenancy/module")).module,
    // (await import("./iam/module")).module,
    httpFoundation,
    metaModule,
    dashboardModule,
];

export async function loadServices(container: Container) {
    const logger = await container.resolve<Logger>(TOKENS.logger);
    const audit = await container.resolve<AuditWriter>(TOKENS.auditWriter);

    logger.info({ count: modules.length }, "[services] loading");

    for (const m of modules) {
        await m.register?.(container);
        await m.contribute?.(container);

        const event: AuditEvent = {
            ts: new Date().toISOString(),
            type: "module.loaded",
            level: "info",
            actor: { kind: "system" },
            meta: { module: m.name },
        };

        await audit.write(event);
    }
}