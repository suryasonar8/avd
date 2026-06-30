import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useEffect, useRef } from "react";
import { Card } from "../components/Card";
import { SaveBar } from "@shopify/app-bridge-react";

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

import { useTranslation } from "../context/TranslationContext";

const LANGUAGE_MAP = {
  English: "en",
  Deutsch: "de",
  Français: "fr",
  Italiano: "it",
  Español: "es",
  "हिन्दी (Hindi)": "hi",
  Hindi: "hi",
};

export default function SettingsPage() {
  const { settings: initialSettings = {} } = useLoaderData();
  const { adminLanguage: initialAdminLanguage, ...initialOtherSettings } =
    initialSettings;

  const [settings, setSettings] = useState(initialOtherSettings);
  const [adminLanguage, setAdminLanguage] = useState(() => {
    const lang = initialAdminLanguage || "en";
    return LANGUAGE_MAP[lang] || lang;
  });
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const { t, changeLocale } = useTranslation();
  const lastProcessedFetcherData = useRef(null);

  const isDirty =
    JSON.stringify(settings) !== JSON.stringify(initialOtherSettings);

  useEffect(() => {
    if (
      fetcher.data?.success &&
      fetcher.data !== lastProcessedFetcherData.current
    ) {
      lastProcessedFetcherData.current = fetcher.data;
      shopify.toast.show(t("settings.settingsSaved"));
      setSettings(initialOtherSettings);
    }
  }, [fetcher.data, initialOtherSettings, shopify, t]);

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
    <s-page heading={t("settings.pageTitle")}>
      <SaveBar id="settings-save-bar" open={isDirty}>
        <button variant="primary" onClick={handleSave}>
          {t("common.save")}
        </button>
        <button onClick={handleDiscard}>{t("common.discard")}</button>
      </SaveBar>

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
          <Card title={t("settings.adminLanguage")}>
            <select
              value={adminLanguage}
              onChange={(e) => {
                const newLang = e.target.value;
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
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #CBCFD2",
                background: "#FFF",
                fontSize: "14px",
              }}
            >
              <option value="en">{t("settings.adminLanguageEnglish")}</option>
              <option value="de">{t("settings.adminLanguageDeutsch")}</option>
              <option value="fr">{t("settings.adminLanguageFrench")}</option>
              <option value="it">{t("settings.adminLanguageItalian")}</option>
              <option value="es">{t("settings.adminLanguageSpanish")}</option>
              <option value="hi">{t("settings.adminLanguageHindi")}</option>
            </select>
            <p
              style={{
                fontSize: "12px",
                color: "#6D7175",
                marginTop: "8px",
              }}
            >
              {t("settings.adminLanguageHelpText")}
            </p>
          </Card>

          <Card title={t("settings.rememberVisitor")}>
            <div style={{ marginBottom: "16px" }}>
              <select
                value={settings.rememberVisitor || "Session only"}
                onChange={(e) =>
                  setSettings({ ...settings, rememberVisitor: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #CBCFD2",
                  background: "#FFF",
                  fontSize: "14px",
                }}
              >
                <option value="Session only">
                  {t("settings.rememberVisitorOptions.sessionOnly")}
                </option>
                <option value="Days">
                  {t("settings.rememberVisitorOptions.days")}
                </option>
                <option value="Allow visitor to choose">
                  {t("settings.rememberVisitorOptions.allowVisitorToChoose")}
                </option>
              </select>
            </div>

            {settings.rememberVisitor === "Days" && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {t("settings.enterNumberOfDays")}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    value={settings.rememberDays || 30}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rememberDays: parseInt(e.target.value),
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #CBCFD2",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "13px",
                      color: "#6D7175",
                    }}
                  >
                    {t("settings.daySuffix")}
                  </span>
                </div>
              </div>
            )}
          </Card>

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
