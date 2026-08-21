/* eslint-disable react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";
import { useState } from "react";
import { RadioOption } from "./RadioOption";
import { ResourcePickerList } from "../ResourcePickerList";

export function DisplayPagesChoiceList({ config, setConfig }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const [urlInput, setUrlInput] = useState("");

  const value = config.pages;

  const handleChange = (val) => {
    setConfig((prev) => ({
      ...prev,
      pages: val,
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {/* All pages */}
      <RadioOption
        label={t("displayPages.allPages")}
        value="All pages"
        selected={value === "All pages"}
        disabled={false}
        onChange={handleChange}
      />

      {/* Home page */}
      <RadioOption
        label={t("displayPages.homePage")}
        value="Home page"
        selected={value === "Home page"}
        disabled={!canAccess("sv.info.pages.home")}
        onChange={handleChange}
      />

      {/* Specific collections */}
      <RadioOption
        label={t("displayPages.specificCollections")}
        value="Specific collections"
        selected={value === "Specific collections"}
        disabled={!canAccess("sv.info.pages.collections")}
        onChange={handleChange}
      />

      {config.pages === "Specific collections" && (
        <ResourcePickerList
          type="collection"
          selectedIds={config.selectedCollections || []}
          titles={config._collectionTitles || []}
          handles={config.selectedCollectionHandles || []}
          containerStyle={{ marginBottom: "8px", paddingLeft: "26px" }}
          onChange={({ ids, titles, handles }) =>
            setConfig((prev) => ({
              ...prev,
              selectedCollections: ids,
              _collectionTitles: titles,
              selectedCollectionHandles: handles,
            }))
          }
        />
      )}

      {/* Specific products */}
      <RadioOption
        label={t("displayPages.specificProducts")}
        value="Specific products"
        selected={value === "Specific products"}
        disabled={!canAccess("sv.info.pages.products")}
        onChange={handleChange}
      />

      {config.pages === "Specific products" && (
        <ResourcePickerList
          type="product"
          selectedIds={config.selectedProducts || []}
          titles={config._productTitles || []}
          handles={config.selectedProductHandles || []}
          containerStyle={{ marginBottom: "8px", paddingLeft: "26px" }}
          onChange={({ ids, titles, handles }) =>
            setConfig((prev) => ({
              ...prev,
              selectedProducts: ids,
              _productTitles: titles,
              selectedProductHandles: handles,
            }))
          }
        />
      )}

      {/* Custom URLs */}
      <RadioOption
        label={t("displayPages.custom")}
        value="Custom"
        selected={value === "Custom"}
        disabled={!canAccess("sv.info.pages.custom")}
        onChange={handleChange}
      />

      {config.pages === "Custom" && (
        <div style={{ paddingLeft: "26px" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1 }}>
              <s-text-field
                label={t("popupEditor.infoTab.addCustomUrl")}
                value={urlInput}
                placeholder={t("popupEditor.infoTab.enterUrl")}
                onChange={(e) => setUrlInput(e.currentTarget.value)}
              />
            </div>
            <s-button
              onClick={() => {
                if (urlInput.trim()) {
                  setConfig((prev) => ({
                    ...prev,
                    customUrl: urlInput.trim(),
                  }));
                  setUrlInput("");
                }
              }}
            >
              {t("popupEditor.infoTab.addUrl")}
            </s-button>
          </div>
          {config.customUrl && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "#F1F1F1",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {config.customUrl}
              </span>
              <span
                onClick={() =>
                  setConfig((prev) => ({ ...prev, customUrl: "" }))
                }
                style={{
                  cursor: "pointer",
                  color: "#6D7175",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                ×
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
