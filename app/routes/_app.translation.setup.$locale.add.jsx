import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useActionData,
  useSearchParams,
} from "react-router";
import { useState, useMemo, useEffect } from "react";
import { useAppBridge, SaveBar } from "@shopify/app-bridge-react";
import {
  SectionTitle,
  TranslationField,
  PopupSelector,
} from "../components/TranslationComponents";
import { authenticate } from "../shopify.server";
import { PlanService } from "../services/plan.service";
import { PopupService } from "../services/popup.service";
import db from "../db.server";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { usePlan } from "../context/PlanContext";
import { useTranslation } from "../context/TranslationContext";

const MONTH_NAMES = [
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
  "December"
];

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const { locale } = params;

  // 1. Fetch popups from database
  const popups = await PopupService.getPopupsForTranslation(session.shop);

  // 2. Fetch shop locales
  const response = await admin.graphql(
    `#graphql
    query getLanguages {
      shopLocales {
        locale
        name
        published
      }
    }`,
  );

  const data = await response.json();
  const shopLocales = data.data?.shopLocales || [];
  const language = shopLocales.find((lang) => lang.locale === locale);
  const currentLanguage = language?.name || locale;
  const isPublished = language?.published || false;

  const plan = await PlanService.getShopPlan(admin, session.shop);
  const limit = PlanService.getTranslationLimit(plan);

  const hasPremiumAccess = await PlanService.hasAccess(
    session.shop,
    "translation.unlimited",
  );

  let isLimitReached = false;
  if (limit !== Infinity) {
    const exists = await PopupService.hasTranslationForLocale(
      session.shop,
      locale,
    );
    const count = await PopupService.countTranslatedLocales(session.shop);

    if (!exists && count >= limit) {
      isLimitReached = true;
    }
  }

  const isReadOnly = !hasPremiumAccess || isLimitReached;

  return {
    locale,
    currentLanguage,
    isPublished,
    popups,
    isReadOnly,
    isLimitReached,
  };
};

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const { locale } = params;
  const formData = await request.formData();
  const popupId = formData.get("popupId");
  const translations = JSON.parse(formData.get("translations") || "{}");

  // Server-side gating
  const hasAccess = await PlanService.hasAccess(shop, "translation.unlimited");
  if (!hasAccess) {
    return { success: false, error: "Premium plan required for translations" };
  }

  // Enforce translation limits
  const plan = await PlanService.getShopPlan(admin, shop);
  const limit = PlanService.getTranslationLimit(plan);

  if (limit !== Infinity) {
    const exists = await PopupService.hasTranslationForLocale(shop, locale);
    const count = await PopupService.countTranslatedLocales(shop);

    if (!exists && count >= limit) {
      return {
        success: false,
        error: `Language limit reached (${limit}). Please upgrade your plan to add more languages.`,
      };
    }
  }

  if (!popupId) return { success: false, error: "No popup selected" };

  // Save translation to database
  const saveResult = await PopupService.saveTranslation(
    popupId,
    locale,
    translations,
  );
  if (!saveResult.success) {
    return {
      success: false,
      error: saveResult.error || "Failed to save translation",
    };
  }

  // Sync to Shopify ONLY if the popup is active
  const popup = await PopupService.getPopup(shop, popupId);
  if (popup && popup.status === "Enabled") {
    // Re-fetch the full popup from DB to get the translations included for sync
    const fullPopup = await db.popup.findUnique({
      where: { id: parseInt(popupId) },
      include: { translations: true },
    });
    await PopupService.syncToShopify(admin, shop, fullPopup);
  }

  return { success: true };
};

