/* eslint-disable react/prop-types */
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

export default function ConditionSettings({ settings, setSettings }) {
  const { t } = useTranslation();
  const { canAccess } = usePlan();

  const togglePage = (page) => {
    setSettings((prev) => {
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
          gap: "10px",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span style={{ fontSize: "13px", fontWeight: 700 }}>
            {t("common.status")}
          </span>
          {!canAccess("terms.condition.status") && (
            <Badge text={t("common.premiumPlan")} type="premium" />
          )}
        </div>
        <s-choice-list
          name="status"
          onChange={(e) =>
            setSettings({
              ...settings,
              enabled: e.currentTarget.values[0] === "true",
            })
          }
          disabled={!canAccess("terms.condition.status")}
        >
          <s-choice value="true" selected={settings.enabled === true}>{t("common.enabled")}</s-choice>
          <s-choice value="false" selected={settings.enabled === false}>{t("common.disabled")}</s-choice>
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
            gap: "8px",
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
              {t("popupEditor.infoTab.displayPages")}
            </span>
            <span style={{ fontSize: "12px", color: "#6D7175" }}>
              *
            </span>
            {!canAccess("terms.condition.pages") && (
              <Badge text={t("common.premiumPlan")} type="premium" />
            )}
          </div>
          <s-checkbox
            label={t("termsAndConditions.productPage")}
            checked={settings.displayPages.includes("product")}
            onChange={() => togglePage("product")}
            disabled={!canAccess("terms.condition.pages")}
          />
          <s-checkbox
            label={t("termsAndConditions.cartPage")}
            checked={settings.displayPages.includes("cart")}
            onChange={() => togglePage("cart")}
            disabled={!canAccess("terms.condition.pages")}
          />
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #E1E3E5",
            margin: "4px 0",
          }}
        />

        {/* Trigger condition */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
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
            onChange={(e) =>
              setSettings({
                ...settings,
                triggerCondition: e.currentTarget.values[0],
              })
            }
            disabled={!canAccess("terms.condition.trigger")}
          >
            <s-choice value="always" selected={settings.triggerCondition === "always"}>
              {t("storeVerification.triggerOptions.alwaysShow")}
            </s-choice>
            <s-choice value="logged" selected={settings.triggerCondition === "logged"}>
              {t("storeVerification.triggerOptions.loggedCustomers")}
            </s-choice>
            <s-choice value="not_logged" selected={settings.triggerCondition === "not_logged"}>
              {t("storeVerification.triggerOptions.notLoggedCustomers")}
            </s-choice>
          </s-choice-list>
        </div>
      </div>
    </>
  );
}
