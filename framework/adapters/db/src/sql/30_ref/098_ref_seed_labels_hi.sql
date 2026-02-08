/* ============================================================================
   Athyper — REF Seed: Hindi (हिन्दी) Labels (i18n)
   PostgreSQL 16+

   Hindi translations for key reference data entities.
   Depends on: 010_ref_master_tables.sql, 050_ref_seed_locales.sql
   ============================================================================ */

-- ============================================================================
-- Countries — GCC + MENA + Major World
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  -- GCC
  ('country','SA','hi','सऊदी अरब','seed'),
  ('country','AE','hi','संयुक्त अरब अमीरात','seed'),
  ('country','BH','hi','बहरीन','seed'),
  ('country','KW','hi','कुवैत','seed'),
  ('country','OM','hi','ओमान','seed'),
  ('country','QA','hi','क़तर','seed'),

  -- MENA
  ('country','EG','hi','मिस्र','seed'),
  ('country','JO','hi','जॉर्डन','seed'),
  ('country','LB','hi','लेबनान','seed'),
  ('country','IQ','hi','इराक','seed'),
  ('country','SY','hi','सीरिया','seed'),
  ('country','YE','hi','यमन','seed'),
  ('country','PS','hi','फ़िलिस्तीन','seed'),
  ('country','SD','hi','सूडान','seed'),
  ('country','LY','hi','लीबिया','seed'),
  ('country','TN','hi','ट्यूनीशिया','seed'),
  ('country','DZ','hi','अल्जीरिया','seed'),
  ('country','MA','hi','मोरक्को','seed'),
  ('country','IR','hi','ईरान','seed'),
  ('country','TR','hi','तुर्किये','seed'),
  ('country','IL','hi','इज़राइल','seed'),

  -- Major World
  ('country','US','hi','संयुक्त राज्य अमेरिका','seed'),
  ('country','GB','hi','यूनाइटेड किंगडम','seed'),
  ('country','FR','hi','फ़्रांस','seed'),
  ('country','DE','hi','जर्मनी','seed'),
  ('country','IT','hi','इटली','seed'),
  ('country','ES','hi','स्पेन','seed'),
  ('country','PT','hi','पुर्तगाल','seed'),
  ('country','NL','hi','नीदरलैंड','seed'),
  ('country','BE','hi','बेल्जियम','seed'),
  ('country','CH','hi','स्विट्ज़रलैंड','seed'),
  ('country','AT','hi','ऑस्ट्रिया','seed'),
  ('country','SE','hi','स्वीडन','seed'),
  ('country','NO','hi','नॉर्वे','seed'),
  ('country','DK','hi','डेनमार्क','seed'),
  ('country','FI','hi','फ़िनलैंड','seed'),
  ('country','PL','hi','पोलैंड','seed'),
  ('country','GR','hi','यूनान','seed'),
  ('country','RU','hi','रूस','seed'),
  ('country','UA','hi','यूक्रेन','seed'),
  ('country','CN','hi','चीन','seed'),
  ('country','JP','hi','जापान','seed'),
  ('country','KR','hi','दक्षिण कोरिया','seed'),
  ('country','IN','hi','भारत','seed'),
  ('country','PK','hi','पाकिस्तान','seed'),
  ('country','BD','hi','बांग्लादेश','seed'),
  ('country','ID','hi','इंडोनेशिया','seed'),
  ('country','MY','hi','मलेशिया','seed'),
  ('country','SG','hi','सिंगापुर','seed'),
  ('country','TH','hi','थाईलैंड','seed'),
  ('country','VN','hi','वियतनाम','seed'),
  ('country','PH','hi','फ़िलीपींस','seed'),
  ('country','AU','hi','ऑस्ट्रेलिया','seed'),
  ('country','NZ','hi','न्यूज़ीलैंड','seed'),
  ('country','CA','hi','कनाडा','seed'),
  ('country','MX','hi','मेक्सिको','seed'),
  ('country','BR','hi','ब्राज़ील','seed'),
  ('country','AR','hi','अर्जेंटीना','seed'),
  ('country','ZA','hi','दक्षिण अफ़्रीका','seed'),
  ('country','NG','hi','नाइजीरिया','seed'),
  ('country','KE','hi','केन्या','seed'),
  ('country','ET','hi','इथियोपिया','seed'),
  ('country','HK','hi','हॉन्ग कॉन्ग','seed'),
  ('country','TW','hi','ताइवान','seed'),
  ('country','AF','hi','अफ़गानिस्तान','seed'),
  ('country','LK','hi','श्रीलंका','seed'),
  ('country','NP','hi','नेपाल','seed'),
  ('country','MM','hi','म्यानमार','seed'),
  ('country','KH','hi','कंबोडिया','seed'),
  ('country','IE','hi','आयरलैंड','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Currencies — GCC + Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('currency','SAR','hi','सऊदी रियाल','seed'),
  ('currency','AED','hi','यूएई दिरहम','seed'),
  ('currency','BHD','hi','बहरीनी दीनार','seed'),
  ('currency','KWD','hi','कुवैती दीनार','seed'),
  ('currency','OMR','hi','ओमानी रियाल','seed'),
  ('currency','QAR','hi','क़तरी रियाल','seed'),
  ('currency','EGP','hi','मिस्री पाउंड','seed'),
  ('currency','JOD','hi','जॉर्डनियाई दीनार','seed'),
  ('currency','IQD','hi','इराकी दीनार','seed'),
  ('currency','TRY','hi','तुर्की लीरा','seed'),
  ('currency','USD','hi','अमेरिकी डॉलर','seed'),
  ('currency','EUR','hi','यूरो','seed'),
  ('currency','GBP','hi','ब्रिटिश पाउंड','seed'),
  ('currency','JPY','hi','जापानी येन','seed'),
  ('currency','CNY','hi','चीनी युआन','seed'),
  ('currency','CHF','hi','स्विस फ़्रैंक','seed'),
  ('currency','CAD','hi','कैनेडियन डॉलर','seed'),
  ('currency','AUD','hi','ऑस्ट्रेलियाई डॉलर','seed'),
  ('currency','INR','hi','भारतीय रुपया','seed'),
  ('currency','PKR','hi','पाकिस्तानी रुपया','seed'),
  ('currency','BRL','hi','ब्राज़ीलियन रियाल','seed'),
  ('currency','KRW','hi','दक्षिण कोरियाई वॉन','seed'),
  ('currency','SGD','hi','सिंगापुर डॉलर','seed'),
  ('currency','HKD','hi','हॉन्ग कॉन्ग डॉलर','seed'),
  ('currency','MYR','hi','मलेशियाई रिंगिट','seed'),
  ('currency','IDR','hi','इंडोनेशियाई रुपिया','seed'),
  ('currency','THB','hi','थाई बात','seed'),
  ('currency','LKR','hi','श्रीलंकाई रुपया','seed'),
  ('currency','NPR','hi','नेपाली रुपया','seed'),
  ('currency','NZD','hi','न्यूज़ीलैंड डॉलर','seed'),
  ('currency','ZAR','hi','दक्षिण अफ़्रीकी रैंड','seed'),
  ('currency','RUB','hi','रूसी रूबल','seed'),
  ('currency','XAU','hi','सोना (ट्रॉय औंस)','seed'),
  ('currency','XAG','hi','चाँदी (ट्रॉय औंस)','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Languages — Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('language','hi','hi','हिन्दी','seed'),
  ('language','en','hi','अंग्रेज़ी','seed'),
  ('language','ar','hi','अरबी','seed'),
  ('language','fr','hi','फ़्रेंच','seed'),
  ('language','de','hi','जर्मन','seed'),
  ('language','es','hi','स्पेनी','seed'),
  ('language','pt','hi','पुर्तगाली','seed'),
  ('language','it','hi','इतालवी','seed'),
  ('language','nl','hi','डच','seed'),
  ('language','ru','hi','रूसी','seed'),
  ('language','zh','hi','चीनी','seed'),
  ('language','ja','hi','जापानी','seed'),
  ('language','ko','hi','कोरियाई','seed'),
  ('language','bn','hi','बांग्ला','seed'),
  ('language','ur','hi','उर्दू','seed'),
  ('language','fa','hi','फ़ारसी','seed'),
  ('language','tr','hi','तुर्की','seed'),
  ('language','ta','hi','तमिल','seed'),
  ('language','te','hi','तेलुगु','seed'),
  ('language','ml','hi','मलयालम','seed'),
  ('language','kn','hi','कन्नड़','seed'),
  ('language','mr','hi','मराठी','seed'),
  ('language','gu','hi','गुजराती','seed'),
  ('language','pa','hi','पंजाबी','seed'),
  ('language','ms','hi','मलय','seed'),
  ('language','id','hi','इंडोनेशियाई','seed'),
  ('language','th','hi','थाई','seed'),
  ('language','vi','hi','वियतनामी','seed'),
  ('language','pl','hi','पोलिश','seed'),
  ('language','uk','hi','यूक्रेनी','seed'),
  ('language','sv','hi','स्वीडिश','seed'),
  ('language','el','hi','यूनानी','seed'),
  ('language','he','hi','हिब्रू','seed'),
  ('language','sw','hi','स्वाहिली','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- UOM — Core units
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('uom','EA','hi','इकाई','seed'),
  ('uom','C62','hi','एक','seed'),
  ('uom','PR','hi','जोड़ा','seed'),
  ('uom','DZN','hi','दर्जन','seed'),
  ('uom','SET','hi','सेट','seed'),
  ('uom','PK','hi','पैक','seed'),
  ('uom','BX','hi','डिब्बा','seed'),
  ('uom','CT','hi','कार्टन','seed'),
  ('uom','PL','hi','पैलेट','seed'),
  ('uom','MGM','hi','मिलीग्राम','seed'),
  ('uom','GRM','hi','ग्राम','seed'),
  ('uom','KGM','hi','किलोग्राम','seed'),
  ('uom','TNE','hi','मीट्रिक टन','seed'),
  ('uom','LBR','hi','पाउंड','seed'),
  ('uom','ONZ','hi','औंस','seed'),
  ('uom','MMT','hi','मिलीमीटर','seed'),
  ('uom','CMT','hi','सेंटीमीटर','seed'),
  ('uom','MTR','hi','मीटर','seed'),
  ('uom','KMT','hi','किलोमीटर','seed'),
  ('uom','INH','hi','इंच','seed'),
  ('uom','FOT','hi','फ़ुट','seed'),
  ('uom','YRD','hi','गज','seed'),
  ('uom','SMI','hi','मील','seed'),
  ('uom','MTK','hi','वर्ग मीटर','seed'),
  ('uom','KMK','hi','वर्ग किलोमीटर','seed'),
  ('uom','HAR','hi','हेक्टेयर','seed'),
  ('uom','ACR','hi','एकड़','seed'),
  ('uom','MLT','hi','मिलीलीटर','seed'),
  ('uom','LTR','hi','लीटर','seed'),
  ('uom','MTQ','hi','घन मीटर','seed'),
  ('uom','GLL','hi','गैलन','seed'),
  ('uom','BLL','hi','बैरल','seed'),
  ('uom','SEC','hi','सेकंड','seed'),
  ('uom','MIN','hi','मिनट','seed'),
  ('uom','HUR','hi','घंटा','seed'),
  ('uom','DAY','hi','दिन','seed'),
  ('uom','WEE','hi','सप्ताह','seed'),
  ('uom','MON','hi','महीना','seed'),
  ('uom','ANN','hi','वर्ष','seed'),
  ('uom','CEL','hi','डिग्री सेल्सियस','seed'),
  ('uom','FAH','hi','डिग्री फ़ारेनहाइट','seed'),
  ('uom','KWH','hi','किलोवाट घंटा','seed'),
  ('uom','WTT','hi','वाट','seed'),
  ('uom','KWT','hi','किलोवाट','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Saudi & UAE Regions
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('state_region','SA-01','hi','रियाद क्षेत्र','seed'),
  ('state_region','SA-02','hi','मक्का क्षेत्र','seed'),
  ('state_region','SA-03','hi','मदीना क्षेत्र','seed'),
  ('state_region','SA-04','hi','पूर्वी क्षेत्र','seed'),
  ('state_region','SA-05','hi','अल-क़सीम क्षेत्र','seed'),
  ('state_region','SA-06','hi','हाइल क्षेत्र','seed'),
  ('state_region','SA-07','hi','तबूक क्षेत्र','seed'),
  ('state_region','SA-08','hi','उत्तरी सीमा क्षेत्र','seed'),
  ('state_region','SA-09','hi','जाज़ान क्षेत्र','seed'),
  ('state_region','SA-10','hi','नजरान क्षेत्र','seed'),
  ('state_region','SA-11','hi','अल बाहा क्षेत्र','seed'),
  ('state_region','SA-12','hi','अल जौफ़ क्षेत्र','seed'),
  ('state_region','SA-14','hi','असीर क्षेत्र','seed'),
  ('state_region','AE-AZ','hi','अबू धाबी','seed'),
  ('state_region','AE-DU','hi','दुबई','seed'),
  ('state_region','AE-SH','hi','शारजाह','seed'),
  ('state_region','AE-AJ','hi','अजमान','seed'),
  ('state_region','AE-UQ','hi','उम्म अल-क़ुवैन','seed'),
  ('state_region','AE-RK','hi','रास अल-ख़ैमा','seed'),
  ('state_region','AE-FU','hi','फ़ुजैरा','seed')
on conflict (entity, code, locale_code) do nothing;
