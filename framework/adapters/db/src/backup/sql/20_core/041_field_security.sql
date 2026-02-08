/* ============================================================================
   Athyper — CORE: Field-Level Security
   Column-level access control: read masking, write filtering, ABAC conditions.
   PostgreSQL 16+ (pgcrypto)
   ============================================================================ */

-- ============================================================================
-- META: Field Security Policy
-- ============================================================================

create table if not exists meta.field_security_policy (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  entity_id       uuid not null references meta.entity(id) on delete cascade,
  field_path      text not null,

  policy_type     text not null,
  role_list       text[],
  abac_condition  jsonb,

  mask_strategy   text,
  mask_config     jsonb,

  scope           text not null default 'entity',
  scope_ref       uuid,
  priority        integer not null default 100,
  is_active       boolean not null default true,

  metadata        jsonb,

  created_at      timestamptz not null default now(),
  created_by      text not null,
  updated_at      timestamptz,
  updated_by      text,
  version         integer not null default 1,

  constraint field_security_policy_type_chk
    check (policy_type in ('read', 'write', 'both')),
  constraint field_security_mask_strategy_chk
    check (mask_strategy in ('null', 'redact', 'hash', 'partial', 'remove')),
  constraint field_security_scope_chk
    check (scope in ('global', 'module', 'entity', 'entity_version', 'record')),
  constraint field_security_policy_uniq
    unique (tenant_id, entity_id, field_path, policy_type, scope, scope_ref)
);

comment on table meta.field_security_policy is
'Field-level security policies defining read/write access control with masking strategies.';

comment on column meta.field_security_policy.field_path is 'JSON path to field (e.g., ssn, address.zipCode).';
comment on column meta.field_security_policy.policy_type is 'Policy type: read, write, or both.';
comment on column meta.field_security_policy.role_list is 'Simple role-based access: array of role codes.';
comment on column meta.field_security_policy.abac_condition is 'ABAC expression for attribute-based access control.';
comment on column meta.field_security_policy.mask_strategy is 'Masking strategy for read access: null, redact, hash, partial, remove.';
comment on column meta.field_security_policy.mask_config is 'Strategy-specific masking configuration.';
comment on column meta.field_security_policy.scope is 'Policy scope: global > module > entity > entity_version > record.';
comment on column meta.field_security_policy.scope_ref is 'Reference ID for scope (module_id, version_id, record_id).';
comment on column meta.field_security_policy.priority is 'Priority (lower = evaluated first, first match wins).';

create index if not exists idx_field_security_entity
  on meta.field_security_policy (tenant_id, entity_id);

create index if not exists idx_field_security_field
  on meta.field_security_policy (field_path);

create index if not exists idx_field_security_type
  on meta.field_security_policy (policy_type);

create index if not exists idx_field_security_active
  on meta.field_security_policy (is_active) where is_active = true;

create index if not exists idx_field_security_scope
  on meta.field_security_policy (scope, scope_ref);

create index if not exists idx_field_security_priority
  on meta.field_security_policy (entity_id, priority);

create index if not exists idx_field_security_lookup
  on meta.field_security_policy (tenant_id, entity_id, field_path, policy_type, is_active);

-- ============================================================================
-- CORE: Field Access Audit Log (append-only)
-- ============================================================================

create table if not exists core.field_access_log (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references core.tenant(id) on delete cascade,

  entity_key      text not null,
  record_id       uuid,

  subject_id      uuid not null,
  subject_type    text not null,

  action          text not null,
  field_path      text not null,
  was_allowed     boolean not null,

  mask_applied    text,
  policy_id       uuid references meta.field_security_policy(id) on delete set null,

  request_id      text,
  trace_id        text,
  correlation_id  text,

  created_at      timestamptz not null default now(),

  constraint field_access_log_subject_type_chk
    check (subject_type in ('user', 'service', 'system')),
  constraint field_access_log_action_chk
    check (action in ('read', 'write'))
);

comment on table core.field_access_log is
'Append-only audit log for field-level access decisions.';

comment on column core.field_access_log.entity_key is 'Entity key that was accessed.';
comment on column core.field_access_log.subject_type is 'Type of subject: user, service, system.';
comment on column core.field_access_log.was_allowed is 'Whether access was allowed.';
comment on column core.field_access_log.mask_applied is 'Masking strategy applied (if any).';
comment on column core.field_access_log.request_id is 'Request correlation ID.';
comment on column core.field_access_log.trace_id is 'OpenTelemetry trace ID.';

create index if not exists idx_field_access_log_entity
  on core.field_access_log (tenant_id, entity_key, created_at desc);

create index if not exists idx_field_access_log_subject
  on core.field_access_log (tenant_id, subject_id, created_at desc);

create index if not exists idx_field_access_log_record
  on core.field_access_log (record_id) where record_id is not null;

create index if not exists idx_field_access_log_policy
  on core.field_access_log (policy_id) where policy_id is not null;

create index if not exists idx_field_access_log_denied
  on core.field_access_log (tenant_id, created_at desc) where was_allowed = false;

create index if not exists idx_field_access_log_request
  on core.field_access_log (request_id) where request_id is not null;

-- partitioning hint for large deployments:
-- alter table core.field_access_log partition by range (created_at);
