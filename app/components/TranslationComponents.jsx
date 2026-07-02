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
}) => (
  <div style={{ marginBottom: "20px" }}>
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
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
            padding: "10px 14px",
            background: "#f6f6f7",
            borderRadius: "8px",
            border: "1px solid #e1e3e5",
            color: "#6d7175",
            fontSize: "14px",
            minHeight: "40px",
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
        style={{ display: "flex", alignItems: "center", paddingTop: "32px" }}
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
      <div style={{ flex: 1 }}>
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
            {typeof document !== "undefined" ? (
              <RichTextEditor value={value} onChange={(e) => onChange(e)} />
            ) : (
              <div style={{ height: "100px", background: "#fafafa" }} />
            )}
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

  const filteredPopups = useMemo(() => {
    if (!searchTerm) return popups;
    return popups.filter((p) =>
      (p.config.name || p.handle || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [popups, searchTerm]);

  const selectedPopup = useMemo(
    () => popups.find((p) => p.id.toString() === selectedPopupId.toString()),
    [popups, selectedPopupId],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <s-text-field
        placeholder={t("translation.selectPopup")}
        readOnly
        value={
          selectedPopup
            ? selectedPopup.config.name ||
              t("translation.popupNumber", { id: selectedPopup.id })
            : ""
        }
        onClick={() => !isReadOnly && setIsOpen(!isOpen)}
        disabled={isReadOnly}
      />

      {isOpen && (
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
          <div style={{ marginBottom: "8px" }}>
            <s-text-field
              placeholder={t("translation.searchPopups")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              autoFocus
            />
          </div>
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {filteredPopups.map((popup) => (
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
            {filteredPopups.length === 0 && (
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
          </div>
        </div>
      )}
    </div>
  );
};
