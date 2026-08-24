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
            paddingBottom: "16px",
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

        {/* Checkout Mockup Content */}
        <div
          style={{
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
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Header Area */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #F1F1F1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxSizing: "border-box",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: 0,
                    color: "#202223",
                  }}
                >
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

              {/* Mobile Order Summary Toggle */}
              {device === "mobile" && (
                <div
                  style={{
                    background: "#F5F5F5",
                    padding: "16px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #E1E3E5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#6200EE",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    <span>Show order summary</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#202223",
                    }}
                  >
                    $25.98
                  </span>
                </div>
              )}

              {/* Two Column Layout */}
              <div
                style={{
                  display: "flex",
                  flexDirection: device === "mobile" ? "column" : "row",
                  width: "100%",
                }}
              >
                {/* Main Checkout Area */}
                <div
                  style={{
                    padding: "24px",
                    flex: 1,
                    borderRight:
                      device === "mobile" ? "none" : "1px solid #F1F1F1",
                    borderBottom:
                      device === "mobile" ? "1px solid #F1F1F1" : "none",
                    boxSizing: "border-box",
                  }}
                >
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
                      gap: "24px",
                    }}
                  >
                    {/* Contact */}
                    <div>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          margin: "0 0 12px 0",
                          color: "#202223",
                        }}
                      >
                        {t("checkoutVerification.preview.contact")}
                      </h3>
                      <div
                        style={{
                          border: "1px solid #d9d9d9",
                          borderRadius: "4px",
                          padding: "12px",
                          fontSize: "14px",
                          color: "#666",
                          background: "#fff",
                        }}
                      >
                        {t("checkoutVerification.preview.emailPlaceholder")}
                      </div>
                      <div
                        style={{
                          marginTop: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            border: "1px solid #d9d9d9",
                            borderRadius: "4px",
                            background: "#fff",
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#333" }}>
                          {t("checkoutVerification.preview.emailOffers")}
                        </span>
                      </div>
                    </div>

                    {/* Delivery */}
                    <div>
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          margin: "0 0 12px 0",
                          color: "#202223",
                        }}
                      >
                        {t("checkoutVerification.preview.delivery")}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: "4px",
                            padding: "6px 12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "#fff",
                          }}
                        >
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span style={{ fontSize: "12px", color: "#666" }}>
                              {t("checkoutVerification.preview.countryRegion")}
                            </span>
                            <span style={{ fontSize: "14px", color: "#333" }}>
                              {t("checkoutVerification.preview.vietnam")}
                            </span>
                          </div>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M3 4.5L6 7.5L9 4.5"
                              stroke="#666"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <div
                            style={{
                              flex: 1,
                              border: "1px solid #d9d9d9",
                              borderRadius: "4px",
                              padding: "12px",
                              fontSize: "14px",
                              color: "#666",
                              background: "#fff",
                            }}
                          >
                            {t("checkoutVerification.preview.firstName")}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              border: "1px solid #d9d9d9",
                              borderRadius: "4px",
                              padding: "12px",
                              fontSize: "14px",
                              color: "#666",
                              background: "#fff",
                            }}
                          >
                            {t("checkoutVerification.preview.lastName")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Area */}
                <div
                  style={{
                    display: device === "mobile" ? "none" : "block",
                    width: device === "mobile" ? "100%" : "40%",
                    minWidth: device === "mobile" ? "100%" : "260px",
                    padding: "24px",
                    background: "#fbfbfb",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "20px",
                    }}
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
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "2px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#333",
                          }}
                        >
                          {t("checkoutVerification.preview.productDemo")}
                        </span>
                        <span style={{ fontSize: "14px", color: "#333" }}>
                          $19.99
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6D7175",
                          marginTop: "4px",
                        }}
                      >
                        {t("checkoutVerification.preview.variantDemo")}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      borderTop: "1px solid #F1F1F1",
                      paddingTop: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      <span>{t("checkoutVerification.preview.subtotal")}</span>
                      <span>$19.99</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      <span>{t("checkoutVerification.preview.shipping")}</span>
                      <span>{t("checkoutVerification.preview.free")}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        color: "#333",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {t("checkoutVerification.preview.estimatedTaxes")}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#888"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginLeft: "4px" }}
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </span>
                      <span>$5.99</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "#000",
                        }}
                      >
                        {t("checkoutVerification.preview.total")}
                      </span>
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "#000",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 400,
                            color: "#6D7175",
                            marginRight: "4px",
                          }}
                        >
                          {t("checkoutVerification.preview.usd")}
                        </span>
                        $25.98
                      </span>
                    </div>
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
