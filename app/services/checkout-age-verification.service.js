import db from "../db.server";
import { ensureMetafieldDefinition } from "../utils/metafield.server";
import { DEFAULT_AGE_VERIFICATION_CONFIG } from "../constants/checkout-verification";

/**
 * CheckoutAgeVerificationService — encapsulates checkout age verification
 * CRUD and Shopify sync logic. All fields (status, target, min age, message,
 * error message) live in this app's DB and are synced as a single metafield —
 * unlike checkout-terms, there's no Checkout Editor native settings split
 * here, since every field is configured from this app's admin.
 */
export const CheckoutAgeVerificationService = {
    /**
     * Get the checkout age verification config for a shop.
     */
    async getConfig(shop) {
        const record = await db.checkoutAgeVerification.findUnique({
            where: { shop },
        });

        if (!record) return DEFAULT_AGE_VERIFICATION_CONFIG;

        return {
            ...DEFAULT_AGE_VERIFICATION_CONFIG,
            ...JSON.parse(record.config),
            id: record.id,
        };
    },

    /**
     * Save the checkout age verification config and sync to Shopify.
     */
    async saveConfig(admin, shop, config) {
        const record = await db.checkoutAgeVerification.upsert({
            where: { shop },
            update: {
                config: JSON.stringify(config),
            },
            create: {
                shop,
                config: JSON.stringify(config),
            },
        });

        await this.syncToShopify(admin, shop, { ...config, id: record.id });

        return record;
    },

    /**
     * Publish the checkout age verification config as a JSON metafield.
     * If status is disabled, deletes the metafield value.
     */
    async syncToShopify(admin, shop, config) {
        const shopResponse = await admin.graphql(`{ shop { id } }`);
        const shopId = (await shopResponse.json()).data.shop.id;

        if (config.status === "enabled") {
            await this.ensureDefinitionsExist(admin);

            const result = await admin.graphql(
                `#graphql
        mutation updateCheckoutAgeVerification($metafields: [MetafieldsSetInput!]!) {
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
                                key: "checkout_age_verification",
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
                console.error("Sync checkout age verification to Shopify failed:", JSON.stringify(errors, null, 2));
                return { success: false, errors };
            }
        } else {
            const deleteResult = await admin.graphql(
                `#graphql
        mutation deleteCheckoutAgeVerification($metafields: [MetafieldIdentifierInput!]!) {
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
                                key: "checkout_age_verification",
                            },
                        ],
                    },
                },
            );

            const deleteData = await deleteResult.json();
            const deleteErrors = deleteData?.data?.metafieldsDelete?.userErrors;
            if (deleteErrors && deleteErrors.length > 0) {
                console.error("Failed to delete checkout age verification metafield:", JSON.stringify(deleteErrors, null, 2));
                return { success: false, errors: deleteErrors };
            }
        }

        return { success: true };
    },

    /**
     * Ensure the `avd:checkout_age_verification` metafield definition exists.
     */
    async ensureDefinitionsExist(admin) {
        await ensureMetafieldDefinition(admin, {
            namespace: "$app:avd",
            key: "checkout_age_verification",
            name: "Checkout Age Verification",
            type: "json",
            description: "Configuration for the checkout age verification checkbox",
        });
    },
};
