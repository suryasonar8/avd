import { useFetcher } from "react-router";
import { useTranslation } from "../../context/TranslationContext";

export const Preview = ({
  config,
  setConfig,
  previewMode,
  setPreviewMode,
  globalSettings,
  setGlobalSettings,
}) => {
  const fetcher = useFetcher();
  const { t } = useTranslation();
  const showBrandMark = globalSettings?.showBrandMark !== false;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Preview Container */}
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
            onClick={() => setPreviewMode("desktop")}
            variant={previewMode === "desktop" ? "primary" : "secondary"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={previewMode === "mobile" ? "#444" : "#ffffff"}
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </s-button>
          <s-button
            onClick={() => setPreviewMode("mobile")}
            variant={previewMode === "mobile" ? "primary" : "secondary"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={previewMode === "mobile" ? "#ffffff" : "#444"}
              strokeWidth="2"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </s-button>
        </div>

        {/* Custom CSS */}
        {config.css && (
          <style dangerouslySetInnerHTML={{ __html: config.css }} />
        )}

        {/* Preview Content */}
        <div
          id="age-verification-overlay"
          className="age-verification-overlay"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background:
              config.background.bgType === "Image background" &&
              config.background.backgroundImage
                ? `url(${config.background.backgroundImage}) no-repeat center center / cover`
                : config.background.pageColor,
          }}
        >
          <div
            className="age-verification-modal age-verification-content"
            style={{
              width: previewMode === "desktop" ? "100%" : "280px",
              maxWidth: "540px",
              aspectRatio: previewMode === "desktop" ? "16/10" : "9/16",
              background: config.background.bgColor,
              color: "#FFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "30px",
              boxSizing: "border-box",
              textAlign: "center",
              position: "relative",
              borderRadius:
                previewMode === "mobile"
                  ? `${config.background.borderRadius}px`
                  : `${config.background.borderRadius}px`,
              border: `${config.background.borderWidth}px solid ${config.background.borderColor}`,
            }}
          >
            {config.background.logo && (
              <div
                className="age-verification-logo"
                style={{ textAlign: "center" }}
              >
                <img
                  src={config.background.logo}
                  alt="Logo"
                  style={{
                    maxWidth: "120px",
                    maxHeight: "60px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <h3
              className="age-verification-heading"
              style={{
                fontSize: previewMode === "desktop" ? "26px" : "18px",
                fontWeight: "700",
                marginTop: 0,
                letterSpacing: "0.5px",
              }}
              dangerouslySetInnerHTML={{ __html: config.text.heading }}
            />
            <p
              className="age-verification-subheading"
              style={{
                fontSize: previewMode === "desktop" ? "15px" : "13px",
                marginBottom: "30px",
                opacity: 0.9,
              }}
              dangerouslySetInnerHTML={{ __html: config.text.subheading }}
            />

            {config.method === "Birthdate entry" && (
              <div
                className="age-verification-birthdate"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "30px",
                  justifyContent: "center",
                }}
              >
                {(config.dateOrder || "MM,DD,YY")
                  .split(",")
                  .map((part, index) => {
                    if (part === "MM") {
                      return (
                        <select
                          key="month"
                          id="age-verify-month"
                          className="age-verify-select"
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #CBCFD2",
                            background: "#FFF",
                            color: "#000",
                            fontSize: "14px",
                            width: previewMode === "desktop" ? "120px" : "80px",
                          }}
                        >
                          {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ].map((m) => (
                            <option key={m} value={m}>
                              {t("months." + m.toLowerCase())}
                            </option>
                          ))}
                        </select>
                      );
                    }
                    if (part === "DD") {
                      return (
                        <select
                          key="day"
                          id="age-verify-day"
                          className="age-verify-select"
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #CBCFD2",
                            background: "#FFF",
                            color: "#000",
                            fontSize: "14px",
                            width: previewMode === "desktop" ? "70px" : "60px",
                          }}
                        >
                          {[...Array(31)].map((_, i) => (
                            <option key={i + 1}>
                              {String(i + 1).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      );
                    }
                    if (part === "YY") {
                      return (
                        <select
                          key="year"
                          id="age-verify-year"
                          className="age-verify-select"
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #CBCFD2",
                            background: "#FFF",
                            color: "#000",
                            fontSize: "14px",
                            width: previewMode === "desktop" ? "90px" : "80px",
                          }}
                        >
                          {[...Array(100)].map((_, i) => (
                            <option key={i}>{2024 - i}</option>
                          ))}
                        </select>
                      );
                    }
                    return null;
                  })}
              </div>
            )}

            <div
              className="age-verification-buttons"
              style={{
                display: "flex",
                flexDirection: previewMode === "desktop" ? "row" : "column",
                gap: "12px",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <button
                id="age-verify-agree"
                className="age-verify-button agree"
                style={{
                  background: config.button.bgColor,
                  color: "#FFF",
                  border: `${config.button.borderWidth}px solid ${config.button.borderColor}`,
                  borderRadius: `${config.button.borderRadius}px`,
                  padding: "14px 0",
                  fontWeight: "700",
                  width: previewMode === "desktop" ? "160px" : "100%",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <span
                  dangerouslySetInnerHTML={{ __html: config.button.submitText }}
                />
              </button>
              <button
                id="age-verify-disagree"
                className="age-verify-button disagree"
                style={{
                  background: config.button.cancelBgColor,
                  color: "#FFF",
                  border: `${config.button.cancelBorderWidth}px solid ${config.button.cancelBorderColor}`,
                  borderRadius: `${config.button.cancelBorderRadius}px`,
                  padding: "14px 0",
                  fontWeight: "700",
                  width: previewMode === "desktop" ? "160px" : "100%",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <span
                  dangerouslySetInnerHTML={{ __html: config.button.cancelText }}
                />
              </button>
            </div>

            {showBrandMark && (
              <div
                className="age-verification-footer"
                style={{
                  marginTop: "20px",
                  fontSize: "11px",
                  color: "#999",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {t("termsAndConditions.protectedBy")}{" "}
                <span
                  className="brand-mark"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <span
                    className="brand-shield"
                    style={{ color: "#FF5C00", fontSize: "14px" }}
                  >
                    🛡️
                  </span>{" "}
                  <span
                    className="brand-name"
                    style={{ color: "#005F99", textDecoration: "underline" }}
                  >
                    {t("termsAndConditions.avdTrademark")}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        {showBrandMark !== false ? (
          <button
            onClick={() => {
              setGlobalSettings({
                ...globalSettings,
                showBrandMark: false,
              });
              fetcher.submit(
                { intent: "toggle_brand_mark", showBrandMark: "false" },
                { method: "POST" },
              );
            }}
            style={{
              margin: "12px",
              background: "none",
              border: "none",
              color: "#005F99",
              textDecoration: "underline",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {t("popupEditor.clickToRemoveBrandMark")}
          </button>
        ) : (
          <button
            onClick={() => {
              setGlobalSettings({ ...globalSettings, showBrandMark: true });
              fetcher.submit(
                { intent: "toggle_brand_mark", showBrandMark: "true" },
                { method: "POST" },
              );
            }}
            style={{
              margin: "12px",
              background: "none",
              border: "none",
              color: "#005F99",
              textDecoration: "underline",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            {t("popupEditor.clickToShowBrandMark")}
          </button>
        )}
      </div>
    </div>
  );
};
