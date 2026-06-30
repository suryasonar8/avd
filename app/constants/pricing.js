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
    "pricing.basicFeatures.5",
    "pricing.basicFeatures.6",
    "pricing.basicFeatures.7",
    "pricing.basicFeatures.8",
];

// Translation keys for premium plan features
export const PREMIUM_FEATURE_KEYS = [
    "pricing.premiumFeatures.0",
    "pricing.premiumFeatures.1",
    "pricing.premiumFeatures.2",
    "pricing.premiumFeatures.3",
    "pricing.premiumFeatures.4",
    "pricing.premiumFeatures.5",
    "pricing.premiumFeatures.6",
    "pricing.premiumFeatures.7",
    "pricing.premiumFeatures.8",
    "pricing.premiumFeatures.9",
    "pricing.premiumFeatures.10",
    "pricing.premiumFeatures.11",
    "pricing.premiumFeatures.12",
    "pricing.premiumFeatures.13",
];

// Comparison features use translation keys for the feature name column
export const COMPARE_FEATURES = [
    {
        featureKey: "pricing.compareFeatures.ageVerificationPopup",
        [PLAN_TYPES.FREE]: true,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.countryLanguagePopups",
        [PLAN_TYPES.FREE]: "1",
        [PLAN_TYPES.BASIC]: "1",
        [PLAN_TYPES.PREMIUM]: "common.unlimited",
    },
    {
        featureKey: "pricing.compareFeatures.verificationByBirthday",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.fullyCustomizablePopup",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.restrictByPages",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.verifiedUnverifiedReports",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.ageValidationSettings",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.multipleTemplates",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.restrictUnderage",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.verifyByCheckbox",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.birthdayInputCustomization",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.buttonBorderCustomization",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.popupAnimations",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.customJsCss",
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
        featureKey: "pricing.compareFeatures.checkoutBanner",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        featureKey: "pricing.compareFeatures.birthdateVerification",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
];

// FAQ keys for the pricing page
export const PRICING_FAQ_KEYS = [
    { qKey: "pricing.faqs.q1", aKey: "pricing.faqs.a1" },
    { qKey: "pricing.faqs.q2", aKey: "pricing.faqs.a2" },
    { qKey: "pricing.faqs.q3", aKey: "pricing.faqs.a3" },
    { qKey: "pricing.faqs.q4", aKey: "pricing.faqs.a4" },
];
