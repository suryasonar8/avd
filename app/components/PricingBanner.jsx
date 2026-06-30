import { useState } from "react";
import { useNavigate } from "react-router";
import { usePlan } from "../context/PlanContext";
import { PLAN_TYPES } from "../constants/features";
import { useTranslation } from "../context/TranslationContext";

export default function PricingBanner({ text }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const { plan } = usePlan();
  const { t } = useTranslation();

  if (!isVisible || plan !== PLAN_TYPES.FREE) return null;

  return (
    <s-banner
      tone="info"
      title={t("pricingBanner.freePlanLimit")}
      onDismiss={() => setIsVisible(false)}
    >
      <s-stack gap="base">
        <s-text>{text}</s-text>
        <s-button variant="secondary" onClick={() => navigate("/pricing")}>
          {t("pricingBanner.increaseLimit")}
        </s-button>
      </s-stack>
    </s-banner>
  );
}
