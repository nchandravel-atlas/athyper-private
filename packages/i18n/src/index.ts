/**
 * @athyper/i18n — internationalization for the athyper platform.
 *
 * Supports: English (en), Malay (ms), Tamil (ta), Hindi (hi), Arabic (ar)
 */

export { i18nConfig, isValidLocale, isRtlLocale } from "./config.js";
export type { Locale } from "./config.js";
export { getIntl, clearIntlCache } from "./get-intl.js";
