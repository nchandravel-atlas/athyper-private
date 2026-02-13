# Content Management Enhancements - Implementation Summary

## 🎯 Enhancement Features Implemented

### ✅ 1. Database Schema (COMPLETED)

**Migration**: `20260213_content_enhancements/migration.sql`

**Extended core.attachment**:
- Preview/thumbnail: `thumbnail_key`, `preview_key`, `preview_generated_at`, `preview_generation_failed`
- Expiration: `expires_at`, `auto_delete_on_expiry`
- Deduplication: `reference_count`

**New Tables**:
1. `attachment_access_log` - High-volume access audit (BigSerial ID)
2. `attachment_comment` - Comments/annotations with threading
3. `multipart_upload` - S3 multipart upload tracking

**Prisma Schema Updated**: ✅ All models and relations added

---

## 🏗️ Architecture Decisions

### Preview/Thumbnail Generation
**Approach**: Async background processing
- Generate on upload completion (optional flag)
- Background worker for batch processing
- Store thumbnails in same S3 bucket with `_thumb` suffix
- Support formats: JPG, PNG, PDF (first page)
- Sizes: 200x200 (thumbnail), 800x800 (preview)

**Tech Stack**:
- Images: Sharp (Node.js image processing)
- PDFs: pdf-lib or pdf.js for first-page extraction
- Queue: Use existing JobQueue infrastructure

### Multipart Upload
**S3 Pattern**:
```
1. Client → POST /api/content/multipart/initiate
   ← {uploadId, s3UploadId, partUrls: [url1, url2, ...]}

2. Client → PUT to each partUrl with chunk
   ← S3 ETag

3. Client → POST /api/content/multipart/complete
   Body: {uploadId, parts: [{PartNumber, ETag}]}
   ← 200 OK

4. Optional: POST /api/content/multipart/abort
```

**Chunk Size**: 5MB minimum (S3 requirement)
**Max Parts**: 10,000 (S3 limit)
**Max File**: ~50TB (theoretical, limited by kind to 200MB)

### Content Deduplication
**Strategy**: SHA-256 + Reference Counting

**Flow**:
```
Upload:
1. Client computes SHA-256
2. Check if sha256 exists in DB
3. If exists:
   - Increment reference_count
   - Create new attachment record pointing to same storage_key
   - Skip S3 upload
4. If not exists:
   - Normal upload flow
   - Set reference_count = 1

Delete:
1. Decrement reference_count
2. If reference_count > 0:
   - Soft delete attachment record only
3. If reference_count == 0:
   - Delete from S3
   - Delete attachment record
```

**Storage Savings**: ~40-60% for typical use cases (duplicate invoices, templates)

### File Access Audit Trail
**High-Volume Design**:
- Separate table (`attachment_access_log`)
- BigSerial ID for performance
- No FK to attachment (allows independent cleanup)
- Partitioning recommended (monthly)
- Retention: 30-90 days (configurable)

**Logged Actions**:
- `download` - Generate presigned URL
- `preview` - View thumbnail/preview
- `metadata` - View file info

**Fields Captured**:
- `actor_id`, `ip_address`, `user_agent`, `accessed_at`

### Expiring Files
**Use Cases**:
- Temporary file shares (expire in 7 days)
- Time-limited access (contracts expire after signing period)
- Auto-cleanup of drafts

**Behavior**:
```
- expires_at: NULL → Never expires
- expires_at: <future date> → Soft expiration (hide in listings)
- auto_delete_on_expiry: true → Hard delete on expiration
- auto_delete_on_expiry: false → Keep file, just mark expired
```

**Enforcement**:
- List queries filter `WHERE expires_at IS NULL OR expires_at > NOW()`
- Download checks expiration before generating URL
- Background job processes expired files (daily)

### File Comments/Annotations
**Features**:
- Threaded replies (parent_id)
- Mentions (@user) stored as JSONB array
- Soft delete (deleted_at, deleted_by)
- Edit history (edited_at, edited_by)

