# Kysely Schema Audit Report

**Generated:** 2026-02-13
**Scope:** All Kysely DB queries across `framework/runtime/src/services/`
**Schema Source of Truth:** `framework/adapters/db/generated/kysely/types.ts`

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total repo/service files audited | ~130 |
| Distinct tables referenced in code | ~95 |
| Tables registered in DB interface | 112 |
| **Tables MISSING from DB interface** | **~55** |
| **Schema prefix MISMATCHES (core vs meta)** | **2** |
| **Table name MISMATCHES** | **1** |
| **Column mismatches on existing tables** | **11+ (on core.attachment alone)** |

---

## PART 1: TABLES MISSING FROM DB INTERFACE

These tables are referenced in code but do NOT exist in the `export type DB = { ... }` block (lines 1643-1761 of types.ts).

### Content & Collaboration (5 + 14 tables)

| Missing Table | Referenced In |
|---|---|
| `core.entity_document_link` | EntityDocumentLinkRepo.ts |
| `core.multipart_upload` | MultipartUploadRepo.ts |
| `core.attachment_comment` | CommentRepo.ts |
| `core.attachment_access_log` | AccessLogRepo.ts |
| `core.document_acl` | DocumentAclRepo.ts |
| `core.comment_flag` | collaboration/moderation/ |
| `core.comment_moderation_status` | collaboration/moderation/ |
| `core.comment_draft` | collaboration/drafts/ |
| `core.entity_comment` | collaboration/comment/ |
| `core.comment_read_status` | collaboration/comment/ |
| `core.comment_reaction` | collaboration/reactions/ |
| `core.comment_mention` | collaboration/mentions/ |
| `core.comment_retention_policy` | collaboration/retention/ |
| `core.comment_analytics_daily` | collaboration/analytics/ |
| `core.comment_thread_analytics` | collaboration/analytics/ |
| `core.comment_user_engagement` | collaboration/analytics/ |
| `core.comment_sla_metrics` | collaboration/sla/ |
| `core.comment_sla_config` | collaboration/sla/ |
| `core.comment_response_history` | collaboration/sla/ |

### Messaging (4 tables)

| Missing Table | Referenced In |
|---|---|
| `core.conversation` | ConversationRepo.ts |
| `core.conversation_participant` | ParticipantRepo.ts |
| `core.message` | MessageRepo.ts |
| `core.message_delivery` | MessageDeliveryRepo.ts |

### Notification (7 tables)

| Missing Table | Referenced In |
|---|---|
| `core.notification_message` | notification/persistence/ |
| `core.notification_suppression` | notification/persistence/ |
| `core.notification_delivery` | notification/persistence/ |
| `core.org_unit_member` | notification/persistence/ |
| `meta.notification_provider` | notification/persistence/ |
| `meta.notification_channel` | notification/persistence/ |
| `meta.notification_template` | notification/persistence/ |
| `meta.notification_rule` | notification/persistence/ |

### Document Generation (8 tables)

| Missing Table | Referenced In |
|---|---|
| `core.doc_template` | document/persistence/ |
| `core.doc_template_version` | document/persistence/ |
| `core.doc_template_binding` | document/persistence/ |
| `core.doc_brand_profile` | document/persistence/ |
| `core.doc_letterhead` | document/persistence/ |
| `core.doc_output` | document/persistence/ |
| `core.doc_render_job` | document/persistence/ |
| `core.doc_render_dlq` | document/persistence/ |

### IAM & Identity Access (6 tables)

| Missing Table | Referenced In |
|---|---|
| `core.entity_module` | persona-capability.repository.ts |
| `core.mfa_backup_code` | mfa.service.ts |
| `core.mfa_trusted_device` | mfa.service.ts |
| `core.mfa_policy` | mfa.service.ts |
| `core.mfa_audit_log` | mfa.service.ts |
| `core.ou_membership` | policy-gate.service.ts |

