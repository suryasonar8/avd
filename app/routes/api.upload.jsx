import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "get_staged_url") {
    const filename = formData.get("filename");
    const mimeType = formData.get("mimeType");
    const filesize = formData.get("filesize");

    const response = await admin.graphql(
      `#graphql
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: [
            {
              filename,
              mimeType,
              resource: "IMAGE",
              fileSize: filesize,
              httpMethod: "POST",
            },
          ],
        },
      },
    );

    const responseData = await response.json();
    return responseData.data.stagedUploadsCreate;
  }

  if (intent === "create_file") {
    const stagedUploadPath = formData.get("stagedUploadPath");
    const filename = formData.get("filename");

    const response = await admin.graphql(
      `#graphql
      mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            fileStatus
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          files: [
            {
              originalSource: stagedUploadPath,
              contentType: "IMAGE",
              alt: filename,
            },
          ],
        },
      },
    );

    const responseData = await response.json();
    const userErrors = responseData.data.fileCreate.userErrors;
    if (userErrors && userErrors.length > 0) {
      return { success: false, errors: userErrors };
    }

    const fileId = responseData.data.fileCreate.files?.[0]?.id;

    if (!fileId) {
      return { success: false, errors: [{ message: "Failed to create file" }] };
    }

    // Polling for file readiness
    let file = null;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (attempts < maxAttempts) {
      const pollResponse = await admin.graphql(
        `#graphql
        query getFile($id: ID!) {
          node(id: $id) {
            ... on MediaImage {
              id
              fileStatus
              image {
                url
              }
            }
          }
        }`,
        { variables: { id: fileId } },
      );

      const pollData = await pollResponse.json();
      file = pollData.data.node;

      if (file && file.fileStatus === "READY") {
        break;
      }

      if (file && file.fileStatus === "FAILED") {
        return {
          success: false,
          errors: [{ message: "File processing failed on Shopify" }],
        };
      }

      await delay(1000);
      attempts++;
    }

    if (!file || file.fileStatus !== "READY") {
      return {
        success: false,
        errors: [{ message: "File processing timed out" }],
      };
    }

    return {
      success: true,
      file,
    };
  }

  return new Response(JSON.stringify({ error: "Invalid intent" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};
