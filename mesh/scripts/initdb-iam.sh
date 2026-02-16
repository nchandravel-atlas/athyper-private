#!/bin/bash
# =======================================================================
# Keycloak IAM Import/Initialize Script
# Imports realm configuration from mesh/config/iam/realm-demosetup.json
# =======================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MESH_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="${MESH_DIR}/config/iam"
IMPORT_FILE="${CONFIG_DIR}/realm-demosetup.json"
TEMP_IMPORT_DIR="${MESH_DIR}/temp/keycloak-import"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Keycloak Realm Import ===${NC}"
echo -e "${YELLOW}Importing from: ${IMPORT_FILE}${NC}\n"

# Check if import file exists
if [ ! -f "${IMPORT_FILE}" ]; then
  echo -e "${RED}Error: Import file not found: ${IMPORT_FILE}${NC}"
  echo -e "\n${YELLOW}To create this file:${NC}"
  echo -e "  1. Export from existing Keycloak: ./export-iam.sh"
  echo -e "  2. Or manually export from Keycloak Admin Console"
  echo -e "  3. Save to: ${IMPORT_FILE}"
  exit 1
fi

# Check if file is valid JSON
if ! command -v jq &> /dev/null; then
  echo -e "${YELLOW}Warning: jq not installed, skipping JSON validation${NC}"
else
  if ! jq empty "${IMPORT_FILE}" 2>/dev/null; then
    echo -e "${RED}Error: Invalid JSON in import file${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ JSON validation passed${NC}"
fi

# Check if database containers are running
if ! docker ps --format '{{.Names}}' | grep -q 'athyper-mesh-dbpool-auth'; then
  echo -e "${RED}Error: Database (dbpool-auth) container is not running${NC}"
  echo -e "${YELLOW}Start it with: cd mesh && ./up.sh --profile mesh${NC}"
  exit 1
fi

# Get database credentials from running Keycloak container or environment
if docker ps --format '{{.Names}}' | grep -q 'athyper-mesh-iam'; then
  echo -e "${YELLOW}Reading database credentials from Keycloak container...${NC}"
  DB_URL=$(docker exec athyper-mesh-iam-1 printenv KC_DB_URL 2>/dev/null || echo "")
  DB_USER=$(docker exec athyper-mesh-iam-1 printenv KC_DB_USERNAME 2>/dev/null || echo "")
  DB_PASS=$(docker exec athyper-mesh-iam-1 printenv KC_DB_PASSWORD 2>/dev/null || echo "")
fi

# Fallback to defaults if not found
DB_URL="${DB_URL:-${IAM_DB_URL:-jdbc:postgresql://dbpool-auth:6433/athyperauth_dev1}}"
DB_USER="${DB_USER:-${IAM_DB_USERNAME:-athyperadmin}}"
DB_PASS="${DB_PASS:-${IAM_DB_PASSWORD}}"

if [ -z "$DB_PASS" ]; then
  echo -e "${YELLOW}Reading database password from environment file...${NC}"
  if [ -f "${MESH_DIR}/env/.env" ]; then
    DB_PASS=$(grep IAM_DB_PASSWORD "${MESH_DIR}/env/.env" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  fi
fi

if [ -z "$DB_PASS" ]; then
  echo -e "${RED}Error: Cannot determine database password${NC}"
  echo -e "${YELLOW}Set IAM_DB_PASSWORD in mesh/env/.env or as environment variable${NC}"
  exit 1
fi

echo -e "${GREEN}[1/5] Creating temporary import directory...${NC}"
rm -rf "${TEMP_IMPORT_DIR}"
mkdir -p "${TEMP_IMPORT_DIR}"
cp "${IMPORT_FILE}" "${TEMP_IMPORT_DIR}/athyper-realm.json"

echo -e "${GREEN}[2/5] Checking database connection...${NC}"
docker exec athyper-mesh-dbpool-auth-1 \
  psql -U "${DB_USER}" -d athyperauth_dev1 \
  -c "SELECT version();" > /dev/null 2>&1 || {
    echo -e "${RED}Error: Cannot connect to database${NC}"
    rm -rf "${TEMP_IMPORT_DIR}"
    exit 1
  }
echo -e "${GREEN}✓ Database connection successful${NC}"

echo -e "${GREEN}[3/5] Importing realm configuration...${NC}"
echo -e "${YELLOW}This will override existing realm data!${NC}"
echo -e "${YELLOW}Press Ctrl+C to cancel, or wait 5 seconds...${NC}"
sleep 5

# Disable MSYS path conversion for Docker volume mounts on Git Bash/Windows
export MSYS_NO_PATHCONV=1
docker run --rm \
  --network athyper-mesh-edge \
  -v "${TEMP_IMPORT_DIR}:/opt/keycloak/data/import" \
  -e KC_DB=postgres \
  -e KC_DB_URL="${DB_URL}" \
  -e KC_DB_USERNAME="${DB_USER}" \
  -e KC_DB_PASSWORD="${DB_PASS}" \
  quay.io/keycloak/keycloak:26.5.1 \
  import \
  --dir /opt/keycloak/data/import \
  --override true
unset MSYS_NO_PATHCONV

echo -e "${GREEN}[4/5] Cleaning up...${NC}"
rm -rf "${TEMP_IMPORT_DIR}"

echo -e "${GREEN}[5/5] Restarting Keycloak container...${NC}"
if docker ps --format '{{.Names}}' | grep -q 'athyper-mesh-iam'; then
  docker restart athyper-mesh-iam-1
  echo -e "${YELLOW}Waiting for Keycloak to be ready...${NC}"
  sleep 10

  # Wait for health check
  for i in {1..30}; do
    if docker exec athyper-mesh-iam-1 wget -q --spider http://localhost:8080/health/ready 2>/dev/null; then
      echo -e "${GREEN}✓ Keycloak is ready${NC}"
      break
    fi
    echo -n "."
    sleep 2
  done
  echo ""
else
  echo -e "${YELLOW}Keycloak container not running, start it to apply changes:${NC}"
  echo -e "  cd mesh && ./up.sh --profile mesh"
fi

echo -e "\n${GREEN}✓ Import completed successfully!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Access Keycloak Admin Console"
echo -e "  2. Verify realm: athyper"
echo -e "  3. Check clients, users, roles"
echo -e "\n${GREEN}Keycloak Admin URL: http://localhost/auth${NC}"
