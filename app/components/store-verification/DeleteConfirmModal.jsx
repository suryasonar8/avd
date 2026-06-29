import { useState, useImperativeHandle, forwardRef } from "react";

const DeleteConfirmModal = forwardRef(function DeleteConfirmModal(
  { onConfirm },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          width: "100%",
          maxWidth: "480px",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #F1F2F3",
          }}
        >
          <span
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "#1A1C1D",
            }}
          >
            Do you want to delete all selected rules
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6D7175",
              fontSize: "20px",
              lineHeight: 1,
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "24px",
            fontSize: "14px",
            color: "#4A4D4F",
            lineHeight: "1.6",
          }}
        >
          If you delete the rule, you won't be able to revert it
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            borderTop: "1px solid #F1F2F3",
          }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#F4F6F8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#FFFFFF")
            }
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBCFD2",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#1A1C1D",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setIsOpen(false);
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#3a3c3e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#202223")
            }
            style={{
              background: "#202223",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#FFFFFF",
              cursor: "pointer",
              transition: "background 0.1s",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

export default DeleteConfirmModal;
