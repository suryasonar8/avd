import {
  AGE_VERIFICATION_TEXT_MAX_LENGTH,
  VERIFICATION_METHODS,
} from "../../constants/checkout-verification";
import SettingsSection from "./SettingsSection";
import { Badge } from "../Badge";
import { ShopifyPlusBadge } from "../ShopifyPlusBadge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

const AGE_OPTIONS = Array.from({ length: 100 }, (_, i) => i + 1);

export default function AgeMessageSettings({ config, onChange, isShopifyPlus }) {
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const plusRestricted = !isShopifyPlus;
  const hasAccessMinAge = !plusRestricted && canAccess("checkout.verification.minAge");
  const hasAccessMessage = !plusRestricted && canAccess("checkout.verification.message");
  const hasAccessErrorMessage =
    !plusRestricted && canAccess("checkout.verification.errorMessage");
  const maxLength = AGE_VERIFICATION_TEXT_MAX_LENGTH;
  const isDateOfBirth =
    config.verificationMethod === VERIFICATION_METHODS.DATE_OF_BIRTH;

  const message = config.message || "";
  const dobHeading = config.dobHeading || "";
  const errorMessage = config.errorMessage || "";

  const handleMinAgeChange = (e) => {
    if (!hasAccessMinAge) return;
    onChange({ minAge: parseInt(e.currentTarget.value, 10) || 18 });
  };

  const handleMessageChange = (e) => {
    if (!hasAccessMessage) return;
    const value = e.currentTarget.value;
    if (value.length <= maxLength) {
      onChange({ message: value });
    }
  };

  const handleDobHeadingChange = (e) => {
    if (!hasAccessMessage) return;
    const value = e.currentTarget.value;
    if (value.length <= maxLength) {
      onChange({ dobHeading: value });
    }
  };

  const handleErrorMessageChange = (e) => {
    if (!hasAccessErrorMessage) return;
    const value = e.currentTarget.value;
    if (value.length <= maxLength) {
      onChange({ errorMessage: value });
    }
  };

  return (
    <>
      <SettingsSection
        title={t("checkoutVerification.minimumAge")}
        badge={
          plusRestricted ? (
            <ShopifyPlusBadge />
          ) : !hasAccessMinAge ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null
        }
      >
        <div style={{ opacity: !hasAccessMinAge ? 0.6 : 1 }}>
          <s-select
            label={t("checkoutVerification.minimumAge")}
            value={String(config.minAge || 18)}
            disabled={!hasAccessMinAge}
            onChange={handleMinAgeChange}
          >
            {AGE_OPTIONS.map((age) => (
              <s-option key={age} value={String(age)}>
                {age}
              </s-option>
            ))}
          </s-select>
        </div>
      </SettingsSection>

      <SettingsSection
        title={
          isDateOfBirth
            ? t("checkoutVerification.dobHeading")
            : t("checkoutVerification.checkboxMessage")
        }
        badge={
          plusRestricted ? (
            <ShopifyPlusBadge />
          ) : !hasAccessMessage ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null
        }
      >
        <div style={{ opacity: !hasAccessMessage ? 0.6 : 1 }}>
          {isDateOfBirth ? (
            <s-text-field
              label={t("checkoutVerification.dobHeading")}
              required
              value={dobHeading}
              disabled={!hasAccessMessage}
              placeholder={t("checkoutVerification.dobHeadingPlaceholder")}
              onChange={handleDobHeadingChange}
              suffix={`${dobHeading.length}/${maxLength}`}
            />
          ) : (
            <>
              <s-text-field
                label={t("checkoutVerification.checkboxMessage")}
                required
                value={message}
                disabled={!hasAccessMessage}
                placeholder={t("checkoutVerification.checkboxMessagePlaceholder")}
                onChange={handleMessageChange}
                suffix={`${message.length}/${maxLength}`}
              />
              <p style={{ fontSize: "12px", color: "#6D7175", margin: "4px 0 0" }}>
                {t("checkoutVerification.minAgeTokenHint")}
              </p>
            </>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("checkoutVerification.errorMessage")}
        badge={
          plusRestricted ? (
            <ShopifyPlusBadge />
          ) : !hasAccessErrorMessage ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null
        }
      >
        <div style={{ opacity: !hasAccessErrorMessage ? 0.6 : 1 }}>
          <s-text-field
            label={t("checkoutVerification.errorMessage")}
            required
            value={errorMessage}
            disabled={!hasAccessErrorMessage}
            placeholder={t("checkoutVerification.errorMessagePlaceholder")}
            onChange={handleErrorMessageChange}
            suffix={`${errorMessage.length}/${maxLength}`}
          />
          <p style={{ fontSize: "12px", color: "#6D7175", margin: "4px 0 0" }}>
            {t("checkoutVerification.minAgeTokenHint")}
          </p>
        </div>
      </SettingsSection>
    </>
  );
}