### Policy Rules (1 table)

| Missing Table | Referenced In |
|---|---|
| `meta.policy_testcase` | testing/testcase-repository.ts |

### Audit & Governance (6 tables)

| Missing Table | Referenced In |
|---|---|
| `core.workflow_audit_event` | WorkflowAuditRepository.ts + 10 other files |
| `core.audit_hash_anchor` | hash-chain.service.ts, audit-integrity.service.ts |
| `core.audit_integrity_report` | audit-integrity.service.ts |
| `core.audit_outbox` | AuditOutboxRepo.ts, audit-log-retention.job.ts |
| `core.audit_dlq` | AuditDlqRepo.ts |
| `core.audit_archive_marker` | AuditArchiveMarkerRepo.ts |
| `meta.audit_policy` | audit-load-shedding.service.ts |

### Workflow Engine (5 tables)

| Missing Table | Referenced In |
|---|---|
| `meta.approval_step_instance` | workflow-engine/instance/repository.ts |
| `meta.approval_action_record` | workflow-engine/instance/repository.ts |
| `meta.entity_lock` | workflow-engine/instance/repository.ts |
| `meta.entity_state_transition` | workflow-engine/instance/repository.ts |
| `meta.approval_workflow_template` | workflow-engine/repository.ts |

### UI (3 tables)

| Missing Table | Referenced In |
|---|---|
| `ui.dashboard` | ui/dashboard.repository.ts |
| `ui.dashboard_version` | ui/dashboard.repository.ts |
| `ui.dashboard_acl` | ui/dashboard.repository.ts |

---

## PART 2: SCHEMA PREFIX MISMATCHES

These tables exist in the DB interface under one schema but are referenced in code under a different schema.

| DB Interface Entry | Code References As | File |
|---|---|---|
| `core.approval_task` (line 1649) | `meta.approval_task` | workflow-engine/task/repository.ts |
| `core.approval_instance` (line 1648) | `meta.approval_instance` | workflow-engine/instance/repository.ts |

---

## PART 3: TABLE NAME MISMATCHES

| DB Interface Entry | Code References As | File |
|---|---|---|
| `meta.approval_template` (line 1706) | `meta.approval_workflow_template` | workflow-engine/repository.ts |

---

## PART 4: COLUMN MISMATCHES ON EXISTING TABLES

### `core.attachment` — Schema type has 15 columns, code uses 26+ columns

**Columns in schema type (types.ts lines 147-162):**
`id`, `tenant_id`, `owner_entity`, `owner_entity_id`, `file_name`, `content_type`, `size_bytes`, `storage_bucket`, `storage_key`, `is_virus_scanned`, `retention_until`, `metadata`, `created_at`, `created_by`

**Additional columns used in AttachmentRepo.ts but MISSING from type:**
| Missing Column | Used In |
|---|---|
| `kind` | insert, select |
| `sha256` | insert, select |
| `original_filename` | insert, select |
| `uploaded_by` | insert, select |
| `shard` | insert |
| `version_no` | insert, select |
| `is_current` | insert, where |
| `parent_attachment_id` | insert, select |
| `replaced_at` | insert |
| `replaced_by` | insert |
| `updated_at` | insert |

### `core.audit_log` — Code may reference columns not in type

**Columns in schema type (types.ts lines 163-177):**
`id`, `tenant_id`, `occurred_at`, `actor_id`, `actor_type`, `action`, `entity_name`, `entity_id`, `entity_version_id`, `correlation_id`, `ip_address`, `user_agent`, `payload`

**Additional columns used in activity-timeline.service.ts:**
| Possibly Missing Column | Used In |
|---|---|
| `performed_by` | activity-timeline UNION query |
| `changes` | activity-timeline UNION query |
| `performed_at` | activity-timeline UNION query |

---

## PART 5: FILE-BY-FILE QUERY INVENTORY

### A. Content Persistence

