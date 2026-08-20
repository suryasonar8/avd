// App data stored under these definitions is implementation detail consumed by
// our own admin UI, theme extension (storefront read), and checkout extension —
// merchants must not be able to hand-edit it via Admin's Custom Data UI.
// Note: as of API 2025-10, restricting admin access at all requires the
// namespace to be app-reserved (the "$app:" prefix, see namespace args passed
// in by callers) — MetafieldAccessInput.admin also no longer accepts PRIVATE,
// only MERCHANT_READ (view-only) or MERCHANT_READ_WRITE.
const ADMIN_ACCESS = "MERCHANT_READ";

export async function ensureMetafieldDefinition(
  admin,
  { namespace, key, name, description, type }
) {
  const defCheck = await admin.graphql(
    `#graphql
    query {
      metafieldDefinitions(
        first: 1,
        ownerType: SHOP,
        namespace: "${namespace}",
        key: "${key}"
      ) {
        edges {
          node {
            id
            type { name }
          }
        }
      }
    }`
  );

  const defData = await defCheck.json();
  const existingDef = defData?.data?.metafieldDefinitions?.edges?.[0]?.node;

  if (existingDef && existingDef.type?.name !== type) {
    // Definition exists with a stale type (e.g. left over from a prior data
    // model) — delete it and any data stored under it, then fall through to
    // recreate it with the correct type below.
    console.warn(
      `Metafield definition ${namespace}:${key} has type "${existingDef.type?.name}", expected "${type}". ` +
      "Deleting and recreating it."
    );

    const defDelete = await admin.graphql(
      `#graphql
      mutation ($id: ID!) {
        metafieldDefinitionDelete(id: $id, deleteAllAssociatedMetafields: true) {
          deletedDefinitionId
          userErrors { field message }
        }
      }`,
      { variables: { id: existingDef.id } }
    );
    const defDeleteData = await defDelete.json();
    if (defDeleteData?.data?.metafieldDefinitionDelete?.userErrors?.length) {
      console.error(
        "Metafield definition deletion failed:",
        JSON.stringify(
          defDeleteData.data.metafieldDefinitionDelete.userErrors,
          null,
          2
        )
      );
      return;
    }
  } else if (existingDef) {
    return;
  }

  // Create the definition (either it never existed, or was just deleted above)
  const defCreate = await admin.graphql(
    `#graphql
    mutation {
      metafieldDefinitionCreate(definition: {
        name: "${name}"
        namespace: "${namespace}"
        key: "${key}"
        type: "${type}"
        description: "${description}"
        ownerType: SHOP
        access: {
          admin: ${ADMIN_ACCESS}
          storefront: PUBLIC_READ
        }
      }) {
        createdDefinition { id }
        userErrors { field message }
      }
    }`
  );
  const defCreateData = await defCreate.json();
  if (defCreateData?.data?.metafieldDefinitionCreate?.userErrors?.length) {
    console.error(
      "Metafield definition creation failed:",
      JSON.stringify(
        defCreateData.data.metafieldDefinitionCreate.userErrors,
        null,
        2
      )
    );
  }
}
