/* eslint-disable react/prop-types, jsx-a11y/anchor-is-valid */
import { Card } from "../Card";
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

export default function CheckboxSettings({ settings, setSettings }) {
  const { t } = useTranslation();
  const { canAccess } = usePlan();

  return (
    <Card
      title={t("termsAndConditions.message")}
      badge={
        !canAccess("terms.checkbox.text") ? (
          <Badge text={t("common.premiumPlan")} type="premium" />
        ) : null
      }
    >
      <TextInput
        label={t("termsAndConditions.messageText")}
        required
        value={settings.checkboxText}
        onChange={(val) => setSettings({ ...settings, checkboxText: val })}
        maxLength={255}
        disabled={!canAccess("terms.checkbox.text")}
      />
      <TextInput
        label={t("termsAndConditions.keyword")}
        required
        value={settings.keyword}
        onChange={(val) => setSettings({ ...settings, keyword: val })}
        disabled={!canAccess("terms.checkbox.keyword")}
      />
      <TextInput
        label={t("termsAndConditions.keywordLink")}
        value={settings.link}
        onChange={(val) => setSettings({ ...settings, link: val })}
        subtitle={t("termsAndConditions.keywordLinkSubtitle")}
        disabled={!canAccess("terms.checkbox.link")}
      />
      <NumberInput
        label={t("termsAndConditions.size")}
        value={settings.size}
        onChange={(val) => setSettings({ ...settings, size: val })}
        disabled={!canAccess("terms.checkbox.size")}
      />
      <ColorInput
        label={t("termsAndConditions.color")}
        value={settings.color}
        onChange={(val) => setSettings({ ...settings, color: val })}
        disabled={!canAccess("terms.checkbox.color")}
      />
      <TextInput
        label="Error message (Optional)"
        value={settings.errorMessage}
        onChange={(val) => setSettings({ ...settings, errorMessage: val })}
        maxLength={255}
        placeholder="Enter error message"
        disabled={!canAccess("terms.checkbox.error")}
      />

      <s-text>
        {t("termsAndConditions.needMoreCustomization")}{" "}
        <s-link href="#">{t("termsAndConditions.contactUs")}</s-link>
      </s-text>
    </Card>
  );
}
