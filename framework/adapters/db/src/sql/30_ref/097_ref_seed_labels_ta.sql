/* ============================================================================
   Athyper — REF Seed: Tamil (தமிழ்) Labels (i18n)
   PostgreSQL 16+

   Tamil translations for key reference data entities.
   Depends on: 010_ref_master_tables.sql, 050_ref_seed_locales.sql
   ============================================================================ */

-- ============================================================================
-- Countries — GCC + MENA + Major World
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  -- GCC
  ('country','SA','ta','சவூதி அரேபியா','seed'),
  ('country','AE','ta','ஐக்கிய அரபு எமிரேட்ஸ்','seed'),
  ('country','BH','ta','பஹ்ரைன்','seed'),
  ('country','KW','ta','குவைத்','seed'),
  ('country','OM','ta','ஓமான்','seed'),
  ('country','QA','ta','கத்தார்','seed'),

  -- MENA
  ('country','EG','ta','எகிப்து','seed'),
  ('country','JO','ta','ஜோர்டான்','seed'),
  ('country','LB','ta','லெபனான்','seed'),
  ('country','IQ','ta','ஈராக்','seed'),
  ('country','SY','ta','சிரியா','seed'),
  ('country','YE','ta','யேமன்','seed'),
  ('country','PS','ta','பாலஸ்தீனம்','seed'),
  ('country','SD','ta','சூடான்','seed'),
  ('country','LY','ta','லிபியா','seed'),
  ('country','TN','ta','துனிசியா','seed'),
  ('country','DZ','ta','அல்ஜீரியா','seed'),
  ('country','MA','ta','மொராக்கோ','seed'),
  ('country','IR','ta','ஈரான்','seed'),
  ('country','TR','ta','துருக்கி','seed'),
  ('country','IL','ta','இஸ்ரேல்','seed'),

  -- Major World
  ('country','US','ta','அமெரிக்கா','seed'),
  ('country','GB','ta','ஐக்கிய இராச்சியம்','seed'),
  ('country','FR','ta','பிரான்ஸ்','seed'),
  ('country','DE','ta','ஜெர்மனி','seed'),
  ('country','IT','ta','இத்தாலி','seed'),
  ('country','ES','ta','ஸ்பெயின்','seed'),
  ('country','PT','ta','போர்ச்சுகல்','seed'),
  ('country','NL','ta','நெதர்லாந்து','seed'),
  ('country','BE','ta','பெல்ஜியம்','seed'),
  ('country','CH','ta','சுவிட்சர்லாந்து','seed'),
  ('country','AT','ta','ஆஸ்திரியா','seed'),
  ('country','SE','ta','சுவீடன்','seed'),
  ('country','NO','ta','நார்வே','seed'),
  ('country','DK','ta','டென்மார்க்','seed'),
  ('country','FI','ta','பின்லாந்து','seed'),
  ('country','PL','ta','போலந்து','seed'),
  ('country','GR','ta','கிரீஸ்','seed'),
  ('country','RU','ta','ரஷ்யா','seed'),
  ('country','UA','ta','உக்ரைன்','seed'),
  ('country','CN','ta','சீனா','seed'),
  ('country','JP','ta','ஜப்பான்','seed'),
  ('country','KR','ta','தென் கொரியா','seed'),
  ('country','IN','ta','இந்தியா','seed'),
  ('country','PK','ta','பாகிஸ்தான்','seed'),
  ('country','BD','ta','வங்கதேசம்','seed'),
  ('country','ID','ta','இந்தோனேசியா','seed'),
  ('country','MY','ta','மலேசியா','seed'),
  ('country','SG','ta','சிங்கப்பூர்','seed'),
  ('country','TH','ta','தாய்லாந்து','seed'),
  ('country','VN','ta','வியட்நாம்','seed'),
  ('country','PH','ta','பிலிப்பைன்ஸ்','seed'),
  ('country','AU','ta','ஆஸ்திரேலியா','seed'),
  ('country','NZ','ta','நியூசிலாந்து','seed'),
  ('country','CA','ta','கனடா','seed'),
  ('country','MX','ta','மெக்சிகோ','seed'),
  ('country','BR','ta','பிரேசில்','seed'),
  ('country','AR','ta','அர்ஜெண்டீனா','seed'),
  ('country','ZA','ta','தென் ஆப்பிரிக்கா','seed'),
  ('country','NG','ta','நைஜீரியா','seed'),
  ('country','KE','ta','கென்யா','seed'),
  ('country','ET','ta','எத்தியோப்பியா','seed'),
  ('country','HK','ta','ஹாங்காங்','seed'),
  ('country','TW','ta','தைவான்','seed'),
  ('country','AF','ta','ஆப்கானிஸ்தான்','seed'),
  ('country','LK','ta','இலங்கை','seed'),
  ('country','NP','ta','நேபாளம்','seed'),
  ('country','MM','ta','மியான்மர்','seed'),
  ('country','KH','ta','கம்போடியா','seed'),
  ('country','IE','ta','அயர்லாந்து','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Currencies — GCC + Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('currency','SAR','ta','சவூதி ரியால்','seed'),
  ('currency','AED','ta','யுஏஇ திர்ஹாம்','seed'),
  ('currency','BHD','ta','பஹ்ரைன் தினார்','seed'),
  ('currency','KWD','ta','குவைத் தினார்','seed'),
  ('currency','OMR','ta','ஓமான் ரியால்','seed'),
  ('currency','QAR','ta','கத்தார் ரியால்','seed'),
  ('currency','EGP','ta','எகிப்திய பவுண்டு','seed'),
  ('currency','JOD','ta','ஜோர்டானிய தினார்','seed'),
  ('currency','IQD','ta','ஈராக் தினார்','seed'),
  ('currency','TRY','ta','துருக்கிய லிரா','seed'),
  ('currency','USD','ta','அமெரிக்க டாலர்','seed'),
  ('currency','EUR','ta','யூரோ','seed'),
  ('currency','GBP','ta','பிரிட்டிஷ் பவுண்டு','seed'),
  ('currency','JPY','ta','ஜப்பானிய யென்','seed'),
  ('currency','CNY','ta','சீன யுவான்','seed'),
  ('currency','CHF','ta','சுவிஸ் பிராங்க்','seed'),
  ('currency','CAD','ta','கனேடிய டாலர்','seed'),
  ('currency','AUD','ta','ஆஸ்திரேலிய டாலர்','seed'),
  ('currency','INR','ta','இந்திய ரூபாய்','seed'),
  ('currency','PKR','ta','பாகிஸ்தான் ரூபாய்','seed'),
  ('currency','BRL','ta','பிரேசிலிய ரியால்','seed'),
  ('currency','KRW','ta','கொரிய வான்','seed'),
  ('currency','SGD','ta','சிங்கப்பூர் டாலர்','seed'),
  ('currency','HKD','ta','ஹாங்காங் டாலர்','seed'),
  ('currency','MYR','ta','மலேசிய ரிங்கிட்','seed'),
  ('currency','IDR','ta','இந்தோனேசிய ரூபியா','seed'),
  ('currency','THB','ta','தாய் பாட்','seed'),
  ('currency','LKR','ta','இலங்கை ரூபாய்','seed'),
  ('currency','NZD','ta','நியூசிலாந்து டாலர்','seed'),
  ('currency','ZAR','ta','தென் ஆப்பிரிக்க ராண்ட்','seed'),
  ('currency','RUB','ta','ரஷ்ய ரூபிள்','seed'),
  ('currency','XAU','ta','தங்கம் (ட்ராய் அவுன்ஸ்)','seed'),
  ('currency','XAG','ta','வெள்ளி (ட்ராய் அவுன்ஸ்)','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Languages — Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('language','ta','ta','தமிழ்','seed'),
  ('language','en','ta','ஆங்கிலம்','seed'),
  ('language','ar','ta','அரபு','seed'),
  ('language','fr','ta','பிரெஞ்சு','seed'),
  ('language','de','ta','ஜெர்மன்','seed'),
  ('language','es','ta','ஸ்பானிஷ்','seed'),
  ('language','pt','ta','போர்ச்சுகீசு','seed'),
  ('language','it','ta','இத்தாலியன்','seed'),
  ('language','nl','ta','டச்சு','seed'),
  ('language','ru','ta','ரஷ்யன்','seed'),
  ('language','zh','ta','சீனம்','seed'),
  ('language','ja','ta','ஜப்பானியம்','seed'),
  ('language','ko','ta','கொரியன்','seed'),
  ('language','hi','ta','ஹிந்தி','seed'),
  ('language','bn','ta','வங்காளம்','seed'),
  ('language','ur','ta','உருது','seed'),
  ('language','fa','ta','பாரசீகம்','seed'),
  ('language','tr','ta','துருக்கியம்','seed'),
  ('language','te','ta','தெலுங்கு','seed'),
  ('language','ml','ta','மலையாளம்','seed'),
  ('language','kn','ta','கன்னடம்','seed'),
  ('language','ms','ta','மலாய்','seed'),
  ('language','id','ta','இந்தோனேசியன்','seed'),
  ('language','th','ta','தாய்','seed'),
  ('language','vi','ta','வியட்நாமியம்','seed'),
  ('language','pl','ta','போலிஷ்','seed'),
  ('language','uk','ta','உக்ரேனியன்','seed'),
  ('language','sv','ta','ஸ்வீடிஷ்','seed'),
  ('language','el','ta','கிரேக்கம்','seed'),
  ('language','he','ta','ஹீப்ரு','seed'),
  ('language','sw','ta','சுவாஹிலி','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- UOM — Core units
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('uom','EA','ta','அலகு','seed'),
  ('uom','C62','ta','ஒன்று','seed'),
  ('uom','PR','ta','இணை','seed'),
  ('uom','DZN','ta','டஜன்','seed'),
  ('uom','SET','ta','தொகுப்பு','seed'),
  ('uom','PK','ta','பொட்டலம்','seed'),
  ('uom','BX','ta','பெட்டி','seed'),
  ('uom','CT','ta','அட்டைப்பெட்டி','seed'),
  ('uom','PL','ta','தட்டு','seed'),
  ('uom','MGM','ta','மில்லிகிராம்','seed'),
  ('uom','GRM','ta','கிராம்','seed'),
  ('uom','KGM','ta','கிலோகிராம்','seed'),
  ('uom','TNE','ta','மெட்ரிக் டன்','seed'),
  ('uom','LBR','ta','பவுண்டு','seed'),
  ('uom','ONZ','ta','அவுன்ஸ்','seed'),
  ('uom','MMT','ta','மில்லிமீட்டர்','seed'),
  ('uom','CMT','ta','சென்டிமீட்டர்','seed'),
  ('uom','MTR','ta','மீட்டர்','seed'),
  ('uom','KMT','ta','கிலோமீட்டர்','seed'),
  ('uom','INH','ta','அங்குலம்','seed'),
  ('uom','FOT','ta','அடி','seed'),
  ('uom','YRD','ta','கெஜம்','seed'),
  ('uom','SMI','ta','மைல்','seed'),
  ('uom','MTK','ta','சதுர மீட்டர்','seed'),
  ('uom','KMK','ta','சதுர கிலோமீட்டர்','seed'),
  ('uom','HAR','ta','ஹெக்டேர்','seed'),
  ('uom','ACR','ta','ஏக்கர்','seed'),
  ('uom','MLT','ta','மில்லிலீட்டர்','seed'),
  ('uom','LTR','ta','லீட்டர்','seed'),
  ('uom','MTQ','ta','கன மீட்டர்','seed'),
  ('uom','GLL','ta','காலன்','seed'),
  ('uom','BLL','ta','பீப்பாய்','seed'),
  ('uom','SEC','ta','விநாடி','seed'),
  ('uom','MIN','ta','நிமிடம்','seed'),
  ('uom','HUR','ta','மணி','seed'),
  ('uom','DAY','ta','நாள்','seed'),
  ('uom','WEE','ta','வாரம்','seed'),
  ('uom','MON','ta','மாதம்','seed'),
  ('uom','ANN','ta','ஆண்டு','seed'),
  ('uom','CEL','ta','செல்சியஸ்','seed'),
  ('uom','FAH','ta','ஃபாரன்ஹீட்','seed'),
  ('uom','KWH','ta','கிலோவாட் மணி','seed'),
  ('uom','WTT','ta','வாட்','seed'),
  ('uom','KWT','ta','கிலோவாட்','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Saudi & UAE Regions
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('state_region','SA-01','ta','ரியாத் மாகாணம்','seed'),
  ('state_region','SA-02','ta','மக்கா மாகாணம்','seed'),
  ('state_region','SA-03','ta','மதீனா மாகாணம்','seed'),
  ('state_region','SA-04','ta','கிழக்கு மாகாணம்','seed'),
  ('state_region','SA-05','ta','அல்-கசீம் மாகாணம்','seed'),
  ('state_region','SA-06','ta','ஹாயில் மாகாணம்','seed'),
  ('state_region','SA-07','ta','தபூக் மாகாணம்','seed'),
  ('state_region','SA-08','ta','வட எல்லை மாகாணம்','seed'),
  ('state_region','SA-09','ta','ஜாசான் மாகாணம்','seed'),
  ('state_region','SA-10','ta','நஜ்ரான் மாகாணம்','seed'),
  ('state_region','SA-11','ta','அல் பாஹா மாகாணம்','seed'),
  ('state_region','SA-12','ta','அல் ஜவ்ஃப் மாகாணம்','seed'),
  ('state_region','SA-14','ta','அசீர் மாகாணம்','seed'),
  ('state_region','AE-AZ','ta','அபுதாபி','seed'),
  ('state_region','AE-DU','ta','துபாய்','seed'),
  ('state_region','AE-SH','ta','ஷார்ஜா','seed'),
  ('state_region','AE-AJ','ta','அஜ்மான்','seed'),
  ('state_region','AE-UQ','ta','உம் அல்-குவைன்','seed'),
  ('state_region','AE-RK','ta','ராஸ் அல்-கைமா','seed'),
  ('state_region','AE-FU','ta','ஃபுஜைரா','seed')
on conflict (entity, code, locale_code) do nothing;
