import { Card } from "../Card";
import { Badge } from "../Badge";
import { ColorInput } from "../ColorInput";
import { NumberInput } from "../NumberInput";
import { RichTextEditor } from "../RichTextEditor";

export function ButtonTab({ config, setConfig }) {
  return (
    <>
      <Card title="Submit button">
        <RichTextEditor
          value={config.button.submitText}
          onChange={(val) =>
            setConfig({
              ...config,
              button: { ...config.button, submitText: val },
            })
          }
        />
      </Card>

      <Card title="Submit button action">
        <div style={{ marginBottom: "8px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Error message
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={config.button.errorMsg}
              onChange={(e) =>
                setConfig({
                  ...config,
                  button: { ...config.button, errorMsg: e.target.value },
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #CBCFD2",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
                fontSize: "12px",
                color: "#6D7175",
              }}
            >
              {config.button.errorMsg.length}/255
            </span>
          </div>
        </div>
      </Card>

      <Card title="Button style">
        <ColorInput
          label="Background"
          badge={<Badge text="Basic plan or higher" type="basic" />}
          value={config.button.bgColor}
          onChange={(val) =>
            setConfig({
              ...config,
              button: { ...config.button, bgColor: val },
            })
          }
        />
        <ColorInput
          label="Border color"
          badge={<Badge text="Premium plan" type="premium" />}
          value={config.button.borderColor}
          onChange={(val) =>
            setConfig({
              ...config,
              button: { ...config.button, borderColor: val },
            })
          }
        />
        <NumberInput
          label="Border radius"
          badge={<Badge text="Premium plan" type="premium" />}
          value={config.button.borderRadius}
          onChange={(val) =>
            setConfig({
              ...config,
              button: { ...config.button, borderRadius: val },
            })
          }
        />
        <NumberInput
          label="Border width"
          badge={<Badge text="Premium plan" type="premium" />}
          value={config.button.borderWidth}
          onChange={(val) =>
            setConfig({
              ...config,
              button: { ...config.button, borderWidth: val },
            })
          }
        />
      </Card>

      <Card title="Cancel button">
        <RichTextEditor
          value={config.button.cancelText}
          onChange={(val) =>
            setConfig({
              ...config,
              button: { ...config.button, cancelText: val },
            })
          }
        />
      </Card>
    </>
  );
}