#### `AttachmentRepo.ts`
- **Table:** `core.attachment`
- **Operations:** selectFrom, insertInto, updateTable, deleteFrom
- **Columns:** id, tenant_id, owner_entity, owner_entity_id, kind, file_name, content_type, size_bytes, storage_bucket, storage_key, sha256, original_filename, uploaded_by, shard, version_no, is_current, parent_attachment_id, replaced_at, replaced_by, created_at, updated_at

#### `EntityDocumentLinkRepo.ts`
- **Table:** `core.entity_document_link`
- **Operations:** selectFrom, insertInto, updateTable, deleteFrom
- **Columns:** id, tenant_id, entity_type, entity_id, attachment_id, link_type, display_name, sort_order, linked_by, linked_at, unlinked_at, unlinked_by

#### `MultipartUploadRepo.ts`
- **Table:** `core.multipart_upload`
- **Operations:** selectFrom, insertInto, updateTable, deleteFrom
- **Columns:** id, tenant_id, attachment_id, upload_id, storage_bucket, storage_key, status, parts_completed, total_parts, created_at, completed_at, expires_at

#### `CommentRepo.ts` (attachment comments)
- **Table:** `core.attachment_comment`
- **Operations:** selectFrom, insertInto, updateTable
- **Columns:** id, tenant_id, attachment_id, parent_id, author_id, body, created_at, updated_at, deleted_at

#### `AccessLogRepo.ts`
- **Table:** `core.attachment_access_log`
- **Operations:** selectFrom, insertInto
- **Columns:** id, tenant_id, attachment_id, user_id, action, ip_address, user_agent, accessed_at

#### `DocumentAclRepo.ts`
- **Table:** `core.document_acl`
- **Operations:** selectFrom, insertInto, updateTable, deleteFrom
- **Columns:** id, tenant_id, attachment_id, principal_type, principal_id, permission, granted_by, granted_at, revoked_at

---

### B. Messaging Persistence

#### `ConversationRepo.ts`
- **Table:** `core.conversation`
- **Operations:** selectFrom, insertInto, updateTable, innerJoin
- **Columns:** id, tenant_id, type, title, created_at, created_by, updated_at, updated_by
- **Joins:** core.conversation_participant (as cp, cp1, cp2)

#### `MessageRepo.ts`
- **Table:** `core.message`
- **Operations:** selectFrom, insertInto, updateTable, raw sql (ts_rank, ts_headline, body_tsv)
- **Columns:** id, tenant_id, conversation_id, sender_id, body, body_format, client_message_id, parent_message_id, body_tsv, created_at, edited_at, deleted_at

#### `ParticipantRepo.ts`
- **Table:** `core.conversation_participant`
- **Operations:** selectFrom, insertInto, updateTable
- **Columns:** id, tenant_id, conversation_id, user_id, role, joined_at, left_at, last_read_message_id, last_read_at

#### `MessageDeliveryRepo.ts`
- **Table:** `core.message_delivery`
- **Operations:** selectFrom, insertInto, updateTable
- **Columns:** id, tenant_id, message_id, recipient_id, delivered_at, read_at

---

### C. Notification Persistence

- **Tables:** core.notification_message, core.notification_suppression, core.notification_delivery, core.org_unit_member, meta.notification_provider, meta.notification_channel, meta.notification_template, meta.notification_rule
- **Note:** All 8 tables missing from DB interface. Repos use standard CRUD patterns with tenant isolation.

---

### D. Document Generation Persistence

- **Tables:** core.doc_template, core.doc_template_version, core.doc_template_binding, core.doc_brand_profile, core.doc_letterhead, core.doc_output, core.doc_render_job, core.doc_render_dlq
- **Note:** All 8 tables missing from DB interface. Repos handle template management, rendering pipeline, and DLQ.

---

### E. Collaboration Persistence

