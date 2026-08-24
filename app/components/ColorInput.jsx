import { useState } from "react";
import { HexAlphaColorPicker } from "react-colorful";

export const ColorInput = ({
  label,
  value,
  onChange,
  badge,
  required,
  disabled,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span style={{ opacity: disabled ? 0.6 : 1 }}>
          <s-text variant="bodyMd" as="label">
            {label} {required && <span style={{ color: "red" }}>*</span>}
          </s-text>
        </span>
        {badge}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div
          onClick={() => !disabled && setShowPicker(!showPicker)}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: value || "#FFFFFF",
            border: "1px dashed #CBCFD2",
            flexShrink: 0,
            cursor: disabled ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
        <div style={{ flexGrow: 1 }}>
          <s-text-field
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
        </div>
      </div>

      {showPicker && (
        <div
          style={{
            zIndex: 10,
            marginTop: "12px",
            borderRadius: "20px",
            background: "#121212",
            width: "100%",
            boxSizing: "border-box",
            animation: "slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <style>
            {`
              @keyframes slideDown {
                from { opacity: 0; transform: translateY(-12px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .custom-picker {
                width: 100% !important;
                height: auto !important;
                display: flex;
                flex-direction: column;
                gap: 0;
              }
              .custom-picker .react-colorful__saturation {
                border-radius: 20px 20px 10px 10px;
                height: 200px;
                border: none;
                margin: 0;
              }
              .custom-picker .react-colorful__hue,
              .custom-picker .react-colorful__alpha {
                height: 16px !important;
                border-radius: 10px !important;
                margin: 16px 26px 0 16px !important;
              }
              .custom-picker .react-colorful__alpha {
                margin-bottom: 20px !important;
              }

              .custom-picker .react-colorful__hue-pointer,
              .custom-picker .react-colorful__alpha-pointer {
                width: 28px !important;
                height: 28px !important;
                background: #fff !important;
                border: none !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                border-radius: 50% !important;
              }
              .custom-picker .react-colorful__saturation-pointer {
                width: 24px !important;
                height: 24px !important;
                border: 3px solid #fff !important;
                background: transparent !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
              }
              .custom-picker .react-colorful__alpha {
                background-image: linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%) !important;
                background-size: 8px 8px !important;
                background-position: 0 0, 0 4px, 4px 4px, 4px 0 !important;
              }
              .custom-picker .react-colorful__alpha-gradient {
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
                border-radius: 10px;
              }
            `}
          </style>
          <HexAlphaColorPicker
            color={value || "#FFFFFF"}
            onChange={onChange}
            className="custom-picker"
          />
        </div>
      )}
    </div>
  );
};
