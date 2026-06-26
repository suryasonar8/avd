import { PLAN_TYPES } from "./features";

export const BASIC_FEATURES = [
    "Age verification pop-up",
    "1 Country and language-specific pop-up",
    "Verification by birthday input",
    "Fully customizable pop-up",
    "Restrict specific pages, collections, products, and tags",
    "Verified and unverified reports",
    "Age validation settings",
    "Multiple templates",
    "Restrict underage users with a message",
];

export const PREMIUM_FEATURES = [
    "Everything in Basic, plus:",
    "Verify by checkbox",
    "Unlimited country and language pop_ups",
    "Birthday input customization",
    "Restriction message input customization",
    "Button border customization",
    "20+ popup animations",
    "Popup background border customization",
    "Advanced option to add custom JavaScript and CSS",
    "Terms & Conditions: product and cart page",
    "Terms & Conditions: Restrict on specific pages, collections, products, and tags",
    "Checkout page age restriction banner",
    "Birthdate verification on product and cart page",
    "Fully customizable options",
];

export const COMPARE_FEATURES = [
    {
        feature: "Age verification pop-up",
        [PLAN_TYPES.FREE]: true,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        feature: "Country & language pop-ups",
        [PLAN_TYPES.FREE]: "1",
        [PLAN_TYPES.BASIC]: "1",
        [PLAN_TYPES.PREMIUM]: "Unlimited",
    },
    {
        feature: "Verification by birthday input",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        feature: "Fully customizable pop-up",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        feature: "Restrict by pages/collections/products",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        feature: "Verified and unverified reports",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        feature: "Age validation settings",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    { feature: "Multiple templates", [PLAN_TYPES.FREE]: false, [PLAN_TYPES.BASIC]: true, [PLAN_TYPES.PREMIUM]: true },
    {
        feature: "Restrict underage users with a message",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: true,
        [PLAN_TYPES.PREMIUM]: true,
    },
    { feature: "Verify by checkbox", [PLAN_TYPES.FREE]: false, [PLAN_TYPES.BASIC]: false, [PLAN_TYPES.PREMIUM]: true },
    {
        feature: "Birthday input customization",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        feature: "Button border customization",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    { feature: "20+ popup animations", [PLAN_TYPES.FREE]: false, [PLAN_TYPES.BASIC]: false, [PLAN_TYPES.PREMIUM]: true },
    {
        feature: "Custom JavaScript and CSS",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    { feature: "Terms & Conditions", [PLAN_TYPES.FREE]: false, [PLAN_TYPES.BASIC]: false, [PLAN_TYPES.PREMIUM]: true },
    {
        feature: "Checkout page age restriction banner",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
    {
        feature: "Birthdate verification on product & cart page",
        [PLAN_TYPES.FREE]: false,
        [PLAN_TYPES.BASIC]: false,
        [PLAN_TYPES.PREMIUM]: true,
    },
];


export const PRICING_FAQS = [
    {
        q: "1. Does your app offer a free plan?",
        a: "Yes! The Age Verification App offers a free plan that includes a basic age verification pop-up. It's perfect for testing purposes and getting familiar with the app's core features before upgrading.",
    },
    {
        q: "2. How can I stop being charged without uninstalling the app?",
        a: "You can downgrade to our Free plan at any time from the Plans page. This will stop any recurring charges while keeping the app installed in your store with basic features.",
    },
    {
        q: "3. Can I downgrade from a higher paid plan to a lower one?",
        a: "Absolutely. You can switch between plans at any time. When you downgrade, any unused portion of your billing cycle may be credited back to you by Shopify.",
    },
    {
        q: "4. Will my settings be saved if I uninstall the app?",
        a: "If you uninstall the app, your settings will not be preserved. We recommend downgrading to the free plan instead of uninstalling if you plan to return in the future.",
    },
];
