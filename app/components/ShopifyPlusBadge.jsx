import { useTranslation } from "../context/TranslationContext";

export function ShopifyPlusBadge() {
  const { t } = useTranslation();

  return (
    <span
      style={{
        fontSize: "12px",
        color: "#4a3b8f",
        backgroundColor: "#ece8fb",
        border: "1px solid #d3c9f5",
        borderRadius: "4px",
        padding: "1px 7px",
      }}
    >
      {t("termsAndConditions.shopifyPlusBadge")}
    </span>
  );
}
