/* ============================================================================
   Athyper — REF Seed: Subdivisions (ISO 3166-2)
   PostgreSQL 16+

   Key countries: SA, AE, US, GB, IN, DE, FR, EG, JP, CA, AU, CN, BR
   Depends on: 020_ref_seed_countries.sql
   ============================================================================ */

-- ============================================================================
-- Saudi Arabia (SA) — 13 regions
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('SA-01','SA','Riyadh','region','seed'),
  ('SA-02','SA','Makkah','region','seed'),
  ('SA-03','SA','Al Madinah','region','seed'),
  ('SA-04','SA','Eastern','region','seed'),
  ('SA-05','SA','Al-Qassim','region','seed'),
  ('SA-06','SA','Ha''il','region','seed'),
  ('SA-07','SA','Tabuk','region','seed'),
  ('SA-08','SA','Northern Borders','region','seed'),
  ('SA-09','SA','Jazan','region','seed'),
  ('SA-10','SA','Najran','region','seed'),
  ('SA-11','SA','Al Bahah','region','seed'),
  ('SA-12','SA','Al Jawf','region','seed'),
  ('SA-14','SA','Asir','region','seed')
on conflict (code) do nothing;

-- ============================================================================
-- United Arab Emirates (AE) — 7 emirates
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('AE-AZ','AE','Abu Dhabi','emirate','seed'),
  ('AE-DU','AE','Dubai','emirate','seed'),
  ('AE-SH','AE','Sharjah','emirate','seed'),
  ('AE-AJ','AE','Ajman','emirate','seed'),
  ('AE-UQ','AE','Umm al-Quwain','emirate','seed'),
  ('AE-RK','AE','Ras al-Khaimah','emirate','seed'),
  ('AE-FU','AE','Fujairah','emirate','seed')
on conflict (code) do nothing;

-- ============================================================================
-- United States (US) — 50 states + DC
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('US-AL','US','Alabama','state','seed'),
  ('US-AK','US','Alaska','state','seed'),
  ('US-AZ','US','Arizona','state','seed'),
  ('US-AR','US','Arkansas','state','seed'),
  ('US-CA','US','California','state','seed'),
  ('US-CO','US','Colorado','state','seed'),
  ('US-CT','US','Connecticut','state','seed'),
  ('US-DE','US','Delaware','state','seed'),
  ('US-FL','US','Florida','state','seed'),
  ('US-GA','US','Georgia','state','seed'),
  ('US-HI','US','Hawaii','state','seed'),
  ('US-ID','US','Idaho','state','seed'),
  ('US-IL','US','Illinois','state','seed'),
  ('US-IN','US','Indiana','state','seed'),
  ('US-IA','US','Iowa','state','seed'),
  ('US-KS','US','Kansas','state','seed'),
  ('US-KY','US','Kentucky','state','seed'),
  ('US-LA','US','Louisiana','state','seed'),
  ('US-ME','US','Maine','state','seed'),
  ('US-MD','US','Maryland','state','seed'),
  ('US-MA','US','Massachusetts','state','seed'),
  ('US-MI','US','Michigan','state','seed'),
  ('US-MN','US','Minnesota','state','seed'),
  ('US-MS','US','Mississippi','state','seed'),
  ('US-MO','US','Missouri','state','seed'),
  ('US-MT','US','Montana','state','seed'),
  ('US-NE','US','Nebraska','state','seed'),
  ('US-NV','US','Nevada','state','seed'),
  ('US-NH','US','New Hampshire','state','seed'),
  ('US-NJ','US','New Jersey','state','seed'),
  ('US-NM','US','New Mexico','state','seed'),
  ('US-NY','US','New York','state','seed'),
  ('US-NC','US','North Carolina','state','seed'),
  ('US-ND','US','North Dakota','state','seed'),
  ('US-OH','US','Ohio','state','seed'),
  ('US-OK','US','Oklahoma','state','seed'),
  ('US-OR','US','Oregon','state','seed'),
  ('US-PA','US','Pennsylvania','state','seed'),
  ('US-RI','US','Rhode Island','state','seed'),
  ('US-SC','US','South Carolina','state','seed'),
  ('US-SD','US','South Dakota','state','seed'),
  ('US-TN','US','Tennessee','state','seed'),
  ('US-TX','US','Texas','state','seed'),
  ('US-UT','US','Utah','state','seed'),
  ('US-VT','US','Vermont','state','seed'),
  ('US-VA','US','Virginia','state','seed'),
  ('US-WA','US','Washington','state','seed'),
  ('US-WV','US','West Virginia','state','seed'),
  ('US-WI','US','Wisconsin','state','seed'),
  ('US-WY','US','Wyoming','state','seed'),
  ('US-DC','US','District of Columbia','district','seed')
