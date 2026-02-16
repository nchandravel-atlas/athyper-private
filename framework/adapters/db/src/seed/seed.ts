#!/usr/bin/env node
// framework/adapters/db/src/seed/seed.ts
//
// Database provisioning script.
// Executes all numbered SQL files in src/sql/ against a direct Postgres connection.
//
// Usage:
//   npx tsx src/seed/seed.ts                  # Run all (DDL + seed)
//   npx tsx src/seed/seed.ts --ddl-only       # DDL only (010–120), skip seed
//   npx tsx src/seed/seed.ts --seed-only      # Seed only (200_seed_all.sql)
//   npx tsx src/seed/seed.ts --reset          # Drop schemas + re-provision everything
//   npx tsx src/seed/seed.ts --status         # Show what has/hasn't been run
//   npx tsx src/seed/seed.ts --force          # Re-run even if checksum unchanged
//
// Environment variables:
//   DATABASE_ADMIN_URL  — Direct Postgres connection string (required)
//                         NOT PgBouncer. DDL needs a direct connection.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SqlFile = {
    /** Numeric prefix, e.g. "010" */
    prefix: string;
    /** File name without extension, e.g. "010_bootstrap" */
    name: string;
    /** Full file name, e.g. "010_bootstrap.sql" */
    fileName: string;
    /** Absolute path */
    path: string;
    /** Whether this is seed data (prefix >= 200) */
    isSeed: boolean;
};

