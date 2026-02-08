/* ============================================================================
   Athyper — REF Seed: Countries (ISO 3166-1)
   PostgreSQL 16+

   Complete list of ISO 3166-1 country codes with UN M49 regions.
   Depends on: 010_ref_master_tables.sql
   ============================================================================ */

-- ============================================================================
-- AFRICA
-- ============================================================================
insert into ref.country (code2, code3, numeric3, name, official_name, region, subregion, created_by)
values
  ('DZ','DZA','012','Algeria','People''s Democratic Republic of Algeria','Africa','Northern Africa','seed'),
  ('AO','AGO','024','Angola','Republic of Angola','Africa','Sub-Saharan Africa','seed'),
  ('BJ','BEN','204','Benin','Republic of Benin','Africa','Sub-Saharan Africa','seed'),
  ('BW','BWA','072','Botswana','Republic of Botswana','Africa','Sub-Saharan Africa','seed'),
  ('BF','BFA','854','Burkina Faso','Burkina Faso','Africa','Sub-Saharan Africa','seed'),
  ('BI','BDI','108','Burundi','Republic of Burundi','Africa','Sub-Saharan Africa','seed'),
  ('CV','CPV','132','Cabo Verde','Republic of Cabo Verde','Africa','Sub-Saharan Africa','seed'),
  ('CM','CMR','120','Cameroon','Republic of Cameroon','Africa','Sub-Saharan Africa','seed'),
  ('CF','CAF','140','Central African Republic','Central African Republic','Africa','Sub-Saharan Africa','seed'),
  ('TD','TCD','148','Chad','Republic of Chad','Africa','Sub-Saharan Africa','seed'),
  ('KM','COM','174','Comoros','Union of the Comoros','Africa','Sub-Saharan Africa','seed'),
  ('CG','COG','178','Congo','Republic of the Congo','Africa','Sub-Saharan Africa','seed'),
  ('CD','COD','180','Congo (Democratic Republic)','Democratic Republic of the Congo','Africa','Sub-Saharan Africa','seed'),
  ('CI','CIV','384','Côte d''Ivoire','Republic of Côte d''Ivoire','Africa','Sub-Saharan Africa','seed'),
  ('DJ','DJI','262','Djibouti','Republic of Djibouti','Africa','Sub-Saharan Africa','seed'),
  ('EG','EGY','818','Egypt','Arab Republic of Egypt','Africa','Northern Africa','seed'),
  ('GQ','GNQ','226','Equatorial Guinea','Republic of Equatorial Guinea','Africa','Sub-Saharan Africa','seed'),
  ('ER','ERI','232','Eritrea','State of Eritrea','Africa','Sub-Saharan Africa','seed'),
  ('SZ','SWZ','748','Eswatini','Kingdom of Eswatini','Africa','Sub-Saharan Africa','seed'),
  ('ET','ETH','231','Ethiopia','Federal Democratic Republic of Ethiopia','Africa','Sub-Saharan Africa','seed'),
  ('GA','GAB','266','Gabon','Gabonese Republic','Africa','Sub-Saharan Africa','seed'),
  ('GM','GMB','270','Gambia','Republic of the Gambia','Africa','Sub-Saharan Africa','seed'),
  ('GH','GHA','288','Ghana','Republic of Ghana','Africa','Sub-Saharan Africa','seed'),
  ('GN','GIN','324','Guinea','Republic of Guinea','Africa','Sub-Saharan Africa','seed'),
  ('GW','GNB','624','Guinea-Bissau','Republic of Guinea-Bissau','Africa','Sub-Saharan Africa','seed'),
  ('KE','KEN','404','Kenya','Republic of Kenya','Africa','Sub-Saharan Africa','seed'),
  ('LS','LSO','426','Lesotho','Kingdom of Lesotho','Africa','Sub-Saharan Africa','seed'),
  ('LR','LBR','430','Liberia','Republic of Liberia','Africa','Sub-Saharan Africa','seed'),
  ('LY','LBY','434','Libya','State of Libya','Africa','Northern Africa','seed'),
  ('MG','MDG','450','Madagascar','Republic of Madagascar','Africa','Sub-Saharan Africa','seed'),
  ('MW','MWI','454','Malawi','Republic of Malawi','Africa','Sub-Saharan Africa','seed'),
  ('ML','MLI','466','Mali','Republic of Mali','Africa','Sub-Saharan Africa','seed'),
  ('MR','MRT','478','Mauritania','Islamic Republic of Mauritania','Africa','Sub-Saharan Africa','seed'),
  ('MU','MUS','480','Mauritius','Republic of Mauritius','Africa','Sub-Saharan Africa','seed'),
  ('YT','MYT','175','Mayotte',null,'Africa','Sub-Saharan Africa','seed'),
  ('MA','MAR','504','Morocco','Kingdom of Morocco','Africa','Northern Africa','seed'),
  ('MZ','MOZ','508','Mozambique','Republic of Mozambique','Africa','Sub-Saharan Africa','seed'),
  ('NA','NAM','516','Namibia','Republic of Namibia','Africa','Sub-Saharan Africa','seed'),
  ('NE','NER','562','Niger','Republic of the Niger','Africa','Sub-Saharan Africa','seed'),
  ('NG','NGA','566','Nigeria','Federal Republic of Nigeria','Africa','Sub-Saharan Africa','seed'),
  ('RE','REU','638','Réunion',null,'Africa','Sub-Saharan Africa','seed'),
  ('RW','RWA','646','Rwanda','Republic of Rwanda','Africa','Sub-Saharan Africa','seed'),
  ('ST','STP','678','São Tomé and Príncipe','Democratic Republic of São Tomé and Príncipe','Africa','Sub-Saharan Africa','seed'),
  ('SN','SEN','686','Senegal','Republic of Senegal','Africa','Sub-Saharan Africa','seed'),
  ('SC','SYC','690','Seychelles','Republic of Seychelles','Africa','Sub-Saharan Africa','seed'),
  ('SL','SLE','694','Sierra Leone','Republic of Sierra Leone','Africa','Sub-Saharan Africa','seed'),
  ('SO','SOM','706','Somalia','Federal Republic of Somalia','Africa','Sub-Saharan Africa','seed'),
  ('ZA','ZAF','710','South Africa','Republic of South Africa','Africa','Sub-Saharan Africa','seed'),
  ('SS','SSD','728','South Sudan','Republic of South Sudan','Africa','Sub-Saharan Africa','seed'),
  ('SD','SDN','729','Sudan','Republic of the Sudan','Africa','Northern Africa','seed'),
  ('TZ','TZA','834','Tanzania','United Republic of Tanzania','Africa','Sub-Saharan Africa','seed'),
  ('TG','TGO','768','Togo','Togolese Republic','Africa','Sub-Saharan Africa','seed'),
  ('TN','TUN','788','Tunisia','Republic of Tunisia','Africa','Northern Africa','seed'),
  ('UG','UGA','800','Uganda','Republic of Uganda','Africa','Sub-Saharan Africa','seed'),
  ('EH','ESH','732','Western Sahara',null,'Africa','Northern Africa','seed'),
  ('ZM','ZMB','894','Zambia','Republic of Zambia','Africa','Sub-Saharan Africa','seed'),
  ('ZW','ZWE','716','Zimbabwe','Republic of Zimbabwe','Africa','Sub-Saharan Africa','seed')
