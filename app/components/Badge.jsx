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
      <svg
        viewBox="0 0 20 20"
        style={{
          width: "12px",
          height: "12px",
          marginRight: "4px",
          display: "inline-block",
          verticalAlign: "middle",
          fill: "currentColor",
        }}
      >
        <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.564-.955L10 0l2.946 5.955 6.564.955-4.755 4.635 1.123 6.545z" />
      </svg>
      {text}
    </s-badge>
  );
};
