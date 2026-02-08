/* ============================================================================
   Athyper — SEED: Persona i18n Labels
   Translations for core.persona names and descriptions.
   Covers: ar, ms, ta, hi, fr, de (English canonical is on core.persona).
   Idempotent (ON CONFLICT DO NOTHING).
   Depends on: 911_seed_personas.sql, 050_ref_seed_locales.sql
   ============================================================================ */

-- ============================================================================
-- Arabic (ar)
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, description, created_by)
values
  ('persona', 'viewer',      'ar', 'مُشاهد',         'وصول للقراءة فقط إلى السجلات',                         'seed'),
  ('persona', 'reporter',    'ar', 'مُقرِّر',         'مشاهد مع إمكانيات إعداد التقارير',                      'seed'),
  ('persona', 'requester',   'ar', 'مُقدِّم طلب',     'يمكنه إنشاء وإدارة طلباته الخاصة',                      'seed'),
  ('persona', 'agent',       'ar', 'وكيل',           'معالجة الطلبات ضمن الوحدة التنظيمية المعيَّنة',           'seed'),
  ('persona', 'manager',     'ar', 'مدير',           'الإدارة والموافقة ضمن نطاق الوحدة التنظيمية',            'seed'),
  ('persona', 'moduleAdmin', 'ar', 'مسؤول الوحدة',   'إدارة كيانات الوحدة',                                   'seed'),
  ('persona', 'tenantAdmin', 'ar', 'مسؤول المستأجر', 'إدارة كاملة للمستأجر',                                  'seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Malay (ms)
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, description, created_by)
values
  ('persona', 'viewer',      'ms', 'Pemerhati',        'Akses baca sahaja kepada rekod',                        'seed'),
  ('persona', 'reporter',    'ms', 'Pelapor',          'Pemerhati dengan keupayaan pelaporan',                   'seed'),
  ('persona', 'requester',   'ms', 'Pemohon',          'Boleh mencipta dan mengurus permohonan sendiri',         'seed'),
  ('persona', 'agent',       'ms', 'Agen',             'Memproses permohonan dalam unit organisasi ditugaskan',  'seed'),
  ('persona', 'manager',     'ms', 'Pengurus',         'Mengurus dan meluluskan dalam skop unit organisasi',     'seed'),
  ('persona', 'moduleAdmin', 'ms', 'Pentadbir Modul',  'Mentadbir entiti modul',                                'seed'),
  ('persona', 'tenantAdmin', 'ms', 'Pentadbir Penyewa','Pentadbiran penuh penyewa',                             'seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Tamil (ta)
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, description, created_by)
values
  ('persona', 'viewer',      'ta', 'பார்வையாளர்',           'பதிவுகளுக்கான படிப்பு மட்டும் அணுகல்',                     'seed'),
  ('persona', 'reporter',    'ta', 'அறிக்கையாளர்',          'பார்வையாளர் மற்றும் அறிக்கை திறன்கள்',                     'seed'),
  ('persona', 'requester',   'ta', 'கோரிக்கையாளர்',         'சொந்த கோரிக்கைகளை உருவாக்கி நிர்வகிக்கலாம்',              'seed'),
  ('persona', 'agent',       'ta', 'முகவர்',                'ஒதுக்கப்பட்ட நிறுவன அலகில் கோரிக்கைகளை செயலாக்குதல்',     'seed'),
  ('persona', 'manager',     'ta', 'மேலாளர்',               'நிறுவன அலகு எல்லையில் நிர்வகித்தல் மற்றும் அங்கீகரித்தல்', 'seed'),
  ('persona', 'moduleAdmin', 'ta', 'தொகுதி நிர்வாகி',       'தொகுதி நிறுவனங்களை நிர்வகித்தல்',                          'seed'),
  ('persona', 'tenantAdmin', 'ta', 'குத்தகையாளர் நிர்வாகி', 'முழு குத்தகையாளர் நிர்வாகம்',                              'seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Hindi (hi)
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, description, created_by)
values
  ('persona', 'viewer',      'hi', 'दर्शक',                'रिकॉर्ड तक केवल-पठन पहुँच',                          'seed'),
  ('persona', 'reporter',    'hi', 'रिपोर्टर',              'दर्शक और रिपोर्टिंग क्षमताएँ',                        'seed'),
  ('persona', 'requester',   'hi', 'अनुरोधकर्ता',           'अपने अनुरोध बना और प्रबंधित कर सकते हैं',             'seed'),
  ('persona', 'agent',       'hi', 'एजेंट',                'निर्धारित संगठनात्मक इकाई में अनुरोध संसाधित करें',     'seed'),
  ('persona', 'manager',     'hi', 'प्रबंधक',               'संगठनात्मक इकाई दायरे में प्रबंधन और अनुमोदन',        'seed'),
  ('persona', 'moduleAdmin', 'hi', 'मॉड्यूल व्यवस्थापक',    'मॉड्यूल इकाइयों का प्रशासन',                          'seed'),
  ('persona', 'tenantAdmin', 'hi', 'टेनेंट व्यवस्थापक',     'पूर्ण टेनेंट प्रशासन',                                'seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- French (fr)
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, description, created_by)
values
  ('persona', 'viewer',      'fr', 'Lecteur',              'Accès en lecture seule aux enregistrements',            'seed'),
  ('persona', 'reporter',    'fr', 'Rapporteur',           'Lecteur avec capacités de reporting',                   'seed'),
  ('persona', 'requester',   'fr', 'Demandeur',            'Peut créer et gérer ses propres demandes',              'seed'),
  ('persona', 'agent',       'fr', 'Agent',                'Traiter les demandes au sein de l''UO assignée',        'seed'),
  ('persona', 'manager',     'fr', 'Responsable',          'Gérer et approuver dans le périmètre de l''UO',         'seed'),
  ('persona', 'moduleAdmin', 'fr', 'Admin. module',        'Administrer les entités du module',                     'seed'),
  ('persona', 'tenantAdmin', 'fr', 'Admin. locataire',     'Administration complète du locataire',                  'seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- German (de)
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, description, created_by)
values
  ('persona', 'viewer',      'de', 'Betrachter',            'Lesezugriff auf Datensätze',                           'seed'),
  ('persona', 'reporter',    'de', 'Berichterstatter',      'Betrachter mit Berichtsfunktionen',                    'seed'),
  ('persona', 'requester',   'de', 'Antragsteller',         'Kann eigene Anträge erstellen und verwalten',           'seed'),
  ('persona', 'agent',       'de', 'Sachbearbeiter',        'Anträge innerhalb der zugewiesenen OE bearbeiten',      'seed'),
  ('persona', 'manager',     'de', 'Vorgesetzter',          'Verwalten und genehmigen im OE-Bereich',                'seed'),
  ('persona', 'moduleAdmin', 'de', 'Moduladministrator',    'Modulentitäten verwalten',                              'seed'),
  ('persona', 'tenantAdmin', 'de', 'Mandantenadministrator','Vollständige Mandantenverwaltung',                      'seed')
on conflict (entity, code, locale_code) do nothing;