- **Tables:** core.entity_comment, core.comment_flag, core.comment_moderation_status, core.comment_draft, core.comment_read_status, core.comment_reaction, core.comment_mention, core.comment_retention_policy, core.comment_analytics_daily, core.comment_thread_analytics, core.comment_user_engagement, core.comment_sla_metrics, core.comment_sla_config, core.comment_response_history
- **Note:** All 14 tables missing from DB interface. Extensive comment, moderation, analytics, and SLA subsystem.

---

### F. Policy Rules

#### `decision-logger.service.ts`
- **Tables:** `core.permission_decision_log` (EXISTS), `meta.meta_audit` (EXISTS)
- **Operations:** insertInto, selectFrom, groupBy
- **Key columns:** id, tenant_id, actor_principal_id, subject_snapshot, entity_name, entity_id, operation_code, effect, matched_rule_id, matched_policy_version_id, reason, correlation_id

#### `facts-provider.ts`
- **Tables:** `core.principal`, `core.role_binding`, `core.role`, `core.group_member`, `core.group`, `core.principal_attribute`, `core.ou_node`, `meta.meta_entities`, `meta.meta_versions` (all EXIST)
- **Operations:** selectFrom, innerJoin, where (temporal validity checks)

#### `policy-store.ts`
- **Tables:** `meta.permission_policy`, `meta.permission_policy_version`, `meta.permission_rule`, `meta.permission_rule_operation` (all EXIST)
- **Operations:** selectFrom, innerJoin, where, orderBy

#### `operation-catalog.service.ts`
- **Table:** `meta.operation` (EXISTS)
- **Operations:** selectFrom, insertInto
- **Columns:** id, namespace, code, name, description, sort_order, source_type, is_active, created_by

#### `policy-compiler.service.ts`
- **Tables:** `meta.permission_policy_compiled`, `meta.permission_policy_version`, `meta.permission_policy`, `meta.permission_rule`, `meta.permission_rule_operation` (all EXIST)
- **Operations:** selectFrom, insertInto, innerJoin

#### `policy-gate.service.ts`
- **Table:** `core.ou_membership` (MISSING)
- **Columns:** ou_node_id, ou_path, principal_id, is_primary

#### `policy-resolution.service.ts`
- **Tables:** `meta.permission_policy`, `meta.permission_policy_version` (both EXIST)
- **Operations:** selectFrom, insertInto, updateTable, innerJoin, limit, offset

#### `subject-resolver.service.ts`
- **Tables:** `core.principal`, `core.role_binding`, `core.role`, `core.group_member`, `core.group`, `core.principal_attribute`, `core.ou_node` (all EXIST)
- **Operations:** selectFrom, innerJoin, where (temporal validity)

#### `testing/testcase-repository.ts`
- **Table:** `meta.policy_testcase` (MISSING)
- **Operations:** full CRUD (selectAll, insertInto, updateTable, deleteFrom)
- **Columns:** id, tenant_id, name, description, policy_id, input, expected, assertions, tags, is_enabled, created_at, created_by, updated_at, updated_by, last_run_at, last_run_result, last_run_duration_ms, last_run_error

---

### G. IAM & Identity Access

#### `persona-capability.repository.ts`
- **Tables (all EXIST except 1):** `core.persona`, `core.operation_category`, `core.operation`, `core.persona_capability`, `core.module`, `core.tenant_module_subscription`, `core.entity_module` (MISSING)
- **14 queries** covering persona, operation, capability, module, and subscription lookups.

#### `mfa.service.ts`
- **Tables (2 EXIST, 4 MISSING):** `core.mfa_config` (EXISTS), `core.mfa_challenge` (EXISTS), `core.mfa_backup_code` (MISSING), `core.mfa_trusted_device` (MISSING), `core.mfa_policy` (MISSING), `core.mfa_audit_log` (MISSING), `core.principal_profile` (EXISTS), `core.role_binding` (EXISTS)
- **33 queries** covering full MFA lifecycle (enroll, verify, challenge, backup codes, trusted devices, audit).

