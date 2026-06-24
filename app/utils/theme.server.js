import { APP_EMBED_BLOCK_TYPE } from "../constants/store-verification";

/**
 * Checks if the app embed is enabled in the main theme.
 * @param {Object} mainTheme The main theme object from Shopify API (must include files nodes for settings_data.json)
 * @returns {Promise<boolean>} True if the app embed is found and not disabled.
 */
export async function getAppEmbedStatus(mainTheme) {
    let appEmbedEnabled = false;
    try {
        const fileNode = mainTheme?.files?.nodes?.[0];
        const settingsFileContent = fileNode?.body?.content;

        if (settingsFileContent) {
            try {
                // Strip potential comments or leading/trailing non-JSON content
                const jsonStart = settingsFileContent.indexOf("{");
                const jsonEnd = settingsFileContent.lastIndexOf("}");

                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonContent = settingsFileContent.substring(
                        jsonStart,
                        jsonEnd + 1,
                    );
                    const settingsData = JSON.parse(jsonContent);
                    const currentSettings = settingsData.current || {};
                    const blocks = currentSettings.blocks || {};

                    for (const [, block] of Object.entries(blocks)) {
                        if (block.type) {
                            if (
                                (block.type.includes(APP_EMBED_BLOCK_TYPE) ||
                                    block.type.includes("age_verification")) &&
                                block.disabled !== true
                            ) {
                                appEmbedEnabled = true;
                                break;
                            }
                        }
                    }
                }
            } catch (parseError) {
                console.error("Failed to parse settings_data.json:", parseError);
            }
        }
    } catch (e) {
        console.error("Error checking app embed status:", e);
    }
    return appEmbedEnabled;
}
