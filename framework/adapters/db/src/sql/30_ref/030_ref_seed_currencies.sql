/* ============================================================================
   Athyper — REF Seed: Currencies (ISO 4217)
   PostgreSQL 16+

   Active ISO 4217 currency codes with symbols and minor units.
   Depends on: 010_ref_master_tables.sql
   ============================================================================ */

-- ============================================================================
-- Major World Currencies
-- ============================================================================
insert into ref.currency (code, name, symbol, minor_units, numeric3, created_by)
values
  ('USD','US Dollar','$',2,'840','seed'),
  ('EUR','Euro','€',2,'978','seed'),
  ('GBP','Pound Sterling','£',2,'826','seed'),
  ('JPY','Yen','¥',0,'392','seed'),
  ('CNY','Yuan Renminbi','¥',2,'156','seed'),
  ('CHF','Swiss Franc','CHF',2,'756','seed'),
  ('CAD','Canadian Dollar','CA$',2,'124','seed'),
  ('AUD','Australian Dollar','A$',2,'036','seed'),
  ('NZD','New Zealand Dollar','NZ$',2,'554','seed'),
  ('HKD','Hong Kong Dollar','HK$',2,'344','seed'),
  ('SGD','Singapore Dollar','S$',2,'702','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Middle East & North Africa
-- ============================================================================
insert into ref.currency (code, name, symbol, minor_units, numeric3, created_by)
values
  ('SAR','Saudi Riyal','﷼',2,'682','seed'),
  ('AED','UAE Dirham','د.إ',2,'784','seed'),
  ('BHD','Bahraini Dinar','BD',3,'048','seed'),
  ('KWD','Kuwaiti Dinar','KD',3,'414','seed'),
  ('OMR','Rial Omani','﷼',3,'512','seed'),
  ('QAR','Qatari Rial','QR',2,'634','seed'),
  ('JOD','Jordanian Dinar','JD',3,'400','seed'),
  ('IQD','Iraqi Dinar','ع.د',3,'368','seed'),
  ('LBP','Lebanese Pound','ل.ل',2,'422','seed'),
  ('SYP','Syrian Pound','£S',2,'760','seed'),
  ('YER','Yemeni Rial','﷼',2,'886','seed'),
  ('EGP','Egyptian Pound','E£',2,'818','seed'),
  ('LYD','Libyan Dinar','LD',3,'434','seed'),
  ('TND','Tunisian Dinar','DT',3,'788','seed'),
  ('DZD','Algerian Dinar','د.ج',2,'012','seed'),
  ('MAD','Moroccan Dirham','MAD',2,'504','seed'),
  ('SDG','Sudanese Pound','SDG',2,'938','seed'),
  ('ILS','New Israeli Sheqel','₪',2,'376','seed'),
  ('IRR','Iranian Rial','﷼',2,'364','seed'),
  ('PSE','Palestine (no ISO currency)',null,2,null,'seed')
on conflict (code) do nothing;

-- ============================================================================
-- Europe (non-EUR)
-- ============================================================================
insert into ref.currency (code, name, symbol, minor_units, numeric3, created_by)
values
  ('ALL','Albanian Lek','L',2,'008','seed'),
  ('BAM','Convertible Mark','KM',2,'977','seed'),
  ('BGN','Bulgarian Lev','лв',2,'975','seed'),
  ('BYN','Belarusian Ruble','Br',2,'933','seed'),
  ('CZK','Czech Koruna','Kč',2,'203','seed'),
  ('DKK','Danish Krone','kr',2,'208','seed'),
  ('GEL','Georgian Lari','₾',2,'981','seed'),
  ('HRK','Croatian Kuna','kn',2,'191','seed'),
  ('HUF','Hungarian Forint','Ft',2,'348','seed'),
  ('ISK','Iceland Krona','kr',0,'352','seed'),
  ('MDL','Moldovan Leu','L',2,'498','seed'),
  ('MKD','Macedonian Denar','ден',2,'807','seed'),
  ('NOK','Norwegian Krone','kr',2,'578','seed'),
  ('PLN','Polish Zloty','zł',2,'985','seed'),
  ('RON','Romanian Leu','lei',2,'946','seed'),
  ('RSD','Serbian Dinar','din.',2,'941','seed'),
  ('RUB','Russian Ruble','₽',2,'643','seed'),
  ('SEK','Swedish Krona','kr',2,'752','seed'),
  ('TRY','Turkish Lira','₺',2,'949','seed'),
  ('UAH','Ukrainian Hryvnia','₴',2,'980','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Asia & Pacific
-- ============================================================================
insert into ref.currency (code, name, symbol, minor_units, numeric3, created_by)
values
  ('AFN','Afghan Afghani','؋',2,'971','seed'),
  ('AMD','Armenian Dram','֏',2,'051','seed'),
  ('AZN','Azerbaijan Manat','₼',2,'944','seed'),
  ('BDT','Bangladeshi Taka','৳',2,'050','seed'),
  ('BND','Brunei Dollar','B$',2,'096','seed'),
  ('BTN','Bhutanese Ngultrum','Nu.',2,'064','seed'),
  ('FJD','Fiji Dollar','FJ$',2,'242','seed'),
  ('IDR','Indonesian Rupiah','Rp',2,'360','seed'),
  ('INR','Indian Rupee','₹',2,'356','seed'),
  ('KGS','Kyrgyzstani Som','сом',2,'417','seed'),
  ('KHR','Cambodian Riel','៛',2,'116','seed'),
  ('KPW','North Korean Won','₩',2,'408','seed'),
  ('KRW','South Korean Won','₩',0,'410','seed'),
  ('KZT','Kazakhstani Tenge','₸',2,'398','seed'),
  ('LAK','Lao Kip','₭',2,'418','seed'),
  ('LKR','Sri Lanka Rupee','Rs',2,'144','seed'),
  ('MMK','Myanmar Kyat','K',2,'104','seed'),
  ('MNT','Mongolian Tugrik','₮',2,'496','seed'),
  ('MOP','Macau Pataca','MOP$',2,'446','seed'),
  ('MVR','Maldivian Rufiyaa','Rf',2,'462','seed'),
  ('MYR','Malaysian Ringgit','RM',2,'458','seed'),
  ('NPR','Nepalese Rupee','Rs',2,'524','seed'),
  ('PGK','Papua New Guinean Kina','K',2,'598','seed'),
  ('PHP','Philippine Peso','₱',2,'608','seed'),
  ('PKR','Pakistan Rupee','Rs',2,'586','seed'),
  ('SBD','Solomon Islands Dollar','SI$',2,'090','seed'),
  ('THB','Thai Baht','฿',2,'764','seed'),
  ('TJS','Tajikistani Somoni','SM',2,'972','seed'),
  ('TMT','Turkmenistani Manat','T',2,'934','seed'),
  ('TOP','Tongan Paʻanga','T$',2,'776','seed'),
  ('TWD','New Taiwan Dollar','NT$',2,'901','seed'),
  ('UZS','Uzbekistani Som','сўм',2,'860','seed'),
  ('VND','Vietnamese Dong','₫',0,'704','seed'),
  ('VUV','Vanuatu Vatu','VT',0,'548','seed'),
  ('WST','Samoan Tala','WS$',2,'882','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Africa
-- ============================================================================
insert into ref.currency (code, name, symbol, minor_units, numeric3, created_by)
values
  ('AOA','Angolan Kwanza','Kz',2,'973','seed'),
  ('BIF','Burundian Franc','FBu',0,'108','seed'),
  ('BWP','Botswana Pula','P',2,'072','seed'),
  ('CDF','Congolese Franc','FC',2,'976','seed'),
  ('CVE','Cabo Verde Escudo','$',2,'132','seed'),
  ('DJF','Djibouti Franc','Fdj',0,'262','seed'),
  ('ERN','Eritrean Nakfa','Nfk',2,'232','seed'),
  ('ETB','Ethiopian Birr','Br',2,'230','seed'),
  ('GHS','Ghana Cedi','GH₵',2,'936','seed'),
  ('GMD','Gambian Dalasi','D',2,'270','seed'),
  ('GNF','Guinean Franc','FG',0,'324','seed'),
  ('KES','Kenyan Shilling','KSh',2,'404','seed'),
  ('KMF','Comorian Franc','CF',0,'174','seed'),
  ('LRD','Liberian Dollar','L$',2,'430','seed'),
  ('LSL','Lesotho Loti','L',2,'426','seed'),
  ('MGA','Malagasy Ariary','Ar',2,'969','seed'),
  ('MRU','Mauritanian Ouguiya','UM',2,'929','seed'),
  ('MUR','Mauritian Rupee','Rs',2,'480','seed'),
  ('MWK','Malawian Kwacha','MK',2,'454','seed'),
  ('MZN','Mozambican Metical','MT',2,'943','seed'),
  ('NAD','Namibia Dollar','N$',2,'516','seed'),
  ('NGN','Nigerian Naira','₦',2,'566','seed'),
  ('RWF','Rwanda Franc','RF',0,'646','seed'),
  ('SCR','Seychelles Rupee','Rs',2,'690','seed'),
  ('SLE','Sierra Leonean Leone','Le',2,'925','seed'),
  ('SOS','Somali Shilling','Sh',2,'706','seed'),
  ('SSP','South Sudanese Pound','£',2,'728','seed'),
  ('STN','São Tomé and Príncipe Dobra','Db',2,'930','seed'),
  ('SZL','Eswatini Lilangeni','E',2,'748','seed'),
  ('TZS','Tanzanian Shilling','TSh',2,'834','seed'),
  ('UGX','Uganda Shilling','USh',0,'800','seed'),
  ('ZAR','South African Rand','R',2,'710','seed'),
  ('ZMW','Zambian Kwacha','ZK',2,'967','seed'),
  ('ZWL','Zimbabwe Dollar','Z$',2,'932','seed')
on conflict (code) do nothing;

-- ============================================================================
-- CFA Franc Zones & Supranational
-- ============================================================================
insert into ref.currency (code, name, symbol, minor_units, numeric3, created_by)
values
  ('XAF','CFA Franc BEAC','FCFA',0,'950','seed'),
  ('XOF','CFA Franc BCEAO','CFA',0,'952','seed'),
  ('XCD','East Caribbean Dollar','EC$',2,'951','seed'),
  ('XPF','CFP Franc','₣',0,'953','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Americas (non-USD)
-- ============================================================================
insert into ref.currency (code, name, symbol, minor_units, numeric3, created_by)
values
  ('ARS','Argentine Peso','$',2,'032','seed'),
  ('BBD','Barbados Dollar','Bds$',2,'052','seed'),
  ('BMD','Bermudian Dollar','BD$',2,'060','seed'),
  ('BOB','Bolivian Boliviano','Bs.',2,'068','seed'),
  ('BRL','Brazilian Real','R$',2,'986','seed'),
  ('BSD','Bahamian Dollar','B$',2,'044','seed'),
  ('BZD','Belize Dollar','BZ$',2,'084','seed'),
  ('CLP','Chilean Peso','$',0,'152','seed'),
  ('COP','Colombian Peso','$',2,'170','seed'),
  ('CRC','Costa Rican Colon','₡',2,'188','seed'),
  ('CUP','Cuban Peso','$',2,'192','seed'),
  ('DOP','Dominican Peso','RD$',2,'214','seed'),
  ('GTQ','Guatemalan Quetzal','Q',2,'320','seed'),
  ('GYD','Guyana Dollar','GY$',2,'328','seed'),
  ('HNL','Honduran Lempira','L',2,'340','seed'),
  ('HTG','Haiti Gourde','G',2,'332','seed'),
  ('JMD','Jamaican Dollar','J$',2,'388','seed'),
  ('KYD','Cayman Islands Dollar','CI$',2,'136','seed'),
  ('MXN','Mexican Peso','Mex$',2,'484','seed'),
  ('NIO','Nicaraguan Cordoba Oro','C$',2,'558','seed'),
  ('PAB','Panamanian Balboa','B/.',2,'590','seed'),
  ('PEN','Peruvian Sol','S/.',2,'604','seed'),
  ('PYG','Paraguayan Guarani','₲',0,'600','seed'),
  ('SRD','Surinam Dollar','$',2,'968','seed'),
  ('TTD','Trinidad and Tobago Dollar','TT$',2,'780','seed'),
  ('UYU','Uruguayan Peso','$U',2,'858','seed'),
  ('VES','Venezuelan Bolívar Soberano','Bs.S',2,'928','seed'),
  ('AWG','Aruban Florin','ƒ',2,'533','seed'),
  ('ANG','Netherlands Antillean Guilder','ƒ',2,'532','seed')
on conflict (code) do nothing;

-- ============================================================================
-- Special / Precious Metals (valid ISO 4217)
-- ============================================================================
insert into ref.currency (code, name, symbol, minor_units, numeric3, status, created_by)
values
  ('XAU','Gold (troy ounce)',null,null,'959','active','seed'),
  ('XAG','Silver (troy ounce)',null,null,'961','active','seed'),
  ('XPT','Platinum (troy ounce)',null,null,'962','active','seed'),
  ('XPD','Palladium (troy ounce)',null,null,'964','active','seed'),
  ('XDR','Special Drawing Rights (SDR)',null,null,'960','active','seed')
on conflict (code) do nothing;
