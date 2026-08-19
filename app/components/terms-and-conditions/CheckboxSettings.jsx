/* eslint-disable react/prop-types, jsx-a11y/anchor-is-valid */
import { ColorInput } from "../ColorInput";
import { NumberInput } from "../NumberInput";
import { Badge } from "../Badge";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  subtitle,
  maxLength,
  disabled,
}) {
  return (
    <div style={{ marginBottom: "16px", opacity: disabled ? 0.6 : 1 }}>
      <s-text-field
        label={label}
        required={required}
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => {
          const val = e.currentTarget.value;
          onChange(maxLength ? val.slice(0, maxLength) : val);
        }}
      />
      {subtitle && (
        <p
          style={{
            fontSize: "12px",
            color: "#6D7175",
            marginTop: "4px",
            marginBottom: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function CheckboxSettings({ termsSettings, setTermsSettings }) {
  const { t } = useTranslation();
  const { canAccess } = usePlan();

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E1E3E5",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700 }}>
          {t("termsAndConditions.message")}
        </span>
        {!canAccess("terms.checkbox.text") && (
          <Badge text={t("common.premiumPlan")} type="premium" />
        )}
      </div>
      <TextInput
        label={t("termsAndConditions.messageText")}
        required
        value={termsSettings.checkboxText}
        onChange={(val) => setTermsSettings({ ...termsSettings, checkboxText: val })}
        maxLength={255}
        disabled={!canAccess("terms.checkbox.text")}
      />
      <TextInput
        label={t("termsAndConditions.keyword")}
        required
        value={termsSettings.keyword}
        onChange={(val) => setTermsSettings({ ...termsSettings, keyword: val })}
        disabled={!canAccess("terms.checkbox.keyword")}
      />
      <TextInput
        label={t("termsAndConditions.keywordLink")}
        value={termsSettings.link}
        onChange={(val) => setTermsSettings({ ...termsSettings, link: val })}
        subtitle={t("termsAndConditions.keywordLinkSubtitle")}
        disabled={!canAccess("terms.checkbox.link")}
      />
      <NumberInput
        label={t("termsAndConditions.size")}
        value={termsSettings.size}
        onChange={(val) => setTermsSettings({ ...termsSettings, size: val })}
        disabled={!canAccess("terms.checkbox.size")}
      />
      <ColorInput
        label={t("termsAndConditions.color")}
        value={termsSettings.color}
        onChange={(val) => setTermsSettings({ ...termsSettings, color: val })}
        disabled={!canAccess("terms.checkbox.color")}
      />
      <TextInput
        label={t("termsAndConditions.errorMessageOptional")}
        value={termsSettings.errorMessage}
        onChange={(val) => setTermsSettings({ ...termsSettings, errorMessage: val })}
        maxLength={255}
        placeholder="Enter error message"
        disabled={!canAccess("terms.checkbox.error")}
      />

      <s-text>
        {t("termsAndConditions.needMoreCustomization")}{" "}
        <s-link href="#">
          <p style={{ color: "#2C6ECB", margin: 0, display: "inline" }}>{t("termsAndConditions.contactUs")}</p>
        </s-link>
      </s-text>
    </div>
  );
}
