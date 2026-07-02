import { useState, useMemo, useEffect, useRef } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { useTranslation } from "../context/TranslationContext";

export const SectionTitle = ({ title, description }) => (
  <div style={{ marginBottom: "24px" }}>
    <s-text variant="headingMd" as="h2" style={{ marginBottom: "4px" }}>
      {title}
    </s-text>
    <s-text variant="bodyMd" as="p" tone="subdued">
      {description}
    </s-text>
  </div>
);

export const TranslationField = ({
  label,
  original,
  value,
  onChange,
  type = "text",
  disabled = false,
}) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              color: "#202223",
              marginBottom: "8px",
            }}
          >
            {label}
          </label>
          <div
            style={{
              padding: "6px 12px",
              background: "#f6f6f7",
              borderRadius: "8px",
              border: "1px solid #e1e3e5",
              color: "#6d7175",
              fontSize: "14px",
              height: "34px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
            }}
          >
            {type === "richtext" ? (
              <div dangerouslySetInnerHTML={{ __html: original || "" }} />
            ) : (
              original || ""
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: "32px",
            flex: "0 0 auto",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 5L12 10L7 15"
              stroke="#babec3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              color: "#202223",
              marginBottom: "8px",
            }}
          >
            {label}
          </label>
          {type === "richtext" ? (
            <div
              className="custom-editor-container"
              style={{
                pointerEvents: disabled ? "none" : "auto",
                opacity: disabled ? 0.7 : 1,
              }}
            >
              <RichTextEditor value={value} onChange={(e) => onChange(e)} />
            </div>
          ) : (
            <s-text-field
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.currentTarget.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const PopupList = ({
  displayPopups,
  selectedPopupId,
  onSelect,
  setIsOpen,
  setSearchTerm,
  isLoading,
  t,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "white",
        border: "1px solid #e1e3e5",
        borderRadius: "8px",
        marginTop: "4px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        zIndex: 10,
        padding: "8px",
      }}
    >
      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {isLoading ? (
          <div
            style={{
              padding: "8px 12px",
              fontSize: "13px",
              color: "#6d7175",
            }}
          >
            {t("common.loading", "Loading...")}
          </div>
        ) : (
          <>
            {displayPopups.map((popup) => (
              <div
                key={popup.id}
                onClick={() => {
                  onSelect(popup.id.toString());
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "13px",
                  borderRadius: "4px",
                  background:
                    selectedPopupId.toString() === popup.id.toString()
                      ? "#f4f6f8"
                      : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f4f6f8")
                }
                onMouseLeave={(e) => {
                  if (selectedPopupId.toString() !== popup.id.toString()) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {popup.config.name ||
                  t("translation.popupNumber", { id: popup.id })}
              </div>
            ))}
            {displayPopups.length === 0 && (
              <div
                style={{
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: "#6d7175",
                }}
              >
                {t("translation.noPopupsFound")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const PopupSelector = ({
  popups,
  selectedPopupId,
  onSelect,
  isReadOnly,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  const displayPopups = useMemo(() => {
    if (!searchTerm) return popups;

    return popups.filter((p) => {
      const displayName =
        p.config.name || t("translation.popupNumber", { id: p.id });
      const searchableText = (
        displayName +
        " " +
        (p.handle || "") +
        " " +
        p.id
      ).toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, popups, t]);

  const selectedPopup = useMemo(() => {
    return popups.find((p) => p.id.toString() === selectedPopupId.toString());
  }, [popups, selectedPopupId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = isOpen
    ? searchTerm
    : selectedPopup
      ? selectedPopup.config.name ||
        t("translation.popupNumber", { id: selectedPopup.id })
      : "";

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <s-search-field
        placeholder={
          isOpen ? t("translation.searchPopups") : t("translation.selectPopup")
        }
        value={displayValue}
        onClick={() => {
          if (!isReadOnly && !isOpen) {
            setIsOpen(true);
            setSearchTerm("");
          }
        }}
        onChange={(e) => {
          if (!isOpen) setIsOpen(true);
          setSearchTerm(e.currentTarget.value);
        }}
        disabled={isReadOnly}
        autoComplete="off"
      />

      {isOpen && (
        <PopupList
          displayPopups={displayPopups}
          selectedPopupId={selectedPopupId}
          onSelect={onSelect}
          setIsOpen={setIsOpen}
          setSearchTerm={setSearchTerm}
          isLoading={false}
          t={t}
        />
      )}
    </div>
  );
};
