import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { useTranslation } from "../../context/TranslationContext";
import { useAppBridge } from "@shopify/app-bridge-react";

const DeleteConfirmModal = forwardRef(function DeleteConfirmModal(
  { onConfirm },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("all"); // "all", "selected", "single"
  const { t } = useTranslation();
  const shopify = useAppBridge();

  useImperativeHandle(ref, () => ({
    open: (deleteMode = "all") => {
      setMode(deleteMode);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  }));

  useEffect(() => {
    if (isOpen) {
      shopify.modal.show("delete-confirm-modal");
    } else {
      shopify.modal.hide("delete-confirm-modal");
    }
  }, [isOpen, shopify]);

  const titleText =
    mode === "single"
      ? t("storeVerification.deleteRuleTitle") || "Delete rule"
      : t("storeVerification.deleteConfirmTitle");

  const bodyText =
    mode === "single"
      ? t("storeVerification.deleteConfirmBody")
      : t("storeVerification.deleteConfirmBody");

  return (
    <ui-modal id="delete-confirm-modal" onHide={() => setIsOpen(false)}>
      <div style={{ padding: "20px" }}>{bodyText}</div>
      <ui-title-bar title={titleText}>
        <button
          variant="primary"
          onClick={() => {
            onConfirm();
            setIsOpen(false);
          }}
        >
          {t("common.delete")}
        </button>
        <button onClick={() => setIsOpen(false)}>{t("common.cancel")}</button>
      </ui-title-bar>
    </ui-modal>
  );
});

export default DeleteConfirmModal;
