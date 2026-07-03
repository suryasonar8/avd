import { useSubmit, useLoaderData, redirect, useNavigation } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PlanService } from "../services/plan.service";
import { PopupService } from "../services/popup.service";
import { ShopService } from "../services/shop.service";
import { PopupEditor } from "../components/customization/PopupEditor";
import { useTranslation } from "../context/TranslationContext";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  // Fetch global settings for Brand Mark
  const shop = await ShopService.getMetafield(admin, "avd", "settings");
  const globalSettingsValue = shop?.metafield?.value;
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

  // Enforce popup creation limits in loader
  const plan = await PlanService.getShopPlan(admin, session.shop);
  const limit = PlanService.getPopupLimit(plan);

  if (limit !== Infinity) {
    const existingCount = await PopupService.getPopupCount(session.shop);
    if (existingCount >= limit) {
      return redirect("/pricing");
    }
  }

  return { settings: null, globalSettings };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
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

  // Enforce popup creation limits
  const plan = await PlanService.getShopPlan(admin, shop);
  const limit = PlanService.getPopupLimit(plan);

  if (limit !== Infinity) {
    const existingCount = await PopupService.getPopupCount(shop);
    if (existingCount >= limit) {
      return {
        success: false,
        errors: [
          {
            message: `Popup limit reached (${limit}). Please upgrade your plan to create more popups.`,
          },
        ],
      };
    }
  }

  if (intent === "toggle_brand_mark") {
    const showBrandMark = formData.get("showBrandMark") === "true";

    const shopData = await ShopService.getMetafield(admin, "avd", "settings");
    const existingValue = shopData?.metafield?.value;
    const existingSettings = existingValue ? JSON.parse(existingValue) : {};
    const newSettings = { ...existingSettings, showBrandMark };

    const shopId = await ShopService.getShopId(admin);

    await ShopService.updateMetafield(
      admin,
      shopId,
      "avd",
      "settings",
      JSON.stringify(newSettings)
    );

    return { success: true };
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

  // Create the popup in the database
  const popup = await PopupService.createPopup(shop, finalConfig);

  // If enabled, set as active and sync to Shopify
  if (finalConfig.status === "Enabled") {
    await PopupService.toggleActive(admin, shop, popup.id, true);
  }

  // Redirect to the newly created popup's edit page
  return redirect(`/store_verification/${popup.id}?saved=true`);
};

export default function StoreVerificationCustomization() {
  const loaderData = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const shopify = useAppBridge();
  const { t } = useTranslation();

  const handleSave = (config) => {
    submit({ config: JSON.stringify(config) }, { method: "POST" });
  };
  return (
    <PopupEditor
      key="new-popup"
      settings={loaderData?.settings}
      globalSettings={loaderData?.globalSettings}
      onSave={handleSave}
      heading={t("popupEditor.editorHeading")}
      description={t("popupEditor.editorDescription")}
      saveBarId="customization-save-bar"
      isSubmitting={navigation.state !== "idle"}
      shopify={shopify}
    />
  );
}
