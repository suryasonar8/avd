import { BANNER_TEXT_MAX_LENGTH } from "../../constants/checkout-verification";
import SettingsSection from "./SettingsSection";
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

export default function BannerSettings({ config, onChange }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const hasBasicPlan = canAccess("checkout.banner.heading");
  const heading = config.heading || "";
  const maxLength = BANNER_TEXT_MAX_LENGTH;

  const handleHeadingChange = (e) => {
    if (!hasBasicPlan) return;
    const value = e.target.value;
    if (value.length <= maxLength) {
      onChange({ heading: value });
    }
  };

  return (
    <SettingsSection
      title={t("checkoutVerification.textCustomization")}
      badge={
        !hasBasicPlan ? <Badge text={t("common.basicPlanOrHigher")} type="basic" /> : null
      }
      disabled={!hasBasicPlan}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          opacity: !hasBasicPlan ? 0.6 : 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <label style={{ fontSize: "14px", color: "#6D7175" }}>{t("checkoutVerification.heading")}</label>
          <span style={{ color: "#D72C0D" }}>*</span>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={heading}
            onChange={handleHeadingChange}
            disabled={!hasBasicPlan}
            placeholder={t("checkoutVerification.enterBannerHeading")}
            style={{
              width: "100%",
              padding: "12px 60px 12px 12px",
              border: "1px solid #E1E3E5",
              borderRadius: "8px",
              fontSize: "14px",
              color: !hasBasicPlan ? "#919EAB" : "#202223",
              backgroundColor: !hasBasicPlan ? "#F1F1F1" : "#fff",
              boxSizing: "border-box",
              cursor: !hasBasicPlan ? "not-allowed" : "text",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "13px",
              color: "#6D7175",
            }}
          >
            {heading.length}/{maxLength}
          </span>
        </div>
      </div>
    </SettingsSection>
  );
}
