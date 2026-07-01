/* eslint-disable react/prop-types, jsx-a11y/anchor-is-valid */
import { useState, useEffect } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import { useAppBridge, SaveBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../context/TranslationContext";
import { authenticate } from "../shopify.server";
import { TermsService } from "../services/terms.service";
import { PlanService } from "../services/plan.service";
import ConditionSettings from "../components/terms-and-conditions/ConditionSettings";
import CheckboxSettings from "../components/terms-and-conditions/CheckboxSettings";
import PreviewPanel from "../components/terms-and-conditions/PreviewPanel";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await TermsService.getSettings(session.shop);

  return { settings };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const settingsStr = formData.get("settings");
  const settings = JSON.parse(settingsStr);

  // Server-side granular gate
  const validation = await PlanService.validateTermsConfig(
    session.shop,
    settings,
  );

  // Use sanitized settings even if isValid is true
  const finalSettings = validation.sanitized || settings;

  await TermsService.saveSettings(admin, session.shop, finalSettings);

  return { success: true };
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TermsAndConditionsSetup() {
  const navigate = useNavigate();
  const { settings: initialSettings } = useLoaderData();
  const [settings, setSettings] = useState(initialSettings);
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [activeTab, setActiveTab] = useState("condition");
  const { t } = useTranslation();

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(t("common.savedSuccessfully"));
    }
  }, [fetcher.data, shopify, t]);

  const handleSave = () => {
    fetcher.submit({ settings: JSON.stringify(settings) }, { method: "post" });
  };

  const handleDiscard = () => {
    setSettings(initialSettings);
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif" }}>
      <SaveBar id="terms-save-bar" open={isDirty}>
        <button
          variant="primary"
          onClick={handleSave}
          disabled={fetcher.state === "submitting"}
        >
          {t("common.save")}
        </button>
        <button onClick={handleDiscard}>{t("common.discard")}</button>
      </SaveBar>

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
            <ConditionSettings settings={settings} setSettings={setSettings} />
          ) : (
            <CheckboxSettings settings={settings} setSettings={setSettings} />
          )}
        </div>

        {/* ─── Right Preview Panel ─── */}
        <PreviewPanel
          checkboxText={settings.checkboxText}
          keyword={settings.keyword}
          link={settings.link}
          size={settings.size}
          color={settings.color}
          showBrandMark={settings.showBrandMark}
          setSettings={setSettings}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "28px",
          fontSize: "13px",
          color: "#6D7175",
        }}
      >
        {t("common.needHelp")}{" "}
        <a href="#" style={{ color: "#2C6ECB", textDecoration: "none" }}>
          {t("common.ourDocumentGuideline")}
        </a>
      </div>
    </div>
  );
}
