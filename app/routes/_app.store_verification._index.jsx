import { useLoaderData, useFetcher, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Discover the actual Metaobject type handles
  const popupsDefResponse = await admin.graphql(
    `#graphql
    query getPopupsDef {
      metaobjectDefinitionByType(type: "$app:popups") {
        type
      }
    }`,
  );
  const popupsDefData = await popupsDefResponse.json();
  const popupsTypeHandle =
    popupsDefData.data.metaobjectDefinitionByType?.type || "app--popups";

  // Fetch popups from Metaobjects
  const response = await admin.graphql(
    `#graphql
    query getPopups($type: String!) {
      metaobjects(type: $type, first: 50) {
        nodes {
          id
          handle
          popup_id: field(key: "popup_id") { value }
          config: field(key: "config") { value }
        }
      }
    }`,
    { variables: { type: popupsTypeHandle } },
  );
  const data = await response.json();

  // Get the active popup reference from Shop Metafield
  const activeResponse = await admin.graphql(
    `#graphql
    query getActiveSetting {
      shop {
        metafield(namespace: "avd", key: "active_popup") {
          value
        }
      }
    }`,
  );
  const activeData = await activeResponse.json();
  const activeGid = activeData.data.shop.metafield?.value;

  const popups = (data.data?.metaobjects?.nodes || []).map((node) => {
    const config = JSON.parse(node.config?.value || "{}");
    return {
      id: node.popup_id?.value || node.handle,
      gid: node.id,
      handle: node.handle,
      name: config.name || "Untitled Popup",
      status: node.id === activeGid ? "Enabled" : "Disabled",
      method: config.method || "No input",
    };
  });

  return { popups };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("action");
  const popupId = formData.get("id");

  // Discover the actual Metaobject type handles
  const popupsDefResponse = await admin.graphql(
    `#graphql
    query getPopupsDef {
      metaobjectDefinitionByType(type: "$app:popups") {
        type
      }
    }`,
  );
  const popupsDefData = await popupsDefResponse.json();
  const popupsTypeHandle =
    popupsDefData.data.metaobjectDefinitionByType?.type || "app--popups";

  if (actionType === "delete") {
    const searchResponse = await admin.graphql(
      `#graphql
      query findPopup($query: String!, $type: String!) {
        metaobjects(type: $type, first: 1, query: $query) {
          nodes {
            id
          }
        }
      }`,
      {
        variables: {
          query: `handle:${popupId}`,
          type: popupsTypeHandle,
        },
      },
    );
    const searchData = await searchResponse.json();
    const gid = searchData.data.metaobjects.nodes[0]?.id;

    if (gid) {
      // 1. Check if it's the active popup in Shop Metafield
      const activeResponse = await admin.graphql(
        `#graphql
        query getActiveSetting {
          shop {
            id
            metafield(namespace: "avd", key: "active_popup") {
              value
            }
          }
        }`,
      );
      const activeData = await activeResponse.json();
      const shopId = activeData.data.shop.id;
      const activeGid = activeData.data.shop.metafield?.value;

      // 2. Delete the Metaobject
      await admin.graphql(
        `#graphql
        mutation deletePopup($id: ID!) {
          metaobjectDelete(id: $id) {
            deletedId
          }
        }`,
        { variables: { id: gid } },
      );

      // 3. If it was active, clear the reference in Shop Metafield
      if (activeGid === gid) {
        await admin.graphql(
          `#graphql
          mutation clearActive($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
              metafields { id }
              userErrors { field message }
            }
          }`,
          {
            variables: {
              metafields: [
                {
                  namespace: "avd",
                  key: "active_popup",
                  type: "metaobject_reference",
                  ownerId: shopId,
                  value: "",
                },
              ],
            },
          },
        );
      }
    }
    return { success: true };
  }
  return null;
};

export default function AppPage() {
  const { popups } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const handleCreatePopUp = () => {
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
      {/* Free Plan Limit Banner */}
      <div
        style={{
          background: "#BDE6FF",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "24px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          border: "1px solid #A2D9FF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px", color: "#005F99" }}>ⓘ</span>
          <span
            style={{ fontWeight: "700", color: "#1A1C1D", fontSize: "13px" }}
          >
            Free Plan Limit
          </span>
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#4A4D4F",
            lineHeight: "1.5",
            maxWidth: "800px",
          }}
        >
          Your current plan includes 1 pop-up ({popups.length}/1 used). Upgrade
          to unlock more pop-ups, advanced customization and more.
        </div>
      </div>

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
                background: "#202223",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Create pop-up
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
