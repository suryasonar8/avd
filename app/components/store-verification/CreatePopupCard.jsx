import { useNavigate } from "react-router";
import { useTranslation } from "../../context/TranslationContext";

export default function CreatePopupCard({ canCreate }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCreatePopUp = () => {
    if (!canCreate) {
      navigate("/pricing");
      return;
    }
    navigate("/store_verification/customization");
  };

  return (
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
          alt={t("storeVerification.popupIllustration")}
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
          {t("storeVerification.ageVerificationPopup")}
        </h2>
        <s-text color="subdued">
          {t("storeVerification.ageVerificationPopupDescription")}
        </s-text>
        <div style={{ marginTop: "8px" }}>
          <s-button
            onClick={handleCreatePopUp}
            disabled={!canCreate}
            variant={canCreate ? "primary" : "secondary"}
          >
            {t("storeVerification.createPopup")}
          </s-button>
        </div>
      </div>
    </div>
  );
}
