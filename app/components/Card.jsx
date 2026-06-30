export const Card = ({ title, badge, children }) => (
  <s-card style={{ marginBottom: "20px" }}>
    <s-stack gap="base">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
          {title}
        </s-text>
        {badge}
      </div>
      {children}
    </s-stack>
  </s-card>
);
