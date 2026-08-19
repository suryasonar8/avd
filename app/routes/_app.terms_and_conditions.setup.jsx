/* eslint-disable react/prop-types, jsx-a11y/anchor-is-valid */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "../context/TranslationContext";
import { authenticate } from "../shopify.server";
import { TermsService } from "../services/terms.service";
import { PlanService } from "../services/plan.service";
import { SettingsService } from "../services/settings.service";
import ConditionSettings from "../components/terms-and-conditions/ConditionSettings";
import CheckboxSettings from "../components/terms-and-conditions/CheckboxSettings";
import PreviewPanel from "../components/terms-and-conditions/PreviewPanel";
import { CustomSaveBar } from "../components/CustomSaveBar";
import PageFooter from "../components/PageFooter";
import PageHeader from "../components/PageHeader";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const termsSettings = await TermsService.getSettings(session.shop);

  // Fetch global settings for Brand Mark from DB
  const dbSettings = await SettingsService.getSettings(session.shop);
  const globalSettings = { showBrandMark: dbSettings.showBrandMark };

  return { termsSettings, globalSettings };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle_brand_mark") {
    const showBrandMark = formData.get("showBrandMark") === "true";

    // Use SettingsService to save to DB first, then sync to metafield
    const dbSettings = await SettingsService.getSettings(session.shop);
    const result = await SettingsService.updateSettings(admin, session.shop, {
      ...dbSettings,
      showBrandMark,
    });

    return { success: result.success };
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

  // Reset terms settings when initialTermsSettings changes (e.g. after save)
  useEffect(() => {
    setTermsSettings(initialTermsSettings);
  }, [initialTermsSettings]);

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
    <s-page>
      <CustomSaveBar
        id="terms-save-bar"
        open={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        state={{ submitting: fetcher.state !== "idle", data: fetcher.data }}
      />

      {/* Header */}
      <PageHeader
        title={t("termsAndConditions.setupTitle")}
        description={t("termsAndConditions.setupDescription")}
        backAction={() => navigate("/terms_and_conditions")}
      />

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
    </s-page>
  );
}
