// framework/runtime/src/adapters/http/express.httpServer.ts

import express from "express";

import { KernelConfigError } from "../../kernel/config";
import { createHttpScope, type RequestContext } from "../../kernel/scope";
import { TenantContextError, type TenantContext } from "../../kernel/tenantContext";
import { TOKENS } from "../../kernel/tokens";

import type { Container } from "../../kernel/container";
import type { HttpServer } from "../../kernel/httpServer";
import type { Logger } from "../../kernel/logger";
import type { RouteDef } from "../../registries/routes.registry";
import type { RouteHandler, RoutePolicy, HttpHandlerContext, AuthContext } from "../../services/platform/foundation/http/types";
import type { Request, Response, NextFunction } from "express";
import type { Server } from "node:http";

type JwtVerifier = {
    verifyJwt(token: string): Promise<{ claims: Record<string, unknown> }>;
};

type AuthAdapter = {
    getVerifier(realmKey: string): Promise<JwtVerifier>;
};

type RequestWithAuthFlag = Request & { __authRequired?: boolean };

export function createExpressHttpServer(root: Container): HttpServer {
    const app = express();
    app.disable("x-powered-by");
    app.use(express.json({ limit: "2mb" }));

    let server: Server | undefined;

    function mountRoutes(routes: readonly RouteDef[]) {
        for (const r of routes) {
            app[r.method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete"](r.path, makeRouteMiddleware(root, r));
        }

        app.use((req, res) => {
            res.status(404).json({ error: "NOT_FOUND", requestId: req.header("x-request-id") ?? undefined });
        });

        app.use(makeErrorMiddleware(root));
    }

    async function listen(port: number) {
        await new Promise<void>((resolve) => {
            server = app.listen(port, () => resolve());
        });
    }

    async function close() {
        if (!server) return;
        await new Promise<void>((resolve, reject) => {
            server!.close((err?: Error) => (err ? reject(err) : resolve()));
        });
    }

    return { mountRoutes, listen, close };
}

function makeRouteMiddleware(root: Container, def: RouteDef) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const reqWithFlag = req as RequestWithAuthFlag;

        // Help error middleware know auth requirements
        reqWithFlag.__authRequired = def.authRequired === true;

        const scope = createHttpScope(root, req);

        // requestId propagation
        const reqCtx = await scope.resolve<RequestContext>(TOKENS.requestContext);
        res.setHeader("x-request-id", reqCtx.requestId);

        const logger = await root.resolve<Logger>(TOKENS.logger);

        try {
            // tenant context created in scope
            const tenant = await scope.resolve<TenantContext>(TOKENS.tenantContext);

            // auth context (anonymous or verified)
            const authCtx = await buildAuthContext(scope, tenant, def.authRequired === true, req);
            scope.register(TOKENS.authContext, async () => authCtx, "scoped");

            const ctx: HttpHandlerContext = {
                container: scope,
                request: {
                    requestId: reqCtx.requestId,
                    source: "http",
                    method: req.method,
                    path: req.path,
                    ip: req.ip,
                    userAgent: req.header("user-agent") ?? undefined,
                },
                tenant,
                auth: authCtx,
            };

            // policy hook
            if (def.policyToken) {
                const policy = await scope.resolve<RoutePolicy>(def.policyToken);
                await policy.assertAllowed(ctx);
            }

            // handler
            const handler = await scope.resolve<RouteHandler>(def.handlerToken);
            await handler.handle(req, res, ctx);

            return;
        } catch (err) {
            logger.error({ err, requestId: reqCtx.requestId, path: req.path }, "[http] route error");
            return next(err);
        }
    };
}

/**
 * Auth building:
 * - If authRequired and no token => throw marker error -> 401
 * - If token present: realm-aware verification via TOKENS.auth
 */
async function buildAuthContext(scope: Container, tenant: TenantContext, required: boolean, req: Request): Promise<AuthContext> {
    const token = extractBearer(req);
    if (!token) {
        if (required) {
            const e = new Error("Bearer token required") as Error & { code?: string };
            e.code = "AUTH_REQUIRED";
            throw e;
        }
        return {
            authenticated: false,
            realmKey: tenant.realmKey,
            tenantKey: tenant.tenantKey,
            orgKey: tenant.orgKey,
            roles: [],
            groups: [],
        };
    }

    const auth = await scope.resolve<AuthAdapter>(TOKENS.auth);
    const verifier = await auth.getVerifier(tenant.realmKey);
    const { claims } = await verifier.verifyJwt(token);

    return normalizeClaimsToAuthContext(claims, tenant);
}

