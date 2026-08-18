import { RichTextEditor } from "../RichTextEditor";
import { useTranslation } from "../../context/TranslationContext";

export function TextTab({ config, setConfig }) {
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
          <strong>{t("popupEditor.textTab.popupHeading")}</strong>
        </s-text>
        <s-divider></s-divider>
        <RichTextEditor
          value={config.text.heading}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              text: { ...prev.text, heading: val },
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
          <strong>{t("popupEditor.textTab.popupSubHeading")}</strong>
        </s-text>
        <s-divider></s-divider>
        <RichTextEditor
          value={config.text.subheading}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              text: { ...prev.text, subheading: val },
            }))
          }
        />
      </div>
    </>
  );
}
