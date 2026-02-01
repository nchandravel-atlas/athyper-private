import type { Container } from "../../../kernel/container";
import { TOKENS } from "../../../kernel/tokens";
import { createExpressHttpServer } from "./express.httpServer";

export function registerHttpServer(container: Container) {
    container.register(
        TOKENS.httpServer,
        async (c) => {
            return createExpressHttpServer(c, {
                defaultAuthRequired: true,
                requestIdHeader: "x-request-id",
            });
        },
        "singleton",
    );
}