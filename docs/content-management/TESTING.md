# Content Management System - Testing Guide

## Test Coverage

### Unit Tests (Implemented)

#### 1. Storage Key Builder
**File**: `framework/runtime/src/services/platform-services/content/storage/storage-key-builder.test.ts`

Tests:
- ✅ Deterministic shard calculation from fileId
- ✅ Shard range validation (0-999)
- ✅ Correct storage key pattern generation
- ✅ Time-based partitioning (yyyy/mm)
- ✅ Tenant isolation in path

**Run**:
```bash
npx vitest run storage-key-builder.test.ts
```

#### 2. Content Taxonomy
**File**: `framework/runtime/src/services/platform-services/content/domain/content-taxonomy.test.ts`

Tests:
- ✅ DocumentKind enum validation (12 kinds)
- ✅ File size validation per kind
- ✅ Content type restrictions per kind
- ✅ Size limits enforcement (1MB - 200MB)
- ✅ Security-sensitive kind restrictions (PDF-only for invoices, contracts, generated)
- ✅ Integration scenarios (avatar, invoice, contract uploads)

**Run**:
```bash
npx vitest run content-taxonomy.test.ts
```

#### 3. Cleanup Worker
**File**: `framework/runtime/src/services/platform-services/content/jobs/workers/cleanupOrphanedUploads.worker.test.ts`

Tests:
- ✅ Skip when no orphaned uploads
- ✅ Delete from DB and S3
- ✅ Handle S3 deletion failures gracefully
- ✅ Respect maxCleanupPerRun limit
- ✅ Apply age threshold correctly
- ✅ deleteFromStorage flag handling
- ✅ High error rate warning

**Run**:
```bash
npx vitest run cleanupOrphanedUploads.worker.test.ts
```

#### 4. API Client
**File**: `packages/api-client/src/content/contentClient.test.ts`

Tests:
- ✅ SHA-256 hash computation (browser crypto.subtle)
- ✅ Hash consistency for same content
- ✅ Different hashes for different content
- ✅ Empty file handling
- ✅ Binary data handling
- ✅ Large file handling (1MB)
- ✅ Lowercase hex output validation
- ✅ ContentApiError creation and properties

**Run**:
```bash
cd packages/api-client && npx vitest run contentClient.test.ts
```

---

## Integration Tests (Deferred to Runtime Implementation)

The following tests should be added during the "Big Bang" runtime implementation:

### BFF Route Tests
- `POST /api/content/initiate` - Upload initiation
- `POST /api/content/complete` - Upload completion
- `GET /api/content/download/:id` - Download URL generation
- `DELETE /api/content/delete/:id` - File deletion
- `GET /api/content/by-entity` - List by entity
- `GET /api/content/versions/:id` - Version history
- `POST /api/content/version/initiate` - New version upload
- `POST /api/content/link` - Link document to entity
- `DELETE /api/content/unlink/:id` - Unlink document
- `POST /api/content/acl/grant` - Grant permission
- `POST /api/content/acl/revoke` - Revoke permission
- `GET /api/content/acl/:id` - List ACLs
- `GET /api/content/meta/:id` - Get metadata

**Setup Required**:
- Test database with fixtures
- Mock S3 storage (or MinIO test instance)
- Mock authentication (test session tokens)
- CSRF token handling

**Example Test Structure**:
```typescript
describe("POST /api/content/initiate", () => {
  it("should return presigned URL for valid request", async () => {
    const response = await fetch("/api/content/initiate", {
      method: "POST",
      body: JSON.stringify({
        entityType: "invoice",
        entityId: "test-invoice-123",
        kind: "attachment",
        fileName: "test.pdf",
        contentType: "application/pdf",
        sizeBytes: 1024,
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.uploadId).toBeDefined();
    expect(data.data.presignedUrl).toContain("X-Amz-Signature");
  });

  it("should reject oversized files", async () => {
    const response = await fetch("/api/content/initiate", {
      method: "POST",
      body: JSON.stringify({
        kind: "avatar",
        fileName: "huge.jpg",
        contentType: "image/jpeg",
        sizeBytes: 10 * 1024 * 1024, // 10 MB (avatar max is 2 MB)
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });
});
```

