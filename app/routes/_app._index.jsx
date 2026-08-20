import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getAppEmbedStatus } from "../utils/theme.server";
import { PopupService } from "../services/popup.service";
import { AnalyticsService } from "../services/analytics.service";
import { ShopService } from "../services/shop.service";
import { SettingsService } from "../services/settings.service";
import DateRangePicker from "../components/DateRangePicker";
import TurnOffModal from "../components/TurnOffModal";
import { useTranslation } from "../context/TranslationContext";
import dayjs from "dayjs";
import { AppEmbedIcon, AppsIcon } from "../components/store-verification/Icons";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // Use PopupService for popup data
  const popupCount = await PopupService.getPopupCount(session.shop);

  // Fetch analytics data (last 7 days default)
  const analytics = await AnalyticsService.getStats(session.shop, null, null);

  // Fetch shop and theme data
  const { shop, mainTheme } = await ShopService.getDashboardData(admin);
  const themeId = mainTheme?.id.split("/").pop();

  // Check app embed status from theme settings_data.json
  const appEmbedEnabled = await getAppEmbedStatus(mainTheme);

  const metafieldValue = shop.metafield?.value;
  const settings = metafieldValue ? JSON.parse(metafieldValue) : {};
  const appStatus =
    settings.appStatus !== undefined ? settings.appStatus : true;
  const tested = settings.tested === true;

  return {
    shopName: shop.name,
    shopDomain: shop.myshopifyDomain,
    themeId,
    popupCount,
    popupActive: popupCount > 0,
    appStatus,
    tested,
    settings,
    appEmbedEnabled,
    analytics,
  };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("_action");

  // Re-fetch the metafield fresh instead of trusting the client's snapshot,
  // since other parts of the app (settings page, plan sync) write to the
  // same "avd/settings" metafield and the client copy can be stale.
  const shopData = await ShopService.getMetafield(admin, "$app:avd", "settings");
  const existingValue = shopData?.metafield?.value;
  const currentSettings = existingValue ? JSON.parse(existingValue) : {};

  let settings;
  if (actionType === "markTested") {
    settings = { ...currentSettings, tested: true };
  } else {
    const newStatus = formData.get("appStatus") === "true";
    settings = { ...currentSettings, appStatus: newStatus };
  }

  const shopId = await ShopService.getShopId(admin);

  await SettingsService.ensureDefinitionsExist(admin);
  await ShopService.updateMetafield(
    admin,
    shopId,
    "$app:avd",
    "settings",
    JSON.stringify(settings),
  );

  return { success: true };
};

