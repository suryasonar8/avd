import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { authenticate } from "../shopify.server";
import { usePlan } from "../context/PlanContext";
import { useTranslation } from "../context/TranslationContext";
import { PopupService } from "../services/popup.service";
import { PLAN_TYPES } from "../constants/features";
import PricingBanner from "../components/PricingBanner";
import CreatePopupCard from "../components/store-verification/CreatePopupCard";
import PopupToolbar from "../components/store-verification/PopupToolbar";
import PopupTable from "../components/store-verification/PopupTable";
import DeleteConfirmModal from "../components/store-verification/DeleteConfirmModal";

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
  const { plan } = usePlan();
  const { t, locale } = useTranslation();
  const deleteModalRef = useRef(null);

  const popupLimit = plan === PLAN_TYPES.FREE ? 1 : 50;
  const canCreate = popups.length < popupLimit;

  // Shared state — needed by parent for filtering/pagination logic
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilters, setActiveFilters] = useState([
    { type: "pageSize", value: 10 },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteMode, setDeleteMode] = useState("all");

  const handleEdit = (id) => {
    navigate(`/store_verification/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm(t("storeVerification.deleteConfirmSingle"))) {
      fetcher.submit({ action: "delete", id }, { method: "POST" });
    }
  };

  const handleAddFilter = (type, value) => {
    setActiveFilters((prev) => {
      const existingIndex = prev.findIndex((f) => f.type === type);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { type, value };
        return next;
      }
      return [...prev, { type, value }];
    });
    setCurrentPage(1);
  };

  const handleRemoveFilter = (type) => {
    setActiveFilters((prev) => prev.filter((f) => f.type !== type));
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setActiveFilters([
      { type: "pageSize", value: 10 },
    ]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSearchQueryChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleBulkDelete = () => {
    setDeleteMode("all");
    deleteModalRef.current?.open();
  };

  const handleDeleteSubmit = () => {
    const idsToDelete =
      deleteMode === "selected" ? selectedIds : popups.map((p) => p.id);
    if (idsToDelete.length === 0) return;
    fetcher.submit(
      { action: "delete_bulk", ids: JSON.stringify(idsToDelete) },
      { method: "POST" },
    );
    setSelectedIds([]);
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

    if (diffMs < 0 || diffSec < 60) return t("storeVerification.relativeTime.justNow");
    if (diffMin < 60)
      return t("storeVerification.relativeTime.minutesAgo", { count: diffMin });
    if (diffHour < 24)
      return t("storeVerification.relativeTime.hoursAgo", { count: diffHour });
    if (diffDay < 7) return t("storeVerification.relativeTime.daysAgo", { count: diffDay });

    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  // Compute filter labels dynamically so they update with language change
  const activeFiltersWithLabels = activeFilters.map((f) => {
    let label = "";
    if (f.type === "pageSize") {
      label = t("storeVerification.filters.recordPerPage", { size: f.value });
    } else if (f.type === "trigger") {
      label = t("storeVerification.filters.triggerLabel", { value: f.value });
    } else if (f.type === "target") {
      label = t("storeVerification.filters.targetLabel", { value: f.value });
    }
    return { ...f, label };
  });

  return (
    <s-page heading={t("storeVerification.pageHeading")}>
      {plan === PLAN_TYPES.FREE && (
        <PricingBanner
          text={t("storeVerification.freePlanBanner.description", { used: popups.length, limit: popupLimit })}
        />
      )}

      {/* Age Verification Pop-up Creation Card */}
      <CreatePopupCard canCreate={canCreate} />

      {/* Pop-up list Section */}
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1A1C1D" }}>
          {t("storeVerification.popupList")}
        </h3>
      </div>

      {popups.length > 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E1E3E5",
            borderRadius: "12px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Header Action Toolbar Panel */}
          <PopupToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchQueryChange}
            activeFilters={activeFiltersWithLabels}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            onClearAllFilters={handleClearAllFilters}
            onBulkDelete={handleBulkDelete}
          />

          <PopupTable
            paginatedPopups={paginatedPopups}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenDeleteModal={() => {
              setDeleteMode("selected");
              deleteModalRef.current?.open();
            }}
            getRelativeTime={getRelativeTime}
          />

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
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
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
              {t("storeVerification.paginationShowing", {
                start: totalItems === 0 ? 0 : startIndex + 1,
                end: Math.min(startIndex + itemsPerPage, totalItems),
                total: totalItems
              })}
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
            {t("storeVerification.emptyStateTitle")}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#6D7175",
              maxWidth: "400px",
              lineHeight: "1.5",
            }}
          >
            {t("storeVerification.emptyStateDescription")}
          </p>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmModal ref={deleteModalRef} onConfirm={handleDeleteSubmit} />
    </s-page>
  );
}
