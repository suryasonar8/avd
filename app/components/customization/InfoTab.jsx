import { Card } from "../Card";
import { Badge } from "../Badge";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
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
      <Card title={t("popupEditor.infoTab.popupInfo")}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "16px",
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
            <select
              value={config.status}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, status: e.target.value }))
              }
              style={{
                boxSizing: "border-box",
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #CBCFD2",
                background: "#FFF",
              }}
            >
              <option value="Enabled">{t("common.enabled")}</option>
              <option value="Disabled">{t("common.disabled")}</option>
            </select>
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
              {t("popupEditor.infoTab.name")} <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={config.name}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("popupEditor.infoTab.enterPopupName")}
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #CBCFD2",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  fontSize: "12px",
                  color: "#6D7175",
                }}
              >
                {config.name.length}/255
              </span>
            </div>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <input
                type="radio"
                name="method"
                checked={config.method === "No input"}
                onChange={() =>
                  setConfig((prev) => ({ ...prev, method: "No input" }))
                }
              />{" "}
              {t("popupEditor.infoTab.noInput")}
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                opacity: 1,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="method"
                checked={config.method === "Birthdate entry"}
                onChange={() =>
                  setConfig((prev) => ({ ...prev, method: "Birthdate entry" }))
                }
              />{" "}
              {t("popupEditor.infoTab.birthdateEntry")}
            </label>
          </div>
        </div>

        {config.method === "Birthdate entry" && (
          <>
            <div style={{ marginTop: "16px", marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                {t("popupEditor.infoTab.verifyAge")}
              </label>
              <input
                type="number"
                value={config.verifyAge || 18}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    verifyAge: parseInt(e.target.value),
                  }))
                }
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #CBCFD2",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
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
              <select
                value={config.dateOrder || "MM,DD,YY"}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, dateOrder: e.target.value }))
                }
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #CBCFD2",
                  background: "#FFF",
                }}
              >
                <option value="MM,DD,YY">MM,DD,YY</option>
                <option value="DD,MM,YY">DD,MM,YY</option>
                <option value="YY,MM,DD">YY,MM,DD</option>
              </select>
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
      </Card>

      <Card
        title={t("checkoutVerification.target")}
        badge={!canAccess("sv.info.pages.home") ? <Badge text={t("common.basicPlanOrHigher")} type="basic" /> : null}
      >
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {DISPLAY_PAGES.map((page) => (
              <div key={page.value}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    cursor:
                      page.value === "All pages" ||
                      canAccess(
                        page.value === "Home page"
                          ? "sv.info.pages.home"
                          : page.value === "Specific collections"
                            ? "sv.info.pages.collections"
                            : page.value === "Specific products"
                              ? "sv.info.pages.products"
                              : "sv.info.pages.custom",
                      )
                        ? "pointer"
                        : "default",
                    opacity:
                      page.value === "All pages" ||
                      canAccess(
                        page.value === "Home page"
                          ? "sv.info.pages.home"
                          : page.value === "Specific collections"
                            ? "sv.info.pages.collections"
                            : page.value === "Specific products"
                              ? "sv.info.pages.products"
                              : "sv.info.pages.custom",
                      )
                        ? 1
                        : 0.6,
                    marginBottom:
                      config.pages === page.value &&
                      page.value !== "All pages" &&
                      page.value !== "Home page"
                        ? "12px"
                        : "0",
                  }}
                >
                  <input
                    type="radio"
                    name="pages"
                    disabled={
                      !(page.value === "All pages") &&
                      !canAccess(
                        page.value === "Home page"
                          ? "sv.info.pages.home"
                          : page.value === "Specific collections"
                            ? "sv.info.pages.collections"
                            : page.value === "Specific products"
                              ? "sv.info.pages.products"
                              : "sv.info.pages.custom",
                      )
                    }
                    checked={config.pages === page.value}
                    onChange={() =>
                      setConfig((prev) => ({ ...prev, pages: page.value }))
                    }
                  />{" "}
                  {t(page.labelKey)}
                </label>

                {page.value === "Specific collections" && config.pages === page.value && (
                  <div style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <label style={{ fontSize: "12px", fontWeight: "600" }}>
                        {t("popupEditor.infoTab.selectedCollections")}
                      </label>
                      <button
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
                                selectedCollections: selected.map((c) => c.id),
                                _collectionTitles: selected.map((c) => c.title),
                                selectedCollectionHandles: selected.map(
                                  (c) => c.handle,
                                ),
                              }));
                            }
                          } catch (e) {
                            console.error("Picker error:", e);
                          }
                        }}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "4px",
                          border: "1px solid #CBCFD2",
                          background: "#FFF",
                          cursor: "pointer",
                        }}
                      >
                        {t("popupEditor.infoTab.selectCollections")}
                      </button>
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
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
                              const newIds = config.selectedCollections.filter(
                                (item) => item !== id,
                              );
                              const newTitles = config._collectionTitles.filter(
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

                {page.value === "Specific products" && config.pages === page.value && (
                  <div style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <label style={{ fontSize: "12px", fontWeight: "600" }}>
                        {t("popupEditor.infoTab.selectedProducts")}
                      </label>
                      <button
                        onClick={async () => {
                          try {
                            const selected = await shopify.resourcePicker({
                              type: "product",
                              multiple: true,
                              selectionIds: (config.selectedProducts || []).map(
                                (id) => ({ id }),
                              ),
                            });
                            if (selected) {
                              setConfig((prev) => ({
                                ...prev,
                                selectedProducts: selected.map((p) => p.id),
                                _productTitles: selected.map((p) => p.title),
                                selectedProductHandles: selected.map(
                                  (p) => p.handle,
                                ),
                              }));
                            }
                          } catch (e) {
                            console.error("Picker error:", e);
                          }
                        }}
                        style={{
                          padding: "4px 8px",
                          fontSize: "12px",
                          borderRadius: "4px",
                          border: "1px solid #CBCFD2",
                          background: "#FFF",
                          cursor: "pointer",
                        }}
                      >
                        {t("popupEditor.infoTab.selectProducts")}
                      </button>
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
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
                              const newTitles = config._productTitles.filter(
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
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      {t("popupEditor.infoTab.addCustomUrl")}
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={t("popupEditor.infoTab.enterUrl")}
                        style={{
                          boxSizing: "border-box",
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #CBCFD2",
                          fontSize: "13px",
                        }}
                      />
                      <button
                        onClick={() => {
                          if (urlInput.trim()) {
                            setConfig((prev) => ({
                              ...prev,
                              customUrl: urlInput.trim(),
                            }));
                            setUrlInput("");
                          }
                        }}
                        style={{
                          padding: "8px 16px",
                          fontSize: "12px",
                          borderRadius: "8px",
                          border: "1px solid #CBCFD2",
                          background: "#FFF",
                          cursor: "pointer",
                        }}
                      >
                        {t("popupEditor.infoTab.addUrl")}
                      </button>
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
              </div>
            ))}
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
            {t("popupEditor.infoTab.triggerCondition")}
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="trigger"
                checked={config.trigger === "Always show"}
                onChange={() =>
                  setConfig((prev) => ({ ...prev, trigger: "Always show" }))
                }
              />{" "}
              {t("popupEditor.infoTab.triggerAlways")}
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                cursor: canAccess("sv.info.trigger.logged")
                  ? "pointer"
                  : "default",
                opacity: canAccess("sv.info.trigger.logged") ? 1 : 0.6,
              }}
            >
              <input
                type="radio"
                name="trigger"
                disabled={!canAccess("sv.info.trigger.logged")}
                checked={config.trigger === "Logged customers"}
                onChange={() =>
                  setConfig((prev) => ({
                    ...prev,
                    trigger: "Logged customers",
                  }))
                }
              />{" "}
              {t("popupEditor.infoTab.triggerLogged")}
            </label>
          </div>
        </div>
      </Card>
    </>
  );
}
