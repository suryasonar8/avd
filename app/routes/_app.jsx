import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { PlanProvider } from "../context/PlanContext";
import { TranslationProvider } from "../context/TranslationContext";
import { getShopPlan, buildAccessMap, PlanService } from "../services/plan.service";
import { loadTranslations } from "../i18n/i18n";
import { useTranslation } from "../context/TranslationContext";
import { ShopService } from "../services/shop.service";
import { useState, useEffect } from "react";
import { LANGUAGE_MAP } from "../constants/languages";


export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const plan = await getShopPlan(admin, session.shop);
  const access = buildAccessMap(plan);

  // Load admin language from shop settings
  let locale = "en";
  try {
    const shopData = await ShopService.getMetafield(admin, "avd", "settings");
    const metafieldValue = shopData?.metafield?.value;
    let settings = {};
    if (metafieldValue) {
      settings = JSON.parse(metafieldValue);
      if (settings.adminLanguage) {
        locale = LANGUAGE_MAP[settings.adminLanguage] || "en";
      }
    }

    // Sync plan to global settings for theme extensions
    if (settings.plan !== plan) {
      const newSettings = { ...settings, plan };
      const shopId = await ShopService.getShopId(admin);
      await ShopService.updateMetafield(
        admin,
        shopId,
        "avd",
        "settings",
        JSON.stringify(newSettings)
      );

      // Sync computed feature-access booleans for theme extensions to
      // consume (see PlanService.syncEntitlements for details).
      await PlanService.syncEntitlements(admin, shopId, access);

      // Enforce plan limits on all gated features
      await PlanService.enforcePlanLimits(admin, session.shop);
    }
  } catch (e) {
    // Fall back to English if settings can't be loaded
    console.warn("[i18n] Could not load admin language setting:", e.message);
  }

  const translations = await loadTranslations(locale);

  return { plan, access, translations, locale };
};

function AppNav() {
  const { t } = useTranslation();
  return (
    <s-app-nav>
      <s-link href="/store_verification">
        {t("navigation.storeVerification")}
      </s-link>
      <s-link href="/checkout_verification">
        {t("navigation.checkoutVerification")}
      </s-link>
      <s-link href="/translation">{t("navigation.translation")}</s-link>
      <s-link href="/terms_and_conditions">
        {t("navigation.termsAndConditions")}
      </s-link>
      <s-link href="/settings">{t("navigation.settings")}</s-link>
      <s-link href="/pricing">{t("navigation.pricing")}</s-link>
    </s-app-nav>
  );
}

export default function App() {
  const { plan, access, translations, locale } = useLoaderData();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <TranslationProvider translations={translations} locale={locale}>
      <AppNav />
      <PlanProvider plan={plan} access={access}>
        {isMounted ? <Outlet /> : null}
      </PlanProvider>
    </TranslationProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
