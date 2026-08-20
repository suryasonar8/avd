import { useTranslation } from "../context/TranslationContext";

export function StatusPill({ enabled }) {
  const { t } = useTranslation();

  return (
    <span
      style={{
        fontSize: "12px",
        color: enabled ? "#1f5132" : "#555",
        backgroundColor: enabled ? "#e3f1df" : "#f1f1f1",
        border: `1px solid ${enabled ? "#b1d1a1" : "#ddd"}`,
        borderRadius: "4px",
        padding: "1px 7px",
      }}
    >
      {enabled ? t("common.enabled") : t("common.disabled")}
    </span>
  );
}
