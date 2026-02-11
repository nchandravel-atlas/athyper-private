#!/usr/bin/env node
/**
 * athyper-codegen CLI entry point
 *
 * This tool synchronizes Prisma-generated artifacts from framework/adapters/db
 * into packages/contracts for consumption by the rest of the monorepo.
 *
 * Usage:
 *   pnpm codegen         - Run once
 *   pnpm codegen:watch   - Watch schema.prisma for changes
 */

import {
  CONTRACTS_GEN_DIR,
  DB_DIR,
  KYSELY_DST,
  KYSELY_SRC,
  SCHEMA_PATH,
  ZOD_DST,
  ZOD_SRC,
  ensureDir,
  run,
  syncFolder,
  writeEntryPoints,
} from "./lib.js";

const args = new Set(process.argv.slice(2));
const WATCH = args.has("--watch");

async function mainOnce(): Promise<void> {
  console.log("\n[Athyper] Running prisma generate...");
  await run("pnpm", ["prisma", "generate"], { cwd: DB_DIR });

  console.log("\n[Athyper] Sync generated artifacts into contracts...");
  await ensureDir(CONTRACTS_GEN_DIR);
  await syncFolder(ZOD_SRC, ZOD_DST);
  await syncFolder(KYSELY_SRC, KYSELY_DST);

  console.log("\n[Athyper] Writing stable entrypoints...");
  await writeEntryPoints();

  console.log("\n[Athyper] Done: contracts generated artifacts updated.");
}

async function main(): Promise<void> {
  if (!WATCH) {
    await mainOnce();
  } else {
    console.log(`[Athyper] Watch mode: ${SCHEMA_PATH}`);
    await mainOnce();

    const fsWatch = await import("node:fs");
    let timer: NodeJS.Timeout | null = null;
    fsWatch.watch(SCHEMA_PATH, () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        mainOnce().catch((e) => console.error(e));
      }, 250);
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
