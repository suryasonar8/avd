import { useSubmit, useLoaderData, redirect } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PopupEditor } from "../components/customization/PopupEditor";

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

  const popupId = Date.now().toString();

  // Discover the actual Metaobject type handles
  const popupsDefResponse = await admin.graphql(
    `#graphql
    query getPopupsDef {
      metaobjectDefinitionByType(type: "$app:popups") {
        type
      }
    }`,
  );
  const popupsDefData = await popupsDefResponse.json();
  const popupsTypeHandle =
    popupsDefData.data.metaobjectDefinitionByType?.type || "app--popups";

  // Create the Metaobject
  const response = await admin.graphql(
    `#graphql
    mutation createPopup($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metaobject: {
          type: popupsTypeHandle,
          handle: popupId,
          fields: [
            { key: "popup_id", value: popupId },
            {
              key: "config",
              value: JSON.stringify(
                Object.fromEntries(
                  Object.entries(config).filter(([k]) => k !== "status"),
                ),
              ),
            },
          ],
        },
      },
    },
  );

  const responseData = await response.json();
  const errors = responseData.data?.metaobjectCreate?.userErrors;
  if (errors && errors.length > 0) {
    console.error(
      "Metaobject creation failed:",
      JSON.stringify(errors, null, 2),
    );
    return { success: false, errors };
  }

  const gid = responseData.data.metaobjectCreate.metaobject.id;

  // If enabled, set as the shop's active popup in Shop Metafield
  if (config.status === "Enabled") {
    const shopResponse = await admin.graphql(`{ shop { id } }`);
    const shopId = (await shopResponse.json()).data.shop.id;

    await admin.graphql(
      `#graphql
      mutation updateActive($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id }
          userErrors { field message }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              namespace: "avd",
              key: "active_popup",
              type: "mixed_reference",
              ownerId: shopId,
              value: gid,
            },
          ],
        },
      },
    );
  }

  // Redirect to the newly created popup's edit page
  return redirect(`/store_verification/${popupId}`);
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
      key="new-popup"
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
