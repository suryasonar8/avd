import { useState } from "react";
import { useNavigate } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session.shop.replace(".myshopify.com", "");

  const response = await admin.graphql(
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

  const data = await response.json();
  const shopLocales = data.data?.shopLocales || [];
  const primaryLocale =
    shopLocales.find((lang) => lang.primary)?.locale || "en";

  return {
    shop: shopDomain,
    shopLocales,
    primaryLocale,
  };
};

export default function TranslationPage() {
  const { shop, shopLocales, primaryLocale } = useLoaderData();
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

  const handleRedirect = () => {
    // Redirect to Shopify Admin language settings
    window.open(
      `https://admin.shopify.com/store/${shop}/settings/languages`,
      "_top",
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
            onClick={() => setIsModalOpen(true)}
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
            Add language
          </button>
        </div>
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
