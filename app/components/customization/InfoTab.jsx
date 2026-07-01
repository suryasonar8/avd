import { Badge } from "../Badge";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useState, Fragment } from "react";
import { usePlan } from "../../context/PlanContext";
import { DISPLAY_PAGES } from "../../constants/display-pages";
import { useTranslation } from "../../context/TranslationContext";

export function InfoTab({ config, setConfig }) {
  const shopify = useAppBridge();
  const [urlInput, setUrlInput] = useState("");
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  return (
    <>
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
          {t("popupEditor.infoTab.popupInfo")}
        </s-text>
        <s-divider></s-divider>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              {t("popupEditor.infoTab.status")}
            </label>
            <s-select
              value={config.status}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  status: e.currentTarget.value,
                }))
              }
            >
              <s-option value="Enabled">{t("common.enabled")}</s-option>
              <s-option value="Disabled">{t("common.disabled")}</s-option>
            </s-select>
          </div>

          <div>
            <s-text-field
              label={t("popupEditor.infoTab.name")}
              required
              value={config.name}
              placeholder={t("popupEditor.infoTab.enterPopupName")}
              maxLength={255}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, name: e.currentTarget.value }))
              }
            />
            <p
              style={{
                fontSize: "11px",
                color: "#6D7175",
                marginTop: "4px",
              }}
            >
              {t("popupEditor.infoTab.nameHelpText")}
            </p>
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            {t("popupEditor.infoTab.method")}
          </label>
          <s-choice-list
            name="method"
            value={config.method}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, method: e.currentTarget.value }))
            }
          >
            <s-choice value="No input">
              {t("popupEditor.infoTab.noInput")}
            </s-choice>
            <s-choice value="Birthdate entry">
              {t("popupEditor.infoTab.birthdateEntry")}
            </s-choice>
          </s-choice-list>
        </div>

        {config.method === "Birthdate entry" && (
          <>
            <div>
              <s-text-field
                type="number"
                label={t("popupEditor.infoTab.verifyAge")}
                value={String(config.verifyAge || 18)}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    verifyAge: parseInt(e.currentTarget.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                {t("popupEditor.infoTab.dateOrder")}
              </label>
              <s-select
                value={config.dateOrder || "MM,DD,YY"}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    dateOrder: e.currentTarget.value,
                  }))
                }
              >
                <s-option value="MM,DD,YY">MM,DD,YY</s-option>
                <s-option value="DD,MM,YY">DD,MM,YY</s-option>
                <s-option value="YY,MM,DD">YY,MM,DD</s-option>
              </s-select>
              <p
                style={{
                  fontSize: "11px",
                  color: "#6D7175",
                  marginTop: "4px",
                }}
              >
                {t("popupEditor.infoTab.dateOrderHelpText")}
              </p>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <s-text variant="headingMd" as="h2" style={{ margin: 0 }}>
            {t("popupEditor.infoTab.condition")}
          </s-text>
          {!canAccess("sv.info.pages.home") ? (
            <Badge text={t("common.basicPlanOrHigher")} type="basic" />
          ) : null}
        </div>
        <s-divider></s-divider>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            {t("popupEditor.infoTab.displayPages")}
          </label>
          <s-choice-list
            name="pages"
            value={config.pages}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, pages: e.currentTarget.value }))
            }
          >
            {DISPLAY_PAGES.map((page) => {
              const hasAccess =
                page.value === "All pages" ||
                canAccess(
                  page.value === "Home page"
                    ? "sv.info.pages.home"
                    : page.value === "Specific collections"
                      ? "sv.info.pages.collections"
                      : page.value === "Specific products"
                        ? "sv.info.pages.products"
                        : "sv.info.pages.custom",
                );
              return (
                <Fragment key={page.value}>
                  <s-choice value={page.value} disabled={!hasAccess}>
                    {t(page.labelKey)}
                  </s-choice>

                  {page.value === "Specific collections" &&
                    config.pages === page.value && (
                      <div
                        style={{ marginBottom: "16px", paddingLeft: "24px" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <label
                            style={{ fontSize: "12px", fontWeight: "600" }}
                          >
                            {t("popupEditor.infoTab.selectedCollections")}
                          </label>
                          <s-button
                            onClick={async () => {
                              try {
                                const selected = await shopify.resourcePicker({
                                  type: "collection",
                                  multiple: true,
                                  selectionIds: (
                                    config.selectedCollections || []
                                  ).map((id) => ({ id })),
                                });
                                if (selected) {
                                  setConfig((prev) => ({
                                    ...prev,
                                    selectedCollections: selected.map(
                                      (c) => c.id,
                                    ),
                                    _collectionTitles: selected.map(
                                      (c) => c.title,
                                    ),
                                    selectedCollectionHandles: selected.map(
                                      (c) => c.handle,
                                    ),
                                  }));
                                }
                              } catch (e) {
                                console.error("Picker error:", e);
                              }
                            }}
                          >
                            {t("popupEditor.infoTab.selectCollections")}
                          </s-button>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {(config.selectedCollections || []).map((id, i) => (
                            <div
                              key={id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                background: "#F1F1F1",
                                borderRadius: "4px",
                                fontSize: "12px",
                              }}
                            >
                              {(config._collectionTitles || [])[i] ||
                                id.replace("gid://shopify/Collection/", "#")}
                              <span
                                onClick={() => {
                                  const newIds =
                                    config.selectedCollections.filter(
                                      (item) => item !== id,
                                    );
                                  const newTitles =
                                    config._collectionTitles.filter(
                                      (_, idx) => idx !== i,
                                    );
                                  const newHandles = (
                                    config.selectedCollectionHandles || []
                                  ).filter((_, idx) => idx !== i);
                                  setConfig((prev) => ({
                                    ...prev,
                                    selectedCollections: newIds,
                                    _collectionTitles: newTitles,
                                    selectedCollectionHandles: newHandles,
                                  }));
                                }}
                                style={{
                                  cursor: "pointer",
                                  color: "#6D7175",
                                  fontWeight: "bold",
                                }}
                              >
                                ×
                              </span>
                            </div>
                          ))}
                          {(config.selectedCollections || []).length === 0 && (
                            <p style={{ fontSize: "12px", color: "#6D7175" }}>
                              {t("popupEditor.infoTab.noCollectionsSelected")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {page.value === "Specific products" &&
                    config.pages === page.value && (
                      <div
                        style={{ marginBottom: "16px", paddingLeft: "24px" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <label
                            style={{ fontSize: "12px", fontWeight: "600" }}
                          >
                            {t("popupEditor.infoTab.selectedProducts")}
                          </label>
                          <s-button
                            onClick={async () => {
                              try {
                                const selected = await shopify.resourcePicker({
                                  type: "product",
                                  multiple: true,
                                  selectionIds: (
                                    config.selectedProducts || []
                                  ).map((id) => ({ id })),
                                });
                                if (selected) {
                                  setConfig((prev) => ({
                                    ...prev,
                                    selectedProducts: selected.map((p) => p.id),
                                    _productTitles: selected.map(
                                      (p) => p.title,
                                    ),
                                    selectedProductHandles: selected.map(
                                      (p) => p.handle,
                                    ),
                                  }));
                                }
                              } catch (e) {
                                console.error("Picker error:", e);
                              }
                            }}
                          >
                            {t("popupEditor.infoTab.selectProducts")}
                          </s-button>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {(config.selectedProducts || []).map((id, i) => (
                            <div
                              key={id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                background: "#F1F1F1",
                                borderRadius: "4px",
                                fontSize: "12px",
                              }}
                            >
                              {(config._productTitles || [])[i] ||
                                id.replace("gid://shopify/Product/", "#")}
                              <span
                                onClick={() => {
                                  const newIds = config.selectedProducts.filter(
                                    (item) => item !== id,
                                  );
                                  const newTitles =
                                    config._productTitles.filter(
                                      (_, idx) => idx !== i,
                                    );
                                  const newHandles = (
                                    config.selectedProductHandles || []
                                  ).filter((_, idx) => idx !== i);
                                  setConfig((prev) => ({
                                    ...prev,
                                    selectedProducts: newIds,
                                    _productTitles: newTitles,
                                    selectedProductHandles: newHandles,
                                  }));
                                }}
                                style={{
                                  cursor: "pointer",
                                  color: "#6D7175",
                                  fontWeight: "bold",
                                }}
                              >
                                ×
                              </span>
                            </div>
                          ))}
                          {(config.selectedProducts || []).length === 0 && (
                            <p style={{ fontSize: "12px", color: "#6D7175" }}>
                              {t("popupEditor.infoTab.noProductsSelected")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {page.value === "Custom" && config.pages === page.value && (
                    <div style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginBottom: "8px",
                          alignItems: "flex-end",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <s-text-field
                            label={t("popupEditor.infoTab.addCustomUrl")}
                            value={urlInput}
                            placeholder={t("popupEditor.infoTab.enterUrl")}
                            onChange={(e) => setUrlInput(e.currentTarget.value)}
                          />
                        </div>
                        <s-button
                          onClick={() => {
                            if (urlInput.trim()) {
                              setConfig((prev) => ({
                                ...prev,
                                customUrl: urlInput.trim(),
                              }));
                              setUrlInput("");
                            }
                          }}
                        >
                          {t("popupEditor.infoTab.addUrl")}
                        </s-button>
                      </div>
                      {config.customUrl && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 12px",
                            background: "#F1F1F1",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          <span
                            style={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {config.customUrl}
                          </span>
                          <span
                            onClick={() =>
                              setConfig((prev) => ({ ...prev, customUrl: "" }))
                            }
                            style={{
                              cursor: "pointer",
                              color: "#6D7175",
                              fontWeight: "bold",
                              fontSize: "14px",
                            }}
                          >
                            ×
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </s-choice-list>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            {t("popupEditor.infoTab.triggerCondition")}
          </label>
          <s-choice-list
            name="trigger"
            value={config.trigger}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, trigger: e.currentTarget.value }))
            }
          >
            <s-choice value="Always show">
              {t("popupEditor.infoTab.triggerAlways")}
            </s-choice>
            <s-choice
              value="Logged customers"
              disabled={!canAccess("sv.info.trigger.logged")}
            >
              {t("popupEditor.infoTab.triggerLogged")}
            </s-choice>
          </s-choice-list>
        </div>
      </div>
    </>
  );
}