export default function TranslationSetupPage() {
  const {
    locale,
    currentLanguage,
    isPublished,
    popups,
    isReadOnly,
    isLimitReached,
  } = useLoaderData();
  const { canAccess } = usePlan();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const shopify = useAppBridge();
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const initialPopupId = searchParams.get("popupId") || "";
  const [selectedPopupId, setSelectedPopupId] = useState(initialPopupId);

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show(t("translation.toast.saved"));
    } else if (actionData?.error || actionData?.errors) {
      shopify.toast.show(actionData.error || t("translation.toast.error"), {
        isError: true,
      });
    }
  }, [actionData, shopify, t]);

  const [translations, setTranslations] = useState({
    heading: "",
    subheading: "",
    submitLabel: "",
    cancelLabel: "",
    submitAction: "",
    cancelAction: "",
    submitErrorMsg: "",
    cancelErrorMsg: "",
    months: MONTH_NAMES.reduce((acc, month) => {
      acc[month] = "";
      return acc;
    }, {}),
  });

  const [visibleMonths, setVisibleMonths] = useState(["January"]);

  const selectedPopup = useMemo(
    () => popups.find((p) => p.id.toString() === selectedPopupId.toString()),
    [popups, selectedPopupId],
  );

  const initialTranslations = useMemo(() => {
    if (!selectedPopup)
      return {
        heading: "",
        subheading: "",
        submitLabel: "",
        cancelLabel: "",
        submitAction: "",
        cancelAction: "",
        submitErrorMsg: "",
        cancelErrorMsg: "",
        months: MONTH_NAMES.reduce((acc, month) => {
          acc[month] = "";
          return acc;
        }, {}),
      };

    const existingTranslations =
      selectedPopup.config.translations?.[locale] || {};
    return {
      heading: existingTranslations.heading || "",
      subheading: existingTranslations.subheading || "",
      submitLabel: existingTranslations.submitLabel || "",
      cancelLabel: existingTranslations.cancelLabel || "",
      submitAction: existingTranslations.submitAction || "",
      cancelAction: existingTranslations.cancelAction || "",
      submitErrorMsg: existingTranslations.submitErrorMsg || "",
      cancelErrorMsg: existingTranslations.cancelErrorMsg || "",
      months: MONTH_NAMES.reduce((acc, month) => {
        acc[month] = existingTranslations.months?.[month] || "";
        return acc;
      }, {}),
    };
  }, [selectedPopup, locale]);

  const isDirty = useMemo(() => {
    return JSON.stringify(translations) !== JSON.stringify(initialTranslations);
  }, [translations, initialTranslations]);

  useEffect(() => {
    if (selectedPopup) {
      const existingTranslations =
        selectedPopup.config.translations?.[locale] || {};
      setTranslations({
        heading: existingTranslations.heading || "",
        subheading: existingTranslations.subheading || "",
        submitLabel: existingTranslations.submitLabel || "",
        cancelLabel: existingTranslations.cancelLabel || "",
        submitAction: existingTranslations.submitAction || "",
        cancelAction: existingTranslations.cancelAction || "",
        submitErrorMsg: existingTranslations.submitErrorMsg || "",
        cancelErrorMsg: existingTranslations.cancelErrorMsg || "",
        months: {
          ...MONTH_NAMES.reduce((acc, month) => ({ ...acc, [month]: "" }), {}),
          ...(existingTranslations.months || {}),
        },
      });

      // Update visible months based on what's translated
      if (existingTranslations.months) {
        const translated = MONTH_NAMES.filter(
          (m) =>
            existingTranslations.months[m] &&
            existingTranslations.months[m] !== m,
        );
        if (translated.length > 0) {
          // Show up to the last translated month
          const lastIdx = MONTH_NAMES.indexOf(
            translated[translated.length - 1],
          );
          setVisibleMonths(MONTH_NAMES.slice(0, lastIdx + 1));
        } else {
          setVisibleMonths(["January"]);
        }
      } else {
        setVisibleMonths(["January"]);
      }
    } else {
      setTranslations({
        heading: "",
        subheading: "",
        submitLabel: "",
        cancelLabel: "",
        submitAction: "",
        cancelAction: "",
        submitErrorMsg: "",
        cancelErrorMsg: "",
        months: MONTH_NAMES.reduce((acc, month) => {
          acc[month] = "";
          return acc;
        }, {}),
      });
      setVisibleMonths(["January"]);
    }
  }, [selectedPopup, locale]);

  const handleBack = () => {
    if (isDirty) {
      shopify.toast.show(t("common.saveOrDiscardWarning"), {
        isError: true,
      });
    } else {
      navigate("/translation");
    }
  };

  const handleDiscard = () => {
    setTranslations(initialTranslations);
  };

  const handleSave = () => {
    if (!selectedPopupId) {
      shopify.toast.show(t("translation.pleaseSelectPopup"), { isError: true });
      return;
    }
    submit(
      {
        popupId: selectedPopupId,
        translations: JSON.stringify(translations),
      },
      { method: "POST" },
    );
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "#f6f6f7",
        minHeight: "100vh",
        fontFamily: "Inter, -apple-system, system-ui, sans-serif",
      }}
    >
      <style>{`
        .custom-editor-container {
          margin-bottom: 20px;
        }
        .rsw-ce {
           background: black !important;
           color: white !important;
        }
      `}</style>
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6d7175",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            ←
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                color: "#202223",
              }}
            >
              {currentLanguage}
            </h1>
            {!canAccess("translation.unlimited") && (
              <Badge text={t("common.basicPlanOrHigher")} type="basic" />
            )}
          </div>
          <p
            style={{ margin: "8px 0 0 0", color: "#6d7175", fontSize: "14px" }}
          >
            {t("translation.pageDescription")}
          </p>
        </div>

        <SaveBar id="translation-save-bar" open={isDirty && !isReadOnly}>
          <button variant="primary" onClick={handleSave} disabled={isReadOnly}>
            {t("common.save")}
          </button>
          <button type="button" onClick={handleDiscard}>
            {t("common.discard")}
          </button>
        </SaveBar>
      </div>

      <div style={{ maxWidth: "1000px" }}>
        {/* Info Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <SectionTitle
            title={t("translation.infoSectionTitle")}
            description={t("translation.infoSectionDescription")}
          />
          <Card>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#202223",
                  marginBottom: "8px",
                }}
              >
                {t("common.status")}
              </label>
              <div
                style={{
                  padding: "10px 14px",
                  border: "1px solid #e1e3e5",
                  borderRadius: "8px",
                  background: "white",
                  color: "#6d7175",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {!canAccess("translation.unlimited") ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                    }}
                  >
                    <span style={{ color: "#202223" }}>{t("translation.upgradeNow")}</span>
                    <Badge text={t("common.basicPlanOrHigher")} type="basic" />
                  </div>
                ) : (
                  <span>{isPublished ? t("translation.published") : t("translation.unpublished")}</span>
                )}
              </div>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#202223",
                  marginBottom: "8px",
                }}
              >
                {t("translation.selectPopup")} <span style={{ color: "#d72c0d" }}>*</span>
              </label>
              <PopupSelector
                popups={popups}
                selectedPopupId={selectedPopupId}
                onSelect={setSelectedPopupId}
                isReadOnly={isReadOnly}
              />
            </div>
          </Card>
        </div>

        {/* Text Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <SectionTitle
            title={t("translation.textSectionTitle")}
            description={t("translation.textSectionDescription")}
          />
          <Card>
            <TranslationField
              disabled={isReadOnly || !selectedPopupId}
              label={t("translation.popupHeadingLabel")}
              original={selectedPopup?.config.text?.heading}
              value={translations.heading}
              onChange={(val) =>
                setTranslations({ ...translations, heading: val })
              }
              type="text"
            />
            <TranslationField
              disabled={isReadOnly || !selectedPopupId}
              label={t("translation.popupSubheadingLabel")}
              original={selectedPopup?.config.text?.subheading}
              value={translations.subheading}
              onChange={(val) =>
                setTranslations({ ...translations, subheading: val })
              }
              type="richtext"
            />
          </Card>
        </div>

        {/* Button Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <SectionTitle
            title={t("translation.buttonSectionTitle")}
            description={t("translation.buttonSectionDescription")}
          />
          <Card>
            <TranslationField
              disabled={isReadOnly || !selectedPopupId}
              label={t("translation.submitButtonLabel")}
              original={selectedPopup?.config.button?.submitText}
              value={translations.submitLabel}
              onChange={(val) =>
                setTranslations({ ...translations, submitLabel: val })
              }
              type="richtext"
            />
            <TranslationField
              disabled={isReadOnly || !selectedPopupId}
              label={t("translation.cancelButtonLabel")}
              original={selectedPopup?.config.button?.cancelText}
              value={translations.cancelLabel}
              onChange={(val) =>
                setTranslations({ ...translations, cancelLabel: val })
              }
              type="richtext"
            />
            <TranslationField
              disabled={isReadOnly || !selectedPopupId}
              label={t("translation.submitButtonAction")}
              original={selectedPopup?.config.button?.submitAction}
              value={translations.submitAction}
              onChange={(val) =>
                setTranslations({ ...translations, submitAction: val })
              }
              type="text"
            />
            <TranslationField
              disabled={isReadOnly || !selectedPopupId}
              label={t("translation.cancelButtonAction")}
              original={selectedPopup?.config.button?.cancelAction}
              value={translations.cancelAction}
              onChange={(val) =>
                setTranslations({ ...translations, cancelAction: val })
              }
              type="text"
            />
          </Card>
        </div>

        {/* Label Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          <SectionTitle
            title={t("translation.labelSectionTitle")}
            description={t("translation.labelSectionDescription")}
          />
          <Card>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {visibleMonths.map((month) => (
                <TranslationField
                  key={month}
                  label={t("translation.monthLabel")}
                  original={selectedPopupId ? t("months." + month.toLowerCase()) : t("translation.monthLabel")}
                  value={translations.months[month]}
                  disabled={isReadOnly || !selectedPopupId}
                  onChange={(val) =>
                    setTranslations({
                      ...translations,
                      months: {
                        ...translations.months,
                        [month]: val,
                      },
                    })
                  }
                />
              ))}

              {visibleMonths.length < 12 && (
                <div>
                  <button
                    onClick={() => {
                      if (isReadOnly) return;
                      const nextMonth = MONTH_NAMES[visibleMonths.length];
                      if (nextMonth) {
                        setVisibleMonths([...visibleMonths, nextMonth]);
                      }
                    }}
                    disabled={isReadOnly || !selectedPopupId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      background: "white",
                      border: "1px solid #e1e3e5",
                      borderRadius: "8px",
                      cursor: isReadOnly ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#202223",
                    }}
                  >
                    <span style={{ fontSize: "18px", fontWeight: "400" }}>
                      +
                    </span>{" "}
                    {t("translation.addMonth")}
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            paddingBottom: "40px",
          }}
        >
          <p style={{ fontSize: "13px", color: "#6d7175" }}>
            {t("common.needHelp")}{" "}
            <a href="#" style={{ color: "#005BD3", textDecoration: "none" }}>
              {t("common.ourDocumentGuideline")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
