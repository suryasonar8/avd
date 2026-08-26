// @ts-check

/**
 * @typedef {import("../generated/api").CartValidationsGenerateRunInput} CartValidationsGenerateRunInput
 * @typedef {import("../generated/api").CartValidationsGenerateRunResult} CartValidationsGenerateRunResult
 */

/**
 * @param {number} minAge
 */
function defaultErrorMessage(minAge) {
  return `You must be ${minAge} years old.`;
}

/**
 * @param {CartValidationsGenerateRunInput} input
 * @returns {CartValidationsGenerateRunResult}
 */
export function cartValidationsGenerateRun(input) {
  const noOp = { operations: [] };

  // Only enforce at the actual pay attempt (CHECKOUT_COMPLETION), not while
  // the buyer is still filling in the form (CHECKOUT_INTERACTION) or
  // interacting with the cart (CART_INTERACTION) — otherwise the error would
  // surface before they've had a chance to check the box at all.
  if (input.buyerJourney.step !== "CHECKOUT_COMPLETION") return noOp;

  const configValue = input.shop?.metafield?.value;
  if (!configValue) return noOp;

  let config;
  try {
    config = JSON.parse(configValue);
  } catch (err) {
    return noOp;
  }

  // Mirrors CheckoutAgeVerificationService.syncToShopify / PlanService.
  // validateCheckoutAgeVerificationConfig — the metafield is only ever
  // synced when status is "enabled" and the shop has access, so a missing
  // or disabled config here means the feature is off (plan downgrade,
  // merchant toggle, or metafield deleted).
  if (config.status !== "enabled") return noOp;

  if (!isCartApplicable(input, config)) return noOp;

  const accepted = input.cart.acceptedAttribute?.value === "true";
  if (accepted) return noOp;

  const minAge = config.minAge || 18;
  const message = config.errorMessage || defaultErrorMessage(minAge);

  return {
    operations: [
      {
        validationAdd: {
          errors: [
            {
              message,
              target: "$.cart",
            },
          ],
        },
      },
    ],
  };
}

/**
 * Whether this cart is within the merchant's configured target
 * (always / specific products / specific collections).
 *
 * "always" and "product" are verified directly from data this query already
 * has — no trust in the client required. "collection" can't be: Shopify
 * Functions compile input queries statically, so `Product.inAnyCollection`
 * can't take the merchant's selected collection IDs (only known at runtime,
 * from the same metafield) as an argument. For that case we fall back to
 * the same signal the checkout-age-verification extension already used to
 * decide whether to render the checkbox — the same trust boundary this app
 * already accepts for the "accepted" attribute itself.
 *
 * @param {CartValidationsGenerateRunInput} input
 * @param {{ target?: string, selectedProducts?: string[] }} config
 */
function isCartApplicable(input, config) {
  if (config.target === "product") {
    const selected = config.selectedProducts || [];
    if (selected.length === 0) return false;
    const cartProductIds = input.cart.lines
      .map((line) => line.merchandise?.product?.id)
      .filter(Boolean);
    return cartProductIds.some((id) => selected.includes(id));
  }

  if (config.target === "collection") {
    return input.cart.targetMatchAttribute?.value === "true";
  }

  return true; // "always" or unset
}
