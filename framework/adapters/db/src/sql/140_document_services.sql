-- ============================================================================
-- 140: Document Services (DOC)
-- ============================================================================
-- Depends on: 020_core_foundation.sql (core.tenant, core.document)
-- Module:     DOC — Document generation, template governance, brand management
-- ============================================================================

-- ============================================================================
-- A) Template System (versioned + governed)
-- ============================================================================

-- 1. doc_template: versioned template definitions
create table if not exists core.doc_template (
    id                  uuid primary key default gen_random_uuid(),
    tenant_id           uuid not null references core.tenant(id) on delete cascade,

    code                text not null,
    name                text not null,
    kind                text not null check (kind in ('LETTER','REPORT','CERTIFICATE','PACK','RECEIPT','STATEMENT')),
    engine              text not null default 'HANDLEBARS' check (engine in ('HANDLEBARS','MJML','REACT_PDF')),
    status              text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','RETIRED')),
    current_version_id  uuid,                                       -- FK added below (deferred)
    metadata            jsonb,

    created_at          timestamptz not null default now(),
    created_by          text not null,
    updated_at          timestamptz,
    updated_by          text
);

comment on table core.doc_template is 'Document template definitions — versioned, governed, tenant-scoped.';

create unique index if not exists idx_doc_template_tenant_code
    on core.doc_template (tenant_id, code);

create index if not exists idx_doc_template_tenant_status
    on core.doc_template (tenant_id, status);


-- 2. doc_template_version: immutable version snapshots
create table if not exists core.doc_template_version (
    id                  uuid primary key default gen_random_uuid(),
    tenant_id           uuid not null references core.tenant(id) on delete cascade,
    template_id         uuid not null references core.doc_template(id) on delete cascade,

    version             int not null,                                -- monotonic per template
    content_html        text,                                        -- HTML body template
    content_json        jsonb,                                       -- structured blocks (alternative)
    header_html         text,                                        -- page header template
    footer_html         text,                                        -- page footer template
    styles_css          text,                                        -- scoped CSS
    variables_schema    jsonb,                                       -- Zod-compatible schema for input validation
    assets_manifest     jsonb,                                       -- {key: checksum} for fonts/images
    checksum            text not null,                               -- SHA-256 of all content fields

    published_at        timestamptz,
    published_by        text,
    effective_from      timestamptz,
    effective_to        timestamptz,

    created_at          timestamptz not null default now(),
    created_by          text not null
);

comment on table core.doc_template_version is 'Immutable template version snapshots with content checksums.';

create unique index if not exists idx_doc_template_version_tpl_ver
    on core.doc_template_version (template_id, version);

create index if not exists idx_doc_template_version_tenant
    on core.doc_template_version (tenant_id);


-- Deferred FK: doc_template.current_version_id → doc_template_version.id
do $$
begin
    if not exists (
        select 1 from information_schema.table_constraints
        where constraint_name = 'fk_doc_template_current_version'
          and table_schema = 'core'
          and table_name = 'doc_template'
    ) then
        alter table core.doc_template
            add constraint fk_doc_template_current_version
            foreign key (current_version_id) references core.doc_template_version(id);
    end if;
end $$;


-- 3. doc_template_binding: maps templates to entity + operation
create table if not exists core.doc_template_binding (
    id                  uuid primary key default gen_random_uuid(),
    tenant_id           uuid not null references core.tenant(id) on delete cascade,
    template_id         uuid not null references core.doc_template(id) on delete cascade,

    entity_name         text not null,                               -- e.g., "invoice", "purchase_order"
    operation           text not null,                               -- e.g., "print", "email", "submit"
    variant             text not null default 'default',             -- e.g., "customer_copy", "tax_copy"
    priority            int not null default 0,                      -- for resolution order
    active              boolean not null default true,

    created_at          timestamptz not null default now(),
    created_by          text not null
);

comment on table core.doc_template_binding is 'Binds templates to entity+operation+variant for automatic resolution.';

create unique index if not exists idx_doc_template_binding_unique
    on core.doc_template_binding (tenant_id, entity_name, operation, variant);

create index if not exists idx_doc_template_binding_template
    on core.doc_template_binding (template_id);


-- ============================================================================
-- B) Brand Layer (letterhead + brand profile)
-- ============================================================================

-- 4. doc_letterhead: tenant/org-unit scoped brand layer
create table if not exists core.doc_letterhead (
    id                  uuid primary key default gen_random_uuid(),
    tenant_id           uuid not null references core.tenant(id) on delete cascade,

    code                text not null,
    name                text not null,
    org_unit_id         uuid,                                        -- optional scope to org unit
    logo_storage_key    text,                                        -- MinIO key for logo image
    header_html         text,                                        -- header block template
    footer_html         text,                                        -- footer block template
    watermark_text      text,                                        -- e.g., "DRAFT", "CONFIDENTIAL"
    watermark_opacity   numeric(3,2) default 0.15,
    default_fonts       jsonb,                                       -- {heading: "...", body: "..."}
    page_margins        jsonb,                                       -- {top, right, bottom, left} in mm
    is_default          boolean not null default false,
    metadata            jsonb,

    created_at          timestamptz not null default now(),
    created_by          text not null,
    updated_at          timestamptz,
    updated_by          text
);

