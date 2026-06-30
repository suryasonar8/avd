import { createContext, useContext, useCallback } from "react";
import { t as translate, tArray as translateArray } from "../i18n/i18n";

const TranslationContext = createContext({ translations: {}, locale: "en" });

/**
 * Wrap the app with this provider to make translations available everywhere.
 *
 * @param {{ translations: object, locale: string, children: React.ReactNode }} props
 */
export function TranslationProvider({ translations, locale = "en", children }) {
  return (
    <TranslationContext.Provider value={{ translations, locale }}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook that returns a `t` helper for translating keys.
 *
 * Usage:
 *   const { t, tArray, locale } = useTranslation();
 *   <p>{t("dashboard.greeting", { shopName: "Acme" })}</p>
 */
export function useTranslation() {
  const { translations, locale } = useContext(TranslationContext);

  const t = useCallback(
    (key, params) => translate(translations, key, params),
    [translations],
  );

  const tArr = useCallback(
    (key) => translateArray(translations, key),
    [translations],
  );

  return { t, tArray: tArr, translations, locale };
}
