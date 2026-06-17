import { useState } from "react";
import { useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import PreviewPanel from "../components/checkout-verification/PreviewPanel";
import ConditionSettings from "../components/checkout-verification/ConditionSettings";
import BannerSettings from "../components/checkout-verification/BannerSettings";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutVerificationSetup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("condition");

  const tabStyle = (tab) => ({
    padding: "8px 24px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    borderRadius: "10px",
    background: activeTab === tab ? "#E0E0E0" : "transparent",
    color: "#202223",
    transition: "all 0.2s ease",
  });

  return (
    <div
      style={{
        padding: "32px",
        background: "#f6f6f7",
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => navigate("/checkout_verification")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            color: "#202223",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Back"
        >
          ←
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            color: "#202223",
          }}
        >
          Configuration
        </h1>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "transparent",
          padding: "4px",
          borderRadius: "12px",
          marginBottom: "24px",
          width: "fit-content",
          gap: "8px",
        }}
      >
        <button
          style={tabStyle("condition")}
          onClick={() => setActiveTab("condition")}
        >
          Condition
        </button>
        <button
          style={tabStyle("banner")}
          onClick={() => setActiveTab("banner")}
        >
          Banner
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div
          style={{
            width: "320px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {activeTab === "condition" ? (
            <ConditionSettings />
          ) : (
            <BannerSettings />
          )}
        </div>

        {/* Right Panel */}
        <PreviewPanel />
      </div>
    </div>
  );
}