function extractBearer(req: Request): string | undefined {
    const h = req.header("authorization");
    if (!h) return undefined;
    const m = h.match(/^Bearer\s+(.+)$/i);
    return m?.[1];
}

/**
 * Normalize Keycloak claims -> stable AuthContext
 * - aud/azp already validated in jose verifier
 * - roles extracted from realm_access + resource_access
 * - groups extracted from "groups"
 */
function normalizeClaimsToAuthContext(claims: Record<string, unknown>, tenant: TenantContext): AuthContext {
    const sub = typeof claims.sub === "string" ? claims.sub : undefined;
    const preferredUsername = typeof claims.preferred_username === "string" ? claims.preferred_username : undefined;

    const email = typeof claims.email === "string" ? claims.email : undefined;
    const name = typeof claims.name === "string" ? claims.name : undefined;

    const roles = extractKeycloakRoles(claims);
    const groups = extractStringArray(claims.groups);

    return {
        authenticated: true,
        realmKey: tenant.realmKey,
        tenantKey: tenant.tenantKey,
        orgKey: tenant.orgKey,
        subject: sub,
        userId: preferredUsername ?? sub,
        email,
        name,
        roles,
        groups,
        claims,
    };
}

function extractStringArray(v: unknown): string[] {
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string");
}

function asRecord(v: unknown): Record<string, unknown> | undefined {
    if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
    return v as Record<string, unknown>;
}

function extractKeycloakRoles(claims: Record<string, unknown>): string[] {
    const out = new Set<string>();

    const realmAccess = asRecord(claims.realm_access);
    const realmRoles = realmAccess?.roles;
    if (Array.isArray(realmRoles)) {
        for (const r of realmRoles) if (typeof r === "string") out.add(r);
    }

    const resourceAccess = asRecord(claims.resource_access);
    if (resourceAccess) {
        for (const client of Object.keys(resourceAccess)) {
            const clientObj = asRecord(resourceAccess[client]);
            const roles = clientObj?.roles;
            if (Array.isArray(roles)) {
                for (const r of roles) if (typeof r === "string") out.add(r);
            }
        }
    }

    return [...out];
}

function makeErrorMiddleware(root: Container) {
    return async (err: unknown, req: Request, res: Response, _next: NextFunction) => {
        const logger = await root.resolve<Logger>(TOKENS.logger);
        const requestId = res.getHeader("x-request-id")?.toString() ?? req.header("x-request-id") ?? undefined;

        // Auth required marker
        if (isAuthRequiredError(err)) {
            return res.status(401).json({ error: "UNAUTHORIZED", requestId, message: "Bearer token required" });
        }

        // Strict routing missing: 401 if route requires auth, else 400
        if (err instanceof TenantContextError && err.code === "TENANT_CONTEXT_REQUIRED") {
            const authRequired = (req as RequestWithAuthFlag).__authRequired === true;
            const status = authRequired ? 401 : 400;
            return res.status(status).json({ error: err.code, requestId, message: err.message, meta: err.meta ?? null });
        }

        if (err instanceof TenantContextError) {
            const status =
                err.code === "ORG_WITHOUT_TENANT"
                    ? 400
                    : err.code === "UNKNOWN_REALM"
                        ? 404
                        : err.code === "UNKNOWN_TENANT"
                            ? 404
                            : err.code === "UNKNOWN_ORG"
                                ? 404
                                : 400;

            return res.status(status).json({ error: err.code, requestId, message: err.message, meta: err.meta ?? null });
        }

        if (err instanceof KernelConfigError) {
            return res.status(500).json({ error: err.code, requestId, message: "Kernel config error" });
        }

        // default
        logger.error({ requestId, err }, "[http] unhandled");
        return res.status(500).json({ error: "INTERNAL_ERROR", requestId });
    };
}

function isAuthRequiredError(err: unknown): err is { code: "AUTH_REQUIRED" } {
    return !!err && typeof err === "object" && (err as Record<string, unknown>).code === "AUTH_REQUIRED";
}