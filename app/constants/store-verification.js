import { DISPLAY_PAGES } from "./display-pages";

export const APP_EMBED_BLOCK_TYPE = "age-verification-dialog";

export const DEFAULT_STORE_CONFIG = {
    name: "My Pop-up",
    status: "Enabled",
    method: "No input",
    verifyAge: 18,
    dateOrder: "MM,DD,YY",
    pages: DISPLAY_PAGES[0],
    trigger: "Always show",
    background: {
        type: "Solid color background",
        pageColor: "#FFFFFFD3",
        bgColor: "#000000",
        logo: null,
        borderColor: "#FFFFFF",
        borderRadius: 0,
        borderWidth: 0,
    },
    text: {
        heading: "WELCOME TO SHOPs",
        subheading: "You must be at least 18 to visit this site",
    },
    button: {
        submitText: "OK",
        cancelText: "CANCEL",
        cancelAction: "redirect",
        redirectUrl: "https://www.google.com/",
        errorMsg: "Enter error message",
        cancelErrorMsg: "Enter error message",
        bgColor: "#FE4D01",
        borderColor: "#FFFFFF",
        borderRadius: 0,
        borderWidth: 0,
        cancelBgColor: "#A0A0A0",
        cancelBorderColor: "#FFFFFF",
        cancelBorderRadius: 0,
        cancelBorderWidth: 0,
    },
    css: "",
};
