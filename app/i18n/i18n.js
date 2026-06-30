/**
 * i18n utility — lightweight translation system for the AVD admin app.
 *
 * - loadTranslations(locale)  → returns the JSON object for a given locale
 * - t(translations, key, params) → resolves a dot-separated key with interpolation
 */

// Pre-import English so it's always available as fallback
import en from "./en.json";

const localeCache = { en };

/**
 * Load translations for a given locale code.
 * Falls back to English if the locale file doesn't exist.
 *
 * @param {string} locale  e.g. "en", "fr", "de"
 * @returns {object} The translations object
 */
export async function loadTranslations(locale = "en") {
  if (localeCache[locale]) return localeCache[locale];

  try {
    // Dynamic import — Vite will bundle each JSON in i18n/ as a chunk
    const mod = await import(`./${locale}.json`);
    const data = mod.default || mod;
    localeCache[locale] = data;
    return data;
  } catch {
    // Locale file not found — fall back to English
    console.warn(`[i18n] Locale "${locale}" not found, falling back to "en".`);
    return en;
  }
}

/**
 * Resolve a dot-separated translation key.
 *
 * @param {object}  translations  The full translations object
 * @param {string}  key           Dot-separated key, e.g. "dashboard.greeting"
 * @param {object}  [params]      Interpolation values, e.g. { shopName: "Acme" }
 * @returns {string} The resolved string (or the raw key if not found)
 *
 * @example
 *   t(translations, "dashboard.greeting", { shopName: "Acme" })
 *   // → "Hello Acme,"
 */
export function t(translations, key, params) {
  if (!translations || !key) return key || "";

  // Walk the nested object
  const parts = key.split(".");
  let value = translations;

  for (const part of parts) {
    if (value == null || typeof value !== "object") {
      return key; // path not found
    }
    value = value[part];
  }

  // If the resolved value isn't a string (could be an object/array), return key
  if (typeof value !== "string") return key;

  // Interpolate {{variable}} placeholders
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
      params[name] !== undefined ? String(params[name]) : `{{${name}}}`,
    );
  }

  return value;
}

/**
 * Get an array of translated strings from a JSON array stored under a key.
 *
 * @param {object} translations
 * @param {string} key  e.g. "pricing.basicFeatures"
 * @returns {string[]}
 */
export function tArray(translations, key) {
  if (!translations || !key) return [];

  const parts = key.split(".");
  let value = translations;

  for (const part of parts) {
    if (value == null || typeof value !== "object") return [];
    value = value[part];
  }

  if (Array.isArray(value)) return value;
  return [];
}
