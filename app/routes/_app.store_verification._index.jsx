import { useNavigate } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {};

export default function AppPage() {
  const navigate = useNavigate();

  const handleCreatePopUp = () => {
    navigate("/store_verification/customization");
  };

  return (
    <s-page heading="Store verification">
      {/* Free Plan Limit Banner */}
      <div
        style={{
          background: "#BDE6FF",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "24px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          border: "1px solid #A2D9FF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px", color: "#005F99" }}>ⓘ</span>
          <span
            style={{ fontWeight: "700", color: "#1A1C1D", fontSize: "13px" }}
          >
            Free Plan Limit
          </span>
          <button
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "#4A4D4F",
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#4A4D4F",
            lineHeight: "1.5",
            maxWidth: "800px",
          }}
        >
          Your current plan includes 1 pop-up (0/1 used). Upgrade to unlock more
          pop-ups, advanced customization and more.
        </div>
        <div>
          <button
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBCFD2",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#1A1C1D",
              cursor: "pointer",
              boxShadow: "0 1px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            Increase limit
          </button>
        </div>
      </div>

      {/* Age Verification Pop-up Creation Card */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "12px",
          display: "flex",
          overflow: "hidden",
          marginBottom: "24px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            width: "240px",
            background: "#F6F6F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            borderRight: "1px solid #E1E3E5",
          }}
        >
          <img
            src="/popup-illustration.png"
            alt="Pop-up Illustration"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
        <div
          style={{
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>
            Age Verification Pop-up
          </h2>
          <p style={{ fontSize: "14px", color: "#6D7175", margin: 0 }}>
            Verify customers&apos; age with pop-ups triggered by various
            conditions.
          </p>
          <div style={{ marginTop: "8px" }}>
            <button
              onClick={handleCreatePopUp}
              style={{
                background: "#202223",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Create pop-up
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up list Section */}
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1A1C1D" }}>
          Pop-up list
        </h3>
      </div>

      {/* Empty State Card */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "12px",
          padding: "64px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <img
            src="/empty-state.png"
            alt="Empty state"
            style={{ width: "200px", height: "auto" }}
          />
        </div>
        <h2
          style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}
        >
          Whoops! You don&apos;t have any pop-ups yet.
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "#6D7175",
            maxWidth: "400px",
            lineHeight: "1.5",
          }}
        >
          Create and customize a new pop-up now to start verify customers&apos;
          age.
        </p>
      </div>
    </s-page>
  );
}
