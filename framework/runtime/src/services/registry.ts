// framework/runtime/src/services/registry.ts

import { TOKENS } from "../kernel/tokens";

import { module as httpFoundation } from "./platform/foundation/http/module";
import { module as metaModule } from "./platform/meta/module";
import { module as dashboardModule } from "./platform/ui/module";
import { module as documentModule } from "./platform-services/document/index";
import { module as contentModule } from "./platform-services/content/index";
import { module as notificationModule } from "./platform-services/notification/index";
import { module as auditGovernanceModule } from "./platform/audit-governance/index";
import { module as iamModule } from "./platform/foundation/iam/iam.module";
import { module as collaborationModule } from "./enterprise-services/collaboration/index";

import type { AuditEvent, AuditWriter } from "../kernel/audit";
import type { Container } from "../kernel/container";
import type { Logger } from "../kernel/logger";
import type { RuntimeModule } from "./types.js";

export type { RuntimeModule } from "./types.js";

const modules: RuntimeModule[] = [
    httpFoundation,
    metaModule,
    iamModule,
    dashboardModule,
    documentModule,
    contentModule,
    notificationModule,
    auditGovernanceModule,
    collaborationModule,
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