on conflict (code2) do nothing;

-- ============================================================================
-- AMERICAS
-- ============================================================================
insert into ref.country (code2, code3, numeric3, name, official_name, region, subregion, created_by)
values
  -- Caribbean
  ('AI','AIA','660','Anguilla',null,'Americas','Caribbean','seed'),
  ('AG','ATG','028','Antigua and Barbuda',null,'Americas','Caribbean','seed'),
  ('AW','ABW','533','Aruba',null,'Americas','Caribbean','seed'),
  ('BS','BHS','044','Bahamas','Commonwealth of the Bahamas','Americas','Caribbean','seed'),
  ('BB','BRB','052','Barbados',null,'Americas','Caribbean','seed'),
  ('BQ','BES','535','Bonaire, Sint Eustatius and Saba',null,'Americas','Caribbean','seed'),
  ('VG','VGB','092','British Virgin Islands',null,'Americas','Caribbean','seed'),
  ('KY','CYM','136','Cayman Islands',null,'Americas','Caribbean','seed'),
  ('CU','CUB','192','Cuba','Republic of Cuba','Americas','Caribbean','seed'),
  ('CW','CUW','531','Curaçao',null,'Americas','Caribbean','seed'),
  ('DM','DMA','212','Dominica','Commonwealth of Dominica','Americas','Caribbean','seed'),
  ('DO','DOM','214','Dominican Republic',null,'Americas','Caribbean','seed'),
  ('GD','GRD','308','Grenada',null,'Americas','Caribbean','seed'),
  ('GP','GLP','312','Guadeloupe',null,'Americas','Caribbean','seed'),
  ('HT','HTI','332','Haiti','Republic of Haiti','Americas','Caribbean','seed'),
  ('JM','JAM','388','Jamaica',null,'Americas','Caribbean','seed'),
  ('MQ','MTQ','474','Martinique',null,'Americas','Caribbean','seed'),
  ('MS','MSR','500','Montserrat',null,'Americas','Caribbean','seed'),
  ('PR','PRI','630','Puerto Rico',null,'Americas','Caribbean','seed'),
  ('BL','BLM','652','Saint Barthélemy',null,'Americas','Caribbean','seed'),
  ('KN','KNA','659','Saint Kitts and Nevis',null,'Americas','Caribbean','seed'),
  ('LC','LCA','662','Saint Lucia',null,'Americas','Caribbean','seed'),
  ('MF','MAF','663','Saint Martin (French part)',null,'Americas','Caribbean','seed'),
  ('VC','VCT','670','Saint Vincent and the Grenadines',null,'Americas','Caribbean','seed'),
  ('SX','SXM','534','Sint Maarten (Dutch part)',null,'Americas','Caribbean','seed'),
  ('TT','TTO','780','Trinidad and Tobago','Republic of Trinidad and Tobago','Americas','Caribbean','seed'),
  ('TC','TCA','796','Turks and Caicos Islands',null,'Americas','Caribbean','seed'),
  ('VI','VIR','850','United States Virgin Islands',null,'Americas','Caribbean','seed'),

  -- Central America
  ('BZ','BLZ','084','Belize',null,'Americas','Central America','seed'),
  ('CR','CRI','188','Costa Rica','Republic of Costa Rica','Americas','Central America','seed'),
  ('SV','SLV','222','El Salvador','Republic of El Salvador','Americas','Central America','seed'),
  ('GT','GTM','320','Guatemala','Republic of Guatemala','Americas','Central America','seed'),
  ('HN','HND','340','Honduras','Republic of Honduras','Americas','Central America','seed'),
  ('MX','MEX','484','Mexico','United Mexican States','Americas','Central America','seed'),
  ('NI','NIC','558','Nicaragua','Republic of Nicaragua','Americas','Central America','seed'),
  ('PA','PAN','591','Panama','Republic of Panama','Americas','Central America','seed'),

  -- South America
  ('AR','ARG','032','Argentina','Argentine Republic','Americas','South America','seed'),
  ('BO','BOL','068','Bolivia','Plurinational State of Bolivia','Americas','South America','seed'),
  ('BR','BRA','076','Brazil','Federative Republic of Brazil','Americas','South America','seed'),
  ('CL','CHL','152','Chile','Republic of Chile','Americas','South America','seed'),
  ('CO','COL','170','Colombia','Republic of Colombia','Americas','South America','seed'),
  ('EC','ECU','218','Ecuador','Republic of Ecuador','Americas','South America','seed'),
  ('FK','FLK','238','Falkland Islands (Malvinas)',null,'Americas','South America','seed'),
  ('GF','GUF','254','French Guiana',null,'Americas','South America','seed'),
  ('GY','GUY','328','Guyana','Co-operative Republic of Guyana','Americas','South America','seed'),
  ('PY','PRY','600','Paraguay','Republic of Paraguay','Americas','South America','seed'),
  ('PE','PER','604','Peru','Republic of Peru','Americas','South America','seed'),
  ('SR','SUR','740','Suriname','Republic of Suriname','Americas','South America','seed'),
  ('UY','URY','858','Uruguay','Eastern Republic of Uruguay','Americas','South America','seed'),
  ('VE','VEN','862','Venezuela','Bolivarian Republic of Venezuela','Americas','South America','seed'),

  -- Northern America
  ('BM','BMU','060','Bermuda',null,'Americas','Northern America','seed'),
  ('CA','CAN','124','Canada',null,'Americas','Northern America','seed'),
  ('GL','GRL','304','Greenland',null,'Americas','Northern America','seed'),
  ('PM','SPM','666','Saint Pierre and Miquelon',null,'Americas','Northern America','seed'),
  ('US','USA','840','United States of America',null,'Americas','Northern America','seed')
