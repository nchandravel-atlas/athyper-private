# Document Services (DOC Module)

Multi-tenant document generation platform built on Handlebars templates + Puppeteer PDF rendering, with brand profiles, letterheads, and per-entity output tracking.

## Architecture Overview

```
Template Management       Render Pipeline          Output Lifecycle
─────────────────        ────────────────          ─────────────────
Template CRUD             Resolve inputs            QUEUED
  └─ Versioning             └─ Compose HTML           └─ RENDERING
      └─ Publish/Retire         └─ Render PDF             └─ RENDERED
          └─ Bindings               └─ Upload storage         └─ DELIVERED
                                        └─ Update output          └─ ARCHIVED
                                                              └─ REVOKED
                                                          └─ FAILED
                                                              └─ DLQ
```

### Module Location

`framework/runtime/src/services/platform-services/document/`

### Module Code

`DOC` — tenant-scoped, subscription tier: Base

---

## Domain Model

### Database Tables (8)

| Table | Purpose |
|-------|---------|
| `doc.template` | Template definitions (code, name, kind, engine, capability flags) |
| `doc.template_version` | Versioned template content (HTML body, header, footer, CSS, schema) |
| `doc.template_binding` | Maps entity+operation+variant to a template (priority-based resolution) |
| `doc.letterhead` | Tenant/org-unit letterheads (logo, header, footer, watermark, page margins) |
| `doc.brand_profile` | Brand palette, typography, spacing, RTL/LTR direction |
| `doc.render_output` | Rendered document records with full lifecycle tracking |
| `doc.render_job` | BullMQ job metadata (status, attempts, timing) |
| `doc.render_dlq` | Dead-letter queue for permanently failed renders |

### Core Types

| Type | Values |
|------|--------|
| `TemplateKind` | LETTER, REPORT, CERTIFICATE, PACK, RECEIPT, STATEMENT |
| `TemplateEngine` | HANDLEBARS, MJML, REACT_PDF |
| `TemplateStatus` | DRAFT, PUBLISHED, RETIRED |
| `OutputStatus` | QUEUED, RENDERING, RENDERED, DELIVERED, FAILED, ARCHIVED, REVOKED |
| `RenderJobStatus` | PENDING, PROCESSING, COMPLETED, FAILED, RETRYING |
| `PaperFormat` | A4, LETTER, LEGAL |
| `TextDirection` | LTR, RTL |

### Output Status State Machine

```
QUEUED ──> RENDERING ──> RENDERED ──> DELIVERED ──> ARCHIVED
  │            │              │             │
  └──> FAILED  └──> FAILED   └──> REVOKED  └──> REVOKED
                              └──> ARCHIVED
FAILED ──> ARCHIVED
ARCHIVED ──> (terminal)
REVOKED ──> (terminal)
```

All transitions are enforced in `DocOutputRepo.updateStatus()` via `isValidOutputTransition()`.

---

## Services (7)

| Service | Token | Purpose |
|---------|-------|---------|
| `DocTemplateService` | `documentTemplateService` | Template CRUD, versioning, publish/retire, binding resolution, schema validation, HTML sanitization |
| `DocRenderService` | `documentRenderService` | Central render orchestrator — resolve inputs, compose HTML, render PDF, upload to storage |
| `DocOutputService` | `documentOutputService` | Output CRUD, download streaming, integrity verification |
| `DocLetterheadService` | `documentLetterheadService` | Letterhead CRUD with single-default enforcement |
| `DocBrandService` | `documentBrandService` | Brand profile CRUD with single-default enforcement |
| `DocRenderDlqManager` | `documentDlqManager` | Dead-letter queue — moveToDlq, retry, bulkReplay |
| `DocAuditEmitter` | `documentAuditEmitter` | 15 audit event types across templates, bindings, brands, renders, outputs |

### Supporting Components

| Component | Purpose |
|-----------|---------|
| `DocHtmlComposer` | Handlebars compilation, variable substitution/validation, brand CSS, watermark, RTL |
| `PuppeteerPdfRenderer` | HTML-to-PDF via puppeteer-core with semaphore, timeout, SSRF blocking |
| `DefaultDocStorageAdapter` | S3/MinIO storage with presigned URLs |
| `DocMetrics` | Prometheus metrics (render count/duration/errors, stage timing, pool gauges) |

---

## Render Pipeline

### Synchronous Render (`POST /api/documents/render/sync`)

1. **Resolve inputs** — template (via binding or direct ID), letterhead, brand profile
2. **Enforce governance** — capability flags (requiresLetterhead, allowedOperations, supportedLocales)
3. **Compose HTML** — Handlebars compilation, variable validation, brand CSS injection, RTL direction
4. **Render PDF** — Puppeteer page render with SSRF protection and configurable timeout
5. **Return** — PDF buffer + checksum + render manifest

