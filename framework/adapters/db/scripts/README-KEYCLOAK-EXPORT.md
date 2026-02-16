# Keycloak Export/Import Guide

Complete guide for exporting and importing Keycloak realms in the athyper platform.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Export Methods](#export-methods)
3. [Import Methods](#import-methods)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

---

## Overview

### Available Tools
```
framework/adapters/db/
├── scripts/
│   ├── keycloak-export.sh      # JSON export via Keycloak CLI
│   ├── postgres-export.sh      # PostgreSQL database dump
│   └── keycloak-import.sh      # Universal import script
└── src/sql/
    ├── extract_tables.sh       # Extract specific tables from dump
    └── 300_keycloak_iam_seed.sql  # Version-controlled seed file
```

### Export Comparison

| Method | Format | Users | Size | Use Case |
|--------|--------|-------|------|----------|
| **JSON Export** | JSON | ✅ Yes | Small | Single realm, portable |
| **PostgreSQL Dump** | SQL | ✅ Yes | Large | Full backup, version control |
| **Seed Extraction** | SQL | ✅ Yes | Medium | Curated seed data |
| **Admin Console** | JSON | ❌ No | Tiny | Quick config backup |

---

## Export Methods

### Method 1: JSON Export (Recommended for Single Realm)

**Best for**: Portable realm exports, Keycloak version migrations

```bash
cd framework/adapters/db/scripts
chmod +x keycloak-export.sh
./keycloak-export.sh
```

**What it exports**:
- ✅ All realm configurations
- ✅ Users with credentials
- ✅ Clients, roles, groups
- ✅ Authentication flows
- ✅ Organizations (Keycloak 26+)

**Output**: `./exports/athyper-realm.json`

**Pros**:
- Official Keycloak format
- Version-agnostic (mostly)
- Small file size
- Easy to share

**Cons**:
- One realm at a time
- Requires Keycloak runtime
- Can't export master realm easily

---

### Method 2: PostgreSQL Full Dump (Recommended for Backups)

**Best for**: Complete backups, disaster recovery, environment cloning

```bash
cd framework/adapters/db/scripts
chmod +x postgres-export.sh

# Set environment variables (if not using defaults)
export IAM_DB_HOST=localhost
export IAM_DB_PORT=5432
export IAM_DB_NAME=athyperauth_dev1
export IAM_DB_USERNAME=athyperauth

./postgres-export.sh
```

**What it exports**:
- ✅ All realms (master + athyper)
- ✅ Complete database schema
- ✅ All users, sessions, events
- ✅ Keycloak internal tables

**Output**:
- `./exports/dump-athyperauth_dev1-YYYYMMDDHHMM.sql` - Full dump
- `../sql/300_keycloak_iam_seed.sql` - Extracted seed
- `./exports/keycloak-data-only-YYYYMMDDHHMM.sql` - Data only

**Pros**:
- Complete backup
- All realms included
- Direct database access
- Fast

**Cons**:
- Large file size
- PostgreSQL-specific
- Includes internal Keycloak data

---

### Method 3: Seed Extraction (Current Implementation)

**Best for**: Version-controlled seed data, reproducible environments

Your current workflow:
```bash
cd framework/adapters/db/src/sql

# 1. Create full dump
docker exec -i athyper-mesh-dbpool-auth-1 \
  pg_dump -U athyperauth athyperauth_dev1 > dump-athyperauth_dev1-$(date +%Y%m%d%H%M).sql

# 2. Extract specific tables
./extract_tables.sh

# 3. Result: 300_keycloak_iam_seed.sql (163KB, curated)
```

**What the extraction script does**:
- Extracts **48 tables** in dependency order
- Filters out:
  - Event logs
  - Sessions
  - Admin events
  - Temporary data
- Includes:
  - Realm configurations
  - Clients and scopes
  - Users and credentials
  - Roles and groups
  - Organizations
  - Authentication flows

**Tables extracted**:
```
realm, realm_attribute, realm_required_credential, realm_enabled_event_types,
realm_events_listeners, realm_supported_locales, realm_smtp_config,
realm_localizations, authentication_flow, authentication_execution,
authenticator_config, authenticator_config_entry, required_action_provider,
client_scope, client_scope_attributes, default_client_scope, client,
client_attributes, client_auth_flow_bindings, redirect_uris, web_origins,
client_scope_client, client_scope_role_mapping, protocol_mapper,
protocol_mapper_config, keycloak_role, composite_role, scope_mapping,
keycloak_group, group_attribute, group_role_mapping, realm_default_groups,
org, org_domain, user_entity, credential, user_role_mapping,
user_group_membership, component, component_config
```

**Pros**:
- Small, focused file
- Version control friendly
- No noise (events, sessions)
- Curated for seed data

**Cons**:
- Requires PostgreSQL access
- Two-step process
- Manual script maintenance

---

### Method 4: Admin Console (Quick Config Backup)

**Best for**: Quick configuration snapshots (no users)

1. Open Keycloak Admin Console: `http://localhost/auth` (or your IAM_HOST)
2. Select realm: **athyper**
3. Go to: **Realm Settings** > **Action** > **Partial Export**
4. Configure export:
   - ☑ Export groups and roles
   - ☑ Export clients
   - ☐ Export users (not available in partial export)
5. Click **Export**

**Output**: `athyper-realm-partial.json`

**Pros**:
- No command line needed
- Quick and easy
- Good for config review

**Cons**:
- **No users exported**
- Manual download
- Limited options
- One realm at a time

---

## Import Methods

### Universal Import Script

```bash
cd framework/adapters/db/scripts
chmod +x keycloak-import.sh

# Import seed file (default: 300_keycloak_iam_seed.sql)
./keycloak-import.sh seed

# Import custom seed file
./keycloak-import.sh seed /path/to/custom-seed.sql

# Import JSON realm export
./keycloak-import.sh json /path/to/realm-export.json

# Import full PostgreSQL dump
./keycloak-import.sh full-dump /path/to/dump.sql
```

### Manual Import Methods

#### SQL Seed Import
```bash
# Via Docker
docker exec -i athyper-mesh-dbpool-auth-1 \
  psql -U athyperauth -d athyperauth_dev1 \
  < framework/adapters/db/src/sql/300_keycloak_iam_seed.sql

# Direct psql (if accessible)
psql -h localhost -U athyperauth -d athyperauth_dev1 \
  < framework/adapters/db/src/sql/300_keycloak_iam_seed.sql

# Restart Keycloak
docker compose restart iam
```

#### JSON Realm Import
```bash
# Via Keycloak CLI
docker run --rm \
  --network athyper-mesh-edge \
  -v $(pwd)/exports:/opt/keycloak/data/import \
  -e KC_DB=postgres \
  -e KC_DB_URL=jdbc:postgresql://dbpool-auth:5432/athyperauth_dev1 \
  -e KC_DB_USERNAME=athyperauth \
  -e KC_DB_PASSWORD=${IAM_DB_PASSWORD} \
  quay.io/keycloak/keycloak:26.5.1 \
  import \
  --dir /opt/keycloak/data/import \
  --override true
```

#### Admin Console Import
1. Go to: **Realm Settings** > **Action** > **Partial Import**
2. Choose JSON file
3. Select import options:
   - ☑ If a resource exists: **Overwrite**
4. Click **Import**

---

## Best Practices

### 1. **Regular Backups**
```bash
# Automated daily backup (crontab example)
0 2 * * * /path/to/postgres-export.sh > /var/log/keycloak-backup.log 2>&1
```

### 2. **Version Control Workflow**
```bash
# Before making Keycloak changes:
cd framework/adapters/db/scripts
./postgres-export.sh

# Commit the seed file
git add ../sql/300_keycloak_iam_seed.sql
git commit -m "Update Keycloak seed: added new client for API v2"
```

### 3. **Environment Promotion**
```
Development → Staging → Production

1. Export from dev:     ./postgres-export.sh
2. Extract seed:        ./extract_tables.sh
3. Review changes:      git diff
4. Test import:         ./keycloak-import.sh seed (in staging)
5. Production deploy:   ./keycloak-import.sh seed (after approval)
```

### 4. **Security Considerations**

⚠️ **Warning**: Exported files contain sensitive data!

```bash
# Encrypt exports before storing
gpg --symmetric --cipher-algo AES256 dump-athyperauth_dev1.sql

# Decrypt before import
gpg --decrypt dump-athyperauth_dev1.sql.gpg > dump-athyperauth_dev1.sql
```

**Never commit to git**:
- Full dumps with user credentials
- Files with sensitive realm secrets
- Files containing real user data

**Safe to commit**:
- Seed files with test users only
- Configuration-only exports
- Sanitized realm configurations

### 5. **Data Sanitization**

Before committing seed files:
```sql
-- Remove real user emails
UPDATE user_entity SET email = CONCAT('user', id, '@example.com');

-- Reset all passwords to test password
DELETE FROM credential;

-- Remove sensitive realm attributes
DELETE FROM realm_attribute WHERE name LIKE '%smtp%';
```

### 6. **Testing Import**

```bash
# Always test in a non-production environment first
docker compose -f mesh/compose/compose.yml \
  --profile test up -d

# Import and verify
./keycloak-import.sh seed
docker compose logs -f iam

# Check for errors
docker exec athyper-mesh-dbpool-auth-1 \
  psql -U athyperauth -d athyperauth_dev1 \
  -c "SELECT id, name, enabled FROM realm;"
```

---

## Troubleshooting

### Export Issues

#### "Permission denied" on scripts
```bash
chmod +x framework/adapters/db/scripts/*.sh
```

#### "Connection refused" to database
```bash
# Check database is running
docker compose ps dbpool-auth

# Check database connection
docker exec -it athyper-mesh-dbpool-auth-1 \
  psql -U athyperauth -d athyperauth_dev1 -c '\dt'
```

#### JSON export fails with "realm not found"
```bash
# List available realms
docker exec -it athyper-mesh-iam-1 \
  /opt/keycloak/bin/kcadm.sh get realms \
  --no-config --server http://localhost:8080 \
  --realm master --user ${KEYCLOAK_ADMIN} --password ${KEYCLOAK_ADMIN_PASSWORD}
```

### Import Issues

#### "Constraint violation" errors
```sql
-- Check for existing data conflicts
-- Clean database before import (DESTRUCTIVE!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO athyperauth;
```

#### "Duplicate key" on import
```bash
# Use --override flag for JSON imports
# Or truncate tables before SQL import
TRUNCATE TABLE realm CASCADE;
```

#### Import succeeds but Keycloak shows old data
```bash
# Keycloak caches data - restart required
docker compose restart iam

# Clear Keycloak cache
docker exec -it athyper-mesh-iam-1 \
  /opt/keycloak/bin/kcadm.sh cache clear \
  --no-config --server http://localhost:8080
```

---

## Quick Reference

### Common Commands

```bash
# Export everything (recommended for backups)
cd framework/adapters/db/scripts && ./postgres-export.sh

# Export single realm to JSON
cd framework/adapters/db/scripts && ./keycloak-export.sh

# Import seed file
cd framework/adapters/db/scripts && ./keycloak-import.sh seed

# Check database size
docker exec athyper-mesh-dbpool-auth-1 \
  psql -U athyperauth -d athyperauth_dev1 \
  -c "SELECT pg_size_pretty(pg_database_size('athyperauth_dev1'));"

# Count users in realm
docker exec athyper-mesh-dbpool-auth-1 \
  psql -U athyperauth -d athyperauth_dev1 \
  -c "SELECT COUNT(*) FROM user_entity WHERE realm_id = (SELECT id FROM realm WHERE name = 'athyper');"
```

---

## Environment Variables

Set these in `mesh/env/.env` or export before running scripts:

```bash
# Database
IAM_DB_HOST=localhost
IAM_DB_PORT=5432
IAM_DB_NAME=athyperauth_dev1
IAM_DB_USERNAME=athyperauth
IAM_DB_PASSWORD=<your-password>
IAM_DB_URL=jdbc:postgresql://dbpool-auth:5432/athyperauth_dev1

# Keycloak Admin
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<admin-password>
IAM_HOST=localhost
```

---

## Additional Resources

- [Keycloak Export/Import Documentation](https://www.keycloak.org/server/importExport)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- Project Auth Documentation: `docs/security/AUTH_ARCHITECTURE.md`
- Project Runbooks: `docs/runbooks/auth-operations.md`

---

**Last Updated**: 2026-02-16
**Keycloak Version**: 26.5.1
**PostgreSQL Version**: 16+
