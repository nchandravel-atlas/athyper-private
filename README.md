# Athyper Codegen Kit (Prisma → Zod + Kysely → Contracts)

This kit gives you a **repeatable, monorepo-friendly** automation pipeline.

## Canonical input
- `framework/adapters/db/prisma/schema.prisma`

## Generated outputs
- Zod schemas → `packages/contracts/generated/prisma/zod/*`
- Kysely DB types → `packages/contracts/generated/prisma/kysely/*`

## What this package does
- Runs `prisma generate` in `framework/adapters/db`
- Copies generator outputs into `packages/contracts/generated/prisma/...`
- Maintains a stable public import surface:
  - `@athyper/contracts/generated/prisma-zod`
  - `@athyper/contracts/generated/prisma-kysely`

## Install (drop into repo)
Copy these folders into your repo root:
- `tools/codegen`
- `packages/contracts` (merge with your existing one)

Then ensure root `pnpm-workspace.yaml` includes:
- `tools/*`
- `packages/*`
- `framework/*/*`

## One-command pipeline
Add to repo-root `package.json`:

```json
{
  "scripts": {
    "athyper:codegen": "pnpm -C tools/codegen run codegen",
    "athyper:codegen:watch": "pnpm -C tools/codegen run codegen:watch"
  }
}
```

Run:

```bash
pnpm athyper:codegen
```

## Prisma generators to add
In `framework/adapters/db/prisma/schema.prisma`, add generators similar to:

```prisma
generator client {
  provider = "prisma-client-js"
}

generator zod {
  provider = "prisma-zod-generator"
  output   = "../generated/zod"
}

generator kysely {
  provider = "prisma-kysely"
  output   = "../generated/kysely"
}
```

Notes:
- If you prefer a different generator package, keep the same output folders and the kit still works.
- `../generated/*` is under `framework/adapters/db/generated/*`.

## Contracts exports
This kit provides `packages/contracts/package.json` exports for the generated artifacts.

## Recommended rules
- `packages/contracts/generated/**` is *generated*. Commit it only if you want UI builds without running codegen.
- Do not import from generator internal files via deep paths. Only use exported entrypoints.