### Asynchronous Render (`POST /api/documents/render`)

1. Steps 1-2 same as synchronous
2. **Create output record** — status=QUEUED, idempotency check (returns existing in-flight output if duplicate)
3. **Enqueue BullMQ job** — `render-document` job type with full payload
4. **Worker executes** — compose, render, upload to MinIO, update output to RENDERED
5. **On failure** — classify error, retry or move to DLQ

### Render Manifest (v2)

Every rendered document includes a manifest capturing the exact inputs used:

```typescript
{
    manifestVersion: 2,
    templateVersionId, templateChecksum,
    letterheadId, brandProfileId,
    locale, timezone,
    engineVersion,         // "puppeteer-core@24.x"
    chromiumVersion,       // actual Chromium version
    stylesChecksum,        // SHA-256 of composed CSS
    inputPayloadHash,
    assetsManifest,
    renderedAt
}
```

---

## Error Taxonomy

| Error Code | Category | Trigger |
|------------|----------|---------|
| `TEMPLATE_NOT_FOUND` | permanent | Template/binding not resolved |
| `TEMPLATE_INVALID` | permanent | Template in invalid state |
| `SCHEMA_VALIDATION_FAILED` | permanent | Variables don't match template schema |
| `RENDER_TIMEOUT` | timeout | PDF render exceeded timeout |
| `CHROMIUM_CRASH` | crash | Browser disconnected / protocol error |
| `STORAGE_WRITE_FAILED` | transient | MinIO/S3 write failure |
| `STORAGE_READ_FAILED` | transient | MinIO/S3 read failure |
| `COMPOSE_FAILED` | permanent | Handlebars compilation error |
| `LETTERHEAD_REQUIRED` | permanent | Template requires letterhead but none provided |
| `OPERATION_NOT_ALLOWED` | permanent | Operation not in template's allowedOperations |
| `LOCALE_NOT_SUPPORTED` | permanent | Locale not in template's supportedLocales |
| `UNKNOWN` | transient | Unclassified error |

**Category behavior:**
- `permanent` — no retry, move directly to DLQ
- `transient` — retry with exponential backoff, DLQ after max attempts
- `timeout` — retry once, then DLQ
- `crash` — retry with browser reconnection, DLQ after max attempts

---

## Security

### HTML Sanitization

Template content (`contentHtml`, `headerHtml`, `footerHtml`) is sanitized via `SanitizationProfiles.richText` from `@athyper/core` on version creation. Strips:
- `<script>` tags
- Event handlers (`onclick`, `onerror`, etc.)
- `javascript:` protocol URIs

### SSRF Protection

Puppeteer request interception blocks all network requests during PDF rendering except:
- `data:` URIs (inline images, fonts)
- `blob:` URIs
- Requests to explicitly trusted domains (`document.rendering.trustedDomains`)

Internal IPs (169.254.x.x, 127.0.0.1, 10.x.x.x), `file:` protocol, and all other network requests are blocked.

### Schema Validation

Template versions may define a `variablesSchema` (JSON with `required` string array and `properties` object with `{type}` definitions). Variables are validated against this schema at render time. Type checks: string, number, boolean, array, object.

### Audit Trail

15 audit event types emitted via `DocAuditEmitter` (all best-effort):

| Category | Events |
|----------|--------|
| Templates | `doc.template.created`, `doc.template.published`, `doc.template.retired`, `doc.template.version_created` |
| Bindings | `doc.binding.created`, `doc.binding.changed` |
| Brands | `doc.letterhead.changed`, `doc.brand_profile.changed` |
| Renders | `doc.render.queued`, `doc.render.completed`, `doc.render.failed` |
| Outputs | `doc.output.downloaded`, `doc.output.revoked`, `doc.output.delivered` |

---

## Template Governance

Templates support capability flags that are enforced at render time:

| Flag | Type | Enforcement |
|------|------|-------------|
| `requiresLetterhead` | boolean | Render fails if no letterhead resolved |
| `allowedOperations` | string[] | Render fails if request operation not in list |
| `supportedLocales` | string[] | Render fails if request locale not in list |
| `supportsRtl` | boolean | Warning logged if brand profile is RTL but template doesn't support it |

---

## Job Workers (3)

| Worker | Job Type | Concurrency | Purpose |
|--------|----------|-------------|---------|
| `renderDocument` | `render-document` | Configurable (default 3) | Execute render pipeline |
| `cleanupOutputs` | `cleanup-doc-outputs` | 1 | Archive/delete old outputs based on retention policy |
| `recoverStuckJobs` | `recover-stuck-doc-renders` | 1 | Find RENDERING outputs older than 2x timeout, mark FAILED |

---

## API Endpoints (30)

