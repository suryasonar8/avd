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

  if (!existingDef) {
    // Create the definition
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
            admin: MERCHANT_READ_WRITE
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
  } else if (existingDef.type?.name !== type) {
    // Definition exists but wrong type — need to delete and recreate
    console.warn(
      `Metafield definition ${namespace}:${key} has type "${existingDef.type?.name}", expected "${type}". ` +
      "You may need to manually delete the old definition in Shopify admin."
    );
  }
}
