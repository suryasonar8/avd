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
    const value = e.currentTarget.value;
    if (value.length <= maxLength) {
      onChange({ heading: value });
    }
  };

  return (
    <SettingsSection
      title={t("checkoutVerification.textCustomization")}
      badge={
        !hasBasicPlan ? (
          <Badge text={t("common.basicPlanOrHigher")} type="basic" />
        ) : null
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          opacity: !hasBasicPlan ? 0.6 : 1,
        }}
      >
        <s-text-field
          label={t("checkoutVerification.heading")}
          required
          value={heading}
          disabled={!hasBasicPlan}
          placeholder={t("checkoutVerification.enterBannerHeading")}
          onChange={handleHeadingChange}
          suffix={`${heading.length}/${maxLength}`}
        />
      </div>
    </SettingsSection>
  );
}
