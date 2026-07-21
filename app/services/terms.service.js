import db from "../db.server";
import { ensureMetafieldDefinition } from "../utils/metafield.server";
import { DEFAULT_TERMS_CONFIG } from "../constants/terms-and-conditions";

/**
 * TermsService — encapsulates all terms and conditions CRUD and Shopify sync logic.
 */
export const TermsService = {
  /**
   * Get the terms settings for a shop.
   */
  async getSettings(shop) {
    const settings = await db.termsSettings.findUnique({
      where: { shop },
    });

    if (!settings) return DEFAULT_TERMS_CONFIG;

    return {
      ...DEFAULT_TERMS_CONFIG,
      ...JSON.parse(settings.config),
      id: settings.id,
    };
  },

  /**
   * Save the terms settings and sync to Shopify.
   */
  async saveSettings(admin, shop, config) {
    // 1. Update/Create in DB
    const settings = await db.termsSettings.upsert({
      where: { shop },
      update: {
        config: JSON.stringify(config),
      },
      create: {
        shop,
        config: JSON.stringify(config),
      },
    });

    // 2. Sync to Shopify
    await this.syncToShopify(admin, shop, config);

    return settings;
  },

  /**
   * Publish the terms settings config as a JSON metafield.
   * If enabled is false, deletes the metafield definition.
   */
  async syncToShopify(admin, shop, config) {
    const shopResponse = await admin.graphql(`{ shop { id } }`);
    const shopId = (await shopResponse.json()).data.shop.id;

    if (config.enabled) {
      await this.ensureDefinitionsExist(admin);

      const result = await admin.graphql(
        `#graphql
        mutation updateTerms($metafields: [MetafieldsSetInput!]!) {
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
                key: "terms_settings",
                type: "json",
                ownerId: shopId,
                value: JSON.stringify(config),
              },
            ],
          },
        },
      );

      const data = await result.json();
      const errors = data?.data?.metafieldsSet?.userErrors;
      if (errors && errors.length > 0) {
        console.error("Sync to Shopify failed:", JSON.stringify(errors, null, 2));
        return { success: false, errors };
      }
    } else {
      // Delete Metafield Definition as requested by user
      await this.deleteDefinition(admin);
    }

    return { success: true };
  },

  /**
   * Delete the `avd:terms_settings` metafield definition.
   */
  async deleteDefinition(admin) {
    const defCheck = await admin.graphql(
      `#graphql
      query {
        metafieldDefinitions(
          first: 1,
          ownerType: SHOP,
          namespace: "avd",
          key: "terms_settings"
        ) {
          edges {
            node {
              id
            }
          }
        }
      }`,
    );
    const defData = await defCheck.json();
    const existingDefId = defData?.data?.metafieldDefinitions?.edges?.[0]?.node?.id;

    if (existingDefId) {
      const deleteResult = await admin.graphql(
        `#graphql
        mutation deleteDefinition($id: ID!) {
          metafieldDefinitionDelete(id: $id, deleteAllAssociatedMetafields: true) {
            deletedDefinitionId
            userErrors { field message }
          }
        }`,
        {
          variables: { id: existingDefId },
        },
      );
      const deleteData = await deleteResult.json();
      if (deleteData?.data?.metafieldDefinitionDelete?.userErrors?.length) {
        console.error("Failed to delete metafield definition:", JSON.stringify(deleteData.data.metafieldDefinitionDelete.userErrors, null, 2));
      }
    }
  },

  /**
   * Ensure the `avd:terms_settings` metafield definition exists.
   */
  async ensureDefinitionsExist(admin) {
    await ensureMetafieldDefinition(admin, {
      namespace: "avd",
      key: "terms_settings",
      name: "Terms and Conditions Settings",
      type: "json",
      description: "Configuration for terms and conditions checkbox"
    });
  },
};
