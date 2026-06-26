import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useActionData,
  useSearchParams,
  redirect,
} from "react-router";
import { useState, useMemo, useEffect } from "react";
import { useAppBridge, SaveBar } from "@shopify/app-bridge-react";
import { RichTextEditor } from "../components/RichTextEditor";
import { authenticate } from "../shopify.server";
import { PlanService } from "../services/plan.service";
import { PopupService } from "../services/popup.service";
import db from "../db.server";
import { Card } from "../components/Card";

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const { locale } = params;

  // Fetch popups from database
  const popups = await PopupService.getPopupsForTranslation(session.shop);

  // Fetch shop locales
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
    hasPremiumAccess,
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

function SectionTitle({ title, description }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1A1C1D" }}>
        {title}
      </h2>
      <p style={{ fontSize: "13px", color: "#6D7175" }}>{description}</p>
    </div>
  );
}

function TranslationField({
  label,
  original,
  value,
  onChange,
  type = "text",
  disabled = false,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#1A1C1D" }}>
        {label}
      </label>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "12px",
          background: "#F6F6F7",
          borderRadius: "8px",
          border: "1px solid #E1E3E5",
        }}
      >
        <div style={{ fontSize: "12px", color: "#6D7175" }}>
          Original: {original || "(empty)"}
        </div>
        {type === "richtext" ? (
          <RichTextEditor
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
          />
        ) : (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #CBCFD2",
              fontSize: "13px",
              width: "100%",
              boxSizing: "border-box",
              opacity: disabled ? 0.6 : 1,
            }}
          />
        )}
      </div>
    </div>
  );
}

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
  "December",
];

