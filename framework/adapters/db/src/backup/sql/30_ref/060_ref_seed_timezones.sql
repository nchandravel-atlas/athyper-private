/* ============================================================================
   Athyper — REF Seed: Time Zones (IANA tzdb)
   PostgreSQL 16+

   Comprehensive IANA time zone database entries.
   Canonical zones first, then aliases.
   Depends on: 010_ref_master_tables.sql
   ============================================================================ */

-- ============================================================================
-- Etc (must come first — referenced by aliases)
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Etc/GMT','GMT','+00:00',false,'seed'),
  ('Etc/UTC','UTC','+00:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Africa
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Africa/Abidjan','Africa / Abidjan','+00:00',false,'seed'),
  ('Africa/Accra','Africa / Accra','+00:00',false,'seed'),
  ('Africa/Addis_Ababa','Africa / Addis Ababa','+03:00',false,'seed'),
  ('Africa/Algiers','Africa / Algiers','+01:00',false,'seed'),
  ('Africa/Asmara','Africa / Asmara','+03:00',false,'seed'),
  ('Africa/Bamako','Africa / Bamako','+00:00',false,'seed'),
  ('Africa/Bangui','Africa / Bangui','+01:00',false,'seed'),
  ('Africa/Banjul','Africa / Banjul','+00:00',false,'seed'),
  ('Africa/Bissau','Africa / Bissau','+00:00',false,'seed'),
  ('Africa/Blantyre','Africa / Blantyre','+02:00',false,'seed'),
  ('Africa/Brazzaville','Africa / Brazzaville','+01:00',false,'seed'),
  ('Africa/Bujumbura','Africa / Bujumbura','+02:00',false,'seed'),
  ('Africa/Cairo','Africa / Cairo','+02:00',false,'seed'),
  ('Africa/Casablanca','Africa / Casablanca','+01:00',false,'seed'),
  ('Africa/Ceuta','Africa / Ceuta','+01:00',false,'seed'),
  ('Africa/Conakry','Africa / Conakry','+00:00',false,'seed'),
  ('Africa/Dakar','Africa / Dakar','+00:00',false,'seed'),
  ('Africa/Dar_es_Salaam','Africa / Dar es Salaam','+03:00',false,'seed'),
  ('Africa/Djibouti','Africa / Djibouti','+03:00',false,'seed'),
  ('Africa/Douala','Africa / Douala','+01:00',false,'seed'),
  ('Africa/El_Aaiun','Africa / El Aaiun','+01:00',false,'seed'),
  ('Africa/Freetown','Africa / Freetown','+00:00',false,'seed'),
  ('Africa/Gaborone','Africa / Gaborone','+02:00',false,'seed'),
  ('Africa/Harare','Africa / Harare','+02:00',false,'seed'),
  ('Africa/Johannesburg','Africa / Johannesburg','+02:00',false,'seed'),
  ('Africa/Juba','Africa / Juba','+02:00',false,'seed'),
  ('Africa/Kampala','Africa / Kampala','+03:00',false,'seed'),
  ('Africa/Khartoum','Africa / Khartoum','+02:00',false,'seed'),
  ('Africa/Kigali','Africa / Kigali','+02:00',false,'seed'),
  ('Africa/Kinshasa','Africa / Kinshasa','+01:00',false,'seed'),
  ('Africa/Lagos','Africa / Lagos','+01:00',false,'seed'),
  ('Africa/Libreville','Africa / Libreville','+01:00',false,'seed'),
  ('Africa/Lome','Africa / Lome','+00:00',false,'seed'),
  ('Africa/Luanda','Africa / Luanda','+01:00',false,'seed'),
  ('Africa/Lubumbashi','Africa / Lubumbashi','+02:00',false,'seed'),
  ('Africa/Lusaka','Africa / Lusaka','+02:00',false,'seed'),
  ('Africa/Malabo','Africa / Malabo','+01:00',false,'seed'),
  ('Africa/Maputo','Africa / Maputo','+02:00',false,'seed'),
  ('Africa/Maseru','Africa / Maseru','+02:00',false,'seed'),
  ('Africa/Mbabane','Africa / Mbabane','+02:00',false,'seed'),
  ('Africa/Mogadishu','Africa / Mogadishu','+03:00',false,'seed'),
  ('Africa/Monrovia','Africa / Monrovia','+00:00',false,'seed'),
  ('Africa/Nairobi','Africa / Nairobi','+03:00',false,'seed'),
  ('Africa/Ndjamena','Africa / Ndjamena','+01:00',false,'seed'),
  ('Africa/Niamey','Africa / Niamey','+01:00',false,'seed'),
  ('Africa/Nouakchott','Africa / Nouakchott','+00:00',false,'seed'),
  ('Africa/Ouagadougou','Africa / Ouagadougou','+00:00',false,'seed'),
  ('Africa/Porto-Novo','Africa / Porto-Novo','+01:00',false,'seed'),
  ('Africa/Sao_Tome','Africa / Sao Tome','+00:00',false,'seed'),
  ('Africa/Tripoli','Africa / Tripoli','+02:00',false,'seed'),
  ('Africa/Tunis','Africa / Tunis','+01:00',false,'seed'),
  ('Africa/Windhoek','Africa / Windhoek','+02:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- America
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('America/Adak','America / Adak','-10:00',false,'seed'),
  ('America/Anchorage','America / Anchorage','-09:00',false,'seed'),
  ('America/Anguilla','America / Anguilla','-04:00',false,'seed'),
  ('America/Antigua','America / Antigua','-04:00',false,'seed'),
  ('America/Araguaina','America / Araguaina','-03:00',false,'seed'),
  ('America/Argentina/Buenos_Aires','America / Buenos Aires','-03:00',false,'seed'),
  ('America/Argentina/Cordoba','America / Cordoba','-03:00',false,'seed'),
  ('America/Argentina/Salta','America / Salta','-03:00',false,'seed'),
  ('America/Aruba','America / Aruba','-04:00',false,'seed'),
  ('America/Asuncion','America / Asuncion','-04:00',false,'seed'),
  ('America/Atikokan','America / Atikokan','-05:00',false,'seed'),
  ('America/Bahia','America / Bahia','-03:00',false,'seed'),
  ('America/Barbados','America / Barbados','-04:00',false,'seed'),
  ('America/Belem','America / Belem','-03:00',false,'seed'),
  ('America/Belize','America / Belize','-06:00',false,'seed'),
  ('America/Bogota','America / Bogota','-05:00',false,'seed'),
  ('America/Boise','America / Boise','-07:00',false,'seed'),
  ('America/Cambridge_Bay','America / Cambridge Bay','-07:00',false,'seed'),
  ('America/Campo_Grande','America / Campo Grande','-04:00',false,'seed'),
  ('America/Cancun','America / Cancun','-05:00',false,'seed'),
  ('America/Caracas','America / Caracas','-04:00',false,'seed'),
  ('America/Cayenne','America / Cayenne','-03:00',false,'seed'),
  ('America/Cayman','America / Cayman','-05:00',false,'seed'),
  ('America/Chicago','America / Chicago','-06:00',false,'seed'),
  ('America/Chihuahua','America / Chihuahua','-06:00',false,'seed'),
  ('America/Costa_Rica','America / Costa Rica','-06:00',false,'seed'),
  ('America/Cuiaba','America / Cuiaba','-04:00',false,'seed'),
  ('America/Curacao','America / Curacao','-04:00',false,'seed'),
  ('America/Dawson','America / Dawson','-07:00',false,'seed'),
  ('America/Dawson_Creek','America / Dawson Creek','-07:00',false,'seed'),
  ('America/Denver','America / Denver','-07:00',false,'seed'),
  ('America/Detroit','America / Detroit','-05:00',false,'seed'),
  ('America/Dominica','America / Dominica','-04:00',false,'seed'),
  ('America/Edmonton','America / Edmonton','-07:00',false,'seed'),
  ('America/El_Salvador','America / El Salvador','-06:00',false,'seed'),
  ('America/Fortaleza','America / Fortaleza','-03:00',false,'seed'),
  ('America/Godthab','America / Nuuk','-03:00',false,'seed'),
  ('America/Grand_Turk','America / Grand Turk','-05:00',false,'seed'),
  ('America/Grenada','America / Grenada','-04:00',false,'seed'),
  ('America/Guadeloupe','America / Guadeloupe','-04:00',false,'seed'),
  ('America/Guatemala','America / Guatemala','-06:00',false,'seed'),
  ('America/Guayaquil','America / Guayaquil','-05:00',false,'seed'),
  ('America/Guyana','America / Guyana','-04:00',false,'seed'),
  ('America/Halifax','America / Halifax','-04:00',false,'seed'),
  ('America/Havana','America / Havana','-05:00',false,'seed'),
  ('America/Hermosillo','America / Hermosillo','-07:00',false,'seed'),
  ('America/Indiana/Indianapolis','America / Indianapolis','-05:00',false,'seed'),
  ('America/Iqaluit','America / Iqaluit','-05:00',false,'seed'),
  ('America/Jamaica','America / Jamaica','-05:00',false,'seed'),
  ('America/Juneau','America / Juneau','-09:00',false,'seed'),
  ('America/Kentucky/Louisville','America / Louisville','-05:00',false,'seed'),
  ('America/La_Paz','America / La Paz','-04:00',false,'seed'),
  ('America/Lima','America / Lima','-05:00',false,'seed'),
  ('America/Los_Angeles','America / Los Angeles','-08:00',false,'seed'),
  ('America/Managua','America / Managua','-06:00',false,'seed'),
  ('America/Manaus','America / Manaus','-04:00',false,'seed'),
  ('America/Martinique','America / Martinique','-04:00',false,'seed'),
  ('America/Mazatlan','America / Mazatlan','-07:00',false,'seed'),
  ('America/Mexico_City','America / Mexico City','-06:00',false,'seed'),
  ('America/Miquelon','America / Miquelon','-03:00',false,'seed'),
  ('America/Moncton','America / Moncton','-04:00',false,'seed'),
  ('America/Monterrey','America / Monterrey','-06:00',false,'seed'),
  ('America/Montevideo','America / Montevideo','-03:00',false,'seed'),
  ('America/Montserrat','America / Montserrat','-04:00',false,'seed'),
  ('America/Nassau','America / Nassau','-05:00',false,'seed'),
  ('America/New_York','America / New York','-05:00',false,'seed'),
  ('America/Nipigon','America / Nipigon','-05:00',false,'seed'),
  ('America/Nome','America / Nome','-09:00',false,'seed'),
  ('America/Noronha','America / Noronha','-02:00',false,'seed'),
  ('America/Panama','America / Panama','-05:00',false,'seed'),
  ('America/Paramaribo','America / Paramaribo','-03:00',false,'seed'),
  ('America/Phoenix','America / Phoenix','-07:00',false,'seed'),
  ('America/Port-au-Prince','America / Port-au-Prince','-05:00',false,'seed'),
  ('America/Port_of_Spain','America / Port of Spain','-04:00',false,'seed'),
  ('America/Puerto_Rico','America / Puerto Rico','-04:00',false,'seed'),
  ('America/Rankin_Inlet','America / Rankin Inlet','-06:00',false,'seed'),
  ('America/Recife','America / Recife','-03:00',false,'seed'),
  ('America/Regina','America / Regina','-06:00',false,'seed'),
  ('America/Rio_Branco','America / Rio Branco','-05:00',false,'seed'),
  ('America/Santiago','America / Santiago','-04:00',false,'seed'),
  ('America/Santo_Domingo','America / Santo Domingo','-04:00',false,'seed'),
  ('America/Sao_Paulo','America / Sao Paulo','-03:00',false,'seed'),
  ('America/St_Johns','America / St. John''s','-03:30',false,'seed'),
  ('America/St_Kitts','America / St. Kitts','-04:00',false,'seed'),
  ('America/St_Lucia','America / St. Lucia','-04:00',false,'seed'),
  ('America/St_Vincent','America / St. Vincent','-04:00',false,'seed'),
  ('America/Tegucigalpa','America / Tegucigalpa','-06:00',false,'seed'),
  ('America/Thule','America / Thule','-04:00',false,'seed'),
  ('America/Thunder_Bay','America / Thunder Bay','-05:00',false,'seed'),
  ('America/Tijuana','America / Tijuana','-08:00',false,'seed'),
  ('America/Toronto','America / Toronto','-05:00',false,'seed'),
  ('America/Tortola','America / Tortola','-04:00',false,'seed'),
  ('America/Vancouver','America / Vancouver','-08:00',false,'seed'),
  ('America/Whitehorse','America / Whitehorse','-07:00',false,'seed'),
  ('America/Winnipeg','America / Winnipeg','-06:00',false,'seed'),
  ('America/Yakutat','America / Yakutat','-09:00',false,'seed'),
  ('America/Yellowknife','America / Yellowknife','-07:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Antarctica
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Antarctica/Casey','Antarctica / Casey','+11:00',false,'seed'),
  ('Antarctica/Davis','Antarctica / Davis','+07:00',false,'seed'),
  ('Antarctica/DumontDUrville','Antarctica / Dumont d''Urville','+10:00',false,'seed'),
  ('Antarctica/Macquarie','Antarctica / Macquarie','+11:00',false,'seed'),
  ('Antarctica/Mawson','Antarctica / Mawson','+05:00',false,'seed'),
  ('Antarctica/McMurdo','Antarctica / McMurdo','+12:00',false,'seed'),
  ('Antarctica/Palmer','Antarctica / Palmer','-03:00',false,'seed'),
  ('Antarctica/Rothera','Antarctica / Rothera','-03:00',false,'seed'),
  ('Antarctica/Syowa','Antarctica / Syowa','+03:00',false,'seed'),
  ('Antarctica/Troll','Antarctica / Troll','+00:00',false,'seed'),
  ('Antarctica/Vostok','Antarctica / Vostok','+06:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Asia
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Asia/Aden','Asia / Aden','+03:00',false,'seed'),
  ('Asia/Almaty','Asia / Almaty','+06:00',false,'seed'),
  ('Asia/Amman','Asia / Amman','+03:00',false,'seed'),
  ('Asia/Anadyr','Asia / Anadyr','+12:00',false,'seed'),
  ('Asia/Aqtau','Asia / Aqtau','+05:00',false,'seed'),
  ('Asia/Aqtobe','Asia / Aqtobe','+05:00',false,'seed'),
  ('Asia/Ashgabat','Asia / Ashgabat','+05:00',false,'seed'),
  ('Asia/Atyrau','Asia / Atyrau','+05:00',false,'seed'),
  ('Asia/Baghdad','Asia / Baghdad','+03:00',false,'seed'),
  ('Asia/Bahrain','Asia / Bahrain','+03:00',false,'seed'),
  ('Asia/Baku','Asia / Baku','+04:00',false,'seed'),
  ('Asia/Bangkok','Asia / Bangkok','+07:00',false,'seed'),
  ('Asia/Barnaul','Asia / Barnaul','+07:00',false,'seed'),
  ('Asia/Beirut','Asia / Beirut','+02:00',false,'seed'),
  ('Asia/Bishkek','Asia / Bishkek','+06:00',false,'seed'),
  ('Asia/Brunei','Asia / Brunei','+08:00',false,'seed'),
  ('Asia/Chita','Asia / Chita','+09:00',false,'seed'),
  ('Asia/Choibalsan','Asia / Choibalsan','+08:00',false,'seed'),
  ('Asia/Colombo','Asia / Colombo','+05:30',false,'seed'),
  ('Asia/Damascus','Asia / Damascus','+03:00',false,'seed'),
  ('Asia/Dhaka','Asia / Dhaka','+06:00',false,'seed'),
  ('Asia/Dili','Asia / Dili','+09:00',false,'seed'),
  ('Asia/Dubai','Asia / Dubai','+04:00',false,'seed'),
  ('Asia/Dushanbe','Asia / Dushanbe','+05:00',false,'seed'),
  ('Asia/Famagusta','Asia / Famagusta','+02:00',false,'seed'),
  ('Asia/Gaza','Asia / Gaza','+02:00',false,'seed'),
  ('Asia/Hebron','Asia / Hebron','+02:00',false,'seed'),
  ('Asia/Ho_Chi_Minh','Asia / Ho Chi Minh','+07:00',false,'seed'),
  ('Asia/Hong_Kong','Asia / Hong Kong','+08:00',false,'seed'),
  ('Asia/Hovd','Asia / Hovd','+07:00',false,'seed'),
  ('Asia/Irkutsk','Asia / Irkutsk','+08:00',false,'seed'),
  ('Asia/Jakarta','Asia / Jakarta','+07:00',false,'seed'),
  ('Asia/Jayapura','Asia / Jayapura','+09:00',false,'seed'),
  ('Asia/Jerusalem','Asia / Jerusalem','+02:00',false,'seed'),
  ('Asia/Kabul','Asia / Kabul','+04:30',false,'seed'),
  ('Asia/Kamchatka','Asia / Kamchatka','+12:00',false,'seed'),
  ('Asia/Karachi','Asia / Karachi','+05:00',false,'seed'),
  ('Asia/Kathmandu','Asia / Kathmandu','+05:45',false,'seed'),
  ('Asia/Khandyga','Asia / Khandyga','+09:00',false,'seed'),
  ('Asia/Kolkata','Asia / Kolkata','+05:30',false,'seed'),
  ('Asia/Krasnoyarsk','Asia / Krasnoyarsk','+07:00',false,'seed'),
  ('Asia/Kuala_Lumpur','Asia / Kuala Lumpur','+08:00',false,'seed'),
  ('Asia/Kuching','Asia / Kuching','+08:00',false,'seed'),
  ('Asia/Kuwait','Asia / Kuwait','+03:00',false,'seed'),
  ('Asia/Macau','Asia / Macau','+08:00',false,'seed'),
  ('Asia/Magadan','Asia / Magadan','+11:00',false,'seed'),
  ('Asia/Makassar','Asia / Makassar','+08:00',false,'seed'),
  ('Asia/Manila','Asia / Manila','+08:00',false,'seed'),
  ('Asia/Muscat','Asia / Muscat','+04:00',false,'seed'),
  ('Asia/Nicosia','Asia / Nicosia','+02:00',false,'seed'),
  ('Asia/Novokuznetsk','Asia / Novokuznetsk','+07:00',false,'seed'),
  ('Asia/Novosibirsk','Asia / Novosibirsk','+07:00',false,'seed'),
  ('Asia/Omsk','Asia / Omsk','+06:00',false,'seed'),
  ('Asia/Oral','Asia / Oral','+05:00',false,'seed'),
  ('Asia/Phnom_Penh','Asia / Phnom Penh','+07:00',false,'seed'),
  ('Asia/Pontianak','Asia / Pontianak','+07:00',false,'seed'),
  ('Asia/Pyongyang','Asia / Pyongyang','+09:00',false,'seed'),
  ('Asia/Qatar','Asia / Qatar','+03:00',false,'seed'),
  ('Asia/Qostanay','Asia / Qostanay','+06:00',false,'seed'),
  ('Asia/Qyzylorda','Asia / Qyzylorda','+05:00',false,'seed'),
  ('Asia/Riyadh','Asia / Riyadh','+03:00',false,'seed'),
  ('Asia/Sakhalin','Asia / Sakhalin','+11:00',false,'seed'),
  ('Asia/Samarkand','Asia / Samarkand','+05:00',false,'seed'),
  ('Asia/Seoul','Asia / Seoul','+09:00',false,'seed'),
  ('Asia/Shanghai','Asia / Shanghai','+08:00',false,'seed'),
  ('Asia/Singapore','Asia / Singapore','+08:00',false,'seed'),
  ('Asia/Srednekolymsk','Asia / Srednekolymsk','+11:00',false,'seed'),
  ('Asia/Taipei','Asia / Taipei','+08:00',false,'seed'),
  ('Asia/Tashkent','Asia / Tashkent','+05:00',false,'seed'),
  ('Asia/Tbilisi','Asia / Tbilisi','+04:00',false,'seed'),
  ('Asia/Tehran','Asia / Tehran','+03:30',false,'seed'),
  ('Asia/Thimphu','Asia / Thimphu','+06:00',false,'seed'),
  ('Asia/Tokyo','Asia / Tokyo','+09:00',false,'seed'),
  ('Asia/Tomsk','Asia / Tomsk','+07:00',false,'seed'),
  ('Asia/Ulaanbaatar','Asia / Ulaanbaatar','+08:00',false,'seed'),
  ('Asia/Urumqi','Asia / Urumqi','+06:00',false,'seed'),
  ('Asia/Ust-Nera','Asia / Ust-Nera','+10:00',false,'seed'),
  ('Asia/Vientiane','Asia / Vientiane','+07:00',false,'seed'),
  ('Asia/Vladivostok','Asia / Vladivostok','+10:00',false,'seed'),
  ('Asia/Yakutsk','Asia / Yakutsk','+09:00',false,'seed'),
  ('Asia/Yangon','Asia / Yangon','+06:30',false,'seed'),
  ('Asia/Yekaterinburg','Asia / Yekaterinburg','+05:00',false,'seed'),
  ('Asia/Yerevan','Asia / Yerevan','+04:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Atlantic
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Atlantic/Azores','Atlantic / Azores','-01:00',false,'seed'),
  ('Atlantic/Bermuda','Atlantic / Bermuda','-04:00',false,'seed'),
  ('Atlantic/Canary','Atlantic / Canary','+00:00',false,'seed'),
  ('Atlantic/Cape_Verde','Atlantic / Cape Verde','-01:00',false,'seed'),
  ('Atlantic/Faroe','Atlantic / Faroe','+00:00',false,'seed'),
  ('Atlantic/Madeira','Atlantic / Madeira','+00:00',false,'seed'),
  ('Atlantic/Reykjavik','Atlantic / Reykjavik','+00:00',false,'seed'),
  ('Atlantic/South_Georgia','Atlantic / South Georgia','-02:00',false,'seed'),
  ('Atlantic/St_Helena','Atlantic / St. Helena','+00:00',false,'seed'),
  ('Atlantic/Stanley','Atlantic / Stanley','-03:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Australia
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Australia/Adelaide','Australia / Adelaide','+09:30',false,'seed'),
  ('Australia/Brisbane','Australia / Brisbane','+10:00',false,'seed'),
  ('Australia/Broken_Hill','Australia / Broken Hill','+09:30',false,'seed'),
  ('Australia/Darwin','Australia / Darwin','+09:30',false,'seed'),
  ('Australia/Eucla','Australia / Eucla','+08:45',false,'seed'),
  ('Australia/Hobart','Australia / Hobart','+10:00',false,'seed'),
  ('Australia/Lindeman','Australia / Lindeman','+10:00',false,'seed'),
  ('Australia/Lord_Howe','Australia / Lord Howe','+10:30',false,'seed'),
  ('Australia/Melbourne','Australia / Melbourne','+10:00',false,'seed'),
  ('Australia/Perth','Australia / Perth','+08:00',false,'seed'),
  ('Australia/Sydney','Australia / Sydney','+10:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Europe
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Europe/Amsterdam','Europe / Amsterdam','+01:00',false,'seed'),
  ('Europe/Andorra','Europe / Andorra','+01:00',false,'seed'),
  ('Europe/Astrakhan','Europe / Astrakhan','+04:00',false,'seed'),
  ('Europe/Athens','Europe / Athens','+02:00',false,'seed'),
  ('Europe/Belgrade','Europe / Belgrade','+01:00',false,'seed'),
  ('Europe/Berlin','Europe / Berlin','+01:00',false,'seed'),
  ('Europe/Bratislava','Europe / Bratislava','+01:00',false,'seed'),
  ('Europe/Brussels','Europe / Brussels','+01:00',false,'seed'),
  ('Europe/Bucharest','Europe / Bucharest','+02:00',false,'seed'),
  ('Europe/Budapest','Europe / Budapest','+01:00',false,'seed'),
  ('Europe/Busingen','Europe / Busingen','+01:00',false,'seed'),
  ('Europe/Chisinau','Europe / Chisinau','+02:00',false,'seed'),
  ('Europe/Copenhagen','Europe / Copenhagen','+01:00',false,'seed'),
  ('Europe/Dublin','Europe / Dublin','+01:00',false,'seed'),
  ('Europe/Gibraltar','Europe / Gibraltar','+01:00',false,'seed'),
  ('Europe/Guernsey','Europe / Guernsey','+00:00',false,'seed'),
  ('Europe/Helsinki','Europe / Helsinki','+02:00',false,'seed'),
  ('Europe/Isle_of_Man','Europe / Isle of Man','+00:00',false,'seed'),
  ('Europe/Istanbul','Europe / Istanbul','+03:00',false,'seed'),
  ('Europe/Jersey','Europe / Jersey','+00:00',false,'seed'),
  ('Europe/Kaliningrad','Europe / Kaliningrad','+02:00',false,'seed'),
  ('Europe/Kiev','Europe / Kyiv','+02:00',false,'seed'),
  ('Europe/Kirov','Europe / Kirov','+03:00',false,'seed'),
  ('Europe/Lisbon','Europe / Lisbon','+00:00',false,'seed'),
  ('Europe/Ljubljana','Europe / Ljubljana','+01:00',false,'seed'),
  ('Europe/London','Europe / London','+00:00',false,'seed'),
  ('Europe/Luxembourg','Europe / Luxembourg','+01:00',false,'seed'),
  ('Europe/Madrid','Europe / Madrid','+01:00',false,'seed'),
  ('Europe/Malta','Europe / Malta','+01:00',false,'seed'),
  ('Europe/Mariehamn','Europe / Mariehamn','+02:00',false,'seed'),
  ('Europe/Minsk','Europe / Minsk','+03:00',false,'seed'),
  ('Europe/Monaco','Europe / Monaco','+01:00',false,'seed'),
  ('Europe/Moscow','Europe / Moscow','+03:00',false,'seed'),
  ('Europe/Oslo','Europe / Oslo','+01:00',false,'seed'),
  ('Europe/Paris','Europe / Paris','+01:00',false,'seed'),
  ('Europe/Podgorica','Europe / Podgorica','+01:00',false,'seed'),
  ('Europe/Prague','Europe / Prague','+01:00',false,'seed'),
  ('Europe/Riga','Europe / Riga','+02:00',false,'seed'),
  ('Europe/Rome','Europe / Rome','+01:00',false,'seed'),
  ('Europe/Samara','Europe / Samara','+04:00',false,'seed'),
  ('Europe/San_Marino','Europe / San Marino','+01:00',false,'seed'),
  ('Europe/Sarajevo','Europe / Sarajevo','+01:00',false,'seed'),
  ('Europe/Saratov','Europe / Saratov','+04:00',false,'seed'),
  ('Europe/Simferopol','Europe / Simferopol','+03:00',false,'seed'),
  ('Europe/Skopje','Europe / Skopje','+01:00',false,'seed'),
  ('Europe/Sofia','Europe / Sofia','+02:00',false,'seed'),
  ('Europe/Stockholm','Europe / Stockholm','+01:00',false,'seed'),
  ('Europe/Tallinn','Europe / Tallinn','+02:00',false,'seed'),
  ('Europe/Tirane','Europe / Tirane','+01:00',false,'seed'),
  ('Europe/Ulyanovsk','Europe / Ulyanovsk','+04:00',false,'seed'),
  ('Europe/Vaduz','Europe / Vaduz','+01:00',false,'seed'),
  ('Europe/Vatican','Europe / Vatican','+01:00',false,'seed'),
  ('Europe/Vienna','Europe / Vienna','+01:00',false,'seed'),
  ('Europe/Vilnius','Europe / Vilnius','+02:00',false,'seed'),
  ('Europe/Volgograd','Europe / Volgograd','+03:00',false,'seed'),
  ('Europe/Warsaw','Europe / Warsaw','+01:00',false,'seed'),
  ('Europe/Zagreb','Europe / Zagreb','+01:00',false,'seed'),
  ('Europe/Zurich','Europe / Zurich','+01:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Indian
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Indian/Antananarivo','Indian / Antananarivo','+03:00',false,'seed'),
  ('Indian/Chagos','Indian / Chagos','+06:00',false,'seed'),
  ('Indian/Christmas','Indian / Christmas','+07:00',false,'seed'),
  ('Indian/Cocos','Indian / Cocos','+06:30',false,'seed'),
  ('Indian/Comoro','Indian / Comoro','+03:00',false,'seed'),
  ('Indian/Kerguelen','Indian / Kerguelen','+05:00',false,'seed'),
  ('Indian/Mahe','Indian / Mahe','+04:00',false,'seed'),
  ('Indian/Maldives','Indian / Maldives','+05:00',false,'seed'),
  ('Indian/Mauritius','Indian / Mauritius','+04:00',false,'seed'),
  ('Indian/Mayotte','Indian / Mayotte','+03:00',false,'seed'),
  ('Indian/Reunion','Indian / Reunion','+04:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Pacific
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, created_by)
values
  ('Pacific/Apia','Pacific / Apia','+13:00',false,'seed'),
  ('Pacific/Auckland','Pacific / Auckland','+12:00',false,'seed'),
  ('Pacific/Bougainville','Pacific / Bougainville','+11:00',false,'seed'),
  ('Pacific/Chatham','Pacific / Chatham','+12:45',false,'seed'),
  ('Pacific/Chuuk','Pacific / Chuuk','+10:00',false,'seed'),
  ('Pacific/Easter','Pacific / Easter','-06:00',false,'seed'),
  ('Pacific/Efate','Pacific / Efate','+11:00',false,'seed'),
  ('Pacific/Fakaofo','Pacific / Fakaofo','+13:00',false,'seed'),
  ('Pacific/Fiji','Pacific / Fiji','+12:00',false,'seed'),
  ('Pacific/Funafuti','Pacific / Funafuti','+12:00',false,'seed'),
  ('Pacific/Galapagos','Pacific / Galapagos','-06:00',false,'seed'),
  ('Pacific/Gambier','Pacific / Gambier','-09:00',false,'seed'),
  ('Pacific/Guadalcanal','Pacific / Guadalcanal','+11:00',false,'seed'),
  ('Pacific/Guam','Pacific / Guam','+10:00',false,'seed'),
  ('Pacific/Honolulu','Pacific / Honolulu','-10:00',false,'seed'),
  ('Pacific/Kanton','Pacific / Kanton','+13:00',false,'seed'),
  ('Pacific/Kiritimati','Pacific / Kiritimati','+14:00',false,'seed'),
  ('Pacific/Kosrae','Pacific / Kosrae','+11:00',false,'seed'),
  ('Pacific/Kwajalein','Pacific / Kwajalein','+12:00',false,'seed'),
  ('Pacific/Majuro','Pacific / Majuro','+12:00',false,'seed'),
  ('Pacific/Marquesas','Pacific / Marquesas','-09:30',false,'seed'),
  ('Pacific/Midway','Pacific / Midway','-11:00',false,'seed'),
  ('Pacific/Nauru','Pacific / Nauru','+12:00',false,'seed'),
  ('Pacific/Niue','Pacific / Niue','-11:00',false,'seed'),
  ('Pacific/Norfolk','Pacific / Norfolk','+11:00',false,'seed'),
  ('Pacific/Noumea','Pacific / Noumea','+11:00',false,'seed'),
  ('Pacific/Pago_Pago','Pacific / Pago Pago','-11:00',false,'seed'),
  ('Pacific/Palau','Pacific / Palau','+09:00',false,'seed'),
  ('Pacific/Pitcairn','Pacific / Pitcairn','-08:00',false,'seed'),
  ('Pacific/Pohnpei','Pacific / Pohnpei','+11:00',false,'seed'),
  ('Pacific/Port_Moresby','Pacific / Port Moresby','+10:00',false,'seed'),
  ('Pacific/Rarotonga','Pacific / Rarotonga','-10:00',false,'seed'),
  ('Pacific/Tahiti','Pacific / Tahiti','-10:00',false,'seed'),
  ('Pacific/Tarawa','Pacific / Tarawa','+12:00',false,'seed'),
  ('Pacific/Tongatapu','Pacific / Tongatapu','+13:00',false,'seed'),
  ('Pacific/Wake','Pacific / Wake','+12:00',false,'seed'),
  ('Pacific/Wallis','Pacific / Wallis','+12:00',false,'seed')
on conflict (tzid) do nothing;

-- ============================================================================
-- Aliases (legacy names → canonical)
-- ============================================================================
insert into ref.timezone (tzid, display_name, utc_offset, is_alias, canonical_tzid, created_by)
values
  ('GMT','GMT','+00:00',true,'Etc/GMT','seed'),
  ('UTC','UTC','+00:00',true,'Etc/UTC','seed'),
  ('US/Eastern','US / Eastern','-05:00',true,'America/New_York','seed'),
  ('US/Central','US / Central','-06:00',true,'America/Chicago','seed'),
  ('US/Mountain','US / Mountain','-07:00',true,'America/Denver','seed'),
  ('US/Pacific','US / Pacific','-08:00',true,'America/Los_Angeles','seed'),
  ('US/Alaska','US / Alaska','-09:00',true,'America/Anchorage','seed'),
  ('US/Hawaii','US / Hawaii','-10:00',true,'America/Adak','seed'),
  ('US/Arizona','US / Arizona','-07:00',true,'America/Phoenix','seed'),
  ('Canada/Atlantic','Canada / Atlantic','-04:00',true,'America/Halifax','seed'),
  ('Canada/Central','Canada / Central','-06:00',true,'America/Winnipeg','seed'),
  ('Canada/Eastern','Canada / Eastern','-05:00',true,'America/Toronto','seed'),
  ('Canada/Mountain','Canada / Mountain','-07:00',true,'America/Edmonton','seed'),
  ('Canada/Newfoundland','Canada / Newfoundland','-03:30',true,'America/St_Johns','seed'),
  ('Canada/Pacific','Canada / Pacific','-08:00',true,'America/Vancouver','seed'),
  ('Australia/ACT','Australia / ACT','+10:00',true,'Australia/Sydney','seed'),
  ('Australia/North','Australia / North','+09:30',true,'Australia/Darwin','seed'),
  ('Australia/Queensland','Australia / Queensland','+10:00',true,'Australia/Brisbane','seed'),
  ('Australia/South','Australia / South','+09:30',true,'Australia/Adelaide','seed'),
  ('Australia/West','Australia / West','+08:00',true,'Australia/Perth','seed')
on conflict (tzid) do nothing;
