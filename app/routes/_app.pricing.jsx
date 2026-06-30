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
import { useIsMounted } from "../hooks/useIsMounted";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function PlansPage() {
  const isMounted = useIsMounted();
  const [billing, setBilling] = useState("yearly");
  const [openFaq, setOpenFaq] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const { t } = useTranslation();

  if (!isMounted) {
    return null;
  }

  const basicMonthly = billing === "yearly" ? 2.99 : 3.99;
  const premiumMonthly = billing === "yearly" ? 6.75 : 8.99;
  const basicAnnual = (basicMonthly * 12).toFixed(2);
  const premiumAnnual = (premiumMonthly * 12).toFixed(2);

  return (
    <s-page heading={t("pricing.pageTitle")}>
      {/* Support button */}
      <s-button
        slot="primary-action"
        variant="plain"
        href="mailto:support@example.com"
      >
        {t("common.support")}
      </s-button>

      {/* Billing toggle */}
      <s-section>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              border: "1px solid #c9cccf",
              borderRadius: "8px",
              overflow: "hidden",
              background: "#f6f6f7",
            }}
          >
            <button
              onClick={() => setBilling("monthly")}
              style={{
                padding: "8px 20px",
                border: "none",
                background: billing === "monthly" ? "#ffffff" : "transparent",
                fontWeight: billing === "monthly" ? "600" : "400",
                color: billing === "monthly" ? "#202223" : "#6d7175",
                cursor: "pointer",
                fontSize: "14px",
                borderRadius: billing === "monthly" ? "7px" : "0",
                boxShadow:
                  billing === "monthly" ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.2s",
              }}
            >
              {t("pricing.billedMonthly")}
            </button>
            <button
              onClick={() => setBilling("yearly")}
              style={{
                padding: "8px 20px",
                border: "none",
                background: billing === "yearly" ? "#ffffff" : "transparent",
                fontWeight: billing === "yearly" ? "600" : "400",
                color: billing === "yearly" ? "#202223" : "#6d7175",
                cursor: "pointer",
                fontSize: "14px",
                borderRadius: billing === "yearly" ? "7px" : "0",
                boxShadow:
                  billing === "yearly" ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              {t("pricing.billedYearly")}{" "}
              <span
                style={{
                  background: "#e3f1e3",
                  color: "#1c6b1c",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "99px",
                }}
              >
                {t("pricing.save25")}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Basic Plan */}
          <div
            style={{
              border: "1px solid #c9cccf",
              borderRadius: "12px",
              padding: "24px",
              background: "#ffffff",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6d7175",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {t("pricing.planTypes.basic")}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "6px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#202223",
                }}
              >
                ${basicMonthly}
              </span>
              <span style={{ fontSize: "14px", color: "#6d7175" }}>
                {t("pricing.perMonth")}
              </span>
              <span
                style={{
                  background: "#e3f1e3",
                  color: "#1c6b1c",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "99px",
                  marginLeft: "4px",
                }}
              >
                {t("pricing.percentOff")}
              </span>
            </div>
            {billing === "yearly" && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#6d7175",
                  marginBottom: "16px",
                }}
              >
                {t("pricing.billedOnceAYear", { amount: `$${basicAnnual}` })}
              </p>
            )}
            <div style={{ margin: "16px 0" }}>
              <s-button variant="primary" fullWidth>
                {t("pricing.startFreeTrial")}
              </s-button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {BASIC_FEATURE_KEYS.map((fKey, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    padding: "5px 0",
                    fontSize: "13px",
                    color: "#202223",
                  }}
                >
                  <span
                    style={{
                      color: "#1c6b1c",
                      fontWeight: "700",
                      marginTop: "1px",
                    }}
                  >
                    ✓
                  </span>
                  {t(fKey)}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Plan */}
          <div
            style={{
              border: "2px solid #202223",
              borderRadius: "12px",
              padding: "24px",
              background: "#ffffff",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6d7175",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {t("pricing.planTypes.premium")}
              </p>
              <span
                style={{
                  background: "#ffd79d",
                  color: "#7c5c00",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "99px",
                }}
              >
                {t("pricing.mostPopular")}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "6px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#202223",
                }}
              >
                ${premiumMonthly}
              </span>
              <span style={{ fontSize: "14px", color: "#6d7175" }}>
                {t("pricing.perMonth")}
              </span>
              <span
                style={{
                  background: "#e3f1e3",
                  color: "#1c6b1c",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 6px",
                  borderRadius: "99px",
                  marginLeft: "4px",
                }}
              >
                {t("pricing.percentOff")}
              </span>
            </div>
            {billing === "yearly" && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#6d7175",
                  marginBottom: "16px",
                }}
              >
                {t("pricing.billedOnceAYear", { amount: `$${premiumAnnual}` })}
              </p>
            )}
            <div style={{ margin: "16px 0" }}>
              <s-button variant="primary" fullWidth>
                {t("pricing.startFreeTrial")}
              </s-button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {PREMIUM_FEATURE_KEYS.map((fKey, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    padding: "5px 0",
                    fontSize: "13px",
                    color: "#202223",
                    fontWeight: i === 0 ? "600" : "400",
                  }}
                >
                  {i === 0 ? (
                    <span style={{ fontSize: "15px" }}>⭐</span>
                  ) : (
                    <span
                      style={{
                        color: "#1c6b1c",
                        fontWeight: "700",
                        marginTop: "1px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                  {t(fKey)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Free Plan */}
        <div
          style={{
            border: "1px solid #c9cccf",
            borderRadius: "12px",
            padding: "24px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6d7175",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {t("pricing.planTypes.free")}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "4px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#202223",
                }}
              >
                $0
              </span>
              <span style={{ fontSize: "14px", color: "#6d7175" }}>
                {t("pricing.perMonth")}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#6d7175", margin: 0 }}>
              {t("pricing.bestSuitedForTesting")}
            </p>
          </div>
          <div>
            <span
              style={{
                border: "1px solid #c9cccf",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                color: "#6d7175",
                background: "#f6f6f7",
              }}
            >
              {t("pricing.yourCurrentPlan")}
            </span>
          </div>
        </div>

        {/* Compare plan features bar */}
        <div
          style={{
            border: "1px solid #e1e3e5",
            borderRadius: "8px",
            padding: "14px 20px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#202223",
                margin: 0,
              }}
            >
              {t("pricing.comparePlanFeatures")}
            </p>
            <p
              style={{ fontSize: "12px", color: "#6d7175", margin: "2px 0 0" }}
            >
              {t("pricing.compareDescription")}
            </p>
          </div>
          <button
            onClick={() => setShowCompare(!showCompare)}
            style={{
              border: "1px solid #c9cccf",
              borderRadius: "6px",
              background: "#f6f6f7",
              color: "#202223",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              padding: "8px 14px",
              flexShrink: 0,
              marginLeft: "16px",
            }}
          >
            {showCompare ? t("common.hide") : t("common.showMore")}
          </button>
        </div>

        {/* Comparison table */}
        {showCompare && (
          <div
            style={{
              border: "1px solid #c9cccf",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "#f6f6f7" }}>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#202223",
                      borderBottom: "1px solid #e1e3e5",
                    }}
                  >
                    {t("common.feature")}
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#202223",
                      borderBottom: "1px solid #e1e3e5",
                    }}
                  >
                    {t("pricing.planTypes.free")}
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#202223",
                      borderBottom: "1px solid #e1e3e5",
                    }}
                  >
                    {t("pricing.planTypes.basic")}
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#202223",
                      borderBottom: "1px solid #e1e3e5",
                    }}
                  >
                    {t("pricing.planTypes.premium")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_FEATURES.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e1e3e5" }}>
                    <td style={{ padding: "10px 16px", color: "#202223" }}>
                      {t(row.featureKey)}
                    </td>
                    {[
                      PLAN_TYPES.FREE,
                      PLAN_TYPES.BASIC,
                      PLAN_TYPES.PREMIUM,
                    ].map((plan) => (
                      <td
                        key={plan}
                        style={{ padding: "10px 16px", textAlign: "center" }}
                      >
                        {typeof row[plan] === "boolean" ? (
                          row[plan] ? (
                            <span
                              style={{ color: "#1c6b1c", fontWeight: "700" }}
                            >
                              ✓
                            </span>
                          ) : (
                            <span style={{ color: "#c9cccf" }}>—</span>
                          )
                        ) : (
                          <span style={{ color: "#202223" }}>
                            {typeof row[plan] === "string"
                              ? t(row[plan])
                              : row[plan]}
                          </span>
                        )}
                      </td>
                    ))}
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
          {PRICING_FAQ_KEYS.map((item, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e1e3e5",
                borderRadius: "8px",
                marginBottom: "8px",
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

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "32px",
            paddingTop: "16px",
            borderTop: "1px solid #e1e3e5",
            fontSize: "13px",
            color: "#6d7175",
          }}
        >
          {t("pricing.footerText")}
        </div>
      </s-section>
    </s-page>
  );
}
