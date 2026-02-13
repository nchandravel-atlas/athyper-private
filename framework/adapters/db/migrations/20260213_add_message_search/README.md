# Migration: Add Message Search (Full-Text Search)

**Date**: 2026-02-13
**Type**: Schema Enhancement

## Overview

Adds Postgres Full-Text Search (FTS) capability to the `core.message` table using tsvector and GIN indexes.

## Changes

### 1. New Column
- `body_tsv` (tsvector) - Generated column containing tokenized searchable text

### 2. Indexes Created
- `idx_message_fts` - GIN index on `body_tsv` for fast full-text queries
- `idx_message_tenant_fts` - Compound index on `(tenant_id, body_tsv)` for tenant-scoped searches

### 3. Trigger Function
- `message_body_tsv_trigger()` - Automatically updates `body_tsv` when message body changes
- Uses English text search configuration by default

### 4. Trigger
- `message_body_tsv_update` - Fires BEFORE INSERT OR UPDATE on message body

## Performance Characteristics

- **GIN Index**: Provides fast full-text search but slower inserts (acceptable for messaging)
- **Auto-update**: Trigger ensures tsvector stays in sync with message body
- **Tenant Isolation**: Compound index supports efficient tenant-scoped searches
- **Language**: English text search configuration (supports stemming, stop words)

## Search Query Examples

```sql
-- Search for messages containing "important meeting"
SELECT *
FROM "core"."message"
WHERE "tenant_id" = 'tenant-123'
  AND "body_tsv" @@ to_tsquery('english', 'important & meeting')
  AND "deleted_at" IS NULL
ORDER BY ts_rank("body_tsv", to_tsquery('english', 'important & meeting')) DESC
LIMIT 50;

-- Search with phrase
SELECT *
FROM "core"."message"
WHERE "tenant_id" = 'tenant-123'
  AND "body_tsv" @@ phraseto_tsquery('english', 'project deadline')
  AND "deleted_at" IS NULL;

-- Search with OR logic
SELECT *
FROM "core"."message"
WHERE "tenant_id" = 'tenant-123'
  AND "body_tsv" @@ to_tsquery('english', 'urgent | important')
  AND "deleted_at" IS NULL;
```

## Rollback

```sql
DROP TRIGGER IF EXISTS "message_body_tsv_update" ON "core"."message";
DROP FUNCTION IF EXISTS "core"."message_body_tsv_trigger"();
DROP INDEX IF EXISTS "core"."idx_message_tenant_fts";
DROP INDEX IF EXISTS "core"."idx_message_fts";
ALTER TABLE "core"."message" DROP COLUMN IF EXISTS "body_tsv";
```

## Testing Checklist

- [ ] Run migration successfully
- [ ] Verify GIN indexes created
- [ ] Test INSERT - tsvector auto-populated
- [ ] Test UPDATE - tsvector auto-updated
- [ ] Test search query performance
- [ ] Verify tenant isolation in search results

## Notes

- **Language Support**: Currently uses 'english' configuration. For multi-language support, consider storing user's language preference and using different configurations.
- **Ranking**: Use `ts_rank()` or `ts_rank_cd()` for relevance ranking.
- **Highlighting**: Use `ts_headline()` to show search result snippets with highlighted terms.
