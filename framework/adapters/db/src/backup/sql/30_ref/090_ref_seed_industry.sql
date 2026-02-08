/* ============================================================================
   Athyper — REF Seed: Industry Classifications
   PostgreSQL 16+

   Domains: ISIC Rev.4 (sections + divisions) + NAICS 2022 (sectors)
   Depends on: 010_ref_master_tables.sql
   ============================================================================ */

-- ============================================================================
-- Domains
-- ============================================================================
insert into ref.industry_domain (code, name, standard, version, created_by)
values
  ('isic',  'International Standard Industrial Classification', 'ISIC', 'Rev.4', 'seed'),
  ('naics', 'North American Industry Classification System',    'NAICS', '2022',  'seed')
on conflict (code) do nothing;

-- ============================================================================
-- ISIC Rev.4 — Sections (Level 1)
-- ============================================================================
insert into ref.industry_code (domain_code, code, name, description, level_no, created_by)
values
  ('isic','A','Agriculture, Forestry and Fishing','Crop and animal production, hunting, forestry, and fishing',1,'seed'),
  ('isic','B','Mining and Quarrying','Mining of coal, crude petroleum, metal ores, and other minerals',1,'seed'),
  ('isic','C','Manufacturing','Manufacture of food, textiles, chemicals, metals, machinery, and other goods',1,'seed'),
  ('isic','D','Electricity, Gas, Steam and Air Conditioning Supply','Generation, transmission, and distribution of electric power, gas, steam',1,'seed'),
  ('isic','E','Water Supply; Sewerage, Waste Management and Remediation','Water collection, treatment, supply; sewerage; waste management',1,'seed'),
  ('isic','F','Construction','Construction of buildings, civil engineering, and specialized construction',1,'seed'),
  ('isic','G','Wholesale and Retail Trade','Wholesale and retail trade; repair of motor vehicles and motorcycles',1,'seed'),
  ('isic','H','Transportation and Storage','Land, water, air transport; warehousing and support activities',1,'seed'),
  ('isic','I','Accommodation and Food Service Activities','Hotels, restaurants, catering, and other accommodation/food service',1,'seed'),
  ('isic','J','Information and Communication','Publishing, broadcasting, telecommunications, IT, and information services',1,'seed'),
  ('isic','K','Financial and Insurance Activities','Financial service, insurance, reinsurance, pension funding, and auxiliaries',1,'seed'),
  ('isic','L','Real Estate Activities','Buying, selling, renting, and operating real estate',1,'seed'),
  ('isic','M','Professional, Scientific and Technical Activities','Legal, accounting, management, architecture, engineering, R&D, advertising',1,'seed'),
  ('isic','N','Administrative and Support Service Activities','Rental, employment, travel, security, cleaning, and office support',1,'seed'),
  ('isic','O','Public Administration and Defence','Public administration, defence, and compulsory social security',1,'seed'),
  ('isic','P','Education','Pre-primary, primary, secondary, higher, and other education',1,'seed'),
  ('isic','Q','Human Health and Social Work Activities','Human health, residential care, and social work activities',1,'seed'),
  ('isic','R','Arts, Entertainment and Recreation','Creative arts, libraries, museums, gambling, sports, recreation',1,'seed'),
  ('isic','S','Other Service Activities','Membership organizations, repair of personal goods, other personal services',1,'seed'),
  ('isic','T','Activities of Households as Employers','Households employing domestic personnel; undifferentiated production',1,'seed'),
  ('isic','U','Activities of Extraterritorial Organizations and Bodies','International organizations and bodies',1,'seed')
on conflict (domain_code, code) do nothing;

-- ============================================================================
-- ISIC Rev.4 — Divisions (Level 2, with parent_code → section)
-- ============================================================================

