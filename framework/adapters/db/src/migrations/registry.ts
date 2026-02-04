// framework/adapters/db/src/migrations/registry.ts
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type Migration = {
    /**
     * Unique migration ID (e.g., "00_bootstrap/001_create_schemas")
     */
    id: string;

    /**
     * Migration name (e.g., "create_schemas")
     */
    name: string;

    /**
     * Directory prefix (e.g., "00_bootstrap")
     */
    directory: string;

    /**
     * File number (e.g., "001")
     */
    fileNumber: string;

    /**
     * SQL content
     */
    sql: string;
};

/**
 * Migration registry that discovers and loads SQL migrations from the filesystem.
 *
 * Migrations are organized in numbered directories:
 * - 00_bootstrap: Schema creation, extensions
 * - 10_meta: Metadata tables
 * - 20_core: Core application tables
 * - 30_ref: Reference data
 * - 40_mdm: Master data management
 * - 90_seed: Production seed data
 * - 95_dev_seed: Development seed data
 *
 * Within each directory, files are named: 001_name.sql, 002_name.sql, etc.
 */
export class MigrationRegistry {
    private migrations: Migration[] = [];

    constructor() {
        this.loadMigrations();
    }

    /**
     * Get all migrations in execution order.
     */
    getAllMigrations(): Migration[] {
        return this.migrations;
    }

    /**
     * Get a specific migration by ID.
     */
    getMigration(id: string): Migration | undefined {
        return this.migrations.find((m) => m.id === id);
    }

    /**
     * Load all SQL migrations from the filesystem.
     */
    private loadMigrations(): void {
        // Path to SQL migrations directory
        const sqlDir = join(__dirname, "../sql");

        // Get all directories (sorted numerically)
        const directories = readdirSync(sqlDir, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)
            .filter((name) => /^\d{2}_/.test(name)) // Only numbered directories
            .sort();

        // Load migrations from each directory
        for (const dir of directories) {
            const dirPath = join(sqlDir, dir);
            const files = readdirSync(dirPath)
                .filter((f) => f.endsWith(".sql"))
                .sort();

            for (const file of files) {
                const filePath = join(dirPath, file);
                const sql = readFileSync(filePath, "utf-8");

                // Parse file name: 001_create_schemas.sql
                const match = file.match(/^(\d{3})_(.+)\.sql$/);
                if (!match) continue;

                const [, fileNumber, name] = match;
                const id = `${dir}/${file.replace(".sql", "")}`;

                this.migrations.push({
                    id,
                    name,
                    directory: dir,
                    fileNumber,
                    sql,
                });
            }
        }
    }
}

/**
 * Singleton migration registry instance.
 */
let registry: MigrationRegistry | undefined;

/**
 * Get the global migration registry instance.
 */
export function getMigrationRegistry(): MigrationRegistry {
    if (!registry) {
        registry = new MigrationRegistry();
    }
    return registry;
}
