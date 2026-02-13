# Migration: add_messaging_system

**Date**: 2026-02-13
**Type**: Schema Addition
**Impact**: None (new tables only, no data changes)

## Overview

Adds database schema for the messaging system (Direct Messages & Group Conversations).

## Changes

### New Tables (4)

1. **`core.conversation`** - Container for direct or group messaging
2. **`core.conversation_participant`** - Join table with read tracking
3. **`core.message`** - Individual messages within conversations
4. **`core.message_delivery`** - Per-recipient delivery and read tracking

### Indexes Created (13)

- **conversation**: 2 indexes (tenant+type, tenant+time)
- **conversation_participant**: 3 indexes (user, conv, unread)
- **message**: 3 indexes (conversation+time, sender+time, client_id)
- **message_delivery**: 3 indexes (unread, time, message)
- **unique constraints**: 3 (participant uniqueness, message idempotency, delivery uniqueness)

### Foreign Keys (12)

All tables properly reference:
- `core.tenant` (CASCADE delete for tenant isolation)
- `core.principal` (CASCADE delete for users)
- Parent tables (conversation, message)

## How to Apply

### Option 1: Using Prisma Migrate (Recommended)

When your database is running:

```bash
cd framework/adapters/db
npx prisma migrate dev --name add_messaging_system
```

This will:
- Create the migration in `migrations/` directory
- Apply it to your development database
- Regenerate Prisma Client

### Option 2: Manual SQL Execution

If you need to apply manually:

```bash
# Connect to your PostgreSQL database
psql -h localhost -U postgres -d your_database

# Execute the migration
\i framework/adapters/db/migrations/20260213_add_messaging_system/migration.sql
```

### Option 3: Using Prisma Migrate Deploy (Production)

For production deployments:

```bash
cd framework/adapters/db
npx prisma migrate deploy
```

## Rollback

To rollback this migration, run:

```sql
-- Drop tables in reverse order (respects foreign keys)
DROP TABLE IF EXISTS "core"."message_delivery" CASCADE;
DROP TABLE IF EXISTS "core"."message" CASCADE;
DROP TABLE IF EXISTS "core"."conversation_participant" CASCADE;
DROP TABLE IF EXISTS "core"."conversation" CASCADE;
```

## Verification

After applying, verify the schema:

```bash
npx prisma db pull
npx prisma generate
```

Or query the database:

```sql
-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'core'
  AND table_name IN ('conversation', 'conversation_participant', 'message', 'message_delivery');

-- Verify indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'core'
  AND tablename IN ('conversation', 'conversation_participant', 'message', 'message_delivery')
ORDER BY tablename, indexname;

-- Verify foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'core'
  AND tc.table_name IN ('conversation', 'conversation_participant', 'message', 'message_delivery')
ORDER BY tc.table_name, kcu.column_name;
```

## Performance Notes

- All partial indexes use `WHERE` clauses to exclude soft-deleted records
- Time-based indexes use `DESC` for "most recent first" queries
- Composite indexes optimize tenant-scoped queries
- Foreign key CASCADE deletes ensure cleanup when conversations/users are deleted

## Next Steps

After applying this migration:

1. Verify Kysely types are regenerated: `npx prisma generate`
2. Proceed with Phase B2: Domain Models & Policies
3. Implement persistence repositories (Phase B3)
