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
          <div
            style={{
              backgroundColor: "#fff4e5",
              border: "1px solid #ffe2b9",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <strong style={{ fontSize: "14px", color: "#663c00" }}>
              {t("checkoutVerification.verifyYourAge")}
            </strong>
          </div>

          {/* You're over 18+ banner */}
          <div
            style={{
              backgroundColor: "#edf7ed",
              border: "1px solid #c3e6cb",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginLeft: "120px",
            }}
          >
            <div
              style={{
                color: "#1e4620",
                border: "1px solid #1e4620",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              ✓
            </div>
            <strong style={{ fontSize: "14px", color: "#1e4620" }}>
              {t("checkoutVerification.youAreOver18")}
            </strong>
          </div>

          {/* You must be at least 18+ banner */}
          <div
            style={{
              backgroundColor: "#fdecea",
              border: "1px solid #f5c6cb",
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                color: "#5f2120",
                border: "1px solid #5f2120",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              !
            </div>
            <strong style={{ fontSize: "14px", color: "#5f2120" }}>
              {t("checkoutVerification.youMustBe18")}
            </strong>
          </div>

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
                <span
                  style={{
                    fontSize: "12px",
                    color: isEnabled ? "#1e4620" : "#555",
                    backgroundColor: isEnabled ? "#edf7ed" : "#f1f1f1",
                    border: `1px solid ${isEnabled ? "#c3e6cb" : "#ddd"}`,
                    borderRadius: "4px",
                    padding: "1px 7px",
                  }}
                >
                  {isEnabled ? t("common.enabled") : t("common.disabled")}
                </span>
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
