import db from "../db.server";
import { PLANS, FEATURES, LIMITS } from "../constants/features";

/**
 * Get the current plan for a shop.
 * Strategy: DB cache first → Shopify API fallback → auto-cache.
 *
 * TODO: When billing is wired up, uncomment the Shopify API fallback
 * and import the subscription-to-plan mapping from billing.service.js.
 */
export async function getShopPlan(admin, shop) {
    // 1. Try DB cache first (fast, no API call)
    const cached = await db.shopPlan.findUnique({ where: { shop } });
    if (cached) return cached.plan;

    // 2. No cache — default to "free"
    //    (Will be replaced with Shopify billing API query later)
    const plan = "free";

    // 3. Cache in DB for next time
    await db.shopPlan.upsert({
        where: { shop },
        update: { plan },
        create: { shop, plan },
    });

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
     * Returns { isValid: boolean, errors: string[] }
     */
    async validatePopupConfig(shop, config) {
        const plan = await getShopPlan(null, shop);
        const errors = [];

        const check = (featureKey, condition, message) => {
            if (condition && !hasAccess(plan, featureKey)) {
                errors.push(message || `Feature '${featureKey}' requires a higher plan.`);
            }
        };

        // 1. Info Tab checks
        check("sv.info.pages.home", config.pages === "Home page", "Home page restriction requires a Basic plan.");
        check("sv.info.pages.collections", config.pages === "Specific collections", "Collection restriction requires a Basic plan.");
        check("sv.info.pages.products", config.pages === "Specific products", "Product restriction requires a Basic plan.");
        check("sv.info.pages.custom", config.pages === "Custom", "Custom URL restriction requires a Basic plan.");
        check("sv.info.trigger.logged", config.trigger === "Logged customers", "Logged-in customer trigger requires a Basic plan.");

        // 2. Background Tab checks
        if (config.background) {
            check("sv.bg.color", config.background.bgColor && config.background.bgColor !== "#FFFFFF", "Custom background color requires a Basic plan.");
            check("sv.bg.border-color", !!config.background.borderColor, "Custom border color requires a Premium plan.");
            check("sv.bg.border-radius", config.background.borderRadius > 0, "Custom border radius requires a Premium plan.");
            check("sv.bg.border-width", config.background.borderWidth > 0, "Custom border width requires a Premium plan.");
        }

        if (config.button) {
            check("sv.btn.bg", config.button.bgColor && config.button.bgColor !== "#000000", "Custom button background requires a Basic plan.");
            check("sv.cbtn.bg", config.button.cancelBgColor && config.button.cancelBgColor !== "#FFFFFF", "Custom cancel button background requires a Basic plan.");
            check("sv.btn.border-color", !!config.button.borderColor, "Custom button border color requires a Premium plan.");
            check("sv.cbtn.border-color", !!config.button.cancelBorderColor, "Custom cancel button border color requires a Premium plan.");
            check("sv.btn.border-radius", config.button.borderRadius > 0, "Custom button border radius requires a Premium plan.");
            check("sv.cbtn.border-radius", config.button.cancelBorderRadius > 0, "Custom cancel button border radius requires a Premium plan.");
            check("sv.btn.border-width", config.button.borderWidth > 0, "Custom button border width requires a Premium plan.");
            check("sv.cbtn.border-width", config.button.cancelBorderWidth > 0, "Custom cancel button border width requires a Premium plan.");
        }

        // 4. CSS Tab checks
        check("sv.css.input", !!config.css, "Custom CSS requires a Premium plan.");

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate checkout verification config.
     */
    async validateCheckoutConfig(shop, config) {
        const plan = await getShopPlan(null, shop);
        const errors = [];
        const check = (featureKey, condition, message) => {
            if (condition && !hasAccess(plan, featureKey)) {
                errors.push(message);
            }
        };

        check("checkout.condition.status", config.status === "enabled", "Enabling checkout banner requires a Basic plan.");
        check("checkout.condition.target", config.target && config.target !== "always", "Conditional target requires a Basic plan.");
        check("checkout.banner.heading", !!config.heading, "Banner heading customization requires a Basic plan.");

        return { isValid: errors.length === 0, errors };
    },

    /**
     * Validate terms & conditions (translation) config.
     */
    async validateTermsConfig(shop, config) {
        const plan = await getShopPlan(null, shop);
        const errors = [];
        const check = (featureKey, condition, message) => {
            if (condition && !hasAccess(plan, featureKey)) {
                errors.push(message);
            }
        };

        check("terms.condition.status", config.enabled === true, "Enabling terms requires a Premium plan.");
        check("terms.condition.pages", config.displayPages?.length > 0, "Selecting display pages requires a Premium plan.");
        check("terms.condition.trigger", !!config.triggerCondition, "Trigger condition requires a Premium plan.");
        check("terms.checkbox.text", !!config.checkboxText, "Checkbox text customization requires a Premium plan.");
        check("terms.checkbox.keyword", !!config.keyword, "Keyword customization requires a Premium plan.");
        check("terms.checkbox.link", !!config.link, "Keyword link requires a Premium plan.");
        check("terms.checkbox.size", !!config.size, "Text size customization requires a Premium plan.");
        check("terms.checkbox.color", !!config.color, "Text color customization requires a Premium plan.");
        check("terms.checkbox.error", !!config.errorMessage, "Error message customization requires a Premium plan.");

        return { isValid: errors.length === 0, errors };
    }
};
