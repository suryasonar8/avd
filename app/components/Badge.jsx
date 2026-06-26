import { useNavigate } from "react-router";

export const Badge = ({ text, type }) => {
  const navigate = useNavigate();

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        navigate("/pricing");
      }}
      style={{
        background: "#E3F1F8",
        color: "#005F99",
        fontSize: "11px",
        fontWeight: "600",
        padding: "2px 8px",
        borderRadius: "99px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer",
      }}
      title="Click to view plans"
    >
      <span style={{ fontSize: "12px" }}>★</span> {text}
    </span>
  );
};
