import SettingsSection from "./SettingsSection";

export default function BannerSettings() {
  return (
    <SettingsSection title="Text customization" badge="Basic plan or higher">
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label style={{ fontSize: "14px", color: "#6D7175" }}>Heading</label>
          <span style={{ color: "#D72C0D" }}>*</span>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value="You must be at least 18 years old to"
            style={{
              width: "100%",
              padding: "12px 60px 12px 12px",
              border: "1px solid #E1E3E5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#6D7175",
              backgroundColor: "#F9F9F9",
              boxSizing: "border-box",
              cursor: "not-allowed",
            }}
            disabled
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
            53/255
          </span>
        </div>
      </div>
    </SettingsSection>
  );
}
