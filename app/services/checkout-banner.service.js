import db from "../db.server";
import { ensureMetafieldDefinition } from "../utils/metafield.server";

/**
 * CheckoutBannerService — encapsulates all checkout banner CRUD and Shopify sync logic.
 */
export const CheckoutBannerService = {
    /**
     * Get the checkout banner for a shop.
     */
    async getBanner(shop) {
        const banner = await db.checkoutBanner.findUnique({
            where: { shop },
        });

        if (!banner) return null;

        return {
            ...JSON.parse(banner.config),
            id: banner.id,
        };
    },

    /**
     * Save the checkout banner and sync to Shopify.
     */
    async saveBanner(admin, shop, config) {
        // 1. Update/Create in DB
        const banner = await db.checkoutBanner.upsert({
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
        await this.syncToShopify(admin, shop, { ...config, id: banner.id });

        return banner;
    },

    /**
     * Publish the checkout banner config as a JSON metafield.
     * If status is disabled, deletes the metafield value.
     */
    async syncToShopify(admin, shop, config) {
        const shopResponse = await admin.graphql(`{ shop { id } }`);
        const shopId = (await shopResponse.json()).data.shop.id;

        if (config.status === "enabled") {
            await this.ensureDefinitionsExist(admin);

            // Upsert Metafield Value
            const result = await admin.graphql(
                `#graphql
        mutation updateBanner($metafields: [MetafieldsSetInput!]!) {
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
                                key: "checkout_banner",
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
            // Delete Metafield Value but NOT Definition
            const deleteResult = await admin.graphql(
                `#graphql
        mutation deleteBanner($metafields: [MetafieldIdentifierInput!]!) {
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
                                key: "checkout_banner",
                            },
                        ],
                    },
                },
            );

            const deleteData = await deleteResult.json();
            const deleteErrors = deleteData?.data?.metafieldsDelete?.userErrors;
            if (deleteErrors && deleteErrors.length > 0) {
                console.error("Failed to delete checkout banner metafield:", JSON.stringify(deleteErrors, null, 2));
                return { success: false, errors: deleteErrors };
            }
        }

        return { success: true };
    },

    /**
     * Ensure the `avd:checkout_banner` metafield definition exists.
     */
    async ensureDefinitionsExist(admin) {
        await ensureMetafieldDefinition(admin, {
            namespace: "$app:avd",
            key: "checkout_banner",
            name: "Checkout Banner",
            type: "json",
            description: "Configuration for the checkout age verification banner"
        });
    },
};
