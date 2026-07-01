import { useFetcher, useLoaderData, useParams, redirect } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PlanService } from "../services/plan.service";
import { PopupService } from "../services/popup.service";
import { PopupEditor } from "../components/customization/PopupEditor";
import { useTranslation } from "../context/TranslationContext";

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const { id } = params;

  const popup = await PopupService.getPopup(session.shop, id);
  if (!popup) {
    throw new Response("Not Found", { status: 404 });
  }

  // Fetch global settings for Brand Mark
  const globalSettingsResponse = await admin.graphql(
    `#graphql
    query getGlobalSettings {
      shop {
        metafield(namespace: "avd", key: "settings") {
          value
        }
      }
    }`,
  );
  const globalSettingsData = await globalSettingsResponse.json();
  const globalSettingsValue = globalSettingsData.data.shop.metafield?.value;
  const globalSettings = globalSettingsValue
    ? JSON.parse(globalSettingsValue)
    : { showBrandMark: true };

  // Server-side gating
  const hasAccess = await PlanService.hasAccess(
    session.shop,
    "store-verification.customization",
  );
  if (!hasAccess) {
    return redirect("/pricing");
  }

  return { settings: popup, globalSettings };
};

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Server-side gating
  const hasAccess = await PlanService.hasAccess(
    shop,
    "store-verification.customization",
  );
  if (!hasAccess) {
    return {
      success: false,
      errors: [{ message: "Basic plan required for customization" }],
    };
  }

  if (intent === "toggle_brand_mark") {
    const showBrandMark = formData.get("showBrandMark") === "true";
    // Fetch existing settings to merge them
    const existingResponse = await admin.graphql(
      `#graphql
      query getGlobalSettings {
        shop {
          metafield(namespace: "avd", key: "settings") {
            value
          }
        }
      }`,
    );
    const existingData = await existingResponse.json();
    const existingValue = existingData.data.shop.metafield?.value;
    const existingSettings = existingValue ? JSON.parse(existingValue) : {};

    const newSettings = { ...existingSettings, showBrandMark };

    const shopResponse = await admin.graphql(`{ shop { id } }`);
    const shopId = (await shopResponse.json()).data.shop.id;

    const updateResponse = await admin.graphql(
      `#graphql
      mutation updateSettings($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id }
          userErrors { field message }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              namespace: "avd",
              key: "settings",
              type: "json",
              ownerId: shopId,
              value: JSON.stringify(newSettings),
            },
          ],
        },
      },
    );

    const updateData = await updateResponse.json();
    return {
      success: !updateData.data.metafieldsSet.userErrors?.length,
      globalSettings: newSettings,
    };
  }

  const configStr = formData.get("config");
  const config = JSON.parse(configStr);

  // Granular feature validation
  const validation = await PlanService.validatePopupConfig(shop, config);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors.map((msg) => ({ message: msg })),
    };
  }

  const finalConfig = validation.sanitized || config;

  // Save the popup config
  const saveResult = await PopupService.savePopup(shop, id, finalConfig);
  if (!saveResult.success) {
    return {
      success: false,
      errors: [{ message: saveResult.error || "Failed to save" }],
    };
  }

  // Handle status toggle
  if (finalConfig.status === "Enabled") {
    await PopupService.toggleActive(admin, shop, id, true);
  } else if (finalConfig.status === "Disabled") {
    // Check if this popup was active and deactivate it
    const currentPopup = await PopupService.getPopup(shop, id);
    if (currentPopup && currentPopup.status === "Enabled") {
      await PopupService.toggleActive(admin, shop, id, false);
    }
  }

  return { success: true };
};

export default function StoreVerificationEdit() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const { id } = useParams();
  const { t } = useTranslation();

  const handleSave = (config) => {
    fetcher.submit({ config: JSON.stringify(config) }, { method: "POST" });
  };

  return (
    <PopupEditor
      key={id}
      settings={loaderData?.settings}
      globalSettings={loaderData?.globalSettings}
      onSave={handleSave}
      heading={t("popupEditor.editorHeading")}
      description={t("popupEditor.editorDescription")}
      saveBarId={`edit-save-bar-${id}`}
      fetcher={fetcher}
      shopify={shopify}
    />
  );
}