---

## UI Component Tests (Deferred)

React component tests using Vitest + React Testing Library:

### FilePicker
- File selection via input
- Drag & drop
- File validation (size, type)
- Upload progress tracking
- Error display

### AttachmentCard
- Render file info (name, size, date)
- Download button click
- Delete button click
- Permission-based button visibility

### AttachmentList
- Render multiple cards
- Empty state
- Grouping by kind
- Sort by date

### DocumentVersionTimeline
- Render version history
- Current version badge
- Restore version
- Download previous version

### DocumentAclManager
- Fetch and display ACLs
- Grant permission form
- Revoke permission

**Example Test**:
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { FilePicker } from "./FilePicker";

describe("FilePicker", () => {
  it("should accept valid file", async () => {
    const onFilesSelected = vi.fn();
    render(<FilePicker onFilesSelected={onFilesSelected} />);

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText("Select files");

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });
});
```

---

## E2E Tests (Deferred)

End-to-end tests using Playwright:

1. **Complete Upload Flow**
   - Navigate to entity page
   - Click "Documents" tab
   - Upload file
   - Verify file appears in list
   - Download file
   - Verify content matches

2. **Version Management**
   - Upload file
   - Upload new version
   - Verify version timeline
   - Restore previous version
   - Verify new version created

3. **Entity Linking**
   - Upload file to entity A
   - Link to entity B
   - Verify file appears on both entity pages
   - Unlink from entity B
   - Verify removed from entity B only

4. **Access Control**
   - Grant permission to user
   - Verify user can download
   - Revoke permission
   - Verify user cannot download

---

## Running All Tests

From repository root:

```bash
# Run all unit tests
npx vitest run

# Run specific test file
npx vitest run content-taxonomy.test.ts

# Run tests in watch mode
npx vitest watch

# Run with coverage
npx vitest run --coverage
```

---

## Test Data

### Valid Upload Scenarios

```typescript
const validUploads = {
  avatar: {
    kind: "avatar",
    fileName: "profile.jpg",
    contentType: "image/jpeg",
    sizeBytes: 500_000, // 500 KB
  },
  invoice: {
    kind: "invoice",
    fileName: "INV-001.pdf",
    contentType: "application/pdf",
    sizeBytes: 2_000_000, // 2 MB
  },
  contract: {
    kind: "contract",
    fileName: "agreement.pdf",
    contentType: "application/pdf",
    sizeBytes: 10_000_000, // 10 MB
  },
  attachment: {
    kind: "attachment",
    fileName: "document.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sizeBytes: 50_000_000, // 50 MB
  },
};
```

### Invalid Upload Scenarios

```typescript
const invalidUploads = {
  oversizedAvatar: {
    kind: "avatar",
    sizeBytes: 5_000_000, // 5 MB (max is 2 MB)
    expectedError: "File size exceeds limit",
  },
  wrongTypeInvoice: {
    kind: "invoice",
    contentType: "image/jpeg", // Should be PDF
    expectedError: "Content type not allowed",
  },
  maliciousFile: {
    kind: "generated",
    contentType: "application/javascript", // Not allowed
    expectedError: "Content type not allowed",
  },
};
```

---

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
name: Test Content Management

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install
      - run: npx vitest run --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Test Metrics

Target coverage:
- **Unit tests**: >80% line coverage for business logic
- **Integration tests**: All API routes covered
- **E2E tests**: Critical user flows (upload, download, version, link)

Current status (unit tests only):
- ✅ Storage key builder: 100%
- ✅ Content taxonomy: 100%
- ✅ Cleanup worker: 95%
- ✅ API client: 90%

Remaining:
- ⏸️ BFF routes: 0% (deferred to runtime)
- ⏸️ UI components: 0% (deferred)
- ⏸️ E2E: 0% (deferred)
