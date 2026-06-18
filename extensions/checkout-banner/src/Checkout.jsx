import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";
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

  const appMetafields = useAppMetafields();
  const cartLines = useCartLines();

  const config = useMemo(() => {
    if (!appMetafields || appMetafields.length === 0) return null;

    const bannerMeta = appMetafields.find(
      (mf) =>
        mf.metafield?.namespace === "avd_app" &&
        mf.metafield?.key === "checkout_banner",
    );

    if (bannerMeta?.metafield?.value) {
      try {
        return JSON.parse(bannerMeta.metafield.value);
      } catch (err) {
        console.error("Failed to parse banner config", err);
        return null;
      }
    }
    return null;
  }, [appMetafields]);

  const showSync = useMemo(() => {
    if (!config || config.status !== "enabled") return false;
    if (config.target === "always") return true;
    if (config.target === "product") {
      const selectedIds = config.selectedProducts || [];
      return cartLines.some((line) =>
        selectedIds.includes(line.merchandise?.product?.id),
      );
    }
    return false;
  }, [config, cartLines]);

  const [collectionMatch, setCollectionMatch] = useState(false);

  useEffect(() => {
    if (config?.status === "enabled" && config?.target === "collection") {
      checkCollections();
    } else {
      setCollectionMatch(false);
    }
  }, [config, cartLines]);

  async function checkCollections() {
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

      const products = result?.data?.nodes || [];
      const match = products.some((product) => {
        const collectionIds =
          product?.collections?.nodes?.map((c) => c.id) || [];
        return collectionIds.some((cid) => selectedCollectionIds.includes(cid));
      });

      setCollectionMatch(match);
    } catch (err) {
      setCollectionMatch(false);
    }
  }

  const visible =
    showSync || (config?.target === "collection" && collectionMatch);

  if (!visible || !config) {
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
