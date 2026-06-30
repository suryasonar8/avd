import { RadioIcon } from "./Icons";
import { useTranslation } from "../../context/TranslationContext";

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
}) => {
  const { t } = useTranslation();
  return (
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
          <span>{t("storeVerification.filters.perPage")}</span>
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
          <span>{t("storeVerification.filters.triggerCondition")}</span>
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
          <span>{t("storeVerification.filters.target")}</span>
        </button>
      )}
    </>
  );
};

export const FilterOptionsMenu = ({
  menuType,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  setIsFilterDropdownOpen,
}) => {
  const { t } = useTranslation();

  const getTriggerTranslation = (val) => {
    if (val === "Always show") return t("storeVerification.triggerOptions.alwaysShow");
    if (val === "Logged customers") return t("storeVerification.triggerOptions.loggedCustomers");
    return val;
  };

  const getTargetTranslation = (val) => {
    if (val === "All pages") return t("storeVerification.targetOptions.allPages");
    if (val === "Home page") return t("storeVerification.targetOptions.homePage");
    if (val === "Specific collections") return t("storeVerification.targetOptions.specificCollections");
    if (val === "Specific products") return t("storeVerification.targetOptions.specificProducts");
    if (val === "Custom page") return t("storeVerification.targetOptions.customPage");
    if (val === "Specific product tags") return t("storeVerification.targetOptions.specificProductTags");
    return val;
  };

  if (menuType === "pageSize") {
    return (
      <>
        {[10, 25, 50, 100].map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => {
              onAddFilter("pageSize", size, t("storeVerification.filters.recordPerPage", { size }));
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
          {t("common.clear")}
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
              onAddFilter("trigger", val, t("storeVerification.filters.triggerLabel", { value: getTriggerTranslation(val) }));
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
            <span>{getTriggerTranslation(val)}</span>
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
          {t("common.clear")}
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
              onAddFilter("target", val, t("storeVerification.filters.targetLabel", { value: getTargetTranslation(val) }));
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
            <span>{getTargetTranslation(val)}</span>
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
          {t("common.clear")}
        </button>
      </>
    );
  }

  return null;
};
