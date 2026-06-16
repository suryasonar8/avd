import { Card } from "../Card";
import { RichTextEditor } from "../RichTextEditor";

export function TextTab({ config, setConfig }) {
  return (
    <>
      <Card title="Pop-up heading">
        <RichTextEditor
          value={config.text.heading}
          onChange={(val) =>
            setConfig({
              ...config,
              text: { ...config.text, heading: val },
            })
          }
        />
      </Card>
      <Card title="Pop-up sub-heading">
        <RichTextEditor
          value={config.text.subheading}
          onChange={(val) =>
            setConfig({
              ...config,
              text: { ...config.text, subheading: val },
            })
          }
        />
      </Card>
    </>
  );
}
