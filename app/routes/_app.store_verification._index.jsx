import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { authenticate } from "../shopify.server";
import { usePlan } from "../context/PlanContext";
import { PopupService } from "../services/popup.service";
import { PLAN_TYPES } from "../constants/features";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const popups = await PopupService.getPopups(session.shop);
  return { popups };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("action");
  const popupId = formData.get("id");

  if (actionType === "delete") {
    await PopupService.deletePopup(admin, session.shop, popupId);
    return { success: true };
  }
  if (actionType === "delete_bulk") {
    const ids = JSON.parse(formData.get("ids") || "[]");
    await PopupService.deletePopups(admin, session.shop, ids);
    return { success: true };
  }
  return null;
};

export default function AppPage() {
  const { popups } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { canAccess, plan } = usePlan();

  const popupLimit = plan === PLAN_TYPES.FREE ? 1 : 50;
  const canCreate = popups.length < popupLimit;

  // Search, filter, edit/delete state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([
    { type: "pageSize", label: "Record per page: 10", value: 10 },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleCreatePopUp = () => {
    if (!canCreate) {
      navigate("/pricing");
      return;
    }
    navigate("/store_verification/customization");
  };

  const handleEdit = (id) => {
    navigate(`/store_verification/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this pop-up?")) {
      fetcher.submit({ action: "delete", id }, { method: "POST" });
    }
  };

  const handleAddFilter = (type, value, label) => {
    setActiveFilters((prev) => {
      // Remove any existing filter of this type first
      const clean = prev.filter((f) => f.type !== type);
      return [...clean, { type, value, label }];
    });
    setIsFilterDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (type) => {
    setActiveFilters((prev) => prev.filter((f) => f.type !== type));
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setActiveFilters([
      { type: "pageSize", label: "Record per page: 10", value: 10 },
    ]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleBulkDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = () => {
    const allIds = popups.map((p) => p.id);
    if (allIds.length === 0) return;
    fetcher.submit(
      { action: "delete_bulk", ids: JSON.stringify(allIds) },
      { method: "POST" },
    );
    setSelectedIds([]);
    setIsDeleteModalOpen(false);
  };

  // Helper for relative time formatting
  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMs < 0 || diffSec < 60) return "Just now";
    if (diffMin < 60)
      return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
    if (diffHour < 24)
      return `${diffHour} ${diffHour === 1 ? "hour" : "hours"} ago`;
    if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Click outside filter dropdown listener
  useEffect(() => {
    if (!isFilterDropdownOpen) return;
    const clickOutside = () => setIsFilterDropdownOpen(false);
    window.addEventListener("click", clickOutside);
    return () => window.removeEventListener("click", clickOutside);
  }, [isFilterDropdownOpen]);

  // Filters computed list
  const statusFilter = activeFilters.find((f) => f.type === "status")?.value;
  const triggerFilter = activeFilters.find((f) => f.type === "trigger")?.value;
  const targetFilter = activeFilters.find((f) => f.type === "target")?.value;
  const filteredPopups = popups.filter((p) => {
    if (
      searchQuery &&
      !p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter && p.status !== statusFilter) {
      return false;
    }
    if (triggerFilter && p.trigger !== triggerFilter) {
      return false;
    }
    if (targetFilter && p.target !== targetFilter) {
      return false;
    }
    return true;
  });

  const hasPageSizeFilter = activeFilters.some((f) => f.type === "pageSize");
  const hasStatusFilter = activeFilters.some((f) => f.type === "status");
  const hasTriggerFilter = activeFilters.some((f) => f.type === "trigger");
  const hasTargetFilter = activeFilters.some((f) => f.type === "target");

  // Safe checks on selection lists
  useEffect(() => {
    const visibleIds = filteredPopups.map((p) => p.id);
    setSelectedIds((prev) => prev.filter((id) => visibleIds.includes(id)));
  }, [searchQuery, activeFilters, popups]);

  // Pagination calculations
  const pageSizeFilter = activeFilters.find((f) => f.type === "pageSize");
  const itemsPerPage = pageSizeFilter ? pageSizeFilter.value : 10;

  const totalItems = filteredPopups.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedPopups = filteredPopups.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const dropdownItemStyle = {
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

  return (
    <s-page heading="Store verification">
      {plan === PLAN_TYPES.FREE && (
        <div
          style={{
            background: "#BDE6FF",
            borderRadius: "10px",
            padding: "16px 20px",
            marginBottom: "24px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            border: "1px solid #A2D9FF",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", color: "#005F99" }}>ⓘ</span>
              <span
                style={{
                  fontWeight: "700",
                  color: "#1A1C1D",
                  fontSize: "13px",
                }}
              >
                Free Plan Limit
              </span>
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#4A4D4F",
                lineHeight: "1.5",
                maxWidth: "600px",
              }}
            >
              Your current plan includes 1 pop-up ({popups.length}/{popupLimit}{" "}
              used). Upgrade to unlock more pop-ups, advanced customization and
              more.
            </div>
          </div>
          <button
            onClick={() => navigate("/pricing")}
            style={{
              padding: "8px 16px",
              background: "#FFF",
              border: "1px solid #005F99",
              borderRadius: "6px",
              color: "#005F99",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Upgrade plan
          </button>
        </div>
      )}

      {/* Age Verification Pop-up Creation Card */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E1E3E5",
          borderRadius: "12px",
          display: "flex",
          overflow: "hidden",
          marginBottom: "24px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            width: "240px",
            background: "#F6F6F7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            borderRight: "1px solid #E1E3E5",
          }}
        >
          <img
            src="/popup-illustration.png"
            alt="Pop-up Illustration"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
        <div
          style={{
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>
            Age Verification Pop-up
          </h2>
          <p style={{ fontSize: "14px", color: "#6D7175", margin: 0 }}>
            Verify customers&apos; age with pop-ups triggered by various
            conditions.
          </p>
          <div style={{ marginTop: "8px" }}>
            <button
              onClick={handleCreatePopUp}
              style={{
                background: canCreate ? "#202223" : "#F1F1F1",
                color: canCreate ? "#FFFFFF" : "#919EAB",
                border: canCreate ? "none" : "1px solid #CBCFD2",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: canCreate ? "pointer" : "not-allowed",
              }}
            >
              {canCreate ? "Create pop-up" : "Limit reached"}
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up list Section */}
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1A1C1D" }}>
          Pop-up list
        </h3>
      </div>

      {popups.length > 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E1E3E5",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Header Action Toolbar Panel */}
          {!isSearching ? (
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#FFFFFF",
                borderBottom: "1px solid #E1E3E5",
              }}
            >
              <div></div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {/* Search Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsSearching(true)}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E1E3E5",
                    borderRadius: "8px",
                    width: "60px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    gap: "1px",
                  }}
                  title="Search & Filters"
                >
                  <svg
                    width="20"
                    height="20"
                    style={{ flexShrink: 0 }}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 3a5 5 0 100 10 5 5 0 000-10zM1.5 8a6.5 6.5 0 1111.966 3.864l4.238 4.238a1 1 0 01-1.414 1.414l-4.238-4.238A6.5 6.5 0 011.5 8z"
                      fill="#4B4E50"
                    />
                  </svg>

                  <svg
                    width="20"
                    height="20"
                    style={{ flexShrink: 0 }}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 6h4v1.5h-4V6zm-2 9h6v1.5h-6V15zM13 10.5h5V12h-5v-1.5z"
                      fill="#4B4E50"
                    />
                  </svg>
                </button>

                {/* Bulk Delete Button */}
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E1E3E5",
                    borderRadius: "8px",
                    width: "60px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#FF4D4D",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                  title="Delete All Pop-ups"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Open Search state */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                borderBottom: "1px solid #E1E3E5",
                background: "#FFFFFF",
              }}
            >
              <div
                style={{
                  padding: "16px 20px 8px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      color: "#6D7175",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 3a5 5 0 100 10 5 5 0 000-10zM1.5 8a6.5 6.5 0 1111.966 3.864l4.238 4.238a1 1 0 01-1.414 1.414l-4.238-4.238A6.5 6.5 0 011.5 8z"
                        fill="#6D7175"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Searching by pop-up name"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 42px",
                      border: "2px solid #005BD3",
                      borderRadius: "20px",
                      outline: "none",
                      fontSize: "14px",
                      background: "#FFFFFF",
                      boxSizing: "border-box",
                    }}
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearching(false);
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1A1C1D",
                    cursor: "pointer",
                    padding: "6px 12px",
                  }}
                >
                  Cancel
                </button>
              </div>

              {/* Filters tags row */}
              <div
                style={{
                  padding: "8px 20px 16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {activeFilters.map((filter, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#F1F2F3",
                      border: "1px solid #E1E3E5",
                      borderRadius: "16px",
                      padding: "4px 12px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#1A1C1D",
                    }}
                  >
                    <span>{filter.label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter(filter.type)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                        color: "#6D7175",
                        fontWeight: "600",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add Filter + Dropdown Menu */}
                <div
                  style={{ position: "relative" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFilterDropdownOpen(!isFilterDropdownOpen);
                    }}
                    style={{
                      background: "#FFFFFF",
                      border: "1px dashed #CBCFD2",
                      borderRadius: "16px",
                      padding: "4px 12px",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#4A4D4F",
                    }}
                  >
                    Add filter +
                  </button>

                  {isFilterDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        background: "#FFFFFF",
                        border: "1px solid #E1E3E5",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 100,
                        marginTop: "6px",
                        padding: "8px 0",
                        minWidth: "180px",
                      }}
                    >
                      {!hasPageSizeFilter && (
                        <>
                          <div
                            style={{
                              padding: "4px 12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#6D7175",
                              textTransform: "uppercase",
                            }}
                          >
                            Records Per Page
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddFilter(
                                "pageSize",
                                5,
                                "Record per page: 5",
                              )
                            }
                            onMouseEnter={(e) =>
                              (e.target.style.background = "#F4F6F8")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "none")
                            }
                            style={dropdownItemStyle}
                          >
                            5 per page
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddFilter(
                                "pageSize",
                                10,
                                "Record per page: 10",
                              )
                            }
                            onMouseEnter={(e) =>
                              (e.target.style.background = "#F4F6F8")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "none")
                            }
                            style={dropdownItemStyle}
                          >
                            10 per page
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddFilter(
                                "pageSize",
                                20,
                                "Record per page: 20",
                              )
                            }
                            onMouseEnter={(e) =>
                              (e.target.style.background = "#F4F6F8")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "none")
                            }
                            style={dropdownItemStyle}
                          >
                            20 per page
                          </button>
                        </>
                      )}

                      <div
                        style={{
                          borderTop: "1px solid #F1F2F3",
                          margin: "6px 0",
                        }}
                      ></div>

                      {!hasStatusFilter && (
                        <>
                          <div
                            style={{
                              borderTop: "1px solid #F1F2F3",
                              margin: "6px 0",
                            }}
                          />

                          <div
                            style={{
                              padding: "4px 12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#6D7175",
                              textTransform: "uppercase",
                            }}
                          >
                            Status
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddFilter(
                                "status",
                                "Enabled",
                                "Status: Enabled",
                              )
                            }
                            onMouseEnter={(e) =>
                              (e.target.style.background = "#F4F6F8")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "none")
                            }
                            style={dropdownItemStyle}
                          >
                            Enabled
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleAddFilter(
                                "status",
                                "Disabled",
                                "Status: Disabled",
                              )
                            }
                            onMouseEnter={(e) =>
                              (e.target.style.background = "#F4F6F8")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "none")
                            }
                            style={dropdownItemStyle}
                          >
                            Disabled
                          </button>
                        </>
                      )}

                      <div
                        style={{
                          borderTop: "1px solid #F1F2F3",
                          margin: "6px 0",
                        }}
                      ></div>

                      {!hasTriggerFilter && (
                        <>
                          <div
                            style={{
                              borderTop: "1px solid #F1F2F3",
                              margin: "6px 0",
                            }}
                          />

                          <div
                            style={{
                              padding: "4px 12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#6D7175",
                              textTransform: "uppercase",
                            }}
                          >
                            Trigger Condition
                          </div>

                          {["Always show", "Logged customers"].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                handleAddFilter(
                                  "trigger",
                                  val,
                                  `Trigger: ${val}`,
                                )
                              }
                              onMouseEnter={(e) =>
                                (e.target.style.background = "#F4F6F8")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.background = "none")
                              }
                              style={dropdownItemStyle}
                            >
                              {val}
                            </button>
                          ))}
                        </>
                      )}

                      <div
                        style={{
                          borderTop: "1px solid #F1F2F3",
                          margin: "6px 0",
                        }}
                      ></div>

                      {!hasTargetFilter && (
                        <>
                          <div
                            style={{
                              borderTop: "1px solid #F1F2F3",
                              margin: "6px 0",
                            }}
                          />

                          <div
                            style={{
                              padding: "4px 12px",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#6D7175",
                              textTransform: "uppercase",
                            }}
                          >
                            Target
                          </div>

                          {[
                            "All pages",
                            "Home page",
                            "Specific collections",
                            "Specific products",
                            "Custom",
                          ].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                handleAddFilter("target", val, `Target: ${val}`)
                              }
                              onMouseEnter={(e) =>
                                (e.target.style.background = "#F4F6F8")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.background = "none")
                              }
                              style={dropdownItemStyle}
                            >
                              {val}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Clear all */}
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#005BD3",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    padding: "4px 8px",
                  }}
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              {selectedIds.length > 0 ? (
                <tr
                  style={{
                    background: "#FFFFFF",
                    borderBottom: "1px solid #E1E3E5",
                    textAlign: "left",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 16px",
                      width: "48px",
                      verticalAlign: "middle",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        paginatedPopups.length > 0 &&
                        paginatedPopups.every((p) => selectedIds.includes(p.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          const toAdd = paginatedPopups.map((p) => p.id);
                          setSelectedIds((prev) =>
                            Array.from(new Set([...prev, ...toAdd])),
                          );
                        } else {
                          const toRemove = paginatedPopups.map((p) => p.id);
                          setSelectedIds((prev) =>
                            prev.filter((id) => !toRemove.includes(id)),
                          );
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th
                    colSpan="4"
                    style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1A1C1D",
                      verticalAlign: "middle",
                    }}
                  >
                    {selectedIds.length} selected
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#4A4D4F",
                    }}
                  ></th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#F4F6F8")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "#FFFFFF")
                        }
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #CBCFD2",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#1A1C1D",
                          cursor: "pointer",
                          transition: "background 0.1s",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#F4F6F8")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "#FFFFFF")
                        }
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #CBCFD2",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#1A1C1D",
                          cursor: "pointer",
                          transition: "background 0.1s",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </th>
                </tr>
              ) : (
                <tr style={{ background: "#F6F6F7", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", width: "48px" }}>
                    <input
                      type="checkbox"
                      checked={
                        paginatedPopups.length > 0 &&
                        paginatedPopups.every((p) => selectedIds.includes(p.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          const toAdd = paginatedPopups.map((p) => p.id);
                          setSelectedIds((prev) =>
                            Array.from(new Set([...prev, ...toAdd])),
                          );
                        } else {
                          const toRemove = paginatedPopups.map((p) => p.id);
                          setSelectedIds((prev) =>
                            prev.filter((id) => !toRemove.includes(id)),
                          );
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th style={{ padding: "12px 16px", fontSize: "13px" }}>
                    Pop-up name
                  </th>
                  <th style={{ padding: "12px 16px", fontSize: "13px" }}>
                    Target
                  </th>
                  <th style={{ padding: "12px 16px", fontSize: "13px" }}>
                    Trigger condition
                  </th>
                  <th style={{ padding: "12px 16px", fontSize: "13px" }}>
                    Last updated
                  </th>
                  <th style={{ padding: "12px 16px", fontSize: "13px" }}>
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      textAlign: "right",
                    }}
                  >
                    Action
                  </th>
                </tr>
              )}
            </thead>
            <tbody>
              {paginatedPopups.map((popup) => (
                <tr
                  key={popup.id}
                  style={{ borderTop: "1px solid #E1E3E5", fontSize: "13px" }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(popup.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds((prev) => [...prev, popup.id]);
                        } else {
                          setSelectedIds((prev) =>
                            prev.filter((id) => id !== popup.id),
                          );
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontWeight: "500",
                      color: "#1A1C1D",
                    }}
                  >
                    {popup.name}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#4A4D4F" }}>
                    {popup.target}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#4A4D4F" }}>
                    {popup.trigger}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#4A4D4F" }}>
                    {getRelativeTime(popup.updatedAt)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background:
                          popup.status === "Enabled" ? "#E3FBE3" : "#F1F2F3",
                        color:
                          popup.status === "Enabled" ? "#007F5F" : "#4A4D4F",
                        padding: "4px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {popup.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(popup.id)}
                        type="button"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#202223")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#6D7175")
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6D7175",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.1s",
                        }}
                        title="Edit"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(popup.id)}
                        type="button"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#FF4D4D")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#6D7175")
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6D7175",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.1s",
                        }}
                        title="Delete"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPopups.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      color: "#6D7175",
                    }}
                  >
                    No pop-ups match the search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Centered Pagination Control Panel */}
          <div
            style={{
              padding: "16px 20px",
              background: "#FFFFFF",
              borderTop: "1px solid #E1E3E5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #E1E3E5",
                background: activePage === 1 ? "#F6F6F7" : "#FFFFFF",
                color: activePage === 1 ? "#BABFC4" : "#4A4D4F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: activePage === 1 ? "not-allowed" : "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span style={{ fontSize: "13px", color: "#4A4D4F" }}>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}{" "}
              item(s)
            </span>
            <button
              type="button"
              disabled={activePage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #E1E3E5",
                background: activePage === totalPages ? "#F6F6F7" : "#FFFFFF",
                color: activePage === totalPages ? "#BABFC4" : "#4A4D4F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: activePage === totalPages ? "not-allowed" : "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E1E3E5",
            borderRadius: "12px",
            padding: "64px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <img
              src="/empty-state.png"
              alt="Empty state"
              style={{ width: "200px", height: "auto" }}
            />
          </div>
          <h2
            style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}
          >
            Whoops! You don&apos;t have any pop-ups yet.
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#6D7175",
              maxWidth: "400px",
              lineHeight: "1.5",
            }}
          >
            Create and customize a new pop-up now to start verify
            customers&apos; age.
          </p>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          onClick={() => setIsDeleteModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              width: "100%",
              maxWidth: "480px",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #F1F2F3",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1A1C1D",
                }}
              >
                Do you want to delete all selected rules
              </span>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6D7175",
                  fontSize: "20px",
                  lineHeight: 1,
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "24px",
                fontSize: "14px",
                color: "#4A4D4F",
                lineHeight: "1.6",
              }}
            >
              If you delete the rule, you won't be able to revert it
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderTop: "1px solid #F1F2F3",
              }}
            >
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F4F6F8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#FFFFFF")
                }
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #CBCFD2",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1A1C1D",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#3a3c3e")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#202223")
                }
                style={{
                  background: "#202223",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </s-page>
  );
}
