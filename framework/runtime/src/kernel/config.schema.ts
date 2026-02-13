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

    /**
     * Redirect URI allowlist for this realm.
     * In production, no wildcards are permitted.
     */
    redirectUriAllowlist: z.array(z.string()).default([]),

    /**
     * Auth feature flags for gradual rollout.
     */
    featureFlags: z.object({
        /** Enable Redis-backed BFF sessions (vs. cookie-only). */
        bffSessions: Bool.default(false),
        /** Enable refresh token rotation on every use. */
        refreshRotation: Bool.default(false),
        /** Enable CSRF double-submit enforcement. */
        csrfProtection: Bool.default(false),
        /** Enable strict JWT issuer validation at API boundary. */
        strictIssuerCheck: Bool.default(false),
        /** Enable PKCE authorization code flow (vs. direct grant). */
        pkceFlow: Bool.default(false),
    }).default({}),

    /**
     * Platform-level IAM security minimums.
     * Tenants cannot configure values weaker than these.
     */
    platformMinimums: z.object({
        passwordMinLength: z.coerce.number().int().min(1).default(8),
        passwordHistory: z.coerce.number().int().min(0).default(1),
        maxLoginFailures: z.coerce.number().int().min(1).default(10),
        lockoutDurationMinutes: z.coerce.number().int().min(1).default(5),
    }).default({}),

    tenants: z.record(TenantConfigSchema).default({}),
});

export const RuntimeConfigSchema = z.object({
    env: z.enum(["local", "staging", "production"]).default("local"),
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

    jobQueue: z.object({
        /** BullMQ queue name (all job types share one queue, differentiated by data.type) */
        queueName: z.string().min(1).default("athyper-jobs"),
        /** Default retry attempts for failed jobs */
        defaultRetries: z.coerce.number().int().min(0).default(3),
    }).default({}),

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

    document: z.object({
        enabled: Bool.default(false),
        rendering: z.object({
            engine: z.enum(["puppeteer", "playwright"]).default("puppeteer"),
            chromiumPath: z.string().optional(),
            concurrency: z.coerce.number().int().min(1).max(10).default(3),
            timeoutMs: z.coerce.number().int().positive().default(30000),
            maxRetries: z.coerce.number().int().min(0).default(3),
            paperFormat: z.enum(["A4", "LETTER", "LEGAL"]).default("A4"),
            trustedDomains: z.array(z.string()).default([]),
            allowedHosts: z.array(z.string()).default([]),
            composeTimeoutMs: z.coerce.number().int().positive().default(5000),
            uploadTimeoutMs: z.coerce.number().int().positive().default(30000),
        }).default({}),
        storage: z.object({
            pathPrefix: z.string().default("documents"),
            presignedUrlExpirySeconds: z.coerce.number().int().positive().default(3600),
            downloadMode: z.enum(["stream", "presigned"]).default("stream"),
        }).default({}),
        jobs: z.object({
            leaseSeconds: z.coerce.number().int().positive().default(300),
            heartbeatSeconds: z.coerce.number().int().positive().default(30),
        }).default({}),
        retention: z.object({
            defaultDays: z.coerce.number().int().positive().default(2555),
            archiveAfterDays: z.coerce.number().int().positive().default(365),
        }).default({}),
    }).default({}),

    audit: z.object({
        /** Audit write mode: off (drop events), sync (direct write), outbox (async via outbox) */
        writeMode: z.enum(["off", "sync", "outbox"]).default("outbox"),
        /** Enable SHA-256 hash chain tamper evidence */
        hashChainEnabled: Bool.default(true),
        /** Enable unified activity timeline service */
        timelineEnabled: Bool.default(true),
        /** Retention period in days */
        retentionDays: z.coerce.number().int().positive().default(90),
        /** Number of months to pre-create partitions ahead */
        partitionPreCreateMonths: z.coerce.number().int().min(1).max(12).default(3),
        /** Enable column-level encryption for sensitive fields */
        encryptionEnabled: Bool.default(false),
        /** Enable load shedding policy evaluation */
        loadSheddingEnabled: Bool.default(false),
        /** Enable storage tiering (hot/warm/cold) */
        tieringEnabled: Bool.default(false),
        /** Days before data transitions from hot to warm tier */
        warmAfterDays: z.coerce.number().int().positive().default(90),
        /** Days before data transitions from warm to cold tier */
        coldAfterDays: z.coerce.number().int().positive().default(365),
    }).default({}),

    notification: z.object({
        enabled: Bool.default(true),
        providers: z.object({
            email: z.object({
                sendgrid: z.object({
                    apiKeyRef: z.string().optional(),
                    fromAddress: z.string().optional(),
                    fromName: z.string().optional(),
                    enabled: Bool.default(false),
                }).default({}),
            }).default({}),
            teams: z.object({
                powerAutomate: z.object({
                    webhookUrl: z.string().optional(),
                    enabled: Bool.default(false),
                }).default({}),
            }).default({}),
            whatsapp: z.object({
                phoneNumberId: z.string().optional(),
                accessTokenRef: z.string().optional(),
                businessAccountId: z.string().optional(),
                webhookVerifyToken: z.string().optional(),
                enabled: Bool.default(false),
            }).default({}),
        }).default({}),
        delivery: z.object({
            maxRetries: z.coerce.number().int().min(0).default(3),
            retryBackoffMs: z.coerce.number().int().positive().default(2000),
            dedupWindowMs: z.coerce.number().int().positive().default(300000),
            defaultPriority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
            defaultLocale: z.string().min(2).default("en"),
            workerConcurrency: z.coerce.number().int().positive().default(5),
        }).default({}),
        digest: z.object({
            hourlyAt: z.coerce.number().int().min(0).max(59).default(0),
            dailyAtHourUtc: z.coerce.number().int().min(0).max(23).default(8),
            weeklyDay: z.coerce.number().int().min(0).max(6).default(1),
            maxItemsPerDigest: z.coerce.number().int().positive().default(50),
        }).default({}),
        retention: z.object({
            messageDays: z.coerce.number().int().positive().default(90),
            deliveryDays: z.coerce.number().int().positive().default(30),
        }).default({}),
    }).default({}),

    collab: z.object({
        enabled: Bool.default(true),
        maxCommentLength: z.coerce.number().int().min(100).max(10000).default(5000),
        maxThreadDepth: z.coerce.number().int().min(0).max(10).default(5),
        mentionsEnabled: Bool.default(true),
        attachmentsEnabled: Bool.default(true),
        timelineEnabled: Bool.default(true),
        rateLimits: z.object({
            commentsPerMinute: z.coerce.number().int().positive().default(10),
            mentionsPerComment: z.coerce.number().int().positive().default(20),
        }).default({}),
    }).default({}),
});

export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;