### Admin: Templates (9 endpoints)

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/admin/documents/templates` | List templates (filter by status, kind, engine, search) |
| POST | `/api/admin/documents/templates` | Create template |
| GET | `/api/admin/documents/templates/:id` | Get template + versions (ETag, 304 support) |
| PUT | `/api/admin/documents/templates/:id` | Update template metadata |
| POST | `/api/admin/documents/templates/:id/versions` | Create new version |
| POST | `/api/admin/documents/templates/:id/publish` | Publish version |
| POST | `/api/admin/documents/templates/:id/retire` | Retire template |
| POST | `/api/admin/documents/templates/:id/preview` | Preview render (returns PDF inline) |
| GET | `/api/admin/documents/resolve` | Resolve template for entity+operation+variant |

### Admin: Letterheads (4 endpoints)

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/admin/documents/letterheads` | List letterheads |
| POST | `/api/admin/documents/letterheads` | Create letterhead |
| GET | `/api/admin/documents/letterheads/:id` | Get letterhead |
| PUT | `/api/admin/documents/letterheads/:id` | Update letterhead |

### Admin: Brand Profiles (3 endpoints)

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/admin/documents/brand-profiles` | List brand profiles |
| POST | `/api/admin/documents/brand-profiles` | Create brand profile |
| PUT | `/api/admin/documents/brand-profiles/:id` | Update brand profile |

### Admin: Render Jobs (3 endpoints)

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/admin/documents/render-jobs` | List render jobs |
| GET | `/api/admin/documents/render-jobs/:id` | Get render job details |
| POST | `/api/admin/documents/render-jobs/:id/retry` | Retry failed render job |

### Admin: DLQ (4 endpoints)

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/admin/documents/dlq` | List DLQ entries |
| GET | `/api/admin/documents/dlq/:id` | Inspect DLQ entry (full payload) |
| POST | `/api/admin/documents/dlq/:id/retry` | Retry single DLQ entry |
| POST | `/api/admin/documents/dlq/bulk-replay` | Bulk replay unreplayed entries |

### User-facing: Render (2 endpoints)

| Method | Path | Handler |
|--------|------|---------|
| POST | `/api/documents/render` | Async render (returns output ID) |
| POST | `/api/documents/render/sync` | Sync render (returns PDF buffer) |

### User-facing: Outputs (5 endpoints)

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/documents/outputs` | List outputs (filter by entity, status, operation) |
| GET | `/api/documents/outputs/:id` | Get output metadata |
| GET | `/api/documents/outputs/:id/download` | Download PDF (streamed) |
| POST | `/api/documents/outputs/:id/deliver` | Mark output as delivered |
| POST | `/api/documents/outputs/:id/revoke` | Revoke output (requires reason) |
| GET | `/api/documents/outputs/:id/verify` | Verify output integrity |

---

## Configuration

All settings live under `document` in the runtime config schema (`config.schema.ts`).

```jsonc
{
    "document": {
        "enabled": false,
        "rendering": {
            "engine": "puppeteer",          // "puppeteer" | "playwright"
            "chromiumPath": null,            // path to Chromium binary (auto-detect if null)
            "concurrency": 3,               // max concurrent Puppeteer pages
            "timeoutMs": 30000,             // per-render timeout
            "maxRetries": 3,                // max retry attempts before DLQ
            "paperFormat": "A4",            // "A4" | "LETTER" | "LEGAL"
            "trustedDomains": [],           // domains allowed for network requests during render
            "allowedHosts": [],             // additional host allowlist for security
            "composeTimeoutMs": 5000,       // Handlebars compose stage timeout
            "uploadTimeoutMs": 30000        // storage upload stage timeout
        },
        "storage": {
            "pathPrefix": "documents",      // S3/MinIO path prefix
            "presignedUrlExpirySeconds": 3600,
            "downloadMode": "stream"        // "stream" (direct) | "presigned" (redirect URL)
        },
        "jobs": {
            "leaseSeconds": 300,            // job lease duration before considered abandoned
            "heartbeatSeconds": 30          // heartbeat interval to extend lease
        },
        "retention": {
            "defaultDays": 2555,            // ~7 years default retention
            "archiveAfterDays": 365         // auto-archive after 1 year
        }
    }
}
```

---

## Observability

### Health Check

Registered as `document-pdf-renderer` (non-required). Reports Chromium version, active/queued page counts.

### Metrics

| Metric | Type | Labels |
|--------|------|--------|
| Render count | Counter | tenantId, status |
| Render duration | Histogram | tenantId |
| Render errors | Counter | tenantId, errorCode |
| Stage duration | Histogram | stage (compose, render, upload, db_update) |
| Failure by code | Counter | errorCode |
| Renderer pool active | Gauge | — |
| Renderer pool queued | Gauge | — |
| Storage duration | Histogram | operation (put, get) |

