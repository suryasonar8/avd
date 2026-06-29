import { RadioIcon } from "./Icons";

export const dropdownItemStyle = {
  width: "100%",
  padding: "8px 16px",
  textAlign: "left",
  background: "none",
  border: "none",
  fontSize: "13px",
  cursor: "pointer",
  color: "#1A1C1D",
  boxSizing: "border-box",
  display: "block",
  transition: "background 0.1s",
};

export const FilterMainMenu = ({
  hasPageSizeFilter,
  hasTriggerFilter,
  hasTargetFilter,
  setActiveFilterMenu,
}) => (
  <>
    {!hasPageSizeFilter && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveFilterMenu("pageSize");
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        style={{
          ...dropdownItemStyle,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Per Page</span>
      </button>
    )}
    {!hasTriggerFilter && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveFilterMenu("trigger");
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        style={{
          ...dropdownItemStyle,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Trigger Condition</span>
      </button>
    )}
    {!hasTargetFilter && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setActiveFilterMenu("target");
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        style={{
          ...dropdownItemStyle,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Target</span>
      </button>
    )}
  </>
);

export const FilterOptionsMenu = ({
  menuType,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  setIsFilterDropdownOpen,
}) => {
  if (menuType === "pageSize") {
    return (
      <>
        {[10, 25, 50, 100].map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => {
              onAddFilter("pageSize", size, `Record per page: ${size}`);
              setIsFilterDropdownOpen(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            style={{
              ...dropdownItemStyle,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <RadioIcon
              checked={
                activeFilters.find((f) => f.type === "pageSize")?.value === size
              }
            />
            <span>{size}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            onRemoveFilter("pageSize");
            setIsFilterDropdownOpen(false);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#005BD3",
            fontSize: "13px",
            cursor: "pointer",
            padding: "12px 16px 8px 16px",
            display: "block",
            textAlign: "left",
          }}
        >
          Clear
        </button>
      </>
    );
  }

  if (menuType === "trigger") {
    return (
      <>
        {["Always show", "Logged customers"].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => {
              onAddFilter("trigger", val, `Trigger: ${val}`);
              setIsFilterDropdownOpen(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            style={{
              ...dropdownItemStyle,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <RadioIcon
              checked={
                activeFilters.find((f) => f.type === "trigger")?.value === val
              }
            />
            <span>{val}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            onRemoveFilter("trigger");
            setIsFilterDropdownOpen(false);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#005BD3",
            fontSize: "13px",
            cursor: "pointer",
            padding: "12px 16px 8px 16px",
            display: "block",
            textAlign: "left",
          }}
        >
          Clear
        </button>
      </>
    );
  }

  if (menuType === "target") {
    return (
      <>
        {[
          "All pages",
          "Home page",
          "Specific collections",
          "Specific products",
          "Custom page",
          "Specific product tags",
        ].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => {
              onAddFilter("target", val, `Target: ${val}`);
              setIsFilterDropdownOpen(false);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F6F8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            style={{
              ...dropdownItemStyle,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <RadioIcon
              checked={
                activeFilters.find((f) => f.type === "target")?.value === val
              }
            />
            <span>{val}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            onRemoveFilter("target");
            setIsFilterDropdownOpen(false);
          }}
          style={{
            background: "none",
            border: "none",
            color: "#005BD3",
            fontSize: "13px",
            cursor: "pointer",
            padding: "12px 16px 8px 16px",
            display: "block",
            textAlign: "left",
          }}
        >
          Clear
        </button>
      </>
    );
  }

  return null;
};
