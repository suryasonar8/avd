import { useEffect, useRef, useState } from "react";
import { useNavigate, useLoaderData, useRevalidator } from "react-router";
import { authenticate } from "../shopify.server";
import { usePlan } from "../context/PlanContext";
import { Modal } from "../components/Modal";
import { PlanService } from "../services/plan.service";
import { PopupService } from "../services/popup.service";
import { StoreLanguageService } from "../services/store-language.service";
import PricingBanner from "../components/PricingBanner";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import { useTranslation } from "../context/TranslationContext";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session.shop.replace(".myshopify.com", "");

  // Fetch shop locales
  const shopLocales = await StoreLanguageService.getStoreLanguages(admin);
  const primaryLocale =
    shopLocales.find((lang) => lang.primary)?.locale || "en";

  // Use PopupService to check for popups and fetch translated languages
  const hasPopups = (await PopupService.getPopupCount(session.shop)) > 0;
  const translatedLanguages = await PopupService.getTranslatedLocales(
    session.shop,
  );

  const plan = await PlanService.getShopPlan(admin, session.shop);
  const limit = PlanService.getTranslationLimit(plan);

  return {
    shop: shopDomain,
    shopLocales,
    primaryLocale,
    translatedLanguages,
    hasPopups,
    limit,
  };
};

