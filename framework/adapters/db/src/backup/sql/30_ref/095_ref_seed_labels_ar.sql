/* ============================================================================
   Athyper — REF Seed: Arabic Labels (i18n)
   PostgreSQL 16+

   Arabic translations for key reference data entities.
   Covers: countries (GCC + major), currencies, languages, UOM core units.
   Depends on: 010_ref_master_tables.sql, 040_ref_seed_languages.sql,
               050_ref_seed_locales.sql
   ============================================================================ */

-- ============================================================================
-- Countries — GCC + MENA + Major World
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  -- GCC
  ('country','SA','ar','المملكة العربية السعودية','seed'),
  ('country','AE','ar','الإمارات العربية المتحدة','seed'),
  ('country','BH','ar','البحرين','seed'),
  ('country','KW','ar','الكويت','seed'),
  ('country','OM','ar','عُمان','seed'),
  ('country','QA','ar','قطر','seed'),

  -- MENA
  ('country','EG','ar','مصر','seed'),
  ('country','JO','ar','الأردن','seed'),
  ('country','LB','ar','لبنان','seed'),
  ('country','IQ','ar','العراق','seed'),
  ('country','SY','ar','سوريا','seed'),
  ('country','YE','ar','اليمن','seed'),
  ('country','PS','ar','فلسطين','seed'),
  ('country','SD','ar','السودان','seed'),
  ('country','LY','ar','ليبيا','seed'),
  ('country','TN','ar','تونس','seed'),
  ('country','DZ','ar','الجزائر','seed'),
  ('country','MA','ar','المغرب','seed'),
  ('country','MR','ar','موريتانيا','seed'),
  ('country','DJ','ar','جيبوتي','seed'),
  ('country','SO','ar','الصومال','seed'),
  ('country','KM','ar','جزر القمر','seed'),
  ('country','IR','ar','إيران','seed'),
  ('country','TR','ar','تركيا','seed'),
  ('country','IL','ar','إسرائيل','seed'),

  -- Major World
  ('country','US','ar','الولايات المتحدة','seed'),
  ('country','GB','ar','المملكة المتحدة','seed'),
  ('country','FR','ar','فرنسا','seed'),
  ('country','DE','ar','ألمانيا','seed'),
  ('country','IT','ar','إيطاليا','seed'),
  ('country','ES','ar','إسبانيا','seed'),
  ('country','PT','ar','البرتغال','seed'),
  ('country','NL','ar','هولندا','seed'),
  ('country','BE','ar','بلجيكا','seed'),
  ('country','CH','ar','سويسرا','seed'),
  ('country','AT','ar','النمسا','seed'),
  ('country','SE','ar','السويد','seed'),
  ('country','NO','ar','النرويج','seed'),
  ('country','DK','ar','الدنمارك','seed'),
  ('country','FI','ar','فنلندا','seed'),
  ('country','PL','ar','بولندا','seed'),
  ('country','GR','ar','اليونان','seed'),
  ('country','RU','ar','روسيا','seed'),
  ('country','UA','ar','أوكرانيا','seed'),
  ('country','CN','ar','الصين','seed'),
  ('country','JP','ar','اليابان','seed'),
  ('country','KR','ar','كوريا الجنوبية','seed'),
  ('country','IN','ar','الهند','seed'),
  ('country','PK','ar','باكستان','seed'),
  ('country','BD','ar','بنغلاديش','seed'),
  ('country','ID','ar','إندونيسيا','seed'),
  ('country','MY','ar','ماليزيا','seed'),
  ('country','SG','ar','سنغافورة','seed'),
  ('country','TH','ar','تايلاند','seed'),
  ('country','VN','ar','فيتنام','seed'),
  ('country','PH','ar','الفلبين','seed'),
  ('country','AU','ar','أستراليا','seed'),
  ('country','NZ','ar','نيوزيلندا','seed'),
  ('country','CA','ar','كندا','seed'),
  ('country','MX','ar','المكسيك','seed'),
  ('country','BR','ar','البرازيل','seed'),
  ('country','AR','ar','الأرجنتين','seed'),
  ('country','CL','ar','تشيلي','seed'),
  ('country','CO','ar','كولومبيا','seed'),
  ('country','ZA','ar','جنوب أفريقيا','seed'),
  ('country','NG','ar','نيجيريا','seed'),
  ('country','KE','ar','كينيا','seed'),
  ('country','ET','ar','إثيوبيا','seed'),
  ('country','GH','ar','غانا','seed'),
  ('country','TZ','ar','تنزانيا','seed'),
  ('country','SS','ar','جنوب السودان','seed'),
  ('country','HK','ar','هونغ كونغ','seed'),
  ('country','TW','ar','تايوان','seed'),
  ('country','AF','ar','أفغانستان','seed'),
  ('country','CY','ar','قبرص','seed'),
  ('country','LK','ar','سريلانكا','seed'),
  ('country','NP','ar','نيبال','seed'),
  ('country','MM','ar','ميانمار','seed'),
  ('country','KH','ar','كمبوديا','seed'),
  ('country','IE','ar','أيرلندا','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Currencies — GCC + Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  -- GCC
  ('currency','SAR','ar','ريال سعودي','seed'),
  ('currency','AED','ar','درهم إماراتي','seed'),
  ('currency','BHD','ar','دينار بحريني','seed'),
  ('currency','KWD','ar','دينار كويتي','seed'),
  ('currency','OMR','ar','ريال عُماني','seed'),
  ('currency','QAR','ar','ريال قطري','seed'),

  -- MENA
  ('currency','EGP','ar','جنيه مصري','seed'),
  ('currency','JOD','ar','دينار أردني','seed'),
  ('currency','LBP','ar','ليرة لبنانية','seed'),
  ('currency','IQD','ar','دينار عراقي','seed'),
  ('currency','SYP','ar','ليرة سورية','seed'),
  ('currency','YER','ar','ريال يمني','seed'),
  ('currency','SDG','ar','جنيه سوداني','seed'),
  ('currency','LYD','ar','دينار ليبي','seed'),
  ('currency','TND','ar','دينار تونسي','seed'),
  ('currency','DZD','ar','دينار جزائري','seed'),
  ('currency','MAD','ar','درهم مغربي','seed'),
  ('currency','ILS','ar','شيكل إسرائيلي','seed'),
  ('currency','IRR','ar','ريال إيراني','seed'),
  ('currency','TRY','ar','ليرة تركية','seed'),

  -- Major World
  ('currency','USD','ar','دولار أمريكي','seed'),
  ('currency','EUR','ar','يورو','seed'),
  ('currency','GBP','ar','جنيه إسترليني','seed'),
  ('currency','JPY','ar','ين ياباني','seed'),
  ('currency','CNY','ar','يوان صيني','seed'),
  ('currency','CHF','ar','فرنك سويسري','seed'),
  ('currency','CAD','ar','دولار كندي','seed'),
  ('currency','AUD','ar','دولار أسترالي','seed'),
  ('currency','INR','ar','روبية هندية','seed'),
  ('currency','PKR','ar','روبية باكستانية','seed'),
  ('currency','BRL','ar','ريال برازيلي','seed'),
  ('currency','MXN','ar','بيزو مكسيكي','seed'),
  ('currency','KRW','ar','وون كوري','seed'),
  ('currency','SGD','ar','دولار سنغافوري','seed'),
  ('currency','HKD','ar','دولار هونغ كونغ','seed'),
  ('currency','RUB','ar','روبل روسي','seed'),
  ('currency','ZAR','ar','راند جنوب أفريقي','seed'),
  ('currency','NZD','ar','دولار نيوزيلندي','seed'),
  ('currency','IDR','ar','روبية إندونيسية','seed'),
  ('currency','MYR','ar','رينغيت ماليزي','seed'),
  ('currency','THB','ar','بات تايلاندي','seed'),
  ('currency','NGN','ar','نيرة نيجيرية','seed'),
  ('currency','KES','ar','شلن كيني','seed'),

  -- Precious metals
  ('currency','XAU','ar','ذهب (أونصة تروي)','seed'),
  ('currency','XAG','ar','فضة (أونصة تروي)','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Languages (ISO 639-1) — Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('language','ar','ar','العربية','seed'),
  ('language','en','ar','الإنجليزية','seed'),
  ('language','fr','ar','الفرنسية','seed'),
  ('language','de','ar','الألمانية','seed'),
  ('language','es','ar','الإسبانية','seed'),
  ('language','pt','ar','البرتغالية','seed'),
  ('language','it','ar','الإيطالية','seed'),
  ('language','nl','ar','الهولندية','seed'),
  ('language','ru','ar','الروسية','seed'),
  ('language','zh','ar','الصينية','seed'),
  ('language','ja','ar','اليابانية','seed'),
  ('language','ko','ar','الكورية','seed'),
  ('language','hi','ar','الهندية','seed'),
  ('language','bn','ar','البنغالية','seed'),
  ('language','ur','ar','الأردية','seed'),
  ('language','fa','ar','الفارسية','seed'),
  ('language','tr','ar','التركية','seed'),
  ('language','ta','ar','التاميلية','seed'),
  ('language','te','ar','التيلوغوية','seed'),
  ('language','ml','ar','المالايالامية','seed'),
  ('language','id','ar','الإندونيسية','seed'),
  ('language','ms','ar','الملايوية','seed'),
  ('language','th','ar','التايلاندية','seed'),
  ('language','vi','ar','الفيتنامية','seed'),
  ('language','pl','ar','البولندية','seed'),
  ('language','uk','ar','الأوكرانية','seed'),
  ('language','sv','ar','السويدية','seed'),
  ('language','da','ar','الدنماركية','seed'),
  ('language','no','ar','النرويجية','seed'),
  ('language','fi','ar','الفنلندية','seed'),
  ('language','el','ar','اليونانية','seed'),
  ('language','he','ar','العبرية','seed'),
  ('language','sw','ar','السواحلية','seed'),
  ('language','am','ar','الأمهرية','seed'),
  ('language','ha','ar','الهوسا','seed'),
  ('language','yo','ar','اليوروبا','seed'),
  ('language','so','ar','الصومالية','seed'),
  ('language','ps','ar','البشتونية','seed'),
  ('language','ku','ar','الكردية','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- UOM — Core units
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  -- Count
  ('uom','EA','ar','وحدة','seed'),
  ('uom','C62','ar','واحد','seed'),
  ('uom','PR','ar','زوج','seed'),
  ('uom','DZN','ar','دزينة','seed'),
  ('uom','SET','ar','طقم','seed'),
  ('uom','PK','ar','حزمة','seed'),
  ('uom','BX','ar','صندوق','seed'),
  ('uom','CT','ar','كرتون','seed'),
  ('uom','CS','ar','علبة','seed'),
  ('uom','PL','ar','منصة نقالة','seed'),

  -- Mass
  ('uom','MGM','ar','ميليغرام','seed'),
  ('uom','GRM','ar','غرام','seed'),
  ('uom','KGM','ar','كيلوغرام','seed'),
  ('uom','TNE','ar','طن متري','seed'),
  ('uom','LBR','ar','رطل','seed'),
  ('uom','ONZ','ar','أونصة','seed'),

  -- Length
  ('uom','MMT','ar','ميليمتر','seed'),
  ('uom','CMT','ar','سنتيمتر','seed'),
  ('uom','MTR','ar','متر','seed'),
  ('uom','KMT','ar','كيلومتر','seed'),
  ('uom','INH','ar','بوصة','seed'),
  ('uom','FOT','ar','قدم','seed'),
  ('uom','YRD','ar','ياردة','seed'),
  ('uom','SMI','ar','ميل','seed'),

  -- Area
  ('uom','MTK','ar','متر مربع','seed'),
  ('uom','KMK','ar','كيلومتر مربع','seed'),
  ('uom','HAR','ar','هكتار','seed'),
  ('uom','ACR','ar','فدان','seed'),
  ('uom','FTK','ar','قدم مربع','seed'),

  -- Volume
  ('uom','MLT','ar','ميليلتر','seed'),
  ('uom','LTR','ar','لتر','seed'),
  ('uom','MTQ','ar','متر مكعب','seed'),
  ('uom','GLL','ar','غالون','seed'),
  ('uom','BLL','ar','برميل','seed'),

  -- Time
  ('uom','SEC','ar','ثانية','seed'),
  ('uom','MIN','ar','دقيقة','seed'),
  ('uom','HUR','ar','ساعة','seed'),
  ('uom','DAY','ar','يوم','seed'),
  ('uom','WEE','ar','أسبوع','seed'),
  ('uom','MON','ar','شهر','seed'),
  ('uom','ANN','ar','سنة','seed'),

  -- Temperature
  ('uom','CEL','ar','درجة مئوية','seed'),
  ('uom','FAH','ar','درجة فهرنهايت','seed'),
  ('uom','KEL','ar','كلفن','seed'),

  -- Energy
  ('uom','KWH','ar','كيلوواط ساعة','seed'),
  ('uom','WTT','ar','واط','seed'),
  ('uom','KWT','ar','كيلوواط','seed'),
  ('uom','MAW','ar','ميغاواط','seed'),

  -- Data
  ('uom','AD','ar','بايت','seed'),
  ('uom','4L','ar','ميغابايت','seed'),
  ('uom','E34','ar','غيغابايت','seed'),
  ('uom','E35','ar','تيرابايت','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Saudi Regions (state_region) — Arabic names
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('state_region','SA-01','ar','منطقة الرياض','seed'),
  ('state_region','SA-02','ar','منطقة مكة المكرمة','seed'),
  ('state_region','SA-03','ar','منطقة المدينة المنورة','seed'),
  ('state_region','SA-04','ar','المنطقة الشرقية','seed'),
  ('state_region','SA-05','ar','منطقة القصيم','seed'),
  ('state_region','SA-06','ar','منطقة حائل','seed'),
  ('state_region','SA-07','ar','منطقة تبوك','seed'),
  ('state_region','SA-08','ar','منطقة الحدود الشمالية','seed'),
  ('state_region','SA-09','ar','منطقة جازان','seed'),
  ('state_region','SA-10','ar','منطقة نجران','seed'),
  ('state_region','SA-11','ar','منطقة الباحة','seed'),
  ('state_region','SA-12','ar','منطقة الجوف','seed'),
  ('state_region','SA-14','ar','منطقة عسير','seed'),

  -- UAE Emirates
  ('state_region','AE-AZ','ar','أبوظبي','seed'),
  ('state_region','AE-DU','ar','دبي','seed'),
  ('state_region','AE-SH','ar','الشارقة','seed'),
  ('state_region','AE-AJ','ar','عجمان','seed'),
  ('state_region','AE-UQ','ar','أم القيوين','seed'),
  ('state_region','AE-RK','ar','رأس الخيمة','seed'),
  ('state_region','AE-FU','ar','الفجيرة','seed')
on conflict (entity, code, locale_code) do nothing;
