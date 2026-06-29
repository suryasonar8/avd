import { useNavigate } from "react-router";

export default function FreePlanBanner({ popupsCount, popupLimit }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#BDE6FF",
        borderRadius: "10px",
        padding: "16px 20px",
        marginBottom: "24px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        border: "1px solid #A2D9FF",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px", color: "#005F99" }}>ⓘ</span>
          <span
            style={{
              fontWeight: "700",
              color: "#1A1C1D",
              fontSize: "13px",
            }}
          >
            Free Plan Limit
          </span>
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#4A4D4F",
            lineHeight: "1.5",
            maxWidth: "600px",
          }}
        >
          Your current plan includes 1 pop-up ({popupsCount}/{popupLimit}{" "}
          used). Upgrade to unlock more pop-ups, advanced customization and
          more.
        </div>
      </div>
      <button
        onClick={() => navigate("/pricing")}
        style={{
          padding: "8px 16px",
          background: "#FFF",
          border: "1px solid #005F99",
          borderRadius: "6px",
          color: "#005F99",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Upgrade plan
      </button>
    </div>
  );
}