on conflict (code2) do nothing;

-- ============================================================================
-- ASIA
-- ============================================================================
insert into ref.country (code2, code3, numeric3, name, official_name, region, subregion, created_by)
values
  -- Central Asia
  ('KZ','KAZ','398','Kazakhstan','Republic of Kazakhstan','Asia','Central Asia','seed'),
  ('KG','KGZ','417','Kyrgyzstan','Kyrgyz Republic','Asia','Central Asia','seed'),
  ('TJ','TJK','762','Tajikistan','Republic of Tajikistan','Asia','Central Asia','seed'),
  ('TM','TKM','795','Turkmenistan',null,'Asia','Central Asia','seed'),
  ('UZ','UZB','860','Uzbekistan','Republic of Uzbekistan','Asia','Central Asia','seed'),

  -- Eastern Asia
  ('CN','CHN','156','China','People''s Republic of China','Asia','Eastern Asia','seed'),
  ('HK','HKG','344','Hong Kong','Hong Kong Special Administrative Region of China','Asia','Eastern Asia','seed'),
  ('JP','JPN','392','Japan',null,'Asia','Eastern Asia','seed'),
  ('KP','PRK','408','Korea (Democratic People''s Republic)','Democratic People''s Republic of Korea','Asia','Eastern Asia','seed'),
  ('KR','KOR','410','Korea (Republic of)','Republic of Korea','Asia','Eastern Asia','seed'),
  ('MO','MAC','446','Macao','Macao Special Administrative Region of China','Asia','Eastern Asia','seed'),
  ('MN','MNG','496','Mongolia',null,'Asia','Eastern Asia','seed'),
  ('TW','TWN','158','Taiwan','Taiwan, Province of China','Asia','Eastern Asia','seed'),

  -- South-eastern Asia
  ('BN','BRN','096','Brunei Darussalam',null,'Asia','South-eastern Asia','seed'),
  ('KH','KHM','116','Cambodia','Kingdom of Cambodia','Asia','South-eastern Asia','seed'),
  ('ID','IDN','360','Indonesia','Republic of Indonesia','Asia','South-eastern Asia','seed'),
  ('LA','LAO','418','Lao People''s Democratic Republic',null,'Asia','South-eastern Asia','seed'),
  ('MY','MYS','458','Malaysia',null,'Asia','South-eastern Asia','seed'),
  ('MM','MMR','104','Myanmar','Republic of the Union of Myanmar','Asia','South-eastern Asia','seed'),
  ('PH','PHL','608','Philippines','Republic of the Philippines','Asia','South-eastern Asia','seed'),
  ('SG','SGP','702','Singapore','Republic of Singapore','Asia','South-eastern Asia','seed'),
  ('TH','THA','764','Thailand','Kingdom of Thailand','Asia','South-eastern Asia','seed'),
  ('TL','TLS','626','Timor-Leste','Democratic Republic of Timor-Leste','Asia','South-eastern Asia','seed'),
  ('VN','VNM','704','Viet Nam','Socialist Republic of Viet Nam','Asia','South-eastern Asia','seed'),

  -- Southern Asia
  ('AF','AFG','004','Afghanistan','Islamic Republic of Afghanistan','Asia','Southern Asia','seed'),
  ('BD','BGD','050','Bangladesh','People''s Republic of Bangladesh','Asia','Southern Asia','seed'),
  ('BT','BTN','064','Bhutan','Kingdom of Bhutan','Asia','Southern Asia','seed'),
  ('IN','IND','356','India','Republic of India','Asia','Southern Asia','seed'),
  ('IR','IRN','364','Iran','Islamic Republic of Iran','Asia','Southern Asia','seed'),
  ('MV','MDV','462','Maldives','Republic of Maldives','Asia','Southern Asia','seed'),
  ('NP','NPL','524','Nepal','Federal Democratic Republic of Nepal','Asia','Southern Asia','seed'),
  ('PK','PAK','586','Pakistan','Islamic Republic of Pakistan','Asia','Southern Asia','seed'),
  ('LK','LKA','144','Sri Lanka','Democratic Socialist Republic of Sri Lanka','Asia','Southern Asia','seed'),

  -- Western Asia
  ('AM','ARM','051','Armenia','Republic of Armenia','Asia','Western Asia','seed'),
  ('AZ','AZE','031','Azerbaijan','Republic of Azerbaijan','Asia','Western Asia','seed'),
  ('BH','BHR','048','Bahrain','Kingdom of Bahrain','Asia','Western Asia','seed'),
  ('CY','CYP','196','Cyprus','Republic of Cyprus','Asia','Western Asia','seed'),
  ('GE','GEO','268','Georgia',null,'Asia','Western Asia','seed'),
  ('IQ','IRQ','368','Iraq','Republic of Iraq','Asia','Western Asia','seed'),
  ('IL','ISR','376','Israel','State of Israel','Asia','Western Asia','seed'),
  ('JO','JOR','400','Jordan','Hashemite Kingdom of Jordan','Asia','Western Asia','seed'),
  ('KW','KWT','414','Kuwait','State of Kuwait','Asia','Western Asia','seed'),
  ('LB','LBN','422','Lebanon','Lebanese Republic','Asia','Western Asia','seed'),
  ('OM','OMN','512','Oman','Sultanate of Oman','Asia','Western Asia','seed'),
  ('PS','PSE','275','Palestine, State of',null,'Asia','Western Asia','seed'),
  ('QA','QAT','634','Qatar','State of Qatar','Asia','Western Asia','seed'),
  ('SA','SAU','682','Saudi Arabia','Kingdom of Saudi Arabia','Asia','Western Asia','seed'),
  ('SY','SYR','760','Syrian Arab Republic',null,'Asia','Western Asia','seed'),
  ('TR','TUR','792','Türkiye','Republic of Türkiye','Asia','Western Asia','seed'),
  ('AE','ARE','784','United Arab Emirates',null,'Asia','Western Asia','seed'),
  ('YE','YEM','887','Yemen','Republic of Yemen','Asia','Western Asia','seed')
