/**
 * FileService — handles staged uploads and file operations in Shopify.
 */
export const FileService = {
  /**
   * Create staged uploads.
   */
  async createStagedUploads(admin, input) {
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
        variables: { input },
      }
    );
    const responseData = await response.json();
    return responseData.data.stagedUploadsCreate;
  },

  /**
   * Create a file in Shopify from a staged upload path.
   */
  async createFile(admin, filesInput) {
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
        variables: { files: filesInput },
      }
    );
    return response.json();
  },

  /**
   * Poll for file readiness status.
   */
  async pollFileStatus(admin, id, maxAttempts = 10, delayMs = 1000) {
    let file = null;
    let attempts = 0;
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
        { variables: { id } }
      );

      const pollData = await pollResponse.json();
      file = pollData.data.node;

      if (file && file.fileStatus === "READY") {
        return { success: true, file };
      }

      if (file && file.fileStatus === "FAILED") {
        return { success: false, errors: [{ message: "File processing failed on Shopify" }] };
      }

      await delay(delayMs);
      attempts++;
    }

    return { success: false, errors: [{ message: "File processing timed out" }] };
  },

  /**
   * Delete files from Shopify.
   */
  async deleteFile(admin, fileIds) {
    const response = await admin.graphql(
      `#graphql
      mutation fileDelete($fileIds: [ID!]!) {
        fileDelete(fileIds: $fileIds) {
          deletedFileIds
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: { fileIds },
      }
    );
    return response.json();
  }
};
