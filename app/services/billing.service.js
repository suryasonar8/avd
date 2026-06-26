/**
 * Billing Service — Shopify subscription management.
 *
 * TODO: Wire up when ready to add real billing.
 * This file will contain:
 * - Plan name constants (matching shopify.server.js billing config)
 * - subscriptionToPlan() mapping function
 * - createSubscription() to call billing.request()
 * - handleWebhookUpdate() to sync DB on subscription changes
 */

// Plan name constants (must match shopify.server.js billing config)
export const BASIC_MONTHLY = "Basic Monthly";
export const BASIC_ANNUAL = "Basic Annual";
export const PREMIUM_MONTHLY = "Premium Monthly";
export const PREMIUM_ANNUAL = "Premium Annual";

/**
 * Map a Shopify subscription name to our internal plan tier.
 */
export function subscriptionToPlan(subscriptionName) {
    if ([PREMIUM_MONTHLY, PREMIUM_ANNUAL].includes(subscriptionName))
        return "premium";
    if ([BASIC_MONTHLY, BASIC_ANNUAL].includes(subscriptionName)) return "basic";
    return "free";
}
