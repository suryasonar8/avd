import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useMemo } from "preact/hooks";
import {
  useAppMetafields,
  useSettings,
  useCustomer,
  useApplyAttributeChange,
  useAttributeValues,
} from "@shopify/ui-extensions/checkout/preact";

// Must match the attribute key read by the checkout-terms-validation Function
// (extensions/checkout-terms-validation/src/cart_validations_generate_run.js)
// — this cart attribute is the only channel connecting the two extensions.
const ACCEPTED_ATTRIBUTE_KEY = "avd_terms_accepted";
const ERROR_MESSAGE_ATTRIBUTE_KEY = "avd_terms_error_message";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const appMetafields = useAppMetafields();
  const settings = useSettings();
  const applyAttributeChange = useApplyAttributeChange();

  // useCustomer() throws ScopeNotGrantedError unless the app has been
  // granted Protected Customer Data access (Partner Dashboard > App setup >
  // Data protection) — without it, "logged"/"not_logged" trigger conditions
  // can't be evaluated, but "always" should still render.
  let customer = null;
  try {
    customer = useCustomer();
  } catch (err) {
    customer = null;
  }

  // The cart attribute is the single source of truth for "checked" — it's
  // also what checkout-terms-validation reads to block checkout, and it
  // persists across reloads within the same cart, so local component state
  // would drift from it (e.g. show unchecked after a reload while the
  // attribute is still "true" from an earlier check).
  const [acceptedValue] = useAttributeValues([ACCEPTED_ATTRIBUTE_KEY]);
  const checked = acceptedValue === "true";

  const checkoutConfig = useMemo(() => {
    // useAppMetafields() only ever returns metafields this extension declared
    // in shopify.extension.toml, so matching on key is enough.
    const found = appMetafields.find(
      (m) => m.metafield.key === "checkout_terms_conditions",
    );
    if (!found?.metafield?.value) return { enabled: false };
    try {
      return JSON.parse(found.metafield.value);
    } catch (err) {
      return { enabled: false };
    }
  }, [appMetafields]);

  // Settings values are typed as `string | number | boolean` since useSettings()
  // doesn't know these fields are all single_line_text_field — coerce to string.
  const message =
    String(settings.message ?? "") ||
    "I understand and agree to the terms and conditions.";
  const keyword = String(settings.keyword ?? "");
  const link = String(settings.link ?? "");
  const errorMessage =
    String(settings.error_message ?? "") ||
    "You must accept the terms and conditions to continue.";

  // Keep the Function's error text in sync with this block's own setting —
  // Functions can't read extension settings directly, only cart attributes.
  useEffect(() => {
    applyAttributeChange({
      type: "updateAttribute",
      key: ERROR_MESSAGE_ATTRIBUTE_KEY,
      value: errorMessage,
    });
  }, [errorMessage]);

  const visible = useMemo(() => {
    if (!checkoutConfig?.enabled) return false;

    if (checkoutConfig.triggerCondition === "logged") {
      return !!customer;
    }
    if (checkoutConfig.triggerCondition === "not_logged") {
      return !customer;
    }
    return true; // "always" or unset
  }, [checkoutConfig, customer]);

  const handleChange = async (event) => {
    const next = event.target.checked;

    if (next) {
      await applyAttributeChange({
        type: "updateAttribute",
        key: ACCEPTED_ATTRIBUTE_KEY,
        value: "true",
      });
    } else {
      await applyAttributeChange({
        type: "removeAttribute",
        key: ACCEPTED_ATTRIBUTE_KEY,
      });
    }
  };

  if (!visible) {
    return null;
  }

  const renderMessage = () => {
    if (!keyword) return message;
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = message.split(new RegExp(`(${escapedKeyword})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() && link ? (
        <s-link key={i} href={link} target="_blank">
          {part}
        </s-link>
      ) : (
        part
      ),
    );
  };

  // The actual "you must accept to continue" error is enforced and rendered
  // by Shopify itself from checkout-terms-validation's returned error
  // (target: "$.cart") — this block only needs to render the checkbox.
  return (
    <s-checkbox checked={checked} onChange={handleChange}>
      <s-text slot="label">{renderMessage()}</s-text>
    </s-checkbox>
  );
}
