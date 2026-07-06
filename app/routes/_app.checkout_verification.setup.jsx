import { useState, useEffect, useRef } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { usePlan } from "../context/PlanContext";
import { authenticate } from "../shopify.server";
import { PlanService } from "../services/plan.service";
import PreviewPanel from "../components/checkout-verification/PreviewPanel";
import ConditionSettings from "../components/checkout-verification/ConditionSettings";
import BannerSettings from "../components/checkout-verification/BannerSettings";
import PageFooter from "../components/PageFooter";
import { CustomSaveBar } from "../components/CustomSaveBar";
import { CheckoutBannerService } from "../services/checkout-banner.service";
import { useTranslation } from "../context/TranslationContext";
import PageHeader from "../components/PageHeader";

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

  const handleSave = () => {
    fetcher.submit({ config: JSON.stringify(config) }, { method: "POST" });
  };

  const handleDiscard = () => {
    setConfig(initialConfig);
  };

  const handleConfigChange = (updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleBack = () => {
    if (isDirty) {
      shopify.toast.show(t("common.saveOrDiscardWarning"), {
        isError: true,
      });
    } else {
      navigate("/checkout_verification");
    }
  };

  return (
    <s-page>
      <CustomSaveBar
        id="checkout-banner-save-bar"
        open={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        state={{ submitting: fetcher.state !== "idle", data: fetcher.data }}
        successMessage={t("checkoutVerification.bannerSettingsSaved")}
      />

      <PageHeader
        title={t("checkoutVerification.configuration")}
        backAction={handleBack}
      />

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
        <s-button
          variant={activeTab === "condition" ? "primary" : "secondary"}
          onClick={() => setActiveTab("condition")}
        >
          {t("checkoutVerification.tabCondition")}
        </s-button>
        <s-button
          variant={activeTab === "banner" ? "primary" : "secondary"}
          onClick={() => setActiveTab("banner")}
        >
          {t("checkoutVerification.tabBanner")}
        </s-button>
      </div>
      {fetcher.data?.errors && (
        <div style={{ marginBottom: "24px" }}>
          <s-banner tone="critical">
            <s-stack gap="extra-tight">
              {fetcher.data.errors.map((err, i) => (
                <s-text key={i}>• {err}</s-text>
              ))}
            </s-stack>
          </s-banner>
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
      <PageFooter />
    </s-page>
  );
}
