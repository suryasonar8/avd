import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useMemo } from "react";
import { useTranslation } from "../context/TranslationContext";
import { CustomSaveBar } from "../components/CustomSaveBar";
import PageHeader from "../components/PageHeader";
import PageFooter from "../components/PageFooter";
import { ShopService } from "../services/shop.service";
import { SettingsService } from "../services/settings.service";
import { LANGUAGE_MAP } from "../constants/languages";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  // We fetch settings from the metafield for the JSON blob to ensure we get adminLanguage, etc.
  const shopData = await ShopService.getMetafield(admin, "avd", "settings");
  const metafieldValue = shopData?.metafield?.value;
  
  const metafieldSettings = metafieldValue
    ? JSON.parse(metafieldValue)
    : {
        adminLanguage: "English",
        rememberVisitor: "Session only",
        rememberDays: 30,
        minAge: 18,
        redirectUrl: "https://www.google.com",
      };

  // Fetch DB settings
  const dbSettings = await SettingsService.getSettings(shopDomain);

  // Merge them (DB settings take precedence for keys they share)
  const settings = {
    ...metafieldSettings,
    ...dbSettings,
  };

  return { settings };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const settingsStr = formData.get("settings");
  const settings = JSON.parse(settingsStr);
  const shopDomain = session.shop;

  const result = await SettingsService.updateSettings(admin, shopDomain, settings);

  return { success: result.success };
};

export default function SettingsPage() {
  const { settings: initialSettings = {} } = useLoaderData();
  const { initialOtherSettings, initialAdminLanguage } = useMemo(() => {
    const { adminLanguage, ...others } = initialSettings;
    return {
      initialOtherSettings: others,
      initialAdminLanguage: adminLanguage,
    };
  }, [initialSettings]);

  const [settings, setSettings] = useState(initialOtherSettings);
  const [adminLanguage, setAdminLanguage] = useState(() => {
    const lang = initialAdminLanguage || "en";
    return LANGUAGE_MAP[lang] || lang;
  });
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const { t, changeLocale } = useTranslation();

  const isDirty =
    JSON.stringify(settings) !== JSON.stringify(initialOtherSettings);

  const handleSave = () => {
    fetcher.submit(
      { settings: JSON.stringify({ ...settings, adminLanguage }) },
      { method: "POST" },
    );
  };

  const handleDiscard = () => {
    setSettings(initialOtherSettings);
    const lang = initialAdminLanguage || "en";
    setAdminLanguage(LANGUAGE_MAP[lang] || lang);
  };

  return (
    <s-page>
      <CustomSaveBar
        id="settings-save-bar"
        open={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        state={{ submitting: fetcher.state !== "idle", data: fetcher.data }}
        successMessage={t("settings.settingsSaved")}
      />
      <PageHeader title={t("settings.pageTitle")} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "250px 1fr",
          gap: "40px",
          marginTop: "24px",
        }}
      >
        <div>
          <h2
            style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}
          >
            {t("settings.general")}
          </h2>
          <p style={{ fontSize: "13px", color: "#6D7175", lineHeight: "1.5" }}>
            {t("settings.generalDescription")}
          </p>
        </div>

        <div style={{ maxWidth: "600px" }}>
          <div style={{ marginBottom: "20px" }}>
            <s-section>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
                  {t("settings.adminLanguage")}
                </s-text>
                <s-divider></s-divider>
                <s-select
                  value={adminLanguage}
                  onChange={(e) => {
                    const newLang = e.currentTarget.value;
                    setAdminLanguage(newLang);
                    // Immediately update translations across the app
                    changeLocale(newLang);
                    // Persist the setting to the server
                    fetcher.submit(
                      {
                        settings: JSON.stringify({
                          ...settings,
                          adminLanguage: newLang,
                        }),
                      },
                      { method: "POST" },
                    );
                  }}
                >
                  <s-option value="en">
                    {t("settings.adminLanguageEnglish")}
                  </s-option>
                  <s-option value="de">
                    {t("settings.adminLanguageDeutsch")}
                  </s-option>
                  <s-option value="fr">
                    {t("settings.adminLanguageFrench")}
                  </s-option>
                  <s-option value="it">
                    {t("settings.adminLanguageItalian")}
                  </s-option>
                  <s-option value="es">
                    {t("settings.adminLanguageSpanish")}
                  </s-option>
                  <s-option value="hi">
                    {t("settings.adminLanguageHindi")}
                  </s-option>
                </s-select>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6D7175",
                    marginTop: "0",
                    marginBottom: "0",
                  }}
                >
                  {t("settings.adminLanguageHelpText")}
                </p>
              </div>
            </s-section>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <s-section>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
                  {t("settings.rememberVisitor")}
                </s-text>
                <s-divider></s-divider>
                <s-select
                  value={settings.rememberVisitor || "Session only"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rememberVisitor: e.currentTarget.value,
                    })
                  }
                >
                  <s-option value="Session only">
                    Session only
                  </s-option>
                  <s-option value="Days">
                    Days
                  </s-option>
                  <s-option value="Allow visitor to choose">
                    Allow visitor to choose
                  </s-option>
                </s-select>

                {settings.rememberVisitor === "Days" && (
                  <div>
                    <s-number-field
                      label={t("settings.enterNumberOfDays")}
                      value={settings.rememberDays || 30}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          rememberDays: parseInt(e.currentTarget.value) || 0,
                        })
                      }
                      suffix="day(s)"
                    />
                  </div>
                )}
              </div>
            </s-section>
          </div>

          <PageFooter align="left" />
        </div>
      </div>
    </s-page>
  );
}
