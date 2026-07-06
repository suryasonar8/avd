export default function PageHeader({ title, description, actionButton }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "8px 0 24px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "4px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            margin: 0,
            color: "#1A1C1D",
          }}
        >
          {title}
        </h2>
        {description && <s-text>{description}</s-text>}
      </div>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
