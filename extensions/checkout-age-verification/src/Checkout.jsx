import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import {
  useAppMetafields,
  useCartLines,
  useApi,
  useApplyAttributeChange,
  useAttributeValues,
} from "@shopify/ui-extensions/checkout/preact";

// Must match the attribute keys read by the checkout-age-verification-validation
// Function (extensions/checkout-age-verification-validation/src/cart_validations_generate_run.js)
// — cart attributes are the only channel connecting the two extensions. Both
// verification methods (checkbox / date of birth) write the same
// ACCEPTED_ATTRIBUTE_KEY, so the Function doesn't need to know which method
// was used — only whether the buyer ended up verified.
const ACCEPTED_ATTRIBUTE_KEY = "avd_age_verified";
// Whether this cart actually matches the merchant's target (always/product/
// collection). The Function can verify "product" targeting itself (cart line
// product IDs are plain fields), but "collection" targeting needs the
// buyer-selected collection IDs — which only this metafield-driven config
// knows, and a Function's input query can't take those as a runtime
// argument. So this extension resolves collection targeting client-side
// (same as checkout-banner does) and hands the Function the verdict.
const TARGET_MATCH_ATTRIBUTE_KEY = "avd_age_target_match";

const VERIFICATION_METHODS = {
  CHECKBOX: "checkbox",
  DATE_OF_BIRTH: "date_of_birth",
};