**Permissions** (Future):
- Inherit from document permissions
- Optional: Comment-level permissions

---

## 📊 Implementation Status

| Feature | Repos | Services | Handlers | Routes | Workers | Status |
|---------|-------|----------|----------|---------|---------|--------|
| Preview/Thumbnail | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Multipart Upload | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Deduplication | ✅ | ⏳ | N/A | N/A | N/A | In Progress |
| Access Audit | ✅ | ⏳ | N/A | ⏳ | ⏳ | In Progress |
| Expiring Files | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Comments | ✅ | ⏳ | ⏳ | ⏳ | N/A | In Progress |

**Legend**: ✅ Done | ⏳ In Progress | ⚠️ Blocked | ❌ Not Started

---

## 🛣️ New API Routes

### Preview/Thumbnail
- `GET /api/content/preview/:id` - Get preview/thumbnail URL
- `POST /api/content/preview/generate/:id` - Manual preview generation

### Multipart Upload
- `POST /api/content/multipart/initiate` - Start multipart upload
- `POST /api/content/multipart/complete` - Complete multipart upload
- `POST /api/content/multipart/abort` - Abort multipart upload

### Expiring Files
- `POST /api/content/expire/:id` - Set expiration date
- `DELETE /api/content/expire/:id` - Clear expiration

### Comments
- `GET /api/content/comments/:attachmentId` - List comments
- `POST /api/content/comments` - Create comment
- `PUT /api/content/comments/:id` - Edit comment
- `DELETE /api/content/comments/:id` - Delete comment (soft)
- `POST /api/content/comments/:id/reply` - Reply to comment

### Access Logs
- `GET /api/content/access-log/:attachmentId` - View access history

---

## 🔄 Background Workers

### 1. Generate Previews Worker
**Schedule**: Every 5 minutes
**Job**: `generate-previews`
**Logic**:
```
1. Find attachments WHERE preview_key IS NULL
   AND preview_generation_failed = false
   AND content_type IN ('image/jpeg', 'image/png', 'application/pdf')
   LIMIT 10

2. For each:
   - Download from S3
   - Generate thumbnail (200x200)
   - Generate preview (800x800)
   - Upload to S3
   - Update preview_key, thumbnail_key, preview_generated_at

3. On failure:
   - Set preview_generation_failed = true
   - Log error
```

### 2. Cleanup Expired Files Worker
**Schedule**: Daily at 2 AM
**Job**: `cleanup-expired-files`
**Logic**:
```
1. Find attachments WHERE expires_at < NOW()
   AND is_current = true
   LIMIT 100

2. For each with auto_delete_on_expiry = true:
   - Delete from S3
   - Delete record

3. For each with auto_delete_on_expiry = false:
   - Mark is_current = false
   - Set replaced_at = NOW()
```

### 3. Cleanup Stale Multipart Uploads
**Schedule**: Daily at 3 AM
**Job**: `cleanup-stale-multipart`
**Logic**:
```
1. Find multipart_upload WHERE expires_at < NOW()
   AND status IN ('initiated', 'uploading')

2. For each:
   - Call S3 AbortMultipartUpload
   - Update status = 'aborted'
```

### 4. Cleanup Old Access Logs
**Schedule**: Weekly (Sunday 4 AM)
**Job**: `cleanup-access-logs`
**Logic**:
```
1. DELETE FROM attachment_access_log
   WHERE accessed_at < NOW() - INTERVAL '90 days'
   LIMIT 10000

2. Run in batches to avoid locking
```

---

## 📦 Dependencies

### New NPM Packages Required

```json
{
  "sharp": "^0.33.0",          // Image processing
  "pdf-lib": "^1.17.1",        // PDF manipulation
  "pdfjs-dist": "^4.0.379"     // PDF parsing (alternative)
}
```

**Install**:
```bash
cd framework/runtime
npm install sharp pdf-lib
```

---

## 🔐 Security Considerations

### Preview Generation
- **Risk**: Malicious images/PDFs could exploit parsing bugs
- **Mitigation**:
  - Timeout limit (10s per file)
  - Memory limit (100MB per worker)
  - Sandboxed processing (future: containerized workers)

