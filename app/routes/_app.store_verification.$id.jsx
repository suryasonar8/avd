import { useFetcher, useLoaderData, useParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PopupEditor } from "../components/customization/PopupEditor";

export const loader = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { id } = params;

  const response = await admin.graphql(
    `#graphql
    query getPopups {
      shop {
        metafield(namespace: "avd_app", key: "popups") {
          value
        }
      }
    }`,
  );
  const data = await response.json();
  const popups = data.data.shop.metafield
    ? JSON.parse(data.data.shop.metafield.value)
    : [];

  const popup = popups.find((p) => p.id === id);

  if (!popup) {
    throw new Response("Not Found", { status: 404 });
  }

  return { settings: popup };
};

export const action = async ({ request, params }) => {
  const { admin } = await authenticate.admin(request);
  const { id } = params;
  const formData = await request.formData();
  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

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

  const updatedPopups = existingPopups.map((p) => {
    if (p.id === id) {
      return { ...p, ...config, updatedAt: new Date().toISOString() };
    }
    if (config.status === "Enabled") {
      return { ...p, status: "Disabled" };
    }
    return p;
  });

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
  const success = !responseData.data.metafieldsSet.userErrors?.length;
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