### Structured Logging

All log entries include `{ module: "DOC", category }` bindings. Categories: template, render, output, storage, lifecycle, adapter, composer, brand, letterhead, audit, dlq, recovery.

### Graceful Shutdown

On SIGTERM/SIGINT, the Puppeteer browser instance is closed cleanly before process exit.

---

## File Structure

```
document/
├── index.ts                              Module composition root (register + contribute)
├── module.json                           Module metadata
├── domain/
│   ├── types.ts                          Branded IDs, enums, state machine, error taxonomy, manifest
│   ├── models/
│   │   ├── DocTemplate.ts                Template + TemplateVersion interfaces
│   │   ├── DocLetterhead.ts              Letterhead interface
│   │   ├── DocBrandProfile.ts            Brand profile interface
│   │   ├── DocOutput.ts                  Output interface
│   │   ├── DocRenderJob.ts               Render job interface
│   │   └── DocRenderDlqEntry.ts          DLQ entry interface
│   └── services/
│       ├── DocTemplateService.ts         Template lifecycle + governance
│       ├── DocRenderService.ts           Central render orchestrator
│       ├── DocOutputService.ts           Output lifecycle + streaming
│       ├── DocLetterheadService.ts       Letterhead CRUD
│       ├── DocBrandService.ts            Brand profile CRUD
│       ├── DocHtmlComposer.ts            HTML composition + Handlebars
│       ├── DocRenderDlqManager.ts        Dead-letter queue management
│       └── DocAuditEmitter.ts            Audit event emission
├── persistence/
│   ├── DocTemplateRepo.ts                Kysely repo for doc.template
│   ├── DocTemplateVersionRepo.ts         Kysely repo for doc.template_version
│   ├── DocTemplateBindingRepo.ts         Kysely repo for doc.template_binding
│   ├── DocLetterheadRepo.ts              Kysely repo for doc.letterhead
│   ├── DocBrandProfileRepo.ts            Kysely repo for doc.brand_profile
│   ├── DocOutputRepo.ts                  Kysely repo for doc.render_output
│   ├── DocRenderJobRepo.ts               Kysely repo for doc.render_job
│   └── DocRenderDlqRepo.ts              Kysely repo for doc.render_dlq
├── adapters/
│   ├── PdfRenderer.ts                    Puppeteer adapter (semaphore, timeout, SSRF)
│   └── DocStorageAdapter.ts              S3/MinIO storage adapter
├── api/handlers/
│   ├── template-admin.handler.ts         9 template handlers (incl. ETag, resolve, preview)
│   ├── letterhead-admin.handler.ts       4 letterhead handlers
│   ├── brand-admin.handler.ts            3 brand profile handlers
│   ├── render.handler.ts                 2 render handlers (async + sync)
│   ├── output.handler.ts                 6 output handlers (incl. streaming download)
│   ├── render-job-admin.handler.ts       3 render job handlers
│   └── dlq-admin.handler.ts             4 DLQ admin handlers
├── jobs/workers/
│   ├── renderDocument.worker.ts          Async render execution
│   ├── cleanupOutputs.worker.ts          Retention cleanup
│   └── recoverStuckJobs.worker.ts        Stuck job recovery
├── observability/
│   ├── metrics.ts                        Prometheus metrics
│   └── logger.ts                         Structured logger factory
└── __tests__/
    ├── DocHtmlComposer.test.ts           27 tests
    ├── OutputStatusMachine.test.ts        43 tests
    ├── DocRenderDlqManager.test.ts        13 tests
    └── PdfRenderer.test.ts               21 tests
```

---

## SQL Migrations

| File | Purpose |
|------|---------|
| `140_document_services.sql` | Phase 1 — all 7 base tables, indexes, FKs |
| `141_document_robustness.sql` | Phase 2 — unique default indexes, idempotency index, storage/capability/DLQ columns, DLQ table |

---

## Tests

104 tests across 4 test files:

| Test File | Count | Coverage |
|-----------|-------|----------|
| `DocHtmlComposer.test.ts` | 27 | Template compilation, variable substitution, validation, brand CSS, watermark, RTL, headers/footers, cache eviction, locale-aware helpers |
| `OutputStatusMachine.test.ts` | 43 | All valid transitions, all invalid transitions, terminal states, transition map completeness, error taxonomy classification |
| `DocRenderDlqManager.test.ts` | 13 | moveToDlq, list (tenant isolation), inspect, retry (re-enqueue + mark replayed), bulkReplay (success/error/empty) |
| `PdfRenderer.test.ts` | 21 | Semaphore concurrency, timeout behavior, SSRF filtering (data:/blob: allowed, HTTP/HTTPS/IPs blocked, trusted domains, subdomain matching, suffix attacks) |
