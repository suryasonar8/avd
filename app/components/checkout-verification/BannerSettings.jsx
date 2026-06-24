import { BANNER_TEXT_MAX_LENGTH } from "../../constants/checkout-verification";
import SettingsSection from "./SettingsSection";
import { Badge } from "../Badge";

export default function BannerSettings({ config, onChange }) {
  const heading = config.heading || "";
  const maxLength = BANNER_TEXT_MAX_LENGTH;

  const handleHeadingChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      onChange({ heading: value });
    }
  };

  return (
    <SettingsSection
      title="Text customization"
      badge={<Badge text="Basic plan or higher" type="basic" />}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label style={{ fontSize: "14px", color: "#6D7175" }}>Heading</label>
          <span style={{ color: "#D72C0D" }}>*</span>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={heading}
            onChange={handleHeadingChange}
            placeholder="Enter banner heading text"
            style={{
              width: "100%",
              padding: "12px 60px 12px 12px",
              border: "1px solid #E1E3E5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#202223",
              backgroundColor: "#fff",
              boxSizing: "border-box",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "13px",
              color: "#6D7175",
            }}
          >
            {heading.length}/{maxLength}
          </span>
        </div>
      </div>
    </SettingsSection>
  );
}
