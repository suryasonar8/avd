import { Badge } from "../Badge";

export default function SettingsSection({ title, badge, children, disabled }) {
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
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#202223" }}>
          {title}
        </span>
        {badge &&
          (typeof badge === "string" ? <Badge text={badge} /> : badge)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {children}
      </div>
    </div>
  );
}
