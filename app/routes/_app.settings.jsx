import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useEffect, useRef, useMemo } from "react";
import { SaveBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../context/TranslationContext";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query getSettings {
      shop {
        metafield(namespace: "avd", key: "settings") {
          value
        }
      }
    }`,
  );
  const data = await response.json();
  const metafieldValue = data.data.shop.metafield?.value;

  const settings = metafieldValue
    ? JSON.parse(metafieldValue)
    : {
        adminLanguage: "English",
        rememberVisitor: "Session only",
        rememberDays: 30,
        minAge: 18,
        redirectUrl: "https://www.google.com",
      };

  return { settings };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const settingsStr = formData.get("settings");
  const settings = JSON.parse(settingsStr);

  const response = await admin.graphql(
    `#graphql
    mutation metafieldUpsert($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            namespace: "avd",
            key: "settings",
            type: "json",
            ownerId: (await (await admin.graphql(`{ shop { id } }`)).json())
              .data.shop.id,
            value: JSON.stringify(settings),
          },
        ],
      },
    },
  );

  const responseData = await response.json();
  const errors = responseData.data?.metafieldsSet?.userErrors;

  return { success: !errors?.length };
};

const LANGUAGE_MAP = {
  English: "en",
  Deutsch: "de",
  Français: "fr",
  Italiano: "it",
  Español: "es",
  हिन्दी: "hi",
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
  const isSubmitting = useRef(false);

  const isDirty =
    JSON.stringify(settings) !== JSON.stringify(initialOtherSettings);

  useEffect(() => {
    if (fetcher.state !== "idle") {
      isSubmitting.current = true;
    }

    if (isSubmitting.current && fetcher.state === "idle") {
      if (fetcher.data?.success) {
        shopify.toast.show(t("settings.settingsSaved"));
        isSubmitting.current = false;
      }
    }
  }, [fetcher.state, fetcher.data, shopify, t]);

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
      <SaveBar id="settings-save-bar" open={isDirty}>
        <button variant="primary" onClick={handleSave}>
          {t("common.save")}
        </button>
        <button onClick={handleDiscard}>{t("common.discard")}</button>
      </SaveBar>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "4px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              margin: 0,
              color: "#1A1C1D",
            }}
          >
            {t("settings.pageTitle")}
          </h2>
        </div>
      </div>

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
                    {t("settings.rememberVisitorOptions.sessionOnly")}
                  </s-option>
                  <s-option value="Days">
                    {t("settings.rememberVisitorOptions.days")}
                  </s-option>
                  <s-option value="Allow visitor to choose">
                    {t("settings.rememberVisitorOptions.allowVisitorToChoose")}
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
                    />
                  </div>
                )}
              </div>
            </s-section>
          </div>

          <div style={{ marginTop: "24px", textAlign: "left" }}>
            <p style={{ fontSize: "13px", color: "#6D7175" }}>
              {t("common.needHelp")}{" "}
              <a
                href="#"
                style={{ color: "#005BD3", textDecoration: "none" }}
                onClick={(e) => e.preventDefault()}
              >
                {t("common.ourDocumentGuideline")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </s-page>
  );
}
