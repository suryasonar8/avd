import db from "../db.server";
import { ensureMetafieldDefinition } from "../utils/metafield.server";
import { ShopService } from "./shop.service";

export const SettingsService = {
  async getSettings(shop) {
    const settings = await db.appSettings.findUnique({
      where: { shop },
    });
    
    if (!settings) {
      return {
        minAge: 18,
        redirectUrl: "https://www.google.com",
        showBrandMark: true,
        adminLanguage: "English",
        rememberVisitor: "Session only",
        rememberDays: 30,
      };
    }
    
    return {
      minAge: settings.minAge,
      redirectUrl: settings.redirectUrl,
      showBrandMark: settings.showBrandMark,
      adminLanguage: settings.adminLanguage,
      rememberVisitor: settings.rememberVisitor,
      rememberDays: settings.rememberDays,
    };
  },

  async updateSettings(admin, shop, newSettings) {
    // 1. Sync to DB
    const dbUpdateData = {};
    if (newSettings.minAge !== undefined) dbUpdateData.minAge = parseInt(newSettings.minAge, 10);
    if (newSettings.redirectUrl !== undefined) dbUpdateData.redirectUrl = newSettings.redirectUrl;
    if (newSettings.showBrandMark !== undefined) dbUpdateData.showBrandMark = newSettings.showBrandMark;
    if (newSettings.adminLanguage !== undefined) dbUpdateData.adminLanguage = newSettings.adminLanguage;
    if (newSettings.rememberVisitor !== undefined) dbUpdateData.rememberVisitor = newSettings.rememberVisitor;
    if (newSettings.rememberDays !== undefined) dbUpdateData.rememberDays = parseInt(newSettings.rememberDays, 10);

    if (Object.keys(dbUpdateData).length > 0) {
      await db.appSettings.upsert({
        where: { shop },
        update: dbUpdateData,
        create: { 
          shop,
          minAge: dbUpdateData.minAge ?? 18,
          redirectUrl: dbUpdateData.redirectUrl ?? "https://www.google.com",
          showBrandMark: dbUpdateData.showBrandMark ?? true,
          adminLanguage: dbUpdateData.adminLanguage ?? "English",
          rememberVisitor: dbUpdateData.rememberVisitor ?? "Session only",
          rememberDays: dbUpdateData.rememberDays ?? 30,
        }
      });
    }

    // 2. Sync to Shopify Metafields
    const shopResponse = await admin.graphql(`{ shop { id } }`);
    const shopId = (await shopResponse.json()).data.shop.id;

    // Ensure definitions exist
    await this.ensureDefinitionsExist(admin);

    // Merge onto the existing metafield value instead of overwriting it wholesale,
    // since other parts of the app (appStatus, tested, plan) store fields in the
    // same metafield that aren't tracked by SettingsService.
    const existing = await ShopService.getMetafield(admin, "avd", "settings");
    const existingValue = existing?.metafield?.value;
    const existingSettings = existingValue ? JSON.parse(existingValue) : {};
    const mergedSettings = { ...existingSettings, ...newSettings };

    const result = await admin.graphql(
      `#graphql
      mutation updateSettings($metafields: [MetafieldsSetInput!]!) {
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
              key: "settings",
              type: "json",
              ownerId: shopId,
              value: JSON.stringify(mergedSettings),
            },
          ],
        },
      },
    );

    const data = await result.json();
    const errors = data?.data?.metafieldsSet?.userErrors;
    if (errors && errors.length > 0) {
      console.error("Sync Settings to Shopify failed:", JSON.stringify(errors, null, 2));
      return { success: false, errors };
    }
    return { success: true };
  },

  async ensureDefinitionsExist(admin) {
    await ensureMetafieldDefinition(admin, {
      namespace: "avd",
      key: "settings",
      name: "App Settings",
      type: "json",
      description: "General configuration for the age verification app"
    });
  }
};
