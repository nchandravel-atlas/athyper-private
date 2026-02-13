-- EPIC I: Add support for index change types in overlay system
--
-- Updates overlay_change table constraint to:
-- 1. Add support for add_index and remove_index change kinds
-- 2. Align with snake_case convention used in code

ALTER TABLE meta.overlay_change
DROP CONSTRAINT IF EXISTS overlay_change_kind_chk;

ALTER TABLE meta.overlay_change
ADD CONSTRAINT overlay_change_kind_chk CHECK (kind IN (
  'add_field', 'remove_field', 'modify_field',
  'tweak_policy', 'add_index', 'remove_index',
  -- Legacy camelCase support (deprecated, for backward compatibility)
  'addField', 'removeField', 'modifyField',
  'tweakPolicy', 'overrideValidation', 'overrideUi'
));

COMMENT ON CONSTRAINT overlay_change_kind_chk ON meta.overlay_change IS
'EPIC I: Added add_index and remove_index change kinds. Supports both snake_case (preferred) and camelCase (legacy) for backward compatibility.';
