import { useState } from "react";
import { useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query getCheckoutBanner {
      shop {
        metafield(namespace: "avd_app", key: "checkout_banner") {
          value
        }
      }
    }`,
  );
  const data = await response.json();
  const config = data.data.shop.metafield
    ? JSON.parse(data.data.shop.metafield.value)
    : { status: "disabled" };

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
  const [bannerVisible, setBannerVisible] = useState(true);
  const isEnabled = config.status === "enabled";

  return (
    <s-page heading="Checkout verification">
      {/* Free Plan Limit Banner */}
      {bannerVisible && (
        <s-section>
          <div
            style={{
              backgroundColor: "#d1ecf1",
              border: "1px solid #bee5eb",
              borderRadius: "8px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
            >
              <div
                style={{
                  backgroundColor: "#0c5460",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  marginTop: "2px",
                  flexShrink: 0,
                }}
              >
                i
              </div>
              <div>
                <strong style={{ fontSize: "14px", color: "#0c5460" }}>
                  Free Plan Limit
                </strong>
                <p
                  style={{
                    margin: "4px 0 8px",
                    fontSize: "13px",
                    color: "#0c5460",
                  }}
                >
                  Enable age restriction at checkout - Upgrade your plan today!
                </p>
                <s-button variant="secondary" size="slim">
                  Increase limit
                </s-button>
              </div>
            </div>
            <button
              onClick={() => setBannerVisible(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "#0c5460",
                lineHeight: 1,
                padding: "0",
              }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </s-section>
      )}

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
              Verify your age
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
              You're over 18+
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
              You must be at least 18+
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
                <strong style={{ fontSize: "14px" }}>Info banner</strong>
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
                  {isEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "13px",
                  color: "#6d7175",
                }}
              >
                Create a checkout banner to remind customers of age-restricted
                products.
              </p>
            </div>
            <s-button
              variant="secondary"
              size="slim"
              onClick={() => navigate("/checkout_verification/setup")}
            >
              Customize
            </s-button>
          </div>
        </s-stack>
      </s-section>
    </s-page>
  );
}
