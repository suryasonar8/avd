import { useAppBridge } from "@shopify/app-bridge-react";
import SettingsSection from "./SettingsSection";
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";
import { RadioOption } from "../customization/RadioOption";
import { VERIFICATION_METHODS } from "../../constants/checkout-verification";

export default function AgeConditionSettings({ config, onChange }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const shopify = useAppBridge();
  const disabled = !canAccess("checkout.verification.target");
  const methodDisabled = !canAccess("checkout.verification.method");

  const handleStatusChange = (status) => {
    onChange({ status });
  };

  const handleMethodChange = (verificationMethod) => {
    onChange({ verificationMethod });
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
        title={t("checkoutVerification.verificationStatus")}
        badge={
          !canAccess("checkout.verification.status") ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null
        }
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <RadioOption
            label={t("common.enabled")}
            name="verification-status"
            value="enabled"
            selected={config.status === "enabled"}
            disabled={!canAccess("checkout.verification.status")}
            onChange={handleStatusChange}
          />
          <RadioOption
            label={t("common.disabled")}
            name="verification-status"
            value="disabled"
            selected={config.status === "disabled"}
            disabled={!canAccess("checkout.verification.status")}
            onChange={handleStatusChange}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("checkoutVerification.verificationMethod")}
        badge={
          methodDisabled ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null
        }
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>
            <RadioOption
              label={t("checkoutVerification.methodCheckbox")}
              name="verification-method"
              value={VERIFICATION_METHODS.CHECKBOX}
              selected={
                (config.verificationMethod || VERIFICATION_METHODS.CHECKBOX) ===
                VERIFICATION_METHODS.CHECKBOX
              }
              disabled={methodDisabled}
              onChange={handleMethodChange}
            />
            <p
              style={{
                margin: "0 0 0 26px",
                fontSize: "12px",
                color: "#6D7175",
              }}
            >
              {t("checkoutVerification.methodCheckboxDescription")}
            </p>
          </div>

          <div>
            <RadioOption
              label={t("checkoutVerification.methodDateOfBirth")}
              name="verification-method"
              value={VERIFICATION_METHODS.DATE_OF_BIRTH}
              selected={
                config.verificationMethod === VERIFICATION_METHODS.DATE_OF_BIRTH
              }
              disabled={methodDisabled}
              onChange={handleMethodChange}
            />
            <p
              style={{
                margin: "0 0 0 26px",
                fontSize: "12px",
                color: "#6D7175",
              }}
            >
              {t("checkoutVerification.methodDateOfBirthDescription")}
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("checkoutVerification.target")}
        badge={
          !canAccess("checkout.verification.target") ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null
        }
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Always */}
          <div>
            <RadioOption
              label={t("checkoutVerification.conditionAlways")}
              name="verification-target"
              value="always"
              selected={config.target === "always"}
              disabled={disabled}
              onChange={handleTargetChange}
            />
            <p
              style={{
                margin: "0 0 0 26px",
                fontSize: "12px",
                color: "#6D7175",
              }}
            >
              {t("checkoutVerification.conditionAlwaysDescription")}
            </p>
          </div>

          {/* Specific Collections */}
          <div>
            <RadioOption
              label={t("checkoutVerification.specificCollection")}
              name="verification-target"
              value="collection"
              selected={config.target === "collection"}
              disabled={disabled}
              onChange={handleTargetChange}
            />
            <p
              style={{
                margin: "0 0 0 26px",
                fontSize: "12px",
                color: "#6D7175",
              }}
            >
              {t("checkoutVerification.specificCollectionDescription")}
            </p>
            {config.target === "collection" && (
              <div style={{ marginTop: "12px", paddingLeft: "26px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>
                    {t("common.selectedCollections")}
                  </label>
                  <s-button
                    onClick={() => !disabled && handleSelectCollections()}
                    disabled={disabled}
                  >
                    {t("common.selectCollections")}
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
                        onClick={() => !disabled && removeCollection(id)}
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
                  {(config.selectedCollections || []).length === 0 && (
                    <p style={{ fontSize: "12px", color: "#6D7175" }}>
                      {t("common.noCollectionsSelected")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Specific Products */}
          <div>
            <RadioOption
              label={t("checkoutVerification.specificProduct")}
              name="verification-target"
              value="product"
              selected={config.target === "product"}
              disabled={disabled}
              onChange={handleTargetChange}
            />
            <p
              style={{
                margin: "0 0 0 26px",
                fontSize: "12px",
                color: "#6D7175",
              }}
            >
              {t("checkoutVerification.specificProductDescription")}
            </p>
            {config.target === "product" && (
              <div style={{ marginTop: "12px", paddingLeft: "26px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <label style={{ fontSize: "12px", fontWeight: "600" }}>
                    {t("common.selectedProducts")}
                  </label>
                  <s-button
                    onClick={() => !disabled && handleSelectProducts()}
                    disabled={disabled}
                  >
                    {t("common.selectProducts")}
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
                        onClick={() => !disabled && removeProduct(id)}
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
                  {(config.selectedProducts || []).length === 0 && (
                    <p style={{ fontSize: "12px", color: "#6D7175" }}>
                      {t("common.noProductsSelected")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </SettingsSection>
    </>
  );
}
