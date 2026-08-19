/* eslint-disable react/prop-types, jsx-a11y/anchor-is-valid */
import { useState } from "react";
import { useTranslation } from "../../context/TranslationContext";

export default function PreviewPanel({
  checkboxText,
  keyword,
  link,
  size,
  color,
  globalSettings,
  setGlobalSettings,
  fetcher,
}) {
  const [device, setDevice] = useState("desktop");
  const { t } = useTranslation();

  const showBrandMark = globalSettings?.showBrandMark !== false;

  const renderText = () => {
    const text = checkboxText || "";
    const key = keyword || "";
    if (!key) return text;
    const escapedKeyword = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedKeyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === key.toLowerCase() ? (
        <a
          key={i}
          href={link}
          onClick={(e) => e.preventDefault()}
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          {part}
        </a>
      ) : (
        part
      ),
    );
  };

  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        border: "1px solid #E1E3E5",
        borderRadius: "10px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Device toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <button
          onClick={() => setDevice("desktop")}
          style={{
            background: device === "desktop" ? "#F1F1F1" : "transparent",
            border: "1px solid #E1E3E5",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title={t("termsAndConditions.desktop")}
        >
          {/* Monitor icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>
        <button
          onClick={() => setDevice("mobile")}
          style={{
            background: device === "mobile" ? "#F1F1F1" : "transparent",
            border: "1px solid #E1E3E5",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title={t("termsAndConditions.mobile")}
        >
          {/* Phone icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </button>
      </div>

      {/* Product page mockup */}
      <div
        style={{
          border: "1px solid #E1E3E5",
          borderRadius: "8px",
          padding: "16px",
          display: "flex",
          flexDirection: device === "mobile" ? "column" : "row",
          gap: "16px",
          maxWidth: device === "mobile" ? "260px" : "100%",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Product image skeleton */}
        <div
          style={{
            width: device === "mobile" ? "100%" : "140px",
            height: device === "mobile" ? "120px" : "140px",
            backgroundColor: "#E8E8E8",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        />

        {/* Content skeletons */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {/* Title skeleton */}
          <div
            style={{
              height: "12px",
              backgroundColor: "#D0D0D0",
              borderRadius: "4px",
              width: "80%",
            }}
          />
          <div
            style={{
              height: "10px",
              backgroundColor: "#E0E0E0",
              borderRadius: "4px",
              width: "100%",
            }}
          />

          {/* Checkbox row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <input
              type="checkbox"
              style={{
                width: "14px",
                height: "14px",
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: `${size}px`, color: color, lineHeight: "1.4" }}
            >
              {renderText()}
            </span>
          </div>

          {/* Protected by */}
          {showBrandMark !== false && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "#6D7175" }}>
                {t("termsAndConditions.protectedBy")}
              </span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                </div>
                <a
                  href="https://google.com"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    color: "#2C6ECB",
                    textDecoration: "underline",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {t("termsAndConditions.avdTrademark")}
                </a>
              </div>
            </div>
          )}

          {/* More skeleton lines */}
          <div
            style={{
              height: "10px",
              backgroundColor: "#E0E0E0",
              borderRadius: "4px",
              width: "90%",
            }}
          />
          <div
            style={{
              height: "10px",
              backgroundColor: "#E8E8E8",
              borderRadius: "4px",
              width: "70%",
            }}
          />
          <div
            style={{
              height: "10px",
              backgroundColor: "#E8E8E8",
              borderRadius: "4px",
              width: "85%",
            }}
          />
        </div>
      </div>

      {/* Remove brandmark link */}
      <div style={{ textAlign: "center" }}>
        {showBrandMark !== false ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (setGlobalSettings) {
                setGlobalSettings((prev) => ({ ...prev, showBrandMark: false }));
              }
              if (fetcher) {
                fetcher.submit(
                  { intent: "toggle_brand_mark", showBrandMark: "false" },
                  { method: "POST" }
                );
              }
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "#2C6ECB",
              textDecoration: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {t("termsAndConditions.clickToRemoveBrandmark")}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (setGlobalSettings) {
                setGlobalSettings((prev) => ({ ...prev, showBrandMark: true }));
              }
              if (fetcher) {
                fetcher.submit(
                  { intent: "toggle_brand_mark", showBrandMark: "true" },
                  { method: "POST" }
                );
              }
            }}
            style={{
              background: "none",
              border: "none",
              fontSize: "13px",
              color: "#2C6ECB",
              textDecoration: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {t("popupEditor.clickToShowBrandMark")}
          </button>
        )}
      </div>
    </div>
  );
}
