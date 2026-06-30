import { createContext, useContext, useCallback, useState, useEffect } from "react";
import { t as translate, tArray as translateArray, loadTranslations } from "../i18n/i18n";

const TranslationContext = createContext({
  translations: {},
  locale: "en",
  changeLocale: () => {},
});

export function TranslationProvider({ translations: initialTranslations, locale: initialLocale = "en", children }) {
  const [translations, setTranslations] = useState(initialTranslations);
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    setTranslations(initialTranslations);
  }, [initialTranslations]);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  const changeLocale = useCallback(async (newLocale) => {
    try {
      const newTranslations = await loadTranslations(newLocale);
      setTranslations(newTranslations);
      setLocale(newLocale);
    } catch (e) {
      console.warn("[i18n] Failed to load locale:", newLocale, e);
    }
  }, []);

  return (
    <TranslationContext.Provider value={{ translations, locale, changeLocale }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const { translations, locale, changeLocale } = useContext(TranslationContext);

  const t = useCallback(
    (key, params) => translate(translations, key, params),
    [translations],
  );

  const tArr = useCallback(
    (key) => translateArray(translations, key),
    [translations],
  );

  return { t, tArray: tArr, translations, locale, changeLocale };
}
