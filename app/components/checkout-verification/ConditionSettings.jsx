import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import SettingsSection from "./SettingsSection";
import CustomRadio from "./CustomRadio";

export default function ConditionSettings({ config, onChange }) {
  const shopify = useAppBridge();

  const handleStatusChange = (status) => {
    onChange({ status });
  };

  const handleTargetChange = (target) => {
    onChange({ target });
  };

  const handleSelectCollections = async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: "collection",
        multiple: true,
        selectionIds: (config.selectedCollections || []).map((id) => ({ id })),
      });
      if (selected) {
        onChange({
          selectedCollections: selected.map((c) => c.id),
          _collectionTitles: selected.map((c) => c.title),
        });
      }
    } catch {
      // User cancelled the picker
    }
  };

  const handleSelectProducts = async () => {
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: true,
        selectionIds: (config.selectedProducts || []).map((id) => ({ id })),
      });
      if (selected) {
        onChange({
          selectedProducts: selected.map((p) => p.id),
          _productTitles: selected.map((p) => p.title),
        });
      }
    } catch {
      // User cancelled the picker
    }
  };

  const removeCollection = (id) => {
    const newCollections = (config.selectedCollections || []).filter(
      (c) => c !== id,
    );
    const newTitles = (config._collectionTitles || []).filter(
      (_, i) => (config.selectedCollections || [])[i] !== id,
    );
    onChange({
      selectedCollections: newCollections,
      _collectionTitles: newTitles,
    });
  };

  const removeProduct = (id) => {
    const newProducts = (config.selectedProducts || []).filter((p) => p !== id);
    const newTitles = (config._productTitles || []).filter(
      (_, i) => (config.selectedProducts || [])[i] !== id,
    );
    onChange({ selectedProducts: newProducts, _productTitles: newTitles });
  };

  return (
    <>
      <SettingsSection title="Banner status">
        <CustomRadio
          label="Enabled"
          checked={config.status === "enabled"}
          onChange={() => handleStatusChange("enabled")}
        />
        <CustomRadio
          label="Disabled"
          checked={config.status === "disabled"}
          onChange={() => handleStatusChange("disabled")}
        />
      </SettingsSection>

      <SettingsSection title="Target">
        <CustomRadio
          label="Always"
          description="Always show the banner without any conditions."
          checked={config.target === "always"}
          onChange={() => handleTargetChange("always")}
        />
        <CustomRadio
          label="Specific collection"
          description="Show the banner to selected collection."
          checked={config.target === "collection"}
          onChange={() => handleTargetChange("collection")}
        />

        {config.target === "collection" && (
          <div style={{ marginLeft: "28px", marginTop: "8px" }}>
            <button
              onClick={handleSelectCollections}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
                border: "1px solid #C9CCCF",
                borderRadius: "8px",
                background: "#fff",
                cursor: "pointer",
                color: "#202223",
              }}
            >
              {(config.selectedCollections || []).length > 0
                ? "Change collections"
                : "Select collections"}
            </button>
            {(config.selectedCollections || []).length > 0 && (
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {(config.selectedCollections || []).map((id, i) => (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      background: "#F1F2F4",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span>
                      {(config._collectionTitles || [])[i] ||
                        id.replace("gid://shopify/Collection/", "#")}
                    </span>
                    <button
                      onClick={() => removeCollection(id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#6D7175",
                        padding: "0 4px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <CustomRadio
          label="Specific product"
          description="Show the banner to selected product."
          checked={config.target === "product"}
          onChange={() => handleTargetChange("product")}
        />

        {config.target === "product" && (
          <div style={{ marginLeft: "28px", marginTop: "8px" }}>
            <button
              onClick={handleSelectProducts}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 500,
                border: "1px solid #C9CCCF",
                borderRadius: "8px",
                background: "#fff",
                cursor: "pointer",
                color: "#202223",
              }}
            >
              {(config.selectedProducts || []).length > 0
                ? "Change products"
                : "Select products"}
            </button>
            {(config.selectedProducts || []).length > 0 && (
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {(config.selectedProducts || []).map((id, i) => (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      background: "#F1F2F4",
                      borderRadius: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span>
                      {(config._productTitles || [])[i] ||
                        id.replace("gid://shopify/Product/", "#")}
                    </span>
                    <button
                      onClick={() => removeProduct(id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#6D7175",
                        padding: "0 4px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SettingsSection>
    </>
  );
}
