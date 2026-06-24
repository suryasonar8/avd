import { useNavigate, useNavigation } from "react-router";
import { SaveBar } from "@shopify/app-bridge-react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { InfoTab } from "./InfoTab";
import { BackgroundTab } from "./BackgroundTab";
import { TextTab } from "./TextTab";
import { ButtonTab } from "./ButtonTab";
import { CSSTab } from "./CSSTab";
import { Preview } from "./Preview";
import { DISPLAY_PAGES } from "../../constants/display-pages";

const TAB_COMPONENTS = {
  Info: InfoTab,
  Background: BackgroundTab,
  Text: TextTab,
  Button: ButtonTab,
  CSS: CSSTab,
};

const DEFAULT_CONFIG = {
  name: "",
  status: "Enabled",
  method: "No input",
  verifyAge: 18,
  dateOrder: "MM,DD,YY",
  pages: DISPLAY_PAGES[0],
  selectedCollections: [],
  _collectionTitles: [],
  selectedCollectionHandles: [],
  selectedProducts: [],
  _productTitles: [],
  selectedProductHandles: [],
  trigger: "Always show",
  background: {
    type: "Solid color background",
    pageColor: "#FFFFFFD9",
    bgColor: "#000000",
    logo: null,
    backgroundImage: null,
    borderColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 0,
  },
  text: {
    heading: "WELCOME TO SHOP",
    subheading: "You must be at least 18 to visit this site",
  },
  button: {
    submitText: "OK",
    cancelText: "CANCEL",
    cancelAction: "redirect",
    redirectUrl: "https://www.google.com/",
    errorMsg: "Enter error message",
    cancelErrorMsg: "Enter error message",
    bgColor: "#FE4D01",
    borderColor: "#FFFFFF",
    borderRadius: 0,
    borderWidth: 0,
    cancelBgColor: "#A0A0A0",
    cancelBorderColor: "#FFFFFF",
    cancelBorderRadius: 0,
    cancelBorderWidth: 0,
  },
  css: "",
};

export function PopupEditor({
  settings,
  globalSettings,
  onSave,
  onSaveSuccess,
  onDiscard,
  heading,
  description,
  saveBarId,
  fetcher,
  shopify,
}) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Info");
  const [previewMode, setPreviewMode] = useState("desktop");

  const initialConfig = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...(settings || {}),
      background: {
        ...DEFAULT_CONFIG.background,
        ...(settings?.background || {}),
      },
      text: {
        ...DEFAULT_CONFIG.text,
        ...(settings?.text || {}),
      },
      button: {
        ...DEFAULT_CONFIG.button,
        ...(settings?.button || {}),
      },
    }),
    [settings],
  );

  const [config, setConfig] = useState(initialConfig);
  const [localGlobalSettings, setLocalGlobalSettings] = useState(
    globalSettings || { showBrandMark: true },
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setLocalGlobalSettings(globalSettings || { showBrandMark: true });
  }, [globalSettings]);

  const isDirty = useMemo(() => {
    const isSubmitting = fetcher
      ? fetcher.state !== "idle"
      : navigation.state !== "idle";
    if (isSubmitting) return false;

    const sanitize = (cfg) => {
      const { id, createdAt, updatedAt, ...rest } = cfg || {};
      return JSON.stringify(rest);
    };

    return sanitize(config) !== sanitize(initialConfig);
  }, [config, initialConfig, fetcher?.state, navigation.state]);

  const isSubmitting = useRef(false);

  useEffect(() => {
    if (fetcher) {
      if (fetcher.state !== "idle") {
        isSubmitting.current = true;
      }

      if (isSubmitting.current && fetcher.state === "idle") {
        if (fetcher.data?.success) {
          shopify.toast.show("Saved successfully");
          isSubmitting.current = false;
          if (onSaveSuccess) {
            onSaveSuccess();
          }
        } else if (
          fetcher.data?.errors ||
          fetcher.data?.data?.metafieldsSet?.userErrors?.length > 0
        ) {
          shopify.toast.show("Error saving: check terminal for details", {
            isError: true,
          });
          isSubmitting.current = false;
        }
      }
    }
  }, [fetcher?.state, fetcher?.data, shopify, onSaveSuccess, fetcher]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("saved") === "true") {
      shopify.toast.show("Saved successfully");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [shopify]);

  const handleSave = useCallback(() => {
    if (isUploading) return;
    onSave(config);
  }, [config, onSave, isUploading]);

  const handleDiscard = useCallback(() => {
    if (onDiscard) {
      onDiscard();
    } else {
      setConfig(initialConfig);
    }
  }, [initialConfig, onDiscard]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      shopify.toast.show("Please save or discard your changes before leaving", {
        isError: true,
      });
    } else {
      navigate("/store_verification");
    }
  }, [isDirty, navigate, shopify]);

  const tabs = ["Info", "Background", "Text", "Button", "CSS"];
  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <s-page>
      <SaveBar id={saveBarId} open={isDirty}>
        <button
          variant="primary"
          onClick={handleSave}
          disabled={isUploading || !config.name?.trim()}
        >
          {isUploading ? "Uploading..." : "Save"}
        </button>
        <button type="button" onClick={handleDiscard}>
          Discard
        </button>
      </SaveBar>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "4px",
          }}
        >
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#1A1C1D",
            }}
          >
            ←
          </button>
          <h2
            style={{
              fontSize: "26px",
              fontWeight: "700",
              margin: 0,
              color: "#1A1C1D",
            }}
          >
            {heading}
          </h2>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: "#6D7175",
            margin: "0 0 0 36px",
          }}
        >
          {description}
        </p>
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ActiveTabComponent && (
            <ActiveTabComponent
              config={config}
              setConfig={setConfig}
              setIsUploading={setIsUploading}
            />
          )}
        </div>

        <Preview
          config={config}
          setConfig={setConfig}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          globalSettings={localGlobalSettings}
          setGlobalSettings={setLocalGlobalSettings}
        />
      </div>
    </s-page>
  );
}
