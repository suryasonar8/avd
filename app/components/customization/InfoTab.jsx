import { Card } from "../Card";
import { Badge } from "../Badge";

export function InfoTab({ config, setConfig }) {
  return (
    <>
      <Card title="Pop-up Info">
        <div style={{ marginBottom: "16px" }}>
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

        <div style={{ marginBottom: "16px" }}>
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
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
              }}
            >
              <input type="radio" name="pages" checked readOnly /> All pages
            </label>
            {[
              "Home page",
              "Specific collections",
              "Specific products",
              "Specific product tags",
              "Custom",
            ].map((page) => (
              <label
                key={page}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#6D7175",
                }}
              >
                <input type="radio" name="pages" disabled /> {page}
              </label>
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
              }}
            >
              <input type="radio" name="trigger" checked readOnly /> Always show
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#6D7175",
              }}
            >
              <input type="radio" name="trigger" disabled /> Logged customers
            </label>
          </div>
        </div>
      </Card>
    </>
  );
}
