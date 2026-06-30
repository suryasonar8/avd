import { useState } from "react";
import { useNavigate } from "react-router";
import { usePlan } from "../context/PlanContext";
import { PLAN_TYPES } from "../constants/features";
import { useTranslation } from "../context/TranslationContext";

export default function PricingBanner({ text }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const { plan } = usePlan();
  const { t } = useTranslation();

  if (!isVisible || plan !== PLAN_TYPES.FREE) return null;

  return (
    <div
      style={{
        border: "1px solid #D3D6D9",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#FFF",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Blue Header Bar */}
      <div
        style={{
          background: "#82CFFF",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Info Icon */}
          <span
            style={{ fontSize: "14px", display: "flex", alignItems: "center" }}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "16px", height: "16px" }}
            >
              <circle cx="10" cy="10" r="8" />
              <line x1="10" y1="14" x2="10" y2="10" />
              <line x1="10" y1="7" x2="10.01" y2="7" />
            </svg>
          </span>
          <span
            style={{
              fontWeight: "600",
              color: "#101112",
              fontSize: "13px",
            }}
          >
            {t("pricingBanner.freePlanLimit")}
          </span>
        </div>
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            color: "#101112",
          }}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "14px", height: "14px" }}
          >
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>
      </div>

      {/* Body Content */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "#202223",
            lineHeight: "1.5",
          }}
        >
          {text}
        </div>
        <button
          onClick={() => navigate("/pricing")}
          style={{
            padding: "6px 12px",
            background: "#FFF",
            border: "1px solid #BABFC3",
            borderRadius: "6px",
            color: "#202223",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
            transition: "background 0.1s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#F6F6F7")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#FFF")}
        >
          {t("pricingBanner.increaseLimit")}
        </button>
      </div>
    </div>
  );
}
