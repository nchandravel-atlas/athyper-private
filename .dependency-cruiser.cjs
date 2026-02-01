/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        /**
         * ─────────────────────────────────────────────
         * CORE IS PURE
         * ─────────────────────────────────────────────
         */
        {
            name: "core-no-infra",
            severity: "error",
            from: {
                path: "^framework/core"
            },
            to: {
                path: [
                    "^framework/runtime",
                    "^framework/adapters",
                    "^packages",
                    "^products",
                    "node_modules/(pg|ioredis|@aws-sdk|express|pino|jose)"
                ]
            }
        },

        /**
         * ─────────────────────────────────────────────
         * RUNTIME ORCHESTRATES (NO DIRECT INFRA)
         * ─────────────────────────────────────────────
         */
        {
            name: "runtime-no-direct-infra",
            severity: "error",
            from: {
                path: "^framework/runtime"
            },
            to: {
                path: "node_modules/(pg|ioredis|@aws-sdk|pino|redis|minio)"
            }
        },

        /**
         * ─────────────────────────────────────────────
         * ADAPTERS TOUCH INFRA ONLY
         * ─────────────────────────────────────────────
         */
        // auth adapter cannot import db/memorycache/objectstorage/telemetry
        {
            name: "adapter-auth-no-cross-talk",
            severity: "error",
            from: { path: "^framework/adapters/auth/" },
            to: { path: "^framework/adapters/(db|memorycache|objectstorage|telemetry)/" }
        },
        // db adapter cannot import auth/memorycache/objectstorage/telemetry
        {
            name: "adapter-db-no-cross-talk",
            severity: "error",
            from: { path: "^framework/adapters/db/" },
            to: { path: "^framework/adapters/(auth|memorycache|objectstorage|telemetry)/" }
        },
        // memorycache adapter cannot import auth/db/objectstorage/telemetry
        {
            name: "adapter-memorycache-no-cross-talk",
            severity: "error",
            from: { path: "^framework/adapters/memorycache/" },
            to: { path: "^framework/adapters/(auth|db|objectstorage|telemetry)/" }
        },
        // objectstorage adapter cannot import auth/db/memorycache/telemetry
        {
            name: "adapter-objectstorage-no-cross-talk",
            severity: "error",
            from: { path: "^framework/adapters/objectstorage/" },
            to: { path: "^framework/adapters/(auth|db|memorycache|telemetry)/" }
        },
        // telemetry adapter cannot import auth/db/memorycache/objectstorage
        {
            name: "adapter-telemetry-no-cross-talk",
            severity: "error",
            from: { path: "^framework/adapters/telemetry/" },
            to: { path: "^framework/adapters/(auth|db|memorycache|objectstorage)/" }
        },

        /**
         * ─────────────────────────────────────────────
         * PACKAGES = REUSABLE LIBS (NO FRAMEWORK)
         * ─────────────────────────────────────────────
         */
        {
            name: "packages-no-framework",
            severity: "error",
            from: {
                path: "^packages"
            },
            to: {
                path: "^framework"
            }
        },

        /**
         * ─────────────────────────────────────────────
         * PRODUCTS = DEPLOYABLES ONLY
         * ─────────────────────────────────────────────
         */
        {
            name: "products-no-framework",
            severity: "error",
            from: {
                path: "^products"
            },
            to: {
                path: "^framework"
            }
        }
    ],

    options: {
        doNotFollow: {
            path: "node_modules"
        },
        tsConfig: {
            fileName: "tsconfig.json"
        },
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            conditionNames: ["import", "default"]
        }
    }
};