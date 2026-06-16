export const Badge = ({ text, type }) => {
  const isPremium = type === "premium";
  return (
    <span
      style={{
        background: isPremium ? "#F0F5FF" : "#E3F1F8",
        color: isPremium ? "#458FFF" : "#005F99",
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
