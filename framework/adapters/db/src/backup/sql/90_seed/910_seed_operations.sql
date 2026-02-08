/* ============================================================================
   Athyper — SEED: Operation Categories + Operations
   Idempotent (ON CONFLICT DO NOTHING).
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- Operation Categories
-- ----------------------------------------------------------------------------
insert into core.operation_category (code, name, description, sort_order) values
  ('entity',        'Entity Operations',        'CRUD operations on entities',          1),
  ('workflow',       'Workflow Operations',       'State transitions and approvals',      2),
  ('utilities',      'Utility Operations',        'Copy, merge, import/export',           3),
  ('delegation',     'Delegation Operations',     'Sharing and delegation',               4),
  ('collaboration',  'Collaboration Operations',  'Comments, attachments, following',      5)
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- Entity Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('read',         'Read',         'View entity records',    true,  false, 1),
  ('create',       'Create',       'Create new records',     false, false, 2),
  ('update',       'Update',       'Update existing records', true,  false, 3),
  ('delete_draft', 'Delete Draft', 'Delete draft records',   true,  true,  4),
  ('delete',       'Delete',       'Delete any records',     true,  false, 5)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'entity'
on conflict (category_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- Workflow Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('submit',   'Submit',   'Submit for approval',          true, true,  1),
  ('amend',    'Amend',    'Amend submitted record',       true, true,  2),
  ('cancel',   'Cancel',   'Cancel record',                true, true,  3),
  ('close',    'Close',    'Close record',                 true, false, 4),
  ('reopen',   'Reopen',   'Reopen closed record',         true, false, 5),
  ('withdraw', 'Withdraw', 'Withdraw submission',          true, true,  6),
  ('escalate', 'Escalate', 'Escalate to higher authority', true, false, 7),
  ('approve',  'Approve',  'Approve record',               true, false, 8),
  ('deny',     'Deny',     'Deny/reject record',           true, false, 9)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'workflow'
on conflict (category_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- Utility Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('copy',        'Copy',        'Copy record',         true,  false, 1),
  ('merge',       'Merge',       'Merge records',       true,  false, 2),
  ('report',      'Report',      'Generate reports',    false, false, 3),
  ('print',       'Print',       'Print records',       true,  false, 4),
  ('import',      'Import',      'Import data',         false, false, 5),
  ('export',      'Export',      'Export data',          false, false, 6),
  ('bulk_import', 'Bulk Import', 'Bulk import data',    false, false, 7),
  ('bulk_export', 'Bulk Export', 'Bulk export data',    false, false, 8),
  ('bulk_update', 'Bulk Update', 'Bulk update records', false, false, 9),
  ('bulk_delete', 'Bulk Delete', 'Bulk delete records', false, false, 10)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'utilities'
on conflict (category_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- Delegation Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('delegate',       'Delegate',        'Delegate task to another user',       true, false, 1),
  ('share_readonly', 'Share Read-only', 'Share record with read-only access',  true, false, 2),
  ('share_editable', 'Share Editable',  'Share record with edit access',       true, false, 3)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'delegation'
on conflict (category_id, code) do nothing;

-- ----------------------------------------------------------------------------
-- Collaboration Operations
-- ----------------------------------------------------------------------------
insert into core.operation (category_id, code, name, description, requires_record, requires_ownership, sort_order)
select c.id, o.code, o.name, o.description, o.requires_record, o.requires_ownership, o.sort_order
from core.operation_category c
cross join (values
  ('comment_add',             'Add Comment',              'Add comment to record',         true, false, 1),
  ('attachment_add',          'Add Attachment',           'Add attachment to record',       true, false, 2),
  ('comment_delete_other',    'Delete Other Comments',    'Delete comments by others',     true, false, 3),
  ('attachment_delete_other', 'Delete Other Attachments', 'Delete attachments by others',  true, false, 4),
  ('follow',                  'Follow',                   'Follow record for updates',     true, false, 5),
  ('tag',                     'Tag',                      'Add tags to record',            true, false, 6)
) as o(code, name, description, requires_record, requires_ownership, sort_order)
where c.code = 'collaboration'
on conflict (category_id, code) do nothing;