-- Section A: Agriculture, Forestry and Fishing
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','01','Crop and Animal Production','Growing of crops, raising of animals, mixed farming, and support',  'A',2,'seed'),
  ('isic','02','Forestry and Logging','Silviculture, logging, gathering of non-wood forest products',           'A',2,'seed'),
  ('isic','03','Fishing and Aquaculture','Fishing and aquaculture',                                              'A',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section B: Mining and Quarrying
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','05','Mining of Coal and Lignite','Mining of hard coal and lignite',                                    'B',2,'seed'),
  ('isic','06','Extraction of Crude Petroleum and Natural Gas','Extraction of crude petroleum and natural gas',  'B',2,'seed'),
  ('isic','07','Mining of Metal Ores','Mining of iron ores, non-ferrous metal ores',                             'B',2,'seed'),
  ('isic','08','Other Mining and Quarrying','Quarrying of stone, sand, clay, and other mining',                   'B',2,'seed'),
  ('isic','09','Mining Support Service Activities','Support activities for petroleum, gas, and other mining',     'B',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section C: Manufacturing
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','10','Manufacture of Food Products','Processing and preserving of meat, fish, fruit, vegetables, fats','C',2,'seed'),
  ('isic','11','Manufacture of Beverages','Distilling, blending of spirits; manufacture of wines, beer',         'C',2,'seed'),
  ('isic','12','Manufacture of Tobacco Products','Manufacture of tobacco products',                               'C',2,'seed'),
  ('isic','13','Manufacture of Textiles','Spinning, weaving, finishing of textiles',                              'C',2,'seed'),
  ('isic','14','Manufacture of Wearing Apparel','Manufacture of wearing apparel, except fur apparel',             'C',2,'seed'),
  ('isic','15','Manufacture of Leather','Tanning and dressing of leather; luggage, handbags, footwear',          'C',2,'seed'),
  ('isic','16','Manufacture of Wood Products','Sawmilling, planing of wood; manufacture of wood products',       'C',2,'seed'),
  ('isic','17','Manufacture of Paper','Manufacture of paper and paper products',                                  'C',2,'seed'),
  ('isic','18','Printing and Reproduction','Printing and service activities related to printing',                 'C',2,'seed'),
  ('isic','19','Manufacture of Coke and Refined Petroleum','Manufacture of coke oven products and refined petroleum','C',2,'seed'),
  ('isic','20','Manufacture of Chemicals','Manufacture of chemicals and chemical products',                       'C',2,'seed'),
  ('isic','21','Manufacture of Pharmaceuticals','Manufacture of pharmaceuticals, medicinal chemicals',            'C',2,'seed'),
  ('isic','22','Manufacture of Rubber and Plastics','Manufacture of rubber and plastics products',                'C',2,'seed'),
  ('isic','23','Manufacture of Non-metallic Mineral Products','Manufacture of glass, ceramics, cement',           'C',2,'seed'),
  ('isic','24','Manufacture of Basic Metals','Manufacture of basic iron, steel, and non-ferrous metals',          'C',2,'seed'),
  ('isic','25','Manufacture of Fabricated Metal Products','Manufacture of structural metals, tanks, weapons',     'C',2,'seed'),
  ('isic','26','Manufacture of Computer, Electronic and Optical Products','Electronic components, computers, communication equipment','C',2,'seed'),
  ('isic','27','Manufacture of Electrical Equipment','Manufacture of electric motors, batteries, wiring, lighting','C',2,'seed'),
  ('isic','28','Manufacture of Machinery and Equipment','Manufacture of general-purpose and special-purpose machinery','C',2,'seed'),
  ('isic','29','Manufacture of Motor Vehicles','Manufacture of motor vehicles, trailers, and semi-trailers',     'C',2,'seed'),
  ('isic','30','Manufacture of Other Transport Equipment','Building of ships, railway, aircraft, spacecraft',     'C',2,'seed'),
  ('isic','31','Manufacture of Furniture','Manufacture of furniture',                                             'C',2,'seed'),
  ('isic','32','Other Manufacturing','Manufacture of jewelry, musical instruments, toys, medical devices',        'C',2,'seed'),
  ('isic','33','Repair and Installation of Machinery','Repair of fabricated metals, machinery, equipment',        'C',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section D: Electricity, Gas, Steam
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','35','Electricity, Gas, Steam and Air Conditioning Supply','Generation, transmission, distribution of electricity, gas, steam','D',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section E: Water Supply, Sewerage, Waste
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','36','Water Collection, Treatment and Supply','Water collection, treatment and supply',                 'E',2,'seed'),
  ('isic','37','Sewerage','Sewerage',                                                                             'E',2,'seed'),
  ('isic','38','Waste Collection, Treatment and Disposal','Waste collection, treatment, disposal, materials recovery','E',2,'seed'),
  ('isic','39','Remediation and Other Waste Management','Remediation activities and other waste management services','E',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section F: Construction
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','41','Construction of Buildings','Construction of residential and non-residential buildings',           'F',2,'seed'),
  ('isic','42','Civil Engineering','Construction of roads, railways, utility projects, bridges',                  'F',2,'seed'),
  ('isic','43','Specialized Construction Activities','Demolition, site preparation, electrical, plumbing, finishing','F',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section G: Wholesale and Retail Trade
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','45','Wholesale and Retail Trade of Motor Vehicles','Sale, maintenance, repair of motor vehicles','G',2,'seed'),
  ('isic','46','Wholesale Trade','Wholesale trade, except of motor vehicles and motorcycles',                     'G',2,'seed'),
  ('isic','47','Retail Trade','Retail trade, except of motor vehicles and motorcycles',                           'G',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section H: Transportation and Storage
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','49','Land Transport and Transport via Pipelines','Railway, road, urban transit, freight, pipelines',   'H',2,'seed'),
  ('isic','50','Water Transport','Sea and coastal water transport; inland water transport',                       'H',2,'seed'),
  ('isic','51','Air Transport','Passenger and freight air transport',                                             'H',2,'seed'),
  ('isic','52','Warehousing and Support Activities','Warehousing and storage; support for transportation',        'H',2,'seed'),
  ('isic','53','Postal and Courier Activities','Postal and courier activities',                                   'H',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section I: Accommodation and Food Service
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','55','Accommodation','Short-stay accommodation, camping, RV parks',                                    'I',2,'seed'),
  ('isic','56','Food and Beverage Service Activities','Restaurants, catering, bars, canteens',                    'I',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section J: Information and Communication
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','58','Publishing Activities','Publishing of books, periodicals, directories, software',                'J',2,'seed'),
  ('isic','59','Motion Picture, Video and Television','Motion picture, video, television programme production',   'J',2,'seed'),
  ('isic','60','Programming and Broadcasting','Radio and television broadcasting',                                'J',2,'seed'),
  ('isic','61','Telecommunications','Wired, wireless, satellite, and other telecommunications',                  'J',2,'seed'),
  ('isic','62','Computer Programming and Consultancy','Computer programming, consultancy, and related activities','J',2,'seed'),
  ('isic','63','Information Service Activities','Data processing, hosting, web portals, news agencies',           'J',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section K: Financial and Insurance
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','64','Financial Service Activities','Monetary intermediation, holding companies, trusts, funds',        'K',2,'seed'),
  ('isic','65','Insurance, Reinsurance and Pension Funding','Insurance, reinsurance, and pension funding',         'K',2,'seed'),
  ('isic','66','Activities Auxiliary to Financial Service','Securities dealing, fund management, brokerages',      'K',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section L: Real Estate
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','68','Real Estate Activities','Buying, selling, renting, and managing real estate',                     'L',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section M: Professional, Scientific and Technical
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','69','Legal and Accounting Activities','Legal, accounting, bookkeeping, auditing, tax consultancy',     'M',2,'seed'),
  ('isic','70','Activities of Head Offices; Management Consultancy','Head office activities, management consultancy','M',2,'seed'),
  ('isic','71','Architectural and Engineering Activities','Architecture, engineering, technical testing',          'M',2,'seed'),
  ('isic','72','Scientific Research and Development','R&D in natural sciences, engineering, social sciences',     'M',2,'seed'),
  ('isic','73','Advertising and Market Research','Advertising, market research and public opinion polling',       'M',2,'seed'),
  ('isic','74','Other Professional, Scientific and Technical','Specialized design, photography, translation',     'M',2,'seed'),
  ('isic','75','Veterinary Activities','Veterinary activities',                                                    'M',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section N: Administrative and Support
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','77','Rental and Leasing Activities','Renting and leasing of motor vehicles, goods, IP',               'N',2,'seed'),
  ('isic','78','Employment Activities','Temporary employment, placement, HR provision',                           'N',2,'seed'),
  ('isic','79','Travel Agency and Tour Operator','Travel agency, tour operator, and reservation services',       'N',2,'seed'),
  ('isic','80','Security and Investigation Activities','Private security, investigation, security systems',       'N',2,'seed'),
  ('isic','81','Services to Buildings and Landscape Care','Cleaning, pest control, landscaping',                  'N',2,'seed'),
  ('isic','82','Office Administrative and Support','Office administration, call centres, conventions, packaging', 'N',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section O: Public Administration
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','84','Public Administration and Defence','Government administration, regulation, defence, social security','O',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section P: Education
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','85','Education','Pre-primary through post-secondary education; sports and cultural education','P',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section Q: Human Health and Social Work
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','86','Human Health Activities','Hospital, medical, dental practice activities',                         'Q',2,'seed'),
  ('isic','87','Residential Care Activities','Residential nursing, care for elderly, mental health',              'Q',2,'seed'),
  ('isic','88','Social Work Activities Without Accommodation','Social work for elderly, disabled; child day-care','Q',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section R: Arts, Entertainment and Recreation
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','90','Creative, Arts and Entertainment','Performing arts, artistic creation, arts facilities',          'R',2,'seed'),
  ('isic','91','Libraries, Archives, Museums','Libraries, archives, museums, botanical/zoological gardens',      'R',2,'seed'),
  ('isic','92','Gambling and Betting Activities','Gambling and betting activities',                                'R',2,'seed'),
  ('isic','93','Sports and Recreation Activities','Sports, amusement and recreation activities',                  'R',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section S: Other Service Activities
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','94','Activities of Membership Organizations','Business, employer, professional, trade unions, religious','S',2,'seed'),
  ('isic','95','Repair of Computers and Personal Goods','Repair of computers, communication equipment, personal goods','S',2,'seed'),
  ('isic','96','Other Personal Service Activities','Laundry, hairdressing, funeral, physical well-being',         'S',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section T: Activities of Households
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','97','Activities of Households as Employers','Households as employers of domestic personnel',           'T',2,'seed'),
  ('isic','98','Undifferentiated Goods and Services Production','Undifferentiated goods- and services-producing activities of households for own use','T',2,'seed')
on conflict (domain_code, code) do nothing;

-- Section U: Extraterritorial Organizations
insert into ref.industry_code (domain_code, code, name, description, parent_code, level_no, created_by)
values
  ('isic','99','Activities of Extraterritorial Organizations','International organizations and bodies',           'U',2,'seed')
on conflict (domain_code, code) do nothing;

-- ============================================================================
-- NAICS 2022 — Sectors (Level 1)
-- ============================================================================
insert into ref.industry_code (domain_code, code, name, description, level_no, created_by)
values
  ('naics','11','Agriculture, Forestry, Fishing and Hunting','Crop production, animal production, forestry, fishing, hunting',1,'seed'),
  ('naics','21','Mining, Quarrying, and Oil and Gas Extraction','Oil/gas, mining, support activities for mining',1,'seed'),
  ('naics','22','Utilities','Electric power, natural gas, water, sewage',1,'seed'),
  ('naics','23','Construction','Building, heavy/civil engineering, specialty trade contractors',1,'seed'),
  ('naics','31','Manufacturing — Food, Beverage, Textile, Apparel','Food, beverage, tobacco, textile, apparel, leather manufacturing',1,'seed'),
  ('naics','32','Manufacturing — Wood, Paper, Petroleum, Chemical, Plastics','Wood, paper, petroleum, chemical, plastics, nonmetallic mineral manufacturing',1,'seed'),
  ('naics','33','Manufacturing — Metals, Machinery, Electronics, Transport','Primary metals, fabricated metals, machinery, computer, electrical, transport equipment',1,'seed'),
  ('naics','42','Wholesale Trade','Merchant wholesalers, electronic markets, agents and brokers',1,'seed'),
  ('naics','44','Retail Trade — Motor Vehicle, Furniture, Electronics, Building','Motor vehicle dealers, furniture, electronics, building material stores',1,'seed'),
  ('naics','45','Retail Trade — Food, Health, Clothing, General, Misc','Food/beverage, health/personal, clothing, general, miscellaneous stores',1,'seed'),
  ('naics','48','Transportation — Air, Rail, Water, Truck, Transit, Pipeline','Air, rail, water, truck, transit, pipeline transportation',1,'seed'),
  ('naics','49','Transportation — Postal, Courier, Warehousing','Postal service, couriers, warehousing and storage',1,'seed'),
  ('naics','51','Information','Publishing, motion picture, broadcasting, telecommunications, data processing',1,'seed'),
  ('naics','52','Finance and Insurance','Monetary authorities, credit intermediation, securities, insurance',1,'seed'),
  ('naics','53','Real Estate and Rental and Leasing','Real estate, rental and leasing services',1,'seed'),
  ('naics','54','Professional, Scientific, and Technical Services','Legal, accounting, architecture, engineering, computer, consulting, advertising, R&D',1,'seed'),
  ('naics','55','Management of Companies and Enterprises','Holding companies, head offices, management of companies',1,'seed'),
  ('naics','56','Administrative and Support and Waste Management','Office admin, employment, travel, security, cleaning, waste management',1,'seed'),
  ('naics','61','Educational Services','Elementary, secondary, colleges, universities, technical, educational support',1,'seed'),
  ('naics','62','Health Care and Social Assistance','Ambulatory, hospitals, nursing, residential care, social assistance',1,'seed'),
  ('naics','71','Arts, Entertainment, and Recreation','Performing arts, spectator sports, museums, amusement, gambling',1,'seed'),
  ('naics','72','Accommodation and Food Services','Accommodation, food services, and drinking places',1,'seed'),
  ('naics','81','Other Services (except Public Administration)','Repair, personal/laundry, religious, civic, professional organizations',1,'seed'),
  ('naics','92','Public Administration','Executive, legislative, judicial, administration, national security',1,'seed')
on conflict (domain_code, code) do nothing;
