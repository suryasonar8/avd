import { Badge } from "../Badge";
import { ColorInput } from "../ColorInput";
import { NumberInput } from "../NumberInput";
import { RichTextEditor } from "../RichTextEditor";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";
import { RadioOption } from "./RadioOption";

export function ButtonTab({ config, setConfig }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
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
          <strong>{t("popupEditor.buttonTab.submitButton")}</strong>
        </s-text>
        <s-divider></s-divider>
        <RichTextEditor
          value={config.button.submitText}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, submitText: val },
            }))
          }
        />
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
        <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
          <strong>{t("popupEditor.buttonTab.submitButtonAction")}</strong>
        </s-text>
        <s-divider></s-divider>
        <div>
          <s-text-field
            label={t("popupEditor.buttonTab.errorMessage")}
            value={config.button.errorMsg || ""}
            placeholder="Enter error message"
            maxLength={255}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                button: { ...prev.button, errorMsg: e.currentTarget.value },
              }))
            }
          />
        </div>
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
        <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
          <strong>{t("popupEditor.buttonTab.buttonStyle")}</strong>
        </s-text>
        <s-divider></s-divider>
        <ColorInput
          label={t("popupEditor.buttonTab.background")}
          disabled={!canAccess("sv.btn.bg")}
          badge={
            !canAccess("sv.btn.bg") ? (
              <Badge text={t("common.basicPlanOrHigher")} type="basic" />
            ) : null
          }
          value={config.button.bgColor}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, bgColor: val },
            }))
          }
        />
        <ColorInput
          label={t("popupEditor.backgroundTab.borderColor")}
          disabled={!canAccess("sv.btn.border-color")}
          badge={
            !canAccess("sv.btn.border-color") ? (
              <Badge text={t("common.premiumPlan")} type="premium" />
            ) : null
          }
          value={config.button.borderColor}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, borderColor: val },
            }))
          }
        />
        <NumberInput
          label={t("popupEditor.backgroundTab.borderRadius")}
          disabled={!canAccess("sv.btn.border-radius")}
          badge={
            !canAccess("sv.btn.border-radius") ? (
              <Badge text={t("common.premiumPlan")} type="premium" />
            ) : null
          }
          value={config.button.borderRadius}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, borderRadius: val },
            }))
          }
        />
        <NumberInput
          label={t("popupEditor.backgroundTab.borderWidth")}
          disabled={!canAccess("sv.btn.border-width")}
          badge={
            !canAccess("sv.btn.border-width") ? (
              <Badge text={t("common.premiumPlan")} type="premium" />
            ) : null
          }
          value={config.button.borderWidth}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, borderWidth: val },
            }))
          }
        />
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
        <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
          <strong>{t("popupEditor.buttonTab.cancelButton")}</strong>
        </s-text>
        <s-divider></s-divider>
        <RichTextEditor
          value={config.button.cancelText}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, cancelText: val },
            }))
          }
        />
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
        <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
          <strong>{t("popupEditor.buttonTab.cancelButtonAction")}</strong>
        </s-text>
        <s-divider></s-divider>

        <div>
          <p
            style={{
              fontSize: "13px",
              color: "#6D7175",
              marginTop: 0,
              marginBottom: "10px",
            }}
          >
            {t("popupEditor.buttonTab.ifVisitorClicksCancel")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <RadioOption
              label={t("popupEditor.buttonTab.redirectUrl")}
              name="cancelAction"
              value="redirect"
              selected={config.button.cancelAction === "redirect"}
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  button: {
                    ...prev.button,
                    cancelAction: val,
                  },
                }))
              }
            />

            {config.button.cancelAction === "redirect" && (
              <div style={{ paddingLeft: "26px", marginBottom: "8px" }}>
                <s-text-field
                  value={config.button.redirectUrl || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      button: {
                        ...prev.button,
                        redirectUrl: e.currentTarget.value,
                      },
                    }))
                  }
                />
              </div>
            )}

            <RadioOption
              label={t("popupEditor.buttonTab.showErrorMessage")}
              name="cancelAction"
              value="errorMsg"
              selected={config.button.cancelAction === "errorMsg"}
              onChange={(val) =>
                setConfig((prev) => ({
                  ...prev,
                  button: {
                    ...prev.button,
                    cancelAction: val,
                  },
                }))
              }
            />

            {config.button.cancelAction === "errorMsg" && (
              <div style={{ paddingLeft: "26px", marginBottom: "8px" }}>
                <s-text-field
                  value={config.button.cancelErrorMsg || ""}
                  placeholder="Enter error message"
                  maxLength={255}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      button: {
                        ...prev.button,
                        cancelErrorMsg: e.currentTarget.value,
                      },
                    }))
                  }
                />
              </div>
            )}
          </div>
        </div>
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
        <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
          <strong>{t("popupEditor.buttonTab.cancelButtonStyle")}</strong>
        </s-text>
        <s-divider></s-divider>
        <ColorInput
          label={t("popupEditor.buttonTab.background")}
          disabled={!canAccess("sv.cbtn.bg")}
          badge={
            !canAccess("sv.cbtn.bg") ? (
              <Badge text={t("common.basicPlanOrHigher")} type="basic" />
            ) : null
          }
          value={config.button.cancelBgColor}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, cancelBgColor: val },
            }))
          }
        />
        <ColorInput
          label={t("popupEditor.backgroundTab.borderColor")}
          disabled={!canAccess("sv.cbtn.border-color")}
          badge={
            !canAccess("sv.cbtn.border-color") ? (
              <Badge text={t("common.premiumPlan")} type="premium" />
            ) : null
          }
          value={config.button.cancelBorderColor}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, cancelBorderColor: val },
            }))
          }
        />
        <NumberInput
          label={t("popupEditor.backgroundTab.borderRadius")}
          disabled={!canAccess("sv.cbtn.border-radius")}
          badge={
            !canAccess("sv.cbtn.border-radius") ? (
              <Badge text={t("common.premiumPlan")} type="premium" />
            ) : null
          }
          value={config.button.cancelBorderRadius}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, cancelBorderRadius: val },
            }))
          }
        />
        <NumberInput
          label={t("popupEditor.backgroundTab.borderWidth")}
          disabled={!canAccess("sv.cbtn.border-width")}
          badge={
            !canAccess("sv.cbtn.border-width") ? (
              <Badge text={t("common.premiumPlan")} type="premium" />
            ) : null
          }
          value={config.button.cancelBorderWidth}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, cancelBorderWidth: val },
            }))
          }
        />
      </div>
    </>
  );
}
