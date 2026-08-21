export const DEFAULT_CHECKOUT_CONFIG = {
    status: "disabled",
    target: "always",
    heading: "You must be at least 18 years old to purchase these products",
    selectedCollections: [],
    selectedProducts: [],
};

export const BANNER_TEXT_MAX_LENGTH = 255;
export const DEFAULT_BANNER_HEADING = "Age restriction applies";

// "checkbox" — buyer checks a box confirming they meet the minimum age.
// "date_of_birth" — buyer enters Day/Month/Year and the age is computed
// and checked against minAge automatically.
export const VERIFICATION_METHODS = {
    CHECKBOX: "checkbox",
    DATE_OF_BIRTH: "date_of_birth",
};

// message/dobHeading are separate fields (not one shared field) so that
// switching verification method never bleeds one method's saved text into
// the other's UI — e.g. a checkbox message like "I'm over 18 years old."
// showing up as the date-of-birth heading just because it happened to be
// what was last saved in `message`.
export const DEFAULT_AGE_VERIFICATION_CONFIG = {
    status: "disabled",
    target: "always",
    selectedCollections: [],
    selectedProducts: [],
    _collectionTitles: [],
    _productTitles: [],
    minAge: 18,
    verificationMethod: VERIFICATION_METHODS.CHECKBOX,
    message: "I'm over 18 years old.",
    dobHeading: "Enter your date of birth",
    errorMessage: "You must be at least 18 years old to continue.",
};

export const DEFAULT_DOB_HEADING = "Enter your date of birth";

export const AGE_VERIFICATION_TEXT_MAX_LENGTH = 255;
