/* ============================================================================
   Athyper — REF Seed: Malay (Bahasa Melayu) Labels (i18n)
   PostgreSQL 16+

   Malay translations for key reference data entities.
   Depends on: 010_ref_master_tables.sql, 050_ref_seed_locales.sql
   ============================================================================ */

-- ============================================================================
-- Countries — GCC + MENA + Major World
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  -- GCC
  ('country','SA','ms','Arab Saudi','seed'),
  ('country','AE','ms','Emiriah Arab Bersatu','seed'),
  ('country','BH','ms','Bahrain','seed'),
  ('country','KW','ms','Kuwait','seed'),
  ('country','OM','ms','Oman','seed'),
  ('country','QA','ms','Qatar','seed'),

  -- MENA
  ('country','EG','ms','Mesir','seed'),
  ('country','JO','ms','Jordan','seed'),
  ('country','LB','ms','Lubnan','seed'),
  ('country','IQ','ms','Iraq','seed'),
  ('country','SY','ms','Syria','seed'),
  ('country','YE','ms','Yaman','seed'),
  ('country','PS','ms','Palestin','seed'),
  ('country','SD','ms','Sudan','seed'),
  ('country','LY','ms','Libya','seed'),
  ('country','TN','ms','Tunisia','seed'),
  ('country','DZ','ms','Algeria','seed'),
  ('country','MA','ms','Maghribi','seed'),
  ('country','IR','ms','Iran','seed'),
  ('country','TR','ms','Turki','seed'),
  ('country','IL','ms','Israel','seed'),

  -- Major World
  ('country','US','ms','Amerika Syarikat','seed'),
  ('country','GB','ms','United Kingdom','seed'),
  ('country','FR','ms','Perancis','seed'),
  ('country','DE','ms','Jerman','seed'),
  ('country','IT','ms','Itali','seed'),
  ('country','ES','ms','Sepanyol','seed'),
  ('country','PT','ms','Portugal','seed'),
  ('country','NL','ms','Belanda','seed'),
  ('country','BE','ms','Belgium','seed'),
  ('country','CH','ms','Switzerland','seed'),
  ('country','AT','ms','Austria','seed'),
  ('country','SE','ms','Sweden','seed'),
  ('country','NO','ms','Norway','seed'),
  ('country','DK','ms','Denmark','seed'),
  ('country','FI','ms','Finland','seed'),
  ('country','PL','ms','Poland','seed'),
  ('country','GR','ms','Greece','seed'),
  ('country','RU','ms','Rusia','seed'),
  ('country','UA','ms','Ukraine','seed'),
  ('country','CN','ms','China','seed'),
  ('country','JP','ms','Jepun','seed'),
  ('country','KR','ms','Korea Selatan','seed'),
  ('country','IN','ms','India','seed'),
  ('country','PK','ms','Pakistan','seed'),
  ('country','BD','ms','Bangladesh','seed'),
  ('country','ID','ms','Indonesia','seed'),
  ('country','MY','ms','Malaysia','seed'),
  ('country','SG','ms','Singapura','seed'),
  ('country','TH','ms','Thailand','seed'),
  ('country','VN','ms','Vietnam','seed'),
  ('country','PH','ms','Filipina','seed'),
  ('country','AU','ms','Australia','seed'),
  ('country','NZ','ms','New Zealand','seed'),
  ('country','CA','ms','Kanada','seed'),
  ('country','MX','ms','Mexico','seed'),
  ('country','BR','ms','Brazil','seed'),
  ('country','AR','ms','Argentina','seed'),
  ('country','ZA','ms','Afrika Selatan','seed'),
  ('country','NG','ms','Nigeria','seed'),
  ('country','KE','ms','Kenya','seed'),
  ('country','ET','ms','Ethiopia','seed'),
  ('country','HK','ms','Hong Kong','seed'),
  ('country','TW','ms','Taiwan','seed'),
  ('country','AF','ms','Afghanistan','seed'),
  ('country','LK','ms','Sri Lanka','seed'),
  ('country','NP','ms','Nepal','seed'),
  ('country','MM','ms','Myanmar','seed'),
  ('country','KH','ms','Kemboja','seed'),
  ('country','IE','ms','Ireland','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Currencies — GCC + Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('currency','SAR','ms','Riyal Saudi','seed'),
  ('currency','AED','ms','Dirham UAE','seed'),
  ('currency','BHD','ms','Dinar Bahrain','seed'),
  ('currency','KWD','ms','Dinar Kuwait','seed'),
  ('currency','OMR','ms','Riyal Oman','seed'),
  ('currency','QAR','ms','Riyal Qatar','seed'),
  ('currency','EGP','ms','Paun Mesir','seed'),
  ('currency','JOD','ms','Dinar Jordan','seed'),
  ('currency','IQD','ms','Dinar Iraq','seed'),
  ('currency','TRY','ms','Lira Turki','seed'),
  ('currency','USD','ms','Dolar AS','seed'),
  ('currency','EUR','ms','Euro','seed'),
  ('currency','GBP','ms','Paun Sterling','seed'),
  ('currency','JPY','ms','Yen Jepun','seed'),
  ('currency','CNY','ms','Yuan Renminbi','seed'),
  ('currency','CHF','ms','Franc Swiss','seed'),
  ('currency','CAD','ms','Dolar Kanada','seed'),
  ('currency','AUD','ms','Dolar Australia','seed'),
  ('currency','INR','ms','Rupee India','seed'),
  ('currency','PKR','ms','Rupee Pakistan','seed'),
  ('currency','BRL','ms','Real Brazil','seed'),
  ('currency','MXN','ms','Peso Mexico','seed'),
  ('currency','KRW','ms','Won Korea','seed'),
  ('currency','SGD','ms','Dolar Singapura','seed'),
  ('currency','HKD','ms','Dolar Hong Kong','seed'),
  ('currency','MYR','ms','Ringgit Malaysia','seed'),
  ('currency','IDR','ms','Rupiah Indonesia','seed'),
  ('currency','THB','ms','Baht Thailand','seed'),
  ('currency','NZD','ms','Dolar New Zealand','seed'),
  ('currency','ZAR','ms','Rand Afrika Selatan','seed'),
  ('currency','RUB','ms','Ruble Rusia','seed'),
  ('currency','XAU','ms','Emas (auns troy)','seed'),
  ('currency','XAG','ms','Perak (auns troy)','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Languages — Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('language','ms','ms','Bahasa Melayu','seed'),
  ('language','en','ms','Bahasa Inggeris','seed'),
  ('language','ar','ms','Bahasa Arab','seed'),
  ('language','fr','ms','Bahasa Perancis','seed'),
  ('language','de','ms','Bahasa Jerman','seed'),
  ('language','es','ms','Bahasa Sepanyol','seed'),
  ('language','pt','ms','Bahasa Portugis','seed'),
  ('language','it','ms','Bahasa Itali','seed'),
  ('language','nl','ms','Bahasa Belanda','seed'),
  ('language','ru','ms','Bahasa Rusia','seed'),
  ('language','zh','ms','Bahasa Cina','seed'),
  ('language','ja','ms','Bahasa Jepun','seed'),
  ('language','ko','ms','Bahasa Korea','seed'),
  ('language','hi','ms','Bahasa Hindi','seed'),
  ('language','bn','ms','Bahasa Bengali','seed'),
  ('language','ur','ms','Bahasa Urdu','seed'),
  ('language','fa','ms','Bahasa Parsi','seed'),
  ('language','tr','ms','Bahasa Turki','seed'),
  ('language','ta','ms','Bahasa Tamil','seed'),
  ('language','te','ms','Bahasa Telugu','seed'),
  ('language','id','ms','Bahasa Indonesia','seed'),
  ('language','th','ms','Bahasa Thai','seed'),
  ('language','vi','ms','Bahasa Vietnam','seed'),
  ('language','pl','ms','Bahasa Poland','seed'),
  ('language','uk','ms','Bahasa Ukraine','seed'),
  ('language','sv','ms','Bahasa Sweden','seed'),
  ('language','el','ms','Bahasa Greek','seed'),
  ('language','he','ms','Bahasa Ibrani','seed'),
  ('language','sw','ms','Bahasa Swahili','seed'),
  ('language','fi','ms','Bahasa Finland','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- UOM — Core units
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('uom','EA','ms','Unit','seed'),
  ('uom','C62','ms','Satu','seed'),
  ('uom','PR','ms','Pasang','seed'),
  ('uom','DZN','ms','Dozen','seed'),
  ('uom','SET','ms','Set','seed'),
  ('uom','PK','ms','Bungkus','seed'),
  ('uom','BX','ms','Kotak','seed'),
  ('uom','CT','ms','Karton','seed'),
  ('uom','PL','ms','Palet','seed'),
  ('uom','MGM','ms','Miligram','seed'),
  ('uom','GRM','ms','Gram','seed'),
  ('uom','KGM','ms','Kilogram','seed'),
  ('uom','TNE','ms','Tan Metrik','seed'),
  ('uom','LBR','ms','Paun','seed'),
  ('uom','ONZ','ms','Auns','seed'),
  ('uom','MMT','ms','Milimeter','seed'),
  ('uom','CMT','ms','Sentimeter','seed'),
  ('uom','MTR','ms','Meter','seed'),
  ('uom','KMT','ms','Kilometer','seed'),
  ('uom','INH','ms','Inci','seed'),
  ('uom','FOT','ms','Kaki','seed'),
  ('uom','YRD','ms','Ela','seed'),
  ('uom','SMI','ms','Batu','seed'),
  ('uom','MTK','ms','Meter Persegi','seed'),
  ('uom','KMK','ms','Kilometer Persegi','seed'),
  ('uom','HAR','ms','Hektar','seed'),
  ('uom','ACR','ms','Ekar','seed'),
  ('uom','MLT','ms','Mililiter','seed'),
  ('uom','LTR','ms','Liter','seed'),
  ('uom','MTQ','ms','Meter Padu','seed'),
  ('uom','GLL','ms','Gelen','seed'),
  ('uom','BLL','ms','Tong','seed'),
  ('uom','SEC','ms','Saat','seed'),
  ('uom','MIN','ms','Minit','seed'),
  ('uom','HUR','ms','Jam','seed'),
  ('uom','DAY','ms','Hari','seed'),
  ('uom','WEE','ms','Minggu','seed'),
  ('uom','MON','ms','Bulan','seed'),
  ('uom','ANN','ms','Tahun','seed'),
  ('uom','CEL','ms','Darjah Celsius','seed'),
  ('uom','FAH','ms','Darjah Fahrenheit','seed'),
  ('uom','KWH','ms','Kilowatt jam','seed'),
  ('uom','WTT','ms','Watt','seed'),
  ('uom','KWT','ms','Kilowatt','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Saudi & UAE Regions
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('state_region','SA-01','ms','Wilayah Riyadh','seed'),
  ('state_region','SA-02','ms','Wilayah Makkah','seed'),
  ('state_region','SA-03','ms','Wilayah Madinah','seed'),
  ('state_region','SA-04','ms','Wilayah Timur','seed'),
  ('state_region','SA-05','ms','Wilayah Al-Qassim','seed'),
  ('state_region','SA-06','ms','Wilayah Ha''il','seed'),
  ('state_region','SA-07','ms','Wilayah Tabuk','seed'),
  ('state_region','SA-08','ms','Wilayah Sempadan Utara','seed'),
  ('state_region','SA-09','ms','Wilayah Jazan','seed'),
  ('state_region','SA-10','ms','Wilayah Najran','seed'),
  ('state_region','SA-11','ms','Wilayah Al Bahah','seed'),
  ('state_region','SA-12','ms','Wilayah Al Jawf','seed'),
  ('state_region','SA-14','ms','Wilayah Asir','seed'),
  ('state_region','AE-AZ','ms','Abu Dhabi','seed'),
  ('state_region','AE-DU','ms','Dubai','seed'),
  ('state_region','AE-SH','ms','Sharjah','seed'),
  ('state_region','AE-AJ','ms','Ajman','seed'),
  ('state_region','AE-UQ','ms','Umm al-Quwain','seed'),
  ('state_region','AE-RK','ms','Ras al-Khaimah','seed'),
  ('state_region','AE-FU','ms','Fujairah','seed')
on conflict (entity, code, locale_code) do nothing;
