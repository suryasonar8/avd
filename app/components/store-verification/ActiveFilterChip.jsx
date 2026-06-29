import DropdownContainer from "./DropdownContainer";
import { FilterOptionsMenu } from "./FilterMenus";

export default function ActiveFilterChip({
  filter,
  onRemoveFilter,
  onAddFilter,
  activeFilters,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownAnchor,
  setDropdownAnchor,
  setActiveFilterMenu,
}) {
  const isOpen = isDropdownOpen && dropdownAnchor === filter.type;

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setDropdownAnchor(filter.type);
          setActiveFilterMenu(filter.type);
          setIsDropdownOpen(true);
        }}
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "16px",
          padding: "4px 12px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "#1A1C1D",
          cursor: "pointer",
        }}
      >
        <span>{filter.label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveFilter(filter.type);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            color: "#6D7175",
            fontWeight: "600",
          }}
        >
          ×
        </button>
      </div>

      {isOpen && (
        <DropdownContainer onClick={(e) => e.stopPropagation()}>
          <FilterOptionsMenu
            menuType={filter.type}
            activeFilters={activeFilters}
            onAddFilter={onAddFilter}
            onRemoveFilter={onRemoveFilter}
            setIsFilterDropdownOpen={setIsDropdownOpen}
          />
        </DropdownContainer>
      )}
    </div>
  );
}
