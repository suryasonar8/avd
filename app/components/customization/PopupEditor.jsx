import { useNavigate } from "react-router";
import { useTranslation } from "../../context/TranslationContext";
import { CustomSaveBar } from "../CustomSaveBar";
import { useEffect, useState, useCallback, useMemo } from "react";
import { InfoTab } from "./InfoTab";
import { BackgroundTab } from "./BackgroundTab";
import { TextTab } from "./TextTab";
import { ButtonTab } from "./ButtonTab";
import { CSSTab } from "./CSSTab";
import { Preview } from "./Preview";
import PageFooter from "../PageFooter";
import PageHeader from "../PageHeader";
import { DEFAULT_STORE_CONFIG as DEFAULT_CONFIG } from "../../constants/store-verification";

const TAB_COMPONENTS = {
  Info: InfoTab,
  Background: BackgroundTab,
  Text: TextTab,
  Button: ButtonTab,
  CSS: CSSTab,
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
  isSubmitting,
  shopify,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    const sanitize = (cfg) => {
      const { id, createdAt, updatedAt, ...rest } = cfg || {};
      return JSON.stringify(rest);
    };

    return sanitize(config) !== sanitize(initialConfig);
  }, [config, initialConfig]);

  const isTargetValid = useMemo(() => {
    if (config.pages === "Specific collections") {
      return (config.selectedCollections || []).length > 0;
    }
    if (config.pages === "Specific products") {
      return (config.selectedProducts || []).length > 0;
    }
    return true;
  }, [config.pages, config.selectedCollections, config.selectedProducts]);

  const canSave =
    isDirty && isTargetValid && !isUploading && !!config.name?.trim();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("saved") === "true") {
      shopify.toast.show(t("common.savedSuccessfully"));
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [shopify, t]);

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
    if (canSave) {
      shopify.toast.show(t("common.saveOrDiscardWarning"), {
        isError: true,
      });
    } else {
      navigate("/store_verification");
    }
  }, [canSave, navigate, shopify, t]);

  const tabs = ["Info", "Background", "Text", "Button", "CSS"];
  const tabTranslationKeys = {
    Info: "popupEditor.tabs.info",
    Background: "popupEditor.tabs.background",
    Text: "popupEditor.tabs.text",
    Button: "popupEditor.tabs.button",
    CSS: "popupEditor.tabs.css",
  };
  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <s-page>
      <CustomSaveBar
        id={saveBarId}
        open={canSave}
        onSave={handleSave}
        onDiscard={handleDiscard}
        state={{ submitting: isSubmitting, data: fetcher?.data }}
        disabled={isUploading || !config.name?.trim() || !isTargetValid}
        saveLabel={isUploading ? t("common.uploading") : t("common.save")}
        onSuccess={onSaveSuccess}
      />

      <PageHeader
        title={heading}
        description={description}
        backAction={handleBack}
      />

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
            {t(tabTranslationKeys[tab])}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(350px, 400px) 1fr",
          gap: "24px",
          alignItems: "start",
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

        <div
          style={{
            position: "sticky",
            top: "20px",
          }}
        >
          <Preview
            config={config}
            setConfig={setConfig}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            globalSettings={localGlobalSettings}
            setGlobalSettings={setLocalGlobalSettings}
          />
        </div>
      </div>
      <PageFooter />
    </s-page>
  );
}
