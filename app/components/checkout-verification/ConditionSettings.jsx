import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import SettingsSection from "./SettingsSection";
import CustomRadio from "./CustomRadio";
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

export default function ConditionSettings({ config, onChange }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const shopify = useAppBridge();
  const disabled = !canAccess("checkout.condition.target");

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
      <SettingsSection
        title={t("checkoutVerification.bannerStatus")}
        badge={
          !canAccess("checkout.condition.status") ? (
            <Badge text={t("common.basicPlanOrHigher")} type="basic" />
          ) : null
        }
      >
        <s-choice-list
          name="status"
          value={config.status}
          onChange={(e) => handleStatusChange(e.currentTarget.value)}
          disabled={!canAccess("checkout.condition.status")}
        >
          <s-choice value="enabled">{t("common.enabled")}</s-choice>
          <s-choice value="disabled">{t("common.disabled")}</s-choice>
        </s-choice-list>
      </SettingsSection>

      <SettingsSection
        title={t("checkoutVerification.target")}
        badge={
          !canAccess("checkout.condition.target") ? (
            <Badge text={t("common.basicPlanOrHigher")} type="basic" />
          ) : null
        }
      >
        <s-choice-list
          name="target"
          value={config.target}
          onChange={(e) => handleTargetChange(e.currentTarget.value)}
          disabled={!canAccess("checkout.condition.target")}
        >
          <s-choice value="always">
            {t("checkoutVerification.conditionAlways")}
            <s-text slot="details">{t("checkoutVerification.conditionAlwaysDescription")}</s-text>
          </s-choice>

          <s-choice value="collection">
            {t("checkoutVerification.specificCollection")}
            <s-text slot="details">{t("checkoutVerification.specificCollectionDescription")}</s-text>
          </s-choice>

          {config.target === "collection" && (
            <div style={{ marginLeft: "28px", marginTop: "8px", marginBottom: "12px" }}>
              <s-button
                onClick={() => !disabled && handleSelectCollections()}
                disabled={disabled}
              >
                {(config.selectedCollections || []).length > 0
                  ? t("checkoutVerification.changeCollections")
                  : t("checkoutVerification.selectCollections")}
              </s-button>
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
                        {config._collectionTitles && config._collectionTitles[i]
                          ? config._collectionTitles[i]
                          : id.replace("gid://shopify/Collection/", "#")}
                      </span>
                      <s-button
                        variant="plain"
                        onClick={() => removeCollection(id)}
                      >
                        ✕
                      </s-button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <s-choice value="product">
            {t("checkoutVerification.specificProduct")}
            <s-text slot="details">{t("checkoutVerification.specificProductDescription")}</s-text>
          </s-choice>

          {config.target === "product" && (
            <div style={{ marginLeft: "28px", marginTop: "8px" }}>
              <s-button
                onClick={() => !disabled && handleSelectProducts()}
                disabled={disabled}
              >
                {(config.selectedProducts || []).length > 0
                  ? t("checkoutVerification.changeProducts")
                  : t("checkoutVerification.selectProducts")}
              </s-button>
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
                        {config._productTitles && config._productTitles[i]
                          ? config._productTitles[i]
                          : id.replace("gid://shopify/Product/", "#")}
                      </span>
                      <s-button
                        variant="plain"
                        onClick={() => !disabled && removeProduct(id)}
                        disabled={disabled}
                      >
                        ✕
                      </s-button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </s-choice-list>
      </SettingsSection>
    </>
  );
}
