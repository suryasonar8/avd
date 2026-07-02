/* eslint-disable react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
import { RadioOption } from "./RadioOption";

export function DisplayPagesChoiceList({ config, setConfig }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const shopify = useAppBridge();
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
        <div style={{ marginBottom: "8px", paddingLeft: "26px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              {t("popupEditor.infoTab.selectedCollections")}
            </label>
            <s-button
              onClick={async () => {
                try {
                  const selected = await shopify.resourcePicker({
                    type: "collection",
                    multiple: true,
                    selectionIds: (config.selectedCollections || []).map(
                      (id) => ({ id }),
                    ),
                  });
                  if (selected) {
                    setConfig((prev) => ({
                      ...prev,
                      selectedCollections: selected.map((c) => c.id),
                      _collectionTitles: selected.map((c) => c.title),
                      selectedCollectionHandles: selected.map((c) => c.handle),
                    }));
                  }
                } catch (e) {
                  console.error("Picker error:", e);
                }
              }}
            >
              {t("popupEditor.infoTab.selectCollections")}
            </s-button>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {(config.selectedCollections || []).map((id, i) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  background: "#F1F1F1",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {(config._collectionTitles || [])[i] ||
                  id.replace("gid://shopify/Collection/", "#")}
                <span
                  onClick={() => {
                    const newIds = config.selectedCollections.filter(
                      (item) => item !== id,
                    );
                    const newTitles = config._collectionTitles.filter(
                      (_, idx) => idx !== i,
                    );
                    const newHandles = (
                      config.selectedCollectionHandles || []
                    ).filter((_, idx) => idx !== i);
                    setConfig((prev) => ({
                      ...prev,
                      selectedCollections: newIds,
                      _collectionTitles: newTitles,
                      selectedCollectionHandles: newHandles,
                    }));
                  }}
                  style={{
                    cursor: "pointer",
                    color: "#6D7175",
                    fontWeight: "bold",
                  }}
                >
                  ×
                </span>
              </div>
            ))}
            {(config.selectedCollections || []).length === 0 && (
              <p style={{ fontSize: "12px", color: "#6D7175" }}>
                {t("popupEditor.infoTab.noCollectionsSelected")}
              </p>
            )}
          </div>
        </div>
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
        <div style={{ marginBottom: "8px", paddingLeft: "26px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <label style={{ fontSize: "12px", fontWeight: "600" }}>
              {t("popupEditor.infoTab.selectedProducts")}
            </label>
            <s-button
              onClick={async () => {
                try {
                  const selected = await shopify.resourcePicker({
                    type: "product",
                    multiple: true,
                    selectionIds: (config.selectedProducts || []).map((id) => ({
                      id,
                    })),
                  });
                  if (selected) {
                    setConfig((prev) => ({
                      ...prev,
                      selectedProducts: selected.map((p) => p.id),
                      _productTitles: selected.map((p) => p.title),
                      selectedProductHandles: selected.map((p) => p.handle),
                    }));
                  }
                } catch (e) {
                  console.error("Picker error:", e);
                }
              }}
            >
              {t("popupEditor.infoTab.selectProducts")}
            </s-button>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {(config.selectedProducts || []).map((id, i) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  background: "#F1F1F1",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {(config._productTitles || [])[i] ||
                  id.replace("gid://shopify/Product/", "#")}
                <span
                  onClick={() => {
                    const newIds = config.selectedProducts.filter(
                      (item) => item !== id,
                    );
                    const newTitles = config._productTitles.filter(
                      (_, idx) => idx !== i,
                    );
                    const newHandles = (
                      config.selectedProductHandles || []
                    ).filter((_, idx) => idx !== i);
                    setConfig((prev) => ({
                      ...prev,
                      selectedProducts: newIds,
                      _productTitles: newTitles,
                      selectedProductHandles: newHandles,
                    }));
                  }}
                  style={{
                    cursor: "pointer",
                    color: "#6D7175",
                    fontWeight: "bold",
                  }}
                >
                  ×
                </span>
              </div>
            ))}
            {(config.selectedProducts || []).length === 0 && (
              <p style={{ fontSize: "12px", color: "#6D7175" }}>
                {t("popupEditor.infoTab.noProductsSelected")}
              </p>
            )}
          </div>
        </div>
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
        <div style={{ marginBottom: "8px", paddingLeft: "26px" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "8px",
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
