# Migration: add_message_threading

**Date**: 2026-02-13
**Type**: Schema Addition
**Impact**: Adds threading support to messages (backward compatible)

## Overview

Adds conversation threading support by introducing a parent-child relationship between messages.

## Changes

### Column Added (1)

- **`core.message.parent_message_id`** - UUID (nullable)
  - References `core.message.id`
  - NULL for root messages
  - SET NULL on parent delete (preserves thread if parent deleted)

### Indexes Created (2)

1. **`idx_message_parent_thread`** - Optimizes thread reply queries
   - Partial index: Only thread replies (WHERE parent_message_id IS NOT NULL)
   - Excludes soft-deleted messages
   - Columns: (tenant_id, parent_message_id, created_at DESC)

2. **`idx_message_root`** - Optimizes root message queries
   - Partial index: Only root messages (WHERE parent_message_id IS NULL)
   - Excludes soft-deleted messages
   - Columns: (tenant_id, conversation_id, created_at DESC)

### Foreign Keys (1)

- **`message_parent_message_id_fkey`**
  - References: `core.message.id`
  - ON DELETE: SET NULL (preserves thread if parent deleted)

## How to Apply

### Option 1: Using Prisma Migrate (Recommended)

```bash
cd framework/adapters/db
npx prisma migrate dev --name add_message_threading
```

### Option 2: Manual SQL Execution

```bash
psql -h localhost -U postgres -d your_database -f framework/adapters/db/migrations/20260213_add_message_threading/migration.sql
```

### Option 3: Production Deployment

```bash
cd framework/adapters/db
npx prisma migrate deploy
```

## Rollback

To rollback this migration:

```sql
-- Drop indexes
DROP INDEX IF EXISTS "core"."idx_message_parent_thread";
DROP INDEX IF EXISTS "core"."idx_message_root";

-- Drop foreign key
ALTER TABLE "core"."message"
    DROP CONSTRAINT IF EXISTS "message_parent_message_id_fkey";

-- Drop column
ALTER TABLE "core"."message"
    DROP COLUMN IF EXISTS "parent_message_id";
```

## Verification

After applying, verify the schema:

```sql
-- Verify column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'core'
  AND table_name = 'message'
  AND column_name = 'parent_message_id';

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'core'
  AND tablename = 'message'
  AND indexname IN ('idx_message_parent_thread', 'idx_message_root');

-- Verify foreign key
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'core'
  AND tc.table_name = 'message'
  AND kcu.column_name = 'parent_message_id';
```

## Performance Notes

- **Partial indexes** reduce index size by excluding:
  - Soft-deleted messages (`deleted_at IS NULL`)
  - Root messages from thread index
  - Thread replies from root index
- **SET NULL on parent delete** prevents cascading deletes
  - Preserves thread structure even if parent is deleted
  - Thread replies become orphaned but remain accessible
- **Descending time order** optimizes "most recent first" queries

## Usage Examples

### Create threaded reply
```sql
INSERT INTO core.message (
    id, tenant_id, conversation_id, sender_id, body,
    parent_message_id, created_at
)
VALUES (
    gen_random_uuid(), 'tenant-1', 'conv-1', 'user-1', 'This is a reply',
    'msg-parent-id', NOW()
);
```

### Query thread replies
```sql
SELECT *
FROM core.message
WHERE tenant_id = 'tenant-1'
  AND parent_message_id = 'msg-parent-id'
  AND deleted_at IS NULL
ORDER BY created_at ASC;
```

### Query root messages only
```sql
SELECT *
FROM core.message
WHERE tenant_id = 'tenant-1'
  AND conversation_id = 'conv-1'
  AND parent_message_id IS NULL
  AND deleted_at IS NULL
ORDER BY created_at DESC;
```

### Count thread replies
```sql
SELECT COUNT(*)
FROM core.message
WHERE tenant_id = 'tenant-1'
  AND parent_message_id = 'msg-parent-id'
  AND deleted_at IS NULL;
```

## Next Steps

After applying this migration:

1. Update Prisma schema to include `parent_message_id`
2. Regenerate Kysely types: `npx prisma generate`
3. Update domain models to support threading
4. Update repositories with thread-aware queries
5. Update services and API handlers
6. Add thread UI components
