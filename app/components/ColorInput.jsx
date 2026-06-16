export const ColorInput = ({ label, value, onChange, badge, required }) => (
  <div style={{ marginBottom: "16px" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#1A1C1D" }}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      {badge}
    </div>
    <div style={{ display: "flex", gap: "8px" }}>
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "18px",
          background: value,
          border: "1px solid #CBCFD2",
          flexShrink: 0,
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #CBCFD2",
          fontSize: "13px",
          background: "#FFF",
        }}
      />
    </div>
  </div>
);
