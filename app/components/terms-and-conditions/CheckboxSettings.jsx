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
    <div style={{ marginBottom: "12px", opacity: disabled ? 0.6 : 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "4px",
        }}
      >
        <label style={{ fontSize: "13px", color: "#6D7175" }}>{label}</label>
        {required && <span style={{ color: "red" }}>*</span>}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={value || ""}
          onChange={(e) =>
            onChange(
              maxLength ? e.target.value.slice(0, maxLength) : e.target.value,
            )
          }
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "8px 12px",
            paddingRight: maxLength ? "60px" : "12px",
            borderRadius: "8px",
            border: "1px solid #E1E3E5",
            fontSize: "13px",
            backgroundColor: disabled ? "#F1F1F1" : "#F6F6F7",
            color: disabled ? "#919EAB" : "#202223",
            boxSizing: "border-box",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {maxLength && (
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "#6D7175",
            }}
          >
            {(value || "").length}/{maxLength}
          </span>
        )}
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: "11px",
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

      <p
        style={{
          fontSize: "12px",
          color: "#6D7175",
          marginTop: "12px",
        }}
      >
        {t("termsAndConditions.needMoreCustomization")}{" "}
        <a href="#" style={{ color: "#2C6ECB", textDecoration: "none" }}>
          {t("termsAndConditions.contactUs")}
        </a>
      </p>
    </Card>
  );
}
