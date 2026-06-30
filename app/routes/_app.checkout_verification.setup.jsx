import { useState, useEffect } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { SaveBar } from "@shopify/app-bridge-react";
import { usePlan } from "../context/PlanContext";
import { authenticate } from "../shopify.server";
import { PlanService } from "../services/plan.service";
import PreviewPanel from "../components/checkout-verification/PreviewPanel";
import ConditionSettings from "../components/checkout-verification/ConditionSettings";
import BannerSettings from "../components/checkout-verification/BannerSettings";
import { CheckoutBannerService } from "../services/checkout-banner.service";

const DEFAULT_CONFIG = {
  status: "disabled",
  target: "always",
  heading: "You must be at least 18 years old to purchase these products",
  selectedCollections: [],
  selectedProducts: [],
  _collectionTitles: [],
  _productTitles: [],
};
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const dbBanner = await CheckoutBannerService.getBanner(session.shop);

  const config = dbBanner ? { ...DEFAULT_CONFIG, ...dbBanner } : DEFAULT_CONFIG;

  return { config };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

  // Server-side granular gate
  const validation = await PlanService.validateCheckoutConfig(
    session.shop,
    config,
  );

  // Use sanitized config
  const finalConfig = validation.sanitized || config;

  try {
    await CheckoutBannerService.saveBanner(admin, session.shop, finalConfig);
    return { success: true };
  } catch (error) {
    console.error("Failed to save checkout banner:", error);
    return { success: false, errors: [error.message] };
  }
};

import { useTranslation } from "../context/TranslationContext";

export default function CheckoutVerificationSetup() {
  const navigate = useNavigate();
  const { config: initialConfig } = useLoaderData();
  const [config, setConfig] = useState(initialConfig);
  const { t } = useTranslation();

  // Reset config when initialConfig changes (e.g. after save or navigation)
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const [activeTab, setActiveTab] = useState("condition");
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isDirty = JSON.stringify(config) !== JSON.stringify(initialConfig);

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(t("checkoutVerification.bannerSettingsSaved"));
    }
  }, [fetcher.data, shopify, t]);

  const handleSave = () => {
    fetcher.submit({ config: JSON.stringify(config) }, { method: "POST" });
  };

  const handleDiscard = () => {
    setConfig(initialConfig);
  };

  const handleConfigChange = (updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const tabStyle = (tab) => ({
    padding: "8px 24px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    borderRadius: "10px",
    background: activeTab === tab ? "#E0E0E0" : "transparent",
    color: "#202223",
    transition: "all 0.2s ease",
  });

  return (
    <div
      style={{
        padding: "32px",
        background: "#f6f6f7",
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, system-ui, sans-serif",
      }}
    >
      <SaveBar id="checkout-banner-save-bar" open={isDirty}>
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
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => navigate("/checkout_verification")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            color: "#202223",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
          aria-label={t("common.close")}
        >
          ←
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            color: "#202223",
          }}
        >
          {t("checkoutVerification.configuration")}
        </h1>
      </div>

      {/* Tabs */}
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
        <button
          style={tabStyle("condition")}
          onClick={() => setActiveTab("condition")}
        >
          {t("checkoutVerification.tabCondition")}
        </button>
        <button
          style={tabStyle("banner")}
          onClick={() => setActiveTab("banner")}
        >
          {t("checkoutVerification.tabBanner")}
        </button>
      </div>
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

      {/* Main Grid */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "320px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {activeTab === "condition" ? (
            <ConditionSettings config={config} onChange={handleConfigChange} />
          ) : (
            <BannerSettings config={config} onChange={handleConfigChange} />
          )}
        </div>

        {/* Right Panel */}
        <PreviewPanel config={config} />
      </div>
    </div>
  );
}
