import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useActionData,
  useSearchParams,
} from "react-router";
import { useState, useMemo, useEffect } from "react";
import { useAppBridge, SaveBar } from "@shopify/app-bridge-react";
import { DefaultEditor } from "react-simple-wysiwyg";
import { authenticate } from "../shopify.server";
import { Card } from "../components/Card";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { locale } = params;

  // 1. Discover the actual Metaobject type handles
  const defsResponse = await admin.graphql(
    `#graphql
    query getDefs {
      popups: metaobjectDefinitionByType(type: "$app:popups") { type }
      translations: metaobjectDefinitionByType(type: "$app:translations") { type }
    }`,
  );
  const defsData = await defsResponse.json();
  const popupsTypeHandle = defsData.data.popups?.type || "app--popups";
  const translationsTypeHandle =
    defsData.data.translations?.type || "app--translations";

  // 2. Fetch popups
  const popupsResponse = await admin.graphql(
    `#graphql
    query getPopups($type: String!) {
      metaobjects(type: $type, first: 250) {
        nodes {
          id
          handle
          popup_id: field(key: "popup_id") { value }
          config: field(key: "config") { value }
        }
      }
    }`,
    { variables: { type: popupsTypeHandle } },
  );
  const popupsData = await popupsResponse.json();
  const popups = (popupsData.data?.metaobjects?.nodes || []).map((node) => ({
    id: node.id,
    handle: node.handle,
    popup_id: node.popup_id?.value,
    config: JSON.parse(node.config?.value || "{}"),
  }));

  // 3. Fetch shop locales
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

  return { locale, currentLanguage, isPublished, popups };
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { locale } = params;
  const formData = await request.formData();
  const popupId = formData.get("popupId");
  const translations = JSON.parse(formData.get("translations") || "{}");

  if (!popupId) return { success: false, error: "No popup selected" };

  // Fetch current popup config
  const popupResponse = await admin.graphql(
    `#graphql
    query getPopup($id: ID!) {
      metaobject(id: $id) {
        id
        handle
        config: field(key: "config") { value }
      }
    }`,
    { variables: { id: popupId } },
  );
  const popupData = await popupResponse.json();
  const popup = popupData.data?.metaobject;
  if (!popup) return { success: false, error: "Popup not found" };

  const currentConfig = JSON.parse(popup.config?.value || "{}");
  const updatedConfig = {
    ...currentConfig,
    translations: {
      ...(currentConfig.translations || {}),
      [locale]: translations,
    },
  };

  const updateResponse = await admin.graphql(
    `#graphql
    mutation updatePopup($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        id: popupId,
        metaobject: {
          fields: [
            {
              key: "config",
              value: JSON.stringify(updatedConfig),
            },
          ],
        },
      },
    },
  );

  const result = await updateResponse.json();
  const errors = result.data?.metaobjectUpdate?.userErrors;

  if (errors && errors.length > 0) {
    return { success: false, errors };
  }

  const translationsDefResponse = await admin.graphql(
    `#graphql
    query getTranslationsDef {
      metaobjectDefinitionByType(type: "$app:translations") {
        type
      }
    }`,
  );
  const translationsDefData = await translationsDefResponse.json();
  const translationsTypeHandle =
    translationsDefData.data.metaobjectDefinitionByType?.type ||
    "app--translations";

  // --- SYNC TRANSLATION SUMMARY ---
  const summaryHandle = `translation-summary-${locale}`;
  const getSummaryResponse = await admin.graphql(
    `#graphql
    query getSummary($type: String!, $query: String!) {
      metaobjects(type: $type, query: $query, first: 1) {
        nodes {
          id
          popups: field(key: "popups") {
            references(first: 250) {
              nodes {
                ... on Metaobject {
                  id
                }
              }
            }
          }
        }
      }
    }
`,
    {
      variables: {
        type: translationsTypeHandle,
        query: `handle:${summaryHandle}`,
      },
    },
  );
  const summaryData = await getSummaryResponse.json();
  const summary = summaryData.data?.metaobjects?.nodes[0];

  if (summary) {
    const currentPopups =
      summary.popups?.references?.nodes?.map((n) => n.id) || [];
    if (!currentPopups.includes(popupId)) {
      const updatedPopups = [...currentPopups, popupId];
      const summaryUpdateResponse = await admin.graphql(
        `#graphql
        mutation updateSummary($id: ID!, $metaobject: MetaobjectUpdateInput!) {
          metaobjectUpdate(id: $id, metaobject: $metaobject) {
            userErrors { field message }
          }
        }`,
        {
          variables: {
            id: summary.id,
            metaobject: {
              fields: [{ key: "popups", value: JSON.stringify(updatedPopups) }],
            },
          },
        },
      );
      const summaryUpdateData = await summaryUpdateResponse.json();
      const updateErrors = summaryUpdateData.data?.metaobjectUpdate?.userErrors;
      if (updateErrors && updateErrors.length > 0) {
        console.log("Summary Update Errors:", updateErrors);
        return { success: false, errors: updateErrors };
      }
    }
  } else {
    // Create new summary
    const summaryCreateResponse = await admin.graphql(
      `#graphql
      mutation createSummary($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          userErrors { field message }
        }
      }`,
      {
        variables: {
          metaobject: {
            type: translationsTypeHandle,
            handle: summaryHandle,
            fields: [
              { key: "locale", value: locale },
              { key: "popups", value: JSON.stringify([popupId]) },
            ],
          },
        },
      },
    );
    const summaryCreateData = await summaryCreateResponse.json();
    const createErrors = summaryCreateData.data?.metaobjectCreate?.userErrors;
    if (createErrors && createErrors.length > 0) {
      console.log("Summary Create Errors:", createErrors);
      return { success: false, errors: createErrors };
    }
  }

  return { success: true };
};

const SectionTitle = ({ title, description }) => (
  <div style={{ marginBottom: "24px" }}>
    <h2
      style={{
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "4px",
        color: "#202223",
      }}
    >
      {title}
    </h2>
    <p style={{ fontSize: "13px", color: "#6d7175", lineHeight: "1.5" }}>
      {description}
    </p>
  </div>
);

const TranslationField = ({
  label,
  original,
  value,
  onChange,
  type = "text",
}) => (
  <div style={{ marginBottom: "20px" }}>
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "500",
            color: "#202223",
            marginBottom: "8px",
          }}
        >
          {label}
        </label>
        <div
          style={{
            padding: "10px 14px",
            background: "#f6f6f7",
            borderRadius: "8px",
            border: "1px solid #e1e3e5",
            color: "#6d7175",
            fontSize: "14px",
            minHeight: "40px",
          }}
        >
          {original || "—"}
        </div>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", paddingTop: "32px" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 5L12 10L7 15"
            stroke="#babec3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <label
          style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "500",
            color: "#202223",
            marginBottom: "8px",
          }}
        >
          {label}
        </label>
        {type === "richtext" ? (
          <div className="custom-editor-container">
            {typeof document !== "undefined" ? (
              <DefaultEditor
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            ) : (
              <div style={{ height: "100px", background: "#fafafa" }} />
            )}
          </div>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid #e1e3e5",
              borderRadius: "8px",
              outline: "none",
              fontSize: "14px",
            }}
          />
        )}
      </div>
    </div>
  </div>
);

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
  const { locale, currentLanguage, isPublished, popups } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();
  const shopify = useAppBridge();

  const [searchParams] = useSearchParams();
  const initialPopupId = searchParams.get("popupId") || "";
  const [selectedPopupId, setSelectedPopupId] = useState(initialPopupId);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopupDialogOpen, setIsPopupDialogOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState("January");

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Translations saved successfully");
    } else if (actionData?.error || actionData?.errors) {
      shopify.toast.show(actionData.error || "Error saving translations", {
        isError: true,
      });
    }
  }, [actionData, shopify]);

  const [translations, setTranslations] = useState({
    heading: "",
    subheading: "",
    submitLabel: "",
    cancelLabel: "",
    submitErrorMsg: "",
    cancelErrorMsg: "",
    months: MONTH_NAMES.reduce((acc, month) => {
      acc[month] = month;
      return acc;
    }, {}),
  });

  const [visibleMonths, setVisibleMonths] = useState(["January"]);

  const selectedPopup = useMemo(
    () => popups.find((p) => p.id === selectedPopupId),
    [popups, selectedPopupId],
  );

  const filteredPopups = useMemo(() => {
    if (!searchTerm) return popups;
    return popups.filter((p) =>
      (p.config.name || p.handle || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [popups, searchTerm]);

  const initialTranslations = useMemo(() => {
    if (!selectedPopup)
      return {
        heading: "",
        subheading: "",
        submitLabel: "",
        cancelLabel: "",
        submitErrorMsg: "",
        cancelErrorMsg: "",
        months: MONTH_NAMES.reduce((acc, month) => {
          acc[month] = month;
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
      submitErrorMsg: existingTranslations.submitErrorMsg || "",
      cancelErrorMsg: existingTranslations.cancelErrorMsg || "",
      months: MONTH_NAMES.reduce((acc, month) => {
        acc[month] = existingTranslations.months?.[month] || month;
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
        submitErrorMsg: existingTranslations.submitErrorMsg || "",
        cancelErrorMsg: existingTranslations.cancelErrorMsg || "",
        months: {
          ...translations.months,
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
    }
  }, [selectedPopup, locale]);

  const handleBack = () => {
    if (isDirty) {
      shopify.toast.show("Please save or discard your changes before leaving", {
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
      alert("Please select a pop-up first");
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

  const months = [
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
        /* Force Library Styles */
        .rsw-editor {
          border: 1px solid #e1e3e5 !important;
          border-radius: 8px !important;
          display: flex !important;
          flex-direction: column !important;
          background: white !important;
          overflow: hidden !important;
        }
        .rsw-toolbar {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          background: #f5f5f5 !important;
          border-bottom: 1px solid #e1e3e5 !important;
          padding: 4px !important;
          gap: 2px !important;
        }
        .rsw-btn {
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          border-radius: 4px !important;
        }
        .rsw-btn:hover {
          background: #e1e3e5 !important;
        }
        .rsw-btn[data-active=true] {
          background: #d1d3d5 !important;
        }
        .rsw-separator {
          width: 1px !important;
          height: 20px !important;
          background: #e1e3e5 !important;
          margin: 0 4px !important;
        }
        .rsw-dd {
          padding: 4px 8px !important;
          border: 1px solid #e1e3e5 !important;
          border-radius: 4px !important;
          background: white !important;
          font-size: 13px !important;
        }
        .rsw-ce {
          min-height: 150px !important;
          padding: 12px !important;
          outline: none !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }
        
        .custom-editor-container {
          margin-bottom: 20px;
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
            ← Back
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
            <span
              style={{
                background: isPublished ? "#e3fbe3" : "#f1f2f3",
                color: isPublished ? "#007f5f" : "#4a4d4f",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {isPublished ? "Published" : "Unpublished"}
            </span>
          </div>
          <p
            style={{ margin: "8px 0 0 0", color: "#6d7175", fontSize: "14px" }}
          >
            Translate your widgets to multiple languages
          </p>
        </div>

        <SaveBar id="translation-save-bar" open={isDirty}>
          <button variant="primary" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={handleDiscard}>
            Discard
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
            title="Info"
            description="Select the pop-up used to display the Translation for."
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
                Status
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
                {isPublished ? "Published" : "Unpublished"}
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
                Pop-up <span style={{ color: "#d72c0d" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Select pop-up"
                  readOnly
                  value={
                    selectedPopup
                      ? selectedPopup.config.name || selectedPopup.handle
                      : ""
                  }
                  onClick={() => setIsPopupDialogOpen(!isPopupDialogOpen)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    paddingLeft: "36px",
                    border: "1px solid #e1e3e5",
                    borderRadius: "8px",
                    outline: "none",
                    fontSize: "14px",
                    background: "white",
                    cursor: "pointer",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6d7175",
                  }}
                >
                  🔍
                </span>

                {isPopupDialogOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "white",
                      border: "1px solid #e1e3e5",
                      borderRadius: "8px",
                      marginTop: "4px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 10,
                      padding: "8px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search pop-ups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #e1e3e5",
                        borderRadius: "4px",
                        marginBottom: "8px",
                        outline: "none",
                        fontSize: "13px",
                      }}
                    />
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {filteredPopups.map((popup) => (
                        <div
                          key={popup.id}
                          onClick={() => {
                            setSelectedPopupId(popup.id);
                            setIsPopupDialogOpen(false);
                            setSearchTerm("");
                          }}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "13px",
                            borderRadius: "4px",
                            background:
                              selectedPopupId === popup.id
                                ? "#f4f6f8"
                                : "transparent",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f4f6f8")
                          }
                          onMouseLeave={(e) => {
                            if (selectedPopupId !== popup.id) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          {popup.config.name || popup.handle}
                        </div>
                      ))}
                      {filteredPopups.length === 0 && (
                        <div
                          style={{
                            padding: "8px 12px",
                            fontSize: "13px",
                            color: "#6d7175",
                          }}
                        >
                          No pop-ups found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
            title="Text"
            description="Customize the input field text in the Translation form."
          />
          <Card>
            <div style={{ textAlign: "right", marginBottom: "16px" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#6d7175",
                  cursor: "pointer",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ✨ Generate text
              </button>
            </div>
            <TranslationField
              label="Heading text"
              original={selectedPopup?.config.text?.heading}
              value={translations.heading}
              onChange={(val) =>
                setTranslations({ ...translations, heading: val })
              }
              type="richtext"
            />
            <TranslationField
              label="Sub-heading text"
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
            title="Button"
            description="Customize labels for input fields and buttons."
          />
          <Card>
            <TranslationField
              label="Submit button label"
              original={selectedPopup?.config.button?.submitText}
              value={translations.submitLabel}
              onChange={(val) =>
                setTranslations({ ...translations, submitLabel: val })
              }
              type="richtext"
            />
            <TranslationField
              label="Submit error message"
              original={selectedPopup?.config.button?.errorMsg}
              value={translations.submitErrorMsg}
              onChange={(val) =>
                setTranslations({ ...translations, submitErrorMsg: val })
              }
              type="richtext"
            />
            <TranslationField
              label="Cancel button label"
              original={selectedPopup?.config.button?.cancelText}
              value={translations.cancelLabel}
              onChange={(val) =>
                setTranslations({ ...translations, cancelLabel: val })
              }
              type="richtext"
            />
            <TranslationField
              label="Cancel error message"
              original={selectedPopup?.config.button?.cancelErrorMsg}
              value={translations.cancelErrorMsg}
              onChange={(val) =>
                setTranslations({ ...translations, cancelErrorMsg: val })
              }
              type="richtext"
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
            title="Label"
            description="Customize the labels used for months to match your preferences or language requirements."
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
                  label="Month label"
                  original={month}
                  value={translations.months[month]}
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
                      const nextMonth = MONTH_NAMES[visibleMonths.length];
                      if (nextMonth) {
                        setVisibleMonths([...visibleMonths, nextMonth]);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      background: "white",
                      border: "1px solid #e1e3e5",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#202223",
                    }}
                  >
                    <span style={{ fontSize: "18px", fontWeight: "400" }}>
                      +
                    </span>{" "}
                    Add
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
            Need help? Please view{" "}
            <a href="#" style={{ color: "#005BD3", textDecoration: "none" }}>
              our document guideline
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
