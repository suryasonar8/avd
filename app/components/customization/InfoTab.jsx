/* eslint-disable react/prop-types */
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { DisplayPagesChoiceList } from "./DisplayPagesChoiceList";
import { useTranslation } from "../../context/TranslationContext";

export function InfoTab({ config, setConfig }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();

  const getExampleDate = (order) => {
    let month = t("months.may");
    if (month === "Maggio") month = "Mag";
    else if (month === "Mayo") month = "May";

    switch (order) {
      case "DD,MM,YY":
        return `01-${month}-2024`;
      case "YY,MM,DD":
        return `2024-${month}-01`;
      case "MM,DD,YY":
      default:
        return `${month}-01-2024`;
    }
  };

  return (
    <>
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
          <strong>{t("popupEditor.infoTab.popupInfo")}</strong>
        </s-text>
        <s-divider></s-divider>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              {t("popupEditor.infoTab.status")}
            </label>
            <s-select
              value={config.status}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  status: e.currentTarget.value,
                }))
              }
            >
              <s-option value="Enabled">{t("common.enabled")}</s-option>
              <s-option value="Disabled">{t("common.disabled")}</s-option>
            </s-select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              {t("popupEditor.infoTab.name")}{" "}
              <span style={{ color: "red" }}>*</span>
            </label>
            <s-text-field
              required
              value={config.name}
              placeholder={t("popupEditor.infoTab.enterPopupName")}
              maxLength={255}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, name: e.currentTarget.value }))
              }
            />
            <p
              style={{
                fontSize: "11px",
                color: "#6D7175",
                marginTop: "4px",
              }}
            >
              {t("popupEditor.infoTab.nameHelpText")}
            </p>
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {t("popupEditor.infoTab.method")}
          </label>
          <s-choice-list
            name="method"
            values={[config.method]}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                method: e.currentTarget.values[0],
              }))
            }
          >
            <s-choice value="No input" selected={config.method === "No input"}>
              {t("popupEditor.infoTab.noInput")}
            </s-choice>
            <s-choice
              value="Birthdate entry"
              selected={config.method === "Birthdate entry"}
            >
              {t("popupEditor.infoTab.birthdateEntry")}
            </s-choice>
          </s-choice-list>
        </div>

        {config.method === "Birthdate entry" && (
          <>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {t("popupEditor.infoTab.verifyAge")}
              </label>
              <s-select
                value={String(config.verifyAge || 18)}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    verifyAge: parseInt(e.currentTarget.value) || 0,
                  }))
                }
              >
                {Array.from({ length: 100 }, (_, i) => i + 1).map((age) => (
                  <s-option key={age} value={String(age)}>
                    {age}
                  </s-option>
                ))}
              </s-select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {t("popupEditor.infoTab.dateOrder")}
              </label>
              <s-select
                value={config.dateOrder || "MM,DD,YY"}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    dateOrder: e.currentTarget.value,
                  }))
                }
              >
                <s-option value="MM,DD,YY">MM,DD,YY</s-option>
                <s-option value="DD,MM,YY">DD,MM,YY</s-option>
                <s-option value="YY,MM,DD">YY,MM,DD</s-option>
              </s-select>
              <p
                style={{
                  fontSize: "11px",
                  color: "#6D7175",
                  marginTop: "4px",
                }}
              >
                {t("popupEditor.infoTab.dateOrderHelpText", {
                  date: getExampleDate(config.dateOrder),
                })}
              </p>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
            <strong>{t("popupEditor.infoTab.condition")}</strong>
          </s-text>
          {!canAccess("sv.info.pages.home") ? (
            <Badge text={t("common.basicPlanOrHigher")} type="basic" />
          ) : null}
        </div>
        <s-divider></s-divider>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {t("popupEditor.infoTab.displayPages")}
          </label>
          <DisplayPagesChoiceList config={config} setConfig={setConfig} />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            {t("popupEditor.infoTab.triggerCondition")}
          </label>
          <s-choice-list
            name="trigger"
            values={[config.trigger]}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                trigger: e.currentTarget.values[0],
              }))
            }
          >
            <s-choice
              value="Always show"
              selected={config.trigger === "Always show"}
            >
              {t("popupEditor.infoTab.triggerAlways")}
            </s-choice>
            <s-choice
              value="Logged customers"
              disabled={!canAccess("sv.info.trigger.logged")}
              selected={config.trigger === "Logged customers"}
            >
              {t("popupEditor.infoTab.triggerLogged")}
            </s-choice>
          </s-choice-list>
        </div>
      </div>
    </>
  );
}
