import { useFetcher, useLoaderData, useParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PopupEditor } from "../components/customization/PopupEditor";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { id } = params; // This is the popup_id

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

  const response = await admin.graphql(
    `#graphql
    query findPopup($query: String!, $type: String!) {
      metaobjects(type: $type, first: 1, query: $query) {
        nodes {
          id
          handle
          popup_id: field(key: "popup_id") { value }
          config: field(key: "config") { value }
        }
      }
    }`,
    { variables: { query: `handle:${id}`, type: popupsTypeHandle } },
  );
  const data = await response.json();
  const node = data.data.metaobjects.nodes[0];

  if (!node) {
    throw new Response("Not Found", { status: 404 });
  }

  // Derive status from Shop Metafield
  const activeResponse = await admin.graphql(
    `#graphql
    query getActiveSetting {
      shop {
        metafield(namespace: "avd", key: "active_popup") {
          value
        }
      }
    }`,
  );
  const activeData = await activeResponse.json();
  const activeGid = activeData.data.shop.metafield?.value;
  const isActive = activeGid === node.id;

  const popup = {
    ...JSON.parse(node.config.value),
    id: node.popup_id.value,
    gid: node.id,
    status: isActive ? "Enabled" : "Disabled",
  };

  return { settings: popup };
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { id } = params;
  const formData = await request.formData();
  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

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

  // 1. Find the GID of the Metaobject
  const searchResponse = await admin.graphql(
    `#graphql
    query findPopupGID($query: String!, $type: String!) {
      metaobjects(type: $type, first: 1, query: $query) {
        nodes { id }
      }
    }`,
    { variables: { query: `handle:${id}`, type: popupsTypeHandle } },
  );
  const searchData = await searchResponse.json();
  const gid = searchData.data.metaobjects.nodes[0]?.id;

  if (!gid) {
    return { success: false, errors: [{ message: "Popup not found" }] };
  }

  // 2. Update the Metaobject
  const response = await admin.graphql(
    `#graphql
    mutation updatePopup($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }`,
    {
      variables: {
        id: gid,
        metaobject: {
          fields: [
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
  const success = !responseData.data.metaobjectUpdate.userErrors?.length;

  // 3. Update the Shop Metafield based on status
  if (success) {
    const shopResponse = await admin.graphql(
      `{ shop { id metafield(namespace: "avd", key: "active_popup") { value } } }`,
    );
    const shopData = (await shopResponse.json()).data;
    const shopId = shopData.shop.id;
    const activeGid = shopData.shop.metafield?.value;

    if (config.status === "Enabled") {
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
              createdDefinition { id }
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
        }
      }

      // Step 3: Set the metafield value
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
                type: "metaobject_reference",
                ownerId: shopId,
                value: gid,
              },
            ],
          },
        },
      );
    } else if (activeGid === gid) {
      // If disabling and it was the active one, clear it
      await admin.graphql(
        `#graphql
        mutation clearActive($metafields: [MetafieldsSetInput!]!) {
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
                value: "",
              },
            ],
          },
        },
      );
    }
  }

  return { ...responseData, success };
};

export default function StoreVerificationEdit() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const { id } = useParams();

  const handleSave = (config) => {
    fetcher.submit({ config: JSON.stringify(config) }, { method: "POST" });
  };

  return (
    <PopupEditor
      key={id}
      settings={loaderData?.settings}
      onSave={handleSave}
      heading="Edit Pop-up"
      description="Edit your pop-up configuration."
      saveBarId={`edit-save-bar-${id}`}
      fetcher={fetcher}
      shopify={shopify}
    />
  );
}
