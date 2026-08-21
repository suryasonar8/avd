import { useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import PricingBanner from "../components/PricingBanner";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import { ShopifyPlusBadge } from "../components/ShopifyPlusBadge";
import { StatusPill } from "../components/StatusPill";
import { useTranslation } from "../context/TranslationContext";

import { CheckoutBannerService } from "../services/checkout-banner.service";
import { ShopService } from "../services/shop.service";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const config = (await CheckoutBannerService.getBanner(session.shop)) || {
    status: "disabled",
  };
  const isShopifyPlus = await ShopService.isShopifyPlus(admin);

  return { config, isShopifyPlus };
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  // Placeholder for future action logic if needed
  return null;
};

// Static mock of a Polaris select — this card is an illustrative preview
// (like the Info banner card's hardcoded example banners), not a live-config
// driven control, so a real interactive <s-select> would be misleading here.
function MockDropdown({ label, placeholder }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #C9CCCF",
        borderRadius: "8px",
        padding: "6px 10px",
      }}
    >
      <div>
        <div style={{ fontSize: "12px", color: "#6D7175" }}>{label}</div>
        <div style={{ fontSize: "14px", color: "#1A1C1D" }}>
          {placeholder}
        </div>
      </div>
      <span style={{ color: "#6D7175" }}>⌄</span>
    </div>
  );
}

export default function CheckoutVerification() {
  const navigate = useNavigate();
  const { config, isShopifyPlus } = useLoaderData();
  const { t } = useTranslation();
  const isEnabled = config.status === "enabled";
  // Not wired up yet — the age-verification config/service is a follow-up.
  const isAgeVerificationEnabled = false;

  return (
    <s-page>
      <PageHeader title={t("checkoutVerification.pageTitle")} />
      <PricingBanner text={t("checkoutVerification.bannerPromo")} />

      <div style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
        {/* Info banner card */}
        <s-section style={{ flex: 1 }}>
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

            <div>
              <s-heading>{t("checkoutVerification.infoBanner")}</s-heading>
              <s-text color="subdued">
                {t("checkoutVerification.infoBannerDescription")}
              </s-text>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <s-button
                variant="secondary"
                size="slim"
                onClick={() => navigate("/checkout_verification/setup")}
              >
                {t("checkoutVerification.customize")}
              </s-button>
              <StatusPill enabled={isEnabled} />
            </div>
          </s-stack>
        </s-section>

        {/* Checkout verification (age gate) card */}
        <s-section style={{ flex: 1 }}>
          <s-stack gap="base">
            <div
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#8a2846",
                  backgroundColor: "#fce4ec",
                  border: "1px solid #f5c2d6",
                  borderRadius: "4px",
                  padding: "1px 7px",
                  flexShrink: 0,
                }}
              >
                {t("checkoutVerification.agePlusBadge")}
              </span>
              <div
                style={{
                  flex: 1,
                  border: "1px solid #2c6ecb",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
              >
                <s-checkbox
                  checked={false}
                  label={t("checkoutVerification.verifyAgeCheckboxLabel")}
                />
              </div>
            </div>

            <s-text weight="bold">
              {t("checkoutVerification.enterDateOfBirth")}
            </s-text>

            <div style={{ display: "flex", gap: "12px" }}>
              <MockDropdown
                label={t("checkoutVerification.day")}
                placeholder={t("checkoutVerification.dayPlaceholder")}
              />
              <MockDropdown
                label={t("checkoutVerification.year")}
                placeholder={t("checkoutVerification.yearPlaceholder")}
              />
              <MockDropdown
                label={t("checkoutVerification.month")}
                placeholder={t("checkoutVerification.monthPlaceholder")}
              />
            </div>

            <s-text tone="critical" style={{ fontSize: "12px" }}>
              {t("checkoutVerification.ageVerificationError")}
            </s-text>

            <s-divider></s-divider>

            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <s-heading>{t("checkoutVerification.ageVerification")}</s-heading>
                <ShopifyPlusBadge />
              </div>
              <s-text color="subdued">
                {isShopifyPlus
                  ? t("checkoutVerification.ageVerificationDescription")
                  : t("checkoutVerification.shopifyPlusRequired")}
              </s-text>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <s-button
                variant="secondary"
                size="slim"
                disabled={!isShopifyPlus}
                onClick={() => navigate("/checkout_verification/verification")}
              >
                {t("checkoutVerification.customize")}
              </s-button>
              <StatusPill enabled={isAgeVerificationEnabled} />
            </div>
          </s-stack>
        </s-section>
      </div>

      <PageFooter />
    </s-page>
  );
}
