import { useState, useEffect } from "react";
import DropdownContainer from "./DropdownContainer";
import { FilterMainMenu, FilterOptionsMenu } from "./FilterMenus";
import ActiveFilterChip from "./ActiveFilterChip";
import SearchBar from "./SearchBar";
import { SearchButtonIcon, FilterButtonIcon, TrashIcon } from "./Icons";
import { useTranslation } from "../../context/TranslationContext";

export default function PopupToolbar({
  searchQuery,
  onSearchQueryChange,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAllFilters,
  onBulkDelete,
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeFilterMenu, setActiveFilterMenu] = useState("main");
  const [dropdownAnchor, setDropdownAnchor] = useState("add"); // "add", "pageSize", "trigger", "target"
  const { t } = useTranslation();

  useEffect(() => {
    if (!isFilterDropdownOpen) {
      setActiveFilterMenu("main");
      return;
    }
    const clickOutside = () => setIsFilterDropdownOpen(false);
    window.addEventListener("click", clickOutside);
    return () => window.removeEventListener("click", clickOutside);
  }, [isFilterDropdownOpen]);

  const hasPageSizeFilter = activeFilters.some((f) => f.type === "pageSize");
  const hasTriggerFilter = activeFilters.some((f) => f.type === "trigger");
  const hasTargetFilter = activeFilters.some((f) => f.type === "target");

  const allFiltersApplied =
    hasPageSizeFilter && hasTriggerFilter && hasTargetFilter;

  if (!isSearching) {
    return (
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#FFFFFF",
          borderBottom: "1px solid #E1E3E5",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <div></div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setIsSearching(true)}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E3E5",
              borderRadius: "8px",
              width: "60px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              gap: "1px",
            }}
            title={t("storeVerification.searchAndFilters")}
          >
            <SearchButtonIcon />
            <FilterButtonIcon />
          </button>

          <button
            type="button"
            onClick={onBulkDelete}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E3E5",
              borderRadius: "8px",
              width: "60px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#FF4D4D",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
            title={t("storeVerification.deleteAllPopups")}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderBottom: "1px solid #E1E3E5",
        background: "#FFFFFF",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
      }}
    >
      <div style={{ borderBottom: "1px solid #E1E3E5" }}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          setIsSearching={setIsSearching}
        />
      </div>

      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {activeFilters.map((filter, index) => (
          <ActiveFilterChip
             key={index}
             filter={filter}
             onRemoveFilter={onRemoveFilter}
             onAddFilter={onAddFilter}
             activeFilters={activeFilters}
             isDropdownOpen={isFilterDropdownOpen}
             setIsDropdownOpen={setIsFilterDropdownOpen}
             dropdownAnchor={dropdownAnchor}
             setDropdownAnchor={setDropdownAnchor}
             setActiveFilterMenu={setActiveFilterMenu}
          />
        ))}

        <div style={{ position: "relative" }}>
          <button
            type="button"
            disabled={allFiltersApplied}
            onClick={(e) => {
              if (allFiltersApplied) return;
              e.stopPropagation();
              setDropdownAnchor("add");
              setActiveFilterMenu("main");
              setIsFilterDropdownOpen(!isFilterDropdownOpen);
            }}
            style={{
              background: "#F4F6F8",
              border: "none",
              borderRadius: "16px",
              padding: "5px 12px",
              fontSize: "13px",
              cursor: allFiltersApplied ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#6D7175",
              opacity: allFiltersApplied ? 0.6 : 1,
            }}
          >
            {t("storeVerification.addFilter")}
          </button>

          {isFilterDropdownOpen && dropdownAnchor === "add" && (
            <DropdownContainer onClick={(e) => e.stopPropagation()}>
              {activeFilterMenu === "main" ? (
                <FilterMainMenu
                  hasPageSizeFilter={hasPageSizeFilter}
                  hasTriggerFilter={hasTriggerFilter}
                  hasTargetFilter={hasTargetFilter}
                  setActiveFilterMenu={setActiveFilterMenu}
                />
              ) : (
                <FilterOptionsMenu
                  menuType={activeFilterMenu}
                  activeFilters={activeFilters}
                  onAddFilter={onAddFilter}
                  onRemoveFilter={onRemoveFilter}
                  setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                />
              )}
            </DropdownContainer>
          )}
        </div>

        <button
          type="button"
          onClick={onClearAllFilters}
          style={{
            background: "none",
            border: "none",
            color: "#005BD3",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            padding: "4px 8px",
          }}
        >
          {t("common.clearAll")}
        </button>
      </div>
    </div>
  );
}
