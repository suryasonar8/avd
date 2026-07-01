import { useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import PricingBanner from "../components/PricingBanner";
import { useTranslation } from "../context/TranslationContext";

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

          <s-divider></s-divider>
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
                <s-heading>{t("checkoutVerification.infoBanner")}</s-heading>
                <s-badge tone={isEnabled ? "success" : "neutral"}>
                  {isEnabled ? t("common.enabled") : t("common.disabled")}
                </s-badge>
              </div>
              <s-text color="subdued">
                {t("checkoutVerification.infoBannerDescription")}
              </s-text>
            </div>
            <s-button
              variant="secondary"
              size="slim"
              onClick={() => navigate("/checkout_verification/setup")}
            >
              {t("checkoutVerification.customize")}
            </s-button>
          </div>
        </s-stack>
      </s-section>
    </s-page>
  );
}