export default function TranslationSetupPage() {
  const {
    locale,
    currentLanguage,
    isPublished,
    popups,
    isReadOnly,
    hasPremiumAccess,
    isLimitReached,
  } = useLoaderData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const actionData = useActionData();
  const [searchParams] = useSearchParams();
  const shopify = useAppBridge();

  const [selectedPopupId, setSelectedPopupId] = useState(
    searchParams.get("popupId") || popups[0]?.id || "",
  );

  const selectedPopup = useMemo(
    () => popups.find((p) => p.id.toString() === selectedPopupId.toString()),
    [popups, selectedPopupId],
  );

  const [translations, setTranslations] = useState({
    heading: "",
    subheading: "",
    submitLabel: "",
    cancelLabel: "",
    submitErrorMsg: "",
    cancelErrorMsg: "",
    months: MONTH_NAMES.reduce((acc, month) => ({ ...acc, [month]: "" }), {}),
  });

  const [initialTranslations, setInitialTranslations] = useState(translations);

  useEffect(() => {
    if (selectedPopup) {
      const existing = selectedPopup.config.translations?.[locale] || {};
      const newTranslations = {
        heading: existing.heading || "",
        subheading: existing.subheading || "",
        submitLabel: existing.submitLabel || "",
        cancelLabel: existing.cancelLabel || "",
        submitErrorMsg: existing.submitErrorMsg || "",
        cancelErrorMsg: existing.cancelErrorMsg || "",
        months: {
          ...MONTH_NAMES.reduce((acc, month) => ({ ...acc, [month]: "" }), {}),
          ...(existing.months || {}),
        },
      };
      setTranslations(newTranslations);
      setInitialTranslations(newTranslations);
    }
  }, [selectedPopup, locale]);

  const isDirty = useMemo(() => {
    return JSON.stringify(translations) !== JSON.stringify(initialTranslations);
  }, [translations, initialTranslations]);

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Translations saved");
      setInitialTranslations(translations);
    } else if (actionData?.error) {
      shopify.toast.show(actionData.error, { isError: true });
    }
  }, [actionData, shopify, translations]);

  const handleBack = () => {
    if (isDirty) {
      shopify.toast.show("Please save or discard your changes", {
        isError: true,
      });
      return;
    }
    navigate("/translation");
  };

  const handleDiscard = () => {
    setTranslations(initialTranslations);
  };

  const handleSave = () => {
    if (isReadOnly) return;
    submit(
      {
        popupId: selectedPopupId,
        translations: JSON.stringify(translations),
      },
      { method: "POST" },
    );
  };

  return (
    <s-page>
      <SaveBar id="translation-save-bar" open={isDirty}>
        <button variant="primary" onClick={handleSave} disabled={isReadOnly}>
          Save
        </button>
        <button type="button" onClick={handleDiscard}>
          Discard
        </button>
      </SaveBar>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "4px",
          }}
        >
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "#1A1C1D",
            }}
          >
            ←
          </button>
          <h2
            style={{
              fontSize: "26px",
              fontWeight: "700",
              margin: 0,
              color: "#1A1C1D",
            }}
          >
            Add Translation ({currentLanguage})
          </h2>
        </div>
      </div>

      {!hasPremiumAccess && (
        <div
          style={{
            background: "#BDE6FF",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            border: "1px solid #A2D9FF",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", color: "#005F99" }}>ⓘ</span>
              <span
                style={{
                  fontWeight: "700",
                  color: "#1A1C1D",
                  fontSize: "13px",
                }}
              >
                Premium Feature
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#4A4D4F", margin: 0 }}>
              Multi-language support is a premium feature. Upgrade to unlock
              unlimited translations for your pop-ups.
            </p>
          </div>
          <button
            onClick={() => navigate("/pricing")}
            style={{
              padding: "8px 16px",
              background: "#FFF",
              border: "1px solid #005F99",
              borderRadius: "6px",
              color: "#005F99",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Upgrade plan
          </button>
        </div>
      )}

      {isLimitReached && hasPremiumAccess && (
        <div
          style={{
            background: "#FEEBEB",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            border: "1px solid #FED3D3",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", color: "#D72C0D" }}>⚠</span>
              <span
                style={{
                  fontWeight: "700",
                  color: "#1A1C1D",
                  fontSize: "13px",
                }}
              >
                Translation Limit Reached
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#4A4D4F", margin: 0 }}>
              You have reached the translation limit for your plan. Please
              upgrade to add more languages.
            </p>
          </div>
          <button
            onClick={() => navigate("/pricing")}
            style={{
              padding: "8px 16px",
              background: "#FFF",
              border: "1px solid #D72C0D",
              borderRadius: "6px",
              color: "#D72C0D",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Upgrade plan
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <Card>
          <SectionTitle
            title="Select Pop-up"
            description="Choose which pop-up you want to translate."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#1A1C1D" }}
            >
              Pop-up
            </label>
            <select
              value={selectedPopupId}
              onChange={(e) => setSelectedPopupId(e.target.value)}
              disabled={isReadOnly}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #CBCFD2",
                fontSize: "13px",
                width: "100%",
                maxWidth: "400px",
                opacity: isReadOnly ? 0.6 : 1,
              }}
            >
              {popups.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.config.name || "Untitled Popup"}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {selectedPopup && (
          <>
            <Card>
              <SectionTitle
                title="Pop-up Content"
                description="Translate headings and static text."
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <TranslationField
                  label="Heading"
                  original={selectedPopup.config.text?.heading}
                  value={translations.heading}
                  onChange={(v) =>
                    setTranslations((prev) => ({ ...prev, heading: v }))
                  }
                  disabled={isReadOnly}
                />
                <TranslationField
                  label="Subheading"
                  original={selectedPopup.config.text?.subheading}
                  value={translations.subheading}
                  onChange={(v) =>
                    setTranslations((prev) => ({ ...prev, subheading: v }))
                  }
                  type="richtext"
                  disabled={isReadOnly}
                />
              </div>
            </Card>

            <Card>
              <SectionTitle
                title="Buttons & Errors"
                description="Translate button labels and validation messages."
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <TranslationField
                  label="Submit Button"
                  original={selectedPopup.config.button?.submitText}
                  value={translations.submitLabel}
                  onChange={(v) =>
                    setTranslations((prev) => ({ ...prev, submitLabel: v }))
                  }
                  disabled={isReadOnly}
                />
                <TranslationField
                  label="Cancel Button"
                  original={selectedPopup.config.button?.cancelText}
                  value={translations.cancelLabel}
                  onChange={(v) =>
                    setTranslations((prev) => ({ ...prev, cancelLabel: v }))
                  }
                  disabled={isReadOnly}
                />
                <TranslationField
                  label="Submit Error Message"
                  original={selectedPopup.config.button?.errorMsg}
                  value={translations.submitErrorMsg}
                  onChange={(v) =>
                    setTranslations((prev) => ({ ...prev, submitErrorMsg: v }))
                  }
                  disabled={isReadOnly}
                />
                <TranslationField
                  label="Cancel Error Message"
                  original={selectedPopup.config.button?.cancelErrorMsg}
                  value={translations.cancelErrorMsg}
                  onChange={(v) =>
                    setTranslations((prev) => ({ ...prev, cancelErrorMsg: v }))
                  }
                  disabled={isReadOnly}
                />
              </div>
            </Card>

            {selectedPopup.config.method === "Birthdate verification" && (
              <Card>
                <SectionTitle
                  title="Months"
                  description="Translate month names for birthdate verification."
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                  }}
                >
                  {MONTH_NAMES.map((month) => (
                    <div
                      key={month}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#1A1C1D",
                        }}
                      >
                        {month}
                      </label>
                      <input
                        type="text"
                        value={translations.months[month]}
                        onChange={(e) =>
                          setTranslations((prev) => ({
                            ...prev,
                            months: {
                              ...prev.months,
                              [month]: e.target.value,
                            },
                          }))
                        }
                        disabled={isReadOnly}
                        placeholder={month}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #CBCFD2",
                          fontSize: "13px",
                          width: "100%",
                          boxSizing: "border-box",
                          opacity: isReadOnly ? 0.6 : 1,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </s-page>
  );
}
