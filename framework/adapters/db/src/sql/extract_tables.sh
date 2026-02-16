#!/bin/bash
# Extract specific tables from Keycloak data dump
INPUT_FILE="keycloak_data.sql"
OUTPUT_FILE="300_keycloak_iam_seed.sql"

# Tables to extract in dependency order
TABLES=(
  "realm"
  "realm_attribute"
  "realm_required_credential"
  "realm_enabled_event_types"
  "realm_events_listeners"
  "realm_supported_locales"
  "realm_smtp_config"
  "realm_localizations"
  "authentication_flow"
  "authentication_execution"
  "authenticator_config"
  "authenticator_config_entry"
  "required_action_provider"
  "client_scope"
  "client_scope_attributes"
  "default_client_scope"
  "client"
  "client_attributes"
  "client_auth_flow_bindings"
  "redirect_uris"
  "web_origins"
  "client_scope_client"
  "client_scope_role_mapping"
  "protocol_mapper"
  "protocol_mapper_config"
  "keycloak_role"
  "composite_role"
  "scope_mapping"
  "keycloak_group"
  "group_attribute"
  "group_role_mapping"
  "realm_default_groups"
  "org"
  "org_domain"
  "user_entity"
  "credential"
  "user_role_mapping"
  "user_group_membership"
  "component"
  "component_config"
)

# Start output file with header
cat > "$OUTPUT_FILE" << 'HEADER'
/* ============================================================================
   Athyper — Keycloak IAM Seed Data
   
   This file contains essential Keycloak configuration for IAM:
   - Realm configurations (master, athyper)
   - Client configurations (neon-web, etc.)
   - Organizations (demo_in, demo_my, demo_sa, demo_qa, demo_fr)
   - Roles (realm and client roles)
   - Users and Groups
   - Authentication flows
   
   PostgreSQL 16+
   Target Database: athyperauth_dev1 (Keycloak database)
   
   Generated from: dump-athyperauth_dev1-202602161343.sql
   Generated on: 2026-02-16
   ============================================================================ */

BEGIN;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = 'on';

HEADER

# Extract each table
for table in "${TABLES[@]}"; do
  echo "Extracting table: $table"
  echo "" >> "$OUTPUT_FILE"
  echo "-- ============================================================================" >> "$OUTPUT_FILE"
  echo "-- Data for table: $table" >> "$OUTPUT_FILE"
  echo "-- ============================================================================" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  
  # Find the COPY statement and extract until \. (end marker)
  awk "/^COPY public.$table /,/^\\\.$/" "$INPUT_FILE" >> "$OUTPUT_FILE"
  
  echo "" >> "$OUTPUT_FILE"
done

# Add commit at the end
echo "" >> "$OUTPUT_FILE"
echo "COMMIT;" >> "$OUTPUT_FILE"

echo "Seed file created: $OUTPUT_FILE"