type ExecutionResult = {
    name: string;
    durationMs: number;
    executedAt: Date;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(data: Record<string, unknown>): void {
    console.log(JSON.stringify(data));
}

function logError(data: Record<string, unknown>): void {
    console.error(JSON.stringify(data));
}

/** Discover SQL files in src/sql/, sorted by numeric prefix. */
function discoverSqlFiles(): SqlFile[] {
    const sqlDir = join(__dirname, "../sql");

    const files = readdirSync(sqlDir)
        .filter((f) => /^\d{3}_.+\.sql$/.test(f))
        .sort();

    return files.map((fileName) => {
        const prefix = fileName.slice(0, 3);
        const name = fileName.replace(/\.sql$/, "");
        return {
            prefix,
            name,
            fileName,
            path: join(sqlDir, fileName),
            isSeed: parseInt(prefix, 10) >= 200,
        };
    });
}

/** Ensure the provisioning tracking table exists. */
async function ensureProvisionTable(client: pg.Client): Promise<void> {
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.schema_provisions (
            id          serial primary key,
            file_name   text unique not null,
            checksum    text not null,
            executed_at timestamptz not null default now()
        )
    `);
}

/** Simple djb2 hash for change detection (not crypto). */
function checksum(sql: string): string {
    let hash = 5381;
    for (let i = 0; i < sql.length; i++) {
        hash = ((hash << 5) + hash + sql.charCodeAt(i)) | 0;
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
}

/** Get previously executed provisions. */
async function getExecuted(client: pg.Client): Promise<Map<string, string>> {
    const result = await client.query<{ file_name: string; checksum: string }>(
        "SELECT file_name, checksum FROM public.schema_provisions ORDER BY id"
    );
    return new Map(result.rows.map((r) => [r.file_name, r.checksum]));
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function runProvision(
    connectionString: string,
    opts: { ddlOnly: boolean; seedOnly: boolean; force: boolean },
): Promise<void> {
    const allFiles = discoverSqlFiles();

    let files: SqlFile[];
    if (opts.seedOnly) {
        files = allFiles.filter((f) => f.isSeed);
    } else if (opts.ddlOnly) {
        files = allFiles.filter((f) => !f.isSeed);
    } else {
        files = allFiles;
    }

    if (files.length === 0) {
        log({ msg: "provision_noop", reason: "no matching SQL files" });
        return;
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        await ensureProvisionTable(client);

        const executed = await getExecuted(client);
        const results: ExecutionResult[] = [];

        log({
            msg: "provision_start",
            totalFiles: files.length,
            alreadyExecuted: executed.size,
            mode: opts.seedOnly ? "seed_only" : opts.ddlOnly ? "ddl_only" : "full",
        });

        for (const file of files) {
            const sql = readFileSync(file.path, "utf-8");
            const hash = checksum(sql);
            const prev = executed.get(file.name);

            // Skip if already executed with same checksum (unless forced)
            if (prev === hash && !opts.force) {
                log({ msg: "provision_skip", file: file.name, reason: "already_executed" });
                continue;
            }

            const startTime = Date.now();
            log({ msg: "provision_executing", file: file.name, changed: prev != null && prev !== hash });

            try {
                // Seed files have their own begin/commit, DDL files are idempotent.
                // Execute the SQL directly — no wrapping transaction needed.
                await client.query(sql);

                // Track execution
                await client.query(
                    `INSERT INTO public.schema_provisions (file_name, checksum, executed_at)
                     VALUES ($1, $2, now())
                     ON CONFLICT (file_name) DO UPDATE SET
                       checksum = EXCLUDED.checksum,
                       executed_at = now()`,
                    [file.name, hash],
                );

                const durationMs = Date.now() - startTime;
                results.push({ name: file.name, durationMs, executedAt: new Date() });

                log({ msg: "provision_success", file: file.name, durationMs });
            } catch (err) {
                logError({
                    msg: "provision_failed",
                    file: file.name,
                    error: String(err),
                });
                throw new Error(`Provision failed at ${file.name}: ${String(err)}`);
            }
        }

        log({
            msg: "provision_complete",
            executed: results.length,
            totalMs: results.reduce((sum, r) => sum + r.durationMs, 0),
        });
    } finally {
        await client.end();
    }
}

async function runReset(connectionString: string): Promise<void> {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        log({ msg: "reset_start" });

        // Drop schemas in reverse dependency order
        const schemas = ["notify", "ui", "collab", "doc", "ent", "wf", "sec", "audit", "meta", "ref", "core"];
        for (const schema of schemas) {
            await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
            log({ msg: "reset_drop_schema", schema });
        }

        // Drop tracking tables
        await client.query("DROP TABLE IF EXISTS public.schema_provisions CASCADE");
        await client.query("DROP TABLE IF EXISTS public.migrations CASCADE");

        log({ msg: "reset_complete" });
    } finally {
        await client.end();
    }
}

async function runStatus(connectionString: string): Promise<void> {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        await ensureProvisionTable(client);

        const executed = await getExecuted(client);
        const allFiles = discoverSqlFiles();

        console.log("\n  Database Provision Status\n");
        console.log("  %-30s  %-10s  %s", "File", "Status", "Checksum");
        console.log("  " + "-".repeat(60));

        for (const file of allFiles) {
            const sql = readFileSync(file.path, "utf-8");
            const hash = checksum(sql);
            const prev = executed.get(file.name);

            let status: string;
            if (!prev) {
                status = "PENDING";
            } else if (prev !== hash) {
                status = "CHANGED";
            } else {
                status = "OK";
            }

            console.log("  %-30s  %-10s  %s", file.name, status, hash);
        }

        const pending = allFiles.filter((f) => !executed.has(f.name)).length;
        const changed = allFiles.filter((f) => {
            const sql = readFileSync(f.path, "utf-8");
            const prev = executed.get(f.name);
            return prev != null && prev !== checksum(sql);
        }).length;

        console.log(
            "\n  Total: %d | OK: %d | Pending: %d | Changed: %d\n",
            allFiles.length,
            allFiles.length - pending - changed,
            pending,
            changed,
        );
    } finally {
        await client.end();
    }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    const connectionString = process.env.DATABASE_ADMIN_URL;
    if (!connectionString) {
        logError({
            msg: "provision_error",
            error: "DATABASE_ADMIN_URL environment variable is required",
        });
        console.error("\n  Set DATABASE_ADMIN_URL to a direct Postgres connection (not PgBouncer).\n");
        console.error("  Example: DATABASE_ADMIN_URL=postgres://user:pass@localhost:5432/athyper\n");
        process.exit(1);
    }

    const ddlOnly = args.includes("--ddl-only");
    const seedOnly = args.includes("--seed-only");
    const reset = args.includes("--reset");
    const force = args.includes("--force");
    const status = args.includes("--status");

    if (ddlOnly && seedOnly) {
        logError({ msg: "provision_error", error: "--ddl-only and --seed-only are mutually exclusive" });
        process.exit(1);
    }

    try {
        if (status) {
            await runStatus(connectionString);
            return;
        }

        if (reset) {
            await runReset(connectionString);
        }

        await runProvision(connectionString, { ddlOnly, seedOnly, force });
    } catch (err) {
        logError({ msg: "provision_fatal", error: String(err) });
        process.exit(1);
    }
}

main();
