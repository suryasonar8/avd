import { Card } from "../Card";
import { Badge } from "../Badge";
import { ColorInput } from "../ColorInput";
import { NumberInput } from "../NumberInput";

export function BackgroundTab({ config, setConfig }) {
  return (
    <>
      <Card title="Pop-up background">
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            Type
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
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
                name="bgType"
                checked={config.background.type === "Solid color background"}
                onChange={() =>
                  setConfig({
                    ...config,
                    background: {
                      ...config.background,
                      type: "Solid color background",
                    },
                  })
                }
              />{" "}
              Solid color background
            </label>
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
                name="bgType"
                checked={config.background.type === "Image background"}
                onChange={() =>
                  setConfig({
                    ...config,
                    background: {
                      ...config.background,
                      type: "Image background",
                    },
                  })
                }
              />{" "}
              Image background
            </label>
          </div>
        </div>

        <ColorInput
          label="Page background color"
          required
          value={config.background.pageColor}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, pageColor: val },
            })
          }
        />

        <ColorInput
          label="Background color"
          badge={<Badge text="Basic plan or higher" type="basic" />}
          value={config.background.bgColor}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, bgColor: val },
            })
          }
        />

        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <label style={{ fontSize: "13px", fontWeight: "600" }}>
              Logo (Optional)
            </label>
            <Badge text="Basic plan or higher" type="basic" />
          </div>
          <div
            style={{
              border: "1px dashed #CBCFD2",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              background: "#F9FAFB",
            }}
          >
            <button
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #CBCFD2",
                background: "#FFF",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "8px",
              }}
            >
              Add image
            </button>
            <p style={{ fontSize: "12px", color: "#6D7175", margin: 0 }}>
              Accepts .png, .jpg
            </p>
          </div>
        </div>
      </Card>

      <Card
        title="Border setting"
        badge={<Badge text="Premium plan" type="premium" />}
      >
        <ColorInput
          label="Border color"
          value={config.background.borderColor}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, borderColor: val },
            })
          }
        />
        <NumberInput
          label="Border radius"
          value={config.background.borderRadius}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, borderRadius: val },
            })
          }
        />
        <NumberInput
          label="Border width"
          value={config.background.borderWidth}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, borderWidth: val },
            })
          }
        />
      </Card>
    </>
  );
}