export default function TranslationPage() {
  const {
    shop,
    shopLocales,
    primaryLocale,
    translatedLanguages,
    hasPopups,
    limit,
  } = useLoaderData();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { plan } = usePlan();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const { t } = useTranslation();
  const canAddLanguage = translatedLanguages.length < limit;
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (isRefreshingRef.current && revalidator.state === "idle") {
      isRefreshingRef.current = false;
      if (typeof shopify !== "undefined") {
        shopify.toast.show(t("translation.toast.updated"));
      }
    }
  }, [revalidator.state, t]);

  const languages = [
    { label: t("translation.select"), value: "" },
    ...shopLocales
      .filter((lang) => lang.locale !== primaryLocale)
      .map((lang) => ({
        label: lang.name,
        value: lang.locale,
      })),
  ];

  const primaryLocaleName =
    shopLocales.find((lang) => lang.locale === primaryLocale)?.name ||
    "English";

  const handleAddLanguage = () => {
    if (!canAddLanguage) {
      if (typeof shopify !== "undefined") {
        shopify.toast.show(t("translation.languageLimitReached"));
      }
      navigate("/pricing");
      return;
    }

    if (hasPopups) {
      setIsModalOpen(true);
    } else {
      navigate("/store_verification/customization");
    }
  };

  const handleRefresh = () => {
    isRefreshingRef.current = true;
    revalidator.revalidate();
  };

  const handleRedirect = () => {
    // Redirect to Shopify Admin language settings
    window.open(
      `https://admin.shopify.com/store/${shop}/settings/languages`,
      "_blank",
    );
  };

  return (
    <s-page>
      {/* Header */}
      <PageHeader
        title={t("translation.pageTitle")}
        description={t("translation.pageDescription")}
        actionButton={
          <s-button
            onClick={handleRefresh}
            loading={revalidator.state === "loading"}
          >
            {t("translation.refreshData")}
          </s-button>
        }
      />
      {/* Free Plan Limit Banner */}
      <PricingBanner text={t("translation.upgradePromo")} />
      {/* Default Language Card */}
      <div style={{ marginBottom: "24px" }}>
        <s-section>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 15H19M14 15H19M17 13.5V15M4.85714 8H9.14286M4 11L5.53848 5.61531C5.97492 4.08777 6.19315 3.324 6.53044 3.13222C6.82159 2.96667 7.17841 2.96667 7.46956 3.13222C7.80685 3.324 8.02508 4.08777 8.46152 5.61531L10 11M14 20.9776C16.8033 20.725 19 18.369 19 15.5V15M20 20.9776C18.0763 20.8043 16.4382 19.6404 15.5996 18M14 7C14.9319 7 15.3978 7 15.7654 7.15225C16.2554 7.35523 16.6448 7.74458 16.8478 8.23464C17 8.60218 17 9.06812 17 10M7 15C7 15.9319 7 16.3978 7.15224 16.7654C7.35523 17.2554 7.74458 17.6448 8.23463 17.8478C8.60218 18 9.06812 18 10 18"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <s-heading>
                {t("translation.defaultLanguage", {
                  language: primaryLocaleName,
                })}
              </s-heading>
            </div>
            <s-text color="subdued">
              {t("translation.defaultLanguageDesc")}
            </s-text>
            <div style={{ marginTop: "4px" }}>
              <s-button onClick={handleRedirect}>
                {t("translation.changeDefault")}
              </s-button>
            </div>
          </div>
        </s-section>
      </div>
      {/* Translation List Card */}
      <div style={{ marginBottom: "24px" }}>
        <s-section>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
              {t("translation.translationList")}
            </s-text>
            <s-divider></s-divider>

            {translatedLanguages.length > 0 ? (
              <div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E1E3E5" }}>
                      <th
                        style={{
                          padding: "16px 8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#6d7175",
                        }}
                      >
                        {t("translation.tableHeaders.language")}
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#6d7175",
                        }}
                      >
                        {t("translation.tableHeaders.popups")}
                      </th>
                      <th
                        style={{
                          padding: "16px 8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#6d7175",
                          textAlign: "right",
                        }}
                      >
                        {t("translation.tableHeaders.action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {translatedLanguages.map((item) => {
                      const langName =
                        shopLocales.find((l) => l.locale === item.locale)
                          ?.name || item.locale;
                      return (
                        <tr
                          key={item.locale}
                          style={{ borderBottom: "1px solid #F1F2F3" }}
                        >
                          <td style={{ padding: "16px 8px", fontSize: "14px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span style={{ fontWeight: "500" }}>
                                {langName}
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#6d7175",
                                  background: "#f1f2f3",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                {item.locale.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "16px 8px", fontSize: "14px" }}>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                              }}
                            >
                              {item.popups.map((p) => (
                                <span
                                  key={p.id}
                                  style={{
                                    background: "#EBF5FF",
                                    color: "#006FBB",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "16px 8px",
                              textAlign: "right",
                            }}
                          >
                            <s-button
                              onClick={() => {
                                const popupId = item.popups[0]?.id;
                                const url = `/translation/setup/${item.locale}/add${
                                  popupId
                                    ? `?popupId=${encodeURIComponent(popupId)}`
                                    : ""
                                }`;
                                navigate(url);
                              }}
                            >
                              {t("common.edit")}
                            </s-button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div
                  style={{
                    padding: "16px 0 0 0",
                    textAlign: "center",
                  }}
                >
                  <s-button onClick={handleAddLanguage} variant="primary">
                    {hasPopups
                      ? t("translation.addLanguage")
                      : t("translation.createPopup")}
                  </s-button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src="/translation-empty-state.png"
                  alt="No translations"
                  style={{
                    width: "140px",
                    marginBottom: "24px",
                    opacity: 0.8,
                  }}
                />
                <s-heading>{t("translation.emptyTitle")}</s-heading>
                <s-text>{t("translation.emptyDescription")}</s-text>
                <s-button onClick={handleAddLanguage} variant="primary">
                  {hasPopups
                    ? t("translation.addLanguage")
                    : t("translation.createPopup")}
                </s-button>
              </div>
            )}
          </div>
        </s-section>
      </div>
      {/* Add Language Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("translation.addLanguage")}
        primaryAction={{
          content: t("translation.addLanguage").split(" ")[0] || "Add",
          onAction: () => {
            navigate(`/translation/setup/${selectedLanguage}/add`);
            setIsModalOpen(false);
            setSelectedLanguage("");
          },
          disabled: !selectedLanguage,
        }}
        secondaryAction={{
          content: t("common.cancel"),
          onAction: () => setIsModalOpen(false),
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#202223",
              marginBottom: "8px",
            }}
          >
            {t("translation.selectLanguage")}
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                paddingRight: "36px",
                borderRadius: "8px",
                border: "1px solid #E1E3E5",
                fontSize: "14px",
                backgroundColor: "white",
                color: "#202223",
                appearance: "none",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 20 20" fill="#6d7175">
                <path d="M10 2a1 1 0 01.707.293l4 4a1 1 0 11-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414-1.414l4-4A1 1 0 0110 2zm0 16a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 18z" />
              </svg>
            </div>
          </div>
        </div>
      </Modal>
      <PageFooter />
    </s-page>
  );
}
