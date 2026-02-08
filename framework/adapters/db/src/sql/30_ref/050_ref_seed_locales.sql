/* ============================================================================
   Athyper — REF Seed: Locales (BCP 47)
   PostgreSQL 16+

   Curated set of BCP 47 locale tags linking language + optional country.
   Covers major business locales worldwide.
   Depends on: 040_ref_seed_languages.sql, 020_ref_seed_countries.sql
   ============================================================================ */

-- ----------------------------------------------------------------------------
-- Language-only locales (no country qualifier)
-- ----------------------------------------------------------------------------
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  -- Major world languages (base locales)
  ('af',    'af', null, 'Latn', 'Afrikaans',              null, 'seed'),
  ('am',    'am', null, 'Ethi', 'Amharic',                null, 'seed'),
  ('ar',    'ar', null, 'Arab', 'Arabic',                  'rtl', 'seed'),
  ('az',    'az', null, 'Latn', 'Azerbaijani',             null, 'seed'),
  ('be',    'be', null, 'Cyrl', 'Belarusian',              null, 'seed'),
  ('bg',    'bg', null, 'Cyrl', 'Bulgarian',               null, 'seed'),
  ('bn',    'bn', null, 'Beng', 'Bengali',                 null, 'seed'),
  ('bs',    'bs', null, 'Latn', 'Bosnian',                 null, 'seed'),
  ('ca',    'ca', null, 'Latn', 'Catalan',                 null, 'seed'),
  ('cs',    'cs', null, 'Latn', 'Czech',                   null, 'seed'),
  ('cy',    'cy', null, 'Latn', 'Welsh',                   null, 'seed'),
  ('da',    'da', null, 'Latn', 'Danish',                  null, 'seed'),
  ('de',    'de', null, 'Latn', 'German',                  null, 'seed'),
  ('el',    'el', null, 'Grek', 'Greek',                   null, 'seed'),
  ('en',    'en', null, 'Latn', 'English',                 null, 'seed'),
  ('es',    'es', null, 'Latn', 'Spanish',                 null, 'seed'),
  ('et',    'et', null, 'Latn', 'Estonian',                null, 'seed'),
  ('eu',    'eu', null, 'Latn', 'Basque',                  null, 'seed'),
  ('fa',    'fa', null, 'Arab', 'Persian',                 'rtl', 'seed'),
  ('fi',    'fi', null, 'Latn', 'Finnish',                 null, 'seed'),
  ('fr',    'fr', null, 'Latn', 'French',                  null, 'seed'),
  ('ga',    'ga', null, 'Latn', 'Irish',                   null, 'seed'),
  ('gl',    'gl', null, 'Latn', 'Galician',                null, 'seed'),
  ('gu',    'gu', null, 'Gujr', 'Gujarati',                null, 'seed'),
  ('he',    'he', null, 'Hebr', 'Hebrew',                  'rtl', 'seed'),
  ('hi',    'hi', null, 'Deva', 'Hindi',                   null, 'seed'),
  ('hr',    'hr', null, 'Latn', 'Croatian',                null, 'seed'),
  ('hu',    'hu', null, 'Latn', 'Hungarian',               null, 'seed'),
  ('hy',    'hy', null, 'Armn', 'Armenian',                null, 'seed'),
  ('id',    'id', null, 'Latn', 'Indonesian',              null, 'seed'),
  ('is',    'is', null, 'Latn', 'Icelandic',               null, 'seed'),
  ('it',    'it', null, 'Latn', 'Italian',                 null, 'seed'),
  ('ja',    'ja', null, 'Jpan', 'Japanese',                null, 'seed'),
  ('ka',    'ka', null, 'Geor', 'Georgian',                null, 'seed'),
  ('kk',    'kk', null, 'Cyrl', 'Kazakh',                  null, 'seed'),
  ('km',    'km', null, 'Khmr', 'Khmer',                   null, 'seed'),
  ('kn',    'kn', null, 'Knda', 'Kannada',                 null, 'seed'),
  ('ko',    'ko', null, 'Kore', 'Korean',                  null, 'seed'),
  ('lo',    'lo', null, 'Laoo', 'Lao',                     null, 'seed'),
  ('lt',    'lt', null, 'Latn', 'Lithuanian',              null, 'seed'),
  ('lv',    'lv', null, 'Latn', 'Latvian',                 null, 'seed'),
  ('mk',    'mk', null, 'Cyrl', 'Macedonian',              null, 'seed'),
  ('ml',    'ml', null, 'Mlym', 'Malayalam',               null, 'seed'),
  ('mn',    'mn', null, 'Cyrl', 'Mongolian',               null, 'seed'),
  ('mr',    'mr', null, 'Deva', 'Marathi',                 null, 'seed'),
  ('ms',    'ms', null, 'Latn', 'Malay',                   null, 'seed'),
  ('mt',    'mt', null, 'Latn', 'Maltese',                 null, 'seed'),
  ('my',    'my', null, 'Mymr', 'Burmese',                 null, 'seed'),
  ('nb',    'nb', null, 'Latn', 'Norwegian Bokmål',       null, 'seed'),
  ('ne',    'ne', null, 'Deva', 'Nepali',                  null, 'seed'),
  ('nl',    'nl', null, 'Latn', 'Dutch',                   null, 'seed'),
  ('nn',    'nn', null, 'Latn', 'Norwegian Nynorsk',       null, 'seed'),
  ('pa',    'pa', null, 'Guru', 'Punjabi',                 null, 'seed'),
  ('pl',    'pl', null, 'Latn', 'Polish',                  null, 'seed'),
  ('ps',    'ps', null, 'Arab', 'Pashto',                  'rtl', 'seed'),
  ('pt',    'pt', null, 'Latn', 'Portuguese',              null, 'seed'),
  ('ro',    'ro', null, 'Latn', 'Romanian',                null, 'seed'),
  ('ru',    'ru', null, 'Cyrl', 'Russian',                 null, 'seed'),
  ('si',    'si', null, 'Sinh', 'Sinhala',                 null, 'seed'),
  ('sk',    'sk', null, 'Latn', 'Slovak',                  null, 'seed'),
  ('sl',    'sl', null, 'Latn', 'Slovenian',               null, 'seed'),
  ('so',    'so', null, 'Latn', 'Somali',                  null, 'seed'),
  ('sq',    'sq', null, 'Latn', 'Albanian',                null, 'seed'),
  ('sr',    'sr', null, 'Cyrl', 'Serbian',                 null, 'seed'),
  ('sv',    'sv', null, 'Latn', 'Swedish',                 null, 'seed'),
  ('sw',    'sw', null, 'Latn', 'Swahili',                 null, 'seed'),
  ('ta',    'ta', null, 'Taml', 'Tamil',                   null, 'seed'),
  ('te',    'te', null, 'Telu', 'Telugu',                  null, 'seed'),
  ('th',    'th', null, 'Thai', 'Thai',                    null, 'seed'),
  ('tl',    'tl', null, 'Latn', 'Filipino',                null, 'seed'),
  ('tr',    'tr', null, 'Latn', 'Turkish',                 null, 'seed'),
  ('uk',    'uk', null, 'Cyrl', 'Ukrainian',               null, 'seed'),
  ('ur',    'ur', null, 'Arab', 'Urdu',                    'rtl', 'seed'),
  ('uz',    'uz', null, 'Latn', 'Uzbek',                   null, 'seed'),
  ('vi',    'vi', null, 'Latn', 'Vietnamese',              null, 'seed'),
  ('zh',    'zh', null, 'Hans', 'Chinese',                 null, 'seed'),
  ('zu',    'zu', null, 'Latn', 'Zulu',                    null, 'seed')
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- Country-qualified locales (language-COUNTRY)
-- ----------------------------------------------------------------------------

