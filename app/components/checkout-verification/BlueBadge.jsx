export default function BlueBadge({ text }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor: "#E1F0FF",
        color: "#006FBB",
        fontSize: "12px",
        fontWeight: 500,
        padding: "4px 12px",
        borderRadius: "20px",
        border: "none",
      }}
    >
      <span style={{ fontSize: "14px" }}>★</span> {text}
    </span>
  );
}
