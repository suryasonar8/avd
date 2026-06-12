import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Dashboard() {
  return (
    <s-page heading="AVD - Age Verification">
      <s-section heading="Welcome to your Dashboard 🚀">
        <s-paragraph>
          This is your app's landing page inside Shopify Admin, accessible at
          the root path (<code>/</code>).
        </s-paragraph>
        <s-paragraph>
          You can use this space to show a summary of your app's status,
          analytics, or quick actions for the merchant.
        </s-paragraph>
      </s-section>

      <s-section heading="Quick Links">
        <s-stack direction="inline" gap="base">
          <s-link href="/app">Go to App</s-link>
          <s-link href="/additional">View Additional Info</s-link>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="App Info">
        <s-paragraph>
          <s-text variant="subdued">App: AVD - Age Verification</s-text>
        </s-paragraph>
        <s-paragraph>
          <s-text variant="subdued">Status: Active</s-text>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