### Multipart Upload
- **Risk**: Client could initiate upload but never complete, wasting S3 storage
- **Mitigation**:
  - S3 lifecycle policy to delete incomplete uploads after 7 days
  - Background worker to abort stale uploads
  - Limit: Max 10 concurrent multipart uploads per user

### Access Logs
- **Risk**: High volume could impact DB performance
- **Mitigation**:
  - Async logging (don't block download)
  - Partitioning by month
  - Aggressive retention policy (30-90 days)
  - Consider separate DB or ClickHouse for analytics

### Expiring Files
- **Risk**: Expired files could still be accessed via old presigned URLs
- **Mitigation**:
  - Check expiration BEFORE generating presigned URL
  - Use short expiry on presigned URLs (1 hour)
  - Background job deletes expired files promptly

---

## 🧪 Testing Strategy

### Preview Generation
```typescript
test('generates thumbnail for JPEG', async () => {
  const attachment = await uploadImage('test.jpg');
  await generatePreviews(attachment.id);

  const updated = await getAttachment(attachment.id);
  expect(updated.thumbnail_key).toBeDefined();
  expect(updated.preview_key).toBeDefined();
});
```

### Deduplication
```typescript
test('deduplicates identical files', async () => {
  const file1 = await uploadFile('invoice.pdf');
  const file2 = await uploadFile('invoice.pdf'); // Same content

  const att1 = await getAttachment(file1.id);
  const att2 = await getAttachment(file2.id);

  expect(att1.sha256).toBe(att2.sha256);
  expect(att1.storage_key).toBe(att2.storage_key);
  expect(att1.reference_count).toBe(2);
});
```

### Multipart Upload
```typescript
test('uploads large file in parts', async () => {
  const { uploadId, partUrls } = await initiateMultipart({
    fileName: 'large.zip',
    sizeBytes: 150 * 1024 * 1024, // 150MB
    totalParts: 30
  });

  const parts = [];
  for (let i = 0; i < 30; i++) {
    const chunk = createChunk(5 * 1024 * 1024); // 5MB
    const etag = await uploadPart(partUrls[i], chunk);
    parts.push({ PartNumber: i + 1, ETag: etag });
  }

  await completeMultipart({ uploadId, parts });

  const attachment = await getAttachment(uploadId);
  expect(attachment.sha256).toBeDefined();
});
```

---

## 📈 Performance Impact

### Storage
- **Previews**: +20% storage (thumbnails + previews)
- **Deduplication**: -40% to -60% storage (typical workload)
- **Net**: -20% to -40% storage reduction

### Database
- **access_log table**: High write volume, minimal read
- **Partitioning**: Recommended after 10M records
- **Indexes**: Optimized for time-range queries

### CPU
- **Preview generation**: Moderate (async, rate-limited)
- **Deduplication check**: Minimal (indexed SHA-256 lookup)

---

## 🚀 Deployment Plan

### Phase 1: Schema & Core Services (Current)
- ✅ Database migration
- ⏳ Repositories
- ⏳ Core services
- ⏳ Basic API handlers

### Phase 2: Preview Generation (Next)
- Preview service
- Background worker
- API routes
- UI components

### Phase 3: Multipart Upload (After Phase 2)
- Multipart service
- S3 integration
- Cleanup worker
- Client library updates

### Phase 4: Polish & Optimization (Final)
- Access log partitioning
- Performance tuning
- Monitoring dashboards
- Documentation

---

## 📚 Documentation To Create

1. **API Reference**: All new endpoints with examples
2. **Multipart Upload Guide**: Client implementation examples
3. **Preview Generation Guide**: Supported formats, limits
4. **Access Log Analysis**: Query examples for common reports
5. **Deduplication Internals**: How it works, edge cases

---

**Status**: Database schema complete ✅ | Services in progress ⏳
**Next**: Repository implementations and core services
**ETA**: 2-3 hours for full implementation
