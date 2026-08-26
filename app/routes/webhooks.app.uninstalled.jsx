import { authenticate } from "../shopify.server";
import db from "../db.server";
import { ShopService } from "../services/shop.service";

export const action = async ({ request }) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (admin) {
    try {
      // 1. Cleanup Prisma Database
      const deletedPopups = await db.popup.deleteMany({ where: { shop } });
      await db.shopPlan.deleteMany({ where: { shop } });
      await db.termsSettings.deleteMany({ where: { shop } });
      await db.checkoutBanner.deleteMany({ where: { shop } });
      await db.analyticsEvent.deleteMany({ where: { shop } });
      await db.appSettings.deleteMany({ where: { shop } });
      await db.checkoutAgeVerification.deleteMany({ where: { shop } });
      console.log(`Deleted ${deletedPopups.count} popups from DB for ${shop}`);

      // 2. Cleanup Metafield Definitions (this deletes definition and values)
      // Note: metafieldDefinitionDelete requires write_metafield_definitions or equivalent.
      // Since we kept standard metafield access, this should still work for standard metafields.
      const defsToCleanup = [
        { namespace: "$app:avd", key: "settings" },
        { namespace: "$app:avd", key: "active_popup_config" },
        { namespace: "$app:avd", key: "checkout_banner" },
        { namespace: "$app:avd", key: "terms_settings" },
        { namespace: "$app:avd", key: "entitlements" },
        { namespace: "$app:avd", key: "checkout_age_verification" },
      ];

      for (const def of defsToCleanup) {
        const defCheckData = await ShopService.getMetafieldDefinitions(admin, def.namespace, def.key);
        const defId =
          defCheckData.data?.metafieldDefinitions?.edges?.[0]?.node?.id;

        if (defId) {
          await ShopService.deleteMetafieldDefinition(admin, defId, true);
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
