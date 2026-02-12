// framework/adapters/db/src/migrations/registry.ts
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
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
 * Supports two layouts:
 *
 * 1. Flat files (current):  010_bootstrap.sql, 020_meta_tables.sql, ...
 *    Files are named NNN_name.sql and sorted by the numeric prefix.
 *
 * 2. Subdirectory layout (legacy):
 *    00_bootstrap/001_create_schemas.sql, 10_meta/001_meta_entity.sql, ...
 *    Directories are named NN_group, files within as NNN_name.sql.
 *
 * The registry auto-detects which layout is present. If flat files exist they
 * take precedence; otherwise it falls back to subdirectories.
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
     * Auto-detects flat-file vs subdirectory layout.
     */
    private loadMigrations(): void {
        const sqlDir = join(__dirname, "../sql");

        const entries = readdirSync(sqlDir, { withFileTypes: true });

        // Detect flat SQL files (NNN_name.sql)
        const flatFiles = entries
            .filter((e) => e.isFile() && /^\d{3}_.+\.sql$/.test(e.name))
            .map((e) => e.name)
            .sort();

        if (flatFiles.length > 0) {
            this.loadFlatMigrations(sqlDir, flatFiles);
        } else {
            this.loadSubdirectoryMigrations(sqlDir, entries);
        }
    }

    /** Load from flat NNN_name.sql files. */
    private loadFlatMigrations(sqlDir: string, files: string[]): void {
        for (const fileName of files) {
            const filePath = join(sqlDir, fileName);
            const sql = readFileSync(filePath, "utf-8");

            const match = fileName.match(/^(\d{3})_(.+)\.sql$/);
            if (!match) continue;

            const [, fileNumber, name] = match;
            const id = fileName.replace(".sql", "");

            this.migrations.push({
                id,
                name,
                directory: "sql",
                fileNumber,
                sql,
            });
        }
    }

    /** Load from numbered subdirectories (legacy layout). */
    private loadSubdirectoryMigrations(
        sqlDir: string,
        entries: import("node:fs").Dirent[],
    ): void {
        const directories = entries
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name)
            .filter((name) => /^\d{2}_/.test(name))
            .sort();

        for (const dir of directories) {
            const dirPath = join(sqlDir, dir);
            const files = readdirSync(dirPath)
                .filter((f) => f.endsWith(".sql"))
                .sort();

            for (const file of files) {
                const filePath = join(dirPath, file);
                const sql = readFileSync(filePath, "utf-8");

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
