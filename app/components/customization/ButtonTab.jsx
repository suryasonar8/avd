import { Card } from "../Card";
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
      <Card title={t("popupEditor.buttonTab.submitButton")}>
        <RichTextEditor
          value={config.button.submitText}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, submitText: val },
            }))
          }
        />
      </Card>

      <Card title={t("popupEditor.buttonTab.submitButtonAction")}>
        <div style={{ marginBottom: "8px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            {t("popupEditor.buttonTab.errorMessage")}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={config.button.errorMsg || ""}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  button: { ...prev.button, errorMsg: e.target.value },
                }))
              }
              style={{
                boxSizing: "border-box",
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #CBCFD2",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
                fontSize: "12px",
                color: "#6D7175",
              }}
            >
              {(config.button.errorMsg || "").length}/255
            </span>
          </div>
        </div>
      </Card>

      <Card title={t("popupEditor.buttonTab.buttonStyle")}>
        <ColorInput
          label={t("popupEditor.buttonTab.background")}
          disabled={!canAccess("sv.btn.bg")}
          badge={!canAccess("sv.btn.bg") ? <Badge text={t("common.basicPlanOrHigher")} type="basic" /> : null}
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
          badge={!canAccess("sv.btn.border-color") ? <Badge text={t("common.premiumPlan")} type="premium" /> : null}
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
          badge={!canAccess("sv.btn.border-radius") ? <Badge text={t("common.premiumPlan")} type="premium" /> : null}
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
          badge={!canAccess("sv.btn.border-width") ? <Badge text={t("common.premiumPlan")} type="premium" /> : null}
          value={config.button.borderWidth}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, borderWidth: val },
            }))
          }
        />
      </Card>

      <Card title={t("popupEditor.buttonTab.cancelButton")}>
        <RichTextEditor
          value={config.button.cancelText}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, cancelText: val },
            }))
          }
        />
      </Card>

      <Card title={t("popupEditor.buttonTab.cancelButtonAction")}>
        <div style={{ marginBottom: "16px" }}>
          <p
            style={{ fontSize: "13px", color: "#6D7175", marginBottom: "12px" }}
          >
            {t("popupEditor.buttonTab.ifVisitorClicksCancel")}
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <input
                type="radio"
                name="cancelAction"
                checked={config.button.cancelAction === "redirect"}
                onChange={() =>
                  setConfig((prev) => ({
                    ...prev,
                    button: { ...prev.button, cancelAction: "redirect" },
                  }))
                }
              />
              {t("popupEditor.buttonTab.redirectUrl")}
            </label>
            {config.button.cancelAction === "redirect" && (
              <div style={{ marginLeft: "24px", marginTop: "-4px" }}>
                <input
                  type="text"
                  value={config.button.redirectUrl || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      button: { ...prev.button, redirectUrl: e.target.value },
                    }))
                  }
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBCFD2",
                    fontSize: "13px",
                  }}
                />
              </div>
            )}

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <input
                type="radio"
                name="cancelAction"
                checked={config.button.cancelAction === "errorMsg"}
                onChange={() =>
                  setConfig((prev) => ({
                    ...prev,
                    button: { ...prev.button, cancelAction: "errorMsg" },
                  }))
                }
              />
              {t("popupEditor.buttonTab.showErrorMessage")}
            </label>
            {config.button.cancelAction === "errorMsg" && (
              <div
                style={{
                  marginLeft: "24px",
                  marginTop: "-4px",
                  position: "relative",
                }}
              >
                <input
                  type="text"
                  value={config.button.cancelErrorMsg || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      button: {
                        ...prev.button,
                        cancelErrorMsg: e.target.value,
                      },
                    }))
                  }
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #CBCFD2",
                    fontSize: "13px",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "10px",
                    fontSize: "12px",
                    color: "#6D7175",
                  }}
                >
                  {(config.button.cancelErrorMsg || "").length}/255
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card title={t("popupEditor.buttonTab.cancelButtonStyle")}>
        <ColorInput
          label={t("popupEditor.buttonTab.background")}
          disabled={!canAccess("sv.cbtn.bg")}
          badge={!canAccess("sv.cbtn.bg") ? <Badge text={t("common.basicPlanOrHigher")} type="basic" /> : null}
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
          badge={!canAccess("sv.cbtn.border-color") ? <Badge text={t("common.premiumPlan")} type="premium" /> : null}
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
          badge={!canAccess("sv.cbtn.border-radius") ? <Badge text={t("common.premiumPlan")} type="premium" /> : null}
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
          badge={!canAccess("sv.cbtn.border-width") ? <Badge text={t("common.premiumPlan")} type="premium" /> : null}
          value={config.button.cancelBorderWidth}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              button: { ...prev.button, cancelBorderWidth: val },
            }))
          }
        />
      </Card>
    </>
  );
}