#### `principal-search.handler.ts`
- **Table:** `core.principal` (EXISTS)
- **Columns used:** id, username, display_name, email, tenant_id, is_active

#### `entitlement-snapshot.service.ts`
- **Table:** `core.entitlement_snapshot` (EXISTS)
- **7 queries** for cache CRUD operations.

#### `role-binding.service.ts`
- **Tables (all EXIST):** `core.role`, `core.role_binding`, `core.group_member`
- **11 queries** covering role CRUD, binding management, principal role resolution.

#### `group-sync.service.ts`
- **Tables (all EXIST):** `core.group`, `core.group_member`
- **13 queries** covering group sync, member management, principal group resolution.

#### `identity-mapper.service.ts`
- **Tables (all EXIST):** `core.principal`, `core.idp_identity`, `core.principal_profile`
- **12 queries** covering identity mapping, principal creation, profile management.

#### `ou-membership.service.ts`
- **Tables (all EXIST):** `core.ou_node`, `core.principal_attribute`
- **17 queries** covering OU node CRUD, principal attribute management, subtree queries.

#### `tenant-resolver.service.ts`
- **Tables (all EXIST):** `core.tenant`, `core.tenant_profile`
- **10 queries** covering tenant resolution, profile management.

---

### H. Audit & Governance

#### `WorkflowAuditRepository.ts`
- **Table:** `core.workflow_audit_event` (MISSING)
- **Operations:** insertInto, selectFrom, selectAll, where, orderBy, limit, offset, fn.countAll
- **35 columns:** id, tenant_id, event_type, severity, schema_version, instance_id, step_instance_id, entity_type, entity_id, entity, workflow, workflow_template_code, workflow_template_version, actor, actor_user_id, actor_is_admin, module_code, action, previous_state, new_state, comment, attachments, details, ip_address, user_agent, correlation_id, session_id, trace_id, hash_prev, hash_curr, is_redacted, redaction_version, key_version, event_timestamp, created_at

#### `AuditOutboxRepo.ts`
- **Table:** `core.audit_outbox` (MISSING)
- **Operations:** insertInto, updateTable, selectFrom, raw SQL (FOR UPDATE SKIP LOCKED)
- **Columns:** id, tenant_id, event_type, payload, status, attempts, max_attempts, available_at, created_at, locked_at, locked_by, last_error

#### `AuditDlqRepo.ts`
- **Table:** `core.audit_dlq` (MISSING)
- **Operations:** insertInto, selectFrom, updateTable
- **Columns:** id, tenant_id, outbox_id, event_type, payload, last_error, error_category, attempt_count, dead_at, replay_count, correlation_id, created_at, replayed_at, replayed_by

#### `AuditArchiveMarkerRepo.ts`
- **Table:** `core.audit_archive_marker` (MISSING)
- **Operations:** insertInto, selectFrom, updateTable
- **Columns:** id, partition_name, partition_month, ndjson_key, sha256, row_count, archived_at, archived_by, detached_at, created_at

#### `hash-chain.service.ts`
- **Tables:** `core.workflow_audit_event` (MISSING), `core.audit_hash_anchor` (MISSING)
- **Operations:** selectFrom, insertInto (with onConflict doNothing)

#### `audit-integrity.service.ts`
- **Tables:** `core.workflow_audit_event`, `core.audit_hash_anchor`, `core.audit_integrity_report` (all MISSING), `core.security_event` (EXISTS)
- **Operations:** raw SQL (select, insert, update)

#### `activity-timeline.service.ts`
- **Tables:** `core.workflow_audit_event` (MISSING), `core.permission_decision_log` (EXISTS), `core.field_access_log` (EXISTS), `core.security_event` (EXISTS), `core.audit_log` (EXISTS)
- **Operations:** raw SQL UNION ALL query

