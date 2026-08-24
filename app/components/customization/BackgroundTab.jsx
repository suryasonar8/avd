import { Badge } from "../Badge";
import { ColorInput } from "../ColorInput";
import { NumberInput } from "../NumberInput";
import { useState } from "react";
import { useFetcher } from "react-router";
import { usePlan } from "../../context/PlanContext";
import { useTranslation } from "../../context/TranslationContext";

export function BackgroundTab({ config, setConfig, setIsUploading }) {
  const fetcher = useFetcher();
  const { canAccess } = usePlan();
  const { t } = useTranslation();
  const [localUploading, setLocalUploading] = useState(null); // 'background' or 'logo'
  // Tracks images whose stored URL failed to load (e.g. the Shopify file was
  // deleted after an uninstall/reinstall). We prompt the merchant to re-upload.
  const [brokenImages, setBrokenImages] = useState({
    background: false,
    logo: false,
  });

  const handleImageUpload = async (file, type) => {
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
      const imageId = createData.file.id;

      // A fresh upload replaces any previously-corrupted image.
      setBrokenImages((prev) => ({ ...prev, [type]: false }));

      if (type === "background") {
        setConfig((prev) => ({
          ...prev,
          background: {
            ...prev.background,
            backgroundImage: imageUrl,
            backgroundImageId: imageId,
          },
        }));
      } else {
        setConfig((prev) => ({
          ...prev,
          background: {
            ...prev.background,
            logo: imageUrl,
            logoId: imageId,
          },
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        t("common.uploadFailedTryAgain") ||
          "Failed to upload image. Please try again.",
      );
    } finally {
      setLocalUploading(null);
      setIsUploading(false);
    }
  };

  const removeImage = async (type) => {
    const fileId =
      type === "background"
        ? config.background.backgroundImageId
        : config.background.logoId;

    setBrokenImages((prev) => ({ ...prev, [type]: false }));

    if (type === "background") {
      setConfig((prev) => ({
        ...prev,
        background: {
          ...prev.background,
          backgroundImage: null,
          backgroundImageId: null,
        },
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        background: {
          ...prev.background,
          logo: null,
          logoId: null,
        },
      }));
    }

    if (fileId) {
      try {
        const formData = new FormData();
        formData.append("intent", "delete_file");
        formData.append("fileId", fileId);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!data.success) {
          console.error("Failed to delete file from Shopify:", data.errors);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

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
          <strong>{t("popupEditor.backgroundTab.popupBackground")}</strong>
        </s-text>
        <s-divider></s-divider>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              marginBottom: "2px",
            }}
          >
            {t("popupEditor.backgroundTab.type")}
          </label>
          <s-choice-list
            name="bgType"
            values={[
              config.background.bgType === "Solid color background"
                ? "Solid color background"
                : "Image background",
            ]}
            onChange={(e) => {
              const val = e.currentTarget.values
                ? e.currentTarget.values[0]
                : e.target.value || e.currentTarget.value;
              setConfig({
                ...config,
                background: {
                  ...config.background,
                  bgType: val,
                },
              });
            }}
          >
            <s-choice
              value="Solid color background"
              selected={config.background.bgType === "Solid color background"}
            >
              {t("popupEditor.backgroundTab.solidColorBackground")}
            </s-choice>
            <s-choice
              value="Image background"
              selected={config.background.bgType !== "Solid color background"}
            >
              {t("popupEditor.backgroundTab.imageBackground")}
            </s-choice>
          </s-choice-list>
        </div>

        {config.background.bgType !== "Solid color background" && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              {t("popupEditor.backgroundTab.pageBackgroundImage")}
            </label>

            {config.background.backgroundImage &&
            brokenImages.background ? (
              <CorruptedImageNotice
                type="background"
                localUploading={localUploading}
                onReupload={handleImageUpload}
                onRemove={removeImage}
                t={t}
              />
            ) : config.background.backgroundImage ? (
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
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, background: true }))
                    }
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                  <span style={{ fontSize: "13px" }}>
                    {t("popupEditor.backgroundTab.backgroundImage")}
                  </span>
                </div>
                <s-button
                  variant="plain"
                  onClick={() => removeImage("background")}
                >
                  {t("common.remove")}
                </s-button>
              </div>
            ) : (
              <s-drop-zone
                accept=".png, .jpg, .jpeg"
                onChange={(e) => {
                  const file =
                    e.currentTarget.files?.[0] || e.detail?.files?.[0];
                  handleImageUpload(file, "background");
                }}
                disabled={localUploading === "background"}
              />
            )}
          </div>
        )}
        {config.background.bgType === "Solid color background" && (
          <ColorInput
            label={t("popupEditor.backgroundTab.pageBackgroundColor")}
            required
            value={config.background.pageColor}
            onChange={(val) =>
              setConfig({
                ...config,
                background: { ...config.background, pageColor: val },
              })
            }
          />
        )}
        <ColorInput
          label={t("popupEditor.backgroundTab.backgroundColor")}
          disabled={!canAccess("sv.bg.color")}
          badge={
            !canAccess("sv.bg.color") ? (
              <Badge text={t("common.basicPlanOrHigher")} type="basic" />
            ) : null
          }
          value={config.background.bgColor}
          onChange={(val) =>
            setConfig({
              ...config,
              background: { ...config.background, bgColor: val },
            })
          }
        />
        <div disabled={!canAccess("sv.bg.logo")}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <label
              style={{
                fontSize: "13px",
                opacity: canAccess("sv.bg.logo") ? 1 : 0.5,
              }}
            >
              {t("popupEditor.backgroundTab.logoOptional")}
            </label>
            {!canAccess("sv.bg.logo") && (
              <Badge text={t("common.basicPlanOrHigher")} type="basic" />
            )}
          </div>

          {config.background.logo && brokenImages.logo ? (
            <CorruptedImageNotice
              type="logo"
              localUploading={localUploading}
              onReupload={handleImageUpload}
              onRemove={removeImage}
              disabled={!canAccess("sv.bg.logo")}
              t={t}
            />
          ) : config.background.logo ? (
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
                  onError={() =>
                    setBrokenImages((prev) => ({ ...prev, logo: true }))
                  }
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
                <span style={{ fontSize: "13px" }}>
                  {t("popupEditor.backgroundTab.logoImage")}
                </span>
              </div>
              <s-button
                variant="plain"
                onClick={() => removeImage("logo")}
                disabled={!canAccess("sv.bg.logo")}
              >
                {t("common.remove")}
              </s-button>
            </div>
          ) : (
            <s-drop-zone
              accept=".png, .jpg, .jpeg"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0] || e.detail?.files?.[0];
                handleImageUpload(file, "logo");
              }}
              disabled={!canAccess("sv.bg.logo") || localUploading === "logo"}
            />
          )}
        </div>
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
            <strong>{t("popupEditor.backgroundTab.borderSetting")}</strong>
          </s-text>
          {!canAccess("sv.bg.border-color") ? (
            <Badge text={t("common.premiumPlan")} type="premium" />
          ) : null}
        </div>
        <s-divider></s-divider>
        <ColorInput
          label={t("popupEditor.backgroundTab.borderColor")}
          disabled={!canAccess("sv.bg.border-color")}
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
              label={t("popupEditor.backgroundTab.borderRadius")}
              disabled={!canAccess("sv.bg.border-radius")}
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
              label={t("popupEditor.backgroundTab.borderWidth")}
              disabled={!canAccess("sv.bg.border-width")}
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
      </div>
    </>
  );
}

/**
 * Shown when a stored image URL fails to load (e.g. the underlying Shopify
 * file was deleted after an uninstall/reinstall). Prompts the merchant to
 * re-upload instead of showing a broken thumbnail.
 */
function CorruptedImageNotice({
  type,
  localUploading,
  onReupload,
  onRemove,
  disabled = false,
  t,
}) {
  return (
    <div
      style={{
        border: "1px solid #FFC7C7",
        borderRadius: "8px",
        padding: "12px",
        background: "#FFF4F4",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "16px" }}>⚠️</span>
        <span style={{ fontSize: "13px", color: "#8E0B21" }}>
          {t("popupEditor.backgroundTab.imageCorrupted") ||
            "This image is no longer available and can't be displayed. Please re-upload it."}
        </span>
        <s-button
          variant="plain"
          onClick={() => onRemove(type)}
          disabled={disabled}
        >
          {t("common.remove")}
        </s-button>
      </div>
      <s-drop-zone
        accept=".png, .jpg, .jpeg"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0] || e.detail?.files?.[0];
          onReupload(file, type);
        }}
        disabled={disabled || localUploading === type}
      />
    </div>
  );
}
