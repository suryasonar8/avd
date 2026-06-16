export const NumberInput = ({
  label,
  value,
  onChange,
  badge,
  suffix = "px",
}) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        marginBottom: "8px",
        color: "#1A1C1D",
      }}
    >
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        style={{
          width: "100%",
          padding: "10px",
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