#### `audit-log-retention.job.ts`
- **Tables:** `meta.meta_audit` (EXISTS), `core.permission_decision_log` (EXISTS), `core.workflow_audit_event` (MISSING), `core.audit_outbox` (MISSING)
- **Operations:** raw SQL DELETE with RETURNING

#### `audit-load-shedding.service.ts`
- **Table:** `meta.audit_policy` (MISSING)
- **Operations:** raw SQL SELECT

#### `audit-feature-flags.ts`
- **Table:** `core.feature_flag` (EXISTS)
- **Operations:** selectFrom, select, where

#### `audit-export.service.ts` / `audit-query-gate.ts`
- **Table:** `core.security_event` (EXISTS)
- **Operations:** insertInto

---

### I. Workflow Engine

#### `workflow-engine/task/repository.ts`
- **Table:** `meta.approval_task` (DB has `core.approval_task` — **SCHEMA MISMATCH**)
- **Operations:** selectFrom, insertInto, updateTable, deleteFrom
- **Columns:** id, tenant_id, org_id, instance_id, step_instance_id, assignment_id, type, status, priority, assignee_id, assignee_display_name, assignee_email, title, description, entity_type, entity_id, entity_reference_code, entity_display_name, template_code, template_name, step_name, step_level, requester (JSON), available_actions (JSON), due_at, warning_at, is_overdue, time_remaining_ms, sla_status, delegation (JSON), escalation (JSON), is_read, read_at, created_at, completed_at, updated_at

#### `workflow-engine/instance/repository.ts`
- **Tables:**
  - `meta.approval_instance` (DB has `core.approval_instance` — **SCHEMA MISMATCH**)
  - `meta.approval_step_instance` (MISSING)
  - `meta.approval_action_record` (MISSING)
  - `meta.entity_lock` (MISSING)
  - `meta.entity_state_transition` (MISSING)
- **Operations:** full CRUD, transactions
- **Note:** Extensive JSON column usage for workflow_snapshot, approvers, conditions, sla, etc.

#### `workflow-engine/repository.ts`
- **Table:** `meta.approval_workflow_template` (DB has `meta.approval_template` — **NAME MISMATCH**)
- **Operations:** selectFrom, insertInto, updateTable, deleteFrom
- **Columns:** id, tenant_id, name, code, description, entity_type, custom_entity_type, version, is_active, is_enabled, priority, triggers (JSON), steps (JSON), global_sla (JSON), allowed_actions (JSON), metadata (JSON), created_at, created_by, updated_at, updated_by, published_at, published_by

---

### J. UI

#### `ui/dashboard.repository.ts`
- **Tables:**
  - `ui.dashboard` (MISSING — DB only has `ui.dashboard_widget`)
  - `ui.dashboard_version` (MISSING)
  - `ui.dashboard_acl` (MISSING)
- **Operations:** selectFrom, insertInto, updateTable, deleteFrom, innerJoin, LEFT JOIN, transactions
- **Columns (ui.dashboard):** id, tenant_id, code, title_key, description_key, module_code, workbench, visibility, icon, sort_order, is_hidden, forked_from_id, owner_id, created_at, created_by, updated_at, updated_by
- **Columns (ui.dashboard_version):** id, tenant_id, dashboard_id, version_no, status, layout (JSON), published_at, published_by, created_at, created_by
- **Columns (ui.dashboard_acl):** id, tenant_id, dashboard_id, principal_type, principal_key, permission, created_at, created_by

---

### K. Foundation Security

#### `field-security/field-security.repository.ts`
- **Tables:** `meta.field_security_policy` (EXISTS), `core.field_access_log` (EXISTS)
- **Operations:** selectFrom, insertInto, updateTable, deleteFrom
- **Policy columns:** id, entity_id, field_path, policy_type, role_list, abac_condition (JSON), mask_strategy, mask_config (JSON), scope, scope_ref, priority, is_active, tenant_id, created_at, created_by, updated_at, updated_by, version
- **Access log columns:** entity_key, record_id, subject_id, subject_type, action, field_path, was_allowed, mask_applied, policy_id, request_id, trace_id, tenant_id, created_at

