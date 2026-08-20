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
   * If enabled is false, clears the metafield value (definition is kept).
   */
  async syncToShopify(admin, shop, config) {
    const shopResponse = await admin.graphql(`{ shop { id } }`);
    const shopId = (await shopResponse.json()).data.shop.id;

    await this.syncCheckoutToShopify(admin, shopId, config.checkout);

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
                namespace: "$app:avd",
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
      const deleteResult = await admin.graphql(
        `#graphql
        mutation deleteTerms($metafields: [MetafieldIdentifierInput!]!) {
          metafieldsDelete(metafields: $metafields) {
            deletedMetafields { key namespace ownerId }
            userErrors { field message }
          }
        }`,
        {
          variables: {
            metafields: [
              {
                ownerId: shopId,
                namespace: "$app:avd",
                key: "terms_settings",
              },
            ],
          },
        },
      );

      const deleteData = await deleteResult.json();
      const deleteErrors = deleteData?.data?.metafieldsDelete?.userErrors;
      if (deleteErrors && deleteErrors.length > 0) {
        console.error("Failed to clear terms settings metafield:", JSON.stringify(deleteErrors, null, 2));
        return { success: false, errors: deleteErrors };
      }
    }

    return { success: true };
  },

  /**
   * Publish the checkout status/trigger condition as their own JSON metafield,
   * separate from `terms_settings`, since the checkout-terms extension reads
   * only this key — the checkbox's message/color/keyword/link/error live in
   * the Checkout Editor's native block settings instead, not here.
   * If disabled, clears the metafield value (definition is kept).
   */
  async syncCheckoutToShopify(admin, shopId, checkoutConfig) {
    if (checkoutConfig?.enabled) {
      await ensureMetafieldDefinition(admin, {
        namespace: "$app:avd",
        key: "checkout_terms_conditions",
        name: "Checkout Terms and Conditions",
        type: "json",
        description: "Status and trigger condition for the checkout terms and conditions checkbox",
      });

      const result = await admin.graphql(
        `#graphql
        mutation updateCheckoutTerms($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields { id }
            userErrors { field message }
          }
        }`,
        {
          variables: {
            metafields: [
              {
                namespace: "$app:avd",
                key: "checkout_terms_conditions",
                type: "json",
                ownerId: shopId,
                value: JSON.stringify(checkoutConfig),
              },
            ],
          },
        },
      );

      const data = await result.json();
      const errors = data?.data?.metafieldsSet?.userErrors;
      if (errors && errors.length > 0) {
        console.error("Sync checkout terms to Shopify failed:", JSON.stringify(errors, null, 2));
        return { success: false, errors };
      }
    } else {
      const deleteResult = await admin.graphql(
        `#graphql
        mutation deleteCheckoutTerms($metafields: [MetafieldIdentifierInput!]!) {
          metafieldsDelete(metafields: $metafields) {
            deletedMetafields { key namespace ownerId }
            userErrors { field message }
          }
        }`,
        {
          variables: {
            metafields: [
              {
                ownerId: shopId,
                namespace: "$app:avd",
                key: "checkout_terms_conditions",
              },
            ],
          },
        },
      );

      const deleteData = await deleteResult.json();
      const deleteErrors = deleteData?.data?.metafieldsDelete?.userErrors;
      if (deleteErrors && deleteErrors.length > 0) {
        console.error("Failed to clear checkout terms metafield:", JSON.stringify(deleteErrors, null, 2));
        return { success: false, errors: deleteErrors };
      }
    }

    return { success: true };
  },

  /**
   * Ensure the `avd:terms_settings` metafield definition exists.
   */
  async ensureDefinitionsExist(admin) {
    await ensureMetafieldDefinition(admin, {
      namespace: "$app:avd",
      key: "terms_settings",
      name: "Terms and Conditions Settings",
      type: "json",
      description: "Configuration for terms and conditions checkbox"
    });
  },
};
