import { useNavigate } from "react-router";

export const Badge = ({ text, type }) => {
  const navigate = useNavigate();

  return (
    <s-badge
      tone="info"
      onClick={(e) => {
        e.stopPropagation();
        navigate("/pricing");
      }}
      style={{ cursor: "pointer" }}
      title="Click to view plans"
    >
      {text}
    </s-badge>
  );
};
