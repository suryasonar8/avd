import { Card } from "../Card";
import { Badge } from "../Badge";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useState } from "react";
import { DISPLAY_PAGES } from "../../constants/display-pages";

export function InfoTab({ config, setConfig }) {
  const shopify = useAppBridge();
  const [urlInput, setUrlInput] = useState("");
  return (
    <>
      <Card title="Pop-up Info">
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
              Status
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
              <option>Enabled</option>
              <option>Disabled</option>
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
              Name <span style={{ color: "red" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={config.name}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter your pop-up name"
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
              For internal reference. Only you can see it.
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
            Method
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
              No input
            </label>
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
                checked={config.method === "Birthdate entry"}
                onChange={() =>
                  setConfig((prev) => ({ ...prev, method: "Birthdate entry" }))
                }
              />{" "}
              Birthdate entry
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
                Verify age
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
                Date order
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
                This format displays the date as May-01-2024.
              </p>
            </div>
          </>
        )}
      </Card>

      <Card
        title="Condition"
        badge={<Badge text="Basic plan or higher" type="basic" />}
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
            Display page(s)
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {DISPLAY_PAGES.map((page) => (
              <div key={page}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    cursor: "pointer",
                    marginBottom:
                      config.pages === page &&
                      page !== "All pages" &&
                      page !== "Home page"
                        ? "12px"
                        : "0",
                  }}
                >
                  <input
                    type="radio"
                    name="pages"
                    checked={config.pages === page}
                    onChange={() =>
                      setConfig((prev) => ({ ...prev, pages: page }))
                    }
                  />{" "}
                  {page}
                </label>

                {page === "Specific collections" && config.pages === page && (
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
                        Selected Collections
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
                        Select Collections
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
                          No collections selected
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {page === "Specific products" && config.pages === page && (
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
                        Selected Products
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
                        Select Products
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
                          No products selected
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {page === "Custom" && config.pages === page && (
                  <div style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      Add custom URL
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
                        placeholder="Enter URL (e.g. https://xyz.myshopify.com/products/snowboard)"
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
                        Add URL
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
            Trigger condition
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
              Always show
            </label>
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
                checked={config.trigger === "Logged customers"}
                onChange={() =>
                  setConfig((prev) => ({
                    ...prev,
                    trigger: "Logged customers",
                  }))
                }
              />{" "}
              Logged customers
            </label>
          </div>
        </div>
      </Card>
    </>
  );
}