---

## PART 6: TABLES IN DB INTERFACE (Complete List)

For reference, these 112 tables are registered in the `export type DB` block:

### core.* (59 tables)
```
core.address, core.address_link, core.approval_comment, core.approval_definition,
core.approval_instance, core.approval_task, core.attachment, core.audit_log,
core.contact_phone, core.contact_point, core.document, core.email_otp_instance,
core.entitlement, core.entity_tag, core.feature_flag, core.field_access_log,
core.group, core.group_member, core.idp_identity, core.job, core.job_run,
core.lifecycle, core.lifecycle_version, core.mfa_challenge, core.mfa_config,
core.module, core.operation, core.operation_category, core.organizational_unit,
core.outbox, core.password_history, core.permission_decision_log, core.persona,
core.persona_capability, core.principal, core.principal_group,
core.principal_locale_override, core.principal_ou, core.principal_profile,
core.principal_role, core.principal_workspace_access, core.role, core.role_binding,
core.entitlement_snapshot, core.ou_node, core.principal_attribute,
core.security_event, core.sms_otp_instance, core.system_config, core.tenant,
core.tenant_locale_policy, core.tenant_module_subscription, core.tenant_profile,
core.totp_instance, core.trusted_device, core.webauthn_credential,
core.workflow_instance, core.workflow_transition, core.workspace,
core.workspace_feature, core.workspace_usage_metric, core.notification_dlq,
core.notification_digest_staging, core.notification_preference, core.whatsapp_consent
```

### meta.* (25 tables)
```
meta.approval_sla_policy, meta.approval_template, meta.approval_template_rule,
meta.approval_template_stage, meta.entity, meta.entity_compiled,
meta.entity_compiled_overlay, meta.entity_lifecycle,
meta.entity_lifecycle_route_compiled, meta.entity_policy, meta.entity_version,
meta.field, meta.field_security_policy, meta.index_def, meta.lifecycle,
meta.lifecycle_state, meta.lifecycle_timer_policy, meta.lifecycle_transition,
meta.lifecycle_transition_gate, meta.overlay, meta.overlay_change,
meta.permission_policy, meta.permission_policy_compiled,
meta.permission_policy_version, meta.permission_rule,
meta.permission_rule_operation, meta.meta_audit, meta.meta_entities,
meta.meta_versions, meta.numbering_sequence, meta.operation, meta.relation
```

### ref.* (10 tables)
```
ref.commodity_code, ref.commodity_domain, ref.country, ref.currency,
ref.industry_code, ref.industry_domain, ref.label, ref.language, ref.locale,
ref.state_region, ref.timezone, ref.uom
```

### ui.* (7 tables)
```
ui.dashboard_widget, ui.notification, ui.notification_preference,
ui.recent_activity, ui.saved_view, ui.search_history, ui.user_preference
```

### Other
```
schema_provisions
```

---

## PART 7: CRITICAL ISSUES RANKED BY SEVERITY

### Severity 1: Schema Prefix Mismatches (Runtime Query Failures)
These will cause Kysely to not find the table at all because the schema prefix is wrong:
1. Code uses `meta.approval_task` but DB has `core.approval_task`
2. Code uses `meta.approval_instance` but DB has `core.approval_instance`

### Severity 2: Table Name Mismatches
1. Code uses `meta.approval_workflow_template` but DB has `meta.approval_template`

### Severity 3: Column Mismatches on Existing Tables
1. `core.attachment` — 11+ columns referenced in code but not in type definition

### Severity 4: Missing Tables (~55 total)
All tables listed in Part 1 above. Code uses `TABLE as any` cast which suppresses TypeScript errors but will fail at runtime if the actual PostgreSQL table doesn't exist.

---

*End of Report*
