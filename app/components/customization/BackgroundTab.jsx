import { Card } from "../Card";
import { Badge } from "../Badge";
import { ColorInput } from "../ColorInput";
import { NumberInput } from "../NumberInput";
import { useState, useRef } from "react";
import { useFetcher } from "react-router";

export function BackgroundTab({ config, setConfig, setIsUploading }) {
  const fetcher = useFetcher();
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [localUploading, setLocalUploading] = useState(null); // 'background' or 'logo'

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setLocalUploading(type);
    setIsUploading(true);

    try {
      // 1. Get staged upload URL
      const formData = new FormData();
      formData.append("intent", "get_staged_url");
      formData.append("filename", file.name);
      formData.append("mimeType", file.type);
      formData.append("filesize", file.size.toString());

      const stagedRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const stagedData = await stagedRes.json();

      if (stagedData.userErrors?.length) {
        throw new Error(stagedData.userErrors[0].message);
      }

      const target = stagedData.stagedTargets[0];

      // 2. Upload file to Shopify
      const uploadParams = new FormData();
      target.parameters.forEach(({ name, value }) => {
        uploadParams.append(name, value);
      });
      uploadParams.append("file", file);

      const uploadRes = await fetch(target.url, {
        method: "POST",
        body: uploadParams,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      // 3. Create File resource in Shopify
      const createFormData = new FormData();
      createFormData.append("intent", "create_file");
      createFormData.append("stagedUploadPath", target.resourceUrl);
      createFormData.append("filename", file.name);

      const createRes = await fetch("/api/upload", {
        method: "POST",
        body: createFormData,
      });
      const createData = await createRes.json();

      if (!createData.success) {
        throw new Error(createData.errors[0].message);
      }

      const imageUrl = createData.file.image?.url;

      if (type === "background") {
        setConfig((prev) => ({
          ...prev,
          background: { ...prev.background, backgroundImage: imageUrl },
        }));
      } else {
        setConfig((prev) => ({
          ...prev,
          background: { ...prev.background, logo: imageUrl },
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setLocalUploading(null);
      setIsUploading(false);
    }
  };

  const removeImage = (type) => {
    if (type === "background") {
      setConfig((prev) => ({
        ...prev,
        background: { ...prev.background, backgroundImage: null },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        background: { ...prev.background, logo: null },
      }));
    }
  };

  return (
    <>
      <Card title="Pop-up background">
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "12px",
            }}
          >
            Type
          </label>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
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
                name="bgType"
                checked={config.background.type === "Solid color background"}
                onChange={() =>
                  setConfig({
                    ...config,
                    background: {
                      ...config.background,
                      type: "Solid color background",
                    },
                  })
                }
              />{" "}
              Solid color background
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
                name="bgType"
                checked={config.background.type === "Image background"}
                onChange={() =>
                  setConfig({
                    ...config,
                    background: {
                      ...config.background,
                      type: "Image background",
                    },
                  })
                }
              />{" "}
              Image background
            </label>
          </div>
        </div>

        {config.background.type === "Image background" && (
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Page background image
            </label>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/png, image/jpeg"
              onChange={(e) => handleImageUpload(e, "background")}
            />

            {config.background.backgroundImage ? (
              <div
                style={{
                  border: "1px solid #CBCFD2",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#F9FAFB",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <img
                    src={config.background.backgroundImage}
                    alt="Background"
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                  <span style={{ fontSize: "13px" }}>Background image</span>
                </div>
                <button
                  onClick={() => removeImage("background")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#D72C0D",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                style={{
                  border: "1px dashed #CBCFD2",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  background: "#F9FAFB",
                }}
              >
                <button
                  disabled={localUploading === "background"}
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #CBCFD2",
                    background: "#FFF",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginBottom: "8px",
                  }}
                >
                  {localUploading === "background"
                    ? "Uploading..."
                    : "Add image"}
                </button>
                <p style={{ fontSize: "12px", color: "#6D7175", margin: 0 }}>
                  Accepts .png, .jpg
                </p>
              </div>
            )}
          </div>
        )}
        <ColorInput
          label="Page background color"
          required
          value={config.background.pageColor}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, pageColor: val },
            })
          }
        />
        <ColorInput
          label="Background color"
          badge={<Badge text="Basic plan or higher" type="basic" />}
          value={config.background.bgColor}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, bgColor: val },
            })
          }
        />
        <div style={{ marginBottom: "8px" }}>
          {/* <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <label style={{ fontSize: "13px", fontWeight: "600" }}>
              Logo (Optional)
            </label>
            <Badge text="Basic plan or higher" type="basic" />
          </div> */}

          {/* <input
            type="file"
            ref={logoInputRef}
            style={{ display: "none" }}
            accept="image/png, image/jpeg"
            onChange={(e) => handleImageUpload(e, "logo")}
          /> */}

          {config.background.logo ? (
            <div
              style={{
                border: "1px solid #CBCFD2",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F9FAFB",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <img
                  src={config.background.logo}
                  alt="Logo"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "contain",
                    borderRadius: "4px",
                    background: "#FFF",
                    padding: "2px",
                    border: "1px solid #EEE",
                  }}
                />
                <span style={{ fontSize: "13px" }}>Logo image</span>
              </div>
              <button
                onClick={() => removeImage("logo")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#D72C0D",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div
              style={{
                border: "1px dashed #CBCFD2",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                background: "#F9FAFB",
              }}
            >
              <button
                disabled={localUploading === "logo"}
                onClick={() => logoInputRef.current.click()}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #CBCFD2",
                  background: "#FFF",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginBottom: "8px",
                }}
              >
                {localUploading === "logo" ? "Uploading..." : "Add image"}
              </button>
              <p style={{ fontSize: "12px", color: "#6D7175", margin: 0 }}>
                Accepts .png, .jpg
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card
        title="Border setting"
        badge={<Badge text="Premium plan" type="premium" />}
      >
        <ColorInput
          label="Border color"
          value={config.background.borderColor}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, borderColor: val },
            })
          }
        />
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <NumberInput
              label="Border radius"
              value={config.background.borderRadius}
              onChange={(val) =>
                setConfig({
                  ...config,
                  background: { ...config.background, borderRadius: val },
                })
              }
            />
          </div>
          <div style={{ flex: 1 }}>
            <NumberInput
              label="Border width"
              value={config.background.borderWidth}
              onChange={(val) =>
                setConfig({
                  ...config,
                  background: { ...config.background, borderWidth: val },
                })
              }
            />
          </div>
        </div>
      </Card>
    </>
  );
}
