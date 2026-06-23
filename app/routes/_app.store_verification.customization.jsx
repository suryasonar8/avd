import { useSubmit, useLoaderData, redirect } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PopupEditor } from "../components/customization/PopupEditor";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Fetch global settings for Brand Mark
  const globalSettingsResponse = await admin.graphql(
    `#graphql
    query getGlobalSettings {
      shop {
        metafield(namespace: "avd", key: "settings") {
          value
        }
      }
    }`,
  );
  const globalSettingsData = await globalSettingsResponse.json();
  const globalSettingsValue = globalSettingsData.data.shop.metafield?.value;
  const globalSettings = globalSettingsValue
    ? JSON.parse(globalSettingsValue)
    : { showBrandMark: true };

  return { settings: null, globalSettings };
};
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle_brand_mark") {
    const showBrandMark = formData.get("showBrandMark") === "true";

    const existingResponse = await admin.graphql(
      `#graphql
      query getGlobalSettings {
        shop {
          metafield(namespace: "avd", key: "settings") {
            value
          }
        }
      }`,
    );
    const existingValue = (await existingResponse.json()).data.shop.metafield
      ?.value;
    const existingSettings = existingValue ? JSON.parse(existingValue) : {};
    const newSettings = { ...existingSettings, showBrandMark };

    const shopResponse = await admin.graphql(`{ shop { id } }`);
    const shopId = (await shopResponse.json()).data.shop.id;

    await admin.graphql(
      `#graphql
      mutation updateSettings($metafields: [MetafieldsSetInput!]!) {
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
              key: "settings",
              type: "json",
              ownerId: shopId,
              value: JSON.stringify(newSettings),
            },
          ],
        },
      },
    );

    return { success: true };
  }

  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

  const popupId = Date.now().toString();

  // Discover the actual Metaobject type handles
  const popupsDefResponse = await admin.graphql(
    `#graphql
    query getPopupsDef {
      metaobjectDefinitionByType(type: "$app:popups") {
        id
        type
      }
    }`,
  );
  const popupsDefData = await popupsDefResponse.json();
  const popupsDef = popupsDefData.data.metaobjectDefinitionByType;
  const popupsTypeHandle = popupsDef?.type || "app--popups";
  const popupsDefId = popupsDef?.id;

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

    // Step 1: Check if metafield definition exists
    const defCheck = await admin.graphql(
      `#graphql
      query {
        metafieldDefinitions(
          first: 1,
          ownerType: SHOP,
          namespace: "avd",
          key: "active_popup"
        ) {
          edges {
            node {
              id
              name
              type { name }
            }
          }
        }
      }`,
    );
    const defData = await defCheck.json();
    const defExists = defData?.data?.metafieldDefinitions?.edges?.length > 0;

    // Step 2: Create definition if missing
    if (!defExists && popupsDefId) {
      const defCreate = await admin.graphql(
        `#graphql
        mutation {
          metafieldDefinitionCreate(definition: {
            name: "Active Popup"
            namespace: "avd"
            key: "active_popup"
            type: "metaobject_reference"
            description: "Reference to the currently active popup metaobject"
            ownerType: SHOP
            validations: [
              {
                name: "metaobject_definition_id"
                value: "${popupsDefId}"
              }
            ]
          }) {
            createdDefinition {
              id
              name
              type { name }
            }
            userErrors { field message }
          }
        }`,
      );
      const defCreateData = await defCreate.json();
      if (defCreateData?.data?.metafieldDefinitionCreate?.userErrors?.length) {
        console.error(
          "Definition creation failed:",
          JSON.stringify(
            defCreateData.data.metafieldDefinitionCreate.userErrors,
            null,
            2,
          ),
        );
        return {
          success: false,
          errors: defCreateData.data.metafieldDefinitionCreate.userErrors,
        };
      }
    }

    // Step 3: Set the metafield value
    const result = await admin.graphql(
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
              type: "metaobject_reference",
              ownerId: shopId,
              value: gid,
            },
          ],
        },
      },
    );

    const data = await result.json();
    const setErrors = data?.data?.metafieldsSet?.userErrors;

    if (setErrors && setErrors.length > 0) {
      console.error(
        "MetafieldsSet failed:",
        JSON.stringify(setErrors, null, 2),
      );
    } else {
      console.log(
        "Metafield updated successfully:",
        data?.data?.metafieldsSet?.metafields,
      );
    }
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
      globalSettings={loaderData?.globalSettings}
      onSave={handleSave}
      heading="Configuration"
      description="Customization the pop-up to match your brand."
      saveBarId="customization-save-bar"
      submit={submit}
      shopify={shopify}
    />
  );
}
