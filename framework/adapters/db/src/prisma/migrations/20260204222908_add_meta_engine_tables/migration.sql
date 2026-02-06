-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "meta";

-- CreateTable
CREATE TABLE "core"."tenant" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "subscription" TEXT NOT NULL DEFAULT 'base',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta"."meta_entities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "meta_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta"."meta_versions" (
    "id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "meta_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta"."meta_audit" (
    "id" UUID NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "realm_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB,
    "result" TEXT NOT NULL,
    "error_message" TEXT,

    CONSTRAINT "meta_audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_code_key" ON "core"."tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "meta_entities_name_key" ON "meta"."meta_entities"("name");

-- CreateIndex
CREATE INDEX "meta_versions_entity_name_idx" ON "meta"."meta_versions"("entity_name");

-- CreateIndex
CREATE INDEX "meta_versions_entity_name_is_active_idx" ON "meta"."meta_versions"("entity_name", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "meta_versions_entity_name_version_key" ON "meta"."meta_versions"("entity_name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "meta_audit_event_id_key" ON "meta"."meta_audit"("event_id");

-- CreateIndex
CREATE INDEX "meta_audit_tenant_id_timestamp_idx" ON "meta"."meta_audit"("tenant_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "meta_audit_user_id_timestamp_idx" ON "meta"."meta_audit"("user_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "meta_audit_resource_timestamp_idx" ON "meta"."meta_audit"("resource", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "meta_audit_event_type_idx" ON "meta"."meta_audit"("event_type");

-- AddForeignKey
ALTER TABLE "meta"."meta_versions" ADD CONSTRAINT "meta_versions_entity_name_fkey" FOREIGN KEY ("entity_name") REFERENCES "meta"."meta_entities"("name") ON DELETE CASCADE ON UPDATE CASCADE;

