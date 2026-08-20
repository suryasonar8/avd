import db from "../db.server";
import { PLANS, FEATURES, LIMITS, PLAN_TYPES } from "../constants/features";
import { DEFAULT_STORE_CONFIG } from "../constants/store-verification";
import { DEFAULT_CHECKOUT_CONFIG } from "../constants/checkout-verification";
import { DEFAULT_TERMS_CONFIG } from "../constants/terms-and-conditions";
import { PopupService } from "./popup.service";
import { CheckoutBannerService } from "./checkout-banner.service";
import { TermsService } from "./terms.service";
import { ShopService } from "./shop.service";
import { ensureMetafieldDefinition } from "../utils/metafield.server";

/**
 * Get the current plan for a shop.
 * Strategy: DB cache first → Shopify API fallback → auto-cache.
 *
 * TODO: When billing is wired up, uncomment the Shopify API fallback
 * and import the subscription-to-plan mapping from billing.service.js.
 */
export async function getShopPlan(admin, shop) {
    // 1. Try DB cache first (fast, no API call)
    // const cached = await db.shopPlan.findUnique({ where: { shop } });
    // if (cached) return cached.plan;

    // 2. No cache — default to DEFAULT_PLAN
    //    (Will be replaced with Shopify billing API query later)
    const plan = PLAN_TYPES.PREMIUM;

    // 3. Cache in DB for next time
    await db.shopPlan.upsert({
        where: { shop },
        update: { plan },
        create: { shop, plan },
    });
    const cached = await db.shopPlan.findUnique({ where: { shop } });
    if (cached) return cached.plan;


    return plan;
}

/**
 * Check if a plan level satisfies the requirement for a feature.
 */
export function hasAccess(currentPlan, featureKey) {
    const requiredPlan = FEATURES[featureKey];
    if (!requiredPlan) return true; // Feature not gated
    return PLANS[currentPlan] >= PLANS[requiredPlan];
}

/**
 * Build a map of { featureKey: boolean } for all features.
 * Passed to the frontend so components can check access without prop-drilling.
 */
export function buildAccessMap(currentPlan) {
    const map = {};
    for (const key of Object.keys(FEATURES)) {
        map[key] = hasAccess(currentPlan, key);
    }
    return map;
}

/**
 * PlanService object for named access in backend routes.
 */
