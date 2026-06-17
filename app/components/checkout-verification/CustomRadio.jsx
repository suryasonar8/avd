export default function CustomRadio({ label, description, checked, disabled }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          border: `2px solid ${checked ? "#006FBB" : "#D1D3D5"}`,
          backgroundColor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        {checked && (
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#006FBB",
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#202223" }}>
          {label}
        </span>
        {description && (
          <span
            style={{ fontSize: "13px", color: "#6D7175", lineHeight: "1.4" }}
          >
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
