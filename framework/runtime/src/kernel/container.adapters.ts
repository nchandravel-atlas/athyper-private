// framework/runtime/src/kernel/container.adapters.ts
import { TOKENS } from "./tokens";
import type { RuntimeConfig } from "./config.schema";
import type { Container } from "./container";
import {
    AdapterCircuitBreakers,
    protectDbAdapter,
    protectCacheAdapter,
    protectObjectStorageAdapter,
    protectAuthAdapter,
} from "../resilience/adapter-protection.js";

/**
 * Registers adapter implementations into the container.
 *
 * Called after registerKernelDefaults() during bootstrap.
 * Adapters are singletons that wrap external infrastructure (DB, cache, storage, etc.)
 */
export async function registerAdapters(container: Container, config: RuntimeConfig) {
    // Circuit breaker registry (singleton)
    const circuitBreakers = new AdapterCircuitBreakers();
    container.register(TOKENS.circuitBreakers, async () => circuitBreakers, "singleton");

    // Get health registry to register health checks
    const healthRegistry = await container.resolve<any>(TOKENS.healthRegistry);

    // Database Adapter (with circuit breaker protection)
    container.register(
        TOKENS.db,
        async () => {
            const { createDbAdapter } = await import("@athyper/adapter-db");

            const adapter = createDbAdapter({
                connectionString: config.db.url,
                poolMax: config.db.poolMax ?? 10,
            });

            const protectedAdapter = protectDbAdapter(adapter, circuitBreakers);

            // Register health check
            healthRegistry.register(
                "database",
                async () => {
                    const result = await protectedAdapter.health();
                    return {
                        status: result.healthy ? "healthy" : "unhealthy",
                        message: result.message,
                        timestamp: new Date(),
                    };
                },
                { type: "database", required: true }
            );

            return protectedAdapter;
        },
        "singleton"
    );

    // Cache Adapter (Redis with circuit breaker protection)
    container.register(
        TOKENS.cache,
        async () => {
            const { createRedisClient } = await import("@athyper/adapter-memorycache");

            // Parse Redis URL to extract connection details
            const redisUrl = new URL(config.redis.url);

            const client = createRedisClient({
                host: redisUrl.hostname,
                port: redisUrl.port ? parseInt(redisUrl.port, 10) : 6379,
                password: redisUrl.password || undefined,
                db: redisUrl.pathname ? parseInt(redisUrl.pathname.slice(1), 10) : 0,
            });

            const protectedClient = protectCacheAdapter(client, circuitBreakers);

            // Register health check
            healthRegistry.register(
                "cache",
                async () => {
                    try {
                        await protectedClient.get("__health__");
                        return {
                            status: "healthy" as const,
                            message: "Cache is responding",
                            timestamp: new Date(),
                        };
                    } catch (error) {
                        return {
                            status: "unhealthy" as const,
                            message: error instanceof Error ? error.message : "Cache unreachable",
                            timestamp: new Date(),
                        };
                    }
                },
                { type: "cache", required: false } // Cache is not required for app to function
            );

            return protectedClient;
        },
        "singleton"
    );

    // Object Storage Adapter (S3 with circuit breaker protection)
    container.register(
        TOKENS.objectStorage,
        async () => {
            const { createS3ObjectStorageAdapter } = await import("@athyper/adapter-objectstorage");

            const adapter = createS3ObjectStorageAdapter({
                endpoint: config.s3.endpoint,
                accessKey: config.s3.accessKey,
                secretKey: config.s3.secretKey,
                region: config.s3.region,
                bucket: config.s3.bucket,
                useSSL: config.s3.useSSL,
            });

            const protectedAdapter = protectObjectStorageAdapter(adapter, circuitBreakers);

            // Register health check
            healthRegistry.register(
                "object_storage",
                async () => {
                    const result = await protectedAdapter.healthCheck();
                    return {
                        status: result.healthy ? "healthy" : "unhealthy",
                        message: result.message,
                        timestamp: new Date(),
                    };
                },
                { type: "storage", required: true }
            );

            return protectedAdapter;
        },
        "singleton"
    );

    // Telemetry Adapter (OpenTelemetry)
    container.register(
        TOKENS.telemetry,
        async () => {
            const { createTelemetryAdapter } = await import("@athyper/adapter-telemetry");

            const logger = await container.resolve<any>(TOKENS.logger);

            return createTelemetryAdapter({
                emit: (json: unknown) => {
                    // Emit telemetry through logger (structured logs)
                    logger.info?.(json);
                },
            });
        },
        "singleton"
    );

    // Auth Adapter (Keycloak OIDC with circuit breaker protection)
    container.register(
        TOKENS.auth,
        async () => {
            const { createAuthAdapter } = await import("@athyper/adapter-auth");

            // Get the default realm configuration
            const defaultRealmKey = config.iam.defaultRealmKey;
            const realmConfig = config.iam.realms[defaultRealmKey];

            if (!realmConfig) {
                throw new Error(`Default realm not found: ${defaultRealmKey}`);
            }

            // Client secret is already resolved from SUPERSTAR env var during config loading
            // It's stored directly in realmConfig.iam after resolution
            const adapter = createAuthAdapter({
                issuerUrl: realmConfig.iam.issuerUrl,
                clientId: realmConfig.iam.clientId,
                clientSecret: (realmConfig.iam as any).clientSecret || "",
            });

            return protectAuthAdapter(adapter, circuitBreakers);
        },
        "singleton"
    );
}
