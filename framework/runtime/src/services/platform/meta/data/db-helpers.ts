/**
 * Database Helper Utilities for META Services
 *
 * Provides Kysely helpers and type augmentations for lifecycle/approval tables
 */

import type { Kysely } from "kysely";
import type { DB } from "@athyper/adapter-db";
import { sql } from "kysely";

/**
 * Require a row to exist, throw error if undefined
 */
export function requireRow<T>(row: T | undefined, msg: string): T {
  if (!row) throw new Error(msg);
  return row;
}

/**
 * Get current timestamp for database inserts
 */
export function now() {
  return sql<Date>`now()`;
}

/**
 * Generate UUID for new records
 */
export function uuid() {
  return crypto.randomUUID();
}

/**
 * Lifecycle table types (augment DB when types are generated)
 */
export type LifecycleDB = DB & {
  "meta.lifecycle": {
    id: string;
    tenant_id: string;
    code: string;
    name: string;
    description: string | null;
    version_no: number;
    is_active: boolean;
    created_at: Date;
    created_by: string;
  };

  "meta.lifecycle_state": {
    id: string;
    tenant_id: string;
    lifecycle_id: string;
    code: string;
    name: string;
    is_terminal: boolean;
    sort_order: number;
    created_at: Date;
    created_by: string;
  };

  "meta.lifecycle_transition": {
    id: string;
    tenant_id: string;
    lifecycle_id: string;
    from_state_id: string;
    to_state_id: string;
    operation_code: string;
    is_active: boolean;
    created_at: Date;
    created_by: string;
  };

  "meta.lifecycle_transition_gate": {
    id: string;
    tenant_id: string;
    transition_id: string;
    required_operations: unknown | null; // jsonb
    approval_template_id: string | null;
    conditions: unknown | null; // jsonb
    threshold_rules: unknown | null; // jsonb
    created_at: Date;
    created_by: string;
  };

  "meta.entity_lifecycle": {
    id: string;
    tenant_id: string;
    entity_name: string;
    lifecycle_id: string;
    conditions: unknown | null; // jsonb
    priority: number;
    created_at: Date;
    created_by: string;
  };

  "meta.entity_lifecycle_route_compiled": {
    id: string;
    tenant_id: string;
    entity_name: string;
    compiled_json: unknown; // jsonb
    compiled_hash: string;
    generated_at: Date;
    created_at: Date;
    created_by: string;
  };

  "core.entity_lifecycle_instance": {
    id: string;
    tenant_id: string;
    entity_name: string;
    entity_id: string;
    lifecycle_id: string;
    state_id: string;
    updated_at: Date;
    updated_by: string;
  };

  "core.entity_lifecycle_event": {
    id: string;
    tenant_id: string;
    entity_name: string;
    entity_id: string;
    lifecycle_id: string;
    from_state_id: string | null;
    to_state_id: string;
    operation_code: string;
    occurred_at: Date;
    actor_id: string | null;
    payload: unknown | null; // jsonb
    correlation_id: string | null;
  };

  "core.permission_decision_log": {
    id: string;
    tenant_id: string;
    occurred_at: Date;
    actor_principal_id: string | null;
    subject_snapshot: unknown | null; // jsonb
    entity_name: string | null;
    entity_id: string | null;
    entity_version_id: string | null;
    operation_code: string;
    effect: string; // 'allow' | 'deny'
    matched_rule_id: string | null;
    matched_policy_version_id: string | null;
    reason: string | null;
    correlation_id: string | null;
  };
};

/**
 * Type-safe Kysely instance with lifecycle tables
 */
export type LifecycleDB_Type = Kysely<LifecycleDB>;
