import { useState, useEffect } from "react";
import { useNavigate, useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { SaveBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import PreviewPanel from "../components/checkout-verification/PreviewPanel";
import ConditionSettings from "../components/checkout-verification/ConditionSettings";
import BannerSettings from "../components/checkout-verification/BannerSettings";

const DEFAULT_CONFIG = {
  status: "disabled",
  target: "always",
  heading: "You must be at least 18 years old to purchase these products",
  selectedCollections: [],
  selectedProducts: [],
};

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
    : DEFAULT_CONFIG;

  return { config };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

  const shopResponse = await admin.graphql(`{ shop { id } }`);
  const shopData = await shopResponse.json();
  const shopId = shopData.data.shop.id;

  const response = await admin.graphql(
    `#graphql
    mutation setCheckoutBanner($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            namespace: "avd_app",
            key: "checkout_banner",
            type: "json",
            value: JSON.stringify(config),
            ownerId: shopId,
          },
        ],
      },
    },
  );
  const responseData = await response.json();
  return { success: !responseData.data.metafieldsSet.userErrors?.length };
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutVerificationSetup() {
  const navigate = useNavigate();
  const { config: initialConfig } = useLoaderData();
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState("condition");
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isDirty = JSON.stringify(config) !== JSON.stringify(initialConfig);

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Banner settings saved");
    }
  }, [fetcher.data, shopify]);

  const handleSave = () => {
    fetcher.submit({ config: JSON.stringify(config) }, { method: "POST" });
  };

  const handleDiscard = () => {
    setConfig(initialConfig);
  };

  const handleConfigChange = (updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

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
      <SaveBar id="checkout-banner-save-bar" open={isDirty}>
        <button variant="primary" onClick={handleSave}>
          Save
        </button>
        <button onClick={handleDiscard}>Discard</button>
      </SaveBar>

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
            <ConditionSettings config={config} onChange={handleConfigChange} />
          ) : (
            <BannerSettings config={config} onChange={handleConfigChange} />
          )}
        </div>

        {/* Right Panel */}
        <PreviewPanel config={config} />
      </div>
    </div>
  );
}
