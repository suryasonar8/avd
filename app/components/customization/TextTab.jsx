import { Card } from "../Card";
import { RichTextEditor } from "../RichTextEditor";
import { useTranslation } from "../../context/TranslationContext";

export function TextTab({ config, setConfig }) {
  const { t } = useTranslation();
  return (
    <>
      <Card title={t("popupEditor.textTab.popupHeading")}>
        <RichTextEditor
          value={config.text.heading}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              text: { ...prev.text, heading: val },
            }))
          }
        />
      </Card>
      <Card title={t("popupEditor.textTab.popupSubHeading")}>
        <RichTextEditor
          value={config.text.subheading}
          onChange={(val) =>
            setConfig((prev) => ({
              ...prev,
              text: { ...prev.text, subheading: val },
            }))
          }
        />
      </Card>
    </>
  );
}
