import { Card } from "../Card";
import { Badge } from "../Badge";

export function CSSTab({ config, setConfig }) {
  return (
    <Card title="CSS" badge={<Badge text="Premium plan" type="premium" />}>
      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #CBCFD2",
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
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, css: e.target.value }))
          }
          placeholder="/* Add your custom CSS here */"
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
