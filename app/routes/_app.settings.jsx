import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useEffect } from "react";
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
            ownerId: (await (await admin.graphql(`{ shop { id } }`)).json()).data.shop.id,
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

export default function SettingsPage() {
  const { settings: initialSettings } = useLoaderData();
  const [settings, setSettings] = useState(initialSettings);
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Settings saved");
    }
  }, [fetcher.data, shopify]);

  const handleSave = () => {
    fetcher.submit({ settings: JSON.stringify(settings) }, { method: "POST" });
  };

  const handleDiscard = () => {
    setSettings(initialSettings);
  };

  return (
    <s-page heading="Settings">
      <SaveBar id="settings-save-bar" open={isDirty}>
        <button variant="primary" onClick={handleSave}>
          Save
        </button>
        <button onClick={handleDiscard}>Discard</button>
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
            General
          </h2>
          <p style={{ fontSize: "13px", color: "#6D7175", lineHeight: "1.5" }}>
            Choose the admin language and set visitor verification duration.
          </p>
        </div>

        <div style={{ maxWidth: "600px" }}>
          <Card title="Admin language">
            <select
              value={settings.adminLanguage || "English"}
              onChange={(e) =>
                setSettings({ ...settings, adminLanguage: e.target.value })
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
              <option>English</option>
              <option>Other</option>
            </select>
            <p
              style={{
                fontSize: "12px",
                color: "#6D7175",
                marginTop: "8px",
              }}
            >
              Selected languages will be translated immediately.
            </p>
          </Card>

          <Card title="Remember visitor">
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
                <option>Session only</option>
                <option>Days</option>
                <option>Allow visitor to choose</option>
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
                  Enter number of days
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
                    day(s)
                  </span>
                </div>
              </div>
            )}
          </Card>

          <div style={{ marginTop: "24px", textAlign: "left" }}>
            <p style={{ fontSize: "13px", color: "#6D7175" }}>
              Need help? Please view{" "}
              <a
                href="#"
                style={{ color: "#005BD3", textDecoration: "none" }}
                onClick={(e) => e.preventDefault()}
              >
                our document guideline
              </a>
            </p>
          </div>
        </div>
      </div>
    </s-page>
  );
}
