import { useTranslation } from "../../context/TranslationContext";

export default function PopupTable({
  paginatedPopups,
  selectedIds,
  onSelectedIdsChange,
  onEdit,
  onDelete,
  onOpenDeleteModal,
  getRelativeTime,
}) {
  const { t } = useTranslation();

  const getTargetTranslation = (val) => {
    if (val === "All pages") return t("storeVerification.targetOptions.allPages");
    if (val === "Home page") return t("storeVerification.targetOptions.homePage");
    if (val === "Specific collections") return t("storeVerification.targetOptions.specificCollections");
    if (val === "Specific products") return t("storeVerification.targetOptions.specificProducts");
    if (val === "Custom page") return t("storeVerification.targetOptions.customPage");
    if (val === "Specific product tags") return t("storeVerification.targetOptions.specificProductTags");
    return val;
  };

  const getTriggerTranslation = (val) => {
    if (val === "Always show") return t("storeVerification.triggerOptions.alwaysShow");
    if (val === "Logged customers") return t("storeVerification.triggerOptions.loggedCustomers");
    return val;
  };

  return (
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
                    onSelectedIdsChange((prev) =>
                      Array.from(new Set([...prev, ...toAdd])),
                    );
                  } else {
                    const toRemove = paginatedPopups.map((p) => p.id);
                    onSelectedIdsChange((prev) =>
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
              {selectedIds.length} {t("common.selected")}
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
                  onClick={() => onSelectedIdsChange([])}
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
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={onOpenDeleteModal}
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
                  {t("common.delete")}
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
                    onSelectedIdsChange((prev) =>
                      Array.from(new Set([...prev, ...toAdd])),
                    );
                  } else {
                    const toRemove = paginatedPopups.map((p) => p.id);
                    onSelectedIdsChange((prev) =>
                      prev.filter((id) => !toRemove.includes(id)),
                    );
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            </th>
            <th style={{ padding: "12px 16px", fontSize: "13px" }}>
              {t("storeVerification.tableHeaders.popupName")}
            </th>
            <th style={{ padding: "12px 16px", fontSize: "13px" }}>
              {t("storeVerification.tableHeaders.target")}
            </th>
            <th style={{ padding: "12px 16px", fontSize: "13px" }}>
              {t("storeVerification.tableHeaders.triggerCondition")}
            </th>
            <th style={{ padding: "12px 16px", fontSize: "13px" }}>
              {t("storeVerification.tableHeaders.lastUpdated")}
            </th>
            <th style={{ padding: "12px 16px", fontSize: "13px" }}>
              {t("storeVerification.tableHeaders.status")}
            </th>
            <th
              style={{
                padding: "12px 16px",
                fontSize: "13px",
                textAlign: "right",
              }}
            >
              {t("storeVerification.tableHeaders.action")}
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
                    onSelectedIdsChange((prev) => [...prev, popup.id]);
                  } else {
                    onSelectedIdsChange((prev) =>
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
              {getTargetTranslation(popup.target)}
            </td>
            <td style={{ padding: "12px 16px", color: "#4A4D4F" }}>
              {getTriggerTranslation(popup.trigger)}
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
                {popup.status === "Enabled" ? t("common.enabled") : t("common.disabled")}
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
                  onClick={() => onEdit(popup.id)}
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
                  title={t("common.edit")}
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
                  onClick={() => onDelete(popup.id)}
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
                  title={t("common.delete")}
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
        {paginatedPopups.length === 0 && (
          <tr>
            <td
              colSpan="7"
              style={{
                padding: "32px",
                textAlign: "center",
                color: "#6D7175",
              }}
            >
              {t("storeVerification.noPopupsMatch")}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
