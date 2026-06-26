import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (admin) {
    try {
      // 1. Cleanup Prisma Database
      const deletedPopups = await db.popup.deleteMany({ where: { shop } });
      await db.shopPlan.deleteMany({ where: { shop } });
      console.log(`Deleted ${deletedPopups.count} popups from DB for ${shop}`);

      // 2. Cleanup Metafield Definitions (this deletes definition and values)
      // Note: metafieldDefinitionDelete requires write_metafield_definitions or equivalent.
      // Since we kept standard metafield access, this should still work for standard metafields.
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
          }
          `,
          { variables: def },
        );
        const defCheckData = await defCheckResponse.json();
        const defId =
          defCheckData.data?.metafieldDefinitions?.edges?.[0]?.node?.id;

        if (defId) {
          await admin.graphql(
            `#graphql
            mutation deleteDef($id: ID!) {
              metafieldDefinitionDelete(id: $id, deleteAllAssociatedMetafields: true) {
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
