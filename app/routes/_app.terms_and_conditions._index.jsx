import { useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { TermsService } from "../services/terms.service";
import PricingBanner from "../components/PricingBanner";
import PageHeader from "../components/PageHeader";
import { useTranslation } from "../context/TranslationContext";
import { usePlan } from "../context/PlanContext";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await TermsService.getSettings(session.shop);

  return { settings };
};

export const action = async ({ request }) => {};

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
              <rect
                x="8"
                y="30"
                width="32"
                height="26"
                rx="4"
                stroke="#222"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M16 30V22a16 16 0 0 1 32 0v8"
                stroke="#222"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx="48"
                cy="20"
                r="12"
                fill="white"
                stroke="#222"
                strokeWidth="2"
              />
              <path
                d="M43 20l4 4 7-7"
                stroke="#222"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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
      <div
        style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "13px",
          color: "#6d7175",
        }}
      >
        {t("common.needHelp")}{" "}
        <s-link href="#">{t("common.ourDocumentGuideline")}</s-link>
      </div>
    </s-page>
  );
}
