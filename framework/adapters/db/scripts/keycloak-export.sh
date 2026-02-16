#!/bin/bash
# =======================================================================
# Keycloak Full Realm Export Script
# Exports all realms with users, groups, clients, and configurations
# =======================================================================

set -e

EXPORT_DIR="./exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="keycloak-export-${TIMESTAMP}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}[1/4] Creating export directory...${NC}"
mkdir -p "${EXPORT_DIR}"

echo -e "${GREEN}[2/4] Running Keycloak export container...${NC}"
echo -e "${YELLOW}This will export ALL realms including users${NC}"

# Run temporary Keycloak container with export command
docker run --rm \
  --name "${CONTAINER_NAME}" \
  --network athyper-mesh-edge \
  -v "$(pwd)/${EXPORT_DIR}:/opt/keycloak/data/export" \
  -e KC_DB=postgres \
  -e KC_DB_URL="${IAM_DB_URL:-jdbc:postgresql://dbpool-auth:5432/athyperauth_dev1}" \
  -e KC_DB_USERNAME="${IAM_DB_USERNAME:-athyperauth}" \
  -e KC_DB_PASSWORD="${IAM_DB_PASSWORD}" \
  quay.io/keycloak/keycloak:26.5.1 \
  export \
  --dir /opt/keycloak/data/export \
  --users realm_file \
  --realm athyper

echo -e "${GREEN}[3/4] Export completed!${NC}"
echo -e "${GREEN}[4/4] Files created in: ${EXPORT_DIR}/${NC}"
ls -lh "${EXPORT_DIR}"

echo -e "\n${GREEN}✓ Export successful!${NC}"
echo -e "${YELLOW}Note: Export files are in JSON format${NC}"
