-- 162: Validation Rules Engine — Schema Migration
--
-- Adds typed validation support to the META field table:
-- 1. validation_version column for forward-compatible rule migration
-- 2. CHECK constraint ensuring validation JSONB is array-shaped (or null)

BEGIN;

-- Add validation_version for rule schema migration safety
ALTER TABLE meta.field
  ADD COLUMN IF NOT EXISTS validation_version integer NOT NULL DEFAULT 1;

-- Ensure validation column is always a JSON array (or null)
-- This guards against storing arbitrary objects instead of rule arrays.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_table_usage
    WHERE table_schema = 'meta'
      AND table_name = 'field'
      AND constraint_name = 'chk_field_validation_schema'
  ) THEN
    ALTER TABLE meta.field
      ADD CONSTRAINT chk_field_validation_schema
      CHECK (validation IS NULL OR jsonb_typeof(validation) = 'array');
  END IF;
END $$;

COMMENT ON COLUMN meta.field.validation_version IS
  'Schema version of the validation rules JSON. Enables forward-compatible migrations.';

COMMIT;
