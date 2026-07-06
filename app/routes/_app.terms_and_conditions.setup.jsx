/* eslint-disable react/prop-types, jsx-a11y/anchor-is-valid */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "../context/TranslationContext";
import { authenticate } from "../shopify.server";
import { TermsService } from "../services/terms.service";
import { PlanService } from "../services/plan.service";
import { ShopService } from "../services/shop.service";
import ConditionSettings from "../components/terms-and-conditions/ConditionSettings";
import CheckboxSettings from "../components/terms-and-conditions/CheckboxSettings";
import PreviewPanel from "../components/terms-and-conditions/PreviewPanel";
import { CustomSaveBar } from "../components/CustomSaveBar";
import PageFooter from "../components/PageFooter";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const termsSettings = await TermsService.getSettings(session.shop);

  // Fetch global settings for Brand Mark
  const shop = await ShopService.getMetafield(admin, "avd", "settings");
  const globalSettingsValue = shop?.metafield?.value;
  const globalSettings = globalSettingsValue
    ? JSON.parse(globalSettingsValue)
    : { showBrandMark: true };

  return { termsSettings, globalSettings };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle_brand_mark") {
    const showBrandMark = formData.get("showBrandMark") === "true";

    const shopData = await ShopService.getMetafield(admin, "avd", "settings");
    const existingValue = shopData?.metafield?.value;
    const existingSettings = existingValue ? JSON.parse(existingValue) : {};
    const newSettings = { ...existingSettings, showBrandMark };

    const shopId = await ShopService.getShopId(admin);

    await ShopService.updateMetafield(
      admin,
      shopId,
      "avd",
      "settings",
      JSON.stringify(newSettings),
    );

    return { success: true };
  }

  const settingsStr = formData.get("termsSettings");
  const termsSettings = JSON.parse(settingsStr);

  // Server-side granular gate
  const validation = await PlanService.validateTermsConfig(
    session.shop,
    termsSettings,
  );

  // Use sanitized settings even if isValid is true
  const finalTermsSettings = validation.sanitized || termsSettings;

  await TermsService.saveSettings(admin, session.shop, finalTermsSettings);

  return { success: true };
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TermsAndConditionsSetup() {
  const navigate = useNavigate();
  const {
    termsSettings: initialTermsSettings,
    globalSettings: initialGlobalSettings,
  } = useLoaderData();
  const [termsSettings, setTermsSettings] = useState(initialTermsSettings);
  const [globalSettings, setGlobalSettings] = useState(
    initialGlobalSettings || { showBrandMark: true },
  );

  // Sync global settings when it changes from the server
  useEffect(() => {
    setGlobalSettings(initialGlobalSettings || { showBrandMark: true });
  }, [initialGlobalSettings]);

  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [activeTab, setActiveTab] = useState("condition");
  const { t } = useTranslation();

  const isDirty =
    JSON.stringify(termsSettings) !== JSON.stringify(initialTermsSettings);

  const handleSave = () => {
    fetcher.submit(
      { termsSettings: JSON.stringify(termsSettings) },
      { method: "post" },
    );
  };

  const handleDiscard = () => {
    setTermsSettings(initialTermsSettings);
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif" }}>
      <CustomSaveBar
        id="terms-save-bar"
        open={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        state={{ submitting: fetcher.state !== "idle", data: fetcher.data }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => navigate("/terms_and_conditions")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#202223",
              padding: 0,
              lineHeight: 1,
            }}
            aria-label={t("common.close")}
          >
            ←
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
              color: "#202223",
            }}
          >
            {t("termsAndConditions.setupTitle")}
          </h1>
        </div>
      </div>
      <p
        style={{ margin: "0 0 20px 28px", fontSize: "13px", color: "#6D7175" }}
      >
        {t("termsAndConditions.setupDescription")}
      </p>

      {fetcher.data?.errors && (
        <div
          style={{
            background: "#fff4f4",
            border: "1px solid #d72c0d",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "24px",
            color: "#d72c0d",
            fontSize: "13px",
          }}
        >
          {fetcher.data.errors.map((err, i) => (
            <p key={i} style={{ margin: "2px 0" }}>
              • {err}
            </p>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          background: "transparent",
          padding: "4px",
          borderRadius: "12px",
          marginBottom: "24px",
          width: "fit-content",
          gap: "8px",
        }}
      >
        <s-button
          variant={activeTab === "condition" ? "primary" : "secondary"}
          onClick={() => setActiveTab("condition")}
        >
          {t("checkoutVerification.tabCondition")}
        </s-button>
        <s-button
          variant={activeTab === "checkbox" ? "primary" : "secondary"}
          onClick={() => setActiveTab("checkbox")}
        >
          {t("termsAndConditions.tabBanner")}
        </s-button>
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        {/* ─── Left Settings Panel ─── */}
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {activeTab === "condition" ? (
            <ConditionSettings
              termsSettings={termsSettings}
              setTermsSettings={setTermsSettings}
            />
          ) : (
            <CheckboxSettings
              termsSettings={termsSettings}
              setTermsSettings={setTermsSettings}
            />
          )}
        </div>

        {/* ─── Right Preview Panel ─── */}
        <PreviewPanel
          checkboxText={termsSettings.checkboxText}
          keyword={termsSettings.keyword}
          link={termsSettings.link}
          size={termsSettings.size}
          color={termsSettings.color}
          globalSettings={globalSettings}
          setGlobalSettings={setGlobalSettings}
          fetcher={fetcher}
        />
      </div>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}
