import { useNavigate, useLoaderData } from "react-router";
import { useState, useEffect } from "react";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Days-in-month, accounting for leap years (Date's day-0-of-next-month trick
// already folds in the Feb 28/29 leap rule).
function getDaysInMonth(month, year) {
  if (!month) return 31;
  return new Date(year || new Date().getFullYear(), month, 0).getDate();
}

// Interactive dropdown that looks exactly like the original mock
function MockDropdown({ label, placeholder, options = [], value, onChange }) {
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

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
        position: "relative",
      }}
    >
      <div>
        <div style={{ fontSize: "12px", color: "#6D7175" }}>{label}</div>
        <div style={{ fontSize: "14px", color: "#1A1C1D" }}>{selectedLabel || placeholder}</div>
      </div>
      <svg viewBox="0 0 20 20" style={{ width: "20px", height: "20px", fill: "#6D7175" }}>
        <path fillRule="evenodd" d="M5.72 8.47a.75.75 0 0 1 1.06 0L10 11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 9.53a.75.75 0 0 1 0-1.06Z" />
      </svg>
      <select
        value={value}
        onChange={onChange}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          appearance: "none",
        }}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
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

  // Preview-only date-of-birth state, kept here (rather than inside
  // MockDropdown) so the day options can depend on the selected month/year.
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const dobDaysInMonth = getDaysInMonth(Number(dobMonth), Number(dobYear));
  const dobDayOptions = Array.from({ length: dobDaysInMonth }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  useEffect(() => {
    if (dobDay && Number(dobDay) > dobDaysInMonth) {
      setDobDay(String(dobDaysInMonth));
    }
  }, [dobDaysInMonth, dobDay]);

  return (
    <s-page>
      <PageHeader title={t("checkoutVerification.pageTitle")} />
      <PricingBanner text={t("checkoutVerification.bannerPromo")} />

      <div style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
        {/* Info banner card */}
        <s-section style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1 }}>
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
              </s-stack>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "16px" }}>
              <s-stack gap="base">
                <s-divider></s-divider>

                <div style={{ minHeight: "84px" }}>
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
            </div>
          </div>
        </s-section>

        {/* Checkout verification (age gate) card */}
        <s-section style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1 }}>
              <s-stack gap="base">
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                  padding: "8px 8px",
                }}
              >
                <s-checkbox
                  checked={false}
                  label={t("checkoutVerification.verifyAgeCheckboxLabel")}
                />
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <s-text weight="bold">
                {t("checkoutVerification.enterDateOfBirth")}
              </s-text>

              <div style={{ display: "flex", gap: "12px" }}>
                <MockDropdown
                  label={t("checkoutVerification.day")}
                  placeholder={t("checkoutVerification.dayPlaceholder")}
                  options={dobDayOptions}
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                />
                <MockDropdown
                  label={t("checkoutVerification.year")}
                  placeholder={t("checkoutVerification.yearPlaceholder")}
                  options={Array.from({ length: 100 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return { value: String(year), label: String(year) };
                  })}
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                />
                <MockDropdown
                  label={t("checkoutVerification.month")}
                  placeholder={t("checkoutVerification.monthPlaceholder")}
                  options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                />
              </div>
            </div>

            <s-text tone="critical" style={{ fontSize: "12px" }}>
              {t("checkoutVerification.ageVerificationError")}
            </s-text>
              </s-stack>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "16px" }}>
              <s-stack gap="base">
                <s-divider></s-divider>

                <div style={{ minHeight: "84px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <s-heading>
                      {t("checkoutVerification.ageVerification")}
                    </s-heading>
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
            </div>
          </div>
        </s-section>
      </div>

      <PageFooter />
    </s-page>
  );
}
