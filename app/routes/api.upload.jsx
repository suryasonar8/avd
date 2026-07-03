import { authenticate } from "../shopify.server";
import { FileService } from "../services/file.service";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "get_staged_url") {
    const filename = formData.get("filename");
    const mimeType = formData.get("mimeType");
    const filesize = formData.get("filesize");

    const stagedUploads = await FileService.createStagedUploads(admin, [
      {
        filename,
        mimeType,
        resource: "IMAGE",
        fileSize: filesize,
        httpMethod: "POST",
      },
    ]);
    return stagedUploads;
  }

  if (intent === "create_file") {
    const stagedUploadPath = formData.get("stagedUploadPath");
    const filename = formData.get("filename");

    const responseData = await FileService.createFile(admin, [
      {
        originalSource: stagedUploadPath,
        contentType: "IMAGE",
        alt: filename,
      },
    ]);

    const userErrors = responseData.data?.fileCreate?.userErrors;

    if (userErrors && userErrors.length > 0) {
      return { success: false, errors: userErrors };
    }

    const fileId = responseData.data?.fileCreate?.files?.[0]?.id;

    if (!fileId) {
      return { success: false, errors: [{ message: "Failed to create file" }] };
    }

    // Polling for file readiness
    const pollResult = await FileService.pollFileStatus(admin, fileId);
    return pollResult;
  }

  if (intent === "delete_file") {
    const fileId = formData.get("fileId");
    if (!fileId) {
      return { success: false, errors: [{ message: "Missing fileId" }] };
    }

    const responseData = await FileService.deleteFile(admin, [fileId]);
    const userErrors = responseData.data?.fileDelete?.userErrors;

    if (userErrors && userErrors.length > 0) {
      return { success: false, errors: userErrors };
    }

    return {
      success: true,
      deletedFileIds: responseData.data?.fileDelete?.deletedFileIds,
    };
  }

  return new Response(JSON.stringify({ error: "Invalid intent" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};
