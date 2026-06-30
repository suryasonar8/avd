import { SearchInputIcon } from "./Icons";
import { useTranslation } from "../../context/TranslationContext";

export default function SearchBar({
  searchQuery,
  onSearchQueryChange,
  setIsSearching,
}) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "14px",
            color: "#6D7175",
            display: "flex",
            alignItems: "center",
          }}
        >
          <SearchInputIcon />
        </span>
        <input
          type="text"
          placeholder={t("storeVerification.searchByPopupName")}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 14px 8px 36px",
            border: "none",
            borderRadius: "8px",
            outline: "none",
            fontSize: "14px",
            background: "#F4F6F8",
            boxSizing: "border-box",
            color: "#202223"
          }}
          autoFocus
        />
      </div>
      <button
        type="button"
        onClick={() => {
          setIsSearching(false);
          onSearchQueryChange("");
        }}
        style={{
          background: "none",
          border: "none",
          fontSize: "14px",
          fontWeight: "600",
          color: "#1A1C1D",
          cursor: "pointer",
          padding: "6px 12px",
        }}
      >
        {t("common.cancel")}
      </button>
    </div>
  );
}
