import { useRef, useEffect } from "react";
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
  const chipRef = useRef(null);

  useEffect(() => {
    const chip = chipRef.current;
    if (!chip) return;

    const handleRemove = (e) => {
      e.stopPropagation();
      onRemoveFilter(filter.type);
    };

    chip.addEventListener("remove", handleRemove);
    return () => {
      chip.removeEventListener("remove", handleRemove);
    };
  }, [filter.type, onRemoveFilter]);

  return (
    <div style={{ position: "relative" }}>
      <s-clickable-chip
        ref={chipRef}
        removable
        onClick={(e) => {
          e.stopPropagation();
          setDropdownAnchor(filter.type);
          setActiveFilterMenu(filter.type);
          setIsDropdownOpen(true);
        }}
      >
        {filter.label}
      </s-clickable-chip>

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
