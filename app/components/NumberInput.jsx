export const NumberInput = ({
  label,
  value,
  onChange,
  badge,
  suffix = "px",
}) => (
  <div style={{ marginBottom: "16px" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <label
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: "#1A1C1D",
        }}
      >
        {label}
      </label>
      {badge}
    </div>
    <div style={{ position: "relative", maxWidth: "240px" }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: "10px",
          paddingRight: "30px",
          borderRadius: "8px",
          border: "1px solid #CBCFD2",
          fontSize: "13px",
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
        {suffix}
      </span>
    </div>
  </div>
);
