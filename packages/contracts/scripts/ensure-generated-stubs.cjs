/**
 * Creates empty stub files for prisma-generated modules if they don't exist.
 * This allows `@athyper/contracts` to build on a fresh clone before
 * `pnpm athyper:codegen` has been run.
 */
const fs = require("fs");
const path = require("path");

const STUB = "// Auto-created by athyper-codegen (fallback)\nexport {};\n";

for (const sub of ["prisma/zod", "prisma/kysely"]) {
  const dir = path.join(__dirname, "..", "src", "generated", sub);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index.ts");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, STUB);
    console.log(`[contracts] Created stub: ${path.relative(path.join(__dirname, ".."), file)}`);
  }
}
