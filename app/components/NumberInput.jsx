export const NumberInput = ({
  label,
  value,
  onChange,
  badge,
  suffix = "px",
  disabled,
}) => (
  <div style={{ marginBottom: "16px", opacity: disabled ? 0.6 : 1 }}>
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
        disabled={disabled}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: "10px",
          paddingRight: "30px",
          borderRadius: "8px",
          border: "1px solid #CBCFD2",
          fontSize: "13px",
          background: disabled ? "#F6F6F7" : "#FFF",
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
