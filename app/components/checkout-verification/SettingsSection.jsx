import BlueBadge from "./BlueBadge";

export default function SettingsSection({ title, badge, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E1E3E5",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#202223" }}>
          {title}
        </span>
        {badge &&
          (typeof badge === "string" ? <BlueBadge text={badge} /> : badge)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {children}
      </div>
    </div>
  );
}
