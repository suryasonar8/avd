import { useTranslation } from "../context/TranslationContext";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function TurnOffModal({ onConfirm }) {
  const { t } = useTranslation();
  const shopify = useAppBridge();

  return (
    <ui-modal id="turn-off-modal">
      <div style={{ padding: "20px" }}>
        If you disable this feature, Age Verification will not be able to display warnings on your website to underage visitors.
      </div>
      <ui-title-bar title="Turn off Age Verification">
        <button
          variant="primary"
          onClick={() => {
            shopify.modal.hide("turn-off-modal");
            if (onConfirm) onConfirm();
          }}
        >
          Turn off
        </button>
        <button onClick={() => shopify.modal.hide("turn-off-modal")}>
          {t("common.cancel")}
        </button>
      </ui-title-bar>
    </ui-modal>
  );
}
