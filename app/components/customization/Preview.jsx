export const Preview = ({ config, previewMode, setPreviewMode }) => {
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
          minHeight: "600px",
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
          <button
            onClick={() => setPreviewMode("desktop")}
            style={{
              background: previewMode === "desktop" ? "#E1E3E5" : "transparent",
              border: "none",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "18px",
            }}
            title="Desktop Preview"
          >
            🖥️
          </button>
          <button
            onClick={() => setPreviewMode("mobile")}
            style={{
              background: previewMode === "mobile" ? "#E1E3E5" : "transparent",
              border: "none",
              borderRadius: "6px",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: "18px",
            }}
            title="Mobile Preview"
          >
            📱
          </button>
        </div>

        {/* Preview Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            background: config.background.pageColor,
          }}
        >
          <div
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
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              position: "relative",
              borderRadius:
                previewMode === "mobile"
                  ? "20px"
                  : `${config.background.borderRadius}px`,
              border: `${config.background.borderWidth}px solid ${config.background.borderColor}`,
            }}
          >
            <h3
              style={{
                fontSize: previewMode === "desktop" ? "26px" : "18px",
                fontWeight: "700",
                marginBottom: "20px",
                letterSpacing: "0.5px",
              }}
            >
              {config.text.heading}
            </h3>
            <p
              style={{
                fontSize: previewMode === "desktop" ? "15px" : "13px",
                marginBottom: "30px",
                opacity: 0.9,
              }}
            >
              {config.text.subheading}
            </p>

            {config.method === "Birthdate entry" && (
              <div
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
                          <option>January</option>
                          <option>February</option>
                          <option>March</option>
                          <option>April</option>
                          <option>May</option>
                          <option>June</option>
                          <option>July</option>
                          <option>August</option>
                          <option>September</option>
                          <option>October</option>
                          <option>November</option>
                          <option>December</option>
                        </select>
                      );
                    }
                    if (part === "DD") {
                      return (
                        <select
                          key="day"
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
                {config.button.submitText}
              </button>
              <button
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
                {config.button.cancelText}
              </button>
            </div>

            <div
              style={{
                marginTop: previewMode === "desktop" ? "50px" : "30px",
                fontSize: "11px",
                color: "#999",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Protected by{" "}
              <span
                style={{
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <span style={{ color: "#FF5C00", fontSize: "14px" }}>🛡️</span>{" "}
                <span style={{ color: "#005F99", textDecoration: "underline" }}>
                  AVD
                </span>
              </span>
            </div>
          </div>

          <button
            style={{
              marginTop: "20px",
              background: "none",
              border: "none",
              color: "#005F99",
              textDecoration: "underline",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Click to remove brand mark
          </button>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "12px" }}>
        <p style={{ color: "#6D7175", fontSize: "13px" }}>
          Need help? Please view{" "}
          <a href="#" style={{ color: "#005F99", textDecoration: "none" }}>
            our document guideline
          </a>
        </p>
      </div>
    </div>
  );
};
