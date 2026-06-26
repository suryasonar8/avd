import db from "../db.server";

/**
 * PopupService — encapsulates all popup CRUD, translation, and Shopify sync logic.
 */
export const PopupService = {
    // ─── CRUD ───────────────────────────────────────────────

    /**
     * Get all popups for a shop.
     */
    async getPopups(shop) {
        const popups = await db.popup.findMany({
            where: { shop },
            orderBy: { createdAt: "desc" },
        });
        return popups.map((p) => ({
            id: p.id,
            name: p.name,
            status: p.isActive ? "Enabled" : "Disabled",
            method: JSON.parse(p.config).method || "No input",
        }));
    },

    /**
     * Get a single popup by popupId, mapped to the UI format.
     */
    async getPopup(shop, id) {
        const p = await db.popup.findUnique({ where: { id: parseInt(id) } });
        if (!p || p.shop !== shop) return null;

        const config = JSON.parse(p.config);
        return {
            ...config,
            id: p.id,
            status: p.isActive ? "Enabled" : "Disabled",
        };
    },

    /**
     * Create a new popup. Returns the created popup record.
     */
    async createPopup(shop, config) {
        const { status, ...configWithoutStatus } = config;

        const popup = await db.popup.create({
            data: {
                shop,
                name: config.name || "Untitled Popup",
                config: JSON.stringify(configWithoutStatus),
                isActive: false,
            },
        });
        return popup;
    },

    /**
     * Update an existing popup's config.
     */
    async savePopup(shop, id, config) {
        const existing = await db.popup.findUnique({ where: { id: parseInt(id) } });
        if (!existing || existing.shop !== shop) {
            return { success: false, error: "Popup not found" };
        }

        const { status, ...configWithoutStatus } = config;

        await db.popup.update({
            where: { id: parseInt(id) },
            data: {
                name: config.name || existing.name,
                config: JSON.stringify(configWithoutStatus),
            },
        });
        return { success: true };
    },

    /**
     * Delete a popup and clear the Shopify metafield if it was active.
     */
    async deletePopup(admin, shop, id) {
        const existing = await db.popup.findUnique({ where: { id: parseInt(id) } });
        if (!existing || existing.shop !== shop) return { success: false };

        const wasActive = existing.isActive;

        await db.popup.delete({ where: { id: parseInt(id) } });

        // If it was active, clear the Shopify metafield
        if (wasActive) {
            await this._clearActiveMetafield(admin);
        }
        return { success: true };
    },

    // ─── ACTIVE STATE ───────────────────────────────────────

    /**
     * Toggle a popup's active state.
     * Ensures only one popup is active at a time per shop.
     * Syncs the active popup config to the Shopify metafield.
     */
    async toggleActive(admin, shop, id, isActive) {
        const targetId = parseInt(id);
        if (isActive) {
            // Deactivate all other popups for this shop
            await db.popup.updateMany({
                where: { shop, isActive: true },
                data: { isActive: false },
            });

            // Activate the target popup
            await db.popup.update({
                where: { id: targetId },
                data: { isActive: true },
            });

            // Sync to Shopify
            const popup = await db.popup.findUnique({
                where: { id: targetId },
                include: { translations: true },
            });
            await this.syncToShopify(admin, shop, popup);
        } else {
            // Deactivate
            await db.popup.update({
                where: { id: targetId },
                data: { isActive: false },
            });

            // Clear the Shopify metafield
            await this._clearActiveMetafield(admin);
        }

        return { success: true };
    },

    // ─── SHOPIFY SYNC ───────────────────────────────────────

    /**
     * Publish the active popup's config + translations as a JSON metafield.
     */
    async syncToShopify(admin, shop, popup) {
        await this.ensureDefinitionsExist(admin);

        const config = JSON.parse(popup.config);

        // Merge translations into the config
        if (popup.translations && popup.translations.length > 0) {
            const translationsMap = {};
            for (const t of popup.translations) {
                const entry = {};
                if (t.heading) entry.heading = t.heading;
                if (t.subheading) entry.subheading = t.subheading;
                if (t.submitLabel) entry.submitLabel = t.submitLabel;
                if (t.cancelLabel) entry.cancelLabel = t.cancelLabel;
                if (t.submitErrorMsg) entry.submitErrorMsg = t.submitErrorMsg;
                if (t.cancelErrorMsg) entry.cancelErrorMsg = t.cancelErrorMsg;
                if (t.months) {
                    try {
                        entry.months = JSON.parse(t.months);
                    } catch {
                        entry.months = t.months;
                    }
                }
                translationsMap[t.locale] = entry;
            }
            config.translations = translationsMap;
        }

        const shopResponse = await admin.graphql(`{ shop { id } }`);
        const shopId = (await shopResponse.json()).data.shop.id;

        const result = await admin.graphql(
            `#graphql
      mutation updateActive($metafields: [MetafieldsSetInput!]!) {
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
                            key: "active_popup",
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
        return { success: true };
    },

    /**
     * Ensure the `avd:active_popup` metafield definition exists as JSON type.
     */
    async ensureDefinitionsExist(admin) {
        const defCheck = await admin.graphql(
            `#graphql
      query {
        metafieldDefinitions(
          first: 1,
          ownerType: SHOP,
          namespace: "avd",
          key: "active_popup"
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
            name: "Active Popup"
            namespace: "avd"
            key: "active_popup"
            type: "json"
            description: "JSON config of the currently active popup"
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
        } else if (existingDef.type?.name !== "json") {
            // Definition exists but wrong type — need to delete and recreate
            console.warn(
                `Metafield definition avd:active_popup has type "${existingDef.type?.name}", expected "json". ` +
                "You may need to manually delete the old definition in Shopify admin.",
            );
        }
    },

    /**
     * Clear the active_popup metafield from the shop.
     */
    async _clearActiveMetafield(admin) {
        const shopResponse = await admin.graphql(`{ shop { id } }`);
        const shopId = (await shopResponse.json()).data.shop.id;

        await admin.graphql(
            `#graphql
      mutation deleteActive($metafields: [MetafieldIdentifierInput!]!) {
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
                            key: "active_popup",
                        },
                    ],
                },
            },
        );
    },

    // ─── TRANSLATIONS ───────────────────────────────────────

    /**
     * Get all translations for a popup (by DB row id).
     */
    async getTranslations(popupDbId) {
        return db.translation.findMany({
            where: { popupId: popupDbId },
        });
    },

    /**
     * Get all translations for a popup by its DB id.
     */
    async getTranslationsByPopupId(id) {
        return db.translation.findMany({
            where: { popupId: parseInt(id) },
        });
    },

    /**
     * Upsert a translation for a popup.
     */
    async saveTranslation(id, locale, data) {
        const popupId = parseInt(id);
        const existing = await db.popup.findUnique({ where: { id: popupId } });
        if (!existing) return { success: false, error: "Popup not found" };

        await db.translation.upsert({
            where: {
                popupId_locale: {
                    popupId,
                    locale,
                },
            },
            update: {
                heading: data.heading || null,
                subheading: data.subheading || null,
                submitLabel: data.submitLabel || null,
                cancelLabel: data.cancelLabel || null,
                submitErrorMsg: data.submitErrorMsg || null,
                cancelErrorMsg: data.cancelErrorMsg || null,
                months: data.months ? JSON.stringify(data.months) : null,
            },
            create: {
                popupId,
                locale,
                heading: data.heading || null,
                subheading: data.subheading || null,
                submitLabel: data.submitLabel || null,
                cancelLabel: data.cancelLabel || null,
                submitErrorMsg: data.submitErrorMsg || null,
                cancelErrorMsg: data.cancelErrorMsg || null,
                months: data.months ? JSON.stringify(data.months) : null,
            },
        });

        return { success: true };
    },

    /**
     * Get all translated locales for a shop (across all popups).
     */
    async getTranslatedLocales(shop) {
        const popups = await db.popup.findMany({
            where: { shop },
            include: { translations: true },
        });

        const localeMap = {};
        for (const popup of popups) {
            for (const t of popup.translations) {
                if (!localeMap[t.locale]) {
                    localeMap[t.locale] = [];
                }
                localeMap[t.locale].push({
                    id: popup.id,
                    handle: popup.id,
                    name: popup.name,
                });
            }
        }

        return Object.entries(localeMap).map(([locale, popupList]) => ({
            locale,
            popups: popupList,
        }));
    },

    /**
     * Count distinct translated locales for a shop (for limit checking).
     */
    async countTranslatedLocales(shop) {
        const popups = await db.popup.findMany({
            where: { shop },
            select: { id: true },
        });
        if (popups.length === 0) return 0;

        const translations = await db.translation.findMany({
            where: {
                popupId: { in: popups.map((p) => p.id) },
            },
            select: { locale: true },
            distinct: ["locale"],
        });
        return translations.length;
    },

    /**
     * Check if a translation already exists for a given locale+shop combo.
     */
    async hasTranslationForLocale(shop, locale) {
        const popups = await db.popup.findMany({
            where: { shop },
            select: { id: true },
        });
        if (popups.length === 0) return false;

        const count = await db.translation.count({
            where: {
                popupId: { in: popups.map((p) => p.id) },
                locale,
            },
        });
        return count > 0;
    },

    /**
     * Get popup count for a shop (for limit checks).
     */
    async getPopupCount(shop) {
        return db.popup.count({ where: { shop } });
    },

    /**
     * Get all popups for a shop in full detail (for translation routes).
     */
    async getPopupsForTranslation(shop) {
        const popups = await db.popup.findMany({
            where: { shop },
            orderBy: { createdAt: "desc" },
        });
        return popups.map((p) => ({
            id: p.id,
            handle: p.id,
            popup_id: p.id,
            config: JSON.parse(p.config),
        }));
    },
};
