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
      <s-search-field
        placeholder={t("storeVerification.searchByPopupName")}
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.currentTarget.value)}
        autoFocus
        style={{ flex: 1 }}
      />
      <s-button
        variant="plain"
        onClick={() => {
          setIsSearching(false);
          onSearchQueryChange("");
        }}
      >
        {t("common.cancel")}
      </s-button>
    </div>
  );
}
