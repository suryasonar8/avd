import { useState } from "react";
import { useNavigate } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session.shop.replace(".myshopify.com", "");

  // Fetch shop locales
  const languagesResponse = await admin.graphql(
    `#graphql
    query getLanguages {
      shopLocales {
        locale
        name
        primary
        published
      }
    }`,
  );
  const languagesData = await languagesResponse.json();
  const shopLocales = languagesData.data?.shopLocales || [];
  const primaryLocale =
    shopLocales.find((lang) => lang.primary)?.locale || "en";

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

  // 2. Fetch popups from Metaobjects to check if any exist
  const popupsResponse = await admin.graphql(
    `#graphql
    query getPopups($type: String!) {
      metaobjects(type: $type, first: 1) {
        nodes { id }
      }
    }`,
    { variables: { type: popupsTypeHandle } },
  );
  const popupsData = await popupsResponse.json();
  const hasPopups = (popupsData.data?.metaobjects?.nodes || []).length > 0;

  // 3. Fetch translation summaries
  const translationsResponse = await admin.graphql(
    `#graphql
    query getTranslations($type: String!) {
      metaobjects(type: $type, first: 250) {
        nodes {
          locale: field(key: "locale") { value }
          popups: field(key: "popups") {
            references(first: 100) {
              nodes {
                ... on Metaobject {
                  id
                  handle
                  name: field(key: "config") { value }
                }
              }
            }
          }
        }
      }
    }`,
    { variables: { type: translationsTypeHandle } },
  );
  const translationsData = await translationsResponse.json();
  const translatedLanguages = (
    translationsData.data?.metaobjects?.nodes || []
  ).map((node) => ({
    locale: node.locale?.value,
    popups: (node.popups?.references?.nodes || []).map((p) => ({
      id: p.id,
      handle: p.handle,
      name: JSON.parse(p.name?.value || "{}").name || p.handle,
    })),
  }));

  return {
    shop: shopDomain,
    shopLocales,
    primaryLocale,
    translatedLanguages,
    hasPopups,
  };
};

export default function TranslationPage() {
  const { shop, shopLocales, primaryLocale, translatedLanguages, hasPopups } =
    useLoaderData();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const languages = [
    { label: "Select", value: "" },
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
    if (hasPopups) {
      setIsModalOpen(true);
    } else {
      navigate("/store_verification/customization");
    }
  };

  const handleRedirect = () => {
    // Redirect to Shopify Admin language settings
    window.open(
      `https://admin.shopify.com/store/${shop}/settings/languages`,
      "_blank",
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              margin: "0 0 8px 0",
              color: "#202223",
            }}
          >
            Translation
          </h1>
          <p style={{ margin: 0, color: "#6d7175", fontSize: "14px" }}>
            Translate your widgets to multiple languages
          </p>
        </div>
        <button
          style={{
            padding: "8px 16px",
            backgroundColor: "white",
            border: "1px solid #dcdfe3",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            color: "#202223",
            boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
          }}
        >
          Refresh data
        </button>
      </div>

      {/* Free Plan Banner */}
      <div
        style={{
          background: "#BAE0FF",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
          position: "relative",
          border: "1px solid #91D5FF",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#006FBB",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            i
          </div>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "700",
              margin: 0,
              color: "#002339",
            }}
          >
            Free Plan Limit
          </h2>
          <button
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "#002339",
              opacity: 0.6,
            }}
          >
            ×
          </button>
        </div>
        <p
          style={{
            margin: "0 0 20px 0",
            fontSize: "14px",
            color: "#002339",
            lineHeight: "1.5",
          }}
        >
          Upgrade to unlock more translation options and support for multiple
          languages.
        </p>
        <button
          style={{
            padding: "8px 20px",
            backgroundColor: "#fff",
            border: "1px solid #dcdfe3",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "13px",
            color: "#202223",
            boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
          }}
        >
          Increase limit
        </button>
      </div>

      {/* Default Language Card */}
      <div
        style={{
          background: "#FFF",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #E1E3E5",
          marginBottom: "24px",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "24px", marginTop: "4px" }}>🔄</div>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "700",
              margin: "0 0 4px 0",
              color: "#202223",
            }}
          >
            Default language: {primaryLocaleName}
          </h2>
          <p
            style={{ margin: "0 0 20px 0", color: "#6d7175", fontSize: "14px" }}
          >
            All widgets are identified with this language by default.
          </p>
          <button
            onClick={handleRedirect}
            style={{
              padding: "8px 16px",
              backgroundColor: "white",
              border: "1px solid #dcdfe3",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              color: "#202223",
              boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
            }}
          >
            Change default
          </button>
        </div>
      </div>

      {/* Translation List Card */}
      <Card title="Translation list">
        {translatedLanguages.length > 0 ? (
          <div style={{ padding: "0 16px" }}>
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
                    Language
                  </th>
                  <th
                    style={{
                      padding: "16px 8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6d7175",
                    }}
                  >
                    Pop-ups
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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {translatedLanguages.map((item) => {
                  const langName =
                    shopLocales.find((l) => l.locale === item.locale)?.name ||
                    item.locale;
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
                          <span style={{ fontWeight: "500" }}>{langName}</span>
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
                        <button
                          onClick={() => {
                            const popupId = item.popups[0]?.id;
                            const url = `/translation/setup/${item.locale}/add${
                              popupId
                                ? `?popupId=${encodeURIComponent(popupId)}`
                                : ""
                            }`;
                            navigate(url);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#006FBB",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            padding: "4px 8px",
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                borderTop: "1px solid #E1E3E5",
                marginTop: "16px",
              }}
            >
              <button
                onClick={handleAddLanguage}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#202223",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                {hasPopups ? "Add language" : "Create pop-up"}
              </button>
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
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                margin: "0 0 8px 0",
                color: "#202223",
              }}
            >
              Manage translations for the age verification popup.
            </h3>
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#6d7175",
                fontSize: "14px",
                maxWidth: "400px",
                lineHeight: "1.5",
              }}
            >
              Translate the age verification version into multiple languages.
            </p>
            <button
              onClick={handleAddLanguage}
              style={{
                padding: "10px 24px",
                backgroundColor: "#202223",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
              }}
            >
              {hasPopups ? "Add language" : "Create pop-up"}
            </button>
          </div>
        )}
      </Card>

      {/* Add Language Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add language"
        primaryAction={{
          content: "Add",
          onAction: () => {
            navigate(`/translation/setup/${selectedLanguage}/add`);
            setIsModalOpen(false);
            setSelectedLanguage("");
          },
          disabled: !selectedLanguage,
        }}
        secondaryAction={{
          content: "Cancel",
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
            Select a language
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
    </div>
  );
}
