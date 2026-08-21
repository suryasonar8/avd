export const PLAN_TYPES = {
    FREE: "free",
    BASIC: "basic",
    PREMIUM: "premium",
};

// Plan hierarchy: free < basic < premium
export const PLANS = {
    [PLAN_TYPES.FREE]: 0,
    [PLAN_TYPES.BASIC]: 1,
    [PLAN_TYPES.PREMIUM]: 2,
};

export const DEFAULT_PLAN = PLAN_TYPES.FREE;

// Feature key → minimum plan required
// To gate a new feature, add one line here.
export const FEATURES = {
    // --- Store Verification (sv) ---
    // Info Tab
    "sv.info.pages.home": PLAN_TYPES.BASIC,
    "sv.info.pages.collections": PLAN_TYPES.BASIC,
    "sv.info.pages.products": PLAN_TYPES.BASIC,
    "sv.info.pages.custom": PLAN_TYPES.BASIC,
    "sv.info.trigger.logged": PLAN_TYPES.BASIC,

    // Background Tab
    "sv.bg.color": PLAN_TYPES.BASIC,
    "sv.bg.logo": PLAN_TYPES.BASIC,
    "sv.bg.border-color": PLAN_TYPES.PREMIUM,
    "sv.bg.border-radius": PLAN_TYPES.PREMIUM,
    "sv.bg.border-width": PLAN_TYPES.PREMIUM,

    // Button Tab
    "sv.btn.bg": PLAN_TYPES.BASIC,
    "sv.btn.border-color": PLAN_TYPES.PREMIUM,
    "sv.btn.border-radius": PLAN_TYPES.PREMIUM,
    "sv.btn.border-width": PLAN_TYPES.PREMIUM,

    // Cancel Button Tab
    "sv.cbtn.bg": PLAN_TYPES.BASIC,
    "sv.cbtn.border-color": PLAN_TYPES.PREMIUM,
    "sv.cbtn.border-radius": PLAN_TYPES.PREMIUM,
    "sv.cbtn.border-width": PLAN_TYPES.PREMIUM,

    // CSS Tab
    "sv.css.input": PLAN_TYPES.PREMIUM,

    // --- Checkout Verification ---
    "checkout.condition.status": PLAN_TYPES.BASIC,
    "checkout.condition.target": PLAN_TYPES.BASIC,
    "checkout.banner.heading": PLAN_TYPES.BASIC,

    // --- Checkout Age Verification (Shopify Plus checkout checkbox) ---
    "checkout.verification.status": PLAN_TYPES.PREMIUM,
    "checkout.verification.target": PLAN_TYPES.PREMIUM,
    "checkout.verification.method": PLAN_TYPES.PREMIUM,
    "checkout.verification.minAge": PLAN_TYPES.PREMIUM,
    "checkout.verification.message": PLAN_TYPES.PREMIUM,
    "checkout.verification.errorMessage": PLAN_TYPES.PREMIUM,

    // --- Terms & Conditions (Translation Spec) ---
    "terms.condition.status": PLAN_TYPES.PREMIUM,
    "terms.condition.pages": PLAN_TYPES.PREMIUM,
    "terms.condition.trigger": PLAN_TYPES.PREMIUM,
    "terms.checkbox.text": PLAN_TYPES.PREMIUM,
    "terms.checkbox.keyword": PLAN_TYPES.PREMIUM,
    "terms.checkbox.link": PLAN_TYPES.PREMIUM,
    "terms.checkbox.size": PLAN_TYPES.PREMIUM,
    "terms.checkbox.color": PLAN_TYPES.PREMIUM,
    "terms.checkbox.error": PLAN_TYPES.PREMIUM,
    "terms.checkout.status": PLAN_TYPES.PREMIUM,
    "terms.checkout.trigger": PLAN_TYPES.PREMIUM,

    // --- Translation ---
    "translation.unlimited": PLAN_TYPES.BASIC,
};

export const LIMITS = {
    translation: {
        [PLAN_TYPES.FREE]: 1,
        [PLAN_TYPES.BASIC]: 50,
        [PLAN_TYPES.PREMIUM]: Infinity,
    },
    popups: {
        [PLAN_TYPES.FREE]: 1,
        [PLAN_TYPES.BASIC]: 50,
        [PLAN_TYPES.PREMIUM]: 50,
    }
};

