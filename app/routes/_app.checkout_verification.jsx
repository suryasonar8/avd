import { useEffect, useRef } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  let settings = { minAge: 18, redirectUrl: "https://www.google.com" };

  try {
    if (prisma.appSettings) {
      const dbSettings = await prisma.appSettings.findUnique({
        where: { shop },
      });
      if (dbSettings) {
        settings = dbSettings;
      } else {
        // Only try to create if model exists
        try {
          const newSettings = await prisma.appSettings.create({
            data: { shop },
          });
          settings = newSettings;
        } catch (e) {
          console.error("Failed to create settings:", e);
        }
      }
    }
  } catch (error) {
    console.error("Prisma error in loader:", error);
  }

  return { settings };
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const shop = session.shop;

  const minAge = parseInt(formData.get("minAge"), 10) || 18;
  const redirectUrl = formData.get("redirectUrl") || "https://www.google.com";

  // Update DB
  let settings = { minAge, redirectUrl };
  try {
    if (prisma.appSettings) {
      settings = await prisma.appSettings.upsert({
        where: { shop },
        update: { minAge, redirectUrl },
        create: { shop, minAge, redirectUrl },
      });
    }
  } catch (error) {
    console.error("Prisma error in action:", error);
  }

  // Get Shop ID for metafield owner
  const shopIdResponse = await admin.graphql("{ shop { id } }");
  const shopIdJson = await shopIdResponse.json();
  const shopId = shopIdJson.data.shop.id;

  // Sync to Metafields for Liquid access
  await admin.graphql(
    `#graphql
    mutation CreateMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafieldsSetInput) {
        metafields {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafieldsSetInput: [
          {
            namespace: "avd_app",
            key: "settings",
            type: "json",
            value: JSON.stringify({ minAge, redirectUrl }),
            ownerId: shopId,
          },
        ],
      },
    },
  );

  return { settings };
};

export default function CheckoutVerification() {
  const { settings } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isLoading = fetcher.state !== "idle";
  const formRef = useRef(null);

  const handleSave = () => {
    if (formRef.current) {
      fetcher.submit(formRef.current, { method: "POST" });
    }
  };

  const wasLoading = useRef(false);
  useEffect(() => {
    if (isLoading) {
      wasLoading.current = true;
    } else if (wasLoading.current && fetcher.data?.settings) {
      shopify.toast.show("Settings saved successfully");
      wasLoading.current = false;
    }
  }, [isLoading, fetcher.data, shopify]);

  return (
    <s-page heading="AVD - Checkout Verification Settings">
      <s-section heading="Age Verification Configuration">
        <s-paragraph>
          Configure the minimum age and the redirect URL for users who do not
          meet the age requirement.
        </s-paragraph>

        <fetcher.Form method="post" ref={formRef}>
          <s-stack gap="base">
            <s-text-field
              label="Minimum Age"
              name="minAge"
              type="number"
              defaultValue={settings?.minAge || 18}
            />
            <s-text-field
              label="Redirect URL"
              name="redirectUrl"
              type="url"
              defaultValue={settings?.redirectUrl || "https://www.google.com"}
            />
            <s-button
              variant="primary"
              onClick={handleSave}
              {...(isLoading ? { loading: true } : {})}
            >
              Save Settings
            </s-button>
          </s-stack>
        </fetcher.Form>
      </s-section>

      <s-section heading="Preview Message">
        <s-paragraph>
          The message shown to users will be:
          <strong>
            {" "}
            "Please verify that you are{" "}
            {fetcher.formData?.get("minAge") || settings?.minAge || 18} years of
            age or older to enter this site."
          </strong>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
