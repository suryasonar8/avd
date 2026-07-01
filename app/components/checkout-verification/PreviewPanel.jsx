/* eslint-disable react/prop-types */
import { useState } from "react";
import { DEFAULT_BANNER_HEADING } from "../../constants/checkout-verification";
import { useTranslation } from "../../context/TranslationContext";

export default function PreviewPanel({ config }) {
  const [device, setDevice] = useState("desktop");
  const showBanner = config?.status === "enabled";
  const bannerHeading = config?.heading || DEFAULT_BANNER_HEADING;
  const { t } = useTranslation();

  return (
    <s-box inlineSize="100%" style={{ display: "block", flex: 1, minWidth: 0 }}>
      <s-section>
        {/* Device Toggle */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            borderBottom: "1px solid #F1F1F1",
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
              stroke="#444"
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
              stroke="#444"
              strokeWidth="2"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </s-button>
        </div>

        {/* Checkout Mockup Content */}
        <div
          style={{
            background: "#F9F9F9",
            padding: "24px",
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Device Layout Container */}
          <div
            style={{
              width: "100%",
              maxWidth: device === "mobile" ? "375px" : "800px",
              boxSizing: "border-box",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* Mockup Card */}
            <div
              style={{
                width: "100%",
                background: "#fff",
                border: "1px solid #E1E3E5",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: device === "mobile" ? "column" : "row",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Main Checkout Area */}
              <div
                style={{
                  padding: "24px 16px",
                  flex: 1,
                  borderRight:
                    device === "mobile" ? "none" : "1px solid #F1F1F1",
                  borderBottom:
                    device === "mobile" ? "1px solid #F1F1F1" : "none",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                    {t("checkoutVerification.preview.myStore")}
                  </h2>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#006FBB"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>

                {/* Age Restriction Banner Preview */}
                {showBanner && (
                  <div style={{ marginBottom: "20px" }}>
                    <s-banner tone="warning">
                      <s-text>{bannerHeading}</s-text>
                    </s-banner>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {/* Contact */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      {t("checkoutVerification.preview.contact")}
                    </label>
                    <s-text-field
                      placeholder={t(
                        "checkoutVerification.preview.emailPlaceholder",
                      )}
                      disabled
                    />
                    <div style={{ marginTop: "12px" }}>
                      <s-checkbox
                        label={t("checkoutVerification.preview.emailOffers")}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Delivery */}
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      {t("checkoutVerification.preview.delivery")}
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <s-select disabled>
                        <s-option value={t("checkoutVerification.preview.vietnam")}>
                          {t("checkoutVerification.preview.vietnam")}
                        </s-option>
                      </s-select>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <s-text-field
                            placeholder={t(
                              "checkoutVerification.preview.firstName",
                            )}
                            disabled
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <s-text-field
                            placeholder={t(
                              "checkoutVerification.preview.lastName",
                            )}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Area */}
              <div
                style={{
                  width: device === "mobile" ? "100%" : "30%",
                  minWidth: device === "mobile" ? "100%" : "220px",
                  padding: "24px 16px",
                  background: "#fbfbfb",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{ display: "flex", gap: "12px", marginBottom: "20px" }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      background: "#fff",
                      border: "1px solid #E1E3E5",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#DDD"
                      strokeWidth="1"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>
                        {t("checkoutVerification.preview.productDemo")}
                      </span>
                      <span style={{ fontSize: "14px" }}>$19.99</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#6D7175" }}>
                      {t("checkoutVerification.preview.variantDemo")}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    borderTop: "1px solid #F1F1F1",
                    paddingTop: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                    }}
                  >
                    <span>{t("checkoutVerification.preview.subtotal")}</span>
                    <span>$19.99</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                    }}
                  >
                    <span>{t("checkoutVerification.preview.shipping")}</span>
                    <span>{t("checkoutVerification.preview.free")}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                    }}
                  >
                    <span>
                      {t("checkoutVerification.preview.estimatedTaxes")}{" "}
                      <span style={{ color: "#AAA" }}>?</span>
                    </span>
                    <span>$5.99</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "18px",
                      fontWeight: 700,
                      marginTop: "12px",
                    }}
                  >
                    <span>{t("checkoutVerification.preview.total")}</span>
                    <span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#6D7175",
                        }}
                      >
                        {t("checkoutVerification.preview.usd")}
                      </span>{" "}
                      $25.98
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </s-section>
    </s-box>
  );
}
