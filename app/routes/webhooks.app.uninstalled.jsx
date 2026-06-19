import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (admin) {
    try {
      // 1. Cleanup Metaobjects ($app:popups)
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
        popupsDefData.data?.metaobjectDefinitionByType?.type || "app--popups";

      const metaobjectsResponse = await admin.graphql(
        `#graphql
        query getMetaobjects($type: String!) {
          metaobjects(first: 250, type: $type) {
            nodes { id }
          }
        }`,
        { variables: { type: popupsTypeHandle } },
      );
      const metaobjectsData = await metaobjectsResponse.json();
      const metaobjectIds =
        metaobjectsData.data?.metaobjects?.nodes?.map((n) => n.id) || [];

      for (const id of metaobjectIds) {
        await admin.graphql(
          `#graphql
          mutation deleteMetaobject($id: ID!) {
            metaobjectDelete(id: $id) {
              deletedId
            }
          }`,
          { variables: { id } },
        );
      }
      console.log(`Deleted ${metaobjectIds.length} metaobjects for ${shop}`);

      // 2. Cleanup Metafield Definitions (this deletes definition and values)
      const defsToCleanup = [
        { namespace: "avd", key: "settings" },
        { namespace: "avd", key: "active_popup" },
        { namespace: "avd", key: "checkout_banner" },
      ];

      for (const def of defsToCleanup) {
        const defCheckResponse = await admin.graphql(
          `#graphql
          query findDef($namespace: String!, $key: String!) {
            metafieldDefinitions(first: 1, ownerType: SHOP, namespace: $namespace, key: $key) {
              edges {
                node { id }
              }
            }
          }`,
          { variables: def },
        );
        const defCheckData = await defCheckResponse.json();
        const defId =
          defCheckData.data?.metafieldDefinitions?.edges[0]?.node?.id;

        if (defId) {
          await admin.graphql(
            `#graphql
            mutation deleteDef($id: ID!) {
              metafieldDefinitionDelete(id: $id, deleteAllMetafields: true) {
                deletedDefinitionId
                userErrors { field message }
              }
            }`,
            { variables: { id: defId } },
          );
          console.log(
            `Deleted metafield definition ${def.namespace}.${def.key} for ${shop}`,
          );
        }
      }
    } catch (error) {
      console.error(`Error during cleanup for ${shop}:`, error);
    }
  }

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
