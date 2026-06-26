import db from "../db.server";

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
        await this.ensureDefinitionsExist(admin);

        const shopResponse = await admin.graphql(`{ shop { id } }`);
        const shopId = (await shopResponse.json()).data.shop.id;

        if (config.status === "enabled") {
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
                                namespace: "avd",
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
            await admin.graphql(
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
                                namespace: "avd",
                                key: "checkout_banner",
                            },
                        ],
                    },
                },
            );
        }

        return { success: true };
    },

    /**
     * Ensure the `avd:checkout_banner` metafield definition exists.
     */
    async ensureDefinitionsExist(admin) {
        const defCheck = await admin.graphql(
            `#graphql
      query {
        metafieldDefinitions(
          first: 1,
          ownerType: SHOP,
          namespace: "avd",
          key: "checkout_banner"
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
        const existingDef = defData?.data?.metafieldDefinitions?.edges?.[0]?.node;

        if (!existingDef) {
            // Create the definition
            const defCreate = await admin.graphql(
                `#graphql
        mutation {
          metafieldDefinitionCreate(definition: {
            name: "Checkout Banner"
            namespace: "avd"
            key: "checkout_banner"
            type: "json"
            description: "Configuration for the checkout age verification banner"
            ownerType: SHOP
          }) {
            createdDefinition { id }
            userErrors { field message }
          }
        }`,
            );
            const defCreateData = await defCreate.json();
            if (defCreateData?.data?.metafieldDefinitionCreate?.userErrors?.length) {
                console.error(
                    "Metafield definition creation failed:",
                    JSON.stringify(
                        defCreateData.data.metafieldDefinitionCreate.userErrors,
                        null,
                        2,
                    ),
                );
            }
        }
    },
};
