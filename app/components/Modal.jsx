import React, { useEffect, useRef } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export const Modal = ({
  id,
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}) => {
  const shopify = useAppBridge();
  
  // Generate a stable unique ID for the modal if none is provided
  const modalId = useRef(id || `modal-${Math.random().toString(36).substring(2, 9)}`).current;

  useEffect(() => {
    if (isOpen) {
      shopify.modal.show(modalId);
    } else {
      shopify.modal.hide(modalId);
    }
  }, [isOpen, shopify, modalId]);

  return (
    <ui-modal id={modalId} onHide={onClose}>
      <div style={{ padding: "24px" }}>
        {children}
      </div>
      <ui-title-bar title={title}>
        {primaryAction && (
          <button
            variant="primary"
            onClick={primaryAction.onAction}
            disabled={primaryAction.disabled}
          >
            {primaryAction.content}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onAction}
            disabled={secondaryAction.disabled}
          >
            {secondaryAction.content}
          </button>
        )}
      </ui-title-bar>
    </ui-modal>
  );
};

