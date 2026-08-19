import { useTranslation } from "../context/TranslationContext";

export default function PageFooter({ align = "center" }) {
  const { t } = useTranslation();

  return (
    <div style={{ textAlign: align }}>
      <p style={{ margin: 0, fontSize: "13px", color: "#6D7175" }}>
        {t("common.needHelp")}{" "}
        <a
          href="#"
          style={{ color: "#005BD3", textDecoration: "none" }}
          onClick={(e) => e.preventDefault()}
        >
          {t("common.ourDocumentGuideline")}
        </a>
      </p>
    </div>
  );
}
