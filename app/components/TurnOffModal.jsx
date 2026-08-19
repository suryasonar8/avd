import { useTranslation } from "../context/TranslationContext";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function TurnOffModal({ onConfirm }) {
  const { t } = useTranslation();
  const shopify = useAppBridge();

  return (
    <ui-modal id="turn-off-modal">
      <div style={{ padding: "20px" }}>
        {t("dashboard.turnOffModal.body")}
      </div>
      <ui-title-bar title={t("dashboard.turnOffModal.title")}>
        <button
          variant="primary"
          onClick={() => {
            shopify.modal.hide("turn-off-modal");
            if (onConfirm) onConfirm();
          }}
        >
          {t("dashboard.turnOffModal.turnOff")}
        </button>
        <button onClick={() => shopify.modal.hide("turn-off-modal")}>
          {t("common.cancel")}
        </button>
      </ui-title-bar>
    </ui-modal>
  );
}
