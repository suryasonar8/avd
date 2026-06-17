import { useSubmit, useLoaderData, redirect } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PopupEditor } from "../components/customization/PopupEditor";
import { useEffect } from "react";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  // Return null settings so PopupEditor uses DEFAULT_CONFIG for new popups
  return { settings: null };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

  // Generate a unique ID for the new popup
  const newPopup = {
    id: Date.now().toString(),
    ...config,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const shopResponse = await admin.graphql(`{ shop { id } }`);
  const shopData = await shopResponse.json();
  const shopId = shopData.data.shop.id;

  // Fetch existing popups
  const existingPopupsResponse = await admin.graphql(
    `#graphql
    query getPopups {
      shop {
        metafield(namespace: "avd_app", key: "popups") {
          value
        }
      }
    }`,
  );
  const existingPopupsData = await existingPopupsResponse.json();
  const existingPopups = existingPopupsData.data.shop.metafield
    ? JSON.parse(existingPopupsData.data.shop.metafield.value)
    : [];

  const finalExistingPopups =
    config.status === "Enabled"
      ? existingPopups.map((p) => ({ ...p, status: "Disabled" }))
      : existingPopups;

  const updatedPopups = [...finalExistingPopups, newPopup];

  const response = await admin.graphql(
    `#graphql
    mutation setPopups($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            namespace: "avd_app",
            key: "popups",
            type: "json",
            value: JSON.stringify(updatedPopups),
            ownerId: shopId,
          },
        ],
      },
    },
  );
  const responseData = await response.json();
  const errors = responseData.data?.metafieldsSet?.userErrors;
  if (errors && errors.length > 0) {
    return { success: false, errors };
  }
  // Redirect to the newly created popup's edit page
  return redirect(`/store_verification/${newPopup.id}`);
};

export default function StoreVerificationCustomization() {
  const loaderData = useLoaderData();
  const submit = useSubmit();
  const shopify = useAppBridge();

  const handleSave = (config) => {
    // Use useSubmit instead of useFetcher to ensure full page transition and URL update
    submit({ config: JSON.stringify(config) }, { method: "POST" });
  };
  return (
    <PopupEditor
      settings={loaderData?.settings}
      onSave={handleSave}
      heading="Configuration"
      description="Customization the pop-up to match your brand."
      saveBarId="customization-save-bar"
      submit={submit}
      shopify={shopify}
    />
  );
}
