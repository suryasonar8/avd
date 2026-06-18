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
    "Unlimited country and language pop-ups",
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
        free: true,
        basic: true,
        premium: true,
    },
    {
        feature: "Country & language pop-ups",
        free: "1",
        basic: "1",
        premium: "Unlimited",
    },
    {
        feature: "Verification by birthday input",
        free: false,
        basic: true,
        premium: true,
    },
    {
        feature: "Fully customizable pop-up",
        free: false,
        basic: true,
        premium: true,
    },
    {
        feature: "Restrict by pages/collections/products",
        free: false,
        basic: true,
        premium: true,
    },
    {
        feature: "Verified and unverified reports",
        free: false,
        basic: true,
        premium: true,
    },
    {
        feature: "Age validation settings",
        free: false,
        basic: true,
        premium: true,
    },
    { feature: "Multiple templates", free: false, basic: true, premium: true },
    {
        feature: "Restrict underage users with a message",
        free: false,
        basic: true,
        premium: true,
    },
    { feature: "Verify by checkbox", free: false, basic: false, premium: true },
    {
        feature: "Birthday input customization",
        free: false,
        basic: false,
        premium: true,
    },
    {
        feature: "Button border customization",
        free: false,
        basic: false,
        premium: true,
    },
    { feature: "20+ popup animations", free: false, basic: false, premium: true },
    {
        feature: "Custom JavaScript and CSS",
        free: false,
        basic: false,
        premium: true,
    },
    { feature: "Terms & Conditions", free: false, basic: false, premium: true },
    {
        feature: "Checkout page age restriction banner",
        free: false,
        basic: false,
        premium: true,
    },
    {
        feature: "Birthdate verification on product & cart page",
        free: false,
        basic: false,
        premium: true,
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
