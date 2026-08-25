/**
 * ShopService — handles general shop queries and metafield operations.
 */
export const ShopService = {
  /**
   * Get the shop ID.
   */
  async getShopId(admin) {
    const shopResponse = await admin.graphql(`{ shop { id } }`);
    const shopData = await shopResponse.json();
    return shopData.data.shop.id;
  },

  /**
   * Whether the shop is on a Shopify Plus plan — used to gate the checkout
   * terms & conditions feature, which relies on Checkout Editor placement
   * and Checkout Rules that aren't meaningfully usable outside Plus.
   */
  async isShopifyPlus(admin) {
    const response = await admin.graphql(`{ shop { plan { shopifyPlus } } }`);
    const data = await response.json();
    return !!data.data.shop.plan.shopifyPlus;
  },

  /**
   * Get the shop's distinct product tags — used to populate the
   * "Specific product tags" popup targeting picker.
   */
  async getProductTags(admin) {
    const response = await admin.graphql(
      `#graphql
      query getProductTags {
        productTags(first: 250) {
          edges {
            node
          }
        }
      }`,
    );
    const data = await response.json();
    return data.data.productTags.edges.map((edge) => edge.node);
  },

  /**
   * Get the current app installation ID — the owner ID needed to write
   * app-data metafields (the `app.metafields.*` store read by Liquid's
   * `available_if`), as opposed to `$app:`-namespaced metafields on the
   * shop resource (read via `shop.metafields['$app:...']`).
   */
  async getAppInstallationId(admin) {
    const response = await admin.graphql(`{ currentAppInstallation { id } }`);
    const data = await response.json();
    return data.data.currentAppInstallation.id;
  },

  /**
   * Get shop data along with main theme and a specific metafield setting.
   */
  async getDashboardData(admin) {
    const shopDataResponse = await admin.graphql(
      `#graphql
      query getShopData {
        shop {
          name
          id
          myshopifyDomain
          metafield(namespace: "$app:avd", key: "settings") {
            value
          }
        }
        themes(first: 10, roles: [MAIN]) {
          nodes {
            id
            name
            files(filenames: ["config/settings_data.json"]) {
              nodes {
                filename
                body {
                  ... on OnlineStoreThemeFileBodyText {
                    content
                  }
                }
              }
            }
          }
        }
      }`
    );
    const shopData = await shopDataResponse.json();
    return {
      shop: shopData.data.shop,
      mainTheme: shopData.data.themes.nodes[0],
    };
  },

  /**
   * Get a specific metafield for the shop.
   */
  async getMetafield(admin, namespace, key) {
    const response = await admin.graphql(
      `#graphql
      query getMetafield($namespace: String!, $key: String!) {
        shop {
          id
          metafield(namespace: $namespace, key: $key) {
            value
          }
        }
      }`,
      {
        variables: { namespace, key },
      }
    );
    const data = await response.json();
    return data.data.shop;
  },

  /**
   * Update a specific metafield for the shop.
   */
  async updateMetafield(admin, ownerId, namespace, key, value, type = "json") {
    const response = await admin.graphql(
      `#graphql
      mutation metafieldUpsert($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              namespace,
              key,
              type,
              ownerId,
              value,
            },
          ],
        },
      }
    );
    return response.json();
  },

  /**
   * Delete a metafield definition.
   */
  async deleteMetafieldDefinition(admin, id, deleteAllAssociatedMetafields = false) {
    const response = await admin.graphql(
      `#graphql
      mutation metafieldDefinitionDelete($id: ID!, $deleteAllAssociatedMetafields: Boolean) {
        metafieldDefinitionDelete(id: $id, deleteAllAssociatedMetafields: $deleteAllAssociatedMetafields) {
          deletedDefinitionId
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: { id, deleteAllAssociatedMetafields },
      }
    );
    return response.json();
  },

  /**
   * Get metafield definitions.
   */
  async getMetafieldDefinitions(admin, namespace, key) {
    const response = await admin.graphql(
      `#graphql
      query {
        metafieldDefinitions(
          first: 10,
          ownerType: SHOP,
          namespace: "${namespace}",
          key: "${key}"
        ) {
          edges {
            node {
              id
              name
              key
              namespace
            }
          }
        }
      }`
    );
    return response.json();
  }
};