export const PlanService = {
    getShopPlan,
    buildAccessMap,

    /**
     * Sync computed feature-access booleans to the avd.entitlements metafield
     * so theme app extensions can gate features without duplicating plan-tier
     * comparison logic in Liquid. `features.js` stays the single source of
     * truth for which plan unlocks what.
     *
     * TODO: once billing is wired up, also call this from the
     * APP_SUBSCRIPTIONS_UPDATE webhook handler so entitlements update
     * immediately on upgrade/downgrade instead of waiting for the next
     * admin page load to pick up the drift.
     */
    async syncEntitlements(admin, shopId, access) {
        await ensureMetafieldDefinition(admin, {
            namespace: "$app:avd",
            key: "entitlements",
            name: "Plan Entitlements",
            type: "json",
            description: "Computed feature-access booleans for the shop's current plan, consumed by theme app extensions",
        });

        // Boolean mirror of access["terms.condition.status"], read by Liquid's
        // `available_if` to hide the Terms & Conditions app block from the
        // theme editor's block picker on non-premium plans. `available_if`
        // reads app-data metafields (owned by the AppInstallation, via the
        // `app` object in Liquid) — a different store from the `$app:avd`
        // shop-resource metafields used above, so this needs its own owner
        // ID and a plain (non-reserved) namespace.
        const appInstallationId = await ShopService.getAppInstallationId(admin);
        await ShopService.updateMetafield(
            admin,
            appInstallationId,
            "avd",
            "terms_available",
            String(!!access["terms.condition.status"]),
            "boolean"
        );

        return ShopService.updateMetafield(
            admin,
            shopId,
            "$app:avd",
            "entitlements",
            JSON.stringify(access)
        );
    },

    async hasAccess(shop, featureKey) {
        // 1. Get the plan (will use DB cache if available)
        const plan = await getShopPlan(null, shop);
        // 2. Check access using the standalone function
        return hasAccess(plan, featureKey);
    },

    /**
     * Get the maximum number of languages allowed for a plan.
     */
    getTranslationLimit(plan) {
        return LIMITS.translation[plan] || 1;
    },

    /**
     * Get the maximum number of popups allowed for a plan.
     */
    getPopupLimit(plan) {
        return LIMITS.popups[plan] || 1;
    },


    /**
     * Validate a popup configuration against the shop's plan.
     * Enforces limits by reverting restricted fields to defaults.
     * Returns { isValid: true, sanitized: object }
     */
    async validatePopupConfig(shop, config) {
        const plan = await getShopPlan(null, shop);
        const sanitized = { ...config };

        const enforce = (featureKey, condition, resetFn) => {
            if (condition && !hasAccess(plan, featureKey)) {
                resetFn();
            }
        };

        // 1. Info Tab checks
        enforce("sv.info.pages.home", sanitized.pages === "Home page", () => sanitized.pages = DEFAULT_STORE_CONFIG.pages);
        enforce("sv.info.pages.collections", sanitized.pages === "Specific collections", () => sanitized.pages = DEFAULT_STORE_CONFIG.pages);
        enforce("sv.info.pages.products", sanitized.pages === "Specific products", () => sanitized.pages = DEFAULT_STORE_CONFIG.pages);
        enforce("sv.info.pages.custom", sanitized.pages === "Custom", () => sanitized.pages = DEFAULT_STORE_CONFIG.pages);
        enforce("sv.info.trigger.logged", sanitized.trigger === "Logged customers", () => sanitized.trigger = DEFAULT_STORE_CONFIG.trigger);

        // 2. Background Tab checks
        if (sanitized.background) {
            sanitized.background = { ...sanitized.background };
            enforce("sv.bg.color", sanitized.background.bgColor && sanitized.background.bgColor !== DEFAULT_STORE_CONFIG.background.bgColor, () => sanitized.background.bgColor = DEFAULT_STORE_CONFIG.background.bgColor);
            enforce("sv.bg.logo", !!sanitized.background.logo, () => sanitized.background.logo = DEFAULT_STORE_CONFIG.background.logo);
            enforce("sv.bg.border-color", !!sanitized.background.borderColor && sanitized.background.borderColor !== DEFAULT_STORE_CONFIG.background.borderColor, () => sanitized.background.borderColor = DEFAULT_STORE_CONFIG.background.borderColor);
            enforce("sv.bg.border-radius", sanitized.background.borderRadius > 0, () => sanitized.background.borderRadius = DEFAULT_STORE_CONFIG.background.borderRadius);
            enforce("sv.bg.border-width", sanitized.background.borderWidth > 0, () => sanitized.background.borderWidth = DEFAULT_STORE_CONFIG.background.borderWidth);
        }

        // 3. Button Tab checks
        if (sanitized.button) {
            sanitized.button = { ...sanitized.button };
            enforce("sv.btn.bg", sanitized.button.bgColor && sanitized.button.bgColor !== DEFAULT_STORE_CONFIG.button.bgColor, () => sanitized.button.bgColor = DEFAULT_STORE_CONFIG.button.bgColor);
            enforce("sv.cbtn.bg", sanitized.button.cancelBgColor && sanitized.button.cancelBgColor !== DEFAULT_STORE_CONFIG.button.cancelBgColor, () => sanitized.button.cancelBgColor = DEFAULT_STORE_CONFIG.button.cancelBgColor);
            enforce("sv.btn.border-color", !!sanitized.button.borderColor && sanitized.button.borderColor !== DEFAULT_STORE_CONFIG.button.borderColor, () => sanitized.button.borderColor = DEFAULT_STORE_CONFIG.button.borderColor);
            enforce("sv.cbtn.border-color", !!sanitized.button.cancelBorderColor && sanitized.button.cancelBorderColor !== DEFAULT_STORE_CONFIG.button.cancelBorderColor, () => sanitized.button.cancelBorderColor = DEFAULT_STORE_CONFIG.button.cancelBorderColor);
            enforce("sv.btn.border-radius", sanitized.button.borderRadius > 0, () => sanitized.button.borderRadius = DEFAULT_STORE_CONFIG.button.borderRadius);
            enforce("sv.cbtn.border-radius", sanitized.button.cancelBorderRadius > 0, () => sanitized.button.cancelBorderRadius = DEFAULT_STORE_CONFIG.button.cancelBorderRadius);
            enforce("sv.btn.border-width", sanitized.button.borderWidth > 0, () => sanitized.button.borderWidth = DEFAULT_STORE_CONFIG.button.borderWidth);
            enforce("sv.cbtn.border-width", sanitized.button.cancelBorderWidth > 0, () => sanitized.button.cancelBorderWidth = DEFAULT_STORE_CONFIG.button.cancelBorderWidth);
        }

        // 4. CSS Tab checks
        enforce("sv.css.input", !!sanitized.css, () => sanitized.css = DEFAULT_STORE_CONFIG.css);

        return {
            isValid: true,
            errors: [],
            sanitized
        };
    },

    /**
     * Validate checkout verification config.
     */
    async validateCheckoutConfig(shop, config) {
        const plan = await getShopPlan(null, shop);
        const sanitized = { ...config };

        const enforce = (featureKey, condition, resetFn) => {
            if (condition && !hasAccess(plan, featureKey)) {
                resetFn();
            }
        };

        enforce("checkout.condition.status", sanitized.status === "enabled", () => sanitized.status = DEFAULT_CHECKOUT_CONFIG.status);
        enforce("checkout.condition.target", sanitized.target && sanitized.target !== DEFAULT_CHECKOUT_CONFIG.target, () => sanitized.target = DEFAULT_CHECKOUT_CONFIG.target);
        enforce("checkout.banner.heading", !!sanitized.heading && sanitized.heading !== DEFAULT_CHECKOUT_CONFIG.heading, () => sanitized.heading = DEFAULT_CHECKOUT_CONFIG.heading);

        return { isValid: true, errors: [], sanitized };
    },

    /**
     * Validate terms & conditions (translation) config.
     */
    async validateTermsConfig(shop, config) {
        const plan = await getShopPlan(null, shop);
        const sanitized = { ...config };

        const enforce = (featureKey, condition, resetFn) => {
            if (condition && !hasAccess(plan, featureKey)) {
                resetFn();
            }
        };

        enforce("terms.condition.status", sanitized.enabled === true, () => sanitized.enabled = DEFAULT_TERMS_CONFIG.enabled);
        enforce("terms.condition.pages", sanitized.displayPages?.length > 0, () => sanitized.displayPages = DEFAULT_TERMS_CONFIG.displayPages);
        enforce("terms.condition.trigger", !!sanitized.triggerCondition && sanitized.triggerCondition !== DEFAULT_TERMS_CONFIG.triggerCondition, () => sanitized.triggerCondition = DEFAULT_TERMS_CONFIG.triggerCondition);
        enforce("terms.checkbox.text", !!sanitized.checkboxText && sanitized.checkboxText !== DEFAULT_TERMS_CONFIG.checkboxText, () => sanitized.checkboxText = DEFAULT_TERMS_CONFIG.checkboxText);
        enforce("terms.checkbox.keyword", !!sanitized.keyword && sanitized.keyword !== DEFAULT_TERMS_CONFIG.keyword, () => sanitized.keyword = DEFAULT_TERMS_CONFIG.keyword);
        enforce("terms.checkbox.link", !!sanitized.link && sanitized.link !== DEFAULT_TERMS_CONFIG.link, () => sanitized.link = DEFAULT_TERMS_CONFIG.link);
        enforce("terms.checkbox.size", !!sanitized.size && sanitized.size !== DEFAULT_TERMS_CONFIG.size, () => sanitized.size = DEFAULT_TERMS_CONFIG.size);
        enforce("terms.checkbox.color", !!sanitized.color && sanitized.color !== DEFAULT_TERMS_CONFIG.color, () => sanitized.color = DEFAULT_TERMS_CONFIG.color);
        enforce("terms.checkbox.error", !!sanitized.errorMessage && sanitized.errorMessage !== DEFAULT_TERMS_CONFIG.errorMessage, () => sanitized.errorMessage = DEFAULT_TERMS_CONFIG.errorMessage);

        return { isValid: true, errors: [], sanitized };
    },

    /**
     * Validate checkout terms & conditions config — status and trigger
     * condition only. The checkbox's message/color/keyword/link/error live in
     * the Checkout Editor's native block settings (not this app's DB), so
     * there's nothing else here to gate server-side.
     */
    async validateCheckoutTermsConfig(shop, config) {
        const plan = await getShopPlan(null, shop);
        const sanitized = { ...config, checkout: { ...config.checkout } };

        const enforce = (featureKey, condition, resetFn) => {
            if (condition && !hasAccess(plan, featureKey)) {
                resetFn();
            }
        };

        enforce(
            "terms.checkout.status",
            sanitized.checkout.enabled === true,
            () => sanitized.checkout.enabled = DEFAULT_TERMS_CONFIG.checkout.enabled,
        );
        enforce(
            "terms.checkout.trigger",
            !!sanitized.checkout.triggerCondition && sanitized.checkout.triggerCondition !== DEFAULT_TERMS_CONFIG.checkout.triggerCondition,
            () => sanitized.checkout.triggerCondition = DEFAULT_TERMS_CONFIG.checkout.triggerCondition,
        );

        return { isValid: true, errors: [], sanitized };
    },

    /**
     * Enforce plan limits on all gated features.
     * Sanitizes and re-saves configurations if they exceed current plan limits.
     */
    async enforcePlanLimits(admin, shop) {
        // 1. Popups
        const activePopups = await db.popup.findMany({ where: { shop, isActive: true } });
        for (const popup of activePopups) {
            const config = JSON.parse(popup.config);
            const { sanitized } = await this.validatePopupConfig(shop, config);
            if (JSON.stringify(config) !== JSON.stringify(sanitized)) {
                await PopupService.savePopup(shop, popup.id, sanitized);
                const updatedPopup = await db.popup.findUnique({
                    where: { id: popup.id },
                    include: { translations: true },
                });
                await PopupService.syncToShopify(admin, shop, updatedPopup);
            }
        }

        // 2. Checkout Banner
        const checkoutBanner = await CheckoutBannerService.getBanner(shop);
        if (checkoutBanner) {
            const { id, ...configOnly } = checkoutBanner;
            const { sanitized } = await this.validateCheckoutConfig(shop, configOnly);
            if (JSON.stringify(configOnly) !== JSON.stringify(sanitized)) {
                await CheckoutBannerService.saveBanner(admin, shop, sanitized);
            }
        }

        // 3. Terms & Conditions (product/cart + checkout placements)
        const termsSettings = await TermsService.getSettings(shop);
        if (termsSettings) {
            const { id, ...configOnly } = termsSettings;
            const { sanitized: afterConditionCheck } = await this.validateTermsConfig(shop, configOnly);
            const { sanitized } = await this.validateCheckoutTermsConfig(shop, afterConditionCheck);
            if (JSON.stringify(configOnly) !== JSON.stringify(sanitized)) {
                await TermsService.saveSettings(admin, shop, sanitized);
            }
        }
    }
};
