import { useState } from "react";
import { authenticate } from "../shopify.server";
import { useTranslation } from "../context/TranslationContext";
import {
  BASIC_FEATURE_KEYS,
  PREMIUM_FEATURE_KEYS,
  COMPARE_FEATURES,
  PRICING_FAQ_KEYS,
} from "../constants/pricing";
import { PLAN_TYPES } from "../constants/features";
import DiscountModal from "../components/DiscountModal";
import PageHeader from "../components/PageHeader";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function PlansPage() {
  const [billing, setBilling] = useState("yearly");
  const [openFaq, setOpenFaq] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [hoveredBasic, setHoveredBasic] = useState(false);
  const [hoveredPremium, setHoveredPremium] = useState(false);
  const [hoveredBasicBtn, setHoveredBasicBtn] = useState(false);
  const [hoveredPremiumBtn, setHoveredPremiumBtn] = useState(false);
  const { t } = useTranslation();
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const basicMonthly = billing === "yearly" ? 2.99 : 3.99;
  const premiumMonthly = billing === "yearly" ? 6.75 : 8.99;

  return (
    <s-page>
      <PageHeader title="Pricing" />
      <s-section>
        {/* Discount code trigger link */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => setIsDiscountModalOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#2c6ecb",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              padding: "4px 8px",
              fontFamily: "Inter, -apple-system, system-ui, sans-serif",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#004b87")}
            onMouseLeave={(e) => (e.target.style.color = "#2c6ecb")}
          >
            Apply your discount code
          </button>
        </div>

        {/* Pricing cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "24px",
            width: "100%",
          }}
        >
          {/* Basic Plan */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: hoveredBasic
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
              transform: hoveredBasic ? "translateY(-2px)" : "translateY(0)",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={() => setHoveredBasic(true)}
            onMouseLeave={() => setHoveredBasic(false)}
          >
            <div>
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#09090b",
                  letterSpacing: "0.05em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {t("pricing.planTypes.basic")}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#71717a",
                  lineHeight: "1.5",
                  margin: "8px 0 20px 0",
                  minHeight: "42px",
                }}
              >
                {t("pricing.basicDescription")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  color: "#09090b",
                }}
              >
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    letterSpacing: "-0.02em",
                  }}
                >
                  ${basicMonthly}
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  {t("pricing.perMonth")}
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#71717a",
                  margin: "4px 0 24px 0",
                }}
              >
                {billing === "yearly"
                  ? t("pricing.billedYearly")
                  : t("pricing.billedMonthly")}
              </p>
              <s-button
                variant="primary"
                onMouseEnter={() => setHoveredBasicBtn(true)}
                onMouseLeave={() => setHoveredBasicBtn(false)}
              >
                {t("pricing.startFreeTrial")}
              </s-button>
            </div>
            <div style={{ margin: "24px 0" }}>
              <s-divider></s-divider>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#09090b",
                  marginBottom: "16px",
                }}
              >
                <span>✨</span> {t("pricing.basicFeaturesHeader")}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {BASIC_FEATURE_KEYS.map((fKey, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#3f3f46",
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        color: "#22c55e",
                        fontWeight: 700,
                        fontSize: "16px",
                        lineHeight: 1,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      ✓
                    </span>
                    {t(fKey)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: hoveredPremium
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
              transform: hoveredPremium ? "translateY(-2px)" : "translateY(0)",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={() => setHoveredPremium(true)}
            onMouseLeave={() => setHoveredPremium(false)}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <h3
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#09090b",
                    letterSpacing: "0.05em",
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  {t("pricing.planTypes.premium")}
                </h3>
                <span
                  style={{
                    backgroundColor: "#e0f2fe",
                    color: "#0369a1",
                    fontSize: "12px",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  {t("pricing.mostPopular")}
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#71717a",
                  lineHeight: "1.5",
                  margin: "8px 0 20px 0",
                  minHeight: "42px",
                }}
              >
                {t("pricing.premiumDescription")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  color: "#09090b",
                }}
              >
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    letterSpacing: "-0.02em",
                  }}
                >
                  ${premiumMonthly}
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  {t("pricing.perMonth")}
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#71717a",
                  margin: "4px 0 24px 0",
                }}
              >
                {billing === "yearly"
                  ? t("pricing.billedYearly")
                  : t("pricing.billedMonthly")}
              </p>
              <s-button
                variant="primary"
                onMouseEnter={() => setHoveredPremiumBtn(true)}
                onMouseLeave={() => setHoveredPremiumBtn(false)}
              >
                {t("pricing.startFreeTrial")}
              </s-button>
            </div>
            <div style={{ margin: "24px 0" }}>
              <s-divider></s-divider>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#09090b",
                  marginBottom: "16px",
                }}
              >
                <span>✨</span> {t("pricing.premiumFeaturesHeader")}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {PREMIUM_FEATURE_KEYS.map((fKey, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#3f3f46",
                      lineHeight: 1.4,
                    }}
                  >
                    <span
                      style={{
                        color: "#22c55e",
                        fontWeight: 700,
                        fontSize: "16px",
                        lineHeight: 1,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    >
                      ✓
                    </span>
                    {t(fKey)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Free Plan */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#71717a",
                letterSpacing: "0.05em",
                margin: 0,
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {t("pricing.planTypes.free")}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                color: "#09090b",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                }}
              >
                $0
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#71717a",
                }}
              >
                {t("pricing.perMonth")}
              </span>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "#71717a",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              {t("pricing.bestSuitedForTesting")}
            </p>
          </div>
          <div>
            <span
              style={{
                display: "inline-block",
                background: "#f4f4f5",
                color: "#71717a",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                textAlign: "center",
                border: "none",
              }}
            >
              {t("pricing.yourCurrentPlan")}
            </span>
          </div>
        </div>

        {/* Compare plan features bar */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#09090b",
                margin: 0,
              }}
            >
              {t("pricing.comparePlanFeatures")}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#71717a",
                margin: "6px 0 0 0",
                lineHeight: "1.5",
              }}
            >
              {t("pricing.compareDescription")}
            </p>
          </div>
          <button
            onClick={() => setShowCompare(!showCompare)}
            style={{
              background: "#ffffff",
              color: "#09090b",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f4f4f5";
              e.currentTarget.style.borderColor = "#d4d4d8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#e4e4e7";
            }}
          >
            {showCompare ? t("common.showLess") : t("common.showMore")}
          </button>
        </div>

        {/* Comparison table */}
        {showCompare && (
          <div
            style={{
              border: "1px solid #e4e4e7",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#ffffff",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
              marginBottom: "24px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ background: "#ffffff" }}>
                  <th
                    style={{
                      padding: "18px 24px",
                      textAlign: "left",
                      borderBottom: "1px solid #e4e4e7",
                      borderRight: "1px solid #e4e4e7",
                    }}
                  />
                  <th
                    style={{
                      padding: "18px 24px",
                      textAlign: "center",
                      fontWeight: "700",
                      color: "#09090b",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #e4e4e7",
                      borderRight: "1px solid #e4e4e7",
                    }}
                  >
                    {t("pricing.planTypes.free")}
                  </th>
                  <th
                    style={{
                      padding: "18px 24px",
                      textAlign: "center",
                      fontWeight: "700",
                      color: "#09090b",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #e4e4e7",
                      borderRight: "1px solid #e4e4e7",
                    }}
                  >
                    {t("pricing.planTypes.basic")}
                  </th>
                  <th
                    style={{
                      padding: "18px 24px",
                      textAlign: "center",
                      fontWeight: "700",
                      color: "#09090b",
                      textTransform: "uppercase",
                      borderBottom: "1px solid #e4e4e7",
                    }}
                  >
                    {t("pricing.planTypes.premium")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_FEATURES.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i === COMPARE_FEATURES.length - 1
                          ? "none"
                          : "1px solid #e4e4e7",
                    }}
                  >
                    <td
                      style={{
                        padding: "18px 24px",
                        color: "#09090b",
                        fontWeight: "500",
                        fontSize: "14px",
                        borderRight: "1px solid #e4e4e7",
                        textAlign: "left",
                      }}
                    >
                      {t(row.featureKey)}
                    </td>
                    {[
                      PLAN_TYPES.FREE,
                      PLAN_TYPES.BASIC,
                      PLAN_TYPES.PREMIUM,
                    ].map((plan, idx) => {
                      const val = row[plan];
                      let cellContent;
                      if (typeof val === "boolean") {
                        cellContent = val ? (
                          <span
                            style={{
                              color: "#16a34a",
                              fontWeight: "700",
                              fontSize: "16px",
                            }}
                          >
                            ✓
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#ef4444",
                              fontWeight: "700",
                              fontSize: "16px",
                            }}
                          >
                            ✕
                          </span>
                        );
                      } else if (typeof val === "string") {
                        cellContent =
                          val.startsWith("pricing.") ||
                          val.startsWith("common.")
                            ? t(val)
                            : val;
                      } else {
                        cellContent = val;
                      }

                      return (
                        <td
                          key={plan}
                          style={{
                            padding: "18px 24px",
                            textAlign: "center",
                            fontSize: "14px",
                            color: "#27272a",
                            fontWeight: "500",
                            borderRight:
                              idx === 2 ? "none" : "1px solid #e4e4e7",
                          }}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pricing FAQs */}
        <div style={{ marginTop: "24px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#202223",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>©</span> {t("pricing.pricingFaqsTitle")}
          </h2>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            {PRICING_FAQ_KEYS.map((item, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #e1e3e5",
                  borderRadius: "8px",
                  marginBottom: i === PRICING_FAQ_KEYS.length - 1 ? 0 : "8px",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#202223",
                    textAlign: "left",
                  }}
                >
                  {t(item.qKey)}
                  <span
                    style={{
                      color: "#6d7175",
                      fontSize: "12px",
                      flexShrink: 0,
                      marginLeft: "12px",
                    }}
                  >
                    {openFaq === i ? "▲" : "▼"}
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: "0 16px 14px",
                      fontSize: "13px",
                      color: "#6d7175",
                      lineHeight: "1.6",
                      borderTop: "1px solid #f1f1f1",
                      paddingTop: "12px",
                    }}
                  >
                    {t(item.aKey)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </s-section>

      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onApply={(code) => {
          console.log("Discount code applied:", code);
        }}
      />
    </s-page>
  );
}
