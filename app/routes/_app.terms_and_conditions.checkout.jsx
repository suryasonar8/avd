/* eslint-disable react/prop-types, jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { useTranslation } from "../context/TranslationContext";
import { TermsService } from "../services/terms.service";
import { PlanService } from "../services/plan.service";
import { SettingsService } from "../services/settings.service";
import CheckoutConditionSettings from "../components/terms-and-conditions/CheckoutConditionSettings";
import CheckoutPreviewPanel from "../components/terms-and-conditions/CheckoutPreviewPanel";
import { CustomSaveBar } from "../components/CustomSaveBar";
import PageFooter from "../components/PageFooter";
import PageHeader from "../components/PageHeader";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const termsSettings = await TermsService.getSettings(session.shop);

  const dbSettings = await SettingsService.getSettings(session.shop);
  const globalSettings = { showBrandMark: dbSettings.showBrandMark };

  const storeName = session.shop.replace(".myshopify.com", "");

  return { termsSettings, globalSettings, storeName };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle_brand_mark") {
    const showBrandMark = formData.get("showBrandMark") === "true";
    const dbSettings = await SettingsService.getSettings(session.shop);
    const result = await SettingsService.updateSettings(admin, session.shop, {
      ...dbSettings,
      showBrandMark,
    });
    return { success: result.success };
  }

  const checkoutStr = formData.get("checkout");
  const checkout = JSON.parse(checkoutStr);

  // Merge into the full terms config — validateCheckoutTermsConfig only
  // touches `.checkout`, the rest (product/cart fields) passes through
  // untouched, same shape TermsService.saveSettings expects.
  const currentSettings = await TermsService.getSettings(session.shop);
  const { id, ...configOnly } = currentSettings;
  const fullConfig = { ...configOnly, checkout };

  const validation = await PlanService.validateCheckoutTermsConfig(
    session.shop,
    fullConfig,
  );

  const finalSettings = validation.sanitized || fullConfig;

  await TermsService.saveSettings(admin, session.shop, finalSettings);

  return { success: true };
};

export default function TermsAndConditionsCheckoutSetup() {
  const navigate = useNavigate();
  const {
    termsSettings: initialTermsSettings,
    globalSettings: initialGlobalSettings,
    storeName,
  } = useLoaderData();

  const [checkoutSettings, setCheckoutSettings] = useState(
    initialTermsSettings.checkout,
  );
  const [globalSettings, setGlobalSettings] = useState(
    initialGlobalSettings || { showBrandMark: true },
  );

  useEffect(() => {
    setCheckoutSettings(initialTermsSettings.checkout);
  }, [initialTermsSettings]);

  useEffect(() => {
    setGlobalSettings(initialGlobalSettings || { showBrandMark: true });
  }, [initialGlobalSettings]);

  const fetcher = useFetcher();
  const { t } = useTranslation();

  const isDirty =
    JSON.stringify(checkoutSettings) !==
    JSON.stringify(initialTermsSettings.checkout);

  const handleSave = () => {
    fetcher.submit(
      { checkout: JSON.stringify(checkoutSettings) },
      { method: "post" },
    );
  };

  const handleDiscard = () => {
    setCheckoutSettings(initialTermsSettings.checkout);
  };

  // No confirmed deep link exists into a specific checkout block — both
  // point at the general Settings > Checkout page, where the merchant
  // reaches the Checkout Editor (block placement) and Checkout Rules
  // (validation Function activation) from the same starting point.
  const checkoutSettingsUrl = `https://admin.shopify.com/store/${storeName}/settings/checkout`;

  return (
    <s-page>
      <CustomSaveBar
        id="checkout-terms-save-bar"
        open={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        state={{ submitting: fetcher.state !== "idle", data: fetcher.data }}
      />

      <PageHeader
        title={t("termsAndConditions.checkoutSetupTitle")}
        description={t("termsAndConditions.setupDescription")}
        backAction={() => navigate("/terms_and_conditions")}
      />

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* Left settings panel */}
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <CheckoutConditionSettings
            checkoutSettings={checkoutSettings}
            setCheckoutSettings={setCheckoutSettings}
            checkoutEditorUrl={checkoutSettingsUrl}
          />
        </div>

        {/* Right preview panel */}
        <div style={{ position: "sticky", top: "20px", flex: 1 }}>
          <CheckoutPreviewPanel
            globalSettings={globalSettings}
            setGlobalSettings={setGlobalSettings}
            fetcher={fetcher}
          />
        </div>
      </div>

      <PageFooter />
    </s-page>
  );
}
