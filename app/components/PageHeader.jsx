export default function PageHeader({ title, description, actionButton, backAction, badge }) {
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
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        {backAction && (
          <button
            onClick={backAction}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#202223",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ←
          </button>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
            {badge}
          </div>
          {description && <s-text>{description}</s-text>}
        </div>
      </div>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
