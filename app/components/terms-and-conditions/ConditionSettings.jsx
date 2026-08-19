/* eslint-disable react/prop-types */
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

export default function ConditionSettings({ termsSettings, setTermsSettings }) {
  const { t } = useTranslation();
  const { canAccess } = usePlan();

  const togglePage = (page) => {
    setTermsSettings((prev) => {
      const displayPages = prev.displayPages.includes(page)
        ? prev.displayPages.filter((p) => p !== page)
        : [...prev.displayPages, page];
      return { ...prev, displayPages };
    });
  };

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
          {!canAccess("terms.condition.status") && (
            <Badge text={t("common.premiumPlan")} type="premium" />
          )}
        </div>
        <s-choice-list
          name="status"
          values={[String(termsSettings.enabled)]}
          onChange={(e) =>
            setTermsSettings({
              ...termsSettings,
              enabled: e.currentTarget.values[0] === "true",
            })
          }
          disabled={!canAccess("terms.condition.status")}
        >
          <s-choice value="true" selected={termsSettings.enabled === true}>
            {t("common.enabled")}
          </s-choice>
          <s-choice value="false" selected={termsSettings.enabled === false}>
            {t("common.disabled")}
          </s-choice>
        </s-choice-list>
      </div>

      {/* Display page(s) + Trigger condition */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E1E3E5",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Display page(s) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 700 }}>
              {t("popupEditor.infoTab.displayPages")}
            </span>
            <span style={{ fontSize: "12px", color: "#6D7175" }}>*</span>
            {!canAccess("terms.condition.pages") && (
              <Badge text={t("common.premiumPlan")} type="premium" />
            )}
          </div>
          <s-checkbox
            label={t("termsAndConditions.productPage")}
            checked={termsSettings.displayPages.includes("product")}
            onChange={() => togglePage("product")}
            disabled={!canAccess("terms.condition.pages")}
          />
          <s-checkbox
            label={t("termsAndConditions.cartPage")}
            checked={termsSettings.displayPages.includes("cart")}
            onChange={() => togglePage("cart")}
            disabled={!canAccess("terms.condition.pages")}
          />
        </div>

        <s-divider></s-divider>

        {/* Trigger condition */}
        <div
          style={{
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
            {!canAccess("terms.condition.trigger") && (
              <Badge text={t("common.premiumPlan")} type="premium" />
            )}
          </div>
          <s-choice-list
            name="trigger"
            values={[termsSettings.triggerCondition]}
            onChange={(e) =>
              setTermsSettings({
                ...termsSettings,
                triggerCondition: e.currentTarget.values[0],
              })
            }
            disabled={!canAccess("terms.condition.trigger")}
          >
            <s-choice
              value="always"
              selected={termsSettings.triggerCondition === "always"}
            >
              {t("storeVerification.triggerOptions.alwaysShow")}
            </s-choice>
            <s-choice
              value="logged"
              selected={termsSettings.triggerCondition === "logged"}
            >
              {t("storeVerification.triggerOptions.loggedCustomers")}
            </s-choice>
            <s-choice
              value="not_logged"
              selected={termsSettings.triggerCondition === "not_logged"}
            >
              {t("storeVerification.triggerOptions.notLoggedCustomers")}
            </s-choice>
          </s-choice-list>
        </div>
      </div>
    </>
  );
}
