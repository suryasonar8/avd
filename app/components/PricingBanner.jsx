import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { usePlan } from "../context/PlanContext";
import { PLAN_TYPES } from "../constants/features";
import { useTranslation } from "../context/TranslationContext";

export default function PricingBanner({ text }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const { plan } = usePlan();
  const { t } = useTranslation();
  const bannerRef = useRef(null);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;

    const handleDismiss = () => setIsVisible(false);

    banner.addEventListener("dismiss", handleDismiss);
    return () => {
      banner.removeEventListener("dismiss", handleDismiss);
    };
  }, [isVisible]);

  if (!isVisible || plan !== PLAN_TYPES.FREE) return null;

  return (
    <div style={{ marginBottom: "20px" }}>
      <s-banner
        ref={bannerRef}
        tone="info"
        heading={t("pricingBanner.freePlanLimit")}
        dismissible
      >
        <s-stack gap="base">
          <s-text>{text}</s-text>
          <s-button variant="secondary" onClick={() => navigate("/pricing")}>
            {t("pricingBanner.increaseLimit")}
          </s-button>
        </s-stack>
      </s-banner>
    </div>
  );
}