on conflict (code2) do nothing;

-- ============================================================================
-- EUROPE
-- ============================================================================
insert into ref.country (code2, code3, numeric3, name, official_name, region, subregion, created_by)
values
  -- Eastern Europe
  ('BY','BLR','112','Belarus','Republic of Belarus','Europe','Eastern Europe','seed'),
  ('BG','BGR','100','Bulgaria','Republic of Bulgaria','Europe','Eastern Europe','seed'),
  ('CZ','CZE','203','Czechia','Czech Republic','Europe','Eastern Europe','seed'),
  ('HU','HUN','348','Hungary',null,'Europe','Eastern Europe','seed'),
  ('MD','MDA','498','Moldova','Republic of Moldova','Europe','Eastern Europe','seed'),
  ('PL','POL','616','Poland','Republic of Poland','Europe','Eastern Europe','seed'),
  ('RO','ROU','642','Romania',null,'Europe','Eastern Europe','seed'),
  ('RU','RUS','643','Russian Federation',null,'Europe','Eastern Europe','seed'),
  ('SK','SVK','703','Slovakia','Slovak Republic','Europe','Eastern Europe','seed'),
  ('UA','UKR','804','Ukraine',null,'Europe','Eastern Europe','seed'),

  -- Northern Europe
  ('AX','ALA','248','Åland Islands',null,'Europe','Northern Europe','seed'),
  ('DK','DNK','208','Denmark','Kingdom of Denmark','Europe','Northern Europe','seed'),
  ('EE','EST','233','Estonia','Republic of Estonia','Europe','Northern Europe','seed'),
  ('FO','FRO','234','Faroe Islands',null,'Europe','Northern Europe','seed'),
  ('FI','FIN','246','Finland','Republic of Finland','Europe','Northern Europe','seed'),
  ('GG','GGY','831','Guernsey',null,'Europe','Northern Europe','seed'),
  ('IS','ISL','352','Iceland','Republic of Iceland','Europe','Northern Europe','seed'),
  ('IE','IRL','372','Ireland',null,'Europe','Northern Europe','seed'),
  ('IM','IMN','833','Isle of Man',null,'Europe','Northern Europe','seed'),
  ('JE','JEY','832','Jersey',null,'Europe','Northern Europe','seed'),
  ('LV','LVA','428','Latvia','Republic of Latvia','Europe','Northern Europe','seed'),
  ('LT','LTU','440','Lithuania','Republic of Lithuania','Europe','Northern Europe','seed'),
  ('NO','NOR','578','Norway','Kingdom of Norway','Europe','Northern Europe','seed'),
  ('SJ','SJM','744','Svalbard and Jan Mayen',null,'Europe','Northern Europe','seed'),
  ('SE','SWE','752','Sweden','Kingdom of Sweden','Europe','Northern Europe','seed'),
  ('GB','GBR','826','United Kingdom','United Kingdom of Great Britain and Northern Ireland','Europe','Northern Europe','seed'),

  -- Southern Europe
  ('AL','ALB','008','Albania','Republic of Albania','Europe','Southern Europe','seed'),
  ('AD','AND','020','Andorra','Principality of Andorra','Europe','Southern Europe','seed'),
  ('BA','BIH','070','Bosnia and Herzegovina',null,'Europe','Southern Europe','seed'),
  ('HR','HRV','191','Croatia','Republic of Croatia','Europe','Southern Europe','seed'),
  ('GI','GIB','292','Gibraltar',null,'Europe','Southern Europe','seed'),
  ('GR','GRC','300','Greece','Hellenic Republic','Europe','Southern Europe','seed'),
  ('VA','VAT','336','Holy See',null,'Europe','Southern Europe','seed'),
  ('IT','ITA','380','Italy','Italian Republic','Europe','Southern Europe','seed'),
  ('XK','XKX','983','Kosovo','Republic of Kosovo','Europe','Southern Europe','seed'),
  ('MT','MLT','470','Malta','Republic of Malta','Europe','Southern Europe','seed'),
  ('ME','MNE','499','Montenegro',null,'Europe','Southern Europe','seed'),
  ('MK','MKD','807','North Macedonia','Republic of North Macedonia','Europe','Southern Europe','seed'),
  ('PT','PRT','620','Portugal','Portuguese Republic','Europe','Southern Europe','seed'),
  ('SM','SMR','674','San Marino','Republic of San Marino','Europe','Southern Europe','seed'),
  ('RS','SRB','688','Serbia','Republic of Serbia','Europe','Southern Europe','seed'),
  ('SI','SVN','705','Slovenia','Republic of Slovenia','Europe','Southern Europe','seed'),
  ('ES','ESP','724','Spain','Kingdom of Spain','Europe','Southern Europe','seed'),

  -- Western Europe
  ('AT','AUT','040','Austria','Republic of Austria','Europe','Western Europe','seed'),
  ('BE','BEL','056','Belgium','Kingdom of Belgium','Europe','Western Europe','seed'),
  ('FR','FRA','250','France','French Republic','Europe','Western Europe','seed'),
  ('DE','DEU','276','Germany','Federal Republic of Germany','Europe','Western Europe','seed'),
  ('LI','LIE','438','Liechtenstein','Principality of Liechtenstein','Europe','Western Europe','seed'),
  ('LU','LUX','442','Luxembourg','Grand Duchy of Luxembourg','Europe','Western Europe','seed'),
  ('MC','MCO','492','Monaco','Principality of Monaco','Europe','Western Europe','seed'),
  ('NL','NLD','528','Netherlands','Kingdom of the Netherlands','Europe','Western Europe','seed'),
  ('CH','CHE','756','Switzerland','Swiss Confederation','Europe','Western Europe','seed')
