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

  // Discover the actual Metaobject type handle
  const defResponse = await admin.graphql(
    `#graphql
    query getDefinition {
      metaobjectDefinitionByType(type: "$app:checkout_settings") {
        type
      }
    }`,
  );
  const defData = await defResponse.json();
  const typeHandle =
    defData.data.metaobjectDefinitionByType?.type || "app--checkout_settings";

  const response = await admin.graphql(
    `#graphql
    query getCheckoutBanner($type: String!) {
      metaobjects(type: $type, first: 1) {
        nodes {
          id
          config: field(key: "config") { value }
        }
      }
    }`,
    { variables: { type: typeHandle } },
  );
  const data = await response.json();
  const node = data.data.metaobjects.nodes[0];
  const config = node ? JSON.parse(node.config.value) : DEFAULT_CONFIG;

  return { config, metaobjectId: node?.id };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

  // Discover the actual Metaobject type handle
  const defResponse = await admin.graphql(
    `#graphql
    query getDefinition {
      metaobjectDefinitionByType(type: "$app:checkout_settings") {
        type
      }
    }`,
  );
  const defData = await defResponse.json();
  const typeHandle =
    defData.data.metaobjectDefinitionByType?.type || "app--checkout_settings";

  // Check if we have an existing entry
  const checkResponse = await admin.graphql(
    `#graphql
    query checkCheckout($type: String!) {
      metaobjects(type: $type, first: 1) {
        nodes { id }
      }
    }`,
    { variables: { type: typeHandle } },
  );
  const checkData = await checkResponse.json();
  const existingId = checkData.data.metaobjects.nodes[0]?.id;

  let response;
  if (existingId) {
    response = await admin.graphql(
      `#graphql
      mutation updateCheckout($id: ID!, $metaobject: MetaobjectUpdateInput!) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
          metaobject { id }
          userErrors { field message }
        }
      }`,
      {
        variables: {
          id: existingId,
          metaobject: {
            fields: [{ key: "config", value: JSON.stringify(config) }],
          },
        },
      },
    );
  } else {
    response = await admin.graphql(
      `#graphql
      mutation createCheckout($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject { id }
          userErrors { field message }
        }
      }`,
      {
        variables: {
          metaobject: {
            type: typeHandle,
            fields: [{ key: "config", value: JSON.stringify(config) }],
          },
        },
      },
    );
  }

  const responseData = await response.json();
  const errors =
    responseData.data?.metaobjectUpdate?.userErrors ||
    responseData.data?.metaobjectCreate?.userErrors;

  return { success: !errors?.length };
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutVerificationSetup() {
  const navigate = useNavigate();
  const { config: initialConfig } = useLoaderData();
  const [config, setConfig] = useState(initialConfig);
  // Reset config when initialConfig changes (e.g. after save or navigation)
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

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
