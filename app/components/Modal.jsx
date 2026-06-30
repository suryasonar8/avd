export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "Inter, -apple-system, system-ui, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "480px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f1f1f1",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              margin: 0,
              color: "#202223",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "#6d7175",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>{children}</div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid #f1f1f1",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          {secondaryAction && (
            <button
              onClick={secondaryAction.onAction}
              disabled={secondaryAction.disabled}
              style={{
                padding: "8px 16px",
                backgroundColor: "white",
                border: "1px solid #dcdfe3",
                borderRadius: "8px",
                cursor: secondaryAction.disabled ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "13px",
                color: "#202223",
                boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
                opacity: secondaryAction.disabled ? 0.5 : 1,
              }}
            >
              {secondaryAction.content}
            </button>
          )}
          {primaryAction && (
            <button
              onClick={primaryAction.onAction}
              disabled={primaryAction.disabled}
              style={{
                padding: "8px 16px",
                backgroundColor: primaryAction.disabled ? "#f1f1f1" : "#202223",
                border: "none",
                borderRadius: "8px",
                cursor: primaryAction.disabled ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "13px",
                color: primaryAction.disabled ? "#babec3" : "white",
                boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
              }}
            >
              {primaryAction.content}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