on conflict (code2) do nothing;

-- ============================================================================
-- OCEANIA
-- ============================================================================
insert into ref.country (code2, code3, numeric3, name, official_name, region, subregion, created_by)
values
  -- Australia and New Zealand
  ('AU','AUS','036','Australia','Commonwealth of Australia','Oceania','Australia and New Zealand','seed'),
  ('CX','CXR','162','Christmas Island',null,'Oceania','Australia and New Zealand','seed'),
  ('CC','CCK','166','Cocos (Keeling) Islands',null,'Oceania','Australia and New Zealand','seed'),
  ('HM','HMD','334','Heard Island and McDonald Islands',null,'Oceania','Australia and New Zealand','seed'),
  ('NF','NFK','574','Norfolk Island',null,'Oceania','Australia and New Zealand','seed'),
  ('NZ','NZL','554','New Zealand',null,'Oceania','Australia and New Zealand','seed'),

  -- Melanesia
  ('FJ','FJI','242','Fiji','Republic of Fiji','Oceania','Melanesia','seed'),
  ('NC','NCL','540','New Caledonia',null,'Oceania','Melanesia','seed'),
  ('PG','PNG','598','Papua New Guinea','Independent State of Papua New Guinea','Oceania','Melanesia','seed'),
  ('SB','SLB','090','Solomon Islands',null,'Oceania','Melanesia','seed'),
  ('VU','VUT','548','Vanuatu','Republic of Vanuatu','Oceania','Melanesia','seed'),

  -- Micronesia
  ('GU','GUM','316','Guam',null,'Oceania','Micronesia','seed'),
  ('KI','KIR','296','Kiribati','Republic of Kiribati','Oceania','Micronesia','seed'),
  ('MH','MHL','584','Marshall Islands','Republic of the Marshall Islands','Oceania','Micronesia','seed'),
  ('FM','FSM','583','Micronesia (Federated States of)',null,'Oceania','Micronesia','seed'),
  ('NR','NRU','520','Nauru','Republic of Nauru','Oceania','Micronesia','seed'),
  ('MP','MNP','580','Northern Mariana Islands','Commonwealth of the Northern Mariana Islands','Oceania','Micronesia','seed'),
  ('PW','PLW','585','Palau','Republic of Palau','Oceania','Micronesia','seed'),

  -- Polynesia
  ('AS','ASM','016','American Samoa',null,'Oceania','Polynesia','seed'),
  ('CK','COK','184','Cook Islands',null,'Oceania','Polynesia','seed'),
  ('PF','PYF','258','French Polynesia',null,'Oceania','Polynesia','seed'),
  ('NU','NIU','570','Niue',null,'Oceania','Polynesia','seed'),
  ('PN','PCN','612','Pitcairn',null,'Oceania','Polynesia','seed'),
  ('WS','WSM','882','Samoa','Independent State of Samoa','Oceania','Polynesia','seed'),
  ('TK','TKL','772','Tokelau',null,'Oceania','Polynesia','seed'),
  ('TO','TON','776','Tonga','Kingdom of Tonga','Oceania','Polynesia','seed'),
  ('TV','TUV','798','Tuvalu',null,'Oceania','Polynesia','seed'),
  ('WF','WLF','876','Wallis and Futuna',null,'Oceania','Polynesia','seed')
on conflict (code2) do nothing;

-- ============================================================================
-- ANTARCTICA
-- ============================================================================
insert into ref.country (code2, code3, numeric3, name, official_name, region, subregion, created_by)
values
  ('AQ','ATA','010','Antarctica',null,'Antarctica',null,'seed'),
  ('BV','BVT','074','Bouvet Island',null,'Antarctica',null,'seed'),
  ('TF','ATF','260','French Southern Territories',null,'Antarctica',null,'seed'),
  ('GS','SGS','239','South Georgia and the South Sandwich Islands',null,'Antarctica',null,'seed')
on conflict (code2) do nothing;
