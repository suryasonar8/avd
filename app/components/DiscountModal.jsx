import { useState } from "react";
import { useTranslation } from "../context/TranslationContext";

export default function DiscountModal({ isOpen, onClose, onApply }) {
  const { t } = useTranslation();
  const [discountCode, setDiscountCode] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setDiscountCode("");
    onClose();
  };

  const handleApply = () => {
    if (onApply) {
      onApply(discountCode);
    }
    setDiscountCode("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "Inter, -apple-system, system-ui, sans-serif",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "540px",
          padding: "24px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#1a1c1d",
              margin: 0,
            }}
          >
            {t("pricing.discountModal.title")}
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#8c8c8c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1c1d")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8c8c8c")}
          >
            <svg
              viewBox="0 0 20 20"
              style={{
                width: "20px",
                height: "20px",
                fill: "currentColor",
              }}
            >
              <path d="M11.414 10l6.293-6.293a1 1 0 10-1.414-1.414L10 8.586 3.707 2.293a1 1 0 00-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293a1 1 0 001.414-1.414L11.414 10z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="discount-code-input"
            style={{
              display: "block",
              fontSize: "14px",
              color: "#6d7175",
              marginBottom: "8px",
            }}
          >
            {t("pricing.discountModal.label")}
          </label>
          <input
            id="discount-code-input"
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #dcdfe3",
              borderRadius: "12px",
              fontSize: "15px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0066cc";
              e.target.style.boxShadow = "0 0 0 2px rgba(0, 102, 204, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#dcdfe3";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            disabled={!discountCode.trim()}
            onClick={handleApply}
            style={{
              padding: "10px 24px",
              backgroundColor: discountCode.trim() ? "#202223" : "#d4d4d8",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: discountCode.trim() ? "pointer" : "default",
              fontWeight: "600",
              fontSize: "14px",
              transition: "background-color 0.2s",
            }}
          >
            {t("pricing.discountModal.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
