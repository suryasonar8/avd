/* eslint-disable react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import { useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "../context/TranslationContext";

const GID_PREFIX = {
  collection: "gid://shopify/Collection/",
  product: "gid://shopify/Product/",
};

const LABEL_KEYS = {
  collection: {
    selected: "common.selectedCollections",
    select: "common.selectCollections",
    empty: "common.noCollectionsSelected",
  },
  product: {
    selected: "common.selectedProducts",
    select: "common.selectProducts",
    empty: "common.noProductsSelected",
  },
};

// Resource picker + selected-chips list shared by checkout-verification and
// customization "Specific collection(s)/product(s)" condition sections.
export function ResourcePickerList({
  type,
  selectedIds = [],
  titles = [],
  handles,
  disabled = false,
  containerStyle,
  onChange,
}) {
  const { t } = useTranslation();
  const shopify = useAppBridge();
  const labels = LABEL_KEYS[type];

  const handleSelect = async () => {
    try {
      const selected = await shopify.resourcePicker({
        type,
        multiple: true,
        selectionIds: selectedIds.map((id) => ({ id })),
      });
      if (selected) {
        onChange({
          ids: selected.map((r) => r.id),
          titles: selected.map((r) => r.title),
          handles: selected.map((r) => r.handle),
        });
      }
    } catch {
      // User cancelled the picker
    }
  };

  const handleRemove = (id) => {
    const index = selectedIds.indexOf(id);
    onChange({
      ids: selectedIds.filter((i) => i !== id),
      titles: titles.filter((_, i) => i !== index),
      handles: handles ? handles.filter((_, i) => i !== index) : undefined,
    });
  };

  return (
    <div style={containerStyle || { marginTop: "12px", paddingLeft: "26px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <label style={{ fontSize: "12px", fontWeight: "600" }}>
          {t(labels.selected)}
        </label>
        <s-button
          onClick={() => !disabled && handleSelect()}
          disabled={disabled}
        >
          {t(labels.select)}
        </s-button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {selectedIds.map((id, i) => (
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
            {titles[i] || id.replace(GID_PREFIX[type], "#")}
            <span
              onClick={() => !disabled && handleRemove(id)}
              style={{
                cursor: disabled ? "not-allowed" : "pointer",
                color: "#6D7175",
                fontWeight: "bold",
              }}
            >
              ×
            </span>
          </div>
        ))}
        {selectedIds.length === 0 && (
          <p style={{ fontSize: "12px", color: "#6D7175", margin: 0 }}>
            {t(labels.empty)}
          </p>
        )}
      </div>
    </div>
  );
}
