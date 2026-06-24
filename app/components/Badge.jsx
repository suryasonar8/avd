export const Badge = ({ text, type }) => {
  return (
    <span
      style={{
        background: "#E3F1F8",
        color: "#005F99",
        fontSize: "11px",
        fontWeight: "600",
        padding: "2px 8px",
        borderRadius: "99px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <span style={{ fontSize: "12px" }}>★</span> {text}
    </span>
  );
};