export default function Dashboard() {
  const {
    shopName,
    shopDomain,
    themeId,
    popupCount,
    popupActive,
    appStatus,
    tested,
    settings,
    appEmbedEnabled,
    analytics,
  } = useLoaderData();
  const fetcher = useFetcher();
  const analyticsFetcher = useFetcher();
  const { t } = useTranslation();
  const shopify = useAppBridge();

  // Default date range: last 7 days
  const defaultStartDate = dayjs().subtract(6, "day").format("YYYY-MM-DD");
  const defaultEndDate = dayjs().format("YYYY-MM-DD");

  const [dateRange, setDateRange] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  const getActiveLabel = () => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    const sevenDaysAgoStr = dayjs().subtract(6, "day").format("YYYY-MM-DD");
    const thirtyDaysAgoStr = dayjs().subtract(29, "day").format("YYYY-MM-DD");

    if (dateRange.startDate === todayStr && dateRange.endDate === todayStr) {
      return t("dashboard.dateLabels.today");
    }
    if (
      dateRange.startDate === yesterdayStr &&
      dateRange.endDate === yesterdayStr
    ) {
      return t("dashboard.dateLabels.yesterday");
    }
    if (
      dateRange.startDate === sevenDaysAgoStr &&
      dateRange.endDate === todayStr
    ) {
      return t("dashboard.dateLabels.7days");
    }
    if (
      dateRange.startDate === thirtyDaysAgoStr &&
      dateRange.endDate === todayStr
    ) {
      return t("dashboard.dateLabels.30days");
    }
    return null;
  };

  const activeLabel = getActiveLabel();

  // Re-fetch analytics whenever the date range changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (shopDomain) params.set("shop", shopDomain);
    if (dateRange.startDate) params.set("startDate", dateRange.startDate);
    if (dateRange.endDate) params.set("endDate", dateRange.endDate);
    analyticsFetcher.load(`/api/analytics?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Use fetcher data when available, fall back to loader's initial data
  const stats = analyticsFetcher.data ?? analytics;

  // Optimistic: treat as tested once the markTested action is in-flight
  const isMarkingTested =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("_action") === "markTested";
  const isTested = tested || isMarkingTested;

  const currentStatus = fetcher.formData
    ? fetcher.formData.get("appStatus") === "true"
    : appStatus;

  // Accordion: which step is expanded. Default to the first incomplete step.
  const defaultActive = isTested ? null : popupActive ? 1 : 0;
  const [activeStep, setActiveStep] = useState(defaultActive);
  const toggleStep = (idx) =>
    setActiveStep((prev) => (prev === idx ? null : idx));

  const [activeFaq, setActiveFaq] = useState(null);
  const toggleFaq = (idx) =>
    setActiveFaq((prev) => (prev === idx ? null : idx));

  const faqData = [
    {
      question: t("dashboard.faq1Question"),
      answer: (
        <>
          {t("dashboard.faq1Answer")}{" "}
          <s-link
            href="/pricing"
            style={{ color: "#005BD3", textDecoration: "underline" }}
          >
            {t("dashboard.faq1LinkText")}
          </s-link>
          .
        </>
      ),
    },
    {
      question: t("dashboard.faq2Question"),
      answer: t("dashboard.faq2Answer"),
    },
    {
      question: t("dashboard.faq3Question"),
      answer: t("dashboard.faq3Answer"),
    },
  ];

  const storeName = shopDomain?.replace(".myshopify.com", "") || "";
  const appEmbedUrl = `https://admin.shopify.com/store/${storeName}/themes/${themeId}/editor?context=apps&appEmbed=e03e0948951b94a7b424d1a55634d891%2Fage-verification-dialog`;

  return (
    <s-page>
      {/* Greeting Section */}
      <PageHeader
        title={t("dashboard.greeting", { shopName })}
        description={t("dashboard.welcome")}
      />

      {/* Status Controls Card */}
      <s-section>
        <div
          style={{
            paddingBottom: "16px",
            borderBottom: "1px solid #F1F2F3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ display: "flex", color: "#202223" }}>
              <AppEmbedIcon />
            </span>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              {t("dashboard.enableAppEmbed")}
            </span>
            <span
              style={{
                background: appEmbedEnabled ? "#E3F1F8" : "#FFF4B2",
                color: appEmbedEnabled ? "#005F99" : "#7C5C00",
                fontSize: "12px",
                fontWeight: "600",
                padding: "2px 8px",
                borderRadius: "99px",
              }}
            >
              {appEmbedEnabled ? t("common.on") : t("common.off")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <s-button
              variant="secondary"
              onClick={() => window.open(appEmbedUrl, "_blank")}
            >
              <span style={{ marginRight: "4px" }}>🔗</span>{" "}
              {appEmbedEnabled
                ? t("dashboard.deactivateAppEmbed")
                : t("dashboard.activeAppEmbed")}
            </s-button>
            <a
              href="#"
              style={{
                fontSize: "13px",
                color: "#005BD3",
                textDecoration: "none",
              }}
            >
              {t("common.guideline")}
            </a>
          </div>
        </div>
        <div
          style={{
            paddingTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ display: "flex", color: "#202223" }}>
              <AppsIcon />
            </span>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              {t("dashboard.appStatus")}
            </span>
            <span
              style={{
                background: currentStatus ? "#E3F1F8" : "#FEEBEE",
                color: currentStatus ? "#005F99" : "#BC2222",
                fontSize: "12px",
                fontWeight: "600",
                padding: "2px 8px",
                borderRadius: "99px",
              }}
            >
              {currentStatus ? t("common.on") : t("common.off")}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <s-button
              variant="secondary"
              loading={fetcher.state !== "idle" ? "true" : undefined}
              onClick={() => {
                if (currentStatus) {
                  shopify.modal.show("turn-off-modal");
                } else {
                  fetcher.submit(
                    {
                      appStatus: "true",
                      settings: JSON.stringify(settings),
                    },
                    { method: "POST" },
                  );
                }
              }}
            >
              {currentStatus
                ? t("dashboard.inactiveAgeVerification")
                : t("dashboard.activeAgeVerification")}
            </s-button>
            <a
              href="#"
              style={{
                fontSize: "13px",
                color: "#005BD3",
                textDecoration: "none",
              }}
            >
              {t("common.guideline")}
            </a>
          </div>
        </div>
      </s-section>

      {/* Setup guide Card */}
      <s-section>
        <s-text>{t("dashboard.setupGuide")}</s-text>
        <div style={{ padding: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#6D7175",
                whiteSpace: "nowrap",
              }}
            >
              <span>
                {(popupActive ? 1 : 0) + (isTested ? 1 : 0)}/2{" "}
                {t("common.completed")}
              </span>
            </div>
            <div
              style={{
                flex: 1,
                height: "8px",
                background: "#F1F2F3",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width:
                    popupActive && isTested
                      ? "100%"
                      : popupActive
                        ? "50%"
                        : "0%",
                  height: "100%",
                  background: popupActive ? "#202223" : "#E1E3E5",
                  transition: "width 0.4s ease",
                }}
              ></div>
            </div>
          </div>

          {/* Step 1: Customize — clickable header, expands when activeStep === 0 */}
          <div
            style={{
              background: activeStep === 0 ? "#F6F6F7" : "transparent",
              borderRadius: "8px",
              marginBottom: "4px",
              transition: "background 0.2s ease",
            }}
          >
            {/* Clickable header row */}
            <div
              onClick={() => toggleStep(0)}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                padding: "12px 20px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {/* Circle indicator */}
              {popupActive ? (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#202223",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px dashed #BABFC3",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: popupActive ? "#202223" : "#6D7175",
                  flex: 1,
                }}
              >
                {t("dashboard.customizePopup")}
              </span>
              {/* Chevron */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  transform:
                    activeStep === 0 ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  color: "#6D7175",
                }}
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Expandable body */}
            {activeStep === 0 && (
              <div style={{ padding: "4px 20px 20px 52px" }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6D7175",
                    margin: "0 0 16px 0",
                  }}
                >
                  {t("dashboard.customizePopupDescription")}
                </p>
                <s-button
                  variant="primary"
                  href="/store_verification/customization"
                >
                  {t("dashboard.customize")}
                </s-button>
              </div>
            )}
          </div>

          {/* Step 2: Test the Popup — clickable header, expands when activeStep === 1 */}
          <div
            style={{
              background: activeStep === 1 ? "#F6F6F7" : "transparent",
              borderRadius: "8px",
              marginBottom: "4px",
              transition: "background 0.2s ease",
            }}
          >
            {/* Clickable header row */}
            <div
              onClick={() => toggleStep(1)}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                padding: "12px 20px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {/* Circle indicator */}
              {isTested ? (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#202223",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px dashed #BABFC3",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: isTested
                    ? "#202223"
                    : popupActive
                      ? "#202223"
                      : "#6D7175",
                  flex: 1,
                }}
              >
                {t("dashboard.testPopup")}
              </span>
              {/* Chevron */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  transform:
                    activeStep === 1 ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  color: "#6D7175",
                }}
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Expandable body */}
            {activeStep === 1 && (
              <div style={{ padding: "4px 20px 20px 52px" }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6D7175",
                    margin: "0 0 16px 0",
                  }}
                >
                  {t("dashboard.testPopupDescription")}
                </p>
                <s-button
                  variant="primary"
                  loading={isMarkingTested ? "true" : undefined}
                  onClick={() => {
                    window.open(`https://${shopDomain}`, "_blank");
                    fetcher.submit(
                      {
                        _action: "markTested",
                        settings: JSON.stringify(settings),
                      },
                      { method: "POST" },
                    );
                  }}
                >
                  {t("dashboard.testNow")}
                </s-button>
              </div>
            )}
          </div>
        </div>
      </s-section>

      <s-section>
        {/* Overview Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
            {t("dashboard.overview")}{" "}
          </h2>
          <div style={{ width: "240px" }}>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "#F6F6F7",
              padding: "24px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#202223",
                marginBottom: "8px",
              }}
            >
              {t("dashboard.totalVerification")}
            </p>
            <span
              style={{ fontSize: "48px", fontWeight: "700", color: "#202223" }}
            >
              {analyticsFetcher.state !== "idle" ? "…" : (stats?.total ?? 0)}
            </span>
          </div>
          <div
            style={{
              background: "#F6F6F7",
              padding: "24px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#202223",
                marginBottom: "8px",
              }}
            >
              {t("dashboard.verified")}
            </p>
            <span
              style={{ fontSize: "48px", fontWeight: "700", color: "#202223" }}
            >
              {analyticsFetcher.state !== "idle" ? "…" : (stats?.verified ?? 0)}
            </span>
          </div>
          <div
            style={{
              background: "#F6F6F7",
              padding: "24px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#202223",
                marginBottom: "8px",
              }}
            >
              {t("dashboard.unverified")}
            </p>
            <span
              style={{ fontSize: "48px", fontWeight: "700", color: "#202223" }}
            >
              {analyticsFetcher.state !== "idle"
                ? "…"
                : (stats?.unverified ?? 0)}
            </span>
          </div>
        </div>
      </s-section>
      {/* Support Resources Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E1E3E5",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>💬</span>
            <h3 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>
              {t("dashboard.contactSupport")}
            </h3>
          </div>
          <p
            style={{ fontSize: "13px", color: "#6D7175", marginBottom: "16px" }}
          >
            {t("dashboard.contactSupportDescription")}
          </p>
          <s-button variant="secondary">{t("dashboard.chatWithUs")}</s-button>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E1E3E5",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>📖</span>
            <h3 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>
              {t("dashboard.readUserGuideline")}
            </h3>
          </div>
          <p
            style={{ fontSize: "13px", color: "#6D7175", marginBottom: "16px" }}
          >
            {t("dashboard.readUserGuidelineDescription")}
          </p>
          <s-button variant="secondary">
            {t("dashboard.readUserGuideline")}
          </s-button>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E1E3E5",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🗺️</span>
            <h3 style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>
              {t("dashboard.discoverUseCases")}
            </h3>
          </div>
          <p
            style={{ fontSize: "13px", color: "#6D7175", marginBottom: "16px" }}
          >
            {t("dashboard.discoverUseCasesDescription")}
          </p>
          <s-button variant="secondary">{t("dashboard.viewUseCases")}</s-button>
        </div>
      </div>

      {/* FAQ Section */}
      <s-section>
        <s-text>{t("dashboard.faq")}</s-text>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {faqData.map((item, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #E1E3E5",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                onClick={() => toggleFaq(i)}
                style={{
                  padding: "16px",
                  fontSize: "14px",
                  color: "#202223",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: activeFaq === i ? "#F6F6F7" : "transparent",
                  fontWeight: "500",
                }}
              >
                <span>
                  {i + 1}. {item.question}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    transform:
                      activeFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    color: "#6D7175",
                  }}
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {activeFaq === i && (
                <div
                  style={{
                    padding: "16px",
                    fontSize: "13px",
                    color: "#6D7175",
                    background: "#F6F6F7",
                    borderTop: "1px solid #E1E3E5",
                    lineHeight: "1.5",
                  }}
                >
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </s-section>

      <TurnOffModal
        onConfirm={() => {
          fetcher.submit(
            {
              appStatus: "false",
              settings: JSON.stringify(settings),
            },
            { method: "POST" },
          );
        }}
      />
      <PageFooter />
    </s-page>
  );
}
