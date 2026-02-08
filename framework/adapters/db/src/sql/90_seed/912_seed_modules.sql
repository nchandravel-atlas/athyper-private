/* ============================================================================
   Athyper — SEED: Core Modules
   Platform + business module definitions.
   Idempotent (ON CONFLICT DO NOTHING).
   ============================================================================ */

insert into core.module (code, name, description, config) values
  -- Platform modules
  ('FND',       'Foundation Runtime',               'Meta-driven runtime engine',                                                                    '{"tier":"Platform"}'::jsonb),
  ('META',      'Metadata Studio',                  'Declarative configuration',                                                                     '{"tier":"Platform"}'::jsonb),
  ('IAM',       'Identity & Access Management',     'Authentication and authorization',                                                              '{"tier":"Platform"}'::jsonb),
  ('AUD',       'Audit & Governance',               'Audit trails and compliance',                                                                   '{"tier":"Platform"}'::jsonb),
  ('POL',       'Policy & Rules Engine',            'Business rules and validations',                                                                '{"tier":"Platform"}'::jsonb),
  ('WFL',       'Workflow Engine',                  'State machines and approvals',                                                                   '{"tier":"Platform"}'::jsonb),
  ('JOB',       'Automation & Jobs',                'Schedulers and background tasks',                                                               '{"tier":"Platform"}'::jsonb),
  ('DOC',       'Document Services',                'PDF/HTML generation',                                                                           '{"tier":"Platform"}'::jsonb),
  ('NTF',       'Notification Services',            'Email and alerts',                                                                              '{"tier":"Platform"}'::jsonb),
  ('INT',       'Integration Hub',                  'API gateway and webhooks',                                                                      '{"tier":"Platform"}'::jsonb),
  ('CMS',       'Content Services',                 'Document storage',                                                                              '{"tier":"Platform"}'::jsonb),
  ('ACT',       'Activity & Commentary',            'Comments and timelines',                                                                        '{"tier":"Platform"}'::jsonb),
  ('REL',       'Relationship Management',          'Address book',                                                                                  '{"tier":"Platform"}'::jsonb),

  -- Finance modules
  ('ACC',       'Finance (Core Accounting)',         'General Ledger, AP, AR, fiscal controls',                                                       '{"tier":"Base","dependencies":["CORE"]}'::jsonb),
  ('PAY',       'Payment Processing',               'Collections, disbursements, reconciliation',                                                    '{"tier":"Base","dependencies":["ACC"]}'::jsonb),
  ('TREASURY',  'Treasury & Cash Management',       'Cash positioning, bank accounts, liquidity, FX exposure, bank reconciliation, funding',          '{"tier":"Base","dependencies":["ACC","PAY"]}'::jsonb),
  ('BUDGET',    'Budget & Funds Control',           'Budget planning, allocation, commitment control, availability checks, and budget consumption tracking', '{"tier":"Enterprise","dependencies":["ACC","WFL","MDG"]}'::jsonb),
  ('PAYG',      'Payment Gateways',                 'External payment providers (Stripe, etc.)',                                                     '{"tier":"Professional","dependencies":["PAY"]}'::jsonb),

  -- Customer Experience modules
  ('CRM',       'Customer Relationship Management', 'Leads, opportunities, pipeline management',                                                     '{"tier":"Base","dependencies":["REL"]}'::jsonb),
  ('SALE',      'Selling',                          'Sales cycle, orders, invoicing',                                                                '{"tier":"Base","dependencies":["CORE","REL"]}'::jsonb),

  -- Supply Chain modules
  ('SRM',       'Supplier Relationship Management', 'Supplier Lifecycle and Performance Management',                                                 '{"tier":"Base","dependencies":["REL","WFL","AUD"]}'::jsonb),
  ('SOURCE',    'Sourcing Management',              'RFQs, bids, vendor selection',                                                                  '{"tier":"Base","dependencies":["REL","WFL","DOC","NTF"]}'::jsonb),
  ('CONTRACT',  'Contract Management',              'Commercial contracts, terms, obligations',                                                      '{"tier":"Base","dependencies":["REL","WFL","DOC","NTF"]}'::jsonb),
  ('BUY',       'Buying',                           'Purchasing, requisitions, POs',                                                                 '{"tier":"Base","dependencies":["CORE","REL"]}'::jsonb),
  ('INVENTORY', 'Inventory Management',             'Inventory, valuation, movements',                                                               '{"tier":"Base","dependencies":["CORE","REL","ACC"]}'::jsonb),
  ('QMS',       'Quality Management',               'Inspections, QC processes',                                                                     '{"tier":"Base","dependencies":["INVENTORY"]}'::jsonb),
  ('SUBCON',    'Subcontracting',                   'Job subcontract workflows',                                                                     '{"tier":"Base","dependencies":["BUY","INVENTORY"]}'::jsonb),
  ('DEMAND',    'Demand Forecast & Planning',       'Statistical & AI-based demand forecasting, planning scenarios',                                  '{"tier":"Enterprise","dependencies":["INVENTORY","SALE","AI"]}'::jsonb),
  ('WMS',       'Warehouse Management',             'Bin management, putaway, picking, packing, cycle counting, barcode/RFID',                       '{"tier":"Enterprise","dependencies":["INVENTORY"]}'::jsonb),
  ('LOGISTICS', 'Transportation & Logistics',       'Shipment planning, carriers, freight costs, delivery tracking',                                  '{"tier":"Enterprise","dependencies":["WMS","INVENTORY"]}'::jsonb),

  -- Manufacturing & Operations modules
  ('MAINT',     'Maintenance Management',           'Preventive & corrective maintenance',                                                           '{"tier":"Base","dependencies":["BUY","ASSET","INVENTORY"]}'::jsonb),
  ('MFG',       'Manufacturing',                    'BOMs, work orders, MRP',                                                                        '{"tier":"Base","dependencies":["INVENTORY","MDG"]}'::jsonb),

  -- Asset Management modules
  ('ASSET',     'Asset Management',                 'Asset lifecycle, depreciation',                                                                  '{"tier":"Enterprise","dependencies":["CORE","ACC","MDG","AUD"]}'::jsonb),
  ('ASSETREMS', 'Real Estate Asset Management',     'Property, lease, tenancy, rental billing, CAM charges, asset depreciation',                      '{"tier":"Enterprise","dependencies":["ASSET","ACC","CONTRACT"]}'::jsonb),
  ('ASSETFM',   'Facility Management',              'Buildings, utilities, space, maintenance cost centers',                                          '{"tier":"Base","dependencies":["ASSET","MAINT"]}'::jsonb),

  -- People Management modules
  ('HR',        'Human Resources',                  'Employee lifecycle, organization structure',                                                     '{"tier":"Base","dependencies":["CORE","REL"]}'::jsonb),
  ('PAYROLL',   'Payroll',                           'Salaries, statutory compliance',                                                                '{"tier":"Base","dependencies":["HR","ACC","REG"]}'::jsonb),

  -- Project & Service modules
  ('PRJCOST',   'Project Management',               'Project, Task, Project budgets, WBS, cost tracking, revenue recognition',                       '{"tier":"Base","dependencies":["ACC","BUDGET"]}'::jsonb),
  ('ITSM',      'Support & Service Management',     'Tickets, SLAs, service workflows',                                                             '{"tier":"Base","dependencies":["CORE","WFL","ASSET","NTF","AUD"]}'::jsonb)
on conflict (code) do nothing;
