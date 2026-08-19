import { useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { TermsService } from "../services/terms.service";
import PricingBanner from "../components/PricingBanner";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import { useTranslation } from "../context/TranslationContext";
import { usePlan } from "../context/PlanContext";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await TermsService.getSettings(session.shop);

  return { settings };
};

export default function TermsAndConditions() {
  const navigate = useNavigate();
  const { settings } = useLoaderData();
  const { t } = useTranslation();
  const { canAccess } = usePlan();

  const isEnabled = canAccess("terms.condition.status")
    ? settings?.enabled || false
    : false;

  return (
    <s-page>
      <PageHeader
        title={t("termsAndConditions.pageTitle")}
        description={t("termsAndConditions.setupDescription")}
      />
      {/* Free Plan Limit Banner */}
      <PricingBanner text={t("termsAndConditions.bannerPromo")} />

      {/* Preview Card */}
      <s-section>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
            padding: "8px 0 16px",
          }}
        >
          {/* Icon */}
          <div style={{ flexShrink: 0 }}>
            <svg
              width="52"
              height="52"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Box body */}
              <path
                d="M12 28L32 38L52 28V48L32 58L12 48V28Z"
                stroke="#222"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Box flaps */}
              <path
                d="M12 28L32 18L52 28"
                stroke="#222"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M32 38V58"
                stroke="#222"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Badge */}
              <circle
                cx="22"
                cy="18"
                r="12"
                fill="white"
                stroke="#222"
                strokeWidth="3"
              />
              <path
                d="M17 18l3 3 6-6"
                stroke="#222"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Sparks */}
              <path
                d="M22 1v3M9 6l2 2M35 6l-2 2"
                stroke="#222"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Skeleton text lines */}
          <div style={{ flex: 1, paddingTop: "8px" }}>
            <div
              style={{
                height: "14px",
                backgroundColor: "#d0d0d0",
                borderRadius: "4px",
                marginBottom: "10px",
                width: "75%",
              }}
            />
            <div
              style={{
                height: "10px",
                backgroundColor: "#e0e0e0",
                borderRadius: "4px",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* Checkbox */}
        <s-checkbox
          id="accept-terms"
          checked={false}
          label={t("termsAndConditions.defaults.checkboxText")}
        />

        <s-divider></s-divider>

        {/* Product page & cart page row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <s-heading>
                {t("termsAndConditions.productAndCartPage")}
              </s-heading>
              <span
                style={{
                  fontSize: "12px",
                  color: isEnabled ? "#1f5132" : "#555",
                  backgroundColor: isEnabled ? "#e3f1df" : "#f1f1f1",
                  border: `1px solid ${isEnabled ? "#b1d1a1" : "#ddd"}`,
                  borderRadius: "4px",
                  padding: "1px 7px",
                }}
              >
                {isEnabled ? t("common.enabled") : t("common.disabled")}
              </span>
            </div>
            <s-text color="subdued">
              {t("termsAndConditions.productAndCartDescription")}
            </s-text>
          </div>
          <s-button
            variant="secondary"
            size="slim"
            onClick={() => navigate("/terms_and_conditions/setup")}
          >
            {t("termsAndConditions.customize")}
          </s-button>
        </div>
      </s-section>

      {/* Footer help text */}
      <PageFooter />
    </s-page>
  );
}
