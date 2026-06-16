export const RichTextEditor = ({ label, value, onChange }) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        marginBottom: "12px",
      }}
    >
      {label}
    </label>
    <div
      style={{
        border: "1px solid #CBCFD2",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          padding: "8px 12px",
          borderBottom: "1px solid #CBCFD2",
          background: "#FFF",
        }}
      >
        {["B", "I", "U", "≡", "A"].map((icon) => (
          <span
            key={icon}
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#6D7175",
              cursor: "pointer",
            }}
          >
            {icon}
          </span>
        ))}
        <span
          style={{
            fontSize: "12px",
            color: "#6D7175",
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          16 <span style={{ fontSize: "10px" }}>▼</span>
        </span>
        <span style={{ fontSize: "12px", color: "#6D7175" }}>Tx</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          border: "none",
          background: "#000",
          color: "#FFF",
          minHeight: "100px",
          fontSize: "14px",
          fontFamily: "inherit",
          resize: "none",
        }}
      />
    </div>
  </div>
);
