// @ts-check

/**
 * @typedef {import("../generated/api").CartValidationsGenerateRunInput} CartValidationsGenerateRunInput
 * @typedef {import("../generated/api").CartValidationsGenerateRunResult} CartValidationsGenerateRunResult
 */

const DEFAULT_ERROR_MESSAGE =
  "You must accept the terms and conditions to continue.";

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

  // Mirrors PlanService.validateCheckoutTermsConfig / hasAccess — the
  // metafield is only ever synced when the shop has access, so a missing
  // or disabled config here means the feature is off (plan downgrade,
  // merchant toggle, or metafield deleted).
  if (!config.enabled) return noOp;

  const customer = input.cart.buyerIdentity?.customer;
  if (config.triggerCondition === "logged" && !customer) return noOp;
  if (config.triggerCondition === "not_logged" && customer) return noOp;

  const accepted = input.cart.acceptedAttribute?.value === "true";
  if (accepted) return noOp;

  const message =
    input.cart.errorMessageAttribute?.value || DEFAULT_ERROR_MESSAGE;

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
