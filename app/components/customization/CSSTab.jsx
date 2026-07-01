import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

export function CSSTab({ config, setConfig }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const hasAccess = canAccess("sv.css.input");

  return (
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
          {t("popupEditor.cssTab.cssTitle")}
        </s-text>
        {!hasAccess ? (
          <Badge text={t("common.premiumPlan")} type="premium" />
        ) : null}
      </div>
      <s-divider></s-divider>

      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #CBCFD2",
          opacity: hasAccess ? 1 : 0.6,
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            background: "#F9FAFB",
            borderBottom: "1px solid #CBCFD2",
            fontSize: "12px",
            color: "#6D7175",
          }}
        >
          1
        </div>
        <textarea
          value={config.css}
          disabled={!hasAccess}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, css: e.target.value }))
          }
          placeholder={t("popupEditor.cssTab.cssPlaceholder")}
          style={{
            width: "100%",
            minHeight: "400px",
            padding: "12px",
            border: "none",
            background: "#FAFAFA",
            color: "#1A1C1D",
            fontFamily: "monospace",
            fontSize: "14px",
            resize: "vertical",
          }}
        />
      </div>
    </div>
  );
}
