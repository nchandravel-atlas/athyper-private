/* ============================================================================
   Athyper — REF Seed: German (Deutsch) Labels (i18n)
   PostgreSQL 16+

   German translations for key reference data entities.
   Depends on: 010_ref_master_tables.sql, 050_ref_seed_locales.sql
   ============================================================================ */

-- ============================================================================
-- Countries — GCC + MENA + Major World
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  -- GCC
  ('country','SA','de','Saudi-Arabien','seed'),
  ('country','AE','de','Vereinigte Arabische Emirate','seed'),
  ('country','BH','de','Bahrain','seed'),
  ('country','KW','de','Kuwait','seed'),
  ('country','OM','de','Oman','seed'),
  ('country','QA','de','Katar','seed'),

  -- MENA
  ('country','EG','de','Ägypten','seed'),
  ('country','JO','de','Jordanien','seed'),
  ('country','LB','de','Libanon','seed'),
  ('country','IQ','de','Irak','seed'),
  ('country','SY','de','Syrien','seed'),
  ('country','YE','de','Jemen','seed'),
  ('country','PS','de','Palästina','seed'),
  ('country','SD','de','Sudan','seed'),
  ('country','LY','de','Libyen','seed'),
  ('country','TN','de','Tunesien','seed'),
  ('country','DZ','de','Algerien','seed'),
  ('country','MA','de','Marokko','seed'),
  ('country','IR','de','Iran','seed'),
  ('country','TR','de','Türkei','seed'),
  ('country','IL','de','Israel','seed'),

  -- Major World
  ('country','US','de','Vereinigte Staaten','seed'),
  ('country','GB','de','Vereinigtes Königreich','seed'),
  ('country','FR','de','Frankreich','seed'),
  ('country','DE','de','Deutschland','seed'),
  ('country','IT','de','Italien','seed'),
  ('country','ES','de','Spanien','seed'),
  ('country','PT','de','Portugal','seed'),
  ('country','NL','de','Niederlande','seed'),
  ('country','BE','de','Belgien','seed'),
  ('country','CH','de','Schweiz','seed'),
  ('country','AT','de','Österreich','seed'),
  ('country','SE','de','Schweden','seed'),
  ('country','NO','de','Norwegen','seed'),
  ('country','DK','de','Dänemark','seed'),
  ('country','FI','de','Finnland','seed'),
  ('country','PL','de','Polen','seed'),
  ('country','GR','de','Griechenland','seed'),
  ('country','RU','de','Russland','seed'),
  ('country','UA','de','Ukraine','seed'),
  ('country','CN','de','China','seed'),
  ('country','JP','de','Japan','seed'),
  ('country','KR','de','Südkorea','seed'),
  ('country','IN','de','Indien','seed'),
  ('country','PK','de','Pakistan','seed'),
  ('country','BD','de','Bangladesch','seed'),
  ('country','ID','de','Indonesien','seed'),
  ('country','MY','de','Malaysia','seed'),
  ('country','SG','de','Singapur','seed'),
  ('country','TH','de','Thailand','seed'),
  ('country','VN','de','Vietnam','seed'),
  ('country','PH','de','Philippinen','seed'),
  ('country','AU','de','Australien','seed'),
  ('country','NZ','de','Neuseeland','seed'),
  ('country','CA','de','Kanada','seed'),
  ('country','MX','de','Mexiko','seed'),
  ('country','BR','de','Brasilien','seed'),
  ('country','AR','de','Argentinien','seed'),
  ('country','CL','de','Chile','seed'),
  ('country','CO','de','Kolumbien','seed'),
  ('country','ZA','de','Südafrika','seed'),
  ('country','NG','de','Nigeria','seed'),
  ('country','KE','de','Kenia','seed'),
  ('country','ET','de','Äthiopien','seed'),
  ('country','HK','de','Hongkong','seed'),
  ('country','TW','de','Taiwan','seed'),
  ('country','AF','de','Afghanistan','seed'),
  ('country','LK','de','Sri Lanka','seed'),
  ('country','NP','de','Nepal','seed'),
  ('country','MM','de','Myanmar','seed'),
  ('country','KH','de','Kambodscha','seed'),
  ('country','IE','de','Irland','seed'),
  ('country','LI','de','Liechtenstein','seed'),
  ('country','LU','de','Luxemburg','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Currencies — GCC + Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('currency','SAR','de','Saudi-Riyal','seed'),
  ('currency','AED','de','VAE-Dirham','seed'),
  ('currency','BHD','de','Bahrain-Dinar','seed'),
  ('currency','KWD','de','Kuwait-Dinar','seed'),
  ('currency','OMR','de','Omanischer Rial','seed'),
  ('currency','QAR','de','Katar-Riyal','seed'),
  ('currency','EGP','de','Ägyptisches Pfund','seed'),
  ('currency','JOD','de','Jordanischer Dinar','seed'),
  ('currency','IQD','de','Irakischer Dinar','seed'),
  ('currency','LBP','de','Libanesisches Pfund','seed'),
  ('currency','TRY','de','Türkische Lira','seed'),
  ('currency','MAD','de','Marokkanischer Dirham','seed'),
  ('currency','USD','de','US-Dollar','seed'),
  ('currency','EUR','de','Euro','seed'),
  ('currency','GBP','de','Pfund Sterling','seed'),
  ('currency','JPY','de','Japanischer Yen','seed'),
  ('currency','CNY','de','Renminbi Yuan','seed'),
  ('currency','CHF','de','Schweizer Franken','seed'),
  ('currency','CAD','de','Kanadischer Dollar','seed'),
  ('currency','AUD','de','Australischer Dollar','seed'),
  ('currency','INR','de','Indische Rupie','seed'),
  ('currency','PKR','de','Pakistanische Rupie','seed'),
  ('currency','BRL','de','Brasilianischer Real','seed'),
  ('currency','MXN','de','Mexikanischer Peso','seed'),
  ('currency','KRW','de','Südkoreanischer Won','seed'),
  ('currency','SGD','de','Singapur-Dollar','seed'),
  ('currency','HKD','de','Hongkong-Dollar','seed'),
  ('currency','MYR','de','Malaysischer Ringgit','seed'),
  ('currency','IDR','de','Indonesische Rupiah','seed'),
  ('currency','THB','de','Thailändischer Baht','seed'),
  ('currency','NZD','de','Neuseeland-Dollar','seed'),
  ('currency','ZAR','de','Südafrikanischer Rand','seed'),
  ('currency','RUB','de','Russischer Rubel','seed'),
  ('currency','SEK','de','Schwedische Krone','seed'),
  ('currency','NOK','de','Norwegische Krone','seed'),
  ('currency','DKK','de','Dänische Krone','seed'),
  ('currency','PLN','de','Polnischer Zloty','seed'),
  ('currency','CZK','de','Tschechische Krone','seed'),
  ('currency','HUF','de','Ungarischer Forint','seed'),
  ('currency','XAU','de','Gold (Feinunze)','seed'),
  ('currency','XAG','de','Silber (Feinunze)','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Languages — Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('language','de','de','Deutsch','seed'),
  ('language','en','de','Englisch','seed'),
  ('language','ar','de','Arabisch','seed'),
  ('language','fr','de','Französisch','seed'),
  ('language','es','de','Spanisch','seed'),
  ('language','pt','de','Portugiesisch','seed'),
  ('language','it','de','Italienisch','seed'),
  ('language','nl','de','Niederländisch','seed'),
  ('language','ru','de','Russisch','seed'),
  ('language','zh','de','Chinesisch','seed'),
  ('language','ja','de','Japanisch','seed'),
  ('language','ko','de','Koreanisch','seed'),
  ('language','hi','de','Hindi','seed'),
  ('language','bn','de','Bengalisch','seed'),
  ('language','ur','de','Urdu','seed'),
  ('language','fa','de','Persisch','seed'),
  ('language','tr','de','Türkisch','seed'),
  ('language','ta','de','Tamil','seed'),
  ('language','te','de','Telugu','seed'),
  ('language','ml','de','Malayalam','seed'),
  ('language','ms','de','Malaiisch','seed'),
  ('language','id','de','Indonesisch','seed'),
  ('language','th','de','Thailändisch','seed'),
  ('language','vi','de','Vietnamesisch','seed'),
  ('language','pl','de','Polnisch','seed'),
  ('language','uk','de','Ukrainisch','seed'),
  ('language','sv','de','Schwedisch','seed'),
  ('language','da','de','Dänisch','seed'),
  ('language','no','de','Norwegisch','seed'),
  ('language','fi','de','Finnisch','seed'),
  ('language','el','de','Griechisch','seed'),
  ('language','he','de','Hebräisch','seed'),
  ('language','sw','de','Suaheli','seed'),
  ('language','cs','de','Tschechisch','seed'),
  ('language','hu','de','Ungarisch','seed'),
  ('language','ro','de','Rumänisch','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- UOM — Core units
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('uom','EA','de','Stück','seed'),
  ('uom','C62','de','Eins','seed'),
  ('uom','PR','de','Paar','seed'),
  ('uom','DZN','de','Dutzend','seed'),
  ('uom','SET','de','Satz','seed'),
  ('uom','PK','de','Packung','seed'),
  ('uom','BX','de','Karton','seed'),
  ('uom','CT','de','Kartonage','seed'),
  ('uom','PL','de','Palette','seed'),
  ('uom','MGM','de','Milligramm','seed'),
  ('uom','GRM','de','Gramm','seed'),
  ('uom','KGM','de','Kilogramm','seed'),
  ('uom','TNE','de','Metrische Tonne','seed'),
  ('uom','LBR','de','Pfund','seed'),
  ('uom','ONZ','de','Unze','seed'),
  ('uom','MMT','de','Millimeter','seed'),
  ('uom','CMT','de','Zentimeter','seed'),
  ('uom','MTR','de','Meter','seed'),
  ('uom','KMT','de','Kilometer','seed'),
  ('uom','INH','de','Zoll','seed'),
  ('uom','FOT','de','Fuß','seed'),
  ('uom','YRD','de','Yard','seed'),
  ('uom','SMI','de','Meile','seed'),
  ('uom','MTK','de','Quadratmeter','seed'),
  ('uom','KMK','de','Quadratkilometer','seed'),
  ('uom','HAR','de','Hektar','seed'),
  ('uom','ACR','de','Morgen','seed'),
  ('uom','MLT','de','Milliliter','seed'),
  ('uom','LTR','de','Liter','seed'),
  ('uom','MTQ','de','Kubikmeter','seed'),
  ('uom','GLL','de','Gallone','seed'),
  ('uom','BLL','de','Barrel','seed'),
  ('uom','SEC','de','Sekunde','seed'),
  ('uom','MIN','de','Minute','seed'),
  ('uom','HUR','de','Stunde','seed'),
  ('uom','DAY','de','Tag','seed'),
  ('uom','WEE','de','Woche','seed'),
  ('uom','MON','de','Monat','seed'),
  ('uom','ANN','de','Jahr','seed'),
  ('uom','CEL','de','Grad Celsius','seed'),
  ('uom','FAH','de','Grad Fahrenheit','seed'),
  ('uom','KWH','de','Kilowattstunde','seed'),
  ('uom','WTT','de','Watt','seed'),
  ('uom','KWT','de','Kilowatt','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Saudi & UAE Regions
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('state_region','SA-01','de','Region Riad','seed'),
  ('state_region','SA-02','de','Region Mekka','seed'),
  ('state_region','SA-03','de','Region Medina','seed'),
  ('state_region','SA-04','de','Östliche Region','seed'),
  ('state_region','SA-05','de','Region al-Qasim','seed'),
  ('state_region','SA-06','de','Region Ha''il','seed'),
  ('state_region','SA-07','de','Region Tabuk','seed'),
  ('state_region','SA-08','de','Region Nordgrenze','seed'),
  ('state_region','SA-09','de','Region Dschasan','seed'),
  ('state_region','SA-10','de','Region Nadschran','seed'),
  ('state_region','SA-11','de','Region al-Baha','seed'),
  ('state_region','SA-12','de','Region al-Dschauf','seed'),
  ('state_region','SA-14','de','Region Asir','seed'),
  ('state_region','AE-AZ','de','Abu Dhabi','seed'),
  ('state_region','AE-DU','de','Dubai','seed'),
  ('state_region','AE-SH','de','Schardscha','seed'),
  ('state_region','AE-AJ','de','Adschman','seed'),
  ('state_region','AE-UQ','de','Umm al-Qaiwain','seed'),
  ('state_region','AE-RK','de','Ra''s al-Chaima','seed'),
  ('state_region','AE-FU','de','Fudschaira','seed')
on conflict (entity, code, locale_code) do nothing;
