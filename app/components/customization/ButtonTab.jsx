import { Badge } from "../Badge";
import { ColorInput } from "../ColorInput";
import { NumberInput } from "../NumberInput";
import { RichTextEditor } from "../RichTextEditor";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

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
          {t("popupEditor.buttonTab.submitButton")}
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
          {t("popupEditor.buttonTab.submitButtonAction")}
        </s-text>
        <s-divider></s-divider>
        <div>
          <s-text-field
            label={t("popupEditor.buttonTab.errorMessage")}
            value={config.button.errorMsg || ""}
            maxLength={255}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                button: { ...prev.button, errorMsg: e.currentTarget.value },
              }))
            }
          />
          <p
            style={{
              fontSize: "12px",
              color: "#6D7175",
              marginTop: "4px",
              textAlign: "right",
              marginBottom: 0,
            }}
          >
            {(config.button.errorMsg || "").length}/255
          </p>
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
          {t("popupEditor.buttonTab.buttonStyle")}
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
          {t("popupEditor.buttonTab.cancelButton")}
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
          {t("popupEditor.buttonTab.cancelButtonAction")}
        </s-text>
        <s-divider></s-divider>

        <div>
          <p
            style={{ fontSize: "13px", color: "#6D7175", marginBottom: "12px" }}
          >
            {t("popupEditor.buttonTab.ifVisitorClicksCancel")}
          </p>

          <s-choice-list
            name="cancelAction"
            values={[config.button.cancelAction]}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                button: {
                  ...prev.button,
                  cancelAction: e.currentTarget.values[0],
                },
              }))
            }
          >
            <s-choice
              value="redirect"
              selected={config.button.cancelAction === "redirect"}
            >
              {t("popupEditor.buttonTab.redirectUrl")}
            </s-choice>
            <s-choice
              value="errorMsg"
              selected={config.button.cancelAction === "errorMsg"}
            >
              {t("popupEditor.buttonTab.showErrorMessage")}
            </s-choice>
          </s-choice-list>

          {config.button.cancelAction === "redirect" && (
            <div style={{ marginTop: "12px" }}>
              <s-text-field
                label={t("popupEditor.buttonTab.redirectUrl")}
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

          {config.button.cancelAction === "errorMsg" && (
            <div style={{ marginTop: "12px" }}>
              <s-text-field
                label={t("popupEditor.buttonTab.errorMessage")}
                value={config.button.cancelErrorMsg || ""}
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
              <p
                style={{
                  fontSize: "12px",
                  color: "#6D7175",
                  marginTop: "4px",
                  textAlign: "right",
                  marginBottom: 0,
                }}
              >
                {(config.button.cancelErrorMsg || "").length}/255
              </p>
            </div>
          )}
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
          {t("popupEditor.buttonTab.cancelButtonStyle")}
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
