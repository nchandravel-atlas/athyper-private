/* ============================================================================
   Athyper — REF Seed: French (Français) Labels (i18n)
   PostgreSQL 16+

   French translations for key reference data entities.
   Depends on: 010_ref_master_tables.sql, 050_ref_seed_locales.sql
   ============================================================================ */

-- ============================================================================
-- Countries — GCC + MENA + Major World
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  -- GCC
  ('country','SA','fr','Arabie saoudite','seed'),
  ('country','AE','fr','Émirats arabes unis','seed'),
  ('country','BH','fr','Bahreïn','seed'),
  ('country','KW','fr','Koweït','seed'),
  ('country','OM','fr','Oman','seed'),
  ('country','QA','fr','Qatar','seed'),

  -- MENA
  ('country','EG','fr','Égypte','seed'),
  ('country','JO','fr','Jordanie','seed'),
  ('country','LB','fr','Liban','seed'),
  ('country','IQ','fr','Irak','seed'),
  ('country','SY','fr','Syrie','seed'),
  ('country','YE','fr','Yémen','seed'),
  ('country','PS','fr','Palestine','seed'),
  ('country','SD','fr','Soudan','seed'),
  ('country','LY','fr','Libye','seed'),
  ('country','TN','fr','Tunisie','seed'),
  ('country','DZ','fr','Algérie','seed'),
  ('country','MA','fr','Maroc','seed'),
  ('country','IR','fr','Iran','seed'),
  ('country','TR','fr','Turquie','seed'),
  ('country','IL','fr','Israël','seed'),

  -- Major World
  ('country','US','fr','États-Unis','seed'),
  ('country','GB','fr','Royaume-Uni','seed'),
  ('country','FR','fr','France','seed'),
  ('country','DE','fr','Allemagne','seed'),
  ('country','IT','fr','Italie','seed'),
  ('country','ES','fr','Espagne','seed'),
  ('country','PT','fr','Portugal','seed'),
  ('country','NL','fr','Pays-Bas','seed'),
  ('country','BE','fr','Belgique','seed'),
  ('country','CH','fr','Suisse','seed'),
  ('country','AT','fr','Autriche','seed'),
  ('country','SE','fr','Suède','seed'),
  ('country','NO','fr','Norvège','seed'),
  ('country','DK','fr','Danemark','seed'),
  ('country','FI','fr','Finlande','seed'),
  ('country','PL','fr','Pologne','seed'),
  ('country','GR','fr','Grèce','seed'),
  ('country','RU','fr','Russie','seed'),
  ('country','UA','fr','Ukraine','seed'),
  ('country','CN','fr','Chine','seed'),
  ('country','JP','fr','Japon','seed'),
  ('country','KR','fr','Corée du Sud','seed'),
  ('country','IN','fr','Inde','seed'),
  ('country','PK','fr','Pakistan','seed'),
  ('country','BD','fr','Bangladesh','seed'),
  ('country','ID','fr','Indonésie','seed'),
  ('country','MY','fr','Malaisie','seed'),
  ('country','SG','fr','Singapour','seed'),
  ('country','TH','fr','Thaïlande','seed'),
  ('country','VN','fr','Viêt Nam','seed'),
  ('country','PH','fr','Philippines','seed'),
  ('country','AU','fr','Australie','seed'),
  ('country','NZ','fr','Nouvelle-Zélande','seed'),
  ('country','CA','fr','Canada','seed'),
  ('country','MX','fr','Mexique','seed'),
  ('country','BR','fr','Brésil','seed'),
  ('country','AR','fr','Argentine','seed'),
  ('country','CL','fr','Chili','seed'),
  ('country','CO','fr','Colombie','seed'),
  ('country','ZA','fr','Afrique du Sud','seed'),
  ('country','NG','fr','Nigéria','seed'),
  ('country','KE','fr','Kenya','seed'),
  ('country','ET','fr','Éthiopie','seed'),
  ('country','GH','fr','Ghana','seed'),
  ('country','TZ','fr','Tanzanie','seed'),
  ('country','SN','fr','Sénégal','seed'),
  ('country','CI','fr','Côte d''Ivoire','seed'),
  ('country','CM','fr','Cameroun','seed'),
  ('country','HK','fr','Hong Kong','seed'),
  ('country','TW','fr','Taïwan','seed'),
  ('country','AF','fr','Afghanistan','seed'),
  ('country','LK','fr','Sri Lanka','seed'),
  ('country','NP','fr','Népal','seed'),
  ('country','MM','fr','Myanmar','seed'),
  ('country','KH','fr','Cambodge','seed'),
  ('country','IE','fr','Irlande','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Currencies — GCC + Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('currency','SAR','fr','Riyal saoudien','seed'),
  ('currency','AED','fr','Dirham des Émirats','seed'),
  ('currency','BHD','fr','Dinar bahreïni','seed'),
  ('currency','KWD','fr','Dinar koweïtien','seed'),
  ('currency','OMR','fr','Riyal omanais','seed'),
  ('currency','QAR','fr','Riyal qatari','seed'),
  ('currency','EGP','fr','Livre égyptienne','seed'),
  ('currency','JOD','fr','Dinar jordanien','seed'),
  ('currency','IQD','fr','Dinar irakien','seed'),
  ('currency','LBP','fr','Livre libanaise','seed'),
  ('currency','TRY','fr','Livre turque','seed'),
  ('currency','MAD','fr','Dirham marocain','seed'),
  ('currency','TND','fr','Dinar tunisien','seed'),
  ('currency','DZD','fr','Dinar algérien','seed'),
  ('currency','USD','fr','Dollar américain','seed'),
  ('currency','EUR','fr','Euro','seed'),
  ('currency','GBP','fr','Livre sterling','seed'),
  ('currency','JPY','fr','Yen japonais','seed'),
  ('currency','CNY','fr','Yuan renminbi','seed'),
  ('currency','CHF','fr','Franc suisse','seed'),
  ('currency','CAD','fr','Dollar canadien','seed'),
  ('currency','AUD','fr','Dollar australien','seed'),
  ('currency','INR','fr','Roupie indienne','seed'),
  ('currency','PKR','fr','Roupie pakistanaise','seed'),
  ('currency','BRL','fr','Réal brésilien','seed'),
  ('currency','MXN','fr','Peso mexicain','seed'),
  ('currency','KRW','fr','Won sud-coréen','seed'),
  ('currency','SGD','fr','Dollar de Singapour','seed'),
  ('currency','HKD','fr','Dollar de Hong Kong','seed'),
  ('currency','MYR','fr','Ringgit malaisien','seed'),
  ('currency','IDR','fr','Roupie indonésienne','seed'),
  ('currency','THB','fr','Baht thaïlandais','seed'),
  ('currency','NZD','fr','Dollar néo-zélandais','seed'),
  ('currency','ZAR','fr','Rand sud-africain','seed'),
  ('currency','RUB','fr','Rouble russe','seed'),
  ('currency','XOF','fr','Franc CFA (BCEAO)','seed'),
  ('currency','XAF','fr','Franc CFA (BEAC)','seed'),
  ('currency','XAU','fr','Or (once troy)','seed'),
  ('currency','XAG','fr','Argent (once troy)','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Languages — Major
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('language','fr','fr','Français','seed'),
  ('language','en','fr','Anglais','seed'),
  ('language','ar','fr','Arabe','seed'),
  ('language','de','fr','Allemand','seed'),
  ('language','es','fr','Espagnol','seed'),
  ('language','pt','fr','Portugais','seed'),
  ('language','it','fr','Italien','seed'),
  ('language','nl','fr','Néerlandais','seed'),
  ('language','ru','fr','Russe','seed'),
  ('language','zh','fr','Chinois','seed'),
  ('language','ja','fr','Japonais','seed'),
  ('language','ko','fr','Coréen','seed'),
  ('language','hi','fr','Hindi','seed'),
  ('language','bn','fr','Bengali','seed'),
  ('language','ur','fr','Ourdou','seed'),
  ('language','fa','fr','Persan','seed'),
  ('language','tr','fr','Turc','seed'),
  ('language','ta','fr','Tamoul','seed'),
  ('language','te','fr','Télougou','seed'),
  ('language','ml','fr','Malayalam','seed'),
  ('language','ms','fr','Malais','seed'),
  ('language','id','fr','Indonésien','seed'),
  ('language','th','fr','Thaï','seed'),
  ('language','vi','fr','Vietnamien','seed'),
  ('language','pl','fr','Polonais','seed'),
  ('language','uk','fr','Ukrainien','seed'),
  ('language','sv','fr','Suédois','seed'),
  ('language','da','fr','Danois','seed'),
  ('language','no','fr','Norvégien','seed'),
  ('language','fi','fr','Finnois','seed'),
  ('language','el','fr','Grec','seed'),
  ('language','he','fr','Hébreu','seed'),
  ('language','sw','fr','Swahili','seed'),
  ('language','so','fr','Somali','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- UOM — Core units
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('uom','EA','fr','Unité','seed'),
  ('uom','C62','fr','Un','seed'),
  ('uom','PR','fr','Paire','seed'),
  ('uom','DZN','fr','Douzaine','seed'),
  ('uom','SET','fr','Ensemble','seed'),
  ('uom','PK','fr','Paquet','seed'),
  ('uom','BX','fr','Boîte','seed'),
  ('uom','CT','fr','Carton','seed'),
  ('uom','PL','fr','Palette','seed'),
  ('uom','MGM','fr','Milligramme','seed'),
  ('uom','GRM','fr','Gramme','seed'),
  ('uom','KGM','fr','Kilogramme','seed'),
  ('uom','TNE','fr','Tonne métrique','seed'),
  ('uom','LBR','fr','Livre','seed'),
  ('uom','ONZ','fr','Once','seed'),
  ('uom','MMT','fr','Millimètre','seed'),
  ('uom','CMT','fr','Centimètre','seed'),
  ('uom','MTR','fr','Mètre','seed'),
  ('uom','KMT','fr','Kilomètre','seed'),
  ('uom','INH','fr','Pouce','seed'),
  ('uom','FOT','fr','Pied','seed'),
  ('uom','YRD','fr','Yard','seed'),
  ('uom','SMI','fr','Mile','seed'),
  ('uom','MTK','fr','Mètre carré','seed'),
  ('uom','KMK','fr','Kilomètre carré','seed'),
  ('uom','HAR','fr','Hectare','seed'),
  ('uom','ACR','fr','Acre','seed'),
  ('uom','MLT','fr','Millilitre','seed'),
  ('uom','LTR','fr','Litre','seed'),
  ('uom','MTQ','fr','Mètre cube','seed'),
  ('uom','GLL','fr','Gallon','seed'),
  ('uom','BLL','fr','Baril','seed'),
  ('uom','SEC','fr','Seconde','seed'),
  ('uom','MIN','fr','Minute','seed'),
  ('uom','HUR','fr','Heure','seed'),
  ('uom','DAY','fr','Jour','seed'),
  ('uom','WEE','fr','Semaine','seed'),
  ('uom','MON','fr','Mois','seed'),
  ('uom','ANN','fr','Année','seed'),
  ('uom','CEL','fr','Degré Celsius','seed'),
  ('uom','FAH','fr','Degré Fahrenheit','seed'),
  ('uom','KWH','fr','Kilowatt-heure','seed'),
  ('uom','WTT','fr','Watt','seed'),
  ('uom','KWT','fr','Kilowatt','seed')
on conflict (entity, code, locale_code) do nothing;

-- ============================================================================
-- Saudi & UAE Regions
-- ============================================================================
insert into ref.label (entity, code, locale_code, name, created_by)
values
  ('state_region','SA-01','fr','Région de Riyad','seed'),
  ('state_region','SA-02','fr','Région de La Mecque','seed'),
  ('state_region','SA-03','fr','Région de Médine','seed'),
  ('state_region','SA-04','fr','Région orientale','seed'),
  ('state_region','SA-05','fr','Région d''Al-Qassim','seed'),
  ('state_region','SA-06','fr','Région de Ha''il','seed'),
  ('state_region','SA-07','fr','Région de Tabuk','seed'),
  ('state_region','SA-08','fr','Région des frontières du Nord','seed'),
  ('state_region','SA-09','fr','Région de Jizan','seed'),
  ('state_region','SA-10','fr','Région de Najran','seed'),
  ('state_region','SA-11','fr','Région d''Al Bahah','seed'),
  ('state_region','SA-12','fr','Région d''Al Jawf','seed'),
  ('state_region','SA-14','fr','Région d''Asir','seed'),
  ('state_region','AE-AZ','fr','Abou Dabi','seed'),
  ('state_region','AE-DU','fr','Dubaï','seed'),
  ('state_region','AE-SH','fr','Charjah','seed'),
  ('state_region','AE-AJ','fr','Ajman','seed'),
  ('state_region','AE-UQ','fr','Oumm al Qaïwaïn','seed'),
  ('state_region','AE-RK','fr','Ras el Khaïmah','seed'),
  ('state_region','AE-FU','fr','Fujaïrah','seed')
on conflict (entity, code, locale_code) do nothing;
