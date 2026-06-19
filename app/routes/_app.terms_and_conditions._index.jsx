import { useState } from "react";
import { useFetcher, useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
    query getShopMetafield {
      shop {
        metafield(namespace: "avd", key: "terms_settings") {
          value
        }
      }
    }`,
  );
  const data = await response.json();
  const settings = data.data.shop.metafield?.value
    ? JSON.parse(data.data.shop.metafield.value)
    : null;

  return { settings };
};

export const action = async ({ request }) => {};

export default function TermsAndConditions() {
  const navigate = useNavigate();
  const { settings } = useLoaderData();
  const [bannerVisible, setBannerVisible] = useState(true);

  const isEnabled = settings?.enabled || false;

  return (
    <s-page heading="Terms and conditions">
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
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
            >
              <span style={{ fontSize: "16px", marginTop: "1px" }}>ℹ️</span>
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
                  Access Terms and Conditions and other advanced features with
                  our Premium plan!
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "4px",
          }}
        >
          <input
            type="checkbox"
            id="accept-terms"
            disabled
            checked={isEnabled}
            style={{ width: "16px", height: "16px" }}
          />
          <label
            htmlFor="accept-terms"
            style={{ fontSize: "14px", color: "#333" }}
          >
            {settings?.checkboxText || "I accept the terms and conditions."}
          </label>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e6e6e6",
            margin: "20px 0",
          }}
        />

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
              <strong style={{ fontSize: "14px" }}>
                Product page &amp; cart page
              </strong>
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
                {isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p
              style={{ margin: "4px 0 0", fontSize: "13px", color: "#6d7175" }}
            >
              Add a checkbox for customers to agree to terms before adding
              product to cart.
            </p>
          </div>
          <s-button
            variant="secondary"
            size="slim"
            onClick={() => navigate("/terms_and_conditions/setup")}
          >
            Customize
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
        Need help? Please view{" "}
        <a href="#" style={{ color: "#2c6ecb", textDecoration: "none" }}>
          our document guideline
        </a>
      </div>
    </s-page>
  );
}
