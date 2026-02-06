import { createExpressHttpServer } from "../../../../adapters/http/express.httpServer";
import { TOKENS } from "../../../../kernel/tokens";

import { HealthHandler } from "./health.handler";
import { JwksHealthHandler } from "./jwks-health.handler";

import type { Container } from "../../../../kernel/container";
import type { RouteRegistry } from "../registries/routes.registry.js";
import type { RuntimeModule } from "../../../registry";

export const module: RuntimeModule = {
    name: "platform.foundation.http",

    async register(c: Container) {
        // Express-backed server
        c.register(TOKENS.httpServer, async () => createExpressHttpServer(c), "singleton");

        // Handlers
        c.register("http.handler.health", async () => new HealthHandler(), "singleton");
        c.register("http.handler.jwks-health", async () => new JwksHealthHandler(), "singleton");
    },

    async contribute(c: Container) {
        const routes = await c.resolve<RouteRegistry>(TOKENS.routeRegistry);

        routes.add({
            method: "GET",
            path: "/health",
            handlerToken: "http.handler.health",
            authRequired: false,
            tags: ["foundation"],
        });

        routes.add({
            method: "GET",
            path: "/health/jwks",
            handlerToken: "http.handler.jwks-health",
            authRequired: false,
            tags: ["foundation", "auth"],
        });
    },
};