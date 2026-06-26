// Plan hierarchy: free < basic < premium
export const PLANS = {
    free: 0,
    basic: 1,
    premium: 2,
};

// Feature key → minimum plan required
// To gate a new feature, add one line here.
export const FEATURES = {
    // --- Store Verification (sv) ---
    // Info Tab
    "sv.info.pages.home": "basic",
    "sv.info.pages.collections": "basic",
    "sv.info.pages.products": "basic",
    "sv.info.pages.custom": "basic",
    "sv.info.trigger.logged": "basic",

    // Background Tab
    "sv.bg.color": "basic",
    "sv.bg.logo": "basic",
    "sv.bg.border-color": "premium",
    "sv.bg.border-radius": "premium",
    "sv.bg.border-width": "premium",

    // Button Tab
    "sv.btn.bg": "basic",
    "sv.btn.border-color": "premium",
    "sv.btn.border-radius": "premium",
    "sv.btn.border-width": "premium",

    // Cancel Button Tab
    "sv.cbtn.bg": "basic",
    "sv.cbtn.border-color": "premium",
    "sv.cbtn.border-radius": "premium",
    "sv.cbtn.border-width": "premium",

    // CSS Tab
    "sv.css.input": "premium",

    // --- Checkout Verification ---
    "checkout.condition.status": "basic",
    "checkout.condition.target": "basic",
    "checkout.banner.heading": "basic",

    // --- Terms & Conditions (Translation Spec) ---
    "terms.condition.status": "premium",
    "terms.condition.pages": "premium",
    "terms.condition.trigger": "premium",
    "terms.checkbox.text": "premium",
    "terms.checkbox.keyword": "premium",
    "terms.checkbox.link": "premium",
    "terms.checkbox.size": "premium",
    "terms.checkbox.color": "premium",
    "terms.checkbox.error": "premium",
};

export const LIMITS = {
    translation: {
        free: 1,
        basic: 50,
        premium: Infinity,
    },
    popups: {
        free: 1,
        basic: 50,
        premium: 50,
    }
};
