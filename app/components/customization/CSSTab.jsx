import { Card } from "../Card";
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

export function CSSTab({ config, setConfig }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const hasAccess = canAccess("sv.css.input");

  return (
    <Card title={t("popupEditor.cssTab.cssTitle")} badge={!hasAccess ? <Badge text={t("common.premiumPlan")} type="premium" /> : null}>
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
    </Card>
  );
}
