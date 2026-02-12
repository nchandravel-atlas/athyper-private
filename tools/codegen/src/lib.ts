/**
 * Shared utilities for athyper-codegen CLI tools.
 *
 * Extracted so both `index.ts` (codegen) and `publish.ts` (db:publish)
 * can reuse the same helpers without duplication.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Repository root (tools/codegen → ../../..) */
export const REPO_ROOT = path.resolve(__dirname, "../../..");

/** Framework DB adapter package */
export const DB_DIR = path.join(REPO_ROOT, "framework", "adapters", "db");

/** Prisma schema file */
export const SCHEMA_PATH = path.join(DB_DIR, "src", "prisma", "schema.prisma");

/** Prisma migrations directory */
export const MIGRATIONS_DIR = path.join(DB_DIR, "src", "prisma", "migrations");

/** Generated output root inside the DB adapter */
export const DB_GEN_DIR = path.join(DB_DIR, "src", "generated");

/** Contracts destination for generated artifacts */
export const CONTRACTS_GEN_DIR = path.join(
  REPO_ROOT,
  "packages",
  "contracts",
  "generated",
  "prisma",
);

/** Source paths for generated artifacts */
export const ZOD_SRC = path.join(DB_GEN_DIR, "zod");
export const KYSELY_SRC = path.join(DB_GEN_DIR, "kysely");

/** Destination paths in contracts */
export const ZOD_DST = path.join(CONTRACTS_GEN_DIR, "zod");
export const KYSELY_DST = path.join(CONTRACTS_GEN_DIR, "kysely");

// ---------------------------------------------------------------------------
// Process helpers
// ---------------------------------------------------------------------------

/**
 * Run a command and stream stdout/stderr to the parent process.
 * Resolves on exit code 0, rejects otherwise.
 */
export function run(
  cmd: string,
  cmdArgs: string[],
  opts: object = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...opts,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(`${cmd} ${cmdArgs.join(" ")} failed with code ${code}`),
        );
    });
  });
}

/**
 * Run a command and capture stdout as a string.
 * Resolves with stdout on exit code 0, rejects otherwise.
 */
export function runCapture(
  cmd: string,
  cmdArgs: string[],
  opts: object = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, {
      stdio: ["inherit", "pipe", "pipe"],
      shell: process.platform === "win32",
      ...opts,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `Exit code ${code}`));
    });
  });
}

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

/** Create a directory (recursive). */
export async function ensureDir(p: string): Promise<void> {
  await mkdir(p, { recursive: true });
}

/** Remove a path if it exists. */
export async function safeRm(p: string): Promise<void> {
  if (existsSync(p)) await rm(p, { recursive: true, force: true });
}

/** Check if a directory exists and contains at least one entry. */
export async function dirHasFiles(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    if (!s.isDirectory()) return false;
    const items = await readdir(p);
    return items.length > 0;
  } catch {
    return false;
  }
}

/**
 * Copy a generated folder to its destination, replacing whatever was there.
 * Throws if the source is missing or empty.
 */
export async function syncFolder(src: string, dst: string): Promise<void> {
  if (!(await dirHasFiles(src))) {
    throw new Error(
      `Expected generated folder missing or empty: ${src}\nDid prisma generators run and output to the expected path?`,
    );
  }
  await safeRm(dst);
  await ensureDir(path.dirname(dst));
  await cp(src, dst, { recursive: true });
}

/**
 * Write stable re-export entry-points in packages/contracts so the rest
 * of the monorepo can import generated artifacts with a predictable path.
 */
export async function writeEntryPoints(): Promise<void> {
  const genRoot = path.join(
    REPO_ROOT,
    "packages",
    "contracts",
    "generated",
  );
  await ensureDir(path.join(genRoot, "prisma"));

  // Zod entrypoint
  const zodIndex = path.join(genRoot, "prisma", "zod", "index.ts");
  if (!existsSync(zodIndex)) {
    await writeFile(
      zodIndex,
      `// Auto-created by athyper-codegen (fallback)\nexport {};\n`,
      "utf8",
    );
  }

  // Kysely entrypoint
  const kyselyIndex = path.join(genRoot, "prisma", "kysely", "index.ts");
  if (!existsSync(kyselyIndex)) {
    await writeFile(
      kyselyIndex,
      `// Auto-created by athyper-codegen (fallback)\nexport {};\n`,
      "utf8",
    );
  }

  // Contracts side re-export
  const contractsGenIndex = path.join(
    REPO_ROOT,
    "packages",
    "contracts",
    "src",
    "generated",
    "index.ts",
  );
  await ensureDir(path.dirname(contractsGenIndex));
  await writeFile(
    contractsGenIndex,
    `// Auto-generated by athyper-codegen\nexport * as prismaZod from "../../generated/prisma/zod/index.js";\nexport * as prismaKysely from "../../generated/prisma/kysely/index.js";\n`,
    "utf8",
  );
}