comment on table core.doc_letterhead is 'Tenant/org-unit scoped letterhead with logo, header/footer, watermark, and fonts.';

create unique index if not exists idx_doc_letterhead_tenant_code
    on core.doc_letterhead (tenant_id, code);

create index if not exists idx_doc_letterhead_tenant_default
    on core.doc_letterhead (tenant_id, is_default) where is_default = true;


-- 5. doc_brand_profile: typography + palette per tenant
create table if not exists core.doc_brand_profile (
    id                  uuid primary key default gen_random_uuid(),
    tenant_id           uuid not null references core.tenant(id) on delete cascade,

    code                text not null,
    name                text not null,
    palette             jsonb,                                       -- {primary, secondary, accent, ...}
    typography          jsonb,                                       -- {headingFont, bodyFont, sizes, lineHeight}
    spacing_scale       jsonb,                                       -- {xs, sm, md, lg, xl} in px/rem
    direction           text not null default 'LTR' check (direction in ('LTR','RTL')),
    default_locale      text not null default 'en',
    supported_locales   text[],
    is_default          boolean not null default false,
    metadata            jsonb,

    created_at          timestamptz not null default now(),
    created_by          text not null,
    updated_at          timestamptz,
    updated_by          text
);

comment on table core.doc_brand_profile is 'Brand profile: palette, typography, spacing, RTL/LTR per tenant.';

create unique index if not exists idx_doc_brand_profile_tenant_code
    on core.doc_brand_profile (tenant_id, code);

create index if not exists idx_doc_brand_profile_tenant_default
    on core.doc_brand_profile (tenant_id, is_default) where is_default = true;


-- ============================================================================
-- C) Document Outputs (immutable + verifiable)
-- ============================================================================

-- 6. doc_output: immutable rendered document records
create table if not exists core.doc_output (
    id                      uuid primary key default gen_random_uuid(),
    tenant_id               uuid not null references core.tenant(id) on delete cascade,
    template_version_id     uuid references core.doc_template_version(id),
    letterhead_id           uuid references core.doc_letterhead(id),
    brand_profile_id        uuid references core.doc_brand_profile(id),

    entity_name             text not null,
    entity_id               text not null,
    operation               text not null,
    variant                 text not null default 'default',
    locale                  text not null default 'en',
    timezone                text not null default 'UTC',

    status                  text not null default 'QUEUED'
                            check (status in ('QUEUED','RENDERING','RENDERED','DELIVERED','FAILED','ARCHIVED','REVOKED')),

    storage_key             text,                                    -- MinIO path to rendered file
    mime_type               text default 'application/pdf',
    size_bytes              bigint,
    checksum                text,                                    -- SHA-256 of rendered output
    manifest_json           jsonb not null,                          -- full render contract inputs
    input_payload_hash      text,                                    -- SHA-256 of the input data

    replaces_output_id      uuid references core.doc_output(id),     -- for revisions
    error_message           text,

    rendered_at             timestamptz,
    delivered_at            timestamptz,
    archived_at             timestamptz,
    revoked_at              timestamptz,
    revoked_by              text,
    revoke_reason           text,

    created_at              timestamptz not null default now(),
    created_by              text not null
);

comment on table core.doc_output is 'Immutable rendered document outputs with checksum, manifest, and full lifecycle.';

create index if not exists idx_doc_output_entity
    on core.doc_output (tenant_id, entity_name, entity_id);

create index if not exists idx_doc_output_status
    on core.doc_output (tenant_id, status);

create index if not exists idx_doc_output_template_version
    on core.doc_output (template_version_id);

create index if not exists idx_doc_output_replaces
    on core.doc_output (replaces_output_id) where replaces_output_id is not null;


-- 7. doc_render_job: queue tracking (correlates with BullMQ jobs)
create table if not exists core.doc_render_job (
    id                  uuid primary key default gen_random_uuid(),
    output_id           uuid not null references core.doc_output(id) on delete cascade,
    tenant_id           uuid not null references core.tenant(id) on delete cascade,

    job_queue_id        text,                                        -- BullMQ job ID
    status              text not null default 'PENDING'
                        check (status in ('PENDING','PROCESSING','COMPLETED','FAILED','RETRYING')),
    attempts            int not null default 0,
    max_attempts        int not null default 3,
    error_code          text,
    error_detail        text,
    trace_id            text,                                        -- OpenTelemetry trace

    started_at          timestamptz,
    completed_at        timestamptz,
    duration_ms         int,

    created_at          timestamptz not null default now()
);

comment on table core.doc_render_job is 'Render job queue tracking — correlates with BullMQ jobs for observability.';

create index if not exists idx_doc_render_job_output
    on core.doc_render_job (output_id);

create index if not exists idx_doc_render_job_status
    on core.doc_render_job (tenant_id, status);
