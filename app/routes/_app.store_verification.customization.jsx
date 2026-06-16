import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { authenticate } from "../shopify.server";
import { InfoTab } from "../components/customization/InfoTab";
import { BackgroundTab } from "../components/customization/BackgroundTab";
import { TextTab } from "../components/customization/TextTab";
import { ButtonTab } from "../components/customization/ButtonTab";
import { CSSTab } from "../components/customization/CSSTab";
import { Preview } from "../components/customization/Preview";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
    query getSettings {
      shop {
        metafield(namespace: "avd_app", key: "settings") {
          value
        }
      }
    }`,
  );
  const data = await response.json();
  return {
    settings: data.data.shop.metafield
      ? JSON.parse(data.data.shop.metafield.value)
      : null,
  };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const config = formData.get("config");

  const shopResponse = await admin.graphql(`{ shop { id } }`);
  const shopData = await shopResponse.json();

  const response = await admin.graphql(
    `#graphql
    mutation setSettings($metafields: [MetafieldsSetInput!]!) {
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
            key: "settings",
            type: "json",
            value: config,
            ownerId: shopData.data.shop.id,
          },
        ],
      },
    },
  );
  return await response.json();
};

const TAB_COMPONENTS = {
  Info: InfoTab,
  Background: BackgroundTab,
  Text: TextTab,
  Button: ButtonTab,
  CSS: CSSTab,
};

export default function StoreVerificationCustomization() {
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const [activeTab, setActiveTab] = useState("Info");
  const [previewMode, setPreviewMode] = useState("desktop");

  const DEFAULT_CONFIG = {
    name: "My Pop-up",
    status: "Enabled",
    method: "No input",
    pages: "All pages",
    trigger: "Always show",
    background: {
      type: "Solid color background",
      pageColor: "#FFFFFFD3",
      bgColor: "#000000",
      logo: null,
      borderColor: "#FFFFFF",
      borderRadius: 0,
      borderWidth: 0,
    },
    text: {
      heading: "WELCOME TO SHOPs",
      subheading: "You must be at least 18 to visit this site",
    },
    button: {
      submitText: "OK",
      cancelText: "CANCEL",
      errorMsg: "Enter error message",
      bgColor: "#FE4D01",
      borderColor: "#FFFFFF",
      borderRadius: 0,
      borderWidth: 0,
    },
    css: "",
  };

  const initialConfig = {
    ...DEFAULT_CONFIG,
    ...loaderData?.settings,
    background: {
      ...DEFAULT_CONFIG.background,
      ...(loaderData?.settings?.background || {}),
    },
    text: {
      ...DEFAULT_CONFIG.text,
      ...(loaderData?.settings?.text || {}),
    },
    button: {
      ...DEFAULT_CONFIG.button,
      ...(loaderData?.settings?.button || {}),
    },
  };

  // State for customization
  const [config, setConfig] = useState(initialConfig);

  const isDirty = JSON.stringify(config) !== JSON.stringify(initialConfig);

  useEffect(() => {
    if (fetcher.data?.data?.metafieldsSet?.metafields) {
      shopify.toast.show("Settings saved successfully");
    } else if (fetcher.data?.data?.metafieldsSet?.userErrors?.length > 0) {
      shopify.toast.show("Error saving settings", { isError: true });
    }
  }, [fetcher.data, shopify]);

  const handleSave = useCallback(() => {
    fetcher.submit({ config: JSON.stringify(config) }, { method: "POST" });
  }, [config, fetcher]);

  const handleDiscard = useCallback(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const saveBarRef = useRef(null);

  useEffect(() => {
    if (isDirty) {
      shopify.saveBar.show("customization-save-bar");
    } else {
      shopify.saveBar.hide("customization-save-bar");
    }
  }, [isDirty, shopify]);

  useEffect(() => {
    const bar = saveBarRef.current;
    if (bar) {
      bar.addEventListener("save", handleSave);
      bar.addEventListener("discard", handleDiscard);
      // Some versions of App Bridge use submit/reset
      bar.addEventListener("submit", handleSave);
      bar.addEventListener("reset", handleDiscard);

      return () => {
        bar.removeEventListener("save", handleSave);
        bar.removeEventListener("discard", handleDiscard);
        bar.removeEventListener("submit", handleSave);
        bar.removeEventListener("reset", handleDiscard);
      };
    }
  }, [handleSave, handleDiscard]);

  const tabs = ["Info", "Background", "Text", "Button", "CSS"];

  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <s-page heading="Configuration">
      <ui-save-bar id="customization-save-bar" ref={saveBarRef}>
        <button variant="primary" onClick={handleSave}>
          Save
        </button>
        <button type="button" onClick={handleDiscard}>
          Discard
        </button>
      </ui-save-bar>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <button
          onClick={() => navigate("/store_verification")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            padding: "4px",
          }}
        >
          ←
        </button>
        <div>
          <p style={{ fontSize: "13px", color: "#6D7175", margin: "4px 0 0" }}>
            Customization the pop-up to match your brand.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === tab ? "#E1E3E5" : "transparent",
              color: activeTab === tab ? "#1A1C1D" : "#6D7175",
              fontWeight: activeTab === tab ? "600" : "500",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(350px, 400px) 1fr",
          gap: "24px",
        }}
      >
        {/* Left Column - Dynamic Content */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ActiveTabComponent && (
            <ActiveTabComponent config={config} setConfig={setConfig} />
          )}
        </div>

        {/* Right Column (Preview) */}
        <Preview
          config={config}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
        />
      </div>
    </s-page>
  );
}
