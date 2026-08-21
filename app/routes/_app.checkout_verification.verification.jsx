import { useState, useEffect } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PlanService } from "../services/plan.service";
import { CheckoutAgeVerificationService } from "../services/checkout-age-verification.service";
import AgePreviewPanel from "../components/checkout-verification/AgePreviewPanel";
import AgeConditionSettings from "../components/checkout-verification/AgeConditionSettings";
import AgeMessageSettings from "../components/checkout-verification/AgeMessageSettings";
import PageFooter from "../components/PageFooter";
import { CustomSaveBar } from "../components/CustomSaveBar";
import { useTranslation } from "../context/TranslationContext";
import PageHeader from "../components/PageHeader";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const config = await CheckoutAgeVerificationService.getConfig(session.shop);

  return { config };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

  const validation = await PlanService.validateCheckoutAgeVerificationConfig(
    session.shop,
    config,
  );

  const finalConfig = validation.sanitized || config;

  try {
    await CheckoutAgeVerificationService.saveConfig(admin, session.shop, finalConfig);
    return { success: true };
  } catch (error) {
    console.error("Failed to save checkout age verification config:", error);
    return { success: false, errors: [error.message] };
  }
};

export default function CheckoutAgeVerificationSetup() {
  const navigate = useNavigate();
  const { config: initialConfig } = useLoaderData();
  const [config, setConfig] = useState(initialConfig);
  const { t } = useTranslation();

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const [activeTab, setActiveTab] = useState("condition");
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isDirty = JSON.stringify(config) !== JSON.stringify(initialConfig);
  const isTargetValid =
    config.target === "collection"
      ? (config.selectedCollections || []).length > 0
      : config.target === "product"
        ? (config.selectedProducts || []).length > 0
        : true;
  const canSave = isDirty && isTargetValid;

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
    if (canSave) {
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
        id="checkout-age-verification-save-bar"
        open={canSave}
        onSave={handleSave}
        onDiscard={handleDiscard}
        state={{ submitting: fetcher.state !== "idle", data: fetcher.data }}
        successMessage={t("checkoutVerification.verificationSettingsSaved")}
      />

      <PageHeader
        title={t("checkoutVerification.ageVerification")}
        backAction={handleBack}
      />

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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              background: "transparent",
              marginBottom: "0px",
              gap: "8px",
              width: "100%",
            }}
          >
            <button
              onClick={() => setActiveTab("condition")}
              style={{
                flex: 1,
                padding: "6px 0",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "condition" ? "#E1E3E5" : "transparent",
                color: activeTab === "condition" ? "#1A1C1D" : "#6D7175",
                fontWeight: "500",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {t("checkoutVerification.tabCondition")}
            </button>
            <button
              onClick={() => setActiveTab("message")}
              style={{
                flex: 1,
                padding: "6px 0",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "message" ? "#E1E3E5" : "transparent",
                color: activeTab === "message" ? "#1A1C1D" : "#6D7175",
                fontWeight: "500",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {t("checkoutVerification.tabMessage")}
            </button>
          </div>

          {activeTab === "condition" ? (
            <AgeConditionSettings config={config} onChange={handleConfigChange} />
          ) : (
            <AgeMessageSettings config={config} onChange={handleConfigChange} />
          )}
        </div>

        <div style={{ position: "sticky", top: "20px", flex: 1 }}>
          <AgePreviewPanel config={config} />
        </div>
      </div>
      <PageFooter />
    </s-page>
  );
}
