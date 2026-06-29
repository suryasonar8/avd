import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { Card } from "../components/Card";
import { getAppEmbedStatus } from "../utils/theme.server";
import { PopupService } from "../services/popup.service";
import { AnalyticsService } from "../services/analytics.service";
import DateRangePicker from "../components/DateRangePicker";
import dayjs from "dayjs";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // Use PopupService for popup data
  const popupCount = await PopupService.getPopupCount(session.shop);

  // Fetch analytics data (last 7 days default)
  const analytics = await AnalyticsService.getStats(session.shop, null, null);

  // Fetch shop and theme data
  const shopDataResponse = await admin.graphql(
    `#graphql
    query getShopData {
      shop {
        name
        id
        myshopifyDomain
        metafield(namespace: "avd", key: "settings") {
          value
        }
      }
      themes(first: 10, roles: [MAIN]) {
        nodes {
          id
          name
          files(filenames: ["config/settings_data.json"]) {
            nodes {
              filename
              body {
                ... on OnlineStoreThemeFileBodyText {
                  content
                }
              }
            }
          }
        }
      }
    }`,
  );
  const shopData = await shopDataResponse.json();
  const shop = shopData.data.shop;
  const mainTheme = shopData.data.themes.nodes[0];
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
  const currentSettingsStr = formData.get("settings");
  const currentSettings = JSON.parse(currentSettingsStr || "{}");

  let settings;
  if (actionType === "markTested") {
    settings = { ...currentSettings, tested: true };
  } else {
    const newStatus = formData.get("appStatus") === "true";
    settings = { ...currentSettings, appStatus: newStatus };
  }

  const shopResponse = await admin.graphql(`{ shop { id } }`);
  const shopData = await shopResponse.json();

  await admin.graphql(
    `#graphql
    mutation metafieldUpsert($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            namespace: "avd",
            key: "settings",
            type: "json",
            ownerId: shopData.data.shop.id,
            value: JSON.stringify(settings),
          },
        ],
      },
    },
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
    shopDomain: shop,
  } = useLoaderData();
  const fetcher = useFetcher();
  const analyticsFetcher = useFetcher();

  // Default date range: last 7 days
  const defaultStartDate = dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const defaultEndDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  const [dateRange, setDateRange] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  const getActiveLabel = () => {
    const todayStr = dayjs().format("YYYY-MM-DD");
    const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    const sevenDaysAgoStr = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    const thirtyDaysAgoStr = dayjs().subtract(30, "day").format("YYYY-MM-DD");

    if (dateRange.startDate === todayStr && dateRange.endDate === todayStr) {
      return "today";
    }
    if (
      dateRange.startDate === yesterdayStr &&
      dateRange.endDate === yesterdayStr
    ) {
      return "yesterday";
    }
    if (
      dateRange.startDate === sevenDaysAgoStr &&
      dateRange.endDate === yesterdayStr
    ) {
      return "7 days";
    }
    if (
      dateRange.startDate === thirtyDaysAgoStr &&
      dateRange.endDate === yesterdayStr
    ) {
      return "30 days";
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
      question: "Does this app cost me monthly?",
      answer: (
        <>
          Yes, our app charges a subscription fee based on your selected plan.
          For more details, please view our{" "}
          <s-link
            href="/pricing"
            style={{ color: "#005BD3", textDecoration: "underline" }}
          >
            pricing page
          </s-link>
          .
        </>
      ),
    },
    {
      question: 'Is this app compatible with all "Shopify" themes?',
      answer: "Yes, the app works seamlessly with all 'Shopify' themes.",
    },
    {
      question: "Is this app compatible with custom themes?",
      answer:
        "Currently, custom themes or those purchases from third-party markets (not 'Shopify') may have occasional CSS issues. However, the impact is minimal. Please contact support if you get any problems with it.",
    },
  ];

  const storeName = shopDomain?.replace(".myshopify.com", "") || "";
  const appEmbedUrl = `https://admin.shopify.com/store/${storeName}/themes/${themeId}/editor?context=apps&appEmbed=e03e0948951b94a7b424d1a55634d891%2Fage-verification-dialog`;

  return (
    <s-page>
      {/* Greeting Section */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#202223",
            margin: "0 0 8px 0",
          }}
        >
          Hello {shopName},
        </h1>
        <p style={{ fontSize: "16px", color: "#6D7175", margin: 0 }}>
          Welcome to Age Verification Pop-up 🎉
        </p>
      </div>

      {/* Status Controls Card */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "12px",
          marginBottom: "32px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #F1F2F3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>🔲</span>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Enable app embed on theme
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
              {appEmbedEnabled ? "On" : "Off"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <s-button
              variant="secondary"
              onClick={() => window.open(appEmbedUrl, "_blank")}
            >
              <span style={{ marginRight: "4px" }}>🔗</span> Active app embed
            </s-button>
            <a
              href="#"
              style={{
                fontSize: "13px",
                color: "#005BD3",
                textDecoration: "none",
              }}
            >
              Guideline
            </a>
          </div>
        </div>
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>🔳</span>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Age Verification app status
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
              {currentStatus ? "On" : "Off"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <s-button
              variant="secondary"
              loading={fetcher.state !== "idle" ? "true" : undefined}
              onClick={() => {
                fetcher.submit(
                  {
                    appStatus: (!currentStatus).toString(),
                    settings: JSON.stringify(settings),
                  },
                  { method: "POST" },
                );
              }}
            >
              {currentStatus
                ? "Inactive Age Verification"
                : "Active Age Verification"}
            </s-button>
            <a
              href="#"
              style={{
                fontSize: "13px",
                color: "#005BD3",
                textDecoration: "none",
              }}
            >
              Guideline
            </a>
          </div>
        </div>
      </div>

      {/* Setup guide Card */}
      <Card title="Setup guide">
        <div style={{ position: "absolute", right: "20px", top: "20px" }}>
          <span style={{ cursor: "pointer", color: "#6D7175" }}>•••</span>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              color: "#6D7175",
              marginBottom: "8px",
            }}
          >
            <span>
              {(popupActive ? 1 : 0) + (isTested ? 1 : 0)}/2 completed
            </span>
          </div>
          <div
            style={{
              height: "8px",
              background: "#F1F2F3",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width:
                  popupActive && isTested ? "100%" : popupActive ? "50%" : "0%",
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
              Customize Age Verification Popup
            </span>
            {/* Chevron */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transform: activeStep === 0 ? "rotate(180deg)" : "rotate(0deg)",
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
                Create a custom popup that matches your store's branding and
                legal needs.
              </p>
              <s-button
                variant="primary"
                href="/store_verification/customization"
              >
                Customize now
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
              Test the Popup
            </span>
            {/* Chevron */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transform: activeStep === 1 ? "rotate(180deg)" : "rotate(0deg)",
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
                Verify that your age verification popup is working correctly.
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
                Test now
              </s-button>
            </div>
          )}
        </div>
      </Card>

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
          Overview{" "}
          {activeLabel && (
            <span
              style={{
                fontWeight: "normal",
                color: "#6D7175",
                fontSize: "14px",
                marginLeft: "8px",
              }}
            >
              ({activeLabel})
            </span>
          )}
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
          marginBottom: "32px",
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
            Total verification
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
            Verified
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
            Unverified
          </p>
          <span
            style={{ fontSize: "48px", fontWeight: "700", color: "#202223" }}
          >
            {analyticsFetcher.state !== "idle" ? "…" : (stats?.unverified ?? 0)}
          </span>
        </div>
      </div>

      {/* Support Resources Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          marginBottom: "32px",
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
              Contact support
            </h3>
          </div>
          <p
            style={{ fontSize: "13px", color: "#6D7175", marginBottom: "16px" }}
          >
            We provide <b>24/7</b> support, feel free to contact us if you get
            any problems with the app.
          </p>
          <s-button variant="secondary">Chat with us</s-button>
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
              Read user guideline
            </h3>
          </div>
          <p
            style={{ fontSize: "13px", color: "#6D7175", marginBottom: "16px" }}
          >
            Step-by-step instruction articles to guide you in setting up rules
            in the easiest way.
          </p>
          <s-button variant="secondary">Read user guideline</s-button>
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
              Discover use cases
            </h3>
          </div>
          <p
            style={{ fontSize: "13px", color: "#6D7175", marginBottom: "16px" }}
          >
            Explore our helpful articles on various rule use cases to assist you
            in verifying age of your store.
          </p>
          <s-button variant="secondary">View use cases</s-button>
        </div>
      </div>

      {/* FAQ Section */}
      <Card title="Frequently Ask Questions">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "16px",
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
      </Card>
    </s-page>
  );
}
