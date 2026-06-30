import { useState } from "react";
import { useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import PricingBanner from "../components/PricingBanner";

import { CheckoutBannerService } from "../services/checkout-banner.service";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const config = (await CheckoutBannerService.getBanner(session.shop)) || {
    status: "disabled",
  };

  return { config };
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  // Placeholder for future action logic if needed
  return null;
};

import { useTranslation } from "../context/TranslationContext";

export default function CheckoutVerification() {
  const navigate = useNavigate();
  const { config } = useLoaderData();
  const { t } = useTranslation();
  const isEnabled = config.status === "enabled";

  return (
    <s-page heading={t("checkoutVerification.pageTitle")}>
      <PricingBanner text={t("checkoutVerification.bannerPromo")} />

      <s-section>
        <s-stack gap="base">
          {/* Verify your age banner */}
          <s-banner tone="warning">
            <s-text>{t("checkoutVerification.verifyYourAge")}</s-text>
          </s-banner>

          {/* You're over 18+ banner */}
          <div style={{ marginLeft: "120px" }}>
            <s-banner tone="success">
              <s-text>{t("checkoutVerification.youAreOver18")}</s-text>
            </s-banner>
          </div>

          {/* You must be at least 18+ banner */}
          <s-banner tone="critical">
            <s-text>{t("checkoutVerification.youMustBe18")}</s-text>
          </s-banner>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e1e3e5",
              margin: "12px 0",
            }}
          />

          {/* Info banner section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <strong style={{ fontSize: "14px" }}>{t("checkoutVerification.infoBanner")}</strong>
                <s-badge tone={isEnabled ? "success" : "neutral"}>
                  {isEnabled ? t("common.enabled") : t("common.disabled")}
                </s-badge>
              </div>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "13px",
                  color: "#6d7175",
                }}
              >
                {t("checkoutVerification.infoBannerDescription")}
              </p>
            </div>
            <s-button
              variant="secondary"
              size="slim"
              onClick={() => navigate("/checkout_verification/setup")}
            >
              {t("dashboard.customizeNow")}
            </s-button>
          </div>
        </s-stack>
      </s-section>
    </s-page>
  );
}
