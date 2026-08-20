/* eslint-disable react/prop-types */
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

export default function CheckoutConditionSettings({
  checkoutSettings,
  setCheckoutSettings,
  checkoutEditorUrl,
}) {
  const { t } = useTranslation();
  const { canAccess } = usePlan();

  return (
    <>
      {/* Status */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E1E3E5",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700 }}>
            {t("common.status")}
          </span>
          {!canAccess("terms.checkout.status") && (
            <Badge text={t("common.premiumPlan")} type="premium" />
          )}
        </div>
        <s-choice-list
          name="checkout-status"
          values={[String(checkoutSettings.enabled)]}
          onChange={(e) =>
            setCheckoutSettings({
              ...checkoutSettings,
              enabled: e.currentTarget.values[0] === "true",
            })
          }
          disabled={!canAccess("terms.checkout.status")}
        >
          <s-choice value="true" selected={checkoutSettings.enabled === true}>
            {t("common.enabled")}
          </s-choice>
          <s-choice value="false" selected={checkoutSettings.enabled === false}>
            {t("common.disabled")}
          </s-choice>
        </s-choice-list>
      </div>

      {/* Trigger condition */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E1E3E5",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 700 }}>
            {t("popupEditor.infoTab.triggerCondition")}
          </span>
          {!canAccess("terms.checkout.trigger") && (
            <Badge text={t("common.premiumPlan")} type="premium" />
          )}
        </div>
        <s-choice-list
          name="checkout-trigger"
          values={[checkoutSettings.triggerCondition]}
          onChange={(e) =>
            setCheckoutSettings({
              ...checkoutSettings,
              triggerCondition: e.currentTarget.values[0],
            })
          }
          disabled={!canAccess("terms.checkout.trigger")}
        >
          <s-choice
            value="always"
            selected={checkoutSettings.triggerCondition === "always"}
          >
            {t("storeVerification.triggerOptions.alwaysShow")}
          </s-choice>
          <s-choice
            value="logged"
            selected={checkoutSettings.triggerCondition === "logged"}
          >
            {t("storeVerification.triggerOptions.loggedCustomers")}
          </s-choice>
          <s-choice
            value="not_logged"
            selected={checkoutSettings.triggerCondition === "not_logged"}
          >
            {t("storeVerification.triggerOptions.notLoggedCustomers")}
          </s-choice>
        </s-choice-list>
      </div>

      {/* Configuration */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E1E3E5",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700 }}>
          {t("termsAndConditions.configuration")}
        </span>
        <s-text color="subdued">
          {t("termsAndConditions.configurationDescription")}
        </s-text>
        <s-button
          variant="secondary"
          size="slim"
          onClick={() => window.open(checkoutEditorUrl, "_blank")}
        >
          {t("termsAndConditions.goToCheckoutEditor")}
        </s-button>
      </div>
    </>
  );
}
