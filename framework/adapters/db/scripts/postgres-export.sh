#!/bin/bash
# =======================================================================
# PostgreSQL-based Keycloak Database Export
# Direct database dump approach (your current method enhanced)
# =======================================================================

set -e

TIMESTAMP=$(date +%Y%m%d%H%M)
EXPORT_DIR="./exports"
DUMP_FILE="${EXPORT_DIR}/dump-athyperauth_dev1-${TIMESTAMP}.sql"
SEED_FILE="../sql/300_keycloak_iam_seed.sql"

# Database connection (update these or use environment variables)
DB_HOST="${IAM_DB_HOST:-localhost}"
DB_PORT="${IAM_DB_PORT:-5432}"
DB_NAME="${IAM_DB_NAME:-athyperauth_dev1}"
DB_USER="${IAM_DB_USERNAME:-athyperauth}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Keycloak PostgreSQL Export ===${NC}"
echo -e "${YELLOW}Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}${NC}\n"

mkdir -p "${EXPORT_DIR}"

# Method 1: Full database dump (all schemas and tables)
echo -e "${GREEN}[1/3] Creating full database dump...${NC}"
docker exec -i athyper-mesh-dbpool-auth-1 \
  pg_dump -U "${DB_USER}" \
  --format=plain \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  "${DB_NAME}" > "${DUMP_FILE}"

echo -e "${GREEN}Full dump created: ${DUMP_FILE}${NC}"
echo -e "Size: $(du -h "${DUMP_FILE}" | cut -f1)\n"

# Method 2: Extract specific tables for seed file
echo -e "${GREEN}[2/3] Extracting seed data from dump...${NC}"
cd "$(dirname "${DUMP_FILE}")"
bash ../../../db/src/sql/extract_tables.sh

if [ -f "300_keycloak_iam_seed.sql" ]; then
  echo -e "${GREEN}Moving seed file to SQL directory...${NC}"
  mv 300_keycloak_iam_seed.sql "${SEED_FILE}"
fi

# Method 3: Data-only dump for specific tables
echo -e "${GREEN}[3/3] Creating data-only export for critical tables...${NC}"
DATA_ONLY_FILE="${EXPORT_DIR}/keycloak-data-only-${TIMESTAMP}.sql"

docker exec -i athyper-mesh-dbpool-auth-1 \
  pg_dump -U "${DB_USER}" \
  --data-only \
  --no-owner \
  --no-acl \
  --table='public.realm' \
  --table='public.client' \
  --table='public.user_entity' \
  --table='public.keycloak_role' \
  --table='public.org' \
  "${DB_NAME}" > "${DATA_ONLY_FILE}"

echo -e "\n${GREEN}✓ Export completed successfully!${NC}"
echo -e "\n${YELLOW}Generated files:${NC}"
echo -e "  1. Full dump:    ${DUMP_FILE}"
echo -e "  2. Seed file:    ${SEED_FILE}"
echo -e "  3. Data only:    ${DATA_ONLY_FILE}"
