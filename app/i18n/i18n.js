import en from "./en.json";
import de from "./de.json";
import fr from "./fr.json";
import it from "./it.json";
import es from "./es.json";
import hi from "./hi.json";

const localeMap = { en, de, fr, it, es, hi };


export async function loadTranslations(locale = "en") {
  return localeMap[locale] || en;
}

export function t(translations, key, params) {
  if (!translations || !key) return key || "";

  const parts = key.split(".");
  let value = translations;

  for (const part of parts) {
    if (value == null || typeof value !== "object") {
      return key;
    }
    value = value[part];
  }

  if (typeof value !== "string") return key;

  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
      params[name] !== undefined ? String(params[name]) : `{{${name}}}`,
    );
  }

  return value;
}

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