-- Arabic variants
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  ('ar-SA', 'ar', 'SA', 'Arab', 'Arabic (Saudi Arabia)',            'rtl', 'seed'),
  ('ar-AE', 'ar', 'AE', 'Arab', 'Arabic (United Arab Emirates)',    'rtl', 'seed'),
  ('ar-BH', 'ar', 'BH', 'Arab', 'Arabic (Bahrain)',                 'rtl', 'seed'),
  ('ar-DZ', 'ar', 'DZ', 'Arab', 'Arabic (Algeria)',                 'rtl', 'seed'),
  ('ar-EG', 'ar', 'EG', 'Arab', 'Arabic (Egypt)',                   'rtl', 'seed'),
  ('ar-IQ', 'ar', 'IQ', 'Arab', 'Arabic (Iraq)',                    'rtl', 'seed'),
  ('ar-JO', 'ar', 'JO', 'Arab', 'Arabic (Jordan)',                  'rtl', 'seed'),
  ('ar-KW', 'ar', 'KW', 'Arab', 'Arabic (Kuwait)',                  'rtl', 'seed'),
  ('ar-LB', 'ar', 'LB', 'Arab', 'Arabic (Lebanon)',                 'rtl', 'seed'),
  ('ar-LY', 'ar', 'LY', 'Arab', 'Arabic (Libya)',                   'rtl', 'seed'),
  ('ar-MA', 'ar', 'MA', 'Arab', 'Arabic (Morocco)',                 'rtl', 'seed'),
  ('ar-OM', 'ar', 'OM', 'Arab', 'Arabic (Oman)',                    'rtl', 'seed'),
  ('ar-QA', 'ar', 'QA', 'Arab', 'Arabic (Qatar)',                   'rtl', 'seed'),
  ('ar-SD', 'ar', 'SD', 'Arab', 'Arabic (Sudan)',                   'rtl', 'seed'),
  ('ar-SY', 'ar', 'SY', 'Arab', 'Arabic (Syria)',                   'rtl', 'seed'),
  ('ar-TN', 'ar', 'TN', 'Arab', 'Arabic (Tunisia)',                 'rtl', 'seed'),
  ('ar-YE', 'ar', 'YE', 'Arab', 'Arabic (Yemen)',                   'rtl', 'seed')
