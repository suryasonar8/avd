export const Card = ({ title, badge, children }) => (
  <div
    style={{
      background: "#FFFFFF",
      border: "1px solid #E1E3E5",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    }}
  >
    {(title || badge) && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {title && (
          <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
            {title}
          </s-text>
        )}
        {badge}
      </div>
    )}
    {children}
  </div>
);
