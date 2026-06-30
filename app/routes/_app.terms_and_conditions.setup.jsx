import { useState, useEffect } from "react";
import { useNavigate, useLoaderData, useFetcher, redirect } from "react-router";
import { useAppBridge, SaveBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../context/TranslationContext";
import { usePlan } from "../context/PlanContext";
import { authenticate } from "../shopify.server";
import { Card } from "../components/Card";
import { ColorInput } from "../components/ColorInput";
import { NumberInput } from "../components/NumberInput";
import { Badge } from "../components/Badge";
import { TermsService } from "../services/terms.service";
import { PlanService } from "../services/plan.service";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await TermsService.getSettings(session.shop);

  return { settings };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const settingsStr = formData.get("settings");
  const settings = JSON.parse(settingsStr);

  // Server-side granular gate
  const validation = await PlanService.validateTermsConfig(
    session.shop,
    settings,
  );

  // Use sanitized settings even if isValid is true
  const finalSettings = validation.sanitized || settings;

  await TermsService.saveSettings(admin, session.shop, finalSettings);

  return { success: true };
};

// ─── Radio Input ──────────────────────────────────────────────────────────────
function RadioInput({ label, name, value, checked, onChange, disabled }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: disabled ? "#AAAAAA" : "#202223",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)}
        disabled={disabled}
        style={{ accentColor: "#005BD3", width: 14, height: 14 }}
      />
      {label}
    </label>
  );
}

// ─── Checkbox Input ───────────────────────────────────────────────────────────
function CheckboxInput({ label, checked, onChange, disabled }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        color: disabled ? "#AAAAAA" : "#202223",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        style={{ accentColor: "#005BD3", width: 14, height: 14 }}
      />
      {label}
    </label>
  );
}

// ─── Text Input ─────────────────────────────────────────────────────────────
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