function computeAge(day, month, year) {
  const today = new Date();
  const birthDate = new Date(year, month - 1, day);
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

// Days-in-month, accounting for leap years (Date's day-0-of-next-month trick
// already folds in the Feb 28/29 leap rule).
function getDaysInMonth(month, year) {
  if (!month) return 31;
  return new Date(year || CURRENT_YEAR, month, 0).getDate();
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  let api = null;
  try {
    api = useApi();
  } catch (e) {}

  const appMetafields = useAppMetafields();
  const cartLines = useCartLines();
  const applyAttributeChange = useApplyAttributeChange();

  const [acceptedValue] = useAttributeValues([ACCEPTED_ATTRIBUTE_KEY]);
  const checked = acceptedValue === "true";

  const config = useMemo(() => {
    // useAppMetafields() only ever returns metafields this extension declared
    // in shopify.extension.toml, so matching on key is enough.
    const found = appMetafields.find(
      (m) => m.metafield.key === "checkout_age_verification",
    );
    if (!found?.metafield?.value) return { status: "disabled" };
    try {
      return JSON.parse(found.metafield.value);
    } catch (err) {
      return { status: "disabled" };
    }
  }, [appMetafields]);

  const minAge = config.minAge || 18;
  const method = config.verificationMethod || VERIFICATION_METHODS.CHECKBOX;
  const isDateOfBirth = method === VERIFICATION_METHODS.DATE_OF_BIRTH;

  const message = config.message || "I'm over 18 years old.";
  const dobHeading = config.dobHeading || "Enter your date of birth";
  const errorMessage = config.errorMessage || "You must be 18 years old.";
  const dayLabel = "Day";
  const monthLabel = "Month";
  const yearLabel = "Year";

  const [collectionMatch, setCollectionMatch] = useState(false);
  // Tracks the in-flight checkCollections() request so a slower, older
  // response can't overwrite the verdict from a newer one once cart
  // contents change again before the first request resolves.
  const collectionCheckAbortRef = useRef(null);

  useEffect(() => {
    if (config.status === "enabled" && config.target === "collection") {
      checkCollections();
    } else {
      collectionCheckAbortRef.current?.abort();
      setCollectionMatch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, cartLines]);

  async function checkCollections() {
    collectionCheckAbortRef.current?.abort();
    const controller = new AbortController();
    collectionCheckAbortRef.current = controller;

    const selectedCollectionIds = config.selectedCollections || [];
    if (selectedCollectionIds.length === 0 || !api?.query) {
      setCollectionMatch(false);
      return;
    }

    const productIds = cartLines
      .map((line) => line.merchandise?.product?.id)
      .filter(Boolean);

    if (productIds.length === 0) {
      setCollectionMatch(false);
      return;
    }

    try {
      const result = await api.query(
        `query checkProductCollections($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              collections(first: 50) {
                nodes { id }
              }
            }
          }
        }`,
        { variables: { ids: productIds } },
      );

      // A newer checkCollections() call has since started — this response
      // is for a cart state that no longer applies, so drop it rather than
      // clobbering the current (possibly already-updated) verdict.
      if (controller.signal.aborted) return;

      const products = result?.data?.nodes || [];
      const match = products.some((product) => {
        const collectionIds =
          product?.collections?.nodes?.map((c) => c.id) || [];
        return collectionIds.some((cid) => selectedCollectionIds.includes(cid));
      });

      setCollectionMatch(match);
    } catch (err) {
      if (controller.signal.aborted) return;
      setCollectionMatch(false);
    }
  }

  const visible = useMemo(() => {
    if (config.status !== "enabled") return false;

    if (config.target === "product") {
      const selectedProductIds = config.selectedProducts || [];
      return cartLines.some((line) => {
        const productId = line.merchandise?.product?.id;
        return productId && selectedProductIds.includes(productId);
      });
    }

    if (config.target === "collection") {
      return collectionMatch;
    }

    return true; // "always" or unset
  }, [config, cartLines, collectionMatch]);

  // Keep the Function's "does this cart even need verification" signal in
  // sync with what's actually rendered here, so a cart that stops matching
  // the target (e.g. buyer removes the only qualifying product) doesn't
  // stay blocked on a stale attribute from earlier in the session.
  useEffect(() => {
    if (visible) {
      applyAttributeChange({
        type: "updateAttribute",
        key: TARGET_MATCH_ATTRIBUTE_KEY,
        value: "true",
      });
    } else {
      applyAttributeChange({
        type: "removeAttribute",
        key: TARGET_MATCH_ATTRIBUTE_KEY,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // --- Date of birth state (declared unconditionally — hooks can't be
  // called only when isDateOfBirth is true) ---
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const daysInMonth = useMemo(
    () => getDaysInMonth(Number(month), Number(year)),
    [month, year],
  );
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  );

  // Selecting a month/year that makes the current day invalid (e.g. Feb 30,
  // or Feb 29 rolling from a leap year to a non-leap one) must clamp it to
  // the new last valid day — otherwise the stale value silently rolls into
  // the next month via Date's overflow normalization and skews the
  // computed age.
  useEffect(() => {
    if (day && Number(day) > daysInMonth) {
      setDay(String(daysInMonth));
    }
  }, [daysInMonth, day]);

  const dobComplete = Boolean(day && month && year);
  const dobAge = dobComplete
    ? computeAge(Number(day), Number(month), Number(year))
    : null;
  const dobUnderage = dobComplete && dobAge < minAge;

  useEffect(() => {
    if (!isDateOfBirth) return;

    if (dobComplete && !dobUnderage) {
      applyAttributeChange({
        type: "updateAttribute",
        key: ACCEPTED_ATTRIBUTE_KEY,
        value: "true",
      });
    } else {
      applyAttributeChange({
        type: "removeAttribute",
        key: ACCEPTED_ATTRIBUTE_KEY,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDateOfBirth, dobComplete, dobUnderage]);

  const handleCheckboxChange = async (event) => {
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

  return (
    <s-stack direction="block" gap="small">
      {isDateOfBirth ? (
        <s-text type="strong">{dobHeading}</s-text>
      ) : (
        <s-stack direction="inline" gap="small" alignItems="center">
          <s-badge tone="critical">{`${minAge}+`}</s-badge>
          <s-checkbox checked={checked} onChange={handleCheckboxChange}>
            <s-text slot="label">{message}</s-text>
          </s-checkbox>
        </s-stack>
      )}

      {isDateOfBirth && (
        <s-stack gap="small">
          <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="base">
            <s-select
              label={dayLabel}
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <s-option value="">DD</s-option>
              {days.map((d) => (
                <s-option key={d} value={String(d)}>
                  {String(d).padStart(2, "0")}
                </s-option>
              ))}
            </s-select>
            <s-select
              label={monthLabel}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <s-option value="">MM</s-option>
              {MONTHS.map((m, i) => (
                <s-option key={m} value={String(i + 1)}>
                  {m}
                </s-option>
              ))}
            </s-select>
            <s-select
              label={yearLabel}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <s-option value="">YYYY</s-option>
              {YEARS.map((y) => (
                <s-option key={y} value={String(y)}>
                  {y}
                </s-option>
              ))}
            </s-select>
          </s-grid>
          {!(dobComplete && !dobUnderage) && (
            <s-text tone="critical">{errorMessage}</s-text>
          )}
        </s-stack>
      )}
    </s-stack>
  );
}