on conflict (code) do nothing;

-- English variants
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  ('en-US', 'en', 'US', 'Latn', 'English (United States)',          null, 'seed'),
  ('en-GB', 'en', 'GB', 'Latn', 'English (United Kingdom)',         null, 'seed'),
  ('en-AU', 'en', 'AU', 'Latn', 'English (Australia)',              null, 'seed'),
  ('en-CA', 'en', 'CA', 'Latn', 'English (Canada)',                 null, 'seed'),
  ('en-IE', 'en', 'IE', 'Latn', 'English (Ireland)',                null, 'seed'),
  ('en-IN', 'en', 'IN', 'Latn', 'English (India)',                  null, 'seed'),
  ('en-NZ', 'en', 'NZ', 'Latn', 'English (New Zealand)',            null, 'seed'),
  ('en-PH', 'en', 'PH', 'Latn', 'English (Philippines)',            null, 'seed'),
  ('en-SG', 'en', 'SG', 'Latn', 'English (Singapore)',              null, 'seed'),
  ('en-ZA', 'en', 'ZA', 'Latn', 'English (South Africa)',           null, 'seed'),
  ('en-HK', 'en', 'HK', 'Latn', 'English (Hong Kong)',              null, 'seed'),
  ('en-KE', 'en', 'KE', 'Latn', 'English (Kenya)',                  null, 'seed'),
  ('en-NG', 'en', 'NG', 'Latn', 'English (Nigeria)',                null, 'seed')
on conflict (code) do nothing;

-- Spanish variants
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  ('es-ES', 'es', 'ES', 'Latn', 'Spanish (Spain)',                  null, 'seed'),
  ('es-MX', 'es', 'MX', 'Latn', 'Spanish (Mexico)',                 null, 'seed'),
  ('es-AR', 'es', 'AR', 'Latn', 'Spanish (Argentina)',              null, 'seed'),
  ('es-CL', 'es', 'CL', 'Latn', 'Spanish (Chile)',                  null, 'seed'),
  ('es-CO', 'es', 'CO', 'Latn', 'Spanish (Colombia)',               null, 'seed'),
  ('es-PE', 'es', 'PE', 'Latn', 'Spanish (Peru)',                   null, 'seed'),
  ('es-VE', 'es', 'VE', 'Latn', 'Spanish (Venezuela)',              null, 'seed'),
  ('es-EC', 'es', 'EC', 'Latn', 'Spanish (Ecuador)',                null, 'seed'),
  ('es-UY', 'es', 'UY', 'Latn', 'Spanish (Uruguay)',                null, 'seed'),
  ('es-CR', 'es', 'CR', 'Latn', 'Spanish (Costa Rica)',             null, 'seed')
on conflict (code) do nothing;

