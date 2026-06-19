import { useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { Card } from "../components/Card";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { locale } = params;

  const response = await admin.graphql(
    `#graphql
    query getLanguages {
      shopLocales {
        locale
        name
      }
    }`,
  );

  const data = await response.json();
  const shopLocales = data.data?.shopLocales || [];
  const currentLanguage =
    shopLocales.find((lang) => lang.locale === locale)?.name || locale;

  return { locale, currentLanguage };
};

export default function TranslationSetupPage() {
  const { locale, currentLanguage } = useLoaderData();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/translation");
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

  const TranslationField = ({ label, original, type = "text" }) => (
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
            {original}
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
            <div
              style={{
                border: "1px solid #e1e3e5",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid #f1f1f1",
                  display: "flex",
                  gap: "12px",
                  background: "#fafafa",
                }}
              >
                <span style={{ fontWeight: "bold", cursor: "pointer" }}>B</span>
                <span style={{ fontStyle: "italic", cursor: "pointer" }}>
                  I
                </span>
                <span
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  U
                </span>
              </div>
              <textarea
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  minHeight: "38px",
                }}
              />
            </div>
          ) : (
            <input
              type="text"
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
      <div style={{ marginBottom: "32px" }}>
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
              background: "#e1f5fe",
              color: "#007ace",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            ★ Basic plan or higher
          </span>
        </div>
        <p style={{ margin: "8px 0 0 0", color: "#6d7175", fontSize: "14px" }}>
          Translate your widgets to multiple languages
        </p>
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
            title="Infor"
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
                Upgrade now{" "}
                <span style={{ color: "#007ace" }}>★ Basic plan or higher</span>
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
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    paddingLeft: "36px",
                    border: "1px solid #e1e3e5",
                    borderRadius: "8px",
                    outline: "none",
                    fontSize: "14px",
                    background: "#f6f6f7",
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
              original=""
              type="richtext"
            />
            <TranslationField
              label="Sub-heading text"
              original=""
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
              original=""
              type="richtext"
            />
            <TranslationField
              label="Cancel button label"
              original=""
              type="richtext"
            />
            <TranslationField label="Submit button action" original="" />
            <TranslationField label="Cancel button action" original="" />
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
            <TranslationField label="Month label" original="January" />
            <button
              style={{
                padding: "8px 16px",
                background: "white",
                border: "1px solid #dcdfe3",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                color: "#202223",
              }}
            >
              + Add
            </button>
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