on conflict (code) do nothing;

-- ============================================================================
-- United Kingdom (GB) — 4 countries
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('GB-ENG','GB','England','country','seed'),
  ('GB-SCT','GB','Scotland','country','seed'),
  ('GB-WLS','GB','Wales','country','seed'),
  ('GB-NIR','GB','Northern Ireland','country','seed')
on conflict (code) do nothing;

-- ============================================================================
-- India (IN) — 28 states + 8 union territories
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('IN-AP','IN','Andhra Pradesh','state','seed'),
  ('IN-AR','IN','Arunachal Pradesh','state','seed'),
  ('IN-AS','IN','Assam','state','seed'),
  ('IN-BR','IN','Bihar','state','seed'),
  ('IN-CT','IN','Chhattisgarh','state','seed'),
  ('IN-GA','IN','Goa','state','seed'),
  ('IN-GJ','IN','Gujarat','state','seed'),
  ('IN-HR','IN','Haryana','state','seed'),
  ('IN-HP','IN','Himachal Pradesh','state','seed'),
  ('IN-JH','IN','Jharkhand','state','seed'),
  ('IN-KA','IN','Karnataka','state','seed'),
  ('IN-KL','IN','Kerala','state','seed'),
  ('IN-MP','IN','Madhya Pradesh','state','seed'),
  ('IN-MH','IN','Maharashtra','state','seed'),
  ('IN-MN','IN','Manipur','state','seed'),
  ('IN-ML','IN','Meghalaya','state','seed'),
  ('IN-MZ','IN','Mizoram','state','seed'),
  ('IN-NL','IN','Nagaland','state','seed'),
  ('IN-OR','IN','Odisha','state','seed'),
  ('IN-PB','IN','Punjab','state','seed'),
  ('IN-RJ','IN','Rajasthan','state','seed'),
  ('IN-SK','IN','Sikkim','state','seed'),
  ('IN-TN','IN','Tamil Nadu','state','seed'),
  ('IN-TG','IN','Telangana','state','seed'),
  ('IN-TR','IN','Tripura','state','seed'),
  ('IN-UP','IN','Uttar Pradesh','state','seed'),
  ('IN-UT','IN','Uttarakhand','state','seed'),
  ('IN-WB','IN','West Bengal','state','seed'),
  -- Union Territories
  ('IN-AN','IN','Andaman and Nicobar Islands','union territory','seed'),
  ('IN-CH','IN','Chandigarh','union territory','seed'),
  ('IN-DH','IN','Dadra and Nagar Haveli and Daman and Diu','union territory','seed'),
  ('IN-DL','IN','Delhi','union territory','seed'),
  ('IN-JK','IN','Jammu and Kashmir','union territory','seed'),
  ('IN-LA','IN','Ladakh','union territory','seed'),
  ('IN-LD','IN','Lakshadweep','union territory','seed'),
  ('IN-PY','IN','Puducherry','union territory','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Germany (DE) — 16 states
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('DE-BW','DE','Baden-Württemberg','state','seed'),
  ('DE-BY','DE','Bavaria','state','seed'),
  ('DE-BE','DE','Berlin','state','seed'),
  ('DE-BB','DE','Brandenburg','state','seed'),
  ('DE-HB','DE','Bremen','state','seed'),
  ('DE-HH','DE','Hamburg','state','seed'),
  ('DE-HE','DE','Hesse','state','seed'),
  ('DE-MV','DE','Mecklenburg-Vorpommern','state','seed'),
  ('DE-NI','DE','Lower Saxony','state','seed'),
  ('DE-NW','DE','North Rhine-Westphalia','state','seed'),
  ('DE-RP','DE','Rhineland-Palatinate','state','seed'),
  ('DE-SL','DE','Saarland','state','seed'),
  ('DE-SN','DE','Saxony','state','seed'),
  ('DE-ST','DE','Saxony-Anhalt','state','seed'),
  ('DE-SH','DE','Schleswig-Holstein','state','seed'),
  ('DE-TH','DE','Thuringia','state','seed')
on conflict (code) do nothing;

-- ============================================================================
-- France (FR) — 13 metropolitan + 5 overseas regions
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('FR-ARA','FR','Auvergne-Rhône-Alpes','region','seed'),
  ('FR-BFC','FR','Bourgogne-Franche-Comté','region','seed'),
  ('FR-BRE','FR','Bretagne','region','seed'),
  ('FR-CVL','FR','Centre-Val de Loire','region','seed'),
  ('FR-COR','FR','Corse','region','seed'),
  ('FR-GES','FR','Grand Est','region','seed'),
  ('FR-HDF','FR','Hauts-de-France','region','seed'),
  ('FR-IDF','FR','Île-de-France','region','seed'),
  ('FR-NOR','FR','Normandie','region','seed'),
  ('FR-NAQ','FR','Nouvelle-Aquitaine','region','seed'),
  ('FR-OCC','FR','Occitanie','region','seed'),
  ('FR-PDL','FR','Pays de la Loire','region','seed'),
  ('FR-PAC','FR','Provence-Alpes-Côte d''Azur','region','seed'),
  ('FR-GUA','FR','Guadeloupe','region','seed'),
  ('FR-GUF','FR','Guyane','region','seed'),
  ('FR-MTQ','FR','Martinique','region','seed'),
  ('FR-LRE','FR','La Réunion','region','seed'),
  ('FR-MAY','FR','Mayotte','region','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Egypt (EG) — 27 governorates
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('EG-ALX','EG','Alexandria','governorate','seed'),
  ('EG-ASN','EG','Aswan','governorate','seed'),
  ('EG-AST','EG','Asyut','governorate','seed'),
  ('EG-BH','EG','Beheira','governorate','seed'),
  ('EG-BNS','EG','Beni Suef','governorate','seed'),
  ('EG-C','EG','Cairo','governorate','seed'),
  ('EG-DK','EG','Dakahlia','governorate','seed'),
  ('EG-DT','EG','Damietta','governorate','seed'),
  ('EG-FYM','EG','Faiyum','governorate','seed'),
  ('EG-GH','EG','Gharbia','governorate','seed'),
  ('EG-GZ','EG','Giza','governorate','seed'),
  ('EG-IS','EG','Ismailia','governorate','seed'),
  ('EG-KFS','EG','Kafr el-Sheikh','governorate','seed'),
  ('EG-LX','EG','Luxor','governorate','seed'),
  ('EG-MN','EG','Minya','governorate','seed'),
  ('EG-MNF','EG','Monufia','governorate','seed'),
  ('EG-MT','EG','Matrouh','governorate','seed'),
  ('EG-PTS','EG','Port Said','governorate','seed'),
  ('EG-KB','EG','Qalyubia','governorate','seed'),
  ('EG-KN','EG','Qena','governorate','seed'),
  ('EG-WAD','EG','New Valley','governorate','seed'),
  ('EG-SIN','EG','North Sinai','governorate','seed'),
  ('EG-SHR','EG','Red Sea','governorate','seed'),
  ('EG-SHG','EG','Sohag','governorate','seed'),
  ('EG-JS','EG','South Sinai','governorate','seed'),
  ('EG-SUZ','EG','Suez','governorate','seed'),
  ('EG-HU','EG','Helwan','governorate','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Japan (JP) — 47 prefectures
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('JP-01','JP','Hokkaido','prefecture','seed'),
  ('JP-02','JP','Aomori','prefecture','seed'),
  ('JP-03','JP','Iwate','prefecture','seed'),
  ('JP-04','JP','Miyagi','prefecture','seed'),
  ('JP-05','JP','Akita','prefecture','seed'),
  ('JP-06','JP','Yamagata','prefecture','seed'),
  ('JP-07','JP','Fukushima','prefecture','seed'),
  ('JP-08','JP','Ibaraki','prefecture','seed'),
  ('JP-09','JP','Tochigi','prefecture','seed'),
  ('JP-10','JP','Gunma','prefecture','seed'),
  ('JP-11','JP','Saitama','prefecture','seed'),
  ('JP-12','JP','Chiba','prefecture','seed'),
  ('JP-13','JP','Tokyo','prefecture','seed'),
  ('JP-14','JP','Kanagawa','prefecture','seed'),
  ('JP-15','JP','Niigata','prefecture','seed'),
  ('JP-16','JP','Toyama','prefecture','seed'),
  ('JP-17','JP','Ishikawa','prefecture','seed'),
  ('JP-18','JP','Fukui','prefecture','seed'),
  ('JP-19','JP','Yamanashi','prefecture','seed'),
  ('JP-20','JP','Nagano','prefecture','seed'),
  ('JP-21','JP','Gifu','prefecture','seed'),
  ('JP-22','JP','Shizuoka','prefecture','seed'),
  ('JP-23','JP','Aichi','prefecture','seed'),
  ('JP-24','JP','Mie','prefecture','seed'),
  ('JP-25','JP','Shiga','prefecture','seed'),
  ('JP-26','JP','Kyoto','prefecture','seed'),
  ('JP-27','JP','Osaka','prefecture','seed'),
  ('JP-28','JP','Hyogo','prefecture','seed'),
  ('JP-29','JP','Nara','prefecture','seed'),
  ('JP-30','JP','Wakayama','prefecture','seed'),
  ('JP-31','JP','Tottori','prefecture','seed'),
  ('JP-32','JP','Shimane','prefecture','seed'),
  ('JP-33','JP','Okayama','prefecture','seed'),
  ('JP-34','JP','Hiroshima','prefecture','seed'),
  ('JP-35','JP','Yamaguchi','prefecture','seed'),
  ('JP-36','JP','Tokushima','prefecture','seed'),
  ('JP-37','JP','Kagawa','prefecture','seed'),
  ('JP-38','JP','Ehime','prefecture','seed'),
  ('JP-39','JP','Kochi','prefecture','seed'),
  ('JP-40','JP','Fukuoka','prefecture','seed'),
  ('JP-41','JP','Saga','prefecture','seed'),
  ('JP-42','JP','Nagasaki','prefecture','seed'),
  ('JP-43','JP','Kumamoto','prefecture','seed'),
  ('JP-44','JP','Oita','prefecture','seed'),
  ('JP-45','JP','Miyazaki','prefecture','seed'),
  ('JP-46','JP','Kagoshima','prefecture','seed'),
  ('JP-47','JP','Okinawa','prefecture','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Canada (CA) — 10 provinces + 3 territories
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('CA-AB','CA','Alberta','province','seed'),
  ('CA-BC','CA','British Columbia','province','seed'),
  ('CA-MB','CA','Manitoba','province','seed'),
  ('CA-NB','CA','New Brunswick','province','seed'),
  ('CA-NL','CA','Newfoundland and Labrador','province','seed'),
  ('CA-NS','CA','Nova Scotia','province','seed'),
  ('CA-ON','CA','Ontario','province','seed'),
  ('CA-PE','CA','Prince Edward Island','province','seed'),
  ('CA-QC','CA','Quebec','province','seed'),
  ('CA-SK','CA','Saskatchewan','province','seed'),
  ('CA-NT','CA','Northwest Territories','territory','seed'),
  ('CA-NU','CA','Nunavut','territory','seed'),
  ('CA-YT','CA','Yukon','territory','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Australia (AU) — 6 states + 2 territories
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('AU-NSW','AU','New South Wales','state','seed'),
  ('AU-QLD','AU','Queensland','state','seed'),
  ('AU-SA','AU','South Australia','state','seed'),
  ('AU-TAS','AU','Tasmania','state','seed'),
  ('AU-VIC','AU','Victoria','state','seed'),
  ('AU-WA','AU','Western Australia','state','seed'),
  ('AU-ACT','AU','Australian Capital Territory','territory','seed'),
  ('AU-NT','AU','Northern Territory','territory','seed')
on conflict (code) do nothing;

-- ============================================================================
-- China (CN) — 23 provinces + 4 municipalities + 5 autonomous regions + 2 SARs
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  -- Provinces
  ('CN-AH','CN','Anhui','province','seed'),
  ('CN-FJ','CN','Fujian','province','seed'),
  ('CN-GD','CN','Guangdong','province','seed'),
  ('CN-GS','CN','Gansu','province','seed'),
  ('CN-GZ','CN','Guizhou','province','seed'),
  ('CN-HA','CN','Henan','province','seed'),
  ('CN-HB','CN','Hubei','province','seed'),
  ('CN-HE','CN','Hebei','province','seed'),
  ('CN-HI','CN','Hainan','province','seed'),
  ('CN-HL','CN','Heilongjiang','province','seed'),
  ('CN-HN','CN','Hunan','province','seed'),
  ('CN-JL','CN','Jilin','province','seed'),
  ('CN-JS','CN','Jiangsu','province','seed'),
  ('CN-JX','CN','Jiangxi','province','seed'),
  ('CN-LN','CN','Liaoning','province','seed'),
  ('CN-QH','CN','Qinghai','province','seed'),
  ('CN-SC','CN','Sichuan','province','seed'),
  ('CN-SD','CN','Shandong','province','seed'),
  ('CN-SN','CN','Shaanxi','province','seed'),
  ('CN-SX','CN','Shanxi','province','seed'),
  ('CN-TW','CN','Taiwan','province','seed'),
  ('CN-YN','CN','Yunnan','province','seed'),
  ('CN-ZJ','CN','Zhejiang','province','seed'),
  -- Municipalities
  ('CN-BJ','CN','Beijing','municipality','seed'),
  ('CN-CQ','CN','Chongqing','municipality','seed'),
  ('CN-SH','CN','Shanghai','municipality','seed'),
  ('CN-TJ','CN','Tianjin','municipality','seed'),
  -- Autonomous regions
  ('CN-GX','CN','Guangxi','autonomous region','seed'),
  ('CN-NM','CN','Inner Mongolia','autonomous region','seed'),
  ('CN-NX','CN','Ningxia','autonomous region','seed'),
  ('CN-XJ','CN','Xinjiang','autonomous region','seed'),
  ('CN-XZ','CN','Tibet','autonomous region','seed'),
  -- SARs
  ('CN-HK','CN','Hong Kong','special administrative region','seed'),
  ('CN-MO','CN','Macao','special administrative region','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Brazil (BR) — 26 states + 1 federal district
-- ============================================================================
insert into ref.state_region (code, country_code2, name, category, created_by)
values
  ('BR-AC','BR','Acre','state','seed'),
  ('BR-AL','BR','Alagoas','state','seed'),
  ('BR-AM','BR','Amazonas','state','seed'),
  ('BR-AP','BR','Amapá','state','seed'),
  ('BR-BA','BR','Bahia','state','seed'),
  ('BR-CE','BR','Ceará','state','seed'),
  ('BR-DF','BR','Distrito Federal','federal district','seed'),
  ('BR-ES','BR','Espírito Santo','state','seed'),
  ('BR-GO','BR','Goiás','state','seed'),
  ('BR-MA','BR','Maranhão','state','seed'),
  ('BR-MG','BR','Minas Gerais','state','seed'),
  ('BR-MS','BR','Mato Grosso do Sul','state','seed'),
  ('BR-MT','BR','Mato Grosso','state','seed'),
  ('BR-PA','BR','Pará','state','seed'),
  ('BR-PB','BR','Paraíba','state','seed'),
  ('BR-PE','BR','Pernambuco','state','seed'),
  ('BR-PI','BR','Piauí','state','seed'),
  ('BR-PR','BR','Paraná','state','seed'),
  ('BR-RJ','BR','Rio de Janeiro','state','seed'),
  ('BR-RN','BR','Rio Grande do Norte','state','seed'),
  ('BR-RO','BR','Rondônia','state','seed'),
  ('BR-RR','BR','Roraima','state','seed'),
  ('BR-RS','BR','Rio Grande do Sul','state','seed'),
  ('BR-SC','BR','Santa Catarina','state','seed'),
  ('BR-SE','BR','Sergipe','state','seed'),
  ('BR-SP','BR','São Paulo','state','seed'),
  ('BR-TO','BR','Tocantins','state','seed')
on conflict (code) do nothing;