// ─── Preview Panel ────────────────────────────────────────────────────────────
function PreviewPanel({
  checkboxText,
  keyword,
  link,
  size,
  color,
  showBrandMark,
  setSettings,
}) {
  const [device, setDevice] = useState("desktop");
  const { t } = useTranslation();

  const renderText = () => {
    const text = checkboxText || "";
    const key = keyword || "";
    if (!key) return text;
    const escapedKeyword = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedKeyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === key.toLowerCase() ? (
        <a
          key={i}
          href={link}
          onClick={(e) => e.preventDefault()}
          style={{ color: "#2C6ECB", textDecoration: "underline" }}
        >
          {part}
        </a>
      ) : (
        part
      ),
    );
  };

  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        border: "1px solid #E1E3E5",
        borderRadius: "10px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Device toggle */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <button
          onClick={() => setDevice("desktop")}
          style={{
            background: device === "desktop" ? "#F1F1F1" : "transparent",
            border: "1px solid #E1E3E5",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title={t("termsAndConditions.desktop")}
        >
          {/* Monitor icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>
        <button
          onClick={() => setDevice("mobile")}
          style={{
            background: device === "mobile" ? "#F1F1F1" : "transparent",
            border: "1px solid #E1E3E5",
            borderRadius: "6px",
            padding: "6px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
          title={t("termsAndConditions.mobile")}
        >
          {/* Phone icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </button>
      </div>

      {/* Product page mockup */}
      <div
        style={{
          border: "1px solid #E1E3E5",
          borderRadius: "8px",
          padding: "16px",
          display: "flex",
          flexDirection: device === "mobile" ? "column" : "row",
          gap: "16px",
          maxWidth: device === "mobile" ? "260px" : "100%",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Product image skeleton */}
        <div
          style={{
            width: device === "mobile" ? "100%" : "140px",
            height: device === "mobile" ? "120px" : "140px",
            backgroundColor: "#E8E8E8",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        />

        {/* Content skeletons */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {/* Title skeleton */}
          <div
            style={{
              height: "12px",
              backgroundColor: "#D0D0D0",
              borderRadius: "4px",
              width: "80%",
            }}
          />
          <div
            style={{
              height: "10px",
              backgroundColor: "#E0E0E0",
              borderRadius: "4px",
              width: "100%",
            }}
          />

          {/* Checkbox row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <input
              type="checkbox"
              style={{
                marginTop: "2px",
                width: "14px",
                height: "14px",
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: `${size}px`, color: color, lineHeight: "1.4" }}
            >
              {renderText()}
            </span>
          </div>

          {/* Protected by */}
          {showBrandMark !== false && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "#6D7175" }}>
                {t("termsAndConditions.protectedBy")}
              </span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    background: "linear-gradient(135deg,#7C3AED,#EC4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                </div>
                <a
                  href="https://google.com"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    color: "#2C6ECB",
                    textDecoration: "underline",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {t("termsAndConditions.avdTrademark")}
                </a>
              </div>
            </div>
          )}

          {/* More skeleton lines */}
          <div
            style={{
              height: "10px",
              backgroundColor: "#E0E0E0",
              borderRadius: "4px",
              width: "90%",
            }}
          />
          <div
            style={{
              height: "10px",
              backgroundColor: "#E8E8E8",
              borderRadius: "4px",
              width: "70%",
            }}
          />
          <div
            style={{
              height: "10px",
              backgroundColor: "#E8E8E8",
              borderRadius: "4px",
              width: "85%",
            }}
          />
        </div>
      </div>

      {/* Remove brandmark link */}
      {showBrandMark !== false && (
        <div style={{ textAlign: "center" }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setSettings((prev) => ({ ...prev, showBrandMark: false }));
            }}
            style={{
              fontSize: "13px",
              color: "#2C6ECB",
              textDecoration: "none",
            }}
          >
            {t("termsAndConditions.clickToRemoveBrandmark")}
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TermsAndConditionsSetup() {
  const navigate = useNavigate();
  const { settings: initialSettings } = useLoaderData();
  const [settings, setSettings] = useState(initialSettings);
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [activeTab, setActiveTab] = useState("condition");
  const { canAccess } = usePlan();
  const { t } = useTranslation();

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(t("common.savedSuccessfully"));
    }
  }, [fetcher.data, shopify, t]);

  const handleSave = () => {
    fetcher.submit({ settings: JSON.stringify(settings) }, { method: "post" });
  };

  const handleDiscard = () => {
    setSettings(initialSettings);
  };

  const togglePage = (page) => {
    setSettings((prev) => {
      const displayPages = prev.displayPages.includes(page)
        ? prev.displayPages.filter((p) => p !== page)
        : [...prev.displayPages, page];
      return { ...prev, displayPages };
    });
  };

  const tabStyle = (tab) => ({
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid #E1E3E5",
    borderRadius: "6px",
    background: activeTab === tab ? "#E0E0E0" : "#F6F6F7",
    color: "#202223",
  });

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif" }}>
      <SaveBar id="terms-save-bar" open={isDirty}>
        <button
          variant="primary"
          onClick={handleSave}
          disabled={fetcher.state === "submitting"}
        >
          {t("common.save")}
        </button>
        <button onClick={handleDiscard}>{t("common.discard")}</button>
      </SaveBar>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => navigate("/terms_and_conditions")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              color: "#202223",
              padding: 0,
              lineHeight: 1,
            }}
            aria-label={t("common.close")}
          >
            ←
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
              color: "#202223",
            }}
          >
            {t("termsAndConditions.setupTitle")}
          </h1>
        </div>
      </div>
      <p
        style={{ margin: "0 0 20px 28px", fontSize: "13px", color: "#6D7175" }}
      >
        {t("termsAndConditions.setupDescription")}
      </p>

      {fetcher.data?.errors && (
        <div
          style={{
            background: "#fff4f4",
            border: "1px solid #d72c0d",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "24px",
            color: "#d72c0d",
            fontSize: "13px",
          }}
        >
          {fetcher.data.errors.map((err, i) => (
            <p key={i} style={{ margin: "2px 0" }}>
              • {err}
            </p>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
        <button
          style={tabStyle("condition")}
          onClick={() => setActiveTab("condition")}
        >
          {t("checkoutVerification.tabCondition")}
        </button>
        <button
          style={tabStyle("checkbox")}
          onClick={() => setActiveTab("checkbox")}
        >
          {t("termsAndConditions.tabBanner")}
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        {/* ─── Left Settings Panel ─── */}
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {activeTab === "condition" ? (
            <>
              {/* Status */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E1E3E5",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>
                    {t("common.status")}
                  </span>
                  {!canAccess("terms.condition.status") && <Badge text={t("common.premiumPlan")} type="premium" />}
                </div>
                <RadioInput
                  label={t("common.enabled")}
                  name="status"
                  value={true}
                  checked={settings.enabled === true}
                  onChange={() => setSettings({ ...settings, enabled: true })}
                  disabled={!canAccess("terms.condition.status")}
                />
                <RadioInput
                  label={t("common.disabled")}
                  name="status"
                  value={false}
                  checked={settings.enabled === false}
                  onChange={() => setSettings({ ...settings, enabled: false })}
                  disabled={!canAccess("terms.condition.status")}
                />
              </div>

              {/* Display page(s) + Trigger condition */}
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
                {/* Display page(s) */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700 }}>
                      {t("popupEditor.infoTab.displayPages")}
                    </span>
                    <span style={{ fontSize: "12px", color: "#6D7175" }}>
                      *
                    </span>
                    {!canAccess("terms.condition.pages") && <Badge text={t("common.premiumPlan")} type="premium" />}
                  </div>
                  <CheckboxInput
                    label={t("termsAndConditions.productPage")}
                    checked={settings.displayPages.includes("product")}
                    onChange={() => togglePage("product")}
                    disabled={!canAccess("terms.condition.pages")}
                  />
                  <CheckboxInput
                    label={t("termsAndConditions.cartPage")}
                    checked={settings.displayPages.includes("cart")}
                    onChange={() => togglePage("cart")}
                    disabled={!canAccess("terms.condition.pages")}
                  />
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #E1E3E5",
                    margin: "4px 0",
                  }}
                />

                {/* Trigger condition */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700 }}>
                      {t("popupEditor.infoTab.triggerCondition")}
                    </span>
                    {!canAccess("terms.condition.trigger") && <Badge text={t("common.premiumPlan")} type="premium" />}
                  </div>
                  <RadioInput
                    label={t("storeVerification.triggerOptions.alwaysShow")}
                    name="trigger"
                    value="always"
                    checked={settings.triggerCondition === "always"}
                    onChange={(val) =>
                      setSettings({ ...settings, triggerCondition: val })
                    }
                    disabled={!canAccess("terms.condition.trigger")}
                  />
                  <RadioInput
                    label={t("storeVerification.triggerOptions.loggedCustomers")}
                    name="trigger"
                    value="logged"
                    checked={settings.triggerCondition === "logged"}
                    onChange={(val) =>
                      setSettings({ ...settings, triggerCondition: val })
                    }
                    disabled={!canAccess("terms.condition.trigger")}
                  />
                  <RadioInput
                    label={t("settings.adminLanguageOther")}
                    name="trigger"
                    value="not_logged"
                    checked={settings.triggerCondition === "not_logged"}
                    onChange={(val) =>
                      setSettings({ ...settings, triggerCondition: val })
                    }
                    disabled={!canAccess("terms.condition.trigger")}
                  />
                </div>
              </div>
            </>
          ) : (
            <Card
              title={t("termsAndConditions.message")}
              badge={!canAccess("terms.checkbox.text") ? <Badge text={t("common.premiumPlan")} type="premium" /> : null}
            >
              <TextInput
                label={t("termsAndConditions.messageText")}
                required
                value={settings.checkboxText}
                onChange={(val) =>
                  setSettings({ ...settings, checkboxText: val })
                }
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
                onChange={(val) =>
                  setSettings({ ...settings, errorMessage: val })
                }
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
              <a
                href="#"
                style={{ color: "#2C6ECB", textDecoration: "none" }}
              >
                {t("termsAndConditions.contactUs")}
              </a>
            </p>
          </Card>
          )}
        </div>

        {/* ─── Right Preview Panel ─── */}
        <PreviewPanel
          checkboxText={settings.checkboxText}
          keyword={settings.keyword}
          link={settings.link}
          size={settings.size}
          color={settings.color}
          showBrandMark={settings.showBrandMark}
          setSettings={setSettings}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "28px",
          fontSize: "13px",
          color: "#6D7175",
        }}
      >
        {t("common.needHelp")}{" "}
        <a href="#" style={{ color: "#2C6ECB", textDecoration: "none" }}>
          {t("common.ourDocumentGuideline")}
        </a>
      </div>
    </div>
  );
}
