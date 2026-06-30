/**
 * Display pages — the `value` is what gets persisted to the database.
 * Use `labelKey` with t() for the translated display label.
 */
export const DISPLAY_PAGES = [
    { value: "All pages", labelKey: "displayPages.allPages" },
    { value: "Home page", labelKey: "displayPages.homePage" },
    { value: "Specific collections", labelKey: "displayPages.specificCollections" },
    { value: "Specific products", labelKey: "displayPages.specificProducts" },
    { value: "Custom", labelKey: "displayPages.custom" },
];

/**
 * Helper to get the stored value from a display page label key.
 */
export const getDisplayPageValue = (labelKeyOrValue) => {
    const match = DISPLAY_PAGES.find(
        (p) => p.labelKey === labelKeyOrValue || p.value === labelKeyOrValue,
    );
    return match ? match.value : labelKeyOrValue;
};
