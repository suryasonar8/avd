export const Card = ({ title, badge, children }) => (
  <div
    style={{
      background: "#FFF",
      borderRadius: "12px",
      padding: "20px",
      border: "1px solid #E1E3E5",
      marginBottom: "20px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "16px",
      }}
    >
      <h2 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>
        {title}
      </h2>
      {badge}
    </div>
    {children}
  </div>
);
