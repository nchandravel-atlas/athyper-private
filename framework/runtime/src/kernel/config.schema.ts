// framework/runtime/kernel/config.schema.ts
import { z } from "zod";

export const RuntimeModeSchema = z.enum(["api", "worker", "scheduler"]);
export type RuntimeMode = z.infer<typeof RuntimeModeSchema>;

/**
 * Safe boolean coercion:
 * - supports true/false, 1/0, yes/no, on/off
 * - avoids JS Boolean("false") === true pitfall
 */
const Bool = z.preprocess((v) => {
    if (typeof v === "boolean") return v;

    if (typeof v === "string") {
        const s = v.trim().toLowerCase();
        if (["true", "1", "yes", "y", "on"].includes(s)) return true;
        if (["false", "0", "no", "n", "off"].includes(s)) return false;
    }

    return v;
}, z.boolean());

/**
 * We intentionally allow "defaults" to be a free-form JSON object.
 * This powers the cascade:
 * realm.defaults -> tenant.defaults -> org.defaults
 */
const DefaultsSchema = z.record(z.any()).default({});

const OrgConfigSchema = z.object({
    defaults: DefaultsSchema,
});

const TenantConfigSchema = z.object({
    defaults: DefaultsSchema,
    orgs: z.record(OrgConfigSchema).default({}),
});

const RealmConfigSchema = z.object({
    /**
     * Realm-level defaults (feature flags, policies, etc.)
     */
    defaults: DefaultsSchema,

    /**
     * IAM config for this realm.
     * Secrets should not be stored in JSON. Use clientSecretRef and resolve via SUPERSTAR env.
     */
    iam: z.object({
        issuerUrl: z.string().url(),
        clientId: z.string().min(1),
        clientSecretRef: z.string().min(1).optional(),
    }),

    tenants: z.record(TenantConfigSchema).default({}),
});

export const RuntimeConfigSchema = z.object({
    env: z.enum(["local", "staging", "prod"]).default("local"),
    mode: RuntimeModeSchema.default("api"),
    serviceName: z.string().min(1).default("athyper-runtime"),
    port: z.coerce.number().int().positive().default(3000),

    logLevel: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    shutdownTimeoutMs: z.coerce.number().int().positive().default(15_000),

    publicBaseUrl: z.string().url().optional(),

    db: z.object({
        url: z.string().min(1), // PgBouncer
        adminUrl: z.string().min(1).optional(), // Direct Postgres
        poolMax: z.coerce.number().int().positive().default(10),
    }),

    /**
     * IAM at runtime is resolved per realmKey+tenantKey+orgKey.
     */
    iam: z.object({
        strategy: z.enum(["single_realm", "multi_realm"]).default("single_realm"),

        defaultRealmKey: z.string().min(1).default("main"),
        defaultTenantKey: z.string().min(1).optional(),
        defaultOrgKey: z.string().min(1).optional(),

        /**
         * Realms registry.
         * - single_realm: typically only one entry (e.g., "main"), but you may still keep multiple for future.
         * - multi_realm: multiple entries (per customer/realm).
         */
        requireTenantClaimsInProd: Bool.default(true),
        realms: z.record(RealmConfigSchema).default({}),
    }),

    redis: z.object({ url: z.string().min(1) }),

    s3: z.object({
        endpoint: z.string().min(1),
        accessKey: z.string().min(1),
        secretKey: z.string().min(1),
        region: z.string().min(1).default("us-east-1"),
        bucket: z.string().min(1).default("athyper"),
        useSSL: Bool.default(false),
    }),

    telemetry: z.object({
        otlpEndpoint: z.string().min(1).optional(),
        enabled: Bool.default(true),
    }),
});

export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;