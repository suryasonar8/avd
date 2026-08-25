/* eslint-disable react/prop-types, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/label-has-associated-control */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { useTranslation } from "../../context/TranslationContext";

// Tag picker for the store-verification popup's "Specific product tags"
// condition. App Bridge's resourcePicker (see ../ResourcePickerList) has no
// tag-picker mode, so this fetches the shop's product tags from
// /api/product-tags and renders a search + checkbox dropdown instead,
// borrowing the dropdown/search shell from TranslationComponents'
// PopupSelector and the selected-chips list from ResourcePickerList.
export function TagPickerList({
  selectedTags = [],
  disabled = false,
  onChange,
}) {
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load("/api/product-tags");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = fetcher.state === "loading" && !fetcher.data;

  const displayTags = useMemo(() => {
    const allTags = fetcher.data?.tags || [];
    if (!searchTerm) return allTags;
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [fetcher.data, searchTerm]);

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

  const toggleTag = (tag) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onChange({ tags: next });
  };

  const handleRemove = (tag) => {
    onChange({ tags: selectedTags.filter((t) => t !== tag) });
  };

  return (
    <div style={{ paddingLeft: "26px" }}>
      <div style={{ marginBottom: "6px" }}>
        <label style={{ fontSize: "12px", fontWeight: "600" }}>
          {t("common.selectedTags")}
        </label>
      </div>

      <div style={{ position: "relative" }} ref={dropdownRef}>
        <s-search-field
          placeholder={t("common.selectTags")}
          value={searchTerm}
          onClick={() => {
            if (!disabled && !isOpen) setIsOpen(true);
          }}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setSearchTerm(e.currentTarget.value);
          }}
          disabled={disabled}
          autoComplete="off"
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
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {isLoading ? (
                <div
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "#6d7175",
                  }}
                >
                  {t("common.loading")}
                </div>
              ) : (
                displayTags.map((tag) => (
                  <label
                    key={tag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "13px",
                      borderRadius: "4px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f4f6f8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    {tag}
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        {selectedTags.map((tag) => (
          <div
            key={tag}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              background: "#F1F1F1",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {tag}
            <span
              onClick={() => !disabled && handleRemove(tag)}
              style={{
                cursor: disabled ? "not-allowed" : "pointer",
                color: "#6D7175",
                fontWeight: "bold",
              }}
            >
              ×
            </span>
          </div>
        ))}
        {selectedTags.length === 0 && (
          <p style={{ fontSize: "12px", color: "#6D7175", margin: 0 }}>
            {t("common.noTagsSelected")}
          </p>
        )}
      </div>
    </div>
  );
}
