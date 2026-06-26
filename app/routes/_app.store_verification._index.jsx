import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { usePlan } from "../context/PlanContext";
import { PopupService } from "../services/popup.service";

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
  return null;
};

export default function AppPage() {
  const { popups } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { canAccess, plan } = usePlan();

  const popupLimit = plan === "free" ? 1 : 50;
  const canCreate = popups.length < popupLimit;

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
    fetcher.submit({ action: "delete", id }, { method: "POST" });
  };

  return (
    <s-page heading="Store verification">
      {plan === "free" && (
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
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F6F6F7", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontSize: "13px" }}>Name</th>
                <th style={{ padding: "12px 16px", fontSize: "13px" }}>
                  Status
                </th>
                <th style={{ padding: "12px 16px", fontSize: "13px" }}>
                  Methods
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontSize: "13px",
                    textAlign: "right",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {popups.map((popup) => (
                <tr
                  key={popup.id}
                  style={{ borderTop: "1px solid #E1E3E5", fontSize: "13px" }}
                >
                  <td style={{ padding: "12px 16px" }}>{popup.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background:
                          popup.status === "Enabled" ? "#E3FBE3" : "#F1F2F3",
                        color:
                          popup.status === "Enabled" ? "#007F5F" : "#4A4D4F",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {popup.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{popup.method}</td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(popup.id)}
                      style={{
                        background: "none",
                        border: "1px solid #CBCFD2",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(popup.id)}
                      style={{
                        background: "none",
                        border: "1px solid #FF4D4D",
                        color: "#FF4D4D",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </s-page>
  );
}
