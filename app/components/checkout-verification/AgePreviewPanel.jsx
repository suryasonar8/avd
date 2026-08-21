import { useState } from "react";
import { useTranslation } from "../../context/TranslationContext";
import {
  VERIFICATION_METHODS,
  DEFAULT_DOB_HEADING,
} from "../../constants/checkout-verification";

// Static mock of a Polaris select — this preview illustrates the layout,
// it isn't a functional date picker (the real dropdowns are computed live
// in the checkout-age-verification extension itself).
function MockDropdown({ label, placeholder }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #C9CCCF",
        borderRadius: "8px",
        padding: "6px 10px",
      }}
    >
      <div>
        <div style={{ fontSize: "12px", color: "#6D7175" }}>{label}</div>
        <div style={{ fontSize: "14px", color: "#1A1C1D" }}>
          {placeholder}
        </div>
      </div>
      <span style={{ color: "#6D7175" }}>⌄</span>
    </div>
  );
}

export default function AgePreviewPanel({ config }) {
  const [device, setDevice] = useState("desktop");
  const { t } = useTranslation();
  const minAge = config?.minAge || 18;
  const isDateOfBirth =
    config?.verificationMethod === VERIFICATION_METHODS.DATE_OF_BIRTH;
  // Mirrors the checkout-age-verification extension: the age is almost
  // always typed as a plain number, so replace any digit run rather than
  // requiring a {{minAge}} token, keeping this preview in sync with what
  // the buyer actually sees at checkout.
  const interpolate = (text) =>
    text
      .replace(/\{\{\s*minAge\s*\}\}/g, String(minAge))
      .replace(/\d+/g, String(minAge));
  const message = interpolate(
    config?.message || t("checkoutVerification.verifyAgeCheckboxLabel"),
  );
  const dobHeading = config?.dobHeading || DEFAULT_DOB_HEADING;
  const errorMessage = interpolate(
    config?.errorMessage || t("checkoutVerification.ageVerificationError"),
  );

  return (
    <div
      style={{
        background: "#FFF",
        borderRadius: "12px",
        border: "1px solid #E1E3E5",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Preview Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "12px",
          borderBottom: "1px solid #F1F1F1",
          gap: "12px",
          background: "#FFF",
        }}
      >
        <s-button
          onClick={() => setDevice("desktop")}
          variant={device === "desktop" ? "primary" : "secondary"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={device === "mobile" ? "#444" : "#ffffff"}
            strokeWidth="2"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </s-button>
        <s-button
          onClick={() => setDevice("mobile")}
          variant={device === "mobile" ? "primary" : "secondary"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={device === "mobile" ? "#ffffff" : "#444"}
            strokeWidth="2"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </s-button>
      </div>

      {/* Preview Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          background: "#F6F6F7",
        }}
      >
        <div
          style={{
            width: device === "desktop" ? "100%" : "280px",
            maxWidth: "540px",
            background: "#FFF",
            border: "1px solid #E1E3E5",
            borderRadius: "8px",
            padding: "20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {isDateOfBirth ? (
            <s-text weight="bold">{dobHeading}</s-text>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: "#8a2846",
                  backgroundColor: "#fce4ec",
                  border: "1px solid #f5c2d6",
                  borderRadius: "4px",
                  padding: "1px 7px",
                  flexShrink: 0,
                }}
              >
                {`${minAge}+`}
              </span>
              <div
                style={{
                  flex: 1,
                  border: "1px solid #2c6ecb",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
              >
                <s-checkbox checked={false} label={message} />
              </div>
            </div>
          )}

          {isDateOfBirth && (
            <div style={{ display: "flex", gap: "12px" }}>
              <MockDropdown
                label={t("checkoutVerification.day")}
                placeholder={t("checkoutVerification.dayPlaceholder")}
              />
              <MockDropdown
                label={t("checkoutVerification.month")}
                placeholder={t("checkoutVerification.monthPlaceholder")}
              />
              <MockDropdown
                label={t("checkoutVerification.year")}
                placeholder={t("checkoutVerification.yearPlaceholder")}
              />
            </div>
          )}

          <s-text tone="critical" style={{ fontSize: "12px" }}>
            {errorMessage}
          </s-text>
        </div>
      </div>
    </div>
  );
}
