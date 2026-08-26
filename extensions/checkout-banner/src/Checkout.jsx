import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import {
  useAppMetafields,
  useCartLines,
  useApi,
} from "@shopify/ui-extensions/checkout/preact";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  let api = null;
  try {
    api = useApi();
  } catch (e) {}

  const [config, setConfig] = useState(null);
  const cartLines = useCartLines();
  const appMetafields = useAppMetafields();

  const bannerMetafield = useMemo(() => {
    // useAppMetafields() only ever returns metafields this extension declared
    // in shopify.extension.toml, so matching on key is enough — no need to
    // also compare namespace (whose exact resolved string format for the
    // $app: reserved namespace isn't guaranteed here).
    return appMetafields.find((m) => m.metafield.key === "checkout_banner");
  }, [appMetafields]);

  useEffect(() => {
    if (bannerMetafield?.metafield?.value) {
      try {
        setConfig(JSON.parse(bannerMetafield.metafield.value));
      } catch (err) {
        console.error("Failed to parse checkout config", err);
      }
    } else {
      // Default config if not set
      setConfig({ status: "disabled" });
    }
  }, [bannerMetafield]);

  const [collectionMatch, setCollectionMatch] = useState(false);
  // Tracks the in-flight checkCollections() request so a slower, older
  // response can't overwrite the verdict from a newer one once cart
  // contents change again before the first request resolves.
  const collectionCheckAbortRef = useRef(null);

  useEffect(() => {
    if (config?.status === "enabled" && config?.target === "collection") {
      checkCollections();
    } else {
      collectionCheckAbortRef.current?.abort();
      setCollectionMatch(false);
    }
  }, [config, cartLines]);

  async function checkCollections() {
    collectionCheckAbortRef.current?.abort();
    const controller = new AbortController();
    collectionCheckAbortRef.current = controller;

    const selectedCollectionIds = config?.selectedCollections || [];
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
    if (!config || config.status !== "enabled") return false;

    if (config.target === "always") {
      return true;
    }

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

    return false;
  }, [config, cartLines, collectionMatch]);

  if (!visible) {
    return null;
  }

  return (
    <s-banner tone="warning">
      <s-stack gap="base">
        <s-text>{`${config?.heading ? config.heading : "Age restriction applies"}`}</s-text>
      </s-stack>
    </s-banner>
  );
}
