import { useFetcher, useLoaderData, useParams, redirect } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { PlanService } from "../services/plan.service";
import { PopupService } from "../services/popup.service";
import { SettingsService } from "../services/settings.service";
import { PopupEditor } from "../components/customization/PopupEditor";
import { useTranslation } from "../context/TranslationContext";

export const loader = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const { id } = params;

  const popup = await PopupService.getPopup(session.shop, id);
  if (!popup) {
    throw new Response("Not Found", { status: 404 });
  }

  // Fetch global settings for Brand Mark from DB
  const dbSettings = await SettingsService.getSettings(session.shop);
  const globalSettings = { showBrandMark: dbSettings.showBrandMark };

  return { settings: popup, globalSettings };
};

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const { id } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "toggle_brand_mark") {
    const showBrandMark = formData.get("showBrandMark") === "true";

    // Use SettingsService to save to DB first, then sync to metafield
    const currentSettings = await SettingsService.getSettings(shop);
    const result = await SettingsService.updateSettings(admin, shop, {
      ...currentSettings,
      showBrandMark,
    });

    return {
      success: result.success,
      globalSettings: { showBrandMark },
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
      isSubmitting={fetcher.state !== "idle"}
      shopify={shopify}
    />
  );
}
