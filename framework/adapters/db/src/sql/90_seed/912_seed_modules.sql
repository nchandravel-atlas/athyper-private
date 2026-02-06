/* ============================================================================
   Athyper — SEED: Core Modules
   Platform + business module definitions.
   Idempotent (ON CONFLICT DO NOTHING).
   ============================================================================ */

insert into core.module (code, name, description) values
  -- Platform modules
  ('FND',  'Foundation Runtime',             'Meta-driven runtime engine'),
  ('META', 'Metadata Studio',                'Declarative configuration'),
  ('IAM',  'Identity & Access Management',   'Authentication and authorization'),
  ('AUD',  'Audit & Governance',             'Audit trails and compliance'),
  ('POL',  'Policy & Rules Engine',          'Business rules and validations'),
  ('WFL',  'Workflow Engine',                'State machines and approvals'),
  ('JOB',  'Automation & Jobs',              'Schedulers and background tasks'),
  ('DOC',  'Document Services',              'PDF/HTML generation'),
  ('NTF',  'Notification Services',          'Email and alerts'),
  ('INT',  'Integration Hub',               'API gateway and webhooks'),
  ('CMS',  'Content Services',               'Document storage'),
  ('ACT',  'Activity & Commentary',          'Comments and timelines'),
  ('REL',  'Relationship Management',        'Address book'),

  -- Finance modules
  ('ACC',  'Finance (Core Accounting)',       'GL, AP, AR'),
  ('PAY',  'Payment Processing',             'Collections and disbursements'),
  ('TRE',  'Treasury & Cash Management',     'Cash and FX'),
  ('BUD',  'Budget & Funds Control',         'Budget planning'),

  -- Commercial modules
  ('CRM',  'Customer Relationship Management', 'Sales pipeline'),
  ('SRM',  'Supplier Relationship Management', 'Supplier lifecycle'),
  ('SRC',  'Sourcing Management',            'RFQs and bids'),
  ('CNT',  'Contract Management',            'Commercial contracts'),
  ('BUY',  'Buying',                         'Purchasing and POs'),
  ('SEL',  'Selling',                        'Sales orders'),

  -- Supply chain modules
  ('INV',  'Inventory Management',           'Stock control'),
  ('QAL',  'Quality Management',             'Inspections'),
  ('WHS',  'Warehouse Management',           'Bin management'),
  ('TRN',  'Transportation & Logistics',     'Shipping'),

  -- Operations modules
  ('MNT',  'Maintenance Management',         'Work orders'),
  ('MFG',  'Manufacturing',                  'BOMs and MRP'),
  ('AST',  'Asset Management',               'Fixed assets'),
  ('REM',  'Real Estate Asset Management',   'Property management'),
  ('FAC',  'Facility Management',            'Buildings and utilities'),

  -- HR modules
  ('HRM',  'Human Resources',               'Employee lifecycle'),
  ('PRL',  'Payroll',                        'Salary processing'),

  -- Project & service modules
  ('PRJ',  'Project Management',             'Projects and tasks'),
  ('SVC',  'Support & Service Management',   'Tickets and SLAs')
on conflict (code) do nothing;