-- French variants
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  ('fr-FR', 'fr', 'FR', 'Latn', 'French (France)',                  null, 'seed'),
  ('fr-BE', 'fr', 'BE', 'Latn', 'French (Belgium)',                 null, 'seed'),
  ('fr-CA', 'fr', 'CA', 'Latn', 'French (Canada)',                  null, 'seed'),
  ('fr-CH', 'fr', 'CH', 'Latn', 'French (Switzerland)',             null, 'seed'),
  ('fr-LU', 'fr', 'LU', 'Latn', 'French (Luxembourg)',              null, 'seed'),
  ('fr-SN', 'fr', 'SN', 'Latn', 'French (Senegal)',                 null, 'seed'),
  ('fr-CI', 'fr', 'CI', 'Latn', 'French (Côte d''Ivoire)',         null, 'seed'),
  ('fr-CM', 'fr', 'CM', 'Latn', 'French (Cameroon)',                null, 'seed'),
  ('fr-MA', 'fr', 'MA', 'Latn', 'French (Morocco)',                 null, 'seed'),
  ('fr-TN', 'fr', 'TN', 'Latn', 'French (Tunisia)',                 null, 'seed')
on conflict (code) do nothing;

-- German variants
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  ('de-DE', 'de', 'DE', 'Latn', 'German (Germany)',                 null, 'seed'),
  ('de-AT', 'de', 'AT', 'Latn', 'German (Austria)',                 null, 'seed'),
  ('de-CH', 'de', 'CH', 'Latn', 'German (Switzerland)',             null, 'seed'),
  ('de-LU', 'de', 'LU', 'Latn', 'German (Luxembourg)',              null, 'seed'),
  ('de-LI', 'de', 'LI', 'Latn', 'German (Liechtenstein)',           null, 'seed')
on conflict (code) do nothing;

-- Portuguese variants
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  ('pt-BR', 'pt', 'BR', 'Latn', 'Portuguese (Brazil)',              null, 'seed'),
  ('pt-PT', 'pt', 'PT', 'Latn', 'Portuguese (Portugal)',            null, 'seed'),
  ('pt-AO', 'pt', 'AO', 'Latn', 'Portuguese (Angola)',              null, 'seed'),
  ('pt-MZ', 'pt', 'MZ', 'Latn', 'Portuguese (Mozambique)',          null, 'seed')
on conflict (code) do nothing;

-- Chinese variants
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  ('zh-CN', 'zh', 'CN', 'Hans', 'Chinese (Simplified, China)',      null, 'seed'),
  ('zh-TW', 'zh', 'TW', 'Hant', 'Chinese (Traditional, Taiwan)',    null, 'seed'),
  ('zh-HK', 'zh', 'HK', 'Hant', 'Chinese (Traditional, Hong Kong)', null, 'seed'),
  ('zh-SG', 'zh', 'SG', 'Hans', 'Chinese (Simplified, Singapore)',  null, 'seed')
on conflict (code) do nothing;

