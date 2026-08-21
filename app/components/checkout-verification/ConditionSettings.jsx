import SettingsSection from "./SettingsSection";
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";
import { RadioOption } from "../customization/RadioOption";
import { ResourcePickerList } from "../ResourcePickerList";

export default function ConditionSettings({ config, onChange }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const disabled = !canAccess("checkout.condition.target");

  const handleStatusChange = (status) => {
    onChange({ status });
  };

  const handleTargetChange = (target) => {
    onChange({ target });
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <RadioOption
            label={t("common.enabled")}
            name="status"
            value="enabled"
            selected={config.status === "enabled"}
            disabled={!canAccess("checkout.condition.status")}
            onChange={handleStatusChange}
          />
          <RadioOption
            label={t("common.disabled")}
            name="status"
            value="disabled"
            selected={config.status === "disabled"}
            disabled={!canAccess("checkout.condition.status")}
            onChange={handleStatusChange}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("checkoutVerification.target")}
        badge={
          !canAccess("checkout.condition.target") ? (
            <Badge text={t("common.basicPlanOrHigher")} type="basic" />
          ) : null
        }
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Always */}
          <div>
            <RadioOption
              label={t("checkoutVerification.conditionAlways")}
              name="target"
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
              name="target"
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
              name="target"
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
