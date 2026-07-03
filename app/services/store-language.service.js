/**
 * StoreLanguageService — handles fetching available languages for the Shopify store.
 */
export const StoreLanguageService = {
  /**
   * Get store languages (locales).
   */
  async getStoreLanguages(admin) {
    const response = await admin.graphql(
      `#graphql
      query getLanguages {
        shopLocales {
          locale
          name
          primary
          published
        }
      }`
    );
    const data = await response.json();
    return data.data?.shopLocales || [];
  }
};