-- Other major country-qualified locales
insert into ref.locale (code, language_code, country_code2, script, name, direction, created_by)
values
  -- South Asia
  ('hi-IN', 'hi', 'IN', 'Deva', 'Hindi (India)',                    null, 'seed'),
  ('bn-BD', 'bn', 'BD', 'Beng', 'Bengali (Bangladesh)',             null, 'seed'),
  ('bn-IN', 'bn', 'IN', 'Beng', 'Bengali (India)',                  null, 'seed'),
  ('ta-IN', 'ta', 'IN', 'Taml', 'Tamil (India)',                    null, 'seed'),
  ('ta-LK', 'ta', 'LK', 'Taml', 'Tamil (Sri Lanka)',               null, 'seed'),
  ('te-IN', 'te', 'IN', 'Telu', 'Telugu (India)',                   null, 'seed'),
  ('ml-IN', 'ml', 'IN', 'Mlym', 'Malayalam (India)',                null, 'seed'),
  ('kn-IN', 'kn', 'IN', 'Knda', 'Kannada (India)',                 null, 'seed'),
  ('gu-IN', 'gu', 'IN', 'Gujr', 'Gujarati (India)',                null, 'seed'),
  ('mr-IN', 'mr', 'IN', 'Deva', 'Marathi (India)',                 null, 'seed'),
  ('pa-IN', 'pa', 'IN', 'Guru', 'Punjabi (India)',                 null, 'seed'),
  ('ur-PK', 'ur', 'PK', 'Arab', 'Urdu (Pakistan)',                  'rtl', 'seed'),
  ('ur-IN', 'ur', 'IN', 'Arab', 'Urdu (India)',                     'rtl', 'seed'),
  ('si-LK', 'si', 'LK', 'Sinh', 'Sinhala (Sri Lanka)',             null, 'seed'),
  ('ne-NP', 'ne', 'NP', 'Deva', 'Nepali (Nepal)',                  null, 'seed'),

  -- East/Southeast Asia
  ('ja-JP', 'ja', 'JP', 'Jpan', 'Japanese (Japan)',                 null, 'seed'),
  ('ko-KR', 'ko', 'KR', 'Kore', 'Korean (South Korea)',            null, 'seed'),
  ('th-TH', 'th', 'TH', 'Thai', 'Thai (Thailand)',                 null, 'seed'),
  ('vi-VN', 'vi', 'VN', 'Latn', 'Vietnamese (Vietnam)',            null, 'seed'),
  ('id-ID', 'id', 'ID', 'Latn', 'Indonesian (Indonesia)',          null, 'seed'),
  ('ms-MY', 'ms', 'MY', 'Latn', 'Malay (Malaysia)',                null, 'seed'),
  ('ms-SG', 'ms', 'SG', 'Latn', 'Malay (Singapore)',               null, 'seed'),
  ('tl-PH', 'tl', 'PH', 'Latn', 'Filipino (Philippines)',          null, 'seed'),
  ('my-MM', 'my', 'MM', 'Mymr', 'Burmese (Myanmar)',               null, 'seed'),
  ('km-KH', 'km', 'KH', 'Khmr', 'Khmer (Cambodia)',               null, 'seed'),
  ('lo-LA', 'lo', 'LA', 'Laoo', 'Lao (Laos)',                     null, 'seed'),
  ('mn-MN', 'mn', 'MN', 'Cyrl', 'Mongolian (Mongolia)',            null, 'seed'),

  -- Europe (one main locale per language)
  ('nl-NL', 'nl', 'NL', 'Latn', 'Dutch (Netherlands)',             null, 'seed'),
  ('nl-BE', 'nl', 'BE', 'Latn', 'Dutch (Belgium)',                 null, 'seed'),
  ('it-IT', 'it', 'IT', 'Latn', 'Italian (Italy)',                 null, 'seed'),
  ('it-CH', 'it', 'CH', 'Latn', 'Italian (Switzerland)',            null, 'seed'),
  ('pl-PL', 'pl', 'PL', 'Latn', 'Polish (Poland)',                 null, 'seed'),
  ('cs-CZ', 'cs', 'CZ', 'Latn', 'Czech (Czech Republic)',          null, 'seed'),
  ('sk-SK', 'sk', 'SK', 'Latn', 'Slovak (Slovakia)',               null, 'seed'),
  ('hu-HU', 'hu', 'HU', 'Latn', 'Hungarian (Hungary)',             null, 'seed'),
  ('ro-RO', 'ro', 'RO', 'Latn', 'Romanian (Romania)',              null, 'seed'),
  ('bg-BG', 'bg', 'BG', 'Cyrl', 'Bulgarian (Bulgaria)',            null, 'seed'),
  ('hr-HR', 'hr', 'HR', 'Latn', 'Croatian (Croatia)',              null, 'seed'),
  ('sr-RS', 'sr', 'RS', 'Cyrl', 'Serbian (Serbia)',                null, 'seed'),
  ('sl-SI', 'sl', 'SI', 'Latn', 'Slovenian (Slovenia)',            null, 'seed'),
  ('bs-BA', 'bs', 'BA', 'Latn', 'Bosnian (Bosnia and Herzegovina)', null, 'seed'),
  ('sq-AL', 'sq', 'AL', 'Latn', 'Albanian (Albania)',              null, 'seed'),
  ('mk-MK', 'mk', 'MK', 'Cyrl', 'Macedonian (North Macedonia)',   null, 'seed'),
  ('el-GR', 'el', 'GR', 'Grek', 'Greek (Greece)',                  null, 'seed'),
  ('el-CY', 'el', 'CY', 'Grek', 'Greek (Cyprus)',                  null, 'seed'),
  ('da-DK', 'da', 'DK', 'Latn', 'Danish (Denmark)',                null, 'seed'),
  ('sv-SE', 'sv', 'SE', 'Latn', 'Swedish (Sweden)',                null, 'seed'),
  ('sv-FI', 'sv', 'FI', 'Latn', 'Swedish (Finland)',               null, 'seed'),
  ('nb-NO', 'nb', 'NO', 'Latn', 'Norwegian Bokmål (Norway)',      null, 'seed'),
  ('nn-NO', 'nn', 'NO', 'Latn', 'Norwegian Nynorsk (Norway)',      null, 'seed'),
  ('fi-FI', 'fi', 'FI', 'Latn', 'Finnish (Finland)',               null, 'seed'),
  ('et-EE', 'et', 'EE', 'Latn', 'Estonian (Estonia)',              null, 'seed'),
  ('lt-LT', 'lt', 'LT', 'Latn', 'Lithuanian (Lithuania)',          null, 'seed'),
  ('lv-LV', 'lv', 'LV', 'Latn', 'Latvian (Latvia)',               null, 'seed'),
  ('is-IS', 'is', 'IS', 'Latn', 'Icelandic (Iceland)',             null, 'seed'),
  ('mt-MT', 'mt', 'MT', 'Latn', 'Maltese (Malta)',                 null, 'seed'),
  ('ga-IE', 'ga', 'IE', 'Latn', 'Irish (Ireland)',                 null, 'seed'),
  ('cy-GB', 'cy', 'GB', 'Latn', 'Welsh (United Kingdom)',          null, 'seed'),
  ('eu-ES', 'eu', 'ES', 'Latn', 'Basque (Spain)',                  null, 'seed'),
  ('ca-ES', 'ca', 'ES', 'Latn', 'Catalan (Spain)',                 null, 'seed'),
  ('gl-ES', 'gl', 'ES', 'Latn', 'Galician (Spain)',                null, 'seed'),
  ('ru-RU', 'ru', 'RU', 'Cyrl', 'Russian (Russia)',                null, 'seed'),
  ('uk-UA', 'uk', 'UA', 'Cyrl', 'Ukrainian (Ukraine)',             null, 'seed'),
  ('be-BY', 'be', 'BY', 'Cyrl', 'Belarusian (Belarus)',            null, 'seed'),
  ('hy-AM', 'hy', 'AM', 'Armn', 'Armenian (Armenia)',              null, 'seed'),
  ('ka-GE', 'ka', 'GE', 'Geor', 'Georgian (Georgia)',              null, 'seed'),
  ('tr-TR', 'tr', 'TR', 'Latn', 'Turkish (Turkey)',                null, 'seed'),
  ('az-AZ', 'az', 'AZ', 'Latn', 'Azerbaijani (Azerbaijan)',        null, 'seed'),
  ('kk-KZ', 'kk', 'KZ', 'Cyrl', 'Kazakh (Kazakhstan)',            null, 'seed'),
  ('uz-UZ', 'uz', 'UZ', 'Latn', 'Uzbek (Uzbekistan)',              null, 'seed'),

  -- Middle East / Central Asia
  ('fa-IR', 'fa', 'IR', 'Arab', 'Persian (Iran)',                   'rtl', 'seed'),
  ('fa-AF', 'fa', 'AF', 'Arab', 'Dari (Afghanistan)',               'rtl', 'seed'),
  ('ps-AF', 'ps', 'AF', 'Arab', 'Pashto (Afghanistan)',             'rtl', 'seed'),
  ('he-IL', 'he', 'IL', 'Hebr', 'Hebrew (Israel)',                  'rtl', 'seed'),

  -- Africa
  ('sw-KE', 'sw', 'KE', 'Latn', 'Swahili (Kenya)',                 null, 'seed'),
  ('sw-TZ', 'sw', 'TZ', 'Latn', 'Swahili (Tanzania)',              null, 'seed'),
  ('am-ET', 'am', 'ET', 'Ethi', 'Amharic (Ethiopia)',              null, 'seed'),
  ('so-SO', 'so', 'SO', 'Latn', 'Somali (Somalia)',                null, 'seed'),
  ('af-ZA', 'af', 'ZA', 'Latn', 'Afrikaans (South Africa)',        null, 'seed'),
  ('zu-ZA', 'zu', 'ZA', 'Latn', 'Zulu (South Africa)',             null, 'seed')
on conflict (code) do nothing;
