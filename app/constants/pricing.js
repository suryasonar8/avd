import { PLAN_TYPES } from "./features";

/**
 * Feature lists and comparison data for the pricing page.
 * Translation keys reference arrays and objects in en.json under "pricing.*"
 */

// Translation keys for basic plan features
export const BASIC_FEATURE_KEYS = [
    "pricing.basicFeatures.0",
    "pricing.basicFeatures.1",
    "pricing.basicFeatures.2",
    "pricing.basicFeatures.3",
    "pricing.basicFeatures.4",
];

// Translation keys for premium plan features
export const PREMIUM_FEATURE_KEYS = [
    "pricing.premiumFeatures.0",
    "pricing.premiumFeatures.1",
    "pricing.premiumFeatures.2",
    "pricing.premiumFeatures.3",
];

export const COMPARE_FEATURES = [
    {
        featureKey: "pricing.compareFeatures.popup",
        [PLAN_TYPES.FREE]: "1",
        [PLAN_TYPES.BASIC]: "1",
        [PLAN_TYPES.PREMIUM]: "common.unlimited",
    },
    {
        featureKey: "pricing.compareFeatures.popupCustomization",
        [PLAN_TYPES.FREE]: "pricing.compareValues.text",
        [PLAN_TYPES.BASIC]: "pricing.compareValues.textSizeColor",
        [PLAN_TYPES.PREMIUM]: "common.unlimited",
    },
    {
        featureKey: "pricing.compareFeatures.translation",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: "pricing.compareValues.oneLanguage",
        [PLAN_TYPES.PREMIUM]: "common.unlimited",
    },
    {
        featureKey: "pricing.compareFeatures.checkoutVerification",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: "pricing.compareValues.banner",
        [PLAN_TYPES.PREMIUM]: "pricing.compareValues.banner",
    },
    {
        featureKey: "pricing.compareFeatures.css",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.termsAndConditions",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.liveChatSupport",
        [PLAN_TYPES.FREE]: true,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: "pricing.compareValues.vipPriority",
    },
];

// FAQ keys for the pricing page
export const PRICING_FAQ_KEYS = [
    { qKey: "pricing.faqs.q1", aKey: "pricing.faqs.a1" },
    { qKey: "pricing.faqs.q2", aKey: "pricing.faqs.a2" },
    { qKey: "pricing.faqs.q3", aKey: "pricing.faqs.a3" },
    { qKey: "pricing.faqs.q4", aKey: "pricing.faqs.a4" },
];
