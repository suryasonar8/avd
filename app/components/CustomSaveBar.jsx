import { useEffect, useRef } from "react";
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation } from "../context/TranslationContext";

export function CustomSaveBar({
  id,
  open,
  onSave,
  onDiscard,
  state,
  disabled,
  saveLabel,
  successMessage,
  onSuccess,
}) {
  const shopify = useAppBridge();
  const { t } = useTranslation();
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (state?.submitting) {
      isSubmittingRef.current = true;
    }

    if (isSubmittingRef.current && !state?.submitting) {
      if (state?.data?.success) {
        shopify.toast.show(successMessage || t("common.savedSuccessfully"));
        if (onSuccess) onSuccess();
      } else if (
        state?.data?.error ||
        state?.data?.errors ||
        state?.data?.data?.metafieldsSet?.userErrors?.length > 0
      ) {
        shopify.toast.show(state?.data?.error || t("common.errorSaving"), {
          isError: true,
        });
      }
      isSubmittingRef.current = false;
    }
  }, [state?.submitting, state?.data, shopify, t, successMessage, onSuccess]);

  const isSaveDisabled = Boolean(disabled || state?.submitting);

  return (
    <SaveBar id={id} open={open}>
      <button variant="primary" onClick={onSave} disabled={isSaveDisabled}>
        {saveLabel || t("common.save")}
      </button>
      <button onClick={onDiscard}>{t("common.discard")}</button>
    </SaveBar>
  );
}
