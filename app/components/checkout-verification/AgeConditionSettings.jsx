import SettingsSection from "./SettingsSection";
import { Badge } from "../Badge";
import { ShopifyPlusBadge } from "../ShopifyPlusBadge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";
import { RadioOption } from "../customization/RadioOption";
import { ResourcePickerList } from "../ResourcePickerList";
import { VERIFICATION_METHODS } from "../../constants/checkout-verification";

export default function AgeConditionSettings({
  config,
  onChange,
  isShopifyPlus,
}) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const plusRestricted = !isShopifyPlus;
  const statusAccessDenied = !canAccess("checkout.verification.status");
  const targetAccessDenied = !canAccess("checkout.verification.target");
  const methodAccessDenied = !canAccess("checkout.verification.method");
  const disabled = plusRestricted || targetAccessDenied;
  const methodDisabled = plusRestricted || methodAccessDenied;
  const statusDisabled = plusRestricted || statusAccessDenied;

  const handleStatusChange = (status) => {
    onChange({ status });
  };

  const handleMethodChange = (verificationMethod) => {
    onChange({ verificationMethod });
  };

  const handleTargetChange = (target) => {
    onChange({ target });
  };

  return (
    <>
      <SettingsSection
        title={t("checkoutVerification.checkoutInfo")}
        divider
        badge={
          plusRestricted ? (
            <ShopifyPlusBadge />
          ) : statusAccessDenied || methodAccessDenied ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null
        }
      >
        <div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#202223" }}>
            {t("checkoutVerification.verificationStatus")}
          </span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <RadioOption
              label={t("common.enabled")}
              name="verification-status"
              value="enabled"
              selected={config.status === "enabled"}
              disabled={statusDisabled}
              onChange={handleStatusChange}
            />
            <RadioOption
              label={t("common.disabled")}
              name="verification-status"
              value="disabled"
              selected={config.status === "disabled"}
              disabled={statusDisabled}
              onChange={handleStatusChange}
            />
          </div>
        </div>

        <div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#202223" }}>
            {t("checkoutVerification.verificationMethod")}
          </span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <RadioOption
                label={t("checkoutVerification.methodCheckbox")}
                name="verification-method"
                value={VERIFICATION_METHODS.CHECKBOX}
                selected={
                  (config.verificationMethod ||
                    VERIFICATION_METHODS.CHECKBOX) ===
                  VERIFICATION_METHODS.CHECKBOX
                }
                disabled={methodDisabled}
                onChange={handleMethodChange}
              />
            </div>

            <div>
              <RadioOption
                label={t("checkoutVerification.methodDateOfBirth")}
                name="verification-method"
                value={VERIFICATION_METHODS.DATE_OF_BIRTH}
                selected={
                  config.verificationMethod ===
                  VERIFICATION_METHODS.DATE_OF_BIRTH
                }
                disabled={methodDisabled}
                onChange={handleMethodChange}
              />
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("checkoutVerification.condition")}
        divider
        badge={
          plusRestricted ? (
            <ShopifyPlusBadge />
          ) : targetAccessDenied ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null
        }
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#202223" }}>
          {t("checkoutVerification.displayPages")}
        </span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Always */}
          <RadioOption
            label={t("checkoutVerification.conditionAlways")}
            name="verification-target"
            value="always"
            selected={config.target === "always"}
            disabled={disabled}
            onChange={handleTargetChange}
          />

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
            {config.target === "collection" && (
              <ResourcePickerList
                type="collection"
                selectedIds={config.selectedCollections || []}
                titles={config._collectionTitles || []}
                disabled={disabled}
                onChange={({ ids, titles }) =>
                  onChange({
                    selectedCollections: ids,
                    _collectionTitles: titles,
                  })
                }
              />
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
            {config.target === "product" && (
              <ResourcePickerList
                type="product"
                selectedIds={config.selectedProducts || []}
                titles={config._productTitles || []}
                disabled={disabled}
                onChange={({ ids, titles }) =>
                  onChange({ selectedProducts: ids, _productTitles: titles })
                }
              />
            )}
          </div>
        </div>
      </SettingsSection>
    </>
  );
}
