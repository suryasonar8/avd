import { useState } from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const BASIC_FEATURES = [
  "Age verification pop-up",
  "1 Country and language-specific pop-up",
  "Verification by birthday input",
  "Fully customizable pop-up",
  "Restrict specific pages, collections, products, and tags",
  "Verified and unverified reports",
  "Age validation settings",
  "Multiple templates",
  "Restrict underage users with a message",
];

const PREMIUM_FEATURES = [
  "Everything in Basic, plus:",
  "Verify by checkbox",
  "Unlimited country and language pop-ups",
  "Birthday input customization",
  "Restriction message input customization",
  "Button border customization",
  "20+ popup animations",
  "Popup background border customization",
  "Advanced option to add custom JavaScript and CSS",
  "Terms & Conditions: product and cart page",
  "Terms & Conditions: Restrict on specific pages, collections, products, and tags",
  "Checkout page age restriction banner",
  "Birthdate verification on product and cart page",
  "Fully customizable options",
];

const COMPARE_FEATURES = [
  {
    feature: "Age verification pop-up",
    free: true,
    basic: true,
    premium: true,
  },
  {
    feature: "Country & language pop-ups",
    free: "1",
    basic: "1",
    premium: "Unlimited",
  },
  {
    feature: "Verification by birthday input",
    free: false,
    basic: true,
    premium: true,
  },
  {
    feature: "Fully customizable pop-up",
    free: false,
    basic: true,
    premium: true,
  },
  {
    feature: "Restrict by pages/collections/products",
    free: false,
    basic: true,
    premium: true,
  },
  {
    feature: "Verified and unverified reports",
    free: false,
    basic: true,
    premium: true,
  },
  {
    feature: "Age validation settings",
    free: false,
    basic: true,
    premium: true,
  },
  { feature: "Multiple templates", free: false, basic: true, premium: true },
  {
    feature: "Restrict underage users with a message",
    free: false,
    basic: true,
    premium: true,
  },
  { feature: "Verify by checkbox", free: false, basic: false, premium: true },
  {
    feature: "Birthday input customization",
    free: false,
    basic: false,
    premium: true,
  },
  {
    feature: "Button border customization",
    free: false,
    basic: false,
    premium: true,
  },
  { feature: "20+ popup animations", free: false, basic: false, premium: true },
  {
    feature: "Custom JavaScript and CSS",
    free: false,
    basic: false,
    premium: true,
  },
  { feature: "Terms & Conditions", free: false, basic: false, premium: true },
  {
    feature: "Checkout page age restriction banner",
    free: false,
    basic: false,
    premium: true,
  },
  {
    feature: "Birthdate verification on product & cart page",
    free: false,
    basic: false,
    premium: true,
  },
];

export default function PlansPage() {
  const [billing, setBilling] = useState("yearly");
  const [openFaq, setOpenFaq] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  const basicMonthly = billing === "yearly" ? 2.99 : 3.99;
  const premiumMonthly = billing === "yearly" ? 6.75 : 8.99;
  const basicAnnual = (basicMonthly * 12).toFixed(2);
  const premiumAnnual = (premiumMonthly * 12).toFixed(2);

  return (
    <s-page heading="Plans">
      {/* Support button */}
      <s-button
        slot="primary-action"
        variant="plain"
        href="mailto:support@example.com"
      >
        Support
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
              Billed Monthly
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
              Billed Yearly{" "}
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
                Save 25%
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
              BASIC
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
              <span style={{ fontSize: "14px", color: "#6d7175" }}>/month</span>
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
                25% off
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
                ${basicAnnual} billed once a year
              </p>
            )}
            <div style={{ margin: "16px 0" }}>
              <s-button variant="primary" fullWidth>
                Start 3-days FREE Trial
              </s-button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {BASIC_FEATURES.map((f, i) => (
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
                  {f}
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
                PREMIUM
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
                Most Popular
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
              <span style={{ fontSize: "14px", color: "#6d7175" }}>/month</span>
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
                25% off
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
                ${premiumAnnual} billed once a year
              </p>
            )}
            <div style={{ margin: "16px 0" }}>
              <s-button variant="primary" fullWidth>
                Start 3-days FREE Trial
              </s-button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {PREMIUM_FEATURES.map((f, i) => (
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
                  {f}
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
              Free
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
              <span style={{ fontSize: "14px", color: "#6d7175" }}>/month</span>
            </div>
            <p style={{ fontSize: "13px", color: "#6d7175", margin: 0 }}>
              Best suited for testing purposes and maximizing benefits.
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
              Your Current Plan
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
              Compare plan features
            </p>
            <p
              style={{ fontSize: "12px", color: "#6d7175", margin: "2px 0 0" }}
            >
              A comprehensive breakdown of AVP Age Verification&apos;s features.
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
            {showCompare ? "Hide" : "Show more"}
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
                    Feature
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
                    Free
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
                    Basic
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
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_FEATURES.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e1e3e5" }}>
                    <td style={{ padding: "10px 16px", color: "#202223" }}>
                      {row.feature}
                    </td>
                    {["free", "basic", "premium"].map((plan) => (
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
                          <span style={{ color: "#202223" }}>{row[plan]}</span>
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
            <span>©</span> Pricing FAQs
          </h2>
          {[
            {
              q: "1. Does your app offer a free plan?",
              a: "Yes! The Age Verification App offers a free plan that includes a basic age verification pop-up. It's perfect for testing purposes and getting familiar with the app's core features before upgrading.",
            },
            {
              q: "2. How can I stop being charged without uninstalling the app?",
              a: "You can downgrade to our Free plan at any time from the Plans page. This will stop any recurring charges while keeping the app installed in your store with basic features.",
            },
            {
              q: "3. Can I downgrade from a higher paid plan to a lower one?",
              a: "Absolutely. You can switch between plans at any time. When you downgrade, any unused portion of your billing cycle may be credited back to you by Shopify.",
            },
            {
              q: "4. Will my settings be saved if I uninstall the app?",
              a: "If you uninstall the app, your settings will not be preserved. We recommend downgrading to the free plan instead of uninstalling if you plan to return in the future.",
            },
          ].map((item, i) => (
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
                {item.q}
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
                  {item.a}
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
          The Age Verification App is made with{" "}
          <span style={{ color: "#e44c65" }}>❤️</span> by 8Apps
        </div>
      </s-section>
    </s-page>
  );
